import type { GraphemeTiming } from '../../../utils/lyrics/graphemeTiming';
import { WAVE_LIGHT_GHOST_RELEASE_SECONDS } from './waveLightKaraoke';

// src/components/visualizer/waveLight/waveLightGlyphScheduler.ts
// Walk sorted start/release boundaries, including overlapping and out-of-order glyphs.
// Waiting/settled glyphs paint only on mount or backward seek, not on every playback tick.
export function createWaveLightGlyphScheduler(timings: readonly GraphemeTiming[],
    paint: (index: number, time: number) => void, frozen = false) {
    const valid = timings.every(t => Number.isFinite(t.startTime) && Number.isFinite(t.endTime) && t.endTime >= t.startTime);
    const starts = timings.map((_, i) => i).sort((a, b) => timings[a].startTime - timings[b].startTime || a - b);
    const ends = timings.map((_, i) => i).sort((a, b) => timings[a].endTime - timings[b].endTime || a - b);
    const active = new Set<number>();
    let start = 0, end = 0, previous: number | null = null;
    return (clock: number) => {
        const time = Number.isFinite(clock) ? clock : 0;
        if (previous !== null && (frozen || time === previous)) return 0;
        let visits = 0;
        if (previous === null || time < previous || !valid) {
            active.clear(); start = 0; end = 0;
            for (let i = 0; i < timings.length; i++) { paint(i, time); visits++; }
            if (valid && !frozen) {
                while (start < starts.length && timings[starts[start]].startTime <= time) active.add(starts[start++]);
                while (end < ends.length && time - timings[ends[end]].endTime >= WAVE_LIGHT_GHOST_RELEASE_SECONDS) active.delete(ends[end++]);
            }
        } else {
            while (start < starts.length && timings[starts[start]].startTime <= time) active.add(starts[start++]);
            // Use the same subtraction as the envelope; adding 0.65 can round to the other side
            // of the release boundary and leave a glyph's compositor layer permanently live.
            while (end < ends.length && time - timings[ends[end]].endTime >= WAVE_LIGHT_GHOST_RELEASE_SECONDS) {
                const index = ends[end++]; active.delete(index); paint(index, time); visits++;
            }
            for (const index of active) { paint(index, time); visits++; }
        }
        previous = time;
        return visits;
    };
}
