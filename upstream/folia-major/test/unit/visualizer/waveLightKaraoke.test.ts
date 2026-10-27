import { describe, expect, it } from 'vitest';
import type { Line } from '../../../src/types';
import { buildWaveLightGlyphGroups, createWaveLightGlyphFrame, fillWaveLightGlyphFrame } from '../../../src/components/visualizer/waveLight/waveLightKaraoke';

// test/unit/visualizer/waveLightKaraoke.test.ts
describe('Wave Light follow-sing timing', () => {
    it('preserves display text, repeated words, spacing, punctuation and grapheme boundaries', () => {
        const text = "你你  don't e\u0301 👨‍👩‍👧‍👦！";
        const line: Line = { fullText: text, startTime: 0, endTime: 8, words: [
            { text: '你', startTime: 0, endTime: 1 }, { text: '你', startTime: 1, endTime: 2 },
            { text: "don't", startTime: 3, endTime: 5 },
        ] };
        const groups = buildWaveLightGlyphGroups(line, text);
        const timeline = groups.flatMap(group => group.glyphs);
        expect(timeline.map(glyph => glyph.char).join('')).toBe(text);
        expect(groups.map(group => group.text)).toContain("don't");
        expect(timeline.slice(0, 2).map(glyph => glyph.startTime)).toEqual([0, 1]);
        expect(timeline.map(glyph => glyph.char)).toContain('e\u0301');
        expect(timeline.map(glyph => glyph.char)).toContain('👨‍👩‍👧‍👦');
        expect(buildWaveLightGlyphGroups(null, 'Test Song').map(group => group.text).join('')).toBe('Test Song');
    });
    it('reveals dim to bright, floats a bounded ghost after singing and resets on seeking', () => {
        const frame = createWaveLightGlyphFrame();
        const glyph = { char: '字', startTime: 2, endTime: 3 };
        fillWaveLightGlyphFrame(frame, glyph, 1, false);
        expect(frame.opacity).toBe(0.5); expect(frame.ghostOpacity).toBe(0);
        fillWaveLightGlyphFrame(frame, glyph, 2.5, false);
        expect(frame.opacity).toBeCloseTo(0.71); expect(frame.ghostOpacity).toBeGreaterThan(0);
        const currentLift = frame.ghostLift;
        fillWaveLightGlyphFrame(frame, glyph, 3.25, false);
        expect(frame.ghostLift).toBeLessThan(currentLift);
        expect(frame.opacity).toBeCloseTo(0.92);
        fillWaveLightGlyphFrame(frame, glyph, 4, false);
        expect(frame.ghostOpacity).toBe(0); expect(frame.scale).toBe(1);
        fillWaveLightGlyphFrame(frame, glyph, 1, false);
        expect(frame.opacity).toBe(0.5); expect(frame.phase).toBe(0);
        fillWaveLightGlyphFrame(frame, glyph, 1, true);
        expect(frame.opacity).toBeCloseTo(0.92); expect(frame.ghostOpacity).toBe(0);
    });
    it('keeps zero-duration and very short glyphs finite and never extends the main reveal', () => {
        const frame = createWaveLightGlyphFrame();
        for (const endTime of [2, 2.01, 2.1]) {
            for (const time of [1, 2, endTime, endTime + 0.65, 100]) {
                fillWaveLightGlyphFrame(frame, { char: '字', startTime: 2, endTime }, time, false);
                expect(Object.values(frame).every(Number.isFinite)).toBe(true);
                if (time >= endTime) expect(frame.opacity).toBeCloseTo(0.92);
            }
        }
    });
});
