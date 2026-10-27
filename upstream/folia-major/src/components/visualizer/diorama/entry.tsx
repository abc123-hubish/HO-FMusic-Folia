import { Highlighter, Ghost } from 'lucide-react';
import { QuickControlToggle } from '../../shared/QuickControlChip';
import React from 'react';
import { defineVisualizer } from '../definition';
import { DioramaSettingsPanel } from '../settingsPanels';

const VisualizerDiorama = React.lazy(() => import('./VisualizerDiorama'));

// src/components/visualizer/diorama/entry.tsx
// Registers Diorama: a procedural 3D lyric flythrough with lyric-synced cinematic camera work, plus
// its tuning panel (camera speed / motion amount / geometry visibility and response / particles).
export default defineVisualizer({
    mode: 'diorama',
    order: 120,
    labelKey: 'ui.visualizerDiorama',
    labelFallback: '镜台',
    previewSeed: 'diorama',
    previewStartOffset: 0,
    tuningKind: 'diorama',
    render: props => <VisualizerDiorama {...props} />,
    renderQuickControls: ({ tunings, onTuningChange, t, theme }) => {
        const tuning = tunings.diorama;
        if (!tuning) return null;
        return <>
            <QuickControlToggle theme={theme} active={tuning.keywordColoringEnabled} label={t('options.dioramaKeywordColoring')} onToggle={() => onTuningChange({ keywordColoringEnabled: !tuning.keywordColoringEnabled })}><Highlighter size={14} /></QuickControlToggle>
            <QuickControlToggle theme={theme} active={tuning.soulEnabled} label={t('options.dioramaSoulEffect')} onToggle={() => onTuningChange({ soulEnabled: !tuning.soulEnabled })}><Ghost size={14} /></QuickControlToggle>
        </>;
    },
    renderSettingsPanel: props => <DioramaSettingsPanel {...props} />,
    resetSettings: ({ resetDioramaTuning }) => {
        resetDioramaTuning?.();
    },
});
