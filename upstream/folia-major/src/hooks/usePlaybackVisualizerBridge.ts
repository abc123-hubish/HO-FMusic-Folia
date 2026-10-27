import { useCallback, useEffect, useMemo, useRef } from 'react';
import { omni } from '../services/onlineMusic/omni';
import type { MutableRefObject } from 'react';
import type { MotionValue } from 'framer-motion';
import { createActiveLineLookup } from '../utils/lyrics/activeLineLookup';
import { PlayerState } from '../types';
import type { AudioBands, LyricData } from '../types';
import { setCurrentLineIndex, setPlayerState } from '../stores/usePlaybackStore';
import { selectDisplayLyrics, usePlaybackStore } from '../stores/usePlaybackStore';
import { audioBands, audioPower, currentTime, lyricCurrentTime } from '../stores/motionSignals';
import { isAppVisible, subscribeAppVisibility } from '../services/appVisibility';
import { useSmartBeatTrack } from './useSmartBeatTrack';
import { tickBeatFx } from '../services/beatFx/beatFxLive';

// src/hooks/usePlaybackVisualizerBridge.ts

const EMPTY_SPECTRUM = new Uint8Array(0);

const getBandEnergy = (data: Uint8Array, minHz: number, maxHz: number): number => {
    const start = Math.floor(minHz / 21.5);
    const end = Math.floor(maxHz / 21.5);
    let sum = 0;
    for (let index = start; index <= end; index += 1) sum += data[index];
    const count = end - start + 1;
    return count > 0 ? sum / count : 0;
};

const processBandEnergy = (value: number, boost: number) => Math.pow(value / 255, boost) * 255;

type UsePlaybackVisualizerBridgeParams = {

    audioRef: MutableRefObject<HTMLAudioElement | null>;
    analyserRef: MutableRefObject<AnalyserNode | null>;
    animationFrameRef: MutableRefObject<number>;
    effectiveLoopMode: 'off' | 'all' | 'one';
    isNowPlayingStageActive: boolean;
    isPlayerCapStageActive: boolean;
    stageActiveEntryKind: string | null;
    stageLyricsSession: unknown;
    stageLyricsClockRef: MutableRefObject<{
        startTimeSec: number;
        endTimeSec: number;
        baseTimeSec: number;
        startedAtMs: number | null;
    }>;
    getSyntheticStageLyricsTime: () => number;
    syncStageLyricsClock: (timeSec: number, endTimeSec: number, nextPlayerState: PlayerState, startTimeSec?: number) => void;
    getNowPlayingDisplayTime: () => number;
    getPlayerCapDisplayTime: () => number;
    syncNowPlayingClock: (progressSec: number, durationSec: number, paused: boolean) => void;
    lyricTimelineOffsetMs: number;
    /** True while an automix handover is in progress and a deck other than the active one sounds. */
    isTransitionAudible: () => boolean;
    /**
     * The deck the on-screen track is playing on while a transition holds the picture, else null.
     *
     * The clock below has to follow whatever is on screen. From the moment a blend arms, the
     * active deck is seconds into the NEXT track while the title, cover and lyrics still belong to
     * the one finishing - so reading the active deck here puts the progress bar and the lyric
     * read-head near zero under a song that is three minutes in.
     */
    getDisplayElement?: () => HTMLAudioElement | null;
};

// Runs the requestAnimationFrame loop for audio-reactive visuals and lyric timing.
export function usePlaybackVisualizerBridge({
    audioRef,
    analyserRef,
    animationFrameRef,
    effectiveLoopMode,
    isNowPlayingStageActive,
    isPlayerCapStageActive,
    stageActiveEntryKind,
    stageLyricsSession,
    stageLyricsClockRef,
    getSyntheticStageLyricsTime,
    syncStageLyricsClock,
    getNowPlayingDisplayTime,
    getPlayerCapDisplayTime,
    syncNowPlayingClock,
    lyricTimelineOffsetMs,
    isTransitionAudible,
    getDisplayElement,
}: UsePlaybackVisualizerBridgeParams) {
    useSmartBeatTrack(audioRef);
    // Read here rather than passed in: store fields and the module-level motion signals.
    const activePlaybackContext = usePlaybackStore(state => state.activePlaybackContext);
    const playerState = usePlaybackStore(state => state.playerState);
    const duration = usePlaybackStore(state => state.duration);
    // The lyrics on screen, matching the deck getDisplayElement points at.
    const lyrics = usePlaybackStore(selectDisplayLyrics);
    const findActiveLine = useMemo(() => createActiveLineLookup(lyrics?.lines ?? []), [lyrics]);

    const currentLineIndexRef = useRef(-1);
    const spectrumBuffersRef = useRef<{ front: Uint8Array<ArrayBuffer>; back: Uint8Array<ArrayBuffer> } | null>(null);
    // Cache the origin per URL; registry version also handles a reused URL with changed metadata.
    const clipCache = useRef({ version: -1, values: new Map<string, number>() });
    const lyricClipStartSec = useCallback((element: HTMLAudioElement | null): number => {
        const src = element?.currentSrc || element?.src;
        if (!src) return 0;
        const version = omni.audioSourceMetadataVersion();
        const cache = clipCache.current;
        if (cache.version !== version) { cache.values.clear(); cache.version = version; }
        const held = cache.values.get(src);
        if (held !== undefined) return held;
        const seconds = omni.previewClipStartMsOfAudioSource(src) / 1000;
        if (cache.values.size >= 8) cache.values.clear();
        cache.values.set(src, seconds);
        return seconds;
    }, []);

    // A restored or seeked paused clip needs the correct lyric read-head before its first RAF.
    const pausedSync = useRef({ lyrics, lyricTimelineOffsetMs, ownsClock: activePlaybackContext !== 'stage' && !isNowPlayingStageActive && !isPlayerCapStageActive });
    pausedSync.current = { lyrics, lyricTimelineOffsetMs, ownsClock: activePlaybackContext !== 'stage' && !isNowPlayingStageActive && !isPlayerCapStageActive };
    useEffect(() => {
        const sync = (event?: Event) => {
            const element = audioRef.current;
            if (!element || !element.paused || (event && event.target !== element) || !pausedSync.current.ownsClock || getDisplayElement?.()) return;
            const time = element.currentTime + lyricClipStartSec(element) - pausedSync.current.lyricTimelineOffsetMs / 1000;
            lyricCurrentTime.set(time);
            const index = createActiveLineLookup(pausedSync.current.lyrics?.lines ?? [])(time);
            if (index !== currentLineIndexRef.current) { currentLineIndexRef.current = index; setCurrentLineIndex(index); }
        };
        sync();
        document.addEventListener('loadedmetadata', sync, true);
        document.addEventListener('seeked', sync, true);
        return () => { document.removeEventListener('loadedmetadata', sync, true); document.removeEventListener('seeked', sync, true); };
    }, [audioRef, getDisplayElement, lyricClipStartSec, lyrics, lyricTimelineOffsetMs, playerState]);

    const updateAudioVisuals = useCallback(() => {
        // Normally the active deck; the outgoing one for as long as a blend holds the picture on
        // the track it is finishing, so that clock and picture never describe different songs.
        const audioElement = getDisplayElement?.() ?? audioRef.current;
        const isActuallyPlaying = Boolean(audioElement && !audioElement.paused && !audioElement.ended);
        // Mid-handover a deck can be loading while the other one is still sounding. The analyser
        // is downstream of both, so it has real signal: dropping to the idle breath here would put
        // a visible stutter at exactly the moment meant to be seamless.
        const hasAudibleSignal = isActuallyPlaying || isTransitionAudible();

        if (hasAudibleSignal && analyserRef.current) {
            const bufferLength = analyserRef.current.frequencyBinCount;
            let buffers = spectrumBuffersRef.current;
            if (!buffers || buffers.front.length !== bufferLength) {
                buffers = { front: new Uint8Array(bufferLength), back: new Uint8Array(bufferLength) };
                spectrumBuffersRef.current = buffers;
            }
            // Alternate identities so MotionValue subscribers still fire without allocating per frame.
            const dataArray = buffers.front;
            buffers.front = buffers.back;
            buffers.back = dataArray;
            analyserRef.current.getByteFrequencyData(dataArray);
            audioBands.spectrum?.set(dataArray);

            const bass = getBandEnergy(dataArray, 20, 150);
            const lowMid = getBandEnergy(dataArray, 150, 400);
            const mid = getBandEnergy(dataArray, 400, 1200);
            const vocal = getBandEnergy(dataArray, 1000, 3500);
            const treble = getBandEnergy(dataArray, 3500, 12000);

            audioPower.set(processBandEnergy((bass + lowMid) / 2, 3));
            audioBands.bass.set(processBandEnergy(bass, 1.8));
            audioBands.lowMid.set(processBandEnergy(lowMid, 2));
            audioBands.mid.set(processBandEnergy(mid, 2));
            audioBands.vocal.set(processBandEnergy(vocal, 1.5));
            audioBands.treble.set(processBandEnergy(treble, 2));
        } else {
            const time = Date.now() / 2000;
            const breath = (Math.sin(time) + 1) * 20;
            audioPower.set(breath);
            audioBands.bass.set(breath);
            audioBands.lowMid.set(breath);
            audioBands.mid.set(breath);
            audioBands.vocal.set(breath);
            audioBands.treble.set(breath);
            if (audioBands.spectrum && audioBands.spectrum.get().length !== 0) {
                audioBands.spectrum.set(EMPTY_SPECTRUM);
            }
        }
    }, [analyserRef, audioRef, getDisplayElement, isTransitionAudible]);

    // Playback progress must survive suspended RAF; lyric/FFT updates are only useful while visible.
    const updatePlaybackClock = useCallback((updateVisuals: boolean) => {
        const audioElement = getDisplayElement?.() ?? audioRef.current;
        if (updateVisuals) tickBeatFx(audioElement, analyserRef.current?.context);
        const isActuallyPlaying = Boolean(audioElement && !audioElement.paused && !audioElement.ended);
        if (isActuallyPlaying && audioElement) {
            const time = audioElement.currentTime;
            currentTime.set(time);

            const effectiveLyricTime = time + lyricClipStartSec(audioElement) - lyricTimelineOffsetMs / 1000;
            if (updateVisuals) lyricCurrentTime.set(effectiveLyricTime);

            if (updateVisuals && lyrics) {
                const foundIndex = findActiveLine(effectiveLyricTime);
                if (foundIndex !== currentLineIndexRef.current) {
                    currentLineIndexRef.current = foundIndex;
                    setCurrentLineIndex(foundIndex);
                }
            }
        } else if (isNowPlayingStageActive) {
            const nextTime = getNowPlayingDisplayTime();
            const hasReachedEnd = playerState === PlayerState.PLAYING && duration > 0 && nextTime >= duration;

            currentTime.set(nextTime);

            const effectiveLyricTime = nextTime - lyricTimelineOffsetMs / 1000;
            if (updateVisuals) lyricCurrentTime.set(effectiveLyricTime);

            if (updateVisuals && lyrics) {
                const foundIndex = findActiveLine(effectiveLyricTime);
                if (foundIndex !== currentLineIndexRef.current) {
                    currentLineIndexRef.current = foundIndex;
                    setCurrentLineIndex(foundIndex);
                }
            } else if (updateVisuals && currentLineIndexRef.current !== -1) {
                currentLineIndexRef.current = -1;
                setCurrentLineIndex(-1);
            }

            if (hasReachedEnd) {
                if (effectiveLoopMode === 'one' || effectiveLoopMode === 'all') {
                    syncNowPlayingClock(0, duration, false);
                    currentTime.set(0);
                    if (updateVisuals && lyrics) {
                        const restartedLineIndex = findActiveLine(0);
                        if (restartedLineIndex !== currentLineIndexRef.current) {
                            currentLineIndexRef.current = restartedLineIndex;
                            setCurrentLineIndex(restartedLineIndex);
                        }
                    }
                } else {
                    syncNowPlayingClock(duration, duration, true);
                    setPlayerState(PlayerState.PAUSED);
                }
            }
        } else if (isPlayerCapStageActive) {
            // PlayerCap: clock extrapolated from progress×duration; a passive source, looping/ending is driven by the external player, so no end/loop handling here.
            const nextTime = getPlayerCapDisplayTime();
            currentTime.set(nextTime);

            const effectiveLyricTime = nextTime - lyricTimelineOffsetMs / 1000;
            if (updateVisuals) lyricCurrentTime.set(effectiveLyricTime);

            if (updateVisuals && lyrics) {
                const foundIndex = findActiveLine(effectiveLyricTime);
                if (foundIndex !== currentLineIndexRef.current) {
                    currentLineIndexRef.current = foundIndex;
                    setCurrentLineIndex(foundIndex);
                }
            } else if (updateVisuals && currentLineIndexRef.current !== -1) {
                currentLineIndexRef.current = -1;
                setCurrentLineIndex(-1);
            }
        } else if (activePlaybackContext === 'stage' && stageActiveEntryKind === 'lyrics' && stageLyricsSession && lyrics) {
            const nextTime = getSyntheticStageLyricsTime();
            const clock = stageLyricsClockRef.current;
            const hasReachedEnd = playerState === PlayerState.PLAYING && nextTime >= clock.endTimeSec;

            currentTime.set(nextTime);

            if (updateVisuals) {
                const foundIndex = findActiveLine(nextTime);
                if (foundIndex !== currentLineIndexRef.current) {
                    currentLineIndexRef.current = foundIndex;
                    setCurrentLineIndex(foundIndex);
                }
            }

            if (hasReachedEnd) {
                if (effectiveLoopMode === 'one' || effectiveLoopMode === 'all') {
                    syncStageLyricsClock(clock.startTimeSec, clock.endTimeSec, PlayerState.PLAYING, clock.startTimeSec);
                    currentTime.set(clock.startTimeSec);
                    if (updateVisuals) {
                        const restartedLineIndex = findActiveLine(clock.startTimeSec);
                        if (restartedLineIndex !== currentLineIndexRef.current) {
                            currentLineIndexRef.current = restartedLineIndex;
                            setCurrentLineIndex(restartedLineIndex);
                        }
                    }
                } else {
                    syncStageLyricsClock(clock.endTimeSec, clock.endTimeSec, PlayerState.PAUSED, clock.startTimeSec);
                    setPlayerState(PlayerState.PAUSED);
                }
            }
        }
    }, [
        activePlaybackContext,
        analyserRef,
        audioRef,
        currentTime,
        duration,
        effectiveLoopMode,
        findActiveLine,
        getNowPlayingDisplayTime,
        getPlayerCapDisplayTime,
        getSyntheticStageLyricsTime,
        isNowPlayingStageActive,
        isPlayerCapStageActive,
        lyrics,
        playerState,
        setCurrentLineIndex,
        setPlayerState,
        stageActiveEntryKind,
        stageLyricsClockRef,
        stageLyricsSession,
        syncNowPlayingClock,
        syncStageLyricsClock,
        lyricTimelineOffsetMs,
        lyricCurrentTime,
        lyricClipStartSec,
        isTransitionAudible,
        getDisplayElement,
    ]);

    const updateLoop = useCallback(() => {
        if (!isAppVisible()) return;
        updatePlaybackClock(true);
        updateAudioVisuals();
        const element = getDisplayElement?.() ?? audioRef.current;
        // A pause may still be fading the real element for 200ms; let that sound finish before
        // sleeping. Synthetic stage clocks instead use the transport state and must keep ticking.
        const hasRunningClock = playerState === PlayerState.PLAYING || isTransitionAudible()
            || Boolean(element && !element.paused && !element.ended);
        animationFrameRef.current = hasRunningClock ? requestAnimationFrame(updateLoop) : 0;
    }, [animationFrameRef, audioRef, getDisplayElement, isTransitionAudible, playerState, updateAudioVisuals, updatePlaybackClock]);

    useEffect(() => {
        let backgroundTimer: number | undefined;
        const stop = () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = 0;
            window.clearInterval(backgroundTimer);
            backgroundTimer = undefined;
        };
        const syncVisibility = () => {
            stop();
            const visible = isAppVisible();
            // Align the visual clock before the first resumed frame, without replaying hidden frames.
            updatePlaybackClock(visible);
            if (visible) animationFrameRef.current = requestAnimationFrame(updateLoop);
            else if (playerState === PlayerState.PLAYING || isTransitionAudible()) {
                backgroundTimer = window.setInterval(() => updatePlaybackClock(false), 1000);
            }
        };
        const unsubscribe = subscribeAppVisibility(syncVisibility);
        syncVisibility();
        return () => {
            unsubscribe();
            stop();
        };
    }, [animationFrameRef, isTransitionAudible, playerState, updateLoop, updatePlaybackClock]);
}
