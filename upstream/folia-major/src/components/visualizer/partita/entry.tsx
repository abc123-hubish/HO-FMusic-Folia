import { Spline } from 'lucide-react';
import { QuickControlToggle } from '../../shared/QuickControlChip';
import React from 'react';
import { defineVisualizer } from '../definition';
import { PartitaSettingsPanel } from '../settingsPanels';

const VisualizerPartita = React.lazy(() => import('./VisualizerPartita'));

// src/components/visualizer/partita/entry.tsx
// Registers Partita and its preview tuning panel.
export default defineVisualizer({
    mode: 'partita',
    order: 50,
    labelKey: 'ui.visualizerPartita',
    labelFallback: '云阶',
    previewSeed: 'partita',
    previewStartOffset: 0,
    tuningKind: 'partita',
    usesWordSegmentation: true,
    render: props => <VisualizerPartita {...props} />,
    renderQuickControls: ({ tunings, onTuningChange, t, theme }) => {
        const tuning = tunings.partita;
        if (!tuning) return null;
        return <>
            <QuickControlToggle theme={theme} active={tuning.showGuideLines} label={t('options.partitaGuideLines')} onToggle={() => onTuningChange({ showGuideLines: !tuning.showGuideLines })}><Spline size={14} /></QuickControlToggle>
        </>;
    },
    renderSettingsPanel: props => <PartitaSettingsPanel {...props} />,
    resetSettings: ({ resetPartitaTuning }) => {
        resetPartitaTuning?.();
    },
});
