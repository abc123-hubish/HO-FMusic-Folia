import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useMotionValue } from 'framer-motion';
import ProgressBar from '../../src/components/ProgressBar';
import { DEFAULT_THEME } from '../../src/services/baseThemes';
import { getVisualizerRegistryEntry } from '../../src/components/visualizer/registry';
import { setGlowBlurQuantized } from '../../src/utils/glowBlurQuantize';
import type { Line, VisualizerMode } from '../../src/types';
import type { ProbeDefinition } from './definition';

// dev/probes/priorityUpdates.probe.tsx
// Real progress/lyric renderers with separate deterministic clocks; no provider requests or RAF mocks.
declare global {
    interface Window {
        __priorityUpdates: { time: (n: number) => void; visualTime: (n: number) => void;
            duration: (n: number) => void; lastSeek: () => number; ready: boolean };
    }
}
const lines: Line[] = [{ fullText: 'Echo 回声 tonight', startTime: 0, endTime: 15, isChorus: true,
    words: [{ text: 'Echo', startTime: 0, endTime: 5 }, { text: '回声', startTime: 5, endTime: 10 },
        { text: 'tonight', startTime: 10, endTime: 15 }] }];
function PriorityUpdatesProbe() {
    const time = useMotionValue(100), visualTime = useMotionValue(0.4), power = useMotionValue(60);
    const [duration, setDuration] = useState(240);
    const [mode, setMode] = useState<VisualizerMode>('classic');
    const lastSeek = useRef(-1);
    const audioBands = useMemo(() => ({ bass: power, lowMid: power, mid: power, vocal: power, treble: power }), [power]);
    useEffect(() => {
        setGlowBlurQuantized(false);
        window.__priorityUpdates = { time: n => time.set(n), visualTime: n => visualTime.set(n),
            duration: setDuration, lastSeek: () => lastSeek.current, ready: true };
        return () => { window.__priorityUpdates.ready = false; };
    }, [time, visualTime]);
    return <div className="fixed inset-0 bg-[#111827] text-white">
        <div className="relative z-50 space-y-3 bg-black p-4">
            <div data-testid="priority-progress"><ProgressBar currentTime={time} duration={duration}
                onSeek={n => { lastSeek.current = n; time.set(n); }} /></div>
            <div className="flex gap-3">{(['classic', 'partita', 'cadenza', 'monet'] as const).map(value =>
                <button key={value} onClick={() => setMode(value)}>{value}</button>)}</div>
        </div>
        <div className="absolute inset-x-0 bottom-0 top-28" data-testid="priority-visual" data-mode={mode}>
            <Suspense fallback={null}>{getVisualizerRegistryEntry(mode).render({
                currentTime: visualTime, currentLineIndex: 0, lines, theme: DEFAULT_THEME,
                audioPower: power, audioBands, backgroundStaticMode: true, seed: 'priority-updates',
            })}</Suspense>
        </div>
    </div>;
}
export default { id: 'priorityUpdates', title: 'Upstream priority fixes', description: 'Progress write frequency and real word glows.',
    Component: PriorityUpdatesProbe } satisfies ProbeDefinition;
