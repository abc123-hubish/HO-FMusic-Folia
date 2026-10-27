import React, { useEffect, useMemo, useState } from 'react';
import { useMotionValue } from 'framer-motion';
import VisualizerRenderer from '../../src/components/visualizer/VisualizerRenderer';
import VisualizerShell from '../../src/components/visualizer/VisualizerShell';
import { getVisualizerRegistryEntry } from '../../src/components/visualizer/registry';
import { getVisualizerBackgroundRegistryEntry } from '../../src/components/visualizer/backgrounds/registry';
import { DEFAULT_THEME } from '../../src/services/baseThemes';
import type { ProbeDefinition } from './definition';

// dev/probes/playerBackgroundReuse.probe.tsx
// Count shared-background renders through the real renderer/shell boundary in StrictMode.
const PlayerBackgroundReuse = () => {
    const [ready, setReady] = useState(false);
    const [line, setLine] = useState(0);
    const [palette, setPalette] = useState(false);
    const [paused, setPaused] = useState(false);
    const [setting, setSetting] = useState(false);
    const [fume, setFume] = useState(false);
    const signal = useMotionValue(0);
    const audioBands = useMemo(() => ({ bass: signal, lowMid: signal, mid: signal, vocal: signal, treble: signal }), [signal]);
    const theme = useMemo(() => ({ ...DEFAULT_THEME, primaryColor: palette ? '#123456' : '#abcdef' }), [palette]);
    const background = useMemo(() => ({ mode: 'common' as const, common: { opacity: setting ? 0.5 : 0.75 } }), [setting]);

    useEffect(() => {
        const visualizer = getVisualizerRegistryEntry('classic');
        const backdrop = getVisualizerBackgroundRegistryEntry('common');
        const originalVisualizer = visualizer.render;
        const originalBackground = backdrop.render;
        let count = 0;
        let previous: Record<string, unknown> = {};
        visualizer.render = props => (
            <VisualizerShell theme={props.theme} audioPower={props.audioPower} audioBands={props.audioBands} sharedProps={props}>
                <span data-current-line={props.currentLineIndex} />
            </VisualizerShell>
        );
        backdrop.render = props => {
            count += 1;
            const changed = Object.keys(props).filter(key => previous[key] !== (props as unknown as Record<string, unknown>)[key]).join(',');
            previous = props as unknown as Record<string, unknown>;
            return <output data-background-count={count} data-changed={changed} data-color={props.theme.primaryColor} data-paused={String(props.paused)} data-opacity={props.config?.common?.opacity} />;
        };
        setReady(true);
        return () => { visualizer.render = originalVisualizer; backdrop.render = originalBackground; };
    }, []);

    return <div>
        <button onClick={() => setLine(value => value + 1)}>next line</button>
        <button onClick={() => setPalette(value => !value)}>theme</button>
        <button onClick={() => setPaused(value => !value)}>pause</button>
        <button onClick={() => setSetting(value => !value)}>setting</button>
        <button onClick={() => setFume(value => !value)}>fume</button>
        {ready && <VisualizerRenderer mode={fume ? 'fume' : 'classic'} currentTime={signal} currentLineIndex={line} lines={[]}
            theme={theme} audioPower={signal} audioBands={audioBands} background={background} paused={paused} />}
    </div>;
};

const definition: ProbeDefinition = {
    id: 'playerBackgroundReuse', title: 'Player shared background reuse',
    description: 'Checks lyric updates, theme/settings invalidation, and pause propagation through the shared shell.',
    Component: PlayerBackgroundReuse,
};
export default definition;
