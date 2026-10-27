import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { useMotionValue } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { DEFAULT_THEME } from '../../src/services/baseThemes';
import type { Line } from '../../src/types';
import { getVisualizerRegistryEntry } from '../../src/components/visualizer/registry';
import { useVisualizerSettingsStore } from '../../src/stores/useVisualizerSettingsStore';
import { setAppForeground } from '../../src/services/appVisibility';
import type { ProbeDefinition } from './definition';

// dev/probes/waveLight.probe.tsx
const lines: Line[] = [
    { fullText: '再度重相逢', startTime: 2, endTime: 5,
        words: [{ text: '再度', startTime: 2, endTime: 3 }, { text: '重相逢', startTime: 3, endTime: 5 }] },
    { fullText: '', startTime: 5, endTime: 7, words: [] },
    { fullText: 'My life was kinda short', translation: '我的人生很短暂', startTime: 9, endTime: 14, words: [] },
    { fullText: '把回忆拼好给你', startTime: 14, endTime: 17, words: [], wordSegments: ['把', '回忆拼好', '给你'] },
];
const WaveLightProbe = () => {
    const { t } = useTranslation();
    const [index, setIndex] = useState(2);
    const [paused, setPaused] = useState(false);
    const [staticMode, setStaticMode] = useState(false);
    const [foreground, setForeground] = useState(true);
    const [mode, setMode] = useState('wave-light');
    const [settings, setSettings] = useState(false);
    const [compact, setCompact] = useState(false);
    const tuning = useVisualizerSettingsStore(state => state.waveLightTuning);
    const change = useVisualizerSettingsStore(state => state.handleSetWaveLightTuning);
    const reset = useVisualizerSettingsStore(state => state.handleResetWaveLightTuning);
    const currentTime = useMotionValue(10);
    const power = useMotionValue(0);
    const audioBands = useMemo(() => ({ bass: power, lowMid: power, mid: power, vocal: power, treble: power }), [power]);
    const theme = useMemo(() => ({ ...DEFAULT_THEME, accentColor: '#683ca0' }), []);
    useEffect(() => { setAppForeground(foreground); return () => setAppForeground(true); }, [foreground]);
    const seek = (next: number, time: number) => { currentTime.set(time); setIndex(next); };
    return <div className="fixed inset-0 bg-black">
        <div data-wave-light-probe-stage style={compact ? { position: 'absolute', left: 120, top: 100, width: 420, height: 250 }
            : { position: 'absolute', inset: 0 }}>
            <Suspense fallback={null}>{getVisualizerRegistryEntry(mode).render({
                currentTime, currentLineIndex: index, lines, theme, audioPower: power, audioBands, paused, staticMode,
                songTitle: 'Test Song', seed: 'wave-light-probe', waveLightTuning: tuning, isPreviewMode: true,
                subtitleContentMode: 'translation', isPlayerChromeHidden: true,
            })}</Suspense>
        </div>
        <div className="absolute left-0 top-0 z-50 flex max-w-full flex-wrap gap-2 bg-black text-white text-xs">
            <button onClick={() => seek(-1, 0)}>Intro</button><button onClick={() => seek(0, 3)}>Chinese</button>
            <button onClick={() => seek(1, 6)}>Gap</button><button onClick={() => seek(2, 10)}>English</button>
            <button onClick={() => seek(3, 15)}>Segmented</button>
            <button onClick={() => seek(0, 2.25)}>Read start</button>
            <button onClick={() => currentTime.set(3.4)}>Read middle</button>
            <button onClick={() => currentTime.set(4.6)}>Read tail</button>
            <button onClick={() => currentTime.set(2.25)}>Read back</button>
            <button onClick={() => setPaused(value => !value)}>{paused ? 'Resume' : 'Pause'}</button>
            <button onClick={() => setStaticMode(value => !value)}>{staticMode ? 'Animate' : 'Static'}</button>
            <button onClick={() => setForeground(value => !value)}>{foreground ? 'Background' : 'Foreground'}</button>
            <button onClick={() => setMode(value => value === 'wave-light' ? 'still' : 'wave-light')}>Switch mode</button>
            <button onClick={() => setSettings(value => !value)}>Settings</button>
            <button onClick={() => setCompact(value => !value)}>Card</button>
            <button onClick={reset}>Reset</button>
        </div>
        {settings && <div className="absolute right-0 top-16 z-40 w-80 bg-zinc-950 text-white">
            {getVisualizerRegistryEntry('wave-light').renderSettingsPanel?.({
                t, theme, isDaylight: false, controlCardBg: '#171717', rangeInputClass: 'w-full',
                waveLightTuning: tuning, onWaveLightTuningChange: change,
            })}
        </div>}
    </div>;
};
export default { id: 'waveLight', title: 'Wave Light', description: 'Real rendering, settings, seeks and lifecycle.',
    Component: WaveLightProbe } satisfies ProbeDefinition;
