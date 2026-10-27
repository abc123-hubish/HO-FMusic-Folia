import { SeparatorVertical } from 'lucide-react';
import { QuickControlToggle } from '../../shared/QuickControlChip';
import React from 'react';
import { DEFAULT_CLADDAGH_TUNING } from '../../../types';
import { defineVisualizer } from '../definition';
import { CladdaghSettingsPanel } from '../settingsPanels';

const VisualizerCladdagh = React.lazy(() => import('./VisualizerCladdagh'));

// src/components/visualizer/claddagh/entry.tsx

export default defineVisualizer({
    mode: 'claddagh',
    order: 80,
    labelKey: 'ui.visualizerCladdagh',
    labelFallback: 'Claddagh',
    previewSeed: 'claddagh',
    previewStartOffset: 0,
    tuningKind: 'claddagh',
    render: props => <VisualizerCladdagh {...props} />,
    renderQuickControls: ({ tunings, onTuningChange, t, theme }) => {
        const tuning = tunings.claddagh;
        if (!tuning) return null;
        return <>
            <QuickControlToggle theme={theme} active={tuning.showAxisLine} label={t('options.claddaghShowAxisLine')} onToggle={() => onTuningChange({ showAxisLine: !tuning.showAxisLine })}><SeparatorVertical size={14} /></QuickControlToggle>
        </>;
    },
    renderSettingsPanel: props => <CladdaghSettingsPanel {...props} />,
    resetSettings: ({ resetCladdaghTuning, setDraftCladdaghTuning }) => {
        setDraftCladdaghTuning?.(DEFAULT_CLADDAGH_TUNING);
        resetCladdaghTuning?.();
    },
});
