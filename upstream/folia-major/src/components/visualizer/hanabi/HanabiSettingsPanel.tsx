// Copyright (c) 2026 chthollyphile
import React from 'react';
import type { VisualizerSettingsPanelProps } from '../definition';
import VisualizerPresetGroup from '../VisualizerPresetGroup';
import { TemperaRangeControl as RangeControl, TemperaSettingsSection as SettingsSection } from '../tempera/TemperaSettingsControls';
import { DEFAULT_HANABI_TUNING, type HanabiTuning } from './types';

// src/components/visualizer/hanabi/HanabiSettingsPanel.tsx
// Use the same draft/commit sliders and preset controls as the other Pixi lyric styles.
type NumberKey = { [K in keyof HanabiTuning]: HanabiTuning[K] extends number ? K : never }[keyof HanabiTuning];
type BooleanKey = { [K in keyof HanabiTuning]: HanabiTuning[K] extends boolean ? K : never }[keyof HanabiTuning];

interface SliderSpec { kind: 'slider'; key: NumberKey; labelKey: string; min: number; max: number; step?: number; noteKey?: string; }
interface ToggleSpec { kind: 'toggle'; key: BooleanKey; labelKey: string; noteKey?: string; }
type ControlSpec = SliderSpec | ToggleSpec;

const slider = (key: NumberKey, labelKey: string, min: number, max: number, extra: Partial<SliderSpec> = {}): SliderSpec => (
    { kind: 'slider', key, labelKey, min, max, ...extra }
);
const toggle = (key: BooleanKey, labelKey: string, noteKey?: string): ToggleSpec => ({ kind: 'toggle', key, labelKey, noteKey });


const FIREWORKS_CONTROLS: ControlSpec[] = [
    slider('sparkAmount', 'options.hanabiSparkAmount', 0, 2),
    slider('glow', 'options.hanabiGlow', 0, 2),
    slider('chorusBloom', 'options.hanabiChorusBloom', 0, 2, { noteKey: 'options.hanabiChorusBloomHint' }),
    slider('bloom', 'options.hanabiBloom', 0, 2, { noteKey: 'options.hanabiBloomHint' }),
    toggle('launches', 'options.hanabiLaunches', 'options.hanabiLaunchesHint'),
];

const STAGE_CONTROLS: ControlSpec[] = [
    slider('sky', 'options.hanabiSky', 0, 1, { step: 0.01, noteKey: 'options.hanabiSkyHint' }),
    slider('riseSpeed', 'options.hanabiRiseSpeed', 0, 2, { noteKey: 'options.hanabiRiseSpeedHint' }),
    slider('spin', 'options.hanabiSpin', 0, 2, { noteKey: 'options.hanabiSpinHint' }),
    slider('ambient', 'options.hanabiAmbient', 0, 2),
    toggle('overlayFrame', 'options.hanabiOverlayFrame'),
];

const TEXT_CONTROLS: ControlSpec[] = [
    toggle('textOnly', 'options.hanabiTextOnly', 'options.hanabiTextOnlyHint'),
    slider('textMotion', 'options.hanabiTextMotion', 0, 2),
    slider('blockOpacity', 'options.hanabiBlockOpacity', 0, 1, { step: 0.01 }),
];

const DECOR_CONTROLS: ControlSpec[] = [
    slider('collage', 'options.hanabiCollage', 0, 2, { noteKey: 'options.hanabiCollageHint' }),
    slider('ornamentAmount', 'options.hanabiOrnamentAmount', 0, 2),
];


const HanabiSettingsPanel: React.FC<VisualizerSettingsPanelProps> = ({ t, isDaylight, theme, controlCardBg,
    rangeInputClass, hanabiTuning = DEFAULT_HANABI_TUNING, onHanabiTuningChange, onSliderPointerDown, onSliderCommit }) => {
    const tuning = hanabiTuning;
    const onTuningChange = onHanabiTuningChange;
    const renderControl = (spec: ControlSpec) => spec.kind === 'slider' ? (
        <RangeControl key={spec.key} label={t(spec.labelKey)} value={tuning[spec.key]} min={spec.min} max={spec.max}
            step={spec.step ?? 0.05} formatValue={value => value.toFixed(2)} rangeInputClass={rangeInputClass}
            onChange={value => onTuningChange?.({ [spec.key]: value })} onPointerDown={onSliderPointerDown} onPointerUp={onSliderCommit} />
    ) : (
        <VisualizerPresetGroup key={spec.key} label={t(spec.labelKey)} value={tuning[spec.key]}
            options={[{ value: true, label: t('options.temperaToggleOn') }, { value: false, label: t('options.temperaToggleOff') }]}
            onChange={value => onTuningChange?.({ [spec.key]: value })} isDaylight={isDaylight} theme={theme} />
    );
    return <div className="rounded-[24px] border border-white/10 p-4 space-y-4" style={{ backgroundColor: controlCardBg }}>
        <p className="text-sm font-medium">{t('options.hanabiSettings')}</p>
        <p className="text-xs opacity-60">{t('options.hanabiSettingsDesc')}</p>
        {([['hanabiFireworksSection', FIREWORKS_CONTROLS], ['hanabiStageSection', STAGE_CONTROLS],
            ['hanabiTextSection', TEXT_CONTROLS], ['hanabiDecorSection', DECOR_CONTROLS]] as const).map(([key, items]) =>
            <SettingsSection key={key} title={t('options.' + key)}>{items.map(renderControl)}</SettingsSection>)}
        <VisualizerPresetGroup label={t('options.hanabiColorMode')} value={tuning.colorMode}
            options={(['mixed', 'vivid', 'theme'] as const).map(value => ({ value, label: t('options.hanabiColorMode' + value[0].toUpperCase() + value.slice(1)) }))}
            onChange={colorMode => onTuningChange?.({ colorMode })} isDaylight={isDaylight} theme={theme} />
        <VisualizerPresetGroup label={t('options.hanabiRenderQuality')} value={tuning.renderQuality}
            options={(['full', 'balanced', 'low'] as const).map(value => ({ value, label: t('options.hanabiRenderQuality' + value[0].toUpperCase() + value.slice(1)) }))}
            onChange={renderQuality => onTuningChange?.({ renderQuality })} isDaylight={isDaylight} theme={theme} />
    </div>;
};
export default HanabiSettingsPanel;
