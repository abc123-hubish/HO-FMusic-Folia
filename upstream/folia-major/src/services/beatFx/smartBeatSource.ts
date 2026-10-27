import type { SongResult } from '../../types';
import { getPlaybackSongKey, getPlaybackSourceRef } from '../../utils/appPlaybackGuards';
import { getLocalSong, getFromCache, saveToCache } from '../db';
import { getCachedSongAudioBlob } from '../onlineMusic/resourceCache';
import { omni } from '../onlineMusic/omni';
import { getPrefetchedData } from '../prefetchService';
import { isBeatAccents } from '../analysis/beatAccents';
import { analyseSmartBeat } from './smartBeatClient';
import type { SmartBeatResult } from './smartBeatTypes';
import modelInfo from './modelManifest.json';
import { CPU_BEAT_MODEL } from './smartBeatCpu';

// src/services/beatFx/smartBeatSource.ts
// Whole-track analysis only. A failed, expired or truncated stream must never become a permanent beat list.
const MAX_BYTES = 64 * 1024 * 1024;
export const smartBeatTrackKey = (song: SongResult) => `${getPlaybackSongKey(song)}:${song.durationMs || 0}`;
const cacheKey = async (song: SongResult) => {
    const source = getPlaybackSourceRef(song);
    const local = source.kind === 'local' ? await getLocalSong(source.mediaId) : undefined;
    const revision = local ? `:${local.fileSignature || ''}:${local.fileSize}:${local.fileLastModified || 0}` : '';
    return `beat_this_grid_harmony_v1_${smartBeatTrackKey(song)}${revision}`;
};
export const isSmartBeatPreview = (song: SongResult, currentUrl?: string | null): boolean => {
    const url = currentUrl || getPrefetchedData(song)?.audioUrl;
    return !!url && omni.isPreviewAudioSource(url);
};
export function validSmartBeatResult(value: unknown, duration?: number): value is SmartBeatResult {
    const result = value as SmartBeatResult | null;
    const times = (list: unknown): list is number[] => Array.isArray(list) && list.length < 30_000
        && list.every((time, i) => typeof time === 'number' && Number.isFinite(time) && time >= 0
            && time <= result!.duration + 1 && (i === 0 || time > list[i - 1]));
    return !!result && result.schema === 1 && [modelInfo.sha256, CPU_BEAT_MODEL].includes(result.model)
        && Number.isFinite(result.duration) && result.duration > 0 && result.duration <= 901
        && (!duration || Math.abs(result.duration - duration) <= Math.max(3, duration * 0.03))
        && times(result.beats) && times(result.downbeats) && isBeatAccents(result.accents, result.beats.length);
}
export async function loadStoredSmartBeat(song: SongResult): Promise<SmartBeatResult | null> {
    const result = await getFromCache<SmartBeatResult>(await cacheKey(song));
    return validSmartBeatResult(result, song.durationMs / 1000) ? result : null;
}
export async function loadSmartBeat(song: SongResult, signal: AbortSignal,
    onAnalysing: () => void, currentUrl?: string | null): Promise<SmartBeatResult> {
    // The prefetch entry belongs to this song. The media element may still hold the previous song.
    const url = currentUrl || getPrefetchedData(song)?.audioUrl;
    if (url && omni.isPreviewAudioSource(url)) throw new Error('preview');
    const key = await cacheKey(song);
    let blob: Blob | null = await getCachedSongAudioBlob(song);
    if (!blob) {
        const source = getPlaybackSourceRef(song);
        const local = source.kind === 'local' ? await getLocalSong(String(source.mediaId)) : undefined;
        if (local?.fileHandle) blob = await local.fileHandle.getFile();
        const address = local?.nativeFileUrl || url;
        if (!blob) {
            if (!address || address === 'CACHED_IN_DB') throw new Error('no-audio');
            const response = await fetch(address, { signal });
            const declared = Number(response.headers.get('content-length'));
            if (!response.ok || response.status === 206 || declared > MAX_BYTES) throw new Error('audio-unavailable');
            const reader = response.body?.getReader();
            if (reader) {
                const chunks: Uint8Array<ArrayBuffer>[] = []; let length = 0;
                while (true) {
                    const next = await reader.read(); if (next.done) break;
                    length += next.value.length;
                    if (length > MAX_BYTES) { await reader.cancel(); throw new Error('audio-too-large'); }
                    chunks.push(next.value);
                }
                blob = new Blob(chunks, { type: response.headers.get('content-type') || 'audio/mpeg' });
            } else blob = await response.blob();
        }
    }
    if (signal.aborted) throw new DOMException('Cancelled', 'AbortError');
    if (blob.size > MAX_BYTES || !blob.size) throw new Error('audio-too-large');
    const decoder = new OfflineAudioContext(1, 1, 22050);
    const decoded = await decoder.decodeAudioData(await blob.arrayBuffer());
    if (signal.aborted) throw new DOMException('Cancelled', 'AbortError');
    const expected = song.durationMs / 1000;
    if (!Number.isFinite(expected) || expected <= 0) throw new Error('unknown-duration');
    if (decoded.duration > 900 || (expected > 0 && Math.abs(decoded.duration - expected) > Math.max(3, expected * 0.03))) throw new Error('partial-audio');
    const mono = new Float32Array(decoded.length);
    for (let channel = 0; channel < decoded.numberOfChannels; channel++) {
        const values = decoded.getChannelData(channel);
        for (let i = 0; i < mono.length; i++) mono[i] += values[i] / decoded.numberOfChannels;
    }
    onAnalysing();
    const result = await analyseSmartBeat(mono, signal);
    if (!validSmartBeatResult(result, expected)) throw new Error('invalid-analysis');
    if (signal.aborted) throw new DOMException('Cancelled', 'AbortError');
    await saveToCache(key, result);
    return result;
}
