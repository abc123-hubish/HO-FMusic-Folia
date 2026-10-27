import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { useMotionValue } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { DEFAULT_THEME } from '../../src/services/baseThemes';
import type { Line } from '../../src/types';
import { getVisualizerRegistryEntry } from '../../src/components/visualizer/registry';
import { setAppForeground } from '../../src/services/appVisibility';
import type { ProbeDefinition } from './definition';

// dev/probes/vinylDisc.probe.tsx
const lines: Line[] = [
    { fullText: '重逢的旋律', startTime: 0, endTime: 4, words: [] },
    { fullText: 'If you miss the train', translation: '如果错过那班列车', startTime: 4, endTime: 8,
        words: [{ text: 'If you ', startTime: 4, endTime: 6 }, { text: 'miss the train', startTime: 6, endTime: 8 }] },
    { fullText: '', startTime: 8, endTime: 10, words: [] },
    { fullText: '把回忆拼好给你', startTime: 10, endTime: 14, words: [] },
];
const longLines: Line[] = Array.from({ length: 14 }, (_, index) => ({
    fullText: `邻近歌词 ${index + 1} · 把回忆拼好给你`, startTime: index * 4, endTime: (index + 1) * 4, words: [],
}));
const cover = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="#b76b89"/><circle cx="100" cy="100" r="60" fill="#efc17a"/></svg>');
const VinylDiscProbe = () => {
    const { t } = useTranslation();
    const [index, setIndex] = useState(1);
    const [paused, setPaused] = useState(false);
    const [staticMode, setStaticMode] = useState(false);
    const [foreground, setForeground] = useState(true);
    const [mode, setMode] = useState('vinyl-disc');
    const [settings, setSettings] = useState(false);
    const [hasCover, setHasCover] = useState(true);
    const [showText, setShowText] = useState(true);
    const [light, setLight] = useState(false);
    const [longSong, setLongSong] = useState(false);
    const currentTime = useMotionValue(5);
    const power = useMotionValue(0);
    const audioBands = useMemo(() => ({ bass: power, lowMid: power, mid: power, vocal: power, treble: power }), [power]);
    const theme = useMemo(() => ({ ...DEFAULT_THEME, fontFamily: 'Arial', fontWeight: 500,
        backgroundColor: light ? '#fff9f1' : '#141210', primaryColor: light ? '#292420' : '#f5ede2',
        secondaryColor: light ? '#65594d' : '#b9b2a4', accentColor: '#c88558' }), [light]);
    useEffect(() => { setAppForeground(foreground); return () => setAppForeground(true); }, [foreground]);
    const seek = (next: number, time: number) => { currentTime.set(time); setIndex(next); };
    return <div className="fixed inset-0" style={{ background: theme.backgroundColor }}>
        <Suspense fallback={null}>{getVisualizerRegistryEntry(mode).render({
            currentTime, currentLineIndex: index, lines: longSong ? longLines : lines, theme, audioPower: power, audioBands, paused, staticMode,
            songTitle: 'Vinyl Test', songArtist: 'Test Artist', seed: 'vinyl-probe', coverUrl: hasCover ? cover : null,
            showText, isPreviewMode: true, isPlayerChromeHidden: true,
        })}</Suspense>
        <div className="absolute left-0 top-0 z-50 flex flex-wrap gap-2 bg-black text-white text-xs">
            <button onClick={() => seek(0, 1)}>Chinese</button><button onClick={() => seek(1, 5)}>English</button>
            <button onClick={() => seek(2, 9)}>Gap</button><button onClick={() => seek(3, 11)}>Next</button>
            <button onClick={() => currentTime.set(7)}>Karaoke</button>
            <button onClick={() => setPaused(value => !value)}>{paused ? 'Resume' : 'Pause'}</button>
            <button onClick={() => setStaticMode(value => !value)}>{staticMode ? 'Animate' : 'Static'}</button>
            <button onClick={() => setForeground(value => !value)}>{foreground ? 'Background' : 'Foreground'}</button>
            <button onClick={() => setMode(value => value === 'vinyl-disc' ? 'still' : 'vinyl-disc')}>Switch mode</button>
            <button onClick={() => setSettings(value => !value)}>Settings</button>
            <button onClick={() => setHasCover(value => !value)}>Cover</button>
            <button onClick={() => setShowText(value => !value)}>Text</button>
            <button onClick={() => setLight(value => !value)}>Theme</button>
            <button onClick={() => { setLongSong(true); seek(6, 25); }}>Long song</button>
        </div>
        {settings && <div className="absolute right-0 top-16 z-40 w-80 max-h-[85vh] overflow-auto bg-zinc-950 text-white">
            {getVisualizerRegistryEntry('vinyl-disc').renderSettingsPanel?.({
                t, theme, isDaylight: light, controlCardBg: '#171717', rangeInputClass: 'w-full',
            })}
        </div>}
    </div>;
};
export default { id: 'vinylDisc', title: 'Vinyl Disc', description: 'Original DOM scene and real Folium settings.',
    Component: VinylDiscProbe } satisfies ProbeDefinition;
