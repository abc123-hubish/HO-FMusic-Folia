import type { LyricBackgroundVocal } from '../../types';
import { resolveHarmonySnapshotFromVocals, type HarmonySnapshot } from './harmonyRuntime';

// src/components/visualizer/harmonySnapshotLookup.ts
// Index overlapping vocals and reuse the discrete snapshot between timing boundaries, including seeks.
export const createHarmonySnapshotLookup = (input: LyricBackgroundVocal[]) => {
    const vocals = input.filter(vocal => vocal.text.trim())
        .sort((left, right) => left.startTime - right.startTime || left.endTime - right.endTime);
    const boundaries = [...new Set(vocals.flatMap(vocal => [
        vocal.startTime, vocal.endTime, ...vocal.words.flatMap(word => [word.startTime, word.endTime]),
    ]))].sort((left, right) => left - right);
    if (boundaries.some(time => !Number.isFinite(time))) {
        return (time: number) => resolveHarmonySnapshotFromVocals(input, time);
    }
    let leaves = 1;
    while (leaves < vocals.length) leaves *= 2;
    const ends = new Float64Array(leaves * 2).fill(-Infinity);
    vocals.forEach((vocal, index) => { ends[leaves + index] = vocal.endTime; });
    for (let node = leaves - 1; node > 0; node -= 1) ends[node] = Math.max(ends[node * 2], ends[node * 2 + 1]);
    let previousBoundary = -1;
    let previousExact = false;
    let previous: HarmonySnapshot | undefined;
    return (time: number): HarmonySnapshot => {
        if (!Number.isFinite(time)) return resolveHarmonySnapshotFromVocals(input, time);
        let first = 0;
        let last = boundaries.length;
        while (first < last) {
            const middle = (first + last) >>> 1;
            if (boundaries[middle] < time) first = middle + 1;
            else last = middle;
        }
        // End times are inclusive: the exact boundary differs from the interval immediately after it.
        const exact = boundaries[first] === time;
        if (previous && previousBoundary === first && previousExact === exact) return previous;
        const active: LyricBackgroundVocal[] = [];
        const visit = (node: number, start: number, end: number) => {
            if (start >= vocals.length || vocals[start].startTime > time || ends[node] < time) return;
            if (end - start === 1) { active.push(vocals[start]); return; }
            const middle = (start + end) >>> 1;
            visit(node * 2, start, middle);
            visit(node * 2 + 1, middle, end);
        };
        visit(1, 0, leaves);
        previous = resolveHarmonySnapshotFromVocals(active, time);
        previousBoundary = first;
        previousExact = exact;
        return previous;
    };
};
