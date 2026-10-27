import { QqApiError } from '../../protocol/errors.js';
import { credentialMusicId } from '../auth/androidDevice.js';
import { dictionaryOf, isDictionary, stringOf } from '../auth/values.js';
import { GUESS_YOU_LIKE } from './guessYouLike.js';
import { failureResult, okResult } from './newRouteResult.js';
import { createSessionMusicuClient } from './sessionMusicu.js';
// src/services/recommend/radio.ts
//
// `/radio/list` 与 `/radio/tracks`：QQ 的电台。两条都要先登录（没会话回 401）。Node 与 serverless 共用。
// 实测（2026-10，官方网页）：清单是 `pf.radiosvr/GetRadiolist`（分组 → `list[]` 电台）；猜你喜欢（id 99）
// 走 `get_radio_track`，其他电台走 `pf.radiosvr/GetRadiosonglist`，歌曲条目与 `track_info` 同形。
/** 猜你喜欢电台的 id；它有自己的接口和推荐理由。 */
const PERSONAL_RADIO_ID = 99;
const positiveIdOf = (value) => typeof value === 'number' && Number.isSafeInteger(value) && value > 0 ? value : undefined;
const countOf = (value) => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 ? value : undefined;
/** 只认纯数字的正整数，其他写法（小数、带字母、负数、0）一律是参数错误。 */
export const radioIdOf = (raw) => {
    const text = String(raw ?? '');
    if (!/^\d{1,15}$/.test(text))
        return undefined;
    return positiveIdOf(Number(text));
};
const decodeList = (data) => {
    if (!isDictionary(data))
        throw new QqApiError('invalid-response');
    const groups = data.radio_list;
    if (groups !== null && groups !== undefined && !Array.isArray(groups))
        throw new QqApiError('invalid-response');
    return { groups: Array.isArray(groups) ? groups : [] };
};
const radioList = (session) => ({
    module: 'pf.radiosvr',
    method: 'GetRadiolist',
    param: { uin: credentialMusicId(session.credential) },
    readOnly: true,
    operation: 'recommend.radio-list',
    decode: decodeList,
});
const toRadio = (entry) => {
    const radio = dictionaryOf(entry);
    const id = positiveIdOf(radio.id);
    if (id === undefined)
        return null;
    const listenNum = countOf(radio.listenNum);
    return {
        id,
        title: stringOf(radio.title),
        picurl: stringOf(radio.pic_url),
        ...(listenNum === undefined ? {} : { listenNum }),
    };
};
/** 分组没有可用 id 就跳过；电台同理。空分组（例如还没听过电台时的「最近」）照样保留。 */
const toGroup = (entry) => {
    const group = dictionaryOf(entry);
    const id = positiveIdOf(group.id);
    if (id === undefined)
        return null;
    const radios = Array.isArray(group.list) ? group.list.map(toRadio).filter(Boolean) : [];
    return { id, title: stringOf(group.title), radios };
};
/** 上游给空清单回 422；给了分组却一组都读不出来回 502。 */
export const radioListResult = async (session, options = {}) => {
    try {
        if (!session)
            throw new QqApiError('auth-missing');
        const data = await createSessionMusicuClient(session, options).execute(radioList(session));
        if (!data.groups.length)
            throw new QqApiError('not-found');
        const groups = data.groups.map(toGroup).filter(Boolean);
        if (!groups.length)
            throw new QqApiError('invalid-response');
        return okResult({ groups });
    }
    catch (error) {
        return failureResult('get-radio-list', error);
    }
};
const decodeSongs = (data) => {
    if (!isDictionary(data))
        throw new QqApiError('invalid-response');
    const tracks = data.track_list;
    if (tracks !== null && tracks !== undefined && !Array.isArray(tracks))
        throw new QqApiError('invalid-response');
    return { tracks: Array.isArray(tracks) ? tracks : [] };
};
const radioSongs = (id) => ({
    module: 'pf.radiosvr',
    method: 'GetRadiosonglist',
    // 网页实测的参数组：一次 9 首。
    param: { id, firstplay: 0, num: 9 },
    readOnly: true,
    operation: 'recommend.radio-tracks',
    decode: decodeSongs,
});
/**
 * 没会话先回 401，再检查 id。99 和猜你喜欢同一个接口、同样带推荐理由；其他电台没有 extras。
 * 歌曲条目原样交出去，由前端自己正规化；上游成功但没有歌回 422。
 */
export const radioTracksResult = async (session, rawId, options = {}) => {
    try {
        if (!session)
            throw new QqApiError('auth-missing');
        const id = radioIdOf(rawId);
        if (id === undefined)
            throw new QqApiError('input');
        const client = createSessionMusicuClient(session, options);
        if (id === PERSONAL_RADIO_ID) {
            const data = await client.execute(GUESS_YOU_LIKE);
            if (!data.tracks.length)
                throw new QqApiError('not-found');
            return okResult({ songs: data.tracks, ...(data.extras ? { extras: data.extras } : {}) });
        }
        const data = await client.execute(radioSongs(id));
        if (!data.tracks.length)
            throw new QqApiError('not-found');
        return okResult({ songs: data.tracks });
    }
    catch (error) {
        return failureResult('get-radio-tracks', error);
    }
};
