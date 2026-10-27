import React, { Suspense, useRef } from 'react';
import '../../src/i18n/config';
import SmartBeatSettingsCard from '../../src/components/visualizer/SmartBeatSettingsCard';
import { analyseSmartBeat, probeSmartBeat, getSmartBeatEngine } from '../../src/services/beatFx/smartBeatClient';
import { useSmartBeatStore } from '../../src/stores/useSmartBeatStore';
import type { ProbeDefinition } from './definition';
import { usePlaybackStore } from '../../src/stores/usePlaybackStore';
import { useVisualizerSettingsStore } from '../../src/stores/useVisualizerSettingsStore';
import { useThemeSettingsStore } from '../../src/stores/useThemeSettingsStore';
import { usePlaybackVisualizerBridge } from '../../src/hooks/usePlaybackVisualizerBridge';
import { getBeatFxEvents, isBeatFxReady } from '../../src/services/beatFx/beatFxLive';
import { beatImpact } from '../../src/stores/motionSignals';
import { PlayerState, type SongResult } from '../../src/types';
import { currentTime, audioPower, audioBands } from '../../src/stores/motionSignals';
import { DEFAULT_THEME } from '../../src/services/baseThemes';
import { getVisualizerRegistryEntry } from '../../src/components/visualizer/registry';

// dev/probes/smartBeat.probe.tsx
// Real worker/model probe; the GPU test never substitutes fixture beats for inference.
declare global { interface Window { __smartBeatProbe: {
    support: typeof probeSmartBeat;
    analyse: (seconds: number) => ReturnType<typeof analyseSmartBeat>;
    settings: () => ReturnType<typeof useSmartBeatStore.getState>['settings'];
    engine: typeof getSmartBeatEngine;
    playback: () => void;
    state: () => { status: string; note: string; ready: boolean; beats: number; impact: number; engine: string | null };
    instrumentStage: () => Promise<void>;
    stageScale: () => number;
}; } }
const makeRhythm = (seconds: number) => {
    const mono = new Float32Array(22050 * seconds);
    for (let i = 0; i < mono.length; i++) {
        const t = i / 22050, phase = t % 0.5;
        mono[i] = Math.sin(2 * Math.PI * 100 * t) * Math.exp(-phase * 30) * 0.7
            + Math.sin(2 * Math.PI * 1000 * t) * Math.exp(-phase * 90) * 0.2;
    }
    return mono;
};
const makeWav = (mono: Float32Array) => {
    const file = new ArrayBuffer(44 + mono.length * 2), view = new DataView(file);
    const chars = (at: number, text: string) => [...text].forEach((value, i) => view.setUint8(at + i, value.charCodeAt(0)));
    chars(0, 'RIFF'); view.setUint32(4, file.byteLength - 8, true); chars(8, 'WAVE'); chars(12, 'fmt ');
    view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
    view.setUint32(24, 22050, true); view.setUint32(28, 44100, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true);
    chars(36, 'data'); view.setUint32(40, mono.length * 2, true);
    mono.forEach((value, i) => view.setInt16(44 + i * 2, Math.round(value * 32767), true));
    return new Blob([file], { type: 'audio/wav' });
};
let playbackUrl: string | undefined;
let stageScale = () => 1;
window.__smartBeatProbe = {
    support: probeSmartBeat,
    settings: () => useSmartBeatStore.getState().settings,
    engine: getSmartBeatEngine,
    analyse: seconds => analyseSmartBeat(makeRhythm(seconds), new AbortController().signal),
    playback: () => {
        if (playbackUrl) URL.revokeObjectURL(playbackUrl);
        playbackUrl = URL.createObjectURL(makeWav(makeRhythm(35)));
        useVisualizerSettingsStore.setState({ visualizerMode: 'hanabi' });
        useThemeSettingsStore.setState({ staticMode: false });
        usePlaybackStore.setState({ currentSong: { id: 'smart-beat-flow', name: 'Rhythm', durationMs: 35000,
            sourceRef: { kind: 'online', providerId: 'qq', mediaId: 'smart-beat-flow' } } as SongResult,
            duration: 35, audioSrc: playbackUrl, playerState: PlayerState.PLAYING });
        useSmartBeatStore.getState().setMode('on');
    },
    state: () => { const state = useSmartBeatStore.getState(); return { status: state.status, note: state.note,
        engine: state.engine, ready: isBeatFxReady(), beats: getBeatFxEvents().length, impact: beatImpact.get() }; },
    instrumentStage: async () => {
        const { HanabiPixiRuntime } = await import('../../src/components/visualizer/hanabi/createHanabiPixiRuntime');
        const create = HanabiPixiRuntime.create;
        HanabiPixiRuntime.create = async options => {
            const runtime = await create(options);
            stageScale = () => (runtime as unknown as { sceneLayer: { scale: { x: number } } }).sceneLayer.scale.x;
            return runtime;
        };
    },
    stageScale: () => stageScale(),
};
const noop = () => {};
function SmartBeatProbe() {
    const audioRef = useRef<HTMLAudioElement | null>(null), analyserRef = useRef<AnalyserNode | null>(null), frame = useRef(0);
    const stageClock = useRef({ startTimeSec: 0, endTimeSec: 35, baseTimeSec: 0, startedAtMs: 0 });
    const src = usePlaybackStore(state => state.audioSrc);
    usePlaybackVisualizerBridge({ audioRef, analyserRef, animationFrameRef: frame, effectiveLoopMode: 'off',
        isNowPlayingStageActive: false, isPlayerCapStageActive: false, stageActiveEntryKind: null, stageLyricsSession: null,
        stageLyricsClockRef: stageClock, getSyntheticStageLyricsTime: () => 0, syncStageLyricsClock: noop,
        getNowPlayingDisplayTime: () => 0, getPlayerCapDisplayTime: () => 0, syncNowPlayingClock: noop,
        lyricTimelineOffsetMs: 0, isTransitionAudible: () => false });
    const visual = new URLSearchParams(location.search).has('visual') && !!src;
    return <><div className="pointer-events-none fixed inset-0">{visual && <Suspense fallback={null}>{getVisualizerRegistryEntry('hanabi').render({
        currentTime, currentLineIndex: 0, theme: DEFAULT_THEME, seed: 'cpu-beat-flow', paused: false,
        audioPower, audioBands, backgroundStaticMode: true,
        lines: [{ fullText: '兼容拍点 Rhythm', startTime: 0, endTime: 35, words: [{ text: '兼容拍点 Rhythm', startTime: 0, endTime: 35 }] }],
    })}</Suspense>}</div><div className="relative z-10 mx-auto max-w-xl rounded-xl bg-black/70 p-4 text-white"><SmartBeatSettingsCard />
        <button onClick={() => window.__smartBeatProbe.playback()}>Play complete rhythm</button>
        <audio ref={audioRef} src={src || undefined} autoPlay controls /></div></>;
}
export default { id: 'smartBeat', title: 'Smart beat', description: 'Worker capability, inference and persisted controls',
    Component: SmartBeatProbe } satisfies ProbeDefinition;
