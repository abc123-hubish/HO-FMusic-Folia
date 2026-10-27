import { describe, expect, it } from 'vitest';
import type { LyricBackgroundVocal } from '@/types';
import { createHarmonySnapshotLookup } from '@/components/visualizer/harmonySnapshotLookup';
import { resolveHarmonySnapshotFromVocals } from '@/components/visualizer/harmonyRuntime';

// test/unit/visualizer/harmonySnapshotLookup.test.ts
// Compare indexed lookup to the original resolver at boundaries, overlapping tails and backwards seeks.
describe('harmony snapshot lookup', () => {
    const vocals: LyricBackgroundVocal[] = Array.from({ length: 100 }, (_, index) => ({
        text: index % 11 === 0 ? '  ' : '回声 echo echo!',
        startTime: index * 0.7, endTime: index * 0.7 + (index % 7 === 0 ? 12 : 2),
        words: [ { text: '回声', startTime: index * 0.7, endTime: index * 0.7 + 0.4 },
            { text: 'echo', startTime: index * 0.7 + 0.5, endTime: index * 0.7 + 1 },
            { text: 'echo', startTime: index * 0.7 + 1.1, endTime: index * 0.7 + 1.6 } ],
    })).reverse();
    it('matches punctuation, duplicate words, concurrent vocals and inclusive ends exactly', () => {
        const lookup = createHarmonySnapshotLookup(vocals);
        const times = vocals.flatMap(vocal => [vocal.startTime, vocal.endTime,
            ...vocal.words.flatMap(word => [word.startTime, word.endTime])]);
        for (const time of times.flatMap(time => [time - 0.0001, time, time + 0.0001]).reverse()) {
            expect(lookup(time)).toEqual(resolveHarmonySnapshotFromVocals(vocals, time));
        }
    });
    it('returns the same snapshot without rebuilding between timing boundaries', () => {
        const lookup = createHarmonySnapshotLookup([{ text: 'test', startTime: 1, endTime: 3, words: [] }]);
        expect(lookup(1.1)).toBe(lookup(1.9));
        expect(lookup(3).lines).toHaveLength(1); expect(lookup(3.0001).lines).toHaveLength(0);
        expect(lookup(2).lines).toHaveLength(1);
    });
    it('supports empty input and retains malformed-input behavior', () => {
        expect(createHarmonySnapshotLookup([])(0).lines).toEqual([]);
        const malformed = [{ ...vocals[0], startTime: NaN }];
        expect(createHarmonySnapshotLookup(malformed)(2)).toEqual(resolveHarmonySnapshotFromVocals(malformed, 2));
    });
});
