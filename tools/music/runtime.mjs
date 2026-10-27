import { handleFoliaQqRequest, handleFoliaKugouRequest } from './upstream/api/folia.js';
import { clearCookieCache, getQQCookie, qqCookieUin, qqCookieMusicKey } from './upstream/api/cookies.js';
import { qqMusicRequest, handleQQSearch } from './upstream/api/qq.js';
import { configureHost, persistHost, clearHostProvider, receiveSocketEvent, closeHostSockets, URL } from './host.mjs';
import { cancelNativeQrSessions } from './upstream/api/qq-native-login.js';
import { catalogResult, pageResult, userPlaylists, ownPlaylistPage, legacyPlayInfo, songDetail, mediaLinks } from './catalog.mjs';
import { authenticatedKugouAudio } from './kugouPlayback.mjs';
import { QQ_EXPLORE_OPERATIONS, requestQqExplore } from './qqExplore.mjs';
import { checkedNativeRequest, nativeMusicError, withQqPlaybackEvidence } from './playbackFailure.mjs';
import { requestNativeQqPreview } from './qqPreview.mjs';

// Each provider has an isolated host. Independent reads must not wait behind QR long polling.
const operations = {
  qq: new Set(['login_qr_key','login_qr_create','login_qr_check','login_qr_cancel','login_status','logout','login_channels','user_detail','user_playlist','user_albums','user_liked_songs','user_playlist_detail','music_play','song_list_detail','song_info','album_info','artist_albums','artist_songs','lyric_request','user_guess_you_like','user_daily_songs','recommend_playlists','user_playlist_tracks','user_playlist_subscribe','user_subscription_status','user_song_like','user_album_subscribe']),
  kugou: new Set(['register_dev','login_qr_key','login_qr_create','login_qr_check','logout','user_detail','user_vip_detail','user_playlist','user_cloud','user_cloud_url','search','audio','krm_audio','song_url','song_climax','search_lyric','lyric','playlist_track_all','playlist_track_all_new','playlist_detail','album_detail','album_songs','artist_detail','artist_albums','artist_audios','everyday_recommend','everyday_history','personal_fm','top_card_youth','playlist_add','playlist_del','playlist_tracks_add','playlist_tracks_del','legacy_play_info']),
};
const secret = /^(?:cookie|cookies|cookieObject|cookieList|session|token|t|t1|dfid|KuGoo|KugooPwd|vip_token|appToken|sourceToken|qm_keyst|musickey|qqmusic_key|music_key|p_skey|skey|wxskey|psrf_.*token|wxrefresh_token|wxopenid|raw)$/i;
operations.qq.add('search');
for (const operation of QQ_EXPLORE_OPERATIONS) operations.qq.add(operation);
for (const operation of ['youth_union_vip','youth_day_vip','youth_day_vip_upgrade']) operations.kugou.add(operation);
function publicResult(value) {
  if (Array.isArray(value)) return value.map(publicResult);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.entries(value).filter(([key]) => !secret.test(key)).map(([k,v]) => [k, publicResult(v)]));
}
export function createRuntime(provider, nativeRequest, read, write, randomBytes) {
  configureHost(checkedNativeRequest(nativeRequest), read, write, randomBytes);
  let librarySnapshot;
  return { receiveSocketEvent, request(operation, payload) {
    const run = async () => {
      try {
        if (!operations[provider]?.has(operation)) return JSON.stringify({ ok: false, error: { code: 'unsupported', message: 'This operation is unavailable in the built-in connection' } });
        const params = JSON.parse(payload);
        if (!params || typeof params !== 'object' || Array.isArray(params)) throw new Error('Invalid parameters');
        for (const [key,value] of Object.entries(params)) {
          if (secret.test(key) || !['string','number','boolean'].includes(typeof value)) throw new Error('Invalid parameters');
        }
        if (provider === 'qq' && QQ_EXPLORE_OPERATIONS.includes(operation)) {
          const result = await requestQqExplore(operation, params);
          if (result.status >= 400) return JSON.stringify({ ok: false, error: {
            code: result.status === 401 ? 'auth-required' : 'network', httpStatus: result.status,
            message: result.body?.message || 'QQ Explore request failed',
          } });
          const data = publicResult(result.body);
          return JSON.stringify({ ok: true, data, media: mediaLinks(data) });
        }
        if (operation === 'logout') { librarySnapshot = undefined; cancelNativeQrSessions(); closeHostSockets(); clearHostProvider(provider); clearCookieCache(); persistHost(); return JSON.stringify({ ok: true, data: { code: 200 } }); }
        if (provider === 'qq' && operation === 'login_qr_key') { cancelNativeQrSessions(); closeHostSockets(); }
        if (operation === 'login_qr_check' || ['playlist_add','playlist_del','playlist_tracks_add','playlist_tracks_del'].includes(operation)) librarySnapshot = undefined;
        if (provider === 'qq' && operation === 'login_status') {
          const cookie = await getQQCookie();
          if (!qqCookieUin(cookie) || !qqCookieMusicKey(cookie)) return JSON.stringify({ ok: true, data: { code: 200, data: { profile: null, account: null } } });
        }
        if (provider === 'qq' && operation === 'lyric_request') {
          const payload = JSON.parse(params.payload), req = payload.request;
          const allowed = req && (req.module === 'music.search.SearchCgiService' && req.method === 'DoSearchForQQMusicLite'
            || req.module === 'music.musichallSong.PlayLyricInfo' && req.method === 'GetPlayLyricInfo');
          if (!allowed) throw new Error('Unsupported QQ search or lyric method');
          const result = await qqMusicRequest({ comm: publicResult(payload.comm), request: { ...req, param: publicResult(req.param) } },
            await getQQCookie() || 'tmeLoginType=-1;', 'okhttp/3.14.9');
          return JSON.stringify({ ok: true, data: publicResult(result) });
        }
        const input = { operation, params }, url = new URL('https://folia.local/');
        if (params.body && provider === 'qq' && ['user_playlist_tracks','user_playlist_subscribe','user_song_like','user_album_subscribe'].includes(operation)) {
          input.body = JSON.parse(params.body);
          if (JSON.stringify(publicResult(input.body)) !== JSON.stringify(input.body)) throw new Error('Invalid write parameters');
        }
        let result;
        if (provider === 'qq' && operation === 'music_play' && Number(params.preview) === 1) result = await requestNativeQqPreview(params);
        else if (provider === 'qq' && operation === 'search') result = { code: 0,
          songs: await handleQQSearch(params.keywords, params.limit, await getQQCookie(), params.page) };
        else if (provider === 'kugou' && operation === 'song_url') {
          try { result = await authenticatedKugouAudio(params); } catch {}
          if (!result) result = await handleFoliaKugouRequest(input, url);
        }
        else if (provider === 'kugou' && operation === 'user_playlist') {
          if (!librarySnapshot || Date.now() - librarySnapshot.at > 5000) librarySnapshot = { at: Date.now(), request: userPlaylists() };
          try { result = await librarySnapshot.request; } catch (error) { librarySnapshot = undefined; throw error; }
          // Paging must never mutate the shared full-library snapshot.
          result = { ...result, data: result.data ? { ...result.data } : undefined };
          if (!result.__foliaBridgeError) result = pageResult(result,operation,params);
        }
        else if (provider === 'kugou' && operation === 'legacy_play_info') result = await legacyPlayInfo(params);
        else if (provider === 'kugou' && ['audio','krm_audio'].includes(operation)) result = await songDetail(params);
        else if (provider === 'kugou' && operation === 'playlist_track_all') {
          result = await ownPlaylistPage(params);
          if (!result) result = pageResult(await handleFoliaKugouRequest(input, url), operation, params);
        } else {
          result = await (provider === 'qq' ? handleFoliaQqRequest(input, url) : handleFoliaKugouRequest(input, url));
          if (provider === 'kugou' && ['user_playlist','search'].includes(operation)) result = pageResult(result, operation, params);
        }
        persistHost();
        if (provider === 'qq' && operation === 'music_play') result = withQqPlaybackEvidence(result);
        if (result?.__foliaBridgeError) return JSON.stringify({ ok: false, error: { code: result.__foliaBridgeError === 'AUTH_REQUIRED' ? 'auth-required'
          : ['UNSUPPORTED','ROUTE_NOT_IMPLEMENTED'].includes(result.__foliaBridgeError) ? 'unsupported' : 'network', message: result.message,
          details: { stage: 'upstream', ...(Number.isFinite(result.upstreamCode) ? { upstreamCode: result.upstreamCode } : {}),
            ...(provider === 'qq' && result.__foliaBridgeError === 'AUTH_REQUIRED'
              ? { auth: qqCookieUin(await getQQCookie()) && qqCookieMusicKey(await getQQCookie()) ? 'expired' : 'signed-out' } : {}) } } });
        const data = publicResult(catalogResult(result));
        if (provider === 'kugou' && ['playlist_add','playlist_del','playlist_tracks_add','playlist_tracks_del','playlist_track_all','playlist_track_all_new','user_cloud'].includes(operation)
          && (Number(data?.status) !== 1 || Number(data?.error_code ?? 0) !== 0)) {
          return JSON.stringify({ ok: false, error: { code: [401,403,152].includes(Number(data?.error_code)) ? 'auth-required' : 'network',
            message: `KuGou ${operation} rejected (status=${data?.status}, error_code=${data?.error_code})` } });
        }
        // The Android bridge retains token fields for its renderer; native Harmony keeps only public results.
        return JSON.stringify({ ok: true, data, media: mediaLinks(data) });
      } catch (error) {
        persistHost();
        return JSON.stringify({ ok: false, error: nativeMusicError(error) });
      }
    };
    return run();
  } };
}
