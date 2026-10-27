import React from 'react';
import type { VisualizerSharedProps } from '../definition';
import FoliumVisualizerRender from '@/mods/folium/registries/visualizerRender';
import { vinylVisualizer } from './module';

// src/components/visualizer/vinylDisc/VisualizerVinylDisc.tsx
const VisualizerVinylDisc: React.FC<VisualizerSharedProps> = props => (
    <FoliumVisualizerRender id="vinyl-disc:disc" modId="vinyl-disc" stored={vinylVisualizer} props={props} />
);
export default VisualizerVinylDisc;
