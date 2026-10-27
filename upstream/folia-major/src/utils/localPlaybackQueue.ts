import type { LocalSong, SongResult, UnifiedSong } from '../types';

// src/utils/localPlaybackQueue.ts
// Resolve queue entries against one local-library snapshot without rescanning it for every entry.
export function resolveLocalPlaybackQueue(queue: readonly SongResult[], songs: readonly LocalSong[]): LocalSong[] {
    if (queue.length === 0) return [];
    const songsById = new Map<string, LocalSong>();
    for (const song of songs) {
        // Array.find selected the first duplicate; keep its object identity and queue repetitions.
        const id = song.id;
        if (!songsById.has(id)) songsById.set(id, song);
    }
    return queue
        .map(queuedSong => {
            const songId = (queuedSong as UnifiedSong).localRef?.songId;
            return songId ? songsById.get(songId) : undefined;
        })
        .filter((song): song is LocalSong => Boolean(song));
}
