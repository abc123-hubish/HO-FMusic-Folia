import { describe, expect, it } from 'vitest';
import { vinylSettings } from '../../../src/components/visualizer/vinylDisc/module';
import { compressConfig, decompressConfig } from '../../../src/utils/appearanceCodec';
import { snapshotFoliumParams, importFoliumParams } from '../../../src/mods/folium/paramStore';

// test/unit/visualizer/vinylDisc.test.ts
describe('Vinyl Disc settings contract', () => {
    it('retains the eleven upstream controls and validates their values', () => {
        vinylSettings.reset();
        expect(vinylSettings.schema).toHaveLength(11);
        expect(vinylSettings.get()).toMatchObject({ discSide: 'right', spinSeconds: 20, labelRatio: 0.6, textScale: 1.25 });
        vinylSettings.set({ discSize: 99, spinSeconds: 12, showArm: false, foreign: 1 });
        expect(vinylSettings.get()).toMatchObject({ discSize: 1, spinSeconds: 12, showArm: false });
        expect(vinylSettings.get()).not.toHaveProperty('foreign');
    });
    it('round-trips mode and parameters through short and JSON visual config', () => {
        vinylSettings.set({ discSide: 'left', textAlign: 'center', halo: 'off', textScale: 1.5 });
        const config = { visualizerMode: 'vinyl-disc', foliumParams: snapshotFoliumParams() };
        for (const payload of [compressConfig(config), JSON.stringify(config)]) {
            const decoded = decompressConfig(payload);
            expect(decoded?.visualizerMode).toBe('vinyl-disc');
            vinylSettings.reset();
            importFoliumParams(decoded?.foliumParams);
            expect(vinylSettings.get()).toMatchObject({ discSide: 'left', textAlign: 'center', halo: 'off', textScale: 1.5 });
        }
        vinylSettings.reset();
    });
});
