import React from 'react';
import type { VisualizerSettingsPanelProps } from '../definition';
import VisualizerPresetGroup from '../VisualizerPresetGroup';
import { TemperaRangeControl } from '../tempera/TemperaSettingsControls';
import { DEFAULT_WAVE_LIGHT_TUNING } from '../../../types/waveLight';

// src/components/visualizer/waveLight/WaveLightSettingsPanel.tsx
export default function WaveLightSettingsPanel({ t, isDaylight, theme, controlCardBg, rangeInputClass,
    waveLightTuning = DEFAULT_WAVE_LIGHT_TUNING, onWaveLightTuningChange, onSliderPointerDown, onSliderCommit,
}: VisualizerSettingsPanelProps) {
    return <div className="rounded-[24px] border border-white/10 p-4 space-y-4" style={{ backgroundColor: controlCardBg }}>
        <p className="text-sm font-medium">{t('options.waveLightSettings')}</p>
        <p className="text-xs opacity-60">{t('options.waveLightDescription')}</p>
        <VisualizerPresetGroup<'cover' | 'theme'> label={t('options.waveLightSource')} value={waveLightTuning.waveSource}
            options={[{ value: 'cover', label: t('options.waveLightCover') }, { value: 'theme', label: t('options.waveLightTheme') }]}
            onChange={waveSource => onWaveLightTuningChange?.({ waveSource })} theme={theme} isDaylight={isDaylight} />
        {([
            ['brightness', 'waveLightBrightness', 0.3, 2, 0.05],
            ['speed', 'waveLightSpeed', 0.2, 3, 0.1],
            ['textScale', 'waveLightTextScale', 0.6, 1.8, 0.05],
        ] as const).map(([key, label, min, max, step]) => <TemperaRangeControl key={key} label={t(`options.${label}`)}
            value={waveLightTuning[key]} min={min} max={max} step={step} formatValue={value => `${value.toFixed(2)}×`}
            rangeInputClass={rangeInputClass} onChange={value => onWaveLightTuningChange?.({ [key]: value })}
            onPointerDown={onSliderPointerDown} onPointerUp={onSliderCommit} />)}
        <VisualizerPresetGroup label={t('options.waveLightKeyword')} value={waveLightTuning.keyword}
            options={[{ value: true, label: t('options.temperaToggleOn') }, { value: false, label: t('options.temperaToggleOff') }]}
            onChange={keyword => onWaveLightTuningChange?.({ keyword })} theme={theme} isDaylight={isDaylight} />
    </div>;
}
