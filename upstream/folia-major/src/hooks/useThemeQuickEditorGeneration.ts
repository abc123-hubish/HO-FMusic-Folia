import { useEffect, useState } from 'react';
import { hasHarmonyAi, useHarmonyAiConfig } from '../harmony/aiConfig';
import type { GenerateAIThemeResult } from './useThemeController';

export type ThemeEditorGeneration = {
    state: 'idle' | 'loading' | 'failed';
    messageKey?: string;
    error?: string;
    retry: () => void;
};

// Opening the AI editor waits for the current song's model result. Cleanup keeps responses from a
// closed editor or previous song from replacing its status; the controller guards theme application.
export function useThemeQuickEditorGeneration(active: boolean, songKey: string | null, prompt: string | null,
    prepare?: () => Promise<GenerateAIThemeResult>): ThemeEditorGeneration {
    const config = useHarmonyAiConfig();
    const [attempt, setAttempt] = useState(0);
    const [result, setResult] = useState<Omit<ThemeEditorGeneration, 'retry'>>({ state: 'idle' });
    const enabled = active && hasHarmonyAi() && config.enabled && Boolean(prepare);
    useEffect(() => {
        if (!enabled || !prepare) { setResult({ state: 'idle' }); return; }
        let cancelled = false;
        setResult({ state: 'loading' });
        const timer = window.setTimeout(() => {
            void prepare().then(outcome => {
                if (cancelled) return;
                if (outcome.status === 'generated' || (outcome.status === 'skipped' && outcome.reason === 'auto-disabled')) setResult({ state: 'idle' });
                else if (outcome.status === 'failed') setResult({ state: 'failed', error: outcome.error });
                else setResult({ state: 'failed', messageKey: outcome.reason === 'no-song'
                    ? 'harmony.aiChooseSong' : outcome.reason === 'empty-prompt'
                        ? 'harmony.aiWaitForLyrics' : 'harmony.aiGenerationBusy' });
            }).catch(error => {
                if (!cancelled) setResult({ state: 'failed', error: error instanceof Error ? error.message : String(error) });
            });
        }, 0);
        return () => { cancelled = true; window.clearTimeout(timer); };
    }, [enabled, prepare, songKey, prompt, attempt, config]);
    return { ...result, retry: () => setAttempt(value => value + 1) };
}
