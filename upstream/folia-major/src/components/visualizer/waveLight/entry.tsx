import React from 'react';
import { defineVisualizer } from '../definition';
import WaveLightSettingsPanel from './WaveLightSettingsPanel';
import { DEFAULT_WAVE_LIGHT_TUNING } from '../../../types/waveLight';

// src/components/visualizer/waveLight/entry.tsx
const VisualizerWaveLight = React.lazy(() => import('./VisualizerWaveLight'));
export default defineVisualizer({
    mode: 'wave-light', order: 28, labelKey: 'ui.visualizerWaveLight', labelFallback: '动感波光',
    previewSeed: 'wave-light', previewStartOffset: 0, tuningKind: 'wave-light', usesWordSegmentation: true,
    render: props => <VisualizerWaveLight {...props} />,
    renderSettingsPanel: props => <WaveLightSettingsPanel {...props} />,
    resetSettings: ({ resetWaveLightTuning, setDraftWaveLightTuning }) => {
        setDraftWaveLightTuning?.(DEFAULT_WAVE_LIGHT_TUNING);
        resetWaveLightTuning?.();
    },
});
