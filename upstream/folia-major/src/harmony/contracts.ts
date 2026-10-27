import type { LocalSong, SongResult } from '../types';
import type { BodianOperation, BodianParams, BodianResult } from 'bodian-music-api';
import type { QishuiOperation, QishuiParams, QishuiBridgeResult } from 'qishui-music-api';
import type { PlaybackNavigationOptions } from '../types/appPlayback';

// Shared protocol between the Folia runtime and the restricted HarmonyOS host.
export interface NativeFile {
  id: string;
  name: string;
  size: number;
  modified: number;
  mime: string;
  url: string;
  relativePath?: string;
}
export interface HarmonyConfig { netease: string; kugou: string; qq: string; server: string; aiProvider: 'gemini' | 'openai'; }
export interface HarmonyWindowInsets {
  enabled: boolean; top: number; right: number;
  cutoutTop?: number; cutoutLeft?: number; cutoutRight?: number; cutoutBottom?: number;
}
export interface HarmonyTrack { id: string; title: string; artist: string; album: string; }
export interface HarmonySnapshotValues {
  ready: boolean; view: string; settings: boolean; mode: string;
  title: string; artist: string; cover: string; songId: string; playing: boolean;
  lyricLines: number; position: number; duration: number; searching: boolean; searchError: string;
}
// The first snapshot includes every list; subsequent updates omit unchanged lists.
export interface HarmonySnapshotUpdate extends HarmonySnapshotValues {
  queue?: HarmonyTrack[]; local?: HarmonyTrack[]; results?: HarmonyTrack[];
}
export interface HarmonyNative {
  getContinuation?(): string;
  finishContinuation?(payload: string): void;
  completeContinuation?(requestId: string, payload: string): void;
  setContinuationAvailable?(available: boolean): void;
  getAiConfig?(): string;
  saveAiConfig?(payload: string): string;
  requestAi?(id: string, payload: string): void;
  getConfig(): string;
  saveConfig(payload: string): string;
  getWindowInsets?(): string;
  getForeground?(): boolean;
  setWindowDaylight?(daylight: boolean): void;
  getPortraitMode(): boolean;
  setPortraitMode(enabled: boolean): void;
  getKeepScreenOn?(): boolean;
  setKeepScreenOn?(enabled: boolean): void;
  getFiles(): string;
  removeFiles(payload: string): void;
  openExternal(url: string): void;
  publish(payload: string): void;
  publishArtwork?(songId: string, cover: string, source: string): void;
  toast(message: string): void;
  beginBlob(id: string): void;
  appendBlob(id: string, base64: string): void;
  finishBlob(id: string): string;
  exportFile(id: string, name: string): void;
  requestImport(): void;
  requestBackend(id: string, payload: string): void;
  requestBodian?(id: string, operation: string, payload: string): void;
  requestQishui?(id: string, operation: string, payload: string): void;
  requestMusic?(id: string, provider: string, operation: string, payload: string): void;
  requestLocalCover?(id: string, payload: string): void;
}
export interface HarmonyPort {
  restorePlayback(song: SongResult, queue: SongResult[], initialPlayback: NonNullable<PlaybackNavigationOptions['initialPlayback']>): Promise<void>;
  playSong(song: SongResult): Promise<void>;
  playLocal(song: LocalSong): Promise<void>;
  playResult(song: SongResult): Promise<void>;
  reloadLocal(): Promise<void>;
  next(): Promise<void>;
  previous(): void;
  resume(): Promise<void>;
  pause(): void;
  seek(time: number): void;
  home(): void;
  lattice(): void;
  player(): void;
  search(query: string, source: string): void;
}
declare global {
  interface Window {
    HarmonyLifecycle?: { setForeground(foreground: boolean): void; };
    HarmonyAi?: { receive(id: string, payload: string): void; };
    FoliaNative?: HarmonyNative;
    HarmonyConfig?: HarmonyConfig;
    HarmonyApp?: {
      exportContinuation(requestId: string): void;
      command(payload: string): Promise<void>;
      importFiles(payload: string): Promise<void>;
      pickFiles(): Promise<LocalSong[]>;
    };
    HarmonyBackend?: { receive(id: string, payload: string): void; };
    HarmonyCover?: { receive(id: string, payload: string): void; };
    HarmonyMusic?: {
      request(provider: 'qq' | 'kugou', operation: string, params: Record<string, string | number | boolean | undefined>): Promise<unknown>;
      receive(id: string, payload: string): void;
    };
    HarmonyBodian?: {
      request(operation: BodianOperation, params: BodianParams): Promise<BodianResult>;
      receive(id: string, payload: string): void;
    };
    HarmonyQishui?: {
      request(operation: QishuiOperation, params: QishuiParams): Promise<QishuiBridgeResult>;
      receive(id: string, payload: string): void;
    };
  }
}
