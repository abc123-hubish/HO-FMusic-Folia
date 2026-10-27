import { useEffect, useState } from 'react';

// Shared capability and persisted configuration boundary for settings, commands and generation.
export interface HarmonyAiConfig {
  enabled: boolean; provider: 'openai' | 'gemini'; apiUrl: string; model: string; apiKey: string;
  geminiModel: string; geminiApiKey: string; temperature: string; stream: boolean;
}
export const DEFAULT_HARMONY_AI: HarmonyAiConfig = {
  enabled: false, provider: 'openai', apiUrl: '', model: '', apiKey: '',
  geminiModel: 'gemini-3-flash-preview', geminiApiKey: '', temperature: '0.7', stream: false,
};
export const hasHarmonyAi = () => typeof window !== 'undefined'
  && typeof window.FoliaNative?.getAiConfig === 'function'
  && typeof window.FoliaNative?.requestAi === 'function';
export function getHarmonyAiConfig(): HarmonyAiConfig {
  try { return { ...DEFAULT_HARMONY_AI, ...JSON.parse(window.FoliaNative?.getAiConfig?.() || '{}') }; }
  catch { return { ...DEFAULT_HARMONY_AI }; }
}
export function saveHarmonyAiConfig(config: HarmonyAiConfig): void {
  if (!hasHarmonyAi() || !window.FoliaNative?.saveAiConfig) throw new Error('AI settings are unavailable');
  const error = window.FoliaNative.saveAiConfig(JSON.stringify(config));
  if (error) throw new Error(error);
  window.dispatchEvent(new Event('harmony-ai-config-change'));
}
export function useHarmonyAiConfig() {
  const [config, setConfig] = useState(getHarmonyAiConfig);
  useEffect(() => {
    const refresh = () => setConfig(getHarmonyAiConfig());
    window.addEventListener('harmony-ai-config-change', refresh);
    return () => window.removeEventListener('harmony-ai-config-change', refresh);
  }, []);
  return config;
}
