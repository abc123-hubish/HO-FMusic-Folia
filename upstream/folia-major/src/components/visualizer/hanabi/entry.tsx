import { Frame, Sparkles } from 'lucide-react';
import { QuickControlToggle } from '../../shared/QuickControlChip';
// Copyright (c) 2026 chthollyphile
import React from 'react';
import { defineVisualizer } from '../definition';
import HanabiSettingsPanel from './HanabiSettingsPanel';
import { DEFAULT_HANABI_TUNING } from './types';

const VisualizerHanabi = React.lazy(() => import('./VisualizerHanabi'));

// src/components/visualizer/hanabi/entry.tsx
// Registers 花火, the Japanese lyric-PV director: lyrics pop in on bright colour blocks, fireworks and MG
// stickers bloom along the words, and the whole world keeps rising shot after shot like a fireworks show.
export default defineVisualizer({
    mode: 'hanabi',
    order: 26,
    labelKey: 'ui.visualizerHanabi',
    labelFallback: '花火',
    previewSeed: 'hanabi',
    previewStartOffset: 0,
    // 花火：一道升空尾迹，顶上开一朵花
    // 智能动感模式: beat_this' beat list schedules shells that burst on the beats, and the beat envelopes
    // punch the whole scene (hanabiBeatFx.ts).
    // Deliberately unkeyed on the seed, like lumiere: the runtime hands a track change over in
    // place (songHandover.ts / pixiRuntimeHost.ts) instead of throwing the WebGL context away.
    render: props => <VisualizerHanabi {...props} hanabiTuning={props.hanabiTuning ?? DEFAULT_HANABI_TUNING} />,
    renderQuickControls: ({ tunings, onTuningChange, t, theme }) => {
        const tuning = tunings.hanabi;
        if (!tuning) return null;
        return <>
            <QuickControlToggle theme={theme} active={tuning.overlayFrame} label={t('options.hanabiOverlayFrame')} onToggle={() => onTuningChange({ overlayFrame: !tuning.overlayFrame })}><Frame size={14} /></QuickControlToggle>
            <QuickControlToggle theme={theme} active={tuning.collage > 0} label={t('options.hanabiCollage')} onToggle={() => onTuningChange({ collage: tuning.collage > 0 ? 0 : 1 })}><Sparkles size={14} /></QuickControlToggle>
        </>;
    },
    renderSettingsPanel: props => <HanabiSettingsPanel {...props} />,
    tuningKind: 'hanabi',
    usesWordSegmentation: true,
    resetSettings: ({ resetHanabiTuning, setDraftHanabiTuning }) => {
        setDraftHanabiTuning?.(DEFAULT_HANABI_TUNING);
        resetHanabiTuning?.();
    },
});
