import { Frame, EyeOff } from 'lucide-react';
import { QuickControlToggle } from '../../shared/QuickControlChip';
// Copyright (c) 2026 chthollyphile
import React from 'react';
import { DEFAULT_LUMIERE_TUNING } from '../../../types';
import { defineVisualizer } from '../definition';
import LumiereSettingsPanel from './LumiereSettingsPanel';

const VisualizerLumiere = React.lazy(() => import('./VisualizerLumiere'));

// src/components/visualizer/lumiere/entry.tsx
// Registers 绘光, the stage-lighting lyric director: volumetric light, fog, line art and lyrics lit by the beams.
export default defineVisualizer({
    mode: 'lumiere',
    order: 25,
    labelKey: 'ui.visualizerLumiere',
    labelFallback: '绘光',
    previewSeed: 'lumiere',
    previewStartOffset: 0,
    tuningKind: 'lumiere',
    usesWordSegmentation: true,
    // Deliberately unkeyed on the seed, like tempera: the runtime hands a track change over in
    // place (songHandover.ts / pixiRuntimeHost.ts) instead of throwing the WebGL context away.
    render: props => <VisualizerLumiere {...props} />,
    renderQuickControls: ({ tunings, onTuningChange, t, theme }) => {
        const tuning = tunings.lumiere;
        if (!tuning) return null;
        return <>
            <QuickControlToggle theme={theme} active={tuning.overlayFrame} label={t('options.lumiereOverlayFrame')} onToggle={() => onTuningChange({ overlayFrame: !tuning.overlayFrame })}><Frame size={14} /></QuickControlToggle>
            <QuickControlToggle theme={theme} active={tuning.hideTrails} label={t('options.lumiereHideTrails')} onToggle={() => onTuningChange({ hideTrails: !tuning.hideTrails })}><EyeOff size={14} /></QuickControlToggle>
        </>;
    },
    renderSettingsPanel: props => <LumiereSettingsPanel {...props} />,
    resetSettings: ({ resetLumiereTuning, setDraftLumiereTuning }) => {
        setDraftLumiereTuning?.(DEFAULT_LUMIERE_TUNING);
        resetLumiereTuning?.();
    },
});
