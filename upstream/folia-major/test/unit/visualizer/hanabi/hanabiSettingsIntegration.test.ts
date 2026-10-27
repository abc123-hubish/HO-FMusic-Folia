import { describe, expect, it } from 'vitest';
import { compressConfig, decompressConfig } from '@/utils/appearanceCodec';
import { DEFAULT_HANABI_TUNING } from '@/types/hanabi';
import { collectVisualizerTunings, applyVisualizerTuningsToSettings } from '@/components/visualizer/tuningRegistry';

// test/unit/visualizer/hanabi/hanabiSettingsIntegration.test.ts
describe('Hanabi settings integration', () => {
    const tuning = { ...DEFAULT_HANABI_TUNING, sparkAmount: 1.75, renderQuality: 'low' as const };
    it('round-trips the mode and all tuning fields through the appearance shortcode', () => {
        const restored = decompressConfig(compressConfig({ visualizerMode: 'hanabi', hanabiTuning: tuning }));
        expect(restored.visualizerMode).toBe('hanabi');
        expect(restored.hanabiTuning).toEqual(tuning);
    });
    it('keeps Hanabi in the appearance JSON whitelist', () => {
        const restored = decompressConfig(JSON.stringify({ visualizerMode: 'hanabi', hanabiTuning: tuning }));
        expect(restored.hanabiTuning).toEqual(tuning);
    });
    it('travels through the shared tuning bundle used by sync and the renderers', () => {
        const bundle = collectVisualizerTunings({ hanabiTuning: tuning });
        let applied: unknown;
        applyVisualizerTuningsToSettings({ handleSetHanabiTuning: (value: unknown) => { applied = value; } }, bundle);
        expect(bundle.hanabi).toEqual(tuning);
        expect(applied).toEqual(tuning);
    });
});
