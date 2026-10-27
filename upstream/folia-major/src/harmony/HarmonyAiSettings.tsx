import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AiConnectionTest from '../components/modal/settings/AiConnectionTest';
import { SettingsToggle } from '../components/modal/settings/SettingsRow';
import { settingsToggleOffClassFor } from '../components/modal/settings/settingsCardClasses';
import { getHarmonyAiConfig, saveHarmonyAiConfig, type HarmonyAiConfig } from './aiConfig';
import { testHarmonyAiConnection } from './aiClient';

// AI connection form lives with the HarmonyOS service connections and saves without reloading playback.
export default function HarmonyAiSettings({ cardClass, isDaylight, onColor }: { cardClass: string; isDaylight: boolean; onColor?: string }) {
  const { t } = useTranslation();
  const toggleOffClass = settingsToggleOffClassFor(isDaylight);
  const [config, setConfig] = useState(getHarmonyAiConfig);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const update = <K extends keyof HarmonyAiConfig>(key: K, value: HarmonyAiConfig[K]) => {
    setConfig(previous => ({ ...previous, [key]: value })); setStatus(''); setError('');
  };
  const save = (event: React.FormEvent) => {
    event.preventDefault();
    try {
      saveHarmonyAiConfig({ ...config, apiUrl: config.apiUrl.trim(), model: config.model.trim(), apiKey: config.apiKey.trim(),
        geminiModel: config.geminiModel.trim(), geminiApiKey: config.geminiApiKey.trim(), temperature: config.temperature.trim() || '0.7' });
      setStatus(t('harmony.aiSaved')); setError('');
    } catch (failure) { setError(failure instanceof Error ? failure.message : String(failure)); }
  };
  const fieldClass = 'w-full min-w-0 rounded-lg border border-current/10 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-current/40';
  const field = (key: 'apiUrl' | 'model' | 'apiKey' | 'geminiModel' | 'geminiApiKey' | 'temperature', label: string, placeholder: string, type = 'text') => (
    <label className="block min-w-0 space-y-1.5">
      <span className="text-xs opacity-60">{label}</span>
      <input type={type} value={config[key]} onChange={event => update(key, event.target.value)}
        placeholder={placeholder} aria-label={label} className={fieldClass} autoComplete="off"
        autoCapitalize="none" autoCorrect="off" spellCheck={false}
        {...(type === 'number' ? { min: 0, max: 2, step: 0.1 } : {})} />
    </label>
  );
  const openai = config.provider === 'openai';
  return (
    <form onSubmit={save} data-harmony-ai className={`min-w-0 overflow-hidden rounded-xl border ${cardClass}`}>
      <div className="space-y-4 p-4">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-medium"><Sparkles size={18} />{t('harmony.aiTheme')}</h3>
          <p className="mt-1 text-xs opacity-60 leading-relaxed">{t('harmony.aiHint')}</p>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{t('harmony.aiEnabled')}</span>
          <SettingsToggle checked={config.enabled} onChange={() => update('enabled', !config.enabled)}
            offClass={toggleOffClass} onColor={onColor} ariaLabel={t('harmony.aiEnabled')} />
        </div>
        <p className="text-xs opacity-50">{t('harmony.aiEnabledHint')}</p>
        <div className={`flex rounded-xl border border-current/10 p-1 ${isDaylight ? 'bg-black/5' : 'bg-white/5'}`}>
          {(['gemini', 'openai'] as const).map(provider => (
            <button key={provider} type="button" aria-pressed={config.provider === provider} onClick={() => update('provider', provider)}
              className={`min-w-0 flex-1 rounded-lg px-2 py-2 text-xs font-medium transition-colors ${config.provider === provider ? (isDaylight ? 'bg-black/10' : 'bg-white/15') : 'opacity-60'}`}>
              {provider === 'gemini' ? 'Google Gemini' : t('options.otherCompatibleApi')}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-4 border-t border-current/10 p-4">
        {openai && field('apiUrl', t('options.openaiApiUrl'), 'https://api.openai.com/v1', 'url')}
        {field(openai ? 'model' : 'geminiModel', t('harmony.aiModel'), openai ? 'your-model-name' : 'gemini-3-flash-preview')}
        {openai && <p className="text-xs opacity-50">{t('options.openaiApiModelDesc')}</p>}
        {field('temperature', t('options.openaiApiTemperature'), '0.7', 'number')}
        {field(openai ? 'apiKey' : 'geminiApiKey', openai ? t('options.openaiApiKey') : t('options.geminiApiKey'), openai ? 'sk-…' : '', 'password')}
        {openai && <div className="flex items-center justify-between gap-4">
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{t('options.openaiApiStream')}</span>
          <SettingsToggle checked={config.stream} onChange={() => update('stream', !config.stream)}
            offClass={toggleOffClass} onColor={onColor} ariaLabel={t('options.openaiApiStream')} />
        </div>}
        <AiConnectionTest key={config.provider} isDaylight={isDaylight} testConnection={testHarmonyAiConnection}
          buttonClassName={isDaylight ? 'border-black/10 bg-black/5 hover:bg-black/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}
          payload={{ provider: config.provider, apiUrl: config.apiUrl, model: openai ? config.model : config.geminiModel,
            apiKey: openai ? config.apiKey : config.geminiApiKey, stream: openai && config.stream }} />
        <p className="text-xs opacity-50 leading-relaxed">{t('harmony.aiPrivacy')}</p>
        {error && <p role="alert" className="text-xs text-red-400">{error}</p>}
        {status && <p role="status" className="text-xs">{status}</p>}
        <button type="submit" className="w-full rounded-lg bg-current/10 px-4 py-2.5 text-sm font-medium">{t('harmony.save')}</button>
      </div>
    </form>
  );
}
