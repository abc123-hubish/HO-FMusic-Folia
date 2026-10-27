import React, { useLayoutEffect, useMemo, useRef } from 'react';
import { useReducedMotion, type MotionValue } from 'framer-motion';
import type { Line } from '../../../types';
import { getLineRenderHints } from '../../../utils/lyrics/renderHints';
import { buildWaveLightGlyphGroups } from './waveLightKaraoke';
import { createWaveLightGlyphPainter } from './waveLightGlyphPainter';

// src/components/visualizer/waveLight/WaveLightLyrics.tsx
// Diorama-inspired dim/bright reveal, registered glow and releasing soul trail.
// Only this line subscribes to the clock; no per-character React state or RAF.
interface WaveLightLyricsProps {
    line: Line | null;
    text: string;
    currentTime: MotionValue<number>;
    fontSize: number;
    accent: string;
    frozen: boolean;
    visible: boolean;
}
export default function WaveLightLyrics({ line, text, currentTime, fontSize, accent, frozen, visible }: WaveLightLyricsProps) {
    const ref = useRef<HTMLDivElement>(null);
    const groups = useMemo(() => buildWaveLightGlyphGroups(line, text), [line, text]);
    const reduced = useReducedMotion();
    const still = frozen || !!reduced || !line || getLineRenderHints(line)?.wordRevealMode === 'instant';
    // Long/very short lines must finish entering before their visual time budget expires.
    const budget = line ? Math.max(0.05, Math.min(1.2, (line.endTime - line.startTime) * 0.8)) : 1.2;
    const duration = Math.min(0.52, budget * 0.6);
    const half = Math.max(1, (groups.length - 1) / 2);
    useLayoutEffect(() => {
        if (!visible || !ref.current) return;
        const elements = Array.from(ref.current.querySelectorAll<HTMLElement>('[data-wave-light-glyph]'));
        const timings = groups.flatMap(group => group.glyphs);
        const paint = createWaveLightGlyphPainter(elements, timings, still);
        paint(currentTime.get());
        const off = still ? undefined : currentTime.on('change', paint);
        return () => {
            off?.();
            for (const element of elements) element.classList.remove('wave-light-glyph-live');
        };
    }, [currentTime, groups, still, visible]);
    return <div ref={ref} className="wave-light-line" data-wave-light-line data-wave-light-karaoke
        style={{ fontSize, '--wave-sung-accent': accent } as React.CSSProperties}>
        {groups.map((group, index) => {
            const distance = Math.abs(index - (groups.length - 1) / 2);
            return <span key={index} className="wave-light-token" style={{
                '--wave-dx': `${Math.sign(index - (groups.length - 1) / 2) * Math.min(distance, 4) * 0.7}em`,
                animationDelay: `${(budget - duration) * distance / half}s`, animationDuration: `${duration}s`,
            } as React.CSSProperties}>{group.glyphs.map((glyph, glyphIndex) => (
                <span key={glyphIndex} className="wave-light-glyph" data-wave-light-glyph>{glyph.char}
                    <span className="wave-light-glyph-ghost" aria-hidden="true" data-wave-char={glyph.char} />
                </span>
            ))}</span>;
        })}
    </div>;
}
