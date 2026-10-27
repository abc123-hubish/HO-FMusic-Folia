import { describe, expect, it } from 'vitest';
import type { LocalSong, SongResult } from '@/types';
import { CONTINUATION_MAX_BYTES, decodeContinuation, encodeContinuation, findContinuationLocal,
  projectContinuationTrack } from '@/harmony/continuationData';

// test/unit/harmony/continuationData.test.ts
// Exercise portable identities, privacy boundaries, invalid input and the actual UTF-8 Want budget.
const song = (id: number, providerId = 'netease'): SongResult => ({ id, name: '歌曲 🎵', durationMs: 90000,
  artists: [{ id: 1, name: '歌手' }], album: { id: 2, name: '专辑' },
  sourceRef: { kind: 'online', providerId, mediaId: String(id) } });
const encode = (overrides: Partial<Parameters<typeof encodeContinuation>[0]> = {}) => encodeContinuation({
  transferId: 'transfer-1', song: song(1), queue: [song(1)], locals: [], positionSec: 37.25,
  playing: false, view: 'player', mode: 'classic', ...overrides,
});

describe('Harmony continuation data', () => {
  it('keeps pause, exact progress, navigation and provider-scoped identity', () => {
    const data = decodeContinuation(encode({ song: song(1, 'qq'), queue: [song(1), song(1, 'qq')] }));
    expect(data).toMatchObject({ positionSec: 37.25, playing: false, currentIndex: 1,
      view: 'player', mode: 'classic', schemaVersion: 1 });
    expect(data.queue[1]).toMatchObject({ kind: 'online', song: { sourceRef: { providerId: 'qq', mediaId: '1' } } });
  });
  it('projects only public song identity, including required QQ/KuGou identifiers', () => {
    const original = { ...song(2, 'qq'), audioSrc: 'https://secret/?token=secret', cookie: 'secret',
      onlineLyricsState: { importedLyrics: 'private lyrics' },
      album: { id: 2, name: 'Album', coverUrl: 'blob:private' },
      sourceRef: { kind: 'online' as const, providerId: 'qq', mediaId: '2',
        providerData: { mediaMid: 'media', songMid: 'mid', cookie: 'secret', freeSign: 'secret',
          token: { private: true } } } } as unknown as SongResult;
    const data = decodeContinuation(encode({ song: original, queue: [original] }));
    const payload = JSON.stringify(data);
    expect(payload).not.toMatch(/secret|cookie|token|freeSign|blob:|importedLyrics/);
    expect(data.queue[0]).toMatchObject({ song: { sourceRef: { providerData: { mediaMid: 'media', songMid: 'mid' } } } });
  });
  it('bounds a large Unicode queue while retaining the playing song and its neighbours', () => {
    const queue = Array.from({ length: 900 }, (_, index) => ({ ...song(index), name: '歌'.repeat(250),
      artists: Array.from({ length: 8 }, () => ({ id: 1, name: '手'.repeat(250) })) }));
    const payload = encode({ song: queue[870], queue });
    const data = decodeContinuation(payload);
    expect(new TextEncoder().encode(payload).byteLength).toBeLessThanOrEqual(CONTINUATION_MAX_BYTES);
    expect(data.queue[data.currentIndex]).toMatchObject({ song: { id: 870 } });
    expect(data.queueTruncated).toBe(true);
    expect(data.queue.length).toBeGreaterThan(1);
  });
  it('adds an unqueued current song without declaring a missing queue truncated', () => {
    const data = decodeContinuation(encode({ queue: [] }));
    expect(data.queue).toHaveLength(1);
    expect(data.currentIndex).toBe(0);
    expect(data.queueTruncated).toBe(false);
  });
  it('matches local files independently of the source device UUID and rejects ambiguous files', () => {
    const file = { id: 'source-uuid', fileName: 'song.flac', fileSize: 125000, duration: 90000 } as LocalSong;
    const localSong = { ...song(1), isLocal: true, localRef: { songId: file.id },
      sourceRef: { kind: 'local', mediaId: file.id } } as SongResult;
    const track = projectContinuationTrack(localSong, [file]);
    expect(track).toEqual({ kind: 'local', fileName: file.fileName, fileSize: file.fileSize, durationMs: file.duration });
    if (track?.kind !== 'local') throw new Error('Expected local descriptor');
    const target = { ...file, id: 'target-uuid' };
    expect(findContinuationLocal(track, [target])?.id).toBe('target-uuid');
    expect(findContinuationLocal(track, [{ ...target, fileSize: 1 }])).toBeNull();
    expect(findContinuationLocal(track, [target, { ...target, id: 'duplicate' }])).toBeNull();
    expect(projectContinuationTrack(localSong, [])).toBeNull();
    expect(JSON.stringify(track)).not.toContain('source-uuid');
  });
  it.each([
    '{}', 'null', 'invalid-json', JSON.stringify({ schemaVersion: 9 }),
    encode().replace('37.25', '-1'), encode().replace('"currentIndex":0', '"currentIndex":9'),
    encode().replace('"kind":"online"', '"kind":"stage"'),
    encode().replace('"playing":false', '"playing":"false"'), '歌'.repeat(CONTINUATION_MAX_BYTES),
  ])('rejects malformed, unsupported or oversized payloads', payload => {
    expect(() => decodeContinuation(payload)).toThrow();
  });
  it('refuses unsupported source kinds', () => {
    expect(() => encode({ song: { ...song(1), sourceRef: { kind: 'stage', mediaId: 'one' } } })).toThrow();
  });
});
