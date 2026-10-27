import { describe, expect, it, vi } from 'vitest';
import type { LocalSong, SongResult } from '@/types';
import type { HarmonySnapshotUpdate, HarmonySnapshotValues } from '@/harmony/contracts';
import { createHarmonySnapshotPublisher } from '@/harmony/snapshotPublisher';

// test/unit/harmony/snapshotPublisher.test.ts
// Verify that delta traffic reconstructs complete snapshots without losing catalogue updates.
vi.mock('@/services/onlineMusic/songMetadata', () => ({
  getSongArtistLabel: (song: SongResult) => song.artists.map(artist => artist.name).join(', '),
  getSongAlbumLabel: (song: SongResult) => song.album.name,
}));

const values: HarmonySnapshotValues = { ready: true, view: 'player', settings: false, mode: 'classic',
  title: 'Song', artist: 'Artist', cover: '', songId: 'local:one', playing: true,
  lyricLines: 10, position: 0, duration: 30, searching: false, searchError: '' };
const song = (id: number, name = `Song ${id}`) => ({ id, name,
  artists: [{ id: 1, name: 'Artist' }], album: { id: 1, name: 'Album' },
  sourceRef: { kind: 'online', providerId: 'netease', mediaId: String(id) },
}) as SongResult;
const localSong = (title = 'Local') => ({ id: 'one', title,
  importedMetadata: { artistNames: ['Artist'], albumName: 'Album' },
}) as LocalSong;

function setup() {
  const payloads: string[] = [];
  const publish = createHarmonySnapshotPublisher(payload => payloads.push(payload));
  const lists = { queue: [song(1)], results: [song(2)] as SongResult[] | null, local: [localSong()] };
  return { publish, payloads, lists, updates: () => payloads.map(payload => JSON.parse(payload) as HarmonySnapshotUpdate) };
}

describe('Harmony snapshot publisher', () => {
  it('publishes complete lists initially and omits them from clock updates', () => {
    const { publish, lists, updates } = setup();
    publish(values, lists);
    publish({ ...values, position: 1 }, lists);
    const [first, second] = updates();
    expect(first.queue?.[0].id).toBe('online:netease:1');
    expect(first.results).toHaveLength(1);
    expect(first.local?.[0].title).toBe('Local');
    expect(second).toEqual({ ...values, position: 1 });
    expect({ ...first, ...second }).toEqual({ ...first, position: 1 });
  });

  it('sends no bridge calls for unchanged paused state or equal fresh catalogue arrays', () => {
    const { publish, lists, payloads } = setup();
    const paused = { ...values, playing: false };
    publish(paused, lists);
    for (let i = 0; i < 60; i++) publish(paused, lists);
    publish(paused, { queue: [...lists.queue], results: [song(2)], local: [localSong()] });
    expect(payloads).toHaveLength(1);
  });

  it('retains list ordering, metadata edits, removals and empty search results', () => {
    const { publish, lists, updates } = setup();
    publish(values, lists);
    publish(values, { ...lists, queue: [song(3), song(1, 'Renamed')], results: null, local: [] });
    const [first, second] = updates();
    expect(second.queue?.map(track => track.title)).toEqual(['Song 3', 'Renamed']);
    expect(second.results).toEqual([]);
    expect(second.local).toEqual([]);
    expect({ ...first, ...second }.results).toEqual([]);
  });

  it('publishes mode/navigation changes and correctly escapes arbitrary track text', () => {
    const { publish, lists, updates } = setup();
    const title = '辞曲 ",} \\ / 🎶';
    publish(values, lists);
    publish({ ...values, settings: true, view: 'home', mode: 'lumiere' },
      { ...lists, local: [localSong(title)] });
    expect(updates()[1]).toMatchObject({ settings: true, view: 'home', mode: 'lumiere',
      local: [{ id: 'one', title }] });
    expect(updates()[1]).not.toHaveProperty('queue');
  });

  it('retries a complete snapshot after a failed native call', () => {
    const send = vi.fn().mockImplementationOnce(() => { throw new Error('Bridge unavailable'); });
    const publish = createHarmonySnapshotPublisher(send);
    const { lists } = setup();
    expect(() => publish(values, lists)).toThrow('Bridge unavailable');
    publish(values, lists);
    expect(JSON.parse(send.mock.calls[1][0])).toHaveProperty('queue');
    expect(JSON.parse(send.mock.calls[1][0])).toHaveProperty('local');
  });

  it('does not revisit a 5000-song catalogue for any of 60 progress updates', () => {
    const { publish, payloads } = setup();
    let reads = 0;
    const queue = Array.from({ length: 5000 }, (_, index) => {
      const item = song(index);
      Object.defineProperty(item, 'name', { get: () => { reads++; return `Song ${index}`; } });
      return item;
    });
    const lists = { queue, results: null, local: [] };
    publish(values, lists);
    for (let position = 1; position <= 60; position++) publish({ ...values, position }, lists);
    expect(reads).toBe(5000);
    const fullBytes = Buffer.byteLength(payloads[0]);
    const clockBytes = Buffer.byteLength(payloads[1]);
    expect(clockBytes).toBeLessThan(fullBytes / 100);
    expect(JSON.parse(payloads[0]).queue).toHaveLength(5000);
    console.info(`5000-song snapshot: full=${fullBytes} bytes, clock=${clockBytes} bytes`);
  });
});
