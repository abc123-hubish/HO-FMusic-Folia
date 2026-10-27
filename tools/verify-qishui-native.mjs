import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createHarness } from './qishui/verificationHarness.mjs';

// Validate actual generated protocol flows; synthetic upstream and Node crypto stand in for native services.
async function login(api) {
  const key = (await api.request('login_qr_key')).data.key;
  assert.match((await api.request('login_qr_create', { key })).data.imageUrl, /^data:image\/png;base64,/);
  assert.equal((await api.request('login_qr_check', { key })).data.state, 'waiting');
  api.state.qr = 'scanned';
  assert.equal((await api.request('login_qr_check', { key })).data.state, 'scanned');
  api.state.qr = 'confirmed';
  assert.deepEqual(await api.request('login_qr_check', { key }), { ok: true, data: { state: 'confirmed' } });
}
test('QR authorization signs account requests, restores the account, reads playlists and signs out', async () => {
  const api = createHarness();
  await login(api);
  assert.equal(JSON.parse(api.state.stored).ticket, 'synthetic-ticket');
  api.reopen();
  assert.equal((await api.request('login_status')).data.nickname, '汽水测试账号');
  const playlists = await api.request('user_playlists', { limit: 20, offset: 0 });
  assert.equal(playlists.data.items[0].base_info.id, '123');
  assert.deepEqual((await api.request('liked_songs')).data.ids, ['9876543210123456789']);
  const search = await api.request('search', { query: 'test', limit: 20, offset: 0 });
  assert.equal(search.data.items[0].id, '9876543210123456789');
  assert.ok(!api.state.replies.some(reply => /synthetic-(?:ticket|access|ts-sign|qr-token)|BEGIN PRIVATE KEY/.test(reply)));
  await api.request('logout');
  assert.equal(api.state.stored, '');
  api.reopen(); assert.equal((await api.request('login_status')).data, null);
});
test('cancelling a QR prevents the cancelled session from being confirmed', async () => {
  const api = createHarness(), key = (await api.request('login_qr_key')).data.key;
  await api.request('login_qr_cancel', { key }); api.state.qr = 'confirmed';
  assert.equal((await api.request('login_qr_check', { key })).data.state, 'expired');
  assert.equal(api.state.stored, '');
});
test('network failure keeps a stored account; explicit account rejection clears it', async () => {
  const api = createHarness(); await login(api);
  const saved = api.state.stored;
  api.state.fail = true;
  assert.equal((await api.request('login_status')).error.code, 'network');
  assert.equal(api.state.stored, saved);
  api.state.fail = false; api.state.reject = true;
  assert.equal((await api.request('login_status')).error.code, 'auth-required');
  assert.equal(api.state.stored, '');
});
test('unknown operations cannot reach network or native crypto', async () => {
  const api = createHarness();
  assert.equal((await api.request('raw_request', { url: 'https://example.com' })).error.code, 'unsupported');
  assert.equal(api.state.calls.length, 0);
});
test('a confirmation completing after cancellation cannot replace the account', async () => {
  const api = createHarness(), key = (await api.request('login_qr_key')).data.key;
  let release; api.state.pauseAccount = new Promise(resolve => { release = resolve; }); api.state.qr = 'confirmed';
  const pending = api.request('login_qr_check', { key });
  while (!api.state.calls.some(input => new URL(input.url).pathname.endsWith('/me/info/'))) await new Promise(resolve => setTimeout(resolve, 1));
  await api.request('login_qr_cancel', { key }); release();
  assert.equal((await pending).data.state, 'expired');
  assert.equal(api.state.stored, '');
});
test('liked playlist rows and detail send the Android type:1 fix while ordinary lists keep their type', async () => {
  const api = createHarness(); await login(api);
  await api.request('playlist_tracks', { id: '124', liked: true });
  await api.request('playlist_detail', { id: '124', liked: true });
  await api.request('playlist_tracks', { id: '123' });
  const calls = api.state.calls.filter(input => new URL(input.url).pathname.endsWith('/playlist/detail/')).map(input => JSON.parse(input.body));
  assert.deepEqual(calls.map(input => input.type), [1, 1, null]);
});
test('audio, lyric and preview metadata survive the generated native protocol', async () => {
  const api = createHarness(); await login(api);
  const params = { id: '9876543210123456789', quality: 'standard' };
  const full = await api.request('audio', params);
  assert.match(full.data.url, /^https:\/\/verification\.douyinvod\.com\//);
  assert.equal(full.data.preview, false);
  assert.equal((await api.request('song_detail', params)).data.base_info.duration_ms, 60000);
  assert.match((await api.request('lyrics', params)).data.lyric_entity.content, /播放歌词/);
  api.state.audioKind = 'preview';
  assert.equal((await api.request('audio', params)).data.clipStartMs, 30000);
  api.state.audioKind = 'protected';
  assert.equal((await api.request('audio', params)).error.code, 'unsupported');
});
test('an expired public token is renewed once without losing the signed-in account', async () => {
  const api = createHarness(); await login(api); api.state.expiredReads = 1;
  assert.equal((await api.request('audio', { id: '9876543210123456789', quality: 'standard' })).ok, true);
  assert.equal(api.state.tokenCount, 2);
  assert.ok(api.state.stored);
});
test('signed-in library operations match Android: likes, playlist edits, recent history, artists and recommendation queues', async () => {
  const api = createHarness(); api.state.extraTrack = true; await login(api);
  const id = '9876543210123456790';
  assert.equal((await api.request('search_playlists', { query: 'test' })).data.items[0].base_info.id, '123');
  assert.equal((await api.request('artist_detail', { id: '8' })).data.base_info.name, '测试歌手');
  assert.equal((await api.request('artist_songs', { id: '8' })).data.items.length, 2);
  assert.equal((await api.request('recent_played')).data.items.length, 1);
  assert.equal((await api.request('feed_modes')).data[0].id, '12345');
  assert.equal((await api.request('feed', { queue: 'fm', scene: '12345' })).data.items.length, 2);
  assert.equal((await api.request('feed', { queue: 'explore', first: true })).data.items.length, 2);
  assert.equal((await api.request('like_song', { id, liked: true })).ok, true);
  assert.ok((await api.request('liked_songs')).data.ids.includes(id));
  await api.request('like_song', { id, liked: false });
  assert.ok(!(await api.request('liked_songs')).data.ids.includes(id));
  await api.request('playlist_add_tracks', { id: '123', ids: [id] });
  assert.equal((await api.request('playlist_tracks', { id: '123' })).data.items.length, 2);
  await api.request('playlist_remove_tracks', { id: '123', ids: [id] });
  assert.equal((await api.request('playlist_tracks', { id: '123' })).data.items.length, 1);
  assert.equal((await api.request('dislike_song', { id, disliked: true })).ok, true);
  await api.request('logout');
  assert.equal((await api.request('like_song', { id, liked: true })).error.code, 'auth-required');
});
test('expired and refused QR states never authorize or store an account', async () => {
  for (const status of ['expired', 'refused']) {
    const api = createHarness(), key = (await api.request('login_qr_key')).data.key;
    api.state.qr = status;
    const reply = await api.request('login_qr_check', { key });
    assert.equal(reply.data.state, status === 'expired' ? 'expired' : 'error');
    assert.equal(api.state.stored, '');
  }
});
