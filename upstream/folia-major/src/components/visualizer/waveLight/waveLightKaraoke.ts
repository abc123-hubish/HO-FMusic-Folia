import type { Line } from '../../../types';
import { buildLineGraphemeTimeline, splitLyricGraphemes, type GraphemeTiming } from '../../../utils/lyrics/graphemeTiming';
import { tokenizeWaveLightLine } from './waveLightText';

// src/components/visualizer/waveLight/waveLightKaraoke.ts
// The same parser-derived timeline as Diorama, grouped without breaking Latin words.
export const buildWaveLightGlyphGroups = (line: Line | null, text: string) => {
    const timeline = line ? buildLineGraphemeTimeline(line) : splitLyricGraphemes(text).map(char => ({ char, startTime: 0, endTime: 0 }));
    let cursor = 0;
    return tokenizeWaveLightLine(text).map(token => {
        const count = splitLyricGraphemes(token).length;
        const glyphs = timeline.slice(cursor, cursor + count);
        cursor += count;
        return { text: token, glyphs };
    });
};

export const createWaveLightGlyphFrame = () => ({
    opacity: 0.5, lift: 0, scale: 1, ghostOpacity: 0, ghostLift: 0, ghostScale: 1, phase: 0,
});
export type WaveLightGlyphFrame = ReturnType<typeof createWaveLightGlyphFrame>;
export const WAVE_LIGHT_GHOST_RELEASE_SECONDS = 0.65;
const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const smooth = (value: number) => { const t = clamp01(value); return t * t * (3 - 2 * t); };

// Clock-only envelopes make pause/seek deterministic. A single reusable frame
// serves every glyph; the ghost detaches only AFTER the glyph finishes singing.
export const fillWaveLightGlyphFrame = (frame: WaveLightGlyphFrame, timing: GraphemeTiming, now: number, frozen: boolean) => {
    const time = Number.isFinite(now) ? now : 0;
    const passed = time >= timing.endTime;
    const started = time >= timing.startTime;
    const age = time - timing.endTime;
    const fill = frozen || passed ? 1 : started ? clamp01((time - timing.startTime) / Math.max(0.001, timing.endTime - timing.startTime)) : 0;
    const charge = Math.min(1, Math.max(0, timing.endTime - timing.startTime) / 0.08);
    const energy = frozen || !started ? 0 : passed ? charge * (1 - smooth(age / WAVE_LIGHT_GHOST_RELEASE_SECONDS)) : smooth((time - timing.startTime) / 0.08);
    const flight = passed ? smooth(age / 0.5) : 0;
    frame.phase = frozen || (passed && age >= WAVE_LIGHT_GHOST_RELEASE_SECONDS) ? 3 : !started ? 0 : passed ? 2 : 1;
    frame.opacity = 0.5 + 0.42 * fill;
    frame.lift = -0.04 * energy;
    frame.scale = 1 + 0.045 * energy;
    frame.ghostOpacity = 0.42 * energy;
    frame.ghostLift = -(0.025 + 0.42 * flight) * energy;
    frame.ghostScale = 1 + (0.04 + 0.26 * flight) * energy;
};
