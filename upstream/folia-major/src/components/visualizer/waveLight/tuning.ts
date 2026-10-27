import { defineVisualizerTuning } from '../tuningRegistry';

// src/components/visualizer/waveLight/tuning.ts
export default defineVisualizerTuning({ mode: 'wave-light', settingsKey: 'waveLightTuning',
    settingsSetterKey: 'handleSetWaveLightTuning', apply: (props, tuning) => ({ ...props, waveLightTuning: tuning }) });
