import { handleKGPlaylistTracksNew, handleKGUserPlaylists, ensureKGCookie } from './upstream/api/kugou.js';
import { kgCookieUserId } from './upstream/api/cookies.js';
import { fetch, URL } from './host.mjs';

// The Android bridge emits its own song records; the Web providers consume API-shaped records.
export function catalogResult(value) {
  if (Array.isArray(value)) return value.map(catalogResult);
  if (!value || typeof value !== 'object') return value;
  if (value.provider === 'kg' && value.hash && 'artist' in value) {
    return { ...value, SongName: value.name, SingerName: value.artist, AlbumName: value.album,
      AlbumID: value.albumId, album_audio_id: value.albumAudioId, Duration: Number(value.duration) / 1000,
      HQFileHash: value.hash320, SQFileHash: value.hashSq,
      singers: String(value.artist || '').split(' / ').filter(Boolean).map((name, i) => ({ name,
        ...(i === 0 && value.singerId ? { author_id: value.singerId } : {}) })) };
  }
  if (value.provider === 'qq' && value.mid && typeof value.album === 'string') {
    return { ...value, id: value.qqId || value.id, durationMs: value.duration,
      album: { name: value.album, mid: value.albumMid, coverUrl: value.cover }, singer: value.artists };
  }
  if (value.tid && value.dirName !== undefined && value.subscribed === true) {
    const { dirName, ...collection } = value;
    return { ...collection, name: dirName, providerData: { owned: false } };
  }
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, catalogResult(item)]));
}
export function pageResult(result, operation, params) {
  if (operation === 'search') {
    // Android's search wrapper reports this page's length as the total. Leave an unknown total unknown.
    delete result.data.total;
  }
  if (operation === 'user_playlist' || operation === 'playlist_track_all') {
    const key = operation === 'user_playlist' ? 'lists' : 'songs';
    const all = result.data[key] || [];
    const limit = Math.min(100, Math.max(1, Number(params.pagesize) || 100));
    const offset = (Math.max(1, Number(params.page) || 1) - 1) * limit;
    const rows = all.slice(offset, offset + limit);
    result.data = { ...result.data, [key]: rows, ...(key === 'songs' ? { info: rows } : {}), total: all.length, count: all.length };
  }
  return result;
}
export async function userPlaylists() {
  const result = await handleKGUserPlaylists(await ensureKGCookie());
  if (!result.loggedIn) return { __foliaBridgeError: 'AUTH_REQUIRED', message: '酷狗登录已失效，请重新登录' };
  if (!result.playlists?.length && result.message) throw new Error(result.message);
  const lists = (result.playlists || []).map(item => ({
    listid: item.listId || item.id,
    global_collection_id: item.globalCollectionId || `collection_3_${result.userId}_${item.listId || item.id}_0`,
    name: item.name, listname: item.name, count: item.trackCount, img: item.cover,
    type: item.listType, source: Number(item.collectionSource) === 2 ? 2 : 1,
    ...(item.musiclib_id === undefined ? {} : { musiclib_id: item.musiclib_id }),
    create_userid: item.ownerId || result.userId, is_liked: item.isFavorite,
  }));
  return { status:1,error_code:0,data:{ lists,total:lists.length,count:lists.length } };
}
// Authenticated cloudlist pages retain fileid, which is required to remove the correct liked-song row.
export async function ownPlaylistPage(params) {
  const id = String(params.id || params.global_collection_id || '');
  const userId = kgCookieUserId(await ensureKGCookie());
  const match = id.match(/^collection_\d+_(\d+)_(\d+)_\d+$/);
  if (!userId || !match || match[1] !== String(userId)) return null;
  return handleKGPlaylistTracksNew({ listid: match[2], page: params.page, pagesize: params.pagesize }, await ensureKGCookie());
}
export async function legacyPlayInfo(params) {
  const url = new URL('https://m.kugou.com/app/i/getSongInfo.php');
  url.searchParams.set('cmd','playInfo'); url.searchParams.set('hash',String(params.hash || params.id || ''));
  const response = await fetch(url.toString(), { headers: { Referer: 'https://m.kugou.com/' } });
  if (!response.ok) throw new Error(`KuGou playInfo HTTP ${response.status}`);
  return response.json();
}
export async function songDetail(params) {
  const info = await legacyPlayInfo(params);
  return { status: 1, error_code: 0, data: { ...info, hash: info.hash || params.hash,
    SongName: info.songName || info.songname, SingerName: info.singerName || info.singername,
    AlbumName: info.albumName || info.albumname, AlbumID: info.albumid || info.album_id,
    cover: info.imgUrl || info.imgurl || info.img,
    album_audio_id: info.mixsongid || info.album_audio_id, Duration: info.timeLength || info.duration } };
}
export function mediaLinks(value) {
  const links = new Set();
  const visit = item => {
    if (typeof item === 'string' && /^https?:\/\//i.test(item)) links.add(item);
    else if (Array.isArray(item)) item.forEach(visit);
    else if (item && typeof item === 'object') Object.values(item).forEach(visit);
  };
  visit(value); return [...links].slice(0, 2048);
}
