import { useState } from 'react';
import { Server } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { HarmonyConfig } from './contracts';
import SettingsSectionHeading from '../components/modal/settings/navigation/SettingsSectionHeading';

// Host connections are configured inside Folia's existing integration settings, entirely in Web UI.
export default function HarmonyServiceSettings({ cardClass, children }: { cardClass: string; children?: React.ReactNode }) {
  const { t } = useTranslation();
  const [config, setConfig] = useState<HarmonyConfig>(() => ({ netease: '', kugou: '', qq: '', server: '',
    aiProvider: 'gemini', ...window.HarmonyConfig }));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  if (!window.FoliaNative) return null;
  const save = (event: React.FormEvent) => {
    event.preventDefault();
    const next = { ...config };
    for (const key of ['netease', 'kugou', 'qq'] as const) {
      next[key] = config[key].trim().replace(/\/+$/, '');
      if (next[key] && !/^https?:\/\/[^\s]+$/i.test(next[key])) { setError(t('harmony.invalidUrl')); return; }
    }
    const message = window.FoliaNative?.saveConfig(JSON.stringify(next));
    if (message) { setError(message); return; }
    setError(''); setSaving(true);
  };
  return (
    <section data-harmony-services>
      <SettingsSectionHeading icon={Server} label={t('harmony.services')} />
      <form onSubmit={save} className={`rounded-xl border p-4 space-y-3 ${cardClass}`}>
        <p className="text-xs opacity-60">{t('harmony.servicesHint')}</p>
        {(['netease', 'kugou', 'qq'] as const).map(key => (
          <label key={key} className="block space-y-1.5">
            <span className="text-sm font-medium">{t(`harmony.${key}`)}</span>
            <input type="url" inputMode="url" autoCapitalize="none" autoCorrect="off" spellCheck={false}
              value={config[key]} placeholder={key === 'qq' || key === 'kugou' ? t('harmony.builtinMusic') : 'https://…'} aria-label={t(`harmony.${key}`)}
              className="w-full min-w-0 rounded-lg border border-current/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-current/40"
              onChange={event => setConfig(previous => ({ ...previous, [key]: event.target.value }))} />
          </label>
        ))}
        {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
        <button type="submit" disabled={saving} className="w-full rounded-lg bg-white/10 px-4 py-2.5 text-sm font-medium disabled:opacity-50">
          {t(saving ? 'harmony.applying' : 'harmony.save')}
        </button>
      </form>
      <div className="mt-4">{children}</div>
    </section>
  );
}
