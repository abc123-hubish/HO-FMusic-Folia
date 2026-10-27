import type { LocalSong } from '../types';
import { PlayerState } from '../types';
import type { HarmonyNative, HarmonyPort } from './contracts';
import { decodeContinuation, encodeContinuation, findContinuationLocal, projectContinuationTrack } from './continuationData';
import { usePlaybackStore } from '../stores/usePlaybackStore';
import { currentTime } from '../stores/motionSignals';
import { useAppViewStore } from '../stores/useAppViewStore';
import { useVisualizerSettingsStore } from '../stores/useVisualizerSettingsStore';
import { useOnlineProviderAccountStore } from '../stores/useOnlineProviderAccountStore';
import { isBuiltinVisualizerMode } from '../types/visualizerModes';
import { buildLocalQueue } from '../services/playbackAdapters';
import { omni } from '../services/onlineMusic/omni';
import { isSamePlaybackSong } from '../utils/appPlaybackGuards';
import { beginPlaybackSourceRequest } from '../services/playbackSourceEnvelope';

// src/harmony/continuation.ts
// Resume through the ordinary source-aware playback pipeline after native files have been reconciled.
export function createHarmonyContinuation(native: HarmonyNative, getPort: () => HarmonyPort, getLocals: () => LocalSong[]) {
  let ready = false;
  let disposed = false;
  const payload = native.getContinuation?.();
  let restoring = !!payload;
  // Reserve at mount, before catalogue reconciliation: a later user action must win during startup too.
  const isLatest = payload ? beginPlaybackSourceRequest() : () => true;
  let advertised: boolean | undefined;
  const eligible = () => {
    const state = usePlaybackStore.getState();
    return ready && !disposed && !restoring && state.activePlaybackContext === 'main' && !state.transitionDisplay
      && !!state.audioSrc && !!state.currentSong
      && [PlayerState.PLAYING, PlayerState.PAUSED].includes(state.playerState)
      && !!projectContinuationTrack(state.currentSong, getLocals());
  };
  const updateAvailable = () => {
    const available = eligible();
    if (available === advertised) return;
    advertised = available;
    native.setContinuationAvailable?.(available);
  };
  return {
    updateAvailable,
    export(requestId: string) {
      try {
        if (!eligible()) throw new Error('播放器尚未就绪或正在切歌，请稍后接续');
        const state = usePlaybackStore.getState();
        native.completeContinuation?.(requestId, encodeContinuation({ transferId: crypto.randomUUID(),
          song: state.currentSong!, queue: state.playQueue, locals: getLocals(), positionSec: currentTime.get(),
          playing: state.playerState === PlayerState.PLAYING, view: useAppViewStore.getState().view,
          mode: useVisualizerSettingsStore.getState().visualizerMode }));
      } catch (error) {
        native.completeContinuation?.(requestId, '');
        native.toast(error instanceof Error ? error.message : '保存接续状态失败');
      }
    },
    // Every await is guarded: a user-selected track or an unmounted host supersedes this transfer.
    async start() {
      if (disposed || ready) return;
      ready = true;
      if (!payload) { updateAvailable(); return; }
      const isCurrent = () => !disposed && isLatest();
      try {
        if (!isCurrent()) return;
        const data = decodeContinuation(payload);
        const locals = getLocals();
        const resolved = data.queue.map(track => {
          if (track.kind === 'online') return omni.canPlaySong(track.song) ? track.song : null;
          const local = findContinuationLocal(track, locals);
          return local ? buildLocalQueue([local])[0] ?? null : null;
        });
        let song = resolved[data.currentIndex];
        if (!song) throw new Error(data.queue[data.currentIndex].kind === 'local'
          ? '接续失败：请先在此设备导入相同的本地歌曲；同名文件存在歧义时无法接续'
          : '接续失败：此设备未配置或不支持该音乐平台');
        const source = song.sourceRef;
        if (source?.kind === 'online') {
          // Fetch public metadata using the target's own account; never carry source URLs or login state.
          try {
            const fresh = await omni.getSongDetail(source.providerId, source.mediaId);
            if (fresh?.sourceRef.kind === 'online' && isSamePlaybackSong(fresh, song)) {
              song = { ...fresh, sourceRef: { ...fresh.sourceRef, variant: source.variant ?? fresh.sourceRef.variant,
                providerData: { ...source.providerData, ...fresh.sourceRef.providerData } },
              sourceType: song.sourceType ?? fresh.sourceType, t: song.t ?? fresh.t,
              qqMid: fresh.qqMid || song.qqMid, kgHash: fresh.kgHash || song.kgHash };
            }
          } catch (error) {
            console.warn('[Harmony continuation] Song detail unavailable; resolving by portable identity', error);
          }
          if (!isCurrent()) return;
          useOnlineProviderAccountStore.getState().setActiveProviderId(source.providerId);
        }
        if (!isCurrent()) return;
        resolved[data.currentIndex] = song;
        const queue = resolved.filter((item): item is NonNullable<typeof item> => item !== null);
        if (isBuiltinVisualizerMode(data.mode)) {
          useVisualizerSettingsStore.getState().handleSetVisualizerMode(data.mode, { notify: false });
        }
        const port = getPort();
        if (data.view === 'home') port.home();
        else if (data.view === 'lattice') port.lattice();
        else port.player();
        await port.restorePlayback(song, queue, { positionSec: data.positionSec, playing: data.playing });
        if (disposed) return;
        if (data.queueTruncated || queue.length !== data.queue.length) {
          native.toast('接续队列仅保留附近歌曲及此设备可用的音源');
        }
      } catch (error) {
        if (isCurrent()) native.toast(error instanceof Error ? error.message : '恢复接续失败，请重试');
      } finally {
        if (!disposed) native.finishContinuation?.(payload);
        restoring = false;
        updateAvailable();
      }
    },
    dispose() {
      disposed = true;
      native.setContinuationAvailable?.(false);
    },
  };
}
