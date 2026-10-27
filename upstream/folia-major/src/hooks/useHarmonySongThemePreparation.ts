import { useEffect, useRef } from 'react';
import { getHarmonyAiConfig, hasHarmonyAi, useHarmonyAiConfig } from '../harmony/aiConfig';
import { getCachedThemeStateForSong } from '../services/themeCache';
import { sanitizeDualTheme } from '../services/themeSanitizer';
import { usePlaybackStore } from '../stores/usePlaybackStore';
import type { DualTheme, ThemeMode } from '../types';
import { getPlaybackSongKey } from '../utils/appPlaybackGuards';
import type { GenerateAIThemeOptions, GenerateAIThemeResult } from './useThemeController';
import { useStableCallbacks } from './useStableCallbacks';
import { hasSongThemePromptSource } from '../utils/songThemeAutoGeneration';

type PreparationParams = {
    generate: (lyrics: ReturnType<typeof usePlaybackStore.getState>['lyrics'], song: ReturnType<typeof usePlaybackStore.getState>['currentSong'], options: GenerateAIThemeOptions) => Promise<GenerateAIThemeResult>;
    apply: (theme: DualTheme) => void;
    selectAi: () => void;
    getMode: () => ThemeMode;
    getAutoGenerateEnabled: () => boolean;
    autoGenerateEnabled: boolean;
    mode: ThemeMode;
};

// An explicit AI selection uses the user's model even when automatic generation is set to covers.
// Selection and opening the editor share the same promise, including the cache lookup.
export function useHarmonySongThemePreparation({ generate, apply, selectAi, getMode, getAutoGenerateEnabled, autoGenerateEnabled, mode }: PreparationParams) {
    const pending = useRef(new Map<string, Promise<GenerateAIThemeResult>>());
    const attemptedSongKeys = useRef(new Set<string>());
    const waitingForLyrics = useRef<string | null>(null);
    const currentSong = usePlaybackStore(state => state.currentSong);
    const lyrics = usePlaybackStore(state => state.lyrics);
    const config = useHarmonyAiConfig();
    const previousConfig = useRef(config);
    const { prepare } = useStableCallbacks({
        prepare: (options: Pick<GenerateAIThemeOptions, 'source' | 'shouldApply'> = {}): Promise<GenerateAIThemeResult> => {
            if (!hasHarmonyAi() || !getHarmonyAiConfig().enabled) {
                return Promise.resolve({ status: 'skipped', reason: 'unconfigured' });
            }
            const { currentSong } = usePlaybackStore.getState();
            if (!currentSong) return Promise.resolve({ status: 'skipped', reason: 'no-song' });
            if (options.source !== 'auto') selectAi();
            const songKey = getPlaybackSongKey(currentSong);
            const existing = pending.current.get(songKey);
            if (existing) return existing;
            const shouldApply = () => {
                const song = usePlaybackStore.getState().currentSong;
                return Boolean(song && getPlaybackSongKey(song) === songKey && getMode() === 'ai'
                    && (options.shouldApply?.() ?? true)
                    && (options.source !== 'auto' || getAutoGenerateEnabled()));
            };
            const task = Promise.resolve().then(async (): Promise<GenerateAIThemeResult> => {
                const cached = await getCachedThemeStateForSong(currentSong);
                const cachedTheme = cached.kind === 'dual' ? cached.theme
                    : cached.kind === 'legacy' ? sanitizeDualTheme({ light: cached.theme, dark: cached.theme }) : null;
                if (cachedTheme && cachedTheme.light.provider !== 'Built-in' && cachedTheme.dark.provider !== 'Built-in') {
                    const applied = shouldApply();
                    if (applied) apply(cachedTheme);
                    return { status: 'generated', applied };
                }
                if (!shouldApply()) return { status: 'generated', applied: false };
                if (!getAutoGenerateEnabled()) return { status: 'skipped', reason: 'auto-disabled' };
                if (options.source === 'auto' && attemptedSongKeys.current.has(songKey)) {
                    return { status: 'skipped', reason: 'in-flight' };
                }
                const latestLyrics = usePlaybackStore.getState().lyrics;
                if (hasSongThemePromptSource(currentSong, latestLyrics)) attemptedSongKeys.current.add(songKey);
                const result = await generate(latestLyrics, currentSong, {
                    source: options.source ?? 'manual', generationSource: 'ai', respectCustomPreference: false,
                    shouldApply: () => shouldApply() && getAutoGenerateEnabled(),
                });
                if (shouldApply()) {
                    waitingForLyrics.current = result.status === 'skipped' && result.reason === 'empty-prompt' ? songKey : null;
                } else if (waitingForLyrics.current === songKey) waitingForLyrics.current = null;
                return result;
            }).catch((error: unknown): GenerateAIThemeResult => ({
                status: 'failed', error: error instanceof Error ? error.message : String(error),
            })).finally(() => { pending.current.delete(songKey); });
            pending.current.set(songKey, task);
            return task;
        },
    });
    useEffect(() => {
        if (!waitingForLyrics.current) return;
        if (!currentSong || getPlaybackSongKey(currentSong) !== waitingForLyrics.current || mode !== 'ai') {
            waitingForLyrics.current = null;
            return;
        }
        if (lyrics?.lines.some(line => line.fullText.trim())) {
            waitingForLyrics.current = null;
            void prepare();
        }
    }, [currentSong, lyrics, mode, prepare]);
    useEffect(() => {
        if (!autoGenerateEnabled) attemptedSongKeys.current.clear();
    }, [autoGenerateEnabled]);
    useEffect(() => {
        const changed = previousConfig.current !== config;
        previousConfig.current = config;
        if (changed && config.enabled && hasHarmonyAi() && mode === 'ai') void prepare();
    }, [config, mode, prepare]);
    return { prepare, enabled: hasHarmonyAi() && config.enabled };
}
