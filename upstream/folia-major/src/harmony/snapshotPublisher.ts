import type { LocalSong, SongResult } from '../types';
import type { HarmonySnapshotValues, HarmonyTrack } from './contracts';
import { getSongArtistLabel, getSongAlbumLabel } from '../services/onlineMusic/songMetadata';
import { getPlaybackSongKey } from '../utils/appPlaybackGuards';

// src/harmony/snapshotPublisher.ts
// Keep catalogue-sized work out of the once-per-second native playback clock update.
const EMPTY_RESULTS: readonly SongResult[] = [];
const projectSong = (song: SongResult): HarmonyTrack => ({ id: getPlaybackSongKey(song), title: song.name,
  artist: getSongArtistLabel(song), album: getSongAlbumLabel(song) });

function createListCache<T>(project: (item: T) => HarmonyTrack) {
  let previousSource: readonly T[] | undefined;
  let serialized = '';
  let published: string | undefined;
  return {
    read(source: readonly T[]) {
      if (source !== previousSource) {
        serialized = JSON.stringify(source.map(project));
        previousSource = source;
      }
      return serialized === published ? undefined : serialized;
    },
    commit() { published = serialized; },
  };
}

// Compare small scalar snapshots and send each list only when its display contents change.
export function createHarmonySnapshotPublisher(send: (payload: string) => void) {
  const queue = createListCache(projectSong);
  const results = createListCache(projectSong);
  const local = createListCache((song: LocalSong): HarmonyTrack => ({ id: song.id, title: song.title,
    artist: song.importedMetadata.artistNames.join(' / '), album: song.importedMetadata.albumName || '' }));
  let publishedValues = '';
  return (values: HarmonySnapshotValues, lists: {
    queue: readonly SongResult[]; results: readonly SongResult[] | null; local: readonly LocalSong[];
  }) => {
    const serializedValues = JSON.stringify(values);
    const changes = [
      ['queue', queue.read(lists.queue)],
      ['results', results.read(lists.results ?? EMPTY_RESULTS)],
      ['local', local.read(lists.local)],
    ] as const;
    if (serializedValues === publishedValues && changes.every(([, value]) => value === undefined)) return;
    const listFields = changes.filter(([, value]) => value !== undefined)
      .map(([key, value]) => `,"${key}":${value}`).join('');
    send(`${serializedValues.slice(0, -1)}${listFields}}`);
    // A failed bridge call must leave all fields eligible for retry.
    publishedValues = serializedValues;
    queue.commit(); results.commit(); local.commit();
  };
}
