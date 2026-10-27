import type { Line } from '../../types';

// src/utils/lyrics/activeLineLookup.ts
// Preserve reverse-index precedence, including overlapping lyric tails and inclusive end times.
export const findLatestActiveLineIndex = (lines: Line[], time: number): number => {
    for (let index = lines.length - 1; index >= 0; index -= 1) {
        const line = lines[index];
        if (!line || time < line.startTime) continue;
        if (time <= (line.renderHints?.renderEndTime ?? line.endTime)) return index;
    }
    return -1;
};

/** Build once per lyric document; queries skip future lines and already-ended ranges. */
export const createActiveLineLookup = (lines: Line[]): ((time: number) => number) => {
    const count = lines.length;
    if (count === 0) return () => -1;
    const starts = new Float64Array(count);
    let leafCount = 1;
    while (leafCount < count) leafCount *= 2;
    const maxEnds = new Float64Array(leafCount * 2).fill(-Infinity);

    for (let index = 0; index < count; index += 1) {
        const line = lines[index];
        const end = line?.renderHints?.renderEndTime ?? line?.endTime;
        // Unordered or malformed input retains the original search semantics.
        if (!line || !Number.isFinite(line.startTime) || !Number.isFinite(end)
            || (index > 0 && line.startTime < starts[index - 1])) {
            return time => findLatestActiveLineIndex(lines, time);
        }
        starts[index] = line.startTime;
        maxEnds[leafCount + index] = end;
    }
    for (let node = leafCount - 1; node > 0; node -= 1) {
        maxEnds[node] = Math.max(maxEnds[node * 2], maxEnds[node * 2 + 1]);
    }

    // Searching the right child first keeps the latest original index, even when an older
    // line's tail outlives several newer lines. A maximum end time prunes whole expired ranges.
    const findRightmost = (node: number, first: number, last: number, eligibleEnd: number, time: number): number => {
        if (first >= eligibleEnd || maxEnds[node] < time) return -1;
        if (last - first === 1) return first;
        const middle = (first + last) >>> 1;
        const right = findRightmost(node * 2 + 1, middle, last, eligibleEnd, time);
        return right !== -1 ? right : findRightmost(node * 2, first, middle, eligibleEnd, time);
    };

    return time => {
        if (!Number.isFinite(time)) return findLatestActiveLineIndex(lines, time);
        let first = 0;
        let last = count;
        while (first < last) {
            const middle = (first + last) >>> 1;
            if (starts[middle] <= time) first = middle + 1;
            else last = middle;
        }
        return first === 0 ? -1 : findRightmost(1, 0, leafCount, first, time);
    };
};
