import React, { Suspense } from 'react';
import { defineVisualizer } from '../definition';

// src/components/visualizer/vinylDisc/entry.tsx
const Renderer = React.lazy(() => import('./VisualizerVinylDisc'));
const Settings = React.lazy(() => import('./VinylDiscSettingsPanel'));
export default defineVisualizer({
    mode: 'vinyl-disc', order: 29, labelKey: 'ui.visualizerVinylDisc', labelFallback: '黑胶唱片',
    previewSeed: 'vinyl-disc', previewStartOffset: 0, tuningKind: 'none',
    render: props => <Renderer {...props} />,
    renderSettingsPanel: props => <Suspense fallback={null}><Settings {...props} /></Suspense>,
    resetSettings: () => { void import('./module').then(module => module.vinylSettings.reset()); },
});
