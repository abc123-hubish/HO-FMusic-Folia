import { ensureKGCookie, kgFetchAndroidSigned, getKGMid, buildKGTrackerKey } from './upstream/api/kugou.js';
import { kgCookieUserId, kgCookieToken, kgCookieDfid, parseCookieString } from './upstream/api/cookies.js';

// Native KuGou authorization flow, matching KuGouMusicApi's song_auth and song_url_auth modules.
// https://github.com/MakcRe/KuGouMusicApi/blob/ba3645f2c89e6b9d4fec82ff783c15287e4c5f43/module/song_url_auth_merge.js
export async function authenticatedKugouAudio(params) {
  const cookie = await ensureKGCookie();
  const userId = kgCookieUserId(cookie);
  if (!userId || !kgCookieToken(cookie)) return null;
  const hash = String(params.hash || params.id || '').trim().toLowerCase();
  if (!hash) return null;
  const albumAudioId = Number(params.album_audio_id) || 0;
  const deviceId = kgCookieDfid(cookie) || Array.from({ length: 24 }, () => Math.floor(Math.random() * 36).toString(36)).join('');
  const common = { hash, album_audio_id: albumAudioId, clientver: 11561, dfid: deviceId };
  const options = { preferAppToken: true };
  const authResponse = await kgFetchAndroidSigned('http://trackercdngz.kugou.com', '/v1/authorization', cookie,
    { ...common, authorization: parseCookieString(cookie).auth || '', module_id: 51 }, { dfid: deviceId }, options);
  const authorization = authResponse?.data;
  if (Number(authResponse?.status) !== 1 || !authorization?.auth || !authorization?.open_time) return null;
  const response = await kgFetchAndroidSigned('https://gateway.kugou.com', '/tracker/v5/url', cookie, {
    ...common, album_id: Number(params.album_id) || 0, area_code: 1, module: '', need_m: 0,
    ssa_flag: 'is_fromtrack', version: 11430, open_time: authorization.open_time, ptype: 0, need_ogg: 1,
    page_id: 967177915, auth: authorization.auth, mtype: 0, quality: params.quality || 128,
    behavior: 'play', pid: 411, module_id: 51, cmd: 26, ppage_id: '356753938,823673182,967485191',
    pidversion: 3001, cdnBackup: 1, key: buildKGTrackerKey(hash, await getKGMid(cookie), userId, 3116),
  }, { dfid: deviceId }, options);
  const urls = [response?.url, response?.backupUrl, response?.backup_url, response?.data?.url];
  const url = urls.flat().find(value => typeof value === 'string' && /^https?:\/\//i.test(value));
  if (Number(response?.status) !== 1 || !url) return null;
  const level = ['flac', 'high', 'lossless'].includes(String(params.quality)) ? 'lossless'
    : String(params.quality) === '320' ? 'exhigh' : 'standard';
  return { status: 1, error_code: 0, data: { play_url: url, url, level }, playable: true, source: 'authorized-v5' };
}
