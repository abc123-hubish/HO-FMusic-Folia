import fs from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { randomBytes } from 'node:crypto';
import vm from 'node:vm';

// Verify the actual generated ArkJS protocol with synthetic catalogue responses and credentials.
const source = fs.readFileSync(new URL('../entry/src/main/ets/services/music/MusicRuntime.js', import.meta.url), 'utf8')
  .replace("import nativeUrl from '@ohos.url';", 'const nativeUrl = { URL: globalThis.URL, URLParams: globalThis.URLSearchParams };');
const track = { id: 101, mid: 'explore-song', name: 'Explore song', interval: 120,
  singer: [{ id: 1, mid: 'artist', name: 'Artist' }], album: { id: 2, mid: 'album', name: 'Album' } };
const account = JSON.stringify({ storage: {}, cookies: [
  { name: 'uin', value: '98765', domain: '.qq.com' },
  { name: 'qqmusic_key', value: 'synthetic-explore-secret', domain: '.qq.com' },
] });

/** No browser or Node networking globals are present in the protocol's VM. */
function native(respond, saved = '') {
  const context = vm.createContext({ URL, URLSearchParams, setTimeout, clearTimeout });
  vm.runInContext(source.replace('export function createMusicRuntime', 'function createMusicRuntime'), context);
  let stored = saved;
  const calls = [];
  const runtime = context.createMusicRuntime('qq', async payload => {
    const input = JSON.parse(payload);
    const body = JSON.parse(input.body);
    calls.push({ ...input, payload: body });
    const response = await respond(body, input);
    return JSON.stringify({ status: 200, headers: [], body: Buffer.from(JSON.stringify(response)).toString('base64') });
  }, () => stored, value => { stored = value; }, length => randomBytes(length).toString('base64'));
  return { calls, request: async (operation, params = {}) => JSON.parse(await runtime.request(operation, JSON.stringify(params))) };
}
const answer = data => ({ code: 0, req_0: { code: 0, data } });

test('native radar uses its fixed read descriptor and removes credential-shaped fields', async () => {
  const api = native(body => {
    assert.equal(body.req_0.module, 'music.recommend.TrackRelationServer');
    assert.equal(body.req_0.method, 'GetRadarSong');
    assert.equal(body.req_0.param.Page, 2);
    return answer({ VecSongs: [{ Track: { ...track, qm_keyst: 'must-not-leave-native' } }], HasMore: true });
  });
  const result = await api.request('recommend_radar', { page: 2 });
  assert.equal(result.ok, true);
  assert.equal(result.data.songs[0].mid, track.mid);
  assert.equal(result.data.more, true);
  assert.ok(!JSON.stringify(result).includes('must-not-leave-native'));
  assert.ok(!api.calls[0].headers.Cookie);
});

test('native new songs preserve raw song identity for the Web normalizer', async () => {
  const api = native(body => {
    assert.equal(body.req_0.module, 'newsong.NewSongServer');
    assert.equal(body.req_0.param.type, 5);
    return answer({ songlist: [track], lanlist: [] });
  });
  const result = await api.request('recommend_new_songs');
  assert.equal(result.ok, true);
  assert.equal(result.data.songs[0].mid, track.mid);
});

test('native new albums execute the two-descriptor batch and tolerate missing area metadata', async () => {
  const api = native(body => {
    assert.equal(body.req_0.method, 'get_new_album_area');
    assert.equal(body.req_1.method, 'get_new_album_info');
    assert.equal(body.req_1.param.start, 12);
    return { code: 0, req_0: { code: 500, data: {} }, req_1: { code: 0, data: {
      albums: [{ id: 2, mid: 'album', name: 'New album', singers: [{ mid: 'artist', name: 'Artist' }] }], total: 30,
    } } };
  });
  const result = await api.request('recommend_new_albums', { offset: 12, limit: 12 });
  assert.equal(result.ok, true, JSON.stringify(result));
  assert.equal(result.data.albums[0].mid, 'album');
  assert.equal(result.data.more, true);
  assert.equal(api.calls.length, 1);
});

test('native charts and their tracks keep chart IDs and pagination parameters', async () => {
  const chart = { topId: 26, title: 'Hot songs', totalNum: 25, period: '2026_42' };
  const api = native(body => {
    if (body.req_0.method === 'GetAll') return answer({ group: [{ groupId: 1, groupName: 'Charts', toplist: [chart] }] });
    assert.equal(body.req_0.param.topid, 26);
    assert.equal(body.req_0.param.offset, 12);
    return answer({ data: chart, songInfoList: [track] });
  });
  const lists = await api.request('recommend_toplists');
  assert.equal(lists.data.groups[0].toplists[0].id, 26);
  const songs = await api.request('recommend_toplist', { id: 26, period: '2026_42', offset: 12, limit: 12 });
  assert.equal(songs.ok, true, JSON.stringify(songs));
  assert.equal(songs.data.songs[0].mid, track.mid);
});

test('native empty, rejected, and malformed catalogue responses stay distinct', async () => {
  const empty = await native(() => answer({ VecSongs: [], HasMore: false })).request('recommend_radar');
  assert.equal(empty.ok, false);
  assert.equal(empty.error.httpStatus, 422);
  const rejected = await native(() => ({ code: 0, req_0: { code: 2001, data: {} } })).request('recommend_radar');
  assert.equal(rejected.ok, false);
  assert.equal(rejected.error.httpStatus, 502);
  const malformed = await native(() => answer({ VecSongs: 'changed-response' })).request('recommend_radar');
  assert.equal(malformed.ok, false);
  assert.equal(malformed.error.httpStatus, 502);
});

test('account-only Explore routes require native login and never expose the retained secret', async () => {
  const guest = native(() => { throw new Error('anonymous account route must not request'); });
  for (const operation of ['radio_list', 'radio_tracks', 'song_similar']) {
    const result = await guest.request(operation, { id: 101 });
    assert.equal(result.ok, false);
    assert.equal(result.error.code, 'auth-required');
  }
  assert.equal(guest.calls.length, 0);
  const signed = native(body => {
    assert.ok(body.comm.uin);
    return answer({ radio_list: [{ id: 1, title: 'Radio', list: [{ id: 2, title: 'Station' }] }] });
  }, account);
  const result = await signed.request('radio_list');
  assert.equal(result.ok, true, JSON.stringify(result));
  assert.equal(result.data.groups[0].radios[0].id, 2);
  assert.ok(!JSON.stringify(result).includes('synthetic-explore-secret'));
});

test('Explore cannot supply native credentials or invoke an arbitrary protocol operation', async () => {
  const api = native(() => { throw new Error('invalid input must not reach network'); });
  assert.equal((await api.request('recommend_radar', { cookie: 'forbidden' })).ok, false);
  assert.equal((await api.request('arbitrary_musicu', { module: 'unknown' })).error.code, 'unsupported');
  assert.equal(api.calls.length, 0);
});
