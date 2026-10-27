import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PlayerState } from '@/types';
import { setAppForeground } from '@/services/appVisibility';

// test/unit/hooks/usePlaybackVisualizerVisibility.test.ts
// Exercise the real visualizer bridge with a controllable audio clock and no browser RAF auto-throttling.
const harness = vi.hoisted(() => {
    const signal = (initial: unknown = 0) => {
        let value = initial;
        return { set: vi.fn((next: unknown) => { value = next; }), get: () => value };
    };
    return {
        effects: [] as (() => (() => void))[],
        state: { activePlaybackContext: 'main', playerState: 'PLAYING', duration: 180,
            lyrics: { lines: [
                { startTime: 0, endTime: 10, fullText: 'first', words: [] },
                { startTime: 10, endTime: 20, fullText: 'second', words: [] },
            ] } },
        setCurrentLineIndex: vi.fn(), setPlayerState: vi.fn(),
        currentTime: signal(), lyricCurrentTime: signal(), audioPower: signal(),
        audioBands: { spectrum: signal(new Uint8Array(0)), bass: signal(), lowMid: signal(),
            mid: signal(), vocal: signal(), treble: signal() },
    };
});
vi.mock('react', () => ({
    useCallback: (callback: unknown) => callback,
    useMemo: (factory: () => unknown) => factory(),
    useRef: (value: unknown) => ({ current: value }),
    useEffect: (effect: () => (() => void)) => { harness.effects.push(effect); },
}));
vi.mock('@/hooks/useSmartBeatTrack', () => ({ useSmartBeatTrack: vi.fn() }));
vi.mock('@/services/beatFx/beatFxLive', () => ({ tickBeatFx: vi.fn() }));
vi.mock('@/stores/usePlaybackStore', () => ({
    usePlaybackStore: (selector: (state: typeof harness.state) => unknown) => selector(harness.state),
    selectDisplayLyrics: (state: typeof harness.state) => state.lyrics,
    setCurrentLineIndex: harness.setCurrentLineIndex, setPlayerState: harness.setPlayerState,
}));
vi.mock('@/stores/motionSignals', () => ({ currentTime: harness.currentTime, lyricCurrentTime: harness.lyricCurrentTime,
    audioPower: harness.audioPower, audioBands: harness.audioBands }));

const { usePlaybackVisualizerBridge } = await import('@/hooks/usePlaybackVisualizerBridge');
let frames: Map<number, FrameRequestCallback>;
let nextFrame: number;
let cleanup: (() => void) | undefined;
let audio: { currentTime: number; paused: boolean; ended: boolean; play: ReturnType<typeof vi.fn>; pause: ReturnType<typeof vi.fn> };
let analyser: { frequencyBinCount: number; getByteFrequencyData: ReturnType<typeof vi.fn> };

const mount = (overrides: Partial<Parameters<typeof usePlaybackVisualizerBridge>[0]> = {}) => {
    usePlaybackVisualizerBridge({
        audioRef: { current: audio as unknown as HTMLAudioElement },
        analyserRef: { current: analyser as unknown as AnalyserNode }, animationFrameRef: { current: 0 },
        effectiveLoopMode: 'off', isNowPlayingStageActive: false, isPlayerCapStageActive: false,
        stageActiveEntryKind: null, stageLyricsSession: null,
        stageLyricsClockRef: { current: { startTimeSec: 0, endTimeSec: 20, baseTimeSec: 0, startedAtMs: 0 } },
        getSyntheticStageLyricsTime: () => 0, syncStageLyricsClock: vi.fn(),
        getNowPlayingDisplayTime: () => 0, getPlayerCapDisplayTime: () => 0, syncNowPlayingClock: vi.fn(),
        lyricTimelineOffsetMs: 0, isTransitionAudible: () => false, ...overrides,
    });
    cleanup = harness.effects.pop()!();
};
const frame = (time = 1000) => {
    const pending = [...frames.values()];
    frames.clear();
    pending.forEach(callback => callback(time));
};

beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    frames = new Map(); nextFrame = 0;
    vi.stubGlobal('window', { setInterval, clearInterval });
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => { frames.set(++nextFrame, callback); return nextFrame; });
    vi.stubGlobal('cancelAnimationFrame', (handle: number) => { frames.delete(handle); });
    setAppForeground(true);
    harness.effects.length = 0;
    harness.state.playerState = PlayerState.PLAYING;
    harness.state.activePlaybackContext = 'main';
    audio = { currentTime: 2, paused: false, ended: false, play: vi.fn(), pause: vi.fn() };
    analyser = { frequencyBinCount: 1024, getByteFrequencyData: vi.fn((buffer: Uint8Array) => { buffer.fill(10); }) };
});
afterEach(() => {
    cleanup?.(); cleanup = undefined;
    setAppForeground(true);
    vi.unstubAllGlobals(); vi.useRealTimers();
});

describe('background playback visual work', () => {
    it('draws a paused foreground once without continuously producing idle audio signals', () => {
        harness.state.playerState = PlayerState.PAUSED; audio.paused = true;
        mount(); frame();
        const writes = harness.audioPower.set.mock.calls.length;
        expect(frames.size).toBe(0);
        expect(analyser.getByteFrequencyData).not.toHaveBeenCalled();
        frame(); frame();
        expect(harness.audioPower.set.mock.calls.length).toBe(writes);
    });

    it('finishes audible pause fading before sleeping instead of freezing it immediately', () => {
        harness.state.playerState = PlayerState.PAUSED;
        mount(); frame();
        expect(frames.size).toBe(1);
        audio.paused = true; frame();
        expect(frames.size).toBe(0);
    });

    it('keeps music progress ticking without FFT, lyric updates, or audio transport calls', () => {
        setAppForeground(false); mount();
        expect(frames.size).toBe(0);
        audio.currentTime = 8;
        vi.advanceTimersByTime(1000);
        expect(harness.currentTime.get()).toBe(8);
        expect(analyser.getByteFrequencyData).not.toHaveBeenCalled();
        expect(harness.lyricCurrentTime.set).not.toHaveBeenCalled();
        expect(harness.setCurrentLineIndex).not.toHaveBeenCalled();
        expect(audio.play).not.toHaveBeenCalled(); expect(audio.pause).not.toHaveBeenCalled();
    });

    it('aligns resumed lyrics immediately and never duplicates loops across repeated switches', () => {
        mount(); frame();
        expect(analyser.getByteFrequencyData).toHaveBeenCalledTimes(1);
        for (let index = 0; index < 5; index++) {
            setAppForeground(false);
            expect(frames.size).toBe(0); expect(vi.getTimerCount()).toBe(1);
            audio.currentTime = 12 + index;
            vi.advanceTimersByTime(1000);
            setAppForeground(true);
            expect(harness.lyricCurrentTime.get()).toBe(audio.currentTime);
            expect(harness.setCurrentLineIndex).toHaveBeenLastCalledWith(1);
            expect(frames.size).toBe(1); expect(vi.getTimerCount()).toBe(0);
        }
        expect(analyser.getByteFrequencyData).toHaveBeenCalledTimes(1);
        frame(); expect(analyser.getByteFrequencyData).toHaveBeenCalledTimes(2);
        cleanup?.(); cleanup = undefined;
        expect(frames.size).toBe(0); expect(vi.getTimerCount()).toBe(0);
    });

    it('tracks the displayed outgoing deck during a background automix handover', () => {
        setAppForeground(false);
        const outgoing = { ...audio, currentTime: 95 };
        mount({ getDisplayElement: () => outgoing as unknown as HTMLAudioElement, isTransitionAudible: () => true });
        outgoing.currentTime = 96;
        vi.advanceTimersByTime(1000);
        expect(harness.currentTime.get()).toBe(96);
        expect(analyser.getByteFrequencyData).not.toHaveBeenCalled();
    });

    it('does not install a periodic background clock while paused', () => {
        harness.state.playerState = PlayerState.PAUSED; audio.paused = true;
        setAppForeground(false); mount();
        expect(vi.getTimerCount()).toBe(0); expect(frames.size).toBe(0);
    });

    it('preserves lyric-only stage looping without the visual frame loop', () => {
        harness.state.activePlaybackContext = 'stage'; audio.paused = true;
        setAppForeground(false);
        const syncStage = vi.fn();
        mount({ stageActiveEntryKind: 'lyrics', stageLyricsSession: {}, effectiveLoopMode: 'one',
            getSyntheticStageLyricsTime: () => 21, syncStageLyricsClock: syncStage });
        expect(syncStage).toHaveBeenCalledWith(0, 20, PlayerState.PLAYING, 0);
        expect(harness.currentTime.get()).toBe(0);
        expect(harness.setCurrentLineIndex).not.toHaveBeenCalled(); expect(frames.size).toBe(0);
    });

    it('reuses two spectrum buffers with alternating identities and handles analyser resizing', () => {
        mount();
        frame(); frame(); frame();
        const buffers = analyser.getByteFrequencyData.mock.calls.map(([buffer]) => buffer);
        expect(buffers[0]).not.toBe(buffers[1]); expect(buffers[0]).toBe(buffers[2]);
        analyser.frequencyBinCount = 512;
        frame();
        expect(analyser.getByteFrequencyData.mock.calls[3][0]).toHaveLength(512);
        expect(analyser.getByteFrequencyData.mock.calls[3][0]).not.toBe(buffers[0]);
    });
});
