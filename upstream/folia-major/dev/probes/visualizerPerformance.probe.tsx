import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { useMotionValue } from 'framer-motion';
import { DEFAULT_THEME } from '../../src/services/baseThemes';
import { DEFAULT_MONET_TUNING, type Line, type VisualizerMode } from '../../src/types';
import { getVisualizerRegistryEntry } from '../../src/components/visualizer/registry';
import { setAppForeground } from '../../src/services/appVisibility';
import type { ProbeDefinition } from './definition';

// dev/probes/visualizerPerformance.probe.tsx
// Real canvases with deterministic signals and controls for pause, seek and native backgrounding.
const lines: Line[] = [{ fullText: 'Echo 回声 tonight', startTime: 0, endTime: 90, isChorus: true,
    words: [ { text: 'Echo', startTime: 0, endTime: 30 }, { text: '回声', startTime: 30, endTime: 60 },
        { text: 'tonight', startTime: 60, endTime: 90 } ] }];
const VisualizerPerformanceProbe = () => {
    const [mode, setMode] = useState<VisualizerMode>('cadenza');
    const [paused, setPaused] = useState(false);
    const [foreground, setForeground] = useState(true);
    const currentTime = useMotionValue(1);
    const power = useMotionValue(80);
    const audioBands = useMemo(() => ({ bass: power, lowMid: power, mid: power, vocal: power, treble: power }), [power]);
    useEffect(() => { setAppForeground(foreground); return () => setAppForeground(true); }, [foreground]);
    return <div className="fixed inset-0" data-performance-mode={mode}>
        <Suspense fallback={null}>{getVisualizerRegistryEntry(mode).render({
            currentTime, currentLineIndex: 0, lines, theme: { ...DEFAULT_THEME, animationIntensity: 'chaotic' }, audioPower: power, audioBands,
            paused, seed: 'performance', backgroundStaticMode: true, monetTuning: { ...DEFAULT_MONET_TUNING, audioStyle: 'line' },
        })}</Suspense>
        <div className="absolute left-0 top-0 z-50 flex gap-2 bg-black text-white">
            {(['cadenza', 'pendolo', 'monet', 'diorama', 'claddagh'] as const).map(value =>
                <button key={value} onClick={() => setMode(value)}>{value}</button>)}
            <button onClick={() => setPaused(value => !value)}>{paused ? 'Resume' : 'Pause'}</button>
            <button onClick={() => currentTime.set(currentTime.get() + 12)}>Seek</button>
            <button onClick={() => setForeground(value => !value)}>{foreground ? 'Background' : 'Foreground'}</button>
        </div>
    </div>;
};
export default { id: 'visualizerPerformance', title: 'Visualizer performance lifecycle',
    description: 'Pause settling, seek redraw and native background suspension with real rendering backends.',
    Component: VisualizerPerformanceProbe } satisfies ProbeDefinition;
