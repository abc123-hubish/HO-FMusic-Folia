import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { SongResult } from '@/types';
import type { SmartBeatResult } from '@/services/beatFx/smartBeatTypes';
import { BEAT_ACCENTS_VERSION } from '@/services/analysis/beatAccents';
import model from '@/services/beatFx/modelManifest.json';

// test/unit/beatFx/smartBeatSource.test.ts
// Boundary tests use fake decoding/inference; real worker inference is exercised in the browser test.
const h = vi.hoisted(() => ({ cache: new Map<string, unknown>(), url: undefined as string | undefined,
    preview: false, duration: 180, localRevision: 1, analyse: vi.fn(), fetch: vi.fn(), save: vi.fn() }));
vi.mock('@/services/db', () => ({
    getFromCache: async (key: string) => h.cache.get(key),
    saveToCache: async (key: string, value: unknown) => { h.save(key, value); h.cache.set(key, value); },
    getLocalSong: async () => ({ nativeFileUrl: '/native/test.mp3', fileSize: 1024, fileLastModified: h.localRevision }),
}));
vi.mock('@/services/onlineMusic/resourceCache', () => ({ getCachedSongAudioBlob: async () => null }));
vi.mock('@/services/onlineMusic/omni', () => ({ omni: { isPreviewAudioSource: () => h.preview } }));
vi.mock('@/services/prefetchService', () => ({ getPrefetchedData: () => h.url ? { audioUrl: h.url } : null }));
vi.mock('@/services/beatFx/smartBeatClient', () => ({ analyseSmartBeat: h.analyse }));
import { loadSmartBeat, loadStoredSmartBeat, validSmartBeatResult } from '@/services/beatFx/smartBeatSource';

const song = { id: 'beat-test', durationMs: 180000, sourceRef: { kind: 'local', mediaId: 'beat-test' } } as SongResult;
const result = () => ({ schema: 1, model: model.sha256, duration: 180, beats: [0.5, 1, 1.5], downbeats: [0.5],
    accents: { v: BEAT_ACCENTS_VERSION, trackScale: 1, impact: [1, 1, 1], low: [1, 1, 1], mid: [0, 0, 0], high: [0, 0, 0], rhythmic: [1, 1, 1], pulse: [1, 1, 1] } }) as SmartBeatResult;
beforeEach(() => {
    vi.clearAllMocks(); h.cache.clear(); h.url = undefined; h.preview = false; h.duration = 180; h.localRevision = 1;
    h.analyse.mockResolvedValue(result()); h.fetch.mockImplementation(async () => new Response(new Uint8Array([1, 2, 3])));
    vi.stubGlobal('fetch', h.fetch);
    vi.stubGlobal('OfflineAudioContext', class { async decodeAudioData() { return {
        duration: h.duration, length: 32, numberOfChannels: 1, getChannelData: () => new Float32Array(32),
    }; } });
});
afterEach(() => vi.unstubAllGlobals());
describe('whole-track beat cache', () => {
    it('stores a valid full-track result and reopens it without decoding or inference', async () => {
        await loadSmartBeat(song, new AbortController().signal, vi.fn());
        expect(await loadStoredSmartBeat(song)).toEqual(result());
        expect(h.analyse).toHaveBeenCalledTimes(1); expect(h.fetch).toHaveBeenCalledTimes(1);
        h.localRevision++;
        expect(await loadStoredSmartBeat(song)).toBeNull();
    });
    it('skips recognised preview URLs before reading any audio', async () => {
        h.url = '/preview'; h.preview = true;
        await expect(loadSmartBeat(song, new AbortController().signal, vi.fn())).rejects.toThrow('preview');
        expect(h.fetch).not.toHaveBeenCalled(); expect(h.save).not.toHaveBeenCalled();
    });
    it('rejects a 30-second clip advertised as a complete song', async () => {
        h.duration = 30;
        await expect(loadSmartBeat(song, new AbortController().signal, vi.fn())).rejects.toThrow('partial-audio');
        expect(h.analyse).not.toHaveBeenCalled(); expect(h.save).not.toHaveBeenCalled();
    });
    it('does not cache a completed run after a track-change cancellation', async () => {
        const controller = new AbortController();
        h.analyse.mockImplementation(async () => { controller.abort(); return result(); });
        await expect(loadSmartBeat(song, controller.signal, vi.fn())).rejects.toThrow('Cancelled');
        expect(h.save).not.toHaveBeenCalled();
    });
    it('ignores obsolete models, wrong durations and unsorted beat lists', () => {
        expect(validSmartBeatResult({ ...result(), model: 'old' }, 180)).toBe(false);
        expect(validSmartBeatResult(result(), 210)).toBe(false);
        expect(validSmartBeatResult({ ...result(), beats: [1, 0.5, 2] }, 180)).toBe(false);
    });
    it('accepts explicitly labelled CPU results without treating them as model inference', () => {
        expect(validSmartBeatResult({ ...result(), model: 'cpu-spectral-onset-v1' }, 180)).toBe(true);
        expect(validSmartBeatResult({ ...result(), model: 'cpu-spectral-onset-v0' }, 180)).toBe(false);
    });
    it('uses the current song store URL when its prefetch entry is not ready', async () => {
        const online = { ...song, sourceRef: { kind: 'online', providerId: 'qq', mediaId: 'beat-test' } } as SongResult;
        await loadSmartBeat(online, new AbortController().signal, vi.fn(), 'https://audio.example/full.mp3');
        expect(h.fetch).toHaveBeenCalledWith('https://audio.example/full.mp3', expect.objectContaining({ signal: expect.any(AbortSignal) }));
    });
});
