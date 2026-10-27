import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import { test } from 'node:test';

// Execute the actual native bundle with Node's standards-equivalent URL primitives and synthetic responses.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const { signQuery } = require(path.join(root, 'upstream/folia-major/node_modules/bodian-music-api/src/http.cjs'));
let source = fs.readFileSync(path.join(root, 'entry/src/main/ets/services/bodian/BodianRuntime.js'), 'utf8');
source = source.replace(/import (\w+) from ["']@ohos\.url["'];/, 'const $1 = { URL: globalThis.URL, URLParams: globalThis.URLSearchParams };');
assert.ok(!source.includes('from "@ohos.url"'), 'Native URL shim must be an ESM import');
assert.ok(!/\b(?:require|__require)\(["'](?:node:|@ohos)/.test(source), 'Native bundle must not dynamically require system modules');
const { createBodianRuntime } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
const deviceId = 'a'.repeat(32);
const user = { uid: '123', token: 'synthetic-test-token', user: { id: '123', nickname: 'Test', avatarUrl: '' } };
function runtime(respond, session = null) {
  let stored = session ? JSON.stringify(session) : '';
  const calls = [];
  const api = createBodianRuntime(deviceId, () => stored, value => { stored = value; }, async payload => {
    const input = JSON.parse(payload);
    calls.push(input);
    return JSON.stringify({ status: 200, body: JSON.stringify(await respond(input)) });
  });
  return { request: async (operation, params = {}) => JSON.parse(await api.request(operation, JSON.stringify(params))), calls, stored: () => stored };
}
function checkSignature(input) {
  const url = new URL(input.url), params = Object.fromEntries(url.searchParams);
  const sign = params.sign;
  delete params.sign;
  assert.equal(sign, signQuery(url.pathname, params, input.body));
  assert.equal(input.headers.devid, deviceId);
}
test('search preserves sparse-page physical cursors', async () => {
  const api = runtime(() => ({ code: 200, data: { resultList: [{ id: 1 }], total: 500 } }));
  const result = await api.request('search', { query: '中文 & search', limit: 100, offset: 100 });
  assert.equal(result.data.bodianPagination.nextOffset, 200);
  assert.equal(new URL(api.calls[0].url).searchParams.get('keyword'), '中文 & search');
});
test('audio preserves both signed GET bodies and eligible-session headers', async () => {
  const api = runtime(input => ({ code: 200, data: input.url.includes('checkRight') ? { status: 1 } : { audioHttpsUrl: 'https://example.com/audio.flac' } }), user);
  const result = await api.request('audio', { id: '456', quality: 'hires', freeSign: 'test' });
  assert.equal(result.data.quality, 'lossless');
  assert.equal(api.calls.length, 2);
  for (const call of api.calls) { assert.equal(call.method, 'GET'); assert.ok(call.body); checkSignature(call); }
  assert.equal(JSON.parse(api.calls[1].body).format, 'flac');
});
test('QR login exchanges authType 10 and never returns credentials', async () => {
  const api = runtime(input => {
    const endpoint = new URL(input.url).pathname;
    if (endpoint.endsWith('qrCode')) return { code: 200, data: { qrCode: 'synthetic-qr' } };
    if (endpoint.endsWith('qrCodeStatus')) return { code: 200, data: { status: 3 } };
    assert.equal(JSON.parse(input.body).authType, 10);
    return { code: 200, data: { uid: user.uid, token: user.token, userInfo: { uid: user.uid, nickname: 'Test' } } };
  });
  assert.equal((await api.request('login_qr_key')).data.key, 'synthetic-qr');
  assert.equal(new URL((await api.request('login_qr_create', { key: 'synthetic-qr' })).data.imageUrl).searchParams.get('pageName'), 'login_pc');
  const result = await api.request('login_qr_check', { key: 'synthetic-qr' });
  assert.deepEqual(result, { ok: true, data: { state: 'confirmed' } });
  assert.equal(JSON.parse(api.stored()).token, user.token);
  assert.ok(!JSON.stringify(await api.request('login_status')).includes(user.token));
});
test('lyrics decode Base64 and upstream timing into AWLRC', async () => {
  const api = runtime(() => ({ code: 200, data: { content: Buffer.from('[kuwo:13]\n[00:01.00]<1200,800>字').toString('base64') } }));
  const result = await api.request('lyrics', { id: '456' });
  assert.match(result.data.wordByWordText, /<1000,200>字/);
  assert.ok(!result.data.mainText.includes('<'));
});
test('region rejection preserves the account; auth rejection clears it', async () => {
  let code = 407;
  const api = runtime(() => ({ code, msg: 'region' }), user);
  assert.equal((await api.request('song_detail', { id: '456' })).error.code, 'region-restricted');
  assert.ok(api.stored());
  code = 11012;
  assert.equal((await api.request('song_detail', { id: '456' })).error.code, 'auth-required');
  assert.equal(api.stored(), '');
});
test('mixed library paging retains cursor even when the requested category is empty', async () => {
  const api = runtime(() => ({ code: 200, data: { playLists: [{ id: 1, sourceType: 4 }], total: 2 } }), user);
  const result = await api.request('user_albums', { limit: 1, offset: 0 });
  assert.deepEqual(result.data.albumList, []);
  assert.deepEqual(result.data.bodianPagination, { nextOffset: 1, hasMore: true });
});
test('unknown operations, invalid inputs and forged credentials cannot dispatch', async () => {
  const api = runtime(() => { throw new Error('unexpected dispatch'); });
  assert.equal((await api.request('arbitrary_url', { url: 'https://example.com' })).error.code, 'unsupported');
  assert.equal((await api.request('search', { query: [] })).error.code, 'invalid-response');
  assert.equal((await api.request('user_playlists', { uid: user.uid, token: user.token })).error.code, 'auth-required');
  assert.equal(api.calls.length, 0);
});
