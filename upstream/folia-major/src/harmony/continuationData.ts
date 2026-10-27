import type { LocalSong, SongResult } from '../types';
import type { JsonValue } from '../types/onlineMusic';
import { getPlaybackSongKey, getPlaybackSourceRef, isLocalPlaybackSong } from '../utils/appPlaybackGuards';

// src/harmony/continuationData.ts
// A bounded, credential-free description of playback; URLs and device-local IDs never cross devices.
export const CONTINUATION_MAX_BYTES = 80 * 1024;
const MAX_TRACKS = 256;
const providerKeys = ['songMid', 'mediaMid', 'songId', 'hash', 'mixSongId', 'albumAudioId',
  'catalogLookupId', 'albumId', 'hash320', 'hashSq', 'fileId'] as const;
export type ContinuationTrack = { kind: 'online'; song: SongResult } | {
  kind: 'local'; fileName: string; fileSize: number; durationMs: number;
};
export interface ContinuationData {
  schemaVersion: 1;
  transferId: string;
  positionSec: number;
  playing: boolean;
  view: 'home' | 'player' | 'lattice';
  mode: string;
  currentIndex: number;
  queue: ContinuationTrack[];
  queueTruncated: boolean;
}
const text = (value: unknown, limit = 256): string => typeof value === 'string' ? value.slice(0, limit) : '';
const id = (value: unknown): string | number => typeof value === 'number' && Number.isFinite(value)
  ? value : text(value);
const bytes = (value: string) => new TextEncoder().encode(value).byteLength;

function projectOnlineSong(song: SongResult): SongResult | null {
  const source = getPlaybackSourceRef(song);
  if (source.kind !== 'online' || !source.providerId || !source.mediaId) return null;
  const providerData: Record<string, JsonValue> = {};
  for (const key of providerKeys) {
    const value = source.providerData?.[key];
    if (typeof value === 'string') providerData[key] = text(value);
    else if (typeof value === 'number' && Number.isFinite(value)) providerData[key] = value;
  }
  return { id: id(song.id), name: text(song.name), durationMs: Number.isFinite(song.durationMs) ? song.durationMs : 0,
    artists: (song.artists || []).slice(0, 8).map(artist => ({ id: id(artist.id), name: text(artist.name) })),
    album: { id: id(song.album?.id), name: text(song.album?.name) },
    sourceRef: { kind: 'online', providerId: text(source.providerId, 64), mediaId: text(source.mediaId),
      variant: text(source.variant, 32) || undefined, providerData },
    qqMid: text(song.qqMid) || undefined, kgHash: text(song.kgHash) || undefined,
    sourceType: song.sourceType === 'cloud' ? 'cloud' : undefined,
    t: song.t === 1 || song.t === 2 ? song.t : undefined,
  };
}

export function projectContinuationTrack(song: SongResult, locals: readonly LocalSong[]): ContinuationTrack | null {
  if (isLocalPlaybackSong(song)) {
    const local = locals.find(item => item.id === song.localRef.songId);
    return local ? { kind: 'local', fileName: local.fileName, fileSize: local.fileSize, durationMs: local.duration } : null;
  }
  const online = projectOnlineSong(song);
  return online ? { kind: 'online', song: online } : null;
}

// Retain neighbours around the current track instead of overflowing Want or dropping the playing song.
export function encodeContinuation(input: Omit<ContinuationData, 'schemaVersion' | 'queue' | 'currentIndex' | 'queueTruncated'> & {
  song: SongResult; queue: readonly SongResult[]; locals: readonly LocalSong[];
}): string {
  const selected = projectContinuationTrack(input.song, input.locals);
  if (!selected) throw new Error('当前音源暂不支持应用接续');
  const sourceIndex = input.queue.findIndex(song => getPlaybackSongKey(song) === getPlaybackSongKey(input.song));
  const start = Math.max(0, sourceIndex - Math.floor(MAX_TRACKS / 2));
  const window = input.queue.slice(start, start + MAX_TRACKS);
  const entries = window.flatMap((song, index) => {
    const track = projectContinuationTrack(song, input.locals);
    return track ? [{ track, current: start + index === sourceIndex }] : [];
  });
  let currentIndex = entries.findIndex(entry => entry.current);
  if (currentIndex < 0) { entries.unshift({ track: selected, current: true }); currentIndex = 0; }
  else entries[currentIndex].track = selected;
  const data: ContinuationData = { schemaVersion: 1, transferId: input.transferId,
    positionSec: Math.max(0, Number.isFinite(input.positionSec) ? input.positionSec : 0), playing: input.playing,
    view: input.view, mode: input.mode, currentIndex, queue: entries.map(entry => entry.track),
    queueTruncated: input.queue.length > 0 && entries.length !== input.queue.length };
  let payload = JSON.stringify(data);
  while (bytes(payload) > CONTINUATION_MAX_BYTES && data.queue.length > 1) {
    if (data.currentIndex > (data.queue.length - 1) / 2) { data.queue.shift(); data.currentIndex--; }
    else data.queue.pop();
    data.queueTruncated = true;
    payload = JSON.stringify(data);
  }
  if (bytes(payload) > CONTINUATION_MAX_BYTES) throw new Error('接续数据过大，暂时无法接续');
  return payload;
}

export function decodeContinuation(payload: string): ContinuationData {
  if (bytes(payload) > CONTINUATION_MAX_BYTES) throw new Error('接续数据过大');
  const value = JSON.parse(payload) as ContinuationData;
  if (!value || value.schemaVersion !== 1 || typeof value.transferId !== 'string' || !value.transferId
    || value.transferId.length > 128 || typeof value.playing !== 'boolean' || !Number.isFinite(value.positionSec)
    || value.positionSec < 0 || value.positionSec > 7 * 24 * 3600
    || !['home', 'player', 'lattice'].includes(value.view) || typeof value.mode !== 'string'
    || !Array.isArray(value.queue) || !value.queue.length || value.queue.length > MAX_TRACKS + 1
    || !Number.isInteger(value.currentIndex) || value.currentIndex < 0 || value.currentIndex >= value.queue.length) {
    throw new Error('接续数据无效或版本不兼容，请更新两端应用后重试');
  }
  value.queue = value.queue.map(track => {
    if (track?.kind === 'local' && typeof track.fileName === 'string' && track.fileName.length <= 1024
      && Number.isFinite(track.fileSize) && track.fileSize > 0 && Number.isFinite(track.durationMs) && track.durationMs >= 0) {
      return { kind: 'local', fileName: track.fileName, fileSize: track.fileSize, durationMs: track.durationMs };
    }
    if (track?.kind === 'online' && track.song?.sourceRef?.kind === 'online'
      && typeof track.song.sourceRef.providerId === 'string' && typeof track.song.sourceRef.mediaId === 'string'
      && typeof track.song.name === 'string' && Array.isArray(track.song.artists)
      && track.song.artists.every(artist => artist && typeof artist.name === 'string')) {
      const song = projectOnlineSong(track.song);
      if (song) return { kind: 'online', song };
    }
    throw new Error('接续歌曲数据无效');
  });
  return value;
}

export function findContinuationLocal(track: Extract<ContinuationTrack, { kind: 'local' }>, locals: readonly LocalSong[]): LocalSong | null {
  const matches = locals.filter(song => song.fileName === track.fileName && song.fileSize === track.fileSize
    && Math.abs(song.duration - track.durationMs) < 1000);
  // UUIDs are device-specific. Refuse ambiguous matches instead of playing an unrelated same-name file.
  return matches.length === 1 ? matches[0] : null;
}
