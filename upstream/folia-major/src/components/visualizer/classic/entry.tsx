import { RotateCw } from 'lucide-react';
import { QuickControlToggle } from '../../shared/QuickControlChip';
import React from 'react';
import { defineVisualizer } from '../definition';
import { ClassicSettingsPanel } from '../settingsPanels';

const Visualizer = React.lazy(() => import('./Visualizer'));

// src/components/visualizer/classic/entry.tsx
// Registers the classic visualizer mode.
export default defineVisualizer({
    mode: 'classic',
    order: 30,
    labelKey: 'ui.visualizerClassic',
    labelFallback: 'Luminous',
    previewSeed: 'classic',
    previewStartOffset: 0,
    tuningKind: 'classic',
    usesWordSegmentation: true,
    render: props => <Visualizer {...props} />,
    renderQuickControls: ({ tunings, onTuningChange, t, theme }) => {
        const tuning = tunings.classic;
        if (!tuning) return null;
        return <>
            <QuickControlToggle theme={theme} active={tuning.enableWordRotation} label={t('options.classicWordRotation')} onToggle={() => onTuningChange({ enableWordRotation: !tuning.enableWordRotation })}><RotateCw size={14} /></QuickControlToggle>
        </>;
    },
    renderSettingsPanel: props => <ClassicSettingsPanel {...props} />,
    resetSettings: ({ resetClassicTuning }) => {
        resetClassicTuning?.();
    },
});
