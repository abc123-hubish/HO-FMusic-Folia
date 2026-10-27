import type { Theme, VisualizerMode } from '../../../types';
import { useTranslation } from 'react-i18next';
import { useVisualizerTunings } from '../../visualizer/useVisualizerTunings';
import { getVisualizerRegistryEntry } from '../../visualizer/registry';
import { getVisualizerTuningAdapter } from '../../visualizer/tuningRegistry';
import { useVisualizerSettingsStore } from '../../../stores/useVisualizerSettingsStore';

// src/components/panelTab/controls/useStyleQuickControls.tsx
// The selected style owns its quick controls; updates use the same saved tuning action as settings.
export function useStyleQuickControls(mode: VisualizerMode, theme: Theme, isDaylight: boolean) {
    const { t } = useTranslation();
    const tunings = useVisualizerTunings();
    return getVisualizerRegistryEntry(mode).renderQuickControls?.({ t, theme, isDaylight, tunings,
        onTuningChange: patch => {
            const adapter = getVisualizerTuningAdapter(mode);
            if (!adapter) return;
            const save = (useVisualizerSettingsStore.getState() as unknown as Record<string, unknown>)[adapter.settingsSetterKey];
            if (typeof save === 'function') save(patch);
        },
    });
}
