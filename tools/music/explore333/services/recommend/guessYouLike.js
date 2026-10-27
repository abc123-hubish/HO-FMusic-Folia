import { QqApiError } from '../../protocol/errors.js';
import { isDictionary } from '../auth/values.js';
import { failureResult, okResult } from './newRouteResult.js';
import { createSessionMusicuClient } from './sessionMusicu.js';
const decode = (data) => {
    if (!isDictionary(data))
        throw new QqApiError('invalid-response');
    const { tracks, extras } = data;
    // 上游没有歌时给的是 null，和空数组同样当作「没有」；其他类型是格式变了。
    if (tracks !== null && tracks !== undefined && !Array.isArray(tracks))
        throw new QqApiError('invalid-response');
    return {
        tracks: Array.isArray(tracks) ? tracks : [],
        ...(Array.isArray(extras) ? { extras } : {}),
    };
};
export const GUESS_YOU_LIKE = {
    module: 'music.radioProxy.MbTrackRadioSvr',
    method: 'get_radio_track',
    // 实测可用的参数组；num 再大也只回 5 首。
    param: { id: 99, firstplay: 1, num: 15 },
    readOnly: true,
    operation: 'recommend.guess-you-like',
    decode,
};
/** 没有会话回 401（不把匿名结果当成个人推荐）；上游成功但没有歌回 422。 */
export const guessYouLikeResult = async (session, options = {}) => {
    try {
        if (!session)
            throw new QqApiError('auth-missing');
        const data = await createSessionMusicuClient(session, options).execute(GUESS_YOU_LIKE);
        if (!data.tracks.length)
            throw new QqApiError('not-found');
        // 条目原样交出去，由前端自己正规化。
        return okResult({ songs: data.tracks, ...(data.extras ? { extras: data.extras } : {}) });
    }
    catch (error) {
        return failureResult('get-guess-you-like', error);
    }
};
