import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { randomBytes } from 'node:crypto';

// Verify failure evidence across the generated ArkJS boundary with synthetic replies only.
const source = fs.readFileSync(new URL('../entry/src/main/ets/services/music/MusicRuntime.js', import.meta.url), 'utf8')
  .replace("import nativeUrl from '@ohos.url';", 'const nativeUrl = { URL: globalThis.URL, URLParams: globalThis.URLSearchParams };');
function native(respond, saved = '') {
  const context = vm.createContext({ URL, URLSearchParams, setTimeout, clearTimeout });
  vm.runInContext(source.replace('export function createMusicRuntime', 'function createMusicRuntime'), context);
  const api = context.createMusicRuntime('qq', async payload => JSON.stringify(await respond(JSON.parse(payload))),
    () => saved, () => {}, length => randomBytes(length).toString('base64'));
  return async (operation, params = {}) => JSON.parse(await api.request(operation, JSON.stringify(params)));
}
const reply = (body, status = 200, headers = []) => ({ status, headers, body: Buffer.from(JSON.stringify(body)).toString('base64') });

for (const [status, code] of [[429, 'rate-limited'], [408, 'timeout'], [504, 'timeout'], [503, 'service-unavailable']]) {
  test(`native HTTP ${status} preserves its playback failure code`, async () => {
    const request = native(() => reply({}, status, [{ name: 'Retry-After', value: '12' }]));
    const result = await request('user_daily_songs');
    assert.equal(result.ok, false);
    assert.equal(result.error.code, code);
    assert.equal(result.error.httpStatus, status);
    assert.equal(result.error.retryAfterMs, 12000);
  });
}
test('native timeout retains its reason and removes request URL from public message', async () => {
  const result = await native(() => { throw new Error('ETIMEDOUT https://example.test/private'); })('user_daily_songs');
  assert.equal(result.error.code, 'timeout');
  assert.ok(!result.error.message.includes('https://'));
});
for (const [message, hint] of [['', undefined], ['VIP会员限制', 'playback.maybe-membership'], ['地区限制', 'playback.maybe-region-restricted']]) {
  test(`native QQ empty audio keeps evidence for ${message || 'ambiguous code'}`, async () => {
    const request = native(input => {
      const body = JSON.parse(input.body);
      if (body.req_0?.method === 'CgiGetVkey') return reply({ code: 0, req_0: { code: 0, data: {
        midurlinfo: [{ purl: '', result: 104003, msg: message }], sip: [],
      } } });
      return reply({ code: 0, req_0: { code: 0, data: {} } });
    });
    const result = await request('music_play', { songmid: 'test-mid', mediaId: 'test-media' });
    assert.equal(result.ok, true, JSON.stringify(result));
    const row = result.data.data.playUrl['test-mid'];
    assert.equal(row.url, '');
    assert.equal(row.restriction.codes.result, 104003);
    assert.equal(row.restriction.hint?.key, hint);
  });
}
test('native daily recommendations keep song identity', async () => {
  const request = native(input => {
    const body = JSON.parse(input.body);
    assert.equal(body.req_0.method, 'uniform_get_Dissinfo');
    assert.equal(body.req_0.param.dirid, 202);
    return reply({ code: 0, req_0: { code: 0, data: { songlist: [{ id: 101, mid: 'daily-song' }] } } });
  });
  const result = await request('user_daily_songs');
  assert.equal(result.ok, true);
  assert.equal(result.data.songs[0].mid, 'daily-song');
});

const previewAccount = JSON.stringify({ storage: {}, cookies: [
  { name: 'uin', value: '98765', domain: '.qq.com' },
  { name: 'qqmusic_key', value: 'synthetic-preview-key', domain: '.qq.com' },
] });
test('native QQ preview verifies size_try, uses media_mid, and retains millisecond lyric origin', async () => {
  const methods = [];
  const request = native(input => {
    const body = JSON.parse(input.body), query = body.req_0;
    methods.push(query.method);
    if (query.method === 'get_song_detail_yqq') return reply({ code: 0, req_0: { code: 0, data: {
      track_info: { mid: 'song-mid', file: { size_try: 960887, media_mid: '001zLvbN1NYMuv', try_begin: 76026, try_end: 106864 } },
    } } });
    assert.equal(query.module, 'music.vkey.GetVkey');
    assert.equal(query.method, 'UrlGetVkey');
    assert.deepEqual(query.param.filename, ['RS02001zLvbN1NYMuv.mp3']);
    return reply({ code: 0, req_0: { code: 0, data: { sip: ['https://audio.example.test/'], midurlinfo: [{ songmid: 'song-mid', purl: 'preview.mp3' }] } } });
  }, previewAccount);
  const result = await request('music_play', { songmid: 'song-mid', preview: 1 });
  assert.equal(result.ok, true, JSON.stringify(result));
  assert.equal(result.data.data.playUrl['song-mid'].preview, true);
  assert.equal(result.data.data.playUrl['song-mid'].clipStartMs, 76026);
  assert.deepEqual(methods, ['get_song_detail_yqq', 'UrlGetVkey']);
  assert.ok(!JSON.stringify(result).includes('synthetic-preview-key'));
});
for (const file of [{ size_try: 0, media_mid: '001zLvbN1NYMuv' }, { size_try: 500, media_mid: 'invalid' }, {}]) {
  test(`native QQ does not guess an unavailable preview ${JSON.stringify(file)}`, async () => {
    let count = 0;
    const request = native(() => {
      count++;
      return reply({ code: 0, req_0: { code: 0, data: { track_info: { file } } } });
    }, previewAccount);
    const result = await request('music_play', { songmid: 'song-mid', preview: 1 });
    assert.equal(result.ok, true, JSON.stringify(result));
    assert.equal(result.data.data.playUrl['song-mid'].url, '');
    assert.equal(count, 1);
  });
}
