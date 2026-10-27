import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

// Synthetic upstream and native-crypto equivalents for exercising the generated ArkJS bundle.
const file = fileURLToPath(new URL('../../entry/src/main/ets/services/qishui/QishuiRuntime.js', import.meta.url));
let source = fs.readFileSync(file, 'utf8').replace(/import (\w+) from ["']@ohos\.url["'];/,
  'const $1 = { URL: globalThis.URL, URLParams: globalThis.URLSearchParams };');
assert.ok(!/\b(?:require|__require)\(["'](?:node:|@ohos)/.test(source));
const { createQishuiRuntime } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
export const pixel = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=';
export function nativeCrypto(payload) {
  const input = JSON.parse(payload);
  const bytes = value => Buffer.from(value || '', 'base64');
  if (input.operation === 'random') return JSON.stringify({ data: crypto.randomBytes(input.length).toString('base64') });
  if (input.operation === 'keypair') {
    const pair = crypto.generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
    return JSON.stringify({ privateKey: pair.privateKey.export({ type: 'pkcs8', format: 'der' }).toString('base64'),
      publicKey: pair.publicKey.export({ type: 'spki', format: 'der' }).toString('base64') });
  }
  if (input.operation === 'sign') return JSON.stringify({ data: crypto.sign('sha256', bytes(input.data),
    crypto.createPrivateKey({ key: bytes(input.key), type: 'pkcs8', format: 'der' })).toString('base64') });
  if (input.operation === 'hash') return JSON.stringify({ data: crypto.createHash('md5').update(bytes(input.data)).digest('base64') });
  throw new Error('Unexpected crypto operation');
}
export function createHarness(initialSession = '') {
  const state = { stored: initialSession, qr: 'new', fail: false, reject: false, calls: [], replies: [], key: null, pauseAccount: null,
    extraTrack: false, audioKind: 'full', expiredReads: 0, tokenCount: 0,
    liked: new Set(['9876543210123456789']), playlistIds: new Set(['9876543210123456789']) };
  const publicTrack = { base_info: { id: '9876543210123456789', name: '汽水测试歌曲', duration_ms: 60000 },
    related_info: { artist_links: [{ id: '8', name: '测试歌手' }] },
    display_info: { lyric_info: { lyric_entity: { type: 'krc', content: '[0,3000]<0,1000,0>汽水<1000,2000,0>测试\n[3000,57000]<0,57000,0>播放歌词' } } } };
  const secondTrack = { ...publicTrack, base_info: { ...publicTrack.base_info, id: '9876543210123456790', name: '汽水下一首' } };
  const tracks = () => state.extraTrack ? [publicTrack, secondTrack] : [publicTrack];
  const cryptoCall = payload => {
    const result = nativeCrypto(payload), input = JSON.parse(payload);
    if (input.operation === 'keypair') state.key = crypto.createPublicKey({ key: Buffer.from(JSON.parse(result).publicKey, 'base64'), type: 'spki', format: 'der' });
    return result;
  };
  const network = async payload => {
    const input = JSON.parse(payload), url = new URL(input.url), endpoint = url.pathname;
    state.calls.push(input);
    if (state.fail) return JSON.stringify({ status: 503, body: '{}', headers: {} });
    let data = {}, extra = {}, headers = {};
    const body = input.body ? input.headers['content-type'] === 'application/x-www-form-urlencoded'
      ? Object.fromEntries(new URLSearchParams(input.body)) : JSON.parse(input.body) : {};
    if (endpoint.endsWith('/media/mget/') && state.expiredReads-- > 0) {
      return JSON.stringify({ status: 200, body: JSON.stringify({ err_no: 28001008 }), headers });
    }
    if (endpoint.endsWith('/oauth/get_qrcode/')) data = { token: 'synthetic-qr-token', qrcode: pixel };
    else if (endpoint.endsWith('/oauth/check_qrcode/')) data = { status: state.qr, code: 'synthetic-auth-code' };
    else if (endpoint.endsWith('/access/code/get/')) data = { access_code: 'synthetic-access', open_id: 'synthetic-open', expires_time: 21600 };
    else if (endpoint.endsWith('/get_access_ticket/')) {
      const pem = Buffer.from(input.headers['bd-ticket-guard-client-csr'], 'base64').toString();
      assert.match(pem, /BEGIN CERTIFICATE REQUEST/);
      const der = Buffer.from(pem.replace(/-----[^\n]+-----|\s/g, ''), 'base64');
      const read = offset => {
        const start = offset; offset++; let length = der[offset++];
        if (length & 128) { const count = length & 127; length = 0; for (let i = 0; i < count; i++) length = length * 256 + der[offset++]; }
        return { start, body: offset, end: offset + length };
      };
      const outer = read(0), info = read(outer.body), algorithm = read(info.end), signature = read(algorithm.end);
      assert.ok(crypto.verify('sha256', der.subarray(info.start, info.end), state.key, der.subarray(signature.body + 1, signature.end)));
      headers['bd-ticket-guard-server-data'] = Buffer.from(JSON.stringify({ ticket: 'synthetic-ticket', ts_sign: 'synthetic-ts-sign', client_cert: 'synthetic-cert' })).toString('base64');
    } else if (endpoint.endsWith('/client/token/get/')) { state.tokenCount++; extra.client_token = `synthetic-client-token-${state.tokenCount}`; }
    else if (endpoint.endsWith('/me/info/')) {
      if (state.pauseAccount) await state.pauseAccount;
      if (state.reject) return JSON.stringify({ status: 200, body: JSON.stringify({ err_no: 28001007 }), headers });
      const signed = JSON.parse(Buffer.from(input.headers['bd-ticket-guard-client-data'], 'base64').toString());
      const publicKey = state.key || crypto.createPublicKey(JSON.parse(state.stored).guardKey);
      assert.ok(crypto.verify('sha256', Buffer.from(`ticket=synthetic-ticket&path=${endpoint}&timestamp=${signed.timestamp}`), publicKey, Buffer.from(signed.req_sign, 'base64')));
      data = { my_info: { id: 'qishui-test-user', nickname: '汽水测试账号', is_vip: false } };
    } else if (endpoint.endsWith('/me/playlist/')) data = { playlists: [{ base_info: { id: '123', title: '汽水测试歌单', owner_id: 'qishui-test-user' } },
      { base_info: { id: '124', title: '我喜欢', owner_id: 'qishui-test-user', type: 1 } }], has_more: false };
    else if (endpoint.endsWith('/me/collection/mixed/')) data = { mixed_collections: [], has_more: false };
    else if (endpoint.endsWith('/playlist/detail/')) data = { media_entities: tracks().filter(track =>
      body.playlist_id === '124' ? state.liked.has(track.base_info.id) : state.playlistIds.has(track.base_info.id)).map(track_entity => ({ track_entity })),
      playlist: { base_info: { id: body.playlist_id, title: body.playlist_id === '124' ? '我喜欢' : '汽水测试歌单' } }, has_more: false };
    else if (endpoint.endsWith('/me/recent-played/')) data = { media: [{ media: { track_entity: publicTrack }, play_start_timestamp: 1792900000 }], has_more: false };
    else if (endpoint.endsWith('/search/')) data = body.search_type === 'playlist'
      ? { result_groups: [{ id: 'playlists', data: [{ entity: { playlist: { base_info: { id: '123', title: '汽水测试歌单' } } } }], has_more: false }] }
      : { result_groups: [{ id: 'tracks', data: tracks().map(track => ({ entity: { track } })), has_more: false }] };
    else if (endpoint.endsWith('/media/mget/')) {
      const selected = tracks().find(track => track.base_info.id === body.media_list?.[0]?.id);
      const variant = state.audioKind === 'preview' ? 'preview' : 'full';
      data = { media_list: selected ? [{ media_id: selected.base_info.id, track_entity: { ...selected,
        player_info: { [variant]: { duration: { start_ms: 30000 }, video_model_info: { video_model: { video_list: [{
          main_url: `https://verification.douyinvod.com/${selected.base_info.id}.wav`,
          video_meta: { quality: 'medium', bitrate: 128000 }, ...(state.audioKind === 'protected' ? { Encrypt: 1 } : {})
        }] } } } } } }] : [] };
    }
    else if (endpoint.endsWith('/media/mcheck/')) data = { statuses: [] };
    else if (endpoint.endsWith('/feed/mode/')) data = { feed_mode_block: [{ title: '汽水场景', feed_mode: [
      { entity: { feed_mode: { text: '汽水放松', scene_mode: { scene_mode_id: 12345 } } } }
    ] }] };
    else if (endpoint.endsWith('/feed/song-tab/')) data = { items: tracks().map(track_entity => ({ type: 'track', track_entity })), has_more: true };
    else if (endpoint.endsWith('/artist/detail/')) data = { artist_info: { base_info: { id: '8', name: '测试歌手' } } };
    else if (endpoint.endsWith('/artist/tracks/')) data = { tracks: tracks() };
    else if (endpoint.endsWith('/media/collect/') || endpoint.endsWith('/media/cancel/collect/')) {
      for (const track of body.media) endpoint.endsWith('/media/collect/') ? state.liked.add(track.id) : state.liked.delete(track.id);
    } else if (endpoint.endsWith('/playlist/append/') || endpoint.endsWith('/playlist/delete/')) {
      for (const track of body.media) endpoint.endsWith('/playlist/append/') ? state.playlistIds.add(track.id) : state.playlistIds.delete(track.id);
    } else if (endpoint.endsWith('/dislike/')) data = {};
    else throw new Error(`Unmocked endpoint ${endpoint}`);
    return JSON.stringify({ status: 200, body: JSON.stringify({ err_no: 0, data, ...extra }), headers });
  };
  const make = (fetch = network) => createQishuiRuntime('1234567890123456789', () => state.stored,
    value => { state.stored = value; }, fetch, cryptoCall);
  let runtime = make();
  return { state, make, network, reopen() { runtime = make(); },
    async request(operation, params = {}) {
      const reply = await runtime.request(operation, JSON.stringify(params)); state.replies.push(reply); return JSON.parse(reply);
    } };
}
