import { describe, expect, it } from 'vitest';
import type { Line } from '@/types';
import { createActiveLineLookup, findLatestActiveLineIndex } from '@/utils/lyrics/activeLineLookup';

// test/unit/lyrics/activeLineLookup.test.ts
// Check indexed playback against the original selection rule, including seeks and lyric tails.
const line = (startTime: number, endTime: number): Line => ({ startTime, endTime, fullText: '词', words: [] });

describe('createActiveLineLookup', () => {
    it('keeps start/end boundaries, gaps and latest-index precedence', () => {
        const lookup = createActiveLineLookup([line(1, 2), line(2, 3), line(5, 6)]);
        expect([-1, 1, 1.5, 2, 3, 3.01, 5, 6, 6.01].map(lookup))
            .toEqual([-1, 0, 0, 1, 1, -1, 2, 2, -1]);
    });

    it('finds an older active tail after newer overlapping lines have ended', () => {
        const longTail = line(0, 1);
        longTail.renderHints = { renderEndTime: 20 } as Line['renderHints'];
        const lookup = createActiveLineLookup([longTail, line(2, 3), line(2, 4), line(6, 7)]);
        expect([2, 4, 5, 6, 10, 20, 21].map(lookup)).toEqual([2, 2, 0, 3, 0, 0, -1]);
    });

    it('supports arbitrary seeks, backward playback and repeated loop boundaries', () => {
        const lines = Array.from({ length: 48 }, (_, index) => line(index * 3, index * 3 + 2));
        const lookup = createActiveLineLookup(lines);
        for (const time of [90, 0, 143, 35, -2, 90, 0, 1, 143, 12]) {
            expect(lookup(time)).toBe(findLatestActiveLineIndex(lines, time));
        }
    });

    it('retains the original fallback for unordered, sparse and non-finite inputs', () => {
        for (const lines of [
            [line(10, 12), line(0, 20)],
            [line(0, 1), undefined, line(3, 4)] as Line[],
            [line(NaN, 5), line(2, Infinity)],
        ]) {
            const lookup = createActiveLineLookup(lines);
            for (const time of [-1, 0, 2, 4, 11, NaN, Infinity, -Infinity]) {
                expect(lookup(time)).toBe(findLatestActiveLineIndex(lines, time));
            }
        }
        expect(createActiveLineLookup([])(NaN)).toBe(-1);
    });

    it('matches the original rule across deterministic randomized overlaps', () => {
        let seed = 1937;
        const random = () => {
            seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
            return seed / 2 ** 32;
        };
        let start = 0;
        const lines = Array.from({ length: 1000 }, () => {
            start += Math.floor(random() * 4);
            return line(start, start + random() * 100 - 2);
        });
        const lookup = createActiveLineLookup(lines);
        for (let index = 0; index < 3000; index += 1) {
            const time = random() * (start + 120) - 10;
            expect(lookup(time)).toBe(findLatestActiveLineIndex(lines, time));
        }
    });

    it('does not re-read the whole lyric document during per-frame lookup', () => {
        let reads = 0;
        const lines = Array.from({ length: 5000 }, (_, index) => ({
            ...line(index * 2, index * 2 + 1),
            get startTime() { reads += 1; return index * 2; },
            get endTime() { reads += 1; return index * 2 + 1; },
        }));
        const lookup = createActiveLineLookup(lines);
        reads = 0;
        for (let frame = 0; frame < 600; frame += 1) lookup(frame / 60);
        expect(reads).toBe(0);
    });

    it('rebuilds for edited lyrics without changing the previous document', () => {
        const original = createActiveLineLookup([line(0, 3)]);
        const edited = createActiveLineLookup([line(10, 13)]);
        expect(original(1)).toBe(0);
        expect(edited(1)).toBe(-1);
        expect(edited(11)).toBe(0);
    });
});
