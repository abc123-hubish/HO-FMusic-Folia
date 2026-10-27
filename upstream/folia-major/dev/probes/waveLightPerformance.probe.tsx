import React, { useEffect, useMemo, useState } from 'react';
import { useMotionValue } from 'framer-motion';
import WaveLightLyrics from '../../src/components/visualizer/waveLight/WaveLightLyrics';
import type { Line } from '../../src/types';
import type { ProbeDefinition } from './definition';
import '../../src/components/visualizer/waveLight/waveLight.css';

// dev/probes/waveLightPerformance.probe.tsx
// Exercise the real karaoke independently of the already-batched background waves.
declare global {
    interface Window {
        __waveLyricPerf: { ready: boolean; time: (n: number) => void; resize: (n: number) => void;
            burst: (frames: number) => number };
    }
}
function WaveLightPerformanceProbe() {
    const time = useMotionValue(0);
    const [count, setCount] = useState(240);
    const line = useMemo<Line>(() => ({ fullText: '逐字波光流动回声'.repeat(Math.ceil(count / 8)).slice(0, count),
        startTime: 0, endTime: 12, words: [] }), [count]);
    useEffect(() => {
        window.__waveLyricPerf = { ready: true, time: n => time.set(n), resize: setCount,
            burst: frames => {
                time.set(-1);
                const started = performance.now();
                for (let i = 0; i < frames; i++) time.set(i / frames * 12);
                return performance.now() - started;
            } };
        return () => { window.__waveLyricPerf.ready = false; };
    }, [time]);
    return <div style={{ position: 'fixed', inset: 0, background: '#141722', color: '#efeaff', fontFamily: 'Arial', fontWeight: 700 }}>
        <div className="wave-light-line-position" data-testid="wave-perf" data-glyph-count={count}>
            <WaveLightLyrics line={line} text={line.fullText} currentTime={time} fontSize={22}
                accent="#bda0ff" frozen={false} visible />
        </div>
    </div>;
}
export default { id: 'waveLightPerformance', title: 'Wave Light glyph performance', description: 'Long-line karaoke clock and DOM benchmark.',
    Component: WaveLightPerformanceProbe } satisfies ProbeDefinition;
