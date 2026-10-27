import { playlistCategoriesResult, categoryPlaylistsResult, newSongsResult, toplistsResult,
  toplistSongsResult, newAlbumsResult } from './explore333/services/recommend/catalog.js';
import { radarResult } from './explore333/services/recommend/radar.js';
import { radioListResult, radioTracksResult } from './explore333/services/recommend/radio.js';
import { similarSongsResult } from './explore333/services/recommend/songRelations.js';
import { getQQCookie, qqCookieUin, qqCookieMusicKey } from './upstream/api/cookies.js';

// Read-only operations from the stable Explore adapter. Account state never leaves the native host.
const readers = {
  recommend_categories: () => playlistCategoriesResult(),
  recommend_category_playlists: (_session, params) => categoryPlaylistsResult(params),
  recommend_new_songs: (_session, params) => newSongsResult(params.area),
  recommend_new_albums: (_session, params) => newAlbumsResult(params),
  recommend_toplists: () => toplistsResult(),
  recommend_toplist: (_session, params) => toplistSongsResult(params),
  recommend_radar: (session, params) => radarResult(session, params.page),
  radio_list: session => radioListResult(session),
  radio_tracks: (session, params) => radioTracksResult(session, params.id),
  song_similar: (session, params) => similarSongsResult(session, params.id),
};
export const QQ_EXPLORE_OPERATIONS = Object.keys(readers);

/** Public catalogue requests stay anonymous; account-dependent readers use the retained login. */
export async function requestQqExplore(operation, params) {
  const cookie = await getQQCookie();
  const session = qqCookieUin(cookie) && qqCookieMusicKey(cookie) ? { credential: cookie } : null;
  return readers[operation](session, params);
}
