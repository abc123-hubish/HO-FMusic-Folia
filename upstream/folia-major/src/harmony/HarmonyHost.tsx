import { useEffect, useRef } from 'react';
import type { HarmonyPort } from './contracts';
import { usePlaybackStore, selectDisplayCoverUrl, selectDisplaySong, selectDisplayLyrics } from '../stores/usePlaybackStore';
import { useAppViewStore } from '../stores/useAppViewStore';
import { useSearchNavigationStore } from '../stores/useSearchNavigationStore';
import { useSettingsModalStore } from '../stores/useSettingsModalStore';
import { useVisualizerSettingsStore } from '../stores/useVisualizerSettingsStore';
import { useStatusMessageStore } from '../stores/useStatusMessageStore';
import { getLocalSongs } from '../services/db';
import { getSongArtistLabel } from '../services/onlineMusic/songMetadata';
import { currentTime } from '../stores/motionSignals';
import { importHarmonyFiles } from './localImport';
import { isBuiltinVisualizerMode } from '../types/visualizerModes';
import type { LocalSong } from '../types';
import { getPlaybackSongKey } from '../utils/appPlaybackGuards';
import { liveQuery } from 'dexie';
import { createHarmonySnapshotPublisher } from './snapshotPublisher';
import { createHarmonyArtworkPublisher } from './artworkPublisher';
import { createHarmonyContinuation } from './continuation';

// A small host port reuses Folia's playback and navigation controllers without duplicating provider logic.
export default function HarmonyHost({ port }: { port: HarmonyPort }) {
  const latest = useRef(port);
  latest.current = port;
  useEffect(() => {
    const native = window.FoliaNative;
    if (!native) return;
    const sendSnapshot = createHarmonySnapshotPublisher(payload => native.publish(payload));
    const artwork = createHarmonyArtworkPublisher((songId, cover, source) => native.publishArtwork?.(songId, cover, source));
    let publishTimer: number | undefined;
    let disposed = false;
    let imported: LocalSong[] = [];
    const continuation = createHarmonyContinuation(native, () => latest.current, () => imported);
    let resolvePicker: ((songs: LocalSong[]) => void) | undefined;
    const publish = () => {
      if (disposed) return;
      continuation.updateAvailable();
      const state = usePlaybackStore.getState();
      const search = useSearchNavigationStore.getState();
      const song = selectDisplaySong(state);
      const songId = song ? getPlaybackSongKey(song) : '';
      const cover = selectDisplayCoverUrl(state) || '';
      sendSnapshot({ ready: true, view: useAppViewStore.getState().view,
        settings: useSettingsModalStore.getState().settingsModalState.isOpen,
        mode: useVisualizerSettingsStore.getState().visualizerMode,
        title: song?.name || '', artist: getSongArtistLabel(song), cover,
        songId, playing: state.playerState === 'PLAYING',
        lyricLines: selectDisplayLyrics(state)?.lines.length || 0,
        position: currentTime.get(), duration: state.duration,
        searching: search.isSearching, searchError: search.searchError || '',
      }, { queue: state.playQueue, results: search.searchResults, local: imported });
      if (native.publishArtwork) artwork.update(songId, cover);
    };
    // One user action can change several stores synchronously; publish their final state together.
    const schedulePublish = () => {
      if (disposed || publishTimer !== undefined) return;
      publishTimer = window.setTimeout(() => { publishTimer = undefined; publish(); }, 0);
    };
    const invoke = async (payload: string) => {
      const command = JSON.parse(payload);
      const p = latest.current;
      switch (command.action) {
        case 'home': p.home(); break;
        case 'player': p.player(); break;
        case 'play': await p.resume(); break;
        case 'pause': p.pause(); break;
        case 'toggle': usePlaybackStore.getState().playerState === 'PLAYING' ? p.pause() : await p.resume(); break;
        case 'next': await p.next(); break;
        case 'previous': p.previous(); break;
        case 'seek': {
          const time = Number(command.id) / 1000;
          if (Number.isFinite(time)) {
            const duration = usePlaybackStore.getState().duration;
            const target = Math.max(0, duration > 0 ? Math.min(time, duration) : time);
            p.seek(target); currentTime.set(target);
          }
          break;
        }
        case 'search': p.search(command.query, command.source); break;
        case 'local': {
          const song = (await getLocalSongs()).find(item => item.id === command.id);
          if (song) await p.playLocal(song); break;
        }
        case 'result': {
          const song = useSearchNavigationStore.getState().searchResults?.find(item => getPlaybackSongKey(item) === command.id);
          if (song) await p.playResult(song); break;
        }
        case 'queue': {
          const song = usePlaybackStore.getState().playQueue.find(item => getPlaybackSongKey(item) === command.id);
          if (song) await p.playSong(song); break;
        }
        case 'mode': if (isBuiltinVisualizerMode(command.id)) {
          useVisualizerSettingsStore.getState().handleSetVisualizerMode(command.id, { notify: false });
        } break;
        case 'settings': useSettingsModalStore.getState().openSettings('options', command.section || 'appearance'); break;
        case 'dismissSettings': useSettingsModalStore.getState().closeSettings(); break;
        case 'close': useSettingsModalStore.getState().closeSettings(); p.home(); break;
      }
      void publish();
    };
    window.HarmonyApp = { exportContinuation: requestId => continuation.export(requestId), command: async payload => {
      try { await invoke(payload); } catch (error) { native.toast(error instanceof Error ? error.message : String(error)); }
    }, pickFiles: () => new Promise(resolve => {
      if (resolvePicker) { resolve([]); return; }
      resolvePicker = resolve;
      native.requestImport();
    }), importFiles: async payload => {
      try {
        const files = JSON.parse(payload);
        await importHarmonyFiles(files);
        await latest.current.reloadLocal();
        imported = await getLocalSongs();
        if (resolvePicker) { resolvePicker(imported); resolvePicker = undefined; }
        if (files.length) native.toast('音乐已导入');
        await publish();
      } catch (error) {
        resolvePicker?.([]); resolvePicker = undefined;
        native.toast(error instanceof Error ? error.message : String(error));
      }
    } };
    const unsubscribers = [usePlaybackStore.subscribe((next, previous) => {
      // Lyric-line indices and DSP settings never change native display data; the clock has its own timer.
      if (next.playerState !== previous.playerState || next.duration !== previous.duration ||
        next.playQueue !== previous.playQueue || next.audioSrc !== previous.audioSrc ||
        next.activePlaybackContext !== previous.activePlaybackContext || next.transitionDisplay !== previous.transitionDisplay ||
        selectDisplaySong(next) !== selectDisplaySong(previous) ||
        selectDisplayCoverUrl(next) !== selectDisplayCoverUrl(previous) ||
        selectDisplayLyrics(next)?.lines.length !== selectDisplayLyrics(previous)?.lines.length) schedulePublish();
    }), useAppViewStore.subscribe((next, previous) => {
      if (next.view !== previous.view) schedulePublish();
    }), useSearchNavigationStore.subscribe((next, previous) => {
      if (next.searchResults !== previous.searchResults || next.isSearching !== previous.isSearching ||
        next.searchError !== previous.searchError) schedulePublish();
    }), useSettingsModalStore.subscribe((next, previous) => {
      if (next.settingsModalState.isOpen !== previous.settingsModalState.isOpen) schedulePublish();
    }), useVisualizerSettingsStore.subscribe((next, previous) => {
      if (next.visualizerMode !== previous.visualizerMode) schedulePublish();
    }),
      useStatusMessageStore.subscribe(state => {
        const message = state.message;
        // Button-bearing confirmations stay in AppDialogs, so they must not also produce a native toast.
        if (message && !message.onAction && !message.onCancel) native.toast(message.text);
      })];
    const timer = window.setInterval(() => { void publish(); }, 1000);
    const catalogue = liveQuery(getLocalSongs).subscribe(songs => { imported = songs; schedulePublish(); });
    // Native files survive app restarts. Reconcile their index once, then publish the real catalogue.
    void importHarmonyFiles(JSON.parse(native.getFiles())).then(async () => {
      await latest.current.reloadLocal(); imported = await getLocalSongs();
    }).catch(error => native.toast(error instanceof Error ? error.message : String(error))).finally(async () => {
      if (!disposed) { await continuation.start(); publish(); }
    });
    return () => { disposed = true; clearInterval(timer); clearTimeout(publishTimer);
      artwork.dispose();
      continuation.dispose();
      catalogue.unsubscribe(); unsubscribers.forEach(fn => fn()); delete window.HarmonyApp; };
  }, []);
  return null;
}
