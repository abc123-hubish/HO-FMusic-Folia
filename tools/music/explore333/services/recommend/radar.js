import { QqApiError } from '../../protocol/errors.js';
import { dictionaryOf, isDictionary } from '../auth/values.js';
import { diagnose, failureResult, okResult } from './newRouteResult.js';
import { createSessionMusicuClient } from './sessionMusicu.js';
// src/services/recommend/radar.ts
//
// `/recommend/radar`：刷歌模式（客户端「雷达」）。有会话就带凭证，没有就匿名。Node 与 serverless 共用。
// 实测（2026-10）：`TrackRelationServer.GetRadarSong { Page, ReqType: 0, FavSongs: [], EntranceSongs: [] }`
// 匿名与带会话都回一页 10 首，歌在 `VecSongs[].Track`（和 `track_info` 同形）；带会话连读两页没有重复，
// `HasMore` 是布尔。
const MAX_PAGE = 100;
/** 和其他路由的分页参数一样宽松：不是正整数就是第 1 页，超过上限就压到上限。 */
export const radarPageOf = (raw) => {
    const value = Number.parseInt(String(raw ?? ''), 10);
    if (!Number.isSafeInteger(value) || value <= 0)
        return 1;
    return Math.min(MAX_PAGE, value);
};
const decode = (data) => {
    if (!isDictionary(data))
        throw new QqApiError('invalid-response');
    const { VecSongs: entries, HasMore: hasMore } = data;
    if (entries !== null && entries !== undefined && !Array.isArray(entries))
        throw new QqApiError('invalid-response');
    return { entries: Array.isArray(entries) ? entries : [], hasMore: hasMore === true };
};
const radarSongs = (page) => ({
    module: 'music.recommend.TrackRelationServer',
    method: 'GetRadarSong',
    param: { Page: page, ReqType: 0, FavSongs: [], EntranceSongs: [] },
    readOnly: true,
    operation: 'recommend.radar',
    decode,
});
/** 只交出有 mid 的完整曲目，原样不动；推荐理由的形状还没验过，先不给。 */
const toTrack = (entry) => {
    const track = dictionaryOf(entry).Track;
    if (!isDictionary(track))
        return null;
    return typeof track.mid === 'string' && track.mid.length > 0 ? track : null;
};
/**
 * 会话解不开时由宿主传 `null`，这里就匿名读；解得开但上游拒绝凭证时回 401，让前端清掉坏会话。
 * 上游给空列表回 422；给了条目却一首都读不出来回 502；`more` 只在上游明说 `HasMore: true` 时才是 true。
 */
export const radarResult = async (session, page, options = {}) => {
    try {
        const data = await createSessionMusicuClient(session, options).execute(radarSongs(page));
        if (!data.entries.length)
            throw new QqApiError('not-found');
        const songs = data.entries.map(toTrack).filter((item) => item !== null);
        if (!songs.length)
            throw new QqApiError('invalid-response');
        if (songs.length < data.entries.length)
            diagnose('get-radar', {
                status: 200,
                receivedEntries: data.entries.length,
                skippedEntries: data.entries.length - songs.length,
            });
        return okResult({ page, songs, more: data.hasMore });
    }
    catch (error) {
        return failureResult('get-radar', error);
    }
};
