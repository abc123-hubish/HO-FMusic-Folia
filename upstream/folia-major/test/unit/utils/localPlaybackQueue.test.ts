import { describe, expect, it } from 'vitest';
import type { LocalSong, SongResult, UnifiedSong } from '../../../src/types';
import { resolveLocalPlaybackQueue } from '../../../src/utils/localPlaybackQueue';

// test/unit/utils/localPlaybackQueue.test.ts
// Compare the indexed lookup with the original first-match lookup, including repeated queue entries.
const local = (id: string) => ({ id } as LocalSong);
const queued = (id?: string) => ({ id: 'queued', name: 'Queued', artists: [], album: { id: 0, name: '' }, durationMs: 1000,
    localRef: id === undefined ? undefined : { songId: id } } as SongResult);
const original = (queue: SongResult[], songs: LocalSong[]) => queue
    .map(song => {
        const id = (song as UnifiedSong).localRef?.songId;
        return id ? songs.find(item => item.id === id) : undefined;
    })
    .filter((song): song is LocalSong => Boolean(song));

describe('resolveLocalPlaybackQueue', () => {
    it('preserves first-match identity, order, repetitions and missing/empty references', () => {
        const first = local('one'), duplicate = local('one'), second = local('two');
        const songs = [first, duplicate, second, local('')];
        const queue = [queued('two'), queued('one'), queued('missing'), queued(), queued('one'), queued('')];
        const result = resolveLocalPlaybackQueue(queue, songs);
        expect(result).toEqual([second, first, first]);
        result.forEach((song, index) => expect(song).toBe(original(queue, songs)[index]));
        expect(songs).toEqual([first, duplicate, second, songs[3]]);
        expect(resolveLocalPlaybackQueue([], songs)).toEqual([]);
        expect(resolveLocalPlaybackQueue(queue, [])).toEqual([]);
    });

    it('matches the original lookup across 500 deterministic mixed snapshots', () => {
        let seed = 20261013;
        const random = (max: number) => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed % max; };
        for (let run = 0; run < 500; run++) {
            const songs = Array.from({ length: random(100) }, () => local(`song-${random(40)}`));
            const queue = Array.from({ length: random(120) }, () => queued(random(5) === 0 ? undefined : `song-${random(60)}`));
            const before = songs.slice();
            const expected = original(queue, songs), actual = resolveLocalPlaybackQueue(queue, songs);
            expect(actual.length).toBe(expected.length);
            actual.forEach((song, index) => expect(song).toBe(expected[index]));
            expect(songs).toEqual(before);
        }
    });

    it('reads the library once instead of once per queue entry and observes each new snapshot', () => {
        let reads = 0;
        const songs = Array.from({ length: 5000 }, (_, i) => ({ get id() { reads++; return `song-${i}`; } } as LocalSong));
        const queue = Array.from({ length: 500 }, () => queued('song-4999'));
        expect(resolveLocalPlaybackQueue(queue, songs)).toHaveLength(500);
        expect(reads).toBeLessThanOrEqual(songs.length * 3);
        const replacement = local('song-4999');
        expect(resolveLocalPlaybackQueue(queue, [replacement])[0]).toBe(replacement);
    });
});
