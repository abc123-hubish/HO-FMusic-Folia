import { describe, expect, it } from 'vitest';
import type { GraphemeTiming } from '../../../src/utils/lyrics/graphemeTiming';
import { createWaveLightGlyphFrame, fillWaveLightGlyphFrame } from '../../../src/components/visualizer/waveLight/waveLightKaraoke';
import { createWaveLightGlyphScheduler } from '../../../src/components/visualizer/waveLight/waveLightGlyphScheduler';

// test/unit/visualizer/waveLightGlyphScheduler.test.ts
// Compare sparse scheduling to the original full scan, including seeks and overlapping notes.
function compareFrames(timings: GraphemeTiming[], clocks: number[], frozen = false) {
    const actual = timings.map(() => createWaveLightGlyphFrame());
    const update = createWaveLightGlyphScheduler(timings, (i, time) => fillWaveLightGlyphFrame(actual[i], timings[i], time, frozen), frozen);
    for (const clock of clocks) {
        update(clock);
        const expected = timings.map(glyph => {
            const frame = createWaveLightGlyphFrame();
            fillWaveLightGlyphFrame(frame, glyph, clock, frozen);
            return frame;
        });
        expect(actual, `clock ${clock}`).toEqual(expected);
    }
}
describe('Wave Light sparse glyph scheduling', () => {
    it('matches every original frame through forward playback, jumps and backward seeks', () => {
        const timings = Array.from({ length: 240 }, (_, i) => ({ char: '字', startTime: i * 0.05, endTime: (i + 1) * 0.05 }));
        const forward = Array.from({ length: 800 }, (_, i) => i / 60 - 0.2);
        compareFrames(timings, [...forward, 30, 31, 2.4, 2.4, 8.8, 0, NaN, Infinity, -1, 12.7]);
    });
    it('handles out-of-order, overlapping and zero-length timings at exact release boundaries', () => {
        const timings = [
            { char: '甲', startTime: 2, endTime: 3 },
            { char: '乙', startTime: 0, endTime: 9 },
            { char: '丙', startTime: 0.1, endTime: 0.1 },
            { char: '丁', startTime: 1, endTime: 1.01 },
        ];
        const clocks = [-1, 0, 0.1, 0.2, 0.75, 1, 1.01, 1.66, 2, 3, 3.65, 3.650000000000001, 10, 0.2];
        compareFrames(timings, clocks);
        compareFrames(timings, clocks, true);
    });
    it('falls back to the original frame math for malformed timing data', () => {
        compareFrames([
            { char: '甲', startTime: 4, endTime: 2 },
            { char: '乙', startTime: NaN, endTime: 9 },
            { char: '丙', startTime: 1, endTime: Infinity },
        ], [-1, 0, 1, 2, 3, 5, 10, 0]);
    });
    it('visits only active/releasing glyphs during normal playback and stops after settling', () => {
        const timings = Array.from({ length: 240 }, (_, i) => ({ char: '字', startTime: i * 0.05, endTime: (i + 1) * 0.05 }));
        const update = createWaveLightGlyphScheduler(timings, () => {});
        expect(update(-1)).toBe(240);
        let visits = 0;
        for (let i = 0; i < 720; i++) visits += update(i / 60);
        expect(visits).toBeLessThan(720 * 16);
        expect(update(30)).toBeGreaterThan(0);
        expect(update(31)).toBe(0);
        expect(update(31)).toBe(0);
        expect(update(2)).toBe(240);
        const frozen = createWaveLightGlyphScheduler(timings, () => {}, true);
        expect(frozen(0)).toBe(240);
        expect(frozen(8)).toBe(0);
    });
});
