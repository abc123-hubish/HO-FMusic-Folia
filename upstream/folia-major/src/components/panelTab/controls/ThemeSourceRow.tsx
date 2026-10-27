import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Theme, ThemeMode } from '../../../types';
import type { ThemeSourceModel } from '../../../hooks/themeControllerState';

// src/components/panelTab/controls/ThemeSourceRow.tsx
// 主题来源选择（默认 / AI / 自定义），和歌词样式、背景同属外观区。
// 自定义主题不可用时保留占位而不是整格消失，避免这一行的宽度跳变。

interface ThemeSourceRowProps {
    themeSourceModel: ThemeSourceModel;
    onBgModeChange: (mode: ThemeMode) => void;
    autoGenerateEnabled?: boolean;
    onAutoGenerateChange?: (enabled: boolean) => void;
    hasCustomTheme: boolean;
    defaultTheme: Theme;
    daylightTheme: Theme;
    isDaylight: boolean;
}

const ThemeSourceRow: React.FC<ThemeSourceRowProps> = ({
    themeSourceModel,
    onBgModeChange,
    autoGenerateEnabled = false,
    onAutoGenerateChange,
    hasCustomTheme,
    defaultTheme,
    daylightTheme,
    isDaylight,
}) => {
    const { t } = useTranslation();
    const wellBg = isDaylight ? 'bg-black/5' : 'bg-black/20';
    const activeOptionBg = isDaylight ? 'bg-white shadow-sm hover:bg-white/90' : 'bg-white/20 shadow-sm hover:bg-white/30';
    const aiThemeSource = themeSourceModel.options.ai;
    const customThemeSource = themeSourceModel.options.custom;

    const sources: {
        mode: ThemeMode;
        label: string;
        swatch: string;
        available: boolean;
        bordered: boolean;
    }[] = [
        {
            mode: 'default',
            label: t('ui.default'),
            swatch: isDaylight ? daylightTheme.backgroundColor : defaultTheme.backgroundColor,
            available: true,
            bordered: false,
        },
        {
            mode: 'ai',
            label: t('ui.aiTheme'),
            swatch: aiThemeSource.theme?.backgroundColor ?? 'rgba(114,119,134,0.4)',
            available: aiThemeSource.available,
            bordered: true,
        },
        {
            mode: 'custom',
            label: t('options.customTheme') || 'Custom',
            swatch: customThemeSource.theme?.accentColor ?? 'rgba(114,119,134,0.4)',
            available: hasCustomTheme,
            bordered: true,
        },
    ];

    return (
        <div className="space-y-2">
        <div className={`flex ${wellBg} p-1 rounded-xl`}>
            {sources.map(source => {
                const isActive = themeSourceModel.activeSource === source.mode;

                return (
                    <button
                        key={source.mode}
                        onClick={() => source.available && onBgModeChange(source.mode)}
                        disabled={!source.available}
                        title={source.available ? source.label : t('options.customThemeUnavailable')}
                        className={`flex-1 py-1.5 flex items-center justify-center gap-2 text-[10px] font-medium rounded-lg transition-all ${
                            isActive
                                ? activeOptionBg
                                : source.available
                                    ? 'opacity-40 hover:opacity-100'
                                    : 'opacity-25 cursor-not-allowed'
                        }`}
                    >
                        <div
                            className={`w-3 h-3 rounded-full ${source.bordered ? 'border border-white/20' : ''} ${source.available ? '' : 'border-dashed'}`}
                            style={{ backgroundColor: source.available ? source.swatch : 'transparent' }}
                        />
                        {source.label}
                    </button>
                );
            })}
        </div>
        {themeSourceModel.activeSource === 'ai' && onAutoGenerateChange && (
            <button type="button" role="switch" aria-checked={autoGenerateEnabled}
                aria-label={t('harmony.aiAutoGenerate')} onClick={() => onAutoGenerateChange(!autoGenerateEnabled)}
                className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-[11px] ${wellBg}`}>
                <span>{t('harmony.aiAutoGenerate')}</span>
                <span className="flex items-center gap-2">
                    <span className="opacity-60">{t(autoGenerateEnabled ? 'harmony.aiAutoGenerateOn' : 'harmony.aiAutoGenerateOff')}</span>
                    <span aria-hidden="true" className={`flex h-5 w-9 items-center rounded-full p-0.5 transition-colors ${autoGenerateEnabled ? 'bg-sky-400' : 'bg-gray-500/40'}`}>
                        <span className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${autoGenerateEnabled ? 'translate-x-4' : ''}`} />
                    </span>
                </span>
            </button>
        )}
        </div>
    );
};

export default ThemeSourceRow;
