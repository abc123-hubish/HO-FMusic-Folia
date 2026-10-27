import { qqMusicRequest, buildQQAuthComm } from './upstream/api/qq.js';
import { getQQCookie, qqCookieUin, qqCookieMusicKey } from './upstream/api/cookies.js';

// Native QQ preview protocol, aligned with qq-music-api 3.3.3 auth/playback and previewFile.
// Only confirmed size_try > 0 with a real media_mid may request an RS02 preview file.
export async function requestNativeQqPreview(params) {
  const cookie = await getQQCookie();
  if (!qqCookieUin(cookie) || !qqCookieMusicKey(cookie)) throw Object.assign(new Error('QQ preview requires a session'), { code: 'auth-required' });
  const songmid = String(params.songmid || '').trim();
  if (!songmid) throw Object.assign(new Error('QQ song has no mid'), { code: 'invalid-response' });
  const comm = buildQQAuthComm(cookie);
  const call = async (module, method, param) => {
    const result = await qqMusicRequest({ comm, req_0: { module, method, param } }, cookie);
    const block = result?.req_0;
    if (Number(result?.code) !== 0 || Number(block?.code) !== 0) {
      const code = Number(block?.code ?? result?.code);
      throw Object.assign(new Error('QQ preview request rejected'), { code: code === 1000 ? 'auth-required' : 'invalid-response', upstreamCode: code });
    }
    return block.data;
  };
  const detail = await call('music.pf_song_detail_svr', 'get_song_detail_yqq', { song_type: 0, song_mid: songmid });
  const file = detail?.track_info?.file;
  const validMedia = value => typeof value === 'string' && /^[A-Za-z0-9]{14}$/.test(value.trim()) ? value.trim() : undefined;
  const media = validMedia(params.mediaId) || validMedia(file?.media_mid);
  const size = Number(file?.size_try);
  const empty = { code: 200, data: { playUrl: { [songmid]: { url: '', preview: true } } } };
  if (!Number.isSafeInteger(size) || size <= 0 || !media) return empty;
  const data = await call('music.vkey.GetVkey', 'UrlGetVkey', {
    filename: [`RS02${media}.mp3`], guid: `${Date.now()}${Math.floor(Math.random() * 1000000)}`,
    songmid: [songmid], songtype: [0], uin: String(qqCookieUin(cookie)), ctx: 0,
  });
  const entry = data?.midurlinfo?.find(row => row.songmid === songmid) ?? data?.midurlinfo?.[0];
  if (!entry?.purl) return empty;
  const domain = data?.sip?.find(value => /^https?:\/\//.test(value) && !value.startsWith('http://ws'))
    || data?.sip?.[0] || 'https://dl.stream.qqmusic.qq.com/';
  const start = Number(file?.try_begin), end = Number(file?.try_end);
  return { code: 200, data: { playUrl: { [songmid]: { url: /^https?:\/\//.test(entry.purl) ? entry.purl : domain + entry.purl,
    preview: true, ...(Number.isSafeInteger(start) && start >= 0 && Number.isSafeInteger(end) && end > start ? { clipStartMs: start } : {}) } } } };
}
