import React, { useEffect, type CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { AudioLines, Info, RefreshCw, RotateCcw } from 'lucide-react';
import type { Theme } from '../../types';
import { useSmartBeatStore } from '../../stores/useSmartBeatStore';
import { probeSmartBeat } from '../../services/beatFx/smartBeatClient';
import { resolveBeatEffectSetting, BEAT_EFFECT_IDS } from '../../services/beatFx/beatEffects';
import { Button, Segmented } from '../modal/settings/kit';
import { SettingsToggle } from '../modal/settings/SettingsRow';
import { settingsToggleOffClassFor } from '../modal/settings/settingsCardClasses';
import { settingsTokens } from '../modal/settings/kit/kitTheme';
import './SmartBeatSettingsCard.css';

// src/components/visualizer/SmartBeatSettingsCard.tsx
// Shared controls for the global mode, individual visual effects and real analysis availability.
const effects = [BEAT_EFFECT_IDS.hanabiBeatBursts, BEAT_EFFECT_IDS.hanabiBeatPulse,
    BEAT_EFFECT_IDS.sonnetLensTear, BEAT_EFFECT_IDS.dioramaRipple];
export default function SmartBeatSettingsCard({ isDaylight = false, theme }: { isDaylight?: boolean; theme?: Theme }) {
    const { t } = useTranslation();
    const { settings, available, status, note, events, engine, progress, requestRetry, setMode, setSettings } = useSmartBeatStore();
    const busy = status === 'analysing' || status === 'reading';
    useEffect(() => { let active = true;
        void probeSmartBeat().then(value => { if (active) useSmartBeatStore.setState({ available: value }); });
        return () => { active = false; };
    }, []);
    return <section data-testid="smart-beat-settings" style={settingsTokens(isDaylight, theme)}
        className="st-window min-w-0 space-y-2.5 rounded-2xl border border-[var(--st-line)] bg-[var(--st-card)] p-3 text-[color:var(--st-t1)]">
        <div><div className="flex items-center justify-between gap-3">
            <h3 className="flex min-w-0 items-center gap-2 text-sm font-semibold"><AudioLines size={17} className="shrink-0 text-[color:var(--st-accent)]" />{t('smartBeat.title')}</h3>
            <Button variant="quiet" icon={RotateCcw} onClick={() => setSettings({ mode: 'off', effects: Object.fromEntries(effects.map(id => [id, { on: true, strength: 1 }])) })}>{t('smartBeat.reset')}</Button>
        </div></div>
        <div role="group" aria-label={t('smartBeat.title')}>
            <Segmented fill value={settings.mode} onChange={setMode}
                options={(['off', 'cached', 'on'] as const).map(mode => ({ value: mode, label: t(`smartBeat.mode.${mode}`), disabled: mode === 'on' && available !== true }))} />
        </div>
        <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 space-y-1"><p role="status" className="text-xs leading-relaxed text-[color:var(--st-t2)]">
            {available === null ? t('smartBeat.checking') : available === false ? t('smartBeat.unsupported')
                : note && ['off', 'static', 'background', 'style', 'waiting-audio', 'effects-off', 'preview', 'partial-audio', 'no-audio', 'unknown-duration', 'no-cache', 'no-beats', 'model'].includes(note)
                    ? t(`smartBeat.reason.${note}`) : t(`smartBeat.status.${status}`, { count: events })}
            {status === 'analysing' && !note && ` ${progress}%`}
        </p>
        {engine && <p data-testid="smart-beat-engine" className="text-[11px] leading-relaxed text-[color:var(--st-t3)]">{t(`smartBeat.engine.${engine}`)}</p>}</div>
        <Button variant="quiet" icon={RefreshCw} tip={t('smartBeat.retry')} disabled={busy}
            onClick={() => { void probeSmartBeat(true).then(() => requestRetry()); }} />
        </div>
        {settings.mode !== 'off' && <div className="smart-beat-effects grid grid-cols-2 gap-2">{effects.map(id => {
                const value = resolveBeatEffectSetting(settings, id);
                return <div key={id} className="flex min-w-0 flex-col rounded-xl border border-[var(--st-line)] px-2.5 py-2">
                    <div className="flex items-start justify-between gap-2">
                        <span className="min-h-8 min-w-0 text-xs font-medium leading-4 [overflow-wrap:anywhere]">{t(`smartBeat.effects.${id}`)}</span>
                        <SettingsToggle role="switch" checked={value.on} onChange={() => setSettings({ effects: { [id]: { on: !value.on } } })}
                            ariaLabel={t(`smartBeat.effects.${id}`)} offClass={settingsToggleOffClassFor(isDaylight)} onColor={theme?.secondaryColor} />
                    </div>
                    <div className={`mt-auto flex items-center gap-1.5 pt-1 transition-opacity ${value.on ? '' : 'opacity-40'}`}>
                        <input type="range" min="0" max="2" step="0.1" value={value.strength} disabled={!value.on}
                        aria-label={`${t(`smartBeat.effects.${id}`)} ${t('smartBeat.strength')}`} className="smart-beat-range min-w-0 flex-1"
                        style={{ '--beat-fill': `${value.strength * 50}%` } as CSSProperties}
                        onChange={event => setSettings({ effects: { [id]: { strength: Number(event.target.value) } } })} />
                        <output className="w-8 shrink-0 text-right text-[11px] font-medium tabular-nums text-[color:var(--st-t2)]">{value.strength.toFixed(1)}×</output>
                    </div>
                </div>;
            })}</div>
        }
        <details className="text-[11px] leading-relaxed text-[color:var(--st-t3)]">
            <summary className="flex w-fit cursor-pointer list-none items-center gap-1.5 py-0.5 [&::-webkit-details-marker]:hidden"><Info size={12} />{t('smartBeat.details')}</summary>
            <div className="mt-1 space-y-1"><p>{t('smartBeat.description')}</p><p>{t('smartBeat.notice')}</p></div>
        </details>
    </section>;
}
