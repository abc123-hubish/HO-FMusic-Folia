import { describe, expect, it } from 'vitest';
import { resolveSmartBeatSettings } from '@/services/beatFx/smartBeatSettings';
import { unpackBeatModel } from '@/services/beatFx/packedModel';
import { compressConfig, decompressConfig } from '@/utils/appearanceCodec';

// test/unit/beatFx/smartBeat.test.ts
describe('smart beat persisted settings', () => {
    it('defaults off and clamps imported effect strength while rejecting unsafe keys', () => {
        expect(resolveSmartBeatSettings(null)).toEqual({ mode: 'off', effects: {} });
        const value = resolveSmartBeatSettings({ mode: 'cached', effects: {
            'hanabi.beatPulse': { strength: 9 }, '../escape': { on: true }, 'sonnet.lensTear': { strength: NaN },
        } });
        expect(value).toEqual({ mode: 'cached', effects: { 'hanabi.beatPulse': { on: true, strength: 2 }, 'sonnet.lensTear': { on: true, strength: 1 } } });
    });
    it('round-trips visual export and preserves independent strengths', () => {
        const smartBeat = resolveSmartBeatSettings({ mode: 'on', effects: { 'hanabi.beatPulse': { strength: 1.6 }, 'diorama.ripple': { on: false } } });
        expect(decompressConfig(compressConfig({ smartBeat })).smartBeat).toEqual(smartBeat);
    });
    it('rejects a malformed packed checkpoint before creating GPU resources', () => {
        expect(() => unpackBeatModel(new ArrayBuffer(32))).toThrow('trailer');
    });
});
