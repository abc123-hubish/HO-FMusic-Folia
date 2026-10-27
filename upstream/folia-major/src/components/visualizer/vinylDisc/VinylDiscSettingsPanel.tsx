import React from 'react';
import { FoliumSettingsCard } from '@/mods/folium/FoliumSettingsCard';
import type { VisualizerSettingsPanelProps } from '../definition';
import { vinylSettings } from './module';

// src/components/visualizer/vinylDisc/VinylDiscSettingsPanel.tsx
const VinylDiscSettingsPanel: React.FC<VisualizerSettingsPanelProps> = props => (
    <FoliumSettingsCard modId="vinyl-disc" where="Vinyl Disc settings" entryKind="visualizer-settings"
        entryId="vinyl-disc:disc" title={{ 'zh-CN': props.t('ui.visualizerVinylDisc'), en: props.t('ui.visualizerVinylDisc') }}
        fallbackTitle="Vinyl Disc" access={vinylSettings} theme={props.theme} isDaylight={props.isDaylight}
        controlCardBg={props.controlCardBg} rangeInputClass={props.rangeInputClass}
        description={props.t('options.vinylDiscDescription')} />
);
export default VinylDiscSettingsPanel;
