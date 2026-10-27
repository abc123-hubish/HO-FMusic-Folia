import React, { useEffect, useRef, useState } from 'react';
import type { ProbeDefinition } from './definition';
import { usePlaybackVisualizerBridge } from '../../src/hooks/usePlaybackVisualizerBridge';
import { usePlaybackStore } from '../../src/stores/usePlaybackStore';
import { currentTime, lyricCurrentTime } from '../../src/stores/motionSignals';
import { noteAudioSourceMetadata } from '../../src/services/onlineMusic/audioSourceMetadata';
import { PlayerState, type Line } from '../../src/types';
import { resolveLyricSeekMediaTime } from '../../src/utils/lyrics/lyricSeekTime';

// dev/probes/previewLyricClock.probe.tsx
// A real media element and the production clock bridge, with a synthetic provider-issued clip.
const lines: Line[] = [70, 75, 80, 85, 90, 95].map(time => ({ fullText: `Line ${time}`, startTime: time, endTime: time + 4.8, words: [] }));
function wave(): Blob {
    const length = 8000 * 31, bytes = new ArrayBuffer(44 + length * 2), data = new DataView(bytes);
    for (const [offset, text] of [[0, 'RIFF'], [8, 'WAVEfmt '], [36, 'data']] as const) for (let i = 0; i < text.length; i++) data.setUint8(offset + i, text.charCodeAt(i));
    data.setUint32(4, bytes.byteLength - 8, true); data.setUint32(16, 16, true); data.setUint16(20, 1, true); data.setUint16(22, 1, true);
    data.setUint32(24, 8000, true); data.setUint32(28, 16000, true); data.setUint16(32, 2, true); data.setUint16(34, 16, true); data.setUint32(40, length * 2, true);
    return new Blob([bytes], { type: 'audio/wav' });
}
const Probe: React.FC = () => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationFrameRef = useRef(0);
    const clockRef = useRef({ baseTimeSec: 0, startedAtMs: null, rate: 1, endTimeSec: 31, startTimeSec: 0 });
    const [readout, setReadout] = useState({ media: 0, lyric: 0, line: -1 });
    const [offset, setOffset] = useState(0);
    useEffect(() => {
        const url = URL.createObjectURL(wave());
        noteAudioSourceMetadata({ url, preview: true, clipStartMs: 76026, quality: 'standard', fetchedAt: Date.now() });
        usePlaybackStore.setState({ activePlaybackContext: 'main', playerState: PlayerState.PAUSED, duration: 31,
            currentSong: { id: 'preview-probe', name: 'Preview', artists: [], durationMs: 120000 } as any,
            lyrics: { lines, isWordByWord: false } });
        audioRef.current!.src = url;
        return () => { audioRef.current?.pause(); URL.revokeObjectURL(url); };
    }, []);
    usePlaybackVisualizerBridge({ audioRef, analyserRef, animationFrameRef, effectiveLoopMode: 'all', isNowPlayingStageActive: false,
        isPlayerCapStageActive: false, stageActiveEntryKind: null, stageLyricsSession: null, stageLyricsClockRef: clockRef as any,
        getSyntheticStageLyricsTime: () => 0, syncStageLyricsClock: () => {}, getNowPlayingDisplayTime: () => 0,
        getPlayerCapDisplayTime: () => 0, syncNowPlayingClock: () => {}, lyricTimelineOffsetMs: offset, isTransitionAudible: () => false });
    const sample = () => setReadout({ media: audioRef.current!.currentTime, lyric: lyricCurrentTime.get(), line: usePlaybackStore.getState().currentLineIndex });
    return <div><audio ref={audioRef} controls onSeeked={sample} onLoadedMetadata={sample} />
        <button onClick={() => { audioRef.current!.currentTime = 5; }}>Seek clip</button>
        <button onClick={() => setOffset(500)}>Offset</button>
        <button onClick={sample}>Sample</button>
        <button onClick={() => { const target = resolveLyricSeekMediaTime(85.526, { mediaTimeSec: audioRef.current!.currentTime,
            lyricTimeSec: lyricCurrentTime.get(), durationSec: 31 }); if (target !== null) audioRef.current!.currentTime = target; }}>Seek lyric</button>
        <output data-preview-clock>{JSON.stringify(readout)}</output>
        <span data-media-clock>{currentTime.get()}</span>
    </div>;
};
export default { id: 'previewLyricClock', title: 'Preview lyric clock', description: 'Full-song lyrics over a preview media clock', Component: Probe } satisfies ProbeDefinition;
