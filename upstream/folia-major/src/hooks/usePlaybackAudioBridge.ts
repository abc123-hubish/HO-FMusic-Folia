import { useCallback, useEffect, useRef } from 'react';
import type { MutableRefObject, RefObject } from 'react';
import { PlayerState } from '../types';
import type { ReplayGainInfo, ReplayGainMode, SongResult, StatusMessage } from '../types';
import type { LocalSong } from '../types';
import { resolveNavidromePlaybackCarrier } from '../utils/appPlaybackGuards';
import { calculateReplayGain } from '../utils/replayGain';
import { applyAudioEqualizerSettings } from '../services/audioEqualizerGraph';
import { type AudioEffectChain } from '../services/audioEffects/effectChain';
import { buildPlaybackGraph } from '../services/playbackGraph';
import { cachePlayedTrackAssets } from '../services/playedTrackCache';
import { registerPlaybackFadeGraph } from '../services/playbackFade';
import { playbackSourceEnvelope, registerPlaybackSourceGraph } from '../services/playbackSourceEnvelope';
import { rampGain, type AutomixDeckChain } from '../services/automix/crossfadeGraph';
import { setStatusMessage as setStatusMsg } from '../stores/useStatusMessageStore';
import { isPlaybackFailureStatus } from '../services/playbackRecovery/playbackFailurePolicy';
import { useAudioSettingsStore } from '../stores/useAudioSettingsStore';
import { setPlayerState } from '../stores/usePlaybackStore';
import { useTranslation } from 'react-i18next';
import { usePlaybackStore } from '../stores/usePlaybackStore';
import { useAppViewStore } from '../stores/useAppViewStore';

// src/hooks/usePlaybackAudioBridge.ts

type UsePlaybackAudioBridgeParams = {

    audioRef: RefObject<HTMLAudioElement | null>;
    localSongs: LocalSong[];
    isLyricsLoading: boolean;
    shouldAutoPlayRef: MutableRefObject<boolean>;
    audioContextRef: MutableRefObject<AudioContext | null>;
    analyserRef: MutableRefObject<AnalyserNode | null>;
    gainNodeRef: MutableRefObject<GainNode | null>;
    /** Wires both automix decks into the shared mix point. Returns false if a deck is missing. */
    connectDecks: (context: AudioContext, output: AudioNode) => boolean;
    /** The deck the app is currently listening through, for per-track loudness compensation. */
    getActiveChain: () => AutomixDeckChain | null;
    /** Set when a pause interrupted an armed transition; suppresses exactly one autoplay. */
    suppressAutoplayRef: MutableRefObject<boolean>;
    /** True while automix has the next track loaded but its blend is not due to start yet. */
    isAutoplayHeld: boolean;
    isTransitionAudible?: () => boolean;
    syncOutputGain: (targetVolume: number, smoothing?: number) => void;
    getTargetPlaybackVolume: () => number;
    getCoverUrl: () => string | null;
    updateCacheSize: () => void;
};

// Bridges audio element setup, autoplay, replay gain, and media caching.
export function usePlaybackAudioBridge({
    audioRef,
    localSongs,
    isLyricsLoading,
    shouldAutoPlayRef,
    audioContextRef,
    analyserRef,
    gainNodeRef,
    connectDecks,
    getActiveChain,
    suppressAutoplayRef,
    isAutoplayHeld,
    isTransitionAudible,
    syncOutputGain,
    getTargetPlaybackVolume,
    getCoverUrl,
    updateCacheSize,
}: UsePlaybackAudioBridgeParams) {
    // Read here rather than passed in: all store fields or i18n.
    const { t } = useTranslation();
    const audioSrc = usePlaybackStore(state => state.audioSrc);
    const currentSong = usePlaybackStore(state => state.currentSong);
    const replayGainMode = usePlaybackStore(state => state.replayGainMode);
    const enableMediaCache = useAudioSettingsStore(state => state.enableMediaCache);
    const isPanelOpen = useAppViewStore(state => state.isPanelOpen);
    const panelTab = useAppViewStore(state => state.panelTab);

    const previousAudioSrcRef = useRef<string | null>(null);
    const autoplayGenerationRef = useRef(0);
    const replayGainLogSignatureRef = useRef<string | null>(null);
    const equalizerNodesRef = useRef<BiquadFilterNode[]>([]);
    const effectChainRef = useRef<AudioEffectChain | null>(null);
    const audioEqualizerSettings = useAudioSettingsStore(state => state.audioEqualizerSettings);

    // Recalculates source-specific gain after the audio graph or playback settings become ready.
    const applyReplayGain = useCallback(() => {
        if (!currentSong || !gainNodeRef.current || !audioContextRef.current) return;

        let replayGainInfo: ReplayGainInfo | undefined;
        const localSongId = (currentSong as SongResult & { localRef?: { songId: string } }).localRef?.songId;
        const localData = localSongId ? localSongs.find(song => song.id === localSongId) : undefined;
        if ((currentSong as SongResult & { isLocal?: boolean }).isLocal && localData) {
            replayGainInfo = {
                trackGain: typeof localData.replayGainTrackGain === 'number'
                    ? localData.replayGainTrackGain
                    : localData.replayGain,
                trackPeak: localData.replayGainTrackPeak,
                albumGain: localData.replayGainAlbumGain,
                albumPeak: localData.replayGainAlbumPeak,
            };
        }

        const navidromeSong = resolveNavidromePlaybackCarrier(currentSong);
        const navidromeReplayGain = navidromeSong?.navidromeData.replayGain;
        if (navidromeReplayGain) {
            replayGainInfo = navidromeReplayGain;
        }

        if (currentSong.sourceRef?.kind === 'online') {
            replayGainInfo = currentSong.replayGain;
        }

        const calculation = calculateReplayGain(replayGainInfo, replayGainMode);

        try {
            // Onto the deck rather than the shared output: loudness compensation is a per-track
            // value, so during a blend the two decks legitimately need different ones.
            const activeChain = getActiveChain();
            if (activeChain) {
                rampGain(audioContextRef.current, activeChain.replayGain, calculation.linearGain, 0.1);
            }

            const replayGainLogSignature = JSON.stringify({
                songId: currentSong.id,
                mode: replayGainMode,
                raw: calculation.gainDb,
                effective: calculation.effectiveGainDb,
                peak: calculation.peak ?? null,
            });

            if (replayGainLogSignatureRef.current !== replayGainLogSignature) {
                replayGainLogSignatureRef.current = replayGainLogSignature;
                console.log(`[AudioContext] ReplayGain mode=${replayGainMode} gain=${calculation.effectiveGainDb}dB (raw=${calculation.gainDb}dB, peak=${calculation.peak ?? 'n/a'}, linear=${calculation.linearGain.toFixed(2)})`);
            }
        } catch (error) {
            console.warn('[AudioContext] Failed to apply ReplayGain', error);
        }
    }, [audioContextRef, currentSong, gainNodeRef, getActiveChain, localSongs, replayGainMode]);

    const setupAudioAnalyzer = useCallback(() => {
        // The context is the sentinel, not the source node: a deck that failed to connect must
        // not let this run twice, because createMediaElementSource throws on a second call.
        if (!audioRef.current || audioContextRef.current) return;
        try {
            const AudioContextClass = window.AudioContext || (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
            const ctx = new AudioContextClass({ latencyHint: 'playback' });
            audioContextRef.current = ctx;

            const analyser = ctx.createAnalyser();
            analyser.fftSize = 2048;
            analyser.smoothingTimeConstant = 0.6;
            analyserRef.current = analyser;

            const { gainNode, fadeNode, sourceFadeNode, effectChain, decksConnected } = buildPlaybackGraph({
                context: ctx,
                analyser,
                connectDecks,
                equalizerNodesRef,
                settings: audioEqualizerSettings,
            });
            gainNodeRef.current = gainNode;
            // Hands the transport its own fade node; until this runs (or if setup fails) pause and
            // resume see no graph and fall back to plain element pause/play.
            registerPlaybackFadeGraph({ context: ctx, gain: fadeNode });
            registerPlaybackSourceGraph({ context: ctx, gain: sourceFadeNode });
            effectChainRef.current = effectChain;
            if (!decksConnected) {
                console.warn('[AudioContext] Deck setup incomplete, automix will stay idle');
            }
            applyReplayGain();
            syncOutputGain(getTargetPlaybackVolume(), 0);
        } catch (error) {
            console.error('Audio Context Setup Failed:', error);
        }
    }, [analyserRef, applyReplayGain, audioContextRef, audioEqualizerSettings, audioRef, connectDecks, gainNodeRef, getTargetPlaybackVolume, syncOutputGain]);

    /**
     * Writes a fully-played track's audio and cover into the media cache.
     *
     * Takes the song and its source explicitly rather than reading `currentSong`/`audioSrc`, because
     * the automix settle path caches the track that just faded OUT - and by then the app's own state
     * already names the track that arrived. `coverUrl` is passed for the currently-displayed track
     * (which may carry a user override); left undefined - the automix path - the cover is taken from
     * the song's own metadata instead.
     *
     * The writes themselves live in `cachePlayedTrackAssets`, which is where the audio and cover
     * conditions are kept apart from each other; this only adds the setting gate and the readout
     * refresh, neither of which belongs in a service.
     */
    const cacheSongAssetsFor = useCallback(async (
        song: SongResult | null,
        src: string | null,
        coverUrl?: string | null,
    ) => {
        if (!enableMediaCache) return;

        const written = await cachePlayedTrackAssets(song, src, coverUrl);

        if ((written.audio || written.cover) && isPanelOpen && panelTab === 'account') {
            updateCacheSize();
        }
    }, [enableMediaCache, isPanelOpen, panelTab, updateCacheSize]);

    const cacheSongAssets = useCallback(
        () => cacheSongAssetsFor(currentSong, audioSrc, getCoverUrl()),
        [audioSrc, cacheSongAssetsFor, currentSong, getCoverUrl],
    );

    useEffect(() => {
        if (audioRef.current) {
            syncOutputGain(getTargetPlaybackVolume(), 0.015);
        }
    }, [audioRef, getTargetPlaybackVolume, syncOutputGain]);

    useEffect(() => {
        localStorage.setItem('local_replaygain_mode', replayGainMode);
    }, [replayGainMode]);

    useEffect(() => {
        applyReplayGain();
    }, [applyReplayGain]);

    useEffect(() => {
        const context = audioContextRef.current;
        if (!context || equalizerNodesRef.current.length === 0) {
            return;
        }
        applyAudioEqualizerSettings(context, equalizerNodesRef.current, audioEqualizerSettings);
        effectChainRef.current?.apply(audioEqualizerSettings.effects, audioEqualizerSettings.enabled);
    }, [audioContextRef, audioEqualizerSettings]);

    useEffect(() => () => {
        autoplayGenerationRef.current += 1;
        registerPlaybackSourceGraph(null);
        registerPlaybackFadeGraph(null);
        effectChainRef.current?.dispose();
        effectChainRef.current = null;
    }, []);

    useEffect(() => {
        // React already changes the element's src, which starts the media load algorithm. A
        // second load() aborts its buffered data and can interrupt the new play() request.
        if (previousAudioSrcRef.current !== audioSrc) autoplayGenerationRef.current += 1;
        previousAudioSrcRef.current = audioSrc;
    }, [audioRef, audioSrc]);

    useEffect(() => {
        if (audioSrc && audioRef.current) {
            // `audioRef` and `audioSrc` describe the same track almost always - but not while a
            // blend is being armed. Automix repoints the ref at the incoming deck the instant it
            // arms, and `audioSrc` keeps naming the OUTGOING track until playSong has resolved the
            // next URL, which takes an await or two. Playing in that window starts whatever the
            // incoming deck still had loaded from an earlier song AND spends the autoplay intent
            // on it, so when the real source lands there is nothing left to press play with: the
            // deck sits fully buffered at currentTime 0 in silence.
            //
            // The deck's own src attribute is written from `audioSrc`, so an exact match is the
            // whole test. Bail WITHOUT spending the intent - this effect runs again on the commit
            // that gives the deck its real source, and that run is the one meant to start it.
            if (audioRef.current.getAttribute('src') !== audioSrc) return;

            // The deck has already failed on this exact source and something else - the transcode
            // fallback - is off resolving it. play() on an element in error state cannot start
            // anything; it rejects with NotSupportedError. Pressing it here only spends the intent,
            // so when the recovered source lands there is nothing left to start the deck with.
            // Bail WITHOUT spending it, the same way the autoplay hold below does: replacing the
            // source runs this effect again, and that run is the one meant to start it.
            if (audioRef.current.error) return;

            if (shouldAutoPlayRef.current && !isLyricsLoading) {
                // The deck has its source and is buffering, but its blend is not due yet. Bail
                // WITHOUT spending the intent - this effect runs again when the hold lifts, and
                // that run is the one meant to start it.
                //
                // This is what keeps the load out of the blend. Pressing play here instead starts
                // the fade wherever loading happened to finish, which took the same second or two
                // off every transition and capped an eight second plan at three.
                if (isAutoplayHeld) {
                    // The outgoing deck is still sounding. playSong dropped the state to IDLE on
                    // its way past and nothing else puts it back until this deck starts, so left
                    // alone the transport reads "stopped" for the whole lead - and the play button
                    // it offers would start this deck early and take the blend with it.
                    setPlayerState(PlayerState.PLAYING);
                    return;
                }

                shouldAutoPlayRef.current = false;

                // Automix starts the next track seconds early, so a pause can land after the
                // advance is already in flight and too late to recall. Honour the pause instead:
                // without this the listener presses pause and the next song starts anyway.
                if (suppressAutoplayRef.current) {
                    suppressAutoplayRef.current = false;
                    setPlayerState(PlayerState.PAUSED);
                    return;
                }

                const element = audioRef.current;
                const generation = ++autoplayGenerationRef.current;
                const isCurrent = () => generation === autoplayGenerationRef.current
                    && audioRef.current === element
                    && usePlaybackStore.getState().audioSrc === audioSrc
                    && element.getAttribute('src') === audioSrc;
                const start = async () => {
                    let sourceToken: number | null = null;
                    try {
                        // Connect and attenuate before the first samples reach the output.
                        setupAudioAnalyzer();
                        const context = audioContextRef.current;
                        if (context?.state === 'suspended') {
                            void context.resume().catch(error => console.warn('[AudioContext] Resume failed', error));
                        }
                        if (!isCurrent()) return;
                        if ((element.paused || element.ended || playbackSourceEnvelope.needsStart()) && !isTransitionAudible?.()) {
                            sourceToken = playbackSourceEnvelope.prepareStart();
                        }
                        syncOutputGain(getTargetPlaybackVolume(), 0);
                        await element.play();
                        if (!isCurrent()) return;
                        if (sourceToken !== null) playbackSourceEnvelope.finishStart(sourceToken);
                        setPlayerState(PlayerState.PLAYING);
                        // Clear a failure only after this source has really started.
                        setStatusMsg(prev => (isPlaybackFailureStatus(prev) ? null : prev));
                    } catch (error) {
                        // An obsolete deck must never unmute or change the intent of its successor.
                        if (!isCurrent()) return;
                        if (sourceToken !== null) playbackSourceEnvelope.finishStart(sourceToken);
                        if (!element.paused && !element.ended) {
                            setPlayerState(PlayerState.PLAYING);
                            return;
                        }

                        // A current-source abort can be retried on its next commit. Obsolete
                        // source failures were filtered above and cannot spend a new intent.
                        if ((error as Error).name === 'AbortError') {
                            shouldAutoPlayRef.current = true;
                            return;
                        }

                        if ((error as Error).name === 'NotAllowedError') {
                            setStatusMsg({ type: 'info', text: t('status.clickToPlay') });
                            setPlayerState(PlayerState.PAUSED);
                        }
                    }
                };
                void start();
            }
        }
    }, [audioContextRef, audioRef, audioSrc, getTargetPlaybackVolume, isAutoplayHeld, isLyricsLoading, isTransitionAudible, setPlayerState, setStatusMsg, setupAudioAnalyzer, shouldAutoPlayRef, suppressAutoplayRef, syncOutputGain, t]);

    // An automix cancellation adopts a deck that is already sounding this source.
    const adoptActiveDeckSource = useCallback((src: string) => {
        previousAudioSrcRef.current = src;
    }, []);

    return {
        setupAudioAnalyzer,
        cacheSongAssets,
        cacheSongAssetsFor,
        adoptActiveDeckSource,
    };
}
