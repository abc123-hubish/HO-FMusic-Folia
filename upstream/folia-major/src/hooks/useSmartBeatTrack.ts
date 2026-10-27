import { useEffect, useRef, type MutableRefObject } from 'react';
import { selectDisplaySong, selectDisplayDuration, usePlaybackStore } from '../stores/usePlaybackStore';
import { useVisualizerSettingsStore } from '../stores/useVisualizerSettingsStore';
import { useThemeSettingsStore } from '../stores/useThemeSettingsStore';
import { useSmartBeatStore } from '../stores/useSmartBeatStore';
import { useAppVisibility } from './useAppVisibility';
import { beginBeatFxTrack, setBeatFxEvents, setBeatFxIntensities, setBeatFxLiveEffects, stopBeatFx } from '../services/beatFx/beatFxLive';
import { BEAT_EFFECT_IDS, resolveBeatEffectSetting } from '../services/beatFx/beatEffects';
import { loadSmartBeat, loadStoredSmartBeat, smartBeatTrackKey, isSmartBeatPreview } from '../services/beatFx/smartBeatSource';
import { mergeBeatFxEvents } from '../services/beatFx/clock';
import { probeSmartBeat } from '../services/beatFx/smartBeatClient';
import { CPU_BEAT_MODEL } from '../services/beatFx/smartBeatCpu';

// src/hooks/useSmartBeatTrack.ts
// Only discrete track/settings changes enter React. Seeking and beat envelopes stay in the playback clock.
const EFFECTS: Record<string, string[]> = {
    hanabi: [BEAT_EFFECT_IDS.hanabiBeatBursts, BEAT_EFFECT_IDS.hanabiBeatPulse],
    sonnet: [BEAT_EFFECT_IDS.sonnetLensTear], diorama: [BEAT_EFFECT_IDS.dioramaRipple],
};
export function useSmartBeatTrack(audioRef: MutableRefObject<HTMLAudioElement | null>) {
    const song = usePlaybackStore(selectDisplaySong);
    const visualizer = useVisualizerSettingsStore(state => state.visualizerMode);
    const staticMode = useThemeSettingsStore(state => state.staticMode);
    const visible = useAppVisibility();
    const settings = useSmartBeatStore(state => state.settings);
    const retry = useSmartBeatStore(state => state.retry);
    const duration = usePlaybackStore(selectDisplayDuration);
    // Only use the store URL for its own current song; a blend still displays the outgoing track.
    const audioSrc = usePlaybackStore(state => state.transitionDisplay ? null : state.audioSrc);
    const track = song ? { ...song, durationMs: song.durationMs || duration * 1000 } : null;
    const key = track ? smartBeatTrackKey(track) : null;
    const latest = useRef(track); latest.current = track;
    const activeIds = settings.mode === 'off' || staticMode || !visible ? []
        : (EFFECTS[visualizer] || []).filter(id => resolveBeatEffectSetting(settings, id).on && resolveBeatEffectSetting(settings, id).strength > 0);
    const effectKey = activeIds.join(',');
    useEffect(() => {
        const strengths = Object.fromEntries(activeIds.map(id => [id, resolveBeatEffectSetting(settings, id).strength]));
        setBeatFxLiveEffects(strengths);
        const strength = activeIds.length ? Math.max(...Object.values(strengths)) : 0;
        setBeatFxIntensities(strength, strength);
    }, [effectKey, settings]);
    useEffect(() => {
        if (!key || !latest.current || !effectKey) {
            stopBeatFx();
            useSmartBeatStore.getState().report('idle', settings.mode === 'off' ? 'off' : staticMode ? 'static'
                : !visible ? 'background' : !EFFECTS[visualizer] ? 'style' : !key ? 'waiting-audio' : 'effects-off');
            return;
        }
        const track = latest.current, controller = new AbortController();
        let timer: ReturnType<typeof setTimeout> | undefined;
        let running = false, ready = false;
        beginBeatFxTrack(key);
        const report = useSmartBeatStore.getState().report;
        const run = async (attempt = 0): Promise<void> => {
            if (running || ready || controller.signal.aborted) return;
            running = true;
            try {
                if (isSmartBeatPreview(track, audioSrc)) { report('unavailable', 'preview'); return; }
                let result = await loadStoredSmartBeat(track);
                const stored = !!result;
                if (controller.signal.aborted) return;
                if (!result && settings.mode === 'on') {
                    if (!await probeSmartBeat()) { report('unsupported', 'decoder'); return; }
                    if (controller.signal.aborted) return;
                    report('reading');
                    result = await loadSmartBeat(track, controller.signal, () => report('analysing'), audioSrc);
                }
                if (controller.signal.aborted) return;
                if (!result) { report('unavailable', 'no-cache'); return; }
                if (!result.beats.length) { ready = true; report('unavailable', 'no-beats'); return; }
                const events = mergeBeatFxEvents(result.beats, result.downbeats, result.accents);
                const engine = result.model === CPU_BEAT_MODEL ? 'cpu' : 'gpu';
                setBeatFxEvents(key, events, engine === 'cpu' ? 'cpu' : 'beat_this', undefined, result.accents.trackScale);
                useSmartBeatStore.setState({ engine, progress: 100 });
                ready = true;
                report(stored ? 'cached' : 'ready', '', events.length);
            } catch (error) {
                if (controller.signal.aborted) return;
                const note = error instanceof Error ? error.message : String(error);
                if (note === 'no-audio' && attempt < 3) { timer = setTimeout(() => void run(attempt + 1), 2000); return; }
                report(note.includes('WebGPU') ? 'unsupported' : ['preview', 'partial-audio', 'no-audio'].includes(note) ? 'unavailable' : 'error', note);
            } finally { running = false; }
        };
        const audio = audioRef.current;
        const checkLoadedSource = () => {
            if (isSmartBeatPreview(track, audioSrc)) {
                controller.abort(); clearTimeout(timer); stopBeatFx(); report('unavailable', 'preview');
            } else { clearTimeout(timer); void run(); }
        };
        audio?.addEventListener('loadedmetadata', checkLoadedSource);
        void run();
        return () => { controller.abort(); clearTimeout(timer); audio?.removeEventListener('loadedmetadata', checkLoadedSource); stopBeatFx(); };
    }, [audioRef, key, audioSrc, settings.mode, effectKey, retry, staticMode, visible, visualizer]);
}
