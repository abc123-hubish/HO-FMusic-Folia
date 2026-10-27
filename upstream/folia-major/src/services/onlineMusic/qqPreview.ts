import { toSafePlaybackUrl } from '../../utils/appPlaybackHelpers';
import { OnlineProviderError, type ProviderAudioSource } from '../../types/onlineMusic';
import { requestQq } from './qqTransport';

// src/services/onlineMusic/qqPreview.ts
// Read an explicitly marked preview only after the standard full-song tier was answered empty.
export const requestQqPreviewSource = async (songmid: string, mediaId: string): Promise<ProviderAudioSource | null> => {
    let response: any;
    try { response = await requestQq<any>('music_play', { songmid, ...(mediaId ? { mediaId } : {}), preview: 1 }); }
    catch (error) {
        if (error instanceof OnlineProviderError && error.code === 'unsupported') return null;
        throw error;
    }
    const entries = response?.data?.playUrl;
    const entry = entries && typeof entries === 'object' ? entries[songmid] ?? Object.values(entries)[0] as any : null;
    const url = toSafePlaybackUrl(String(entry?.url || ''));
    if (!url) return null;
    if (entry.preview !== true) return { url, fetchedAt: Date.now(), quality: 'standard' };
    let start = Number(entry.clipStartMs);
    if (entry.clipStartMs === undefined || !Number.isFinite(start) || start < 0) {
        // Old remote APIs mark the preview but omit its origin; detail uses milliseconds (try_begin).
        try {
            const detail = await requestQq<any>('song_info', { songmid });
            const file = detail?.response?.songinfo?.data?.track_info?.file;
            const begin = Number(file?.try_begin), end = Number(file?.try_end);
            start = Number.isSafeInteger(begin) && begin >= 0 && Number.isSafeInteger(end) && end > begin ? begin : 0;
        } catch { start = 0; }
    }
    return { url, fetchedAt: Date.now(), quality: 'standard', preview: true, clipStartMs: start };
};
