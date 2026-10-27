import { describe, expect, it } from 'vitest';
import { createMonetSpectrumSampler } from '@/components/visualizer/monet/spectrumSampler';

// test/unit/visualizer/spectrumSampler.test.ts
// Preserve the previous frequency mapping and amplitude response for each cached sampling window.
const reference = (raw: Uint8Array, position: number) => {
    if (raw.length <= 6) return 0;
    const usable = Math.max(1, raw.length - 6);
    const center = 6 + Math.expm1(position * Math.log(usable + 1));
    const radius = Math.max(1, Math.round(5 - (1 - Math.abs(position - 0.5) * 2) * 3));
    let sum = 0;
    let total = 0;
    for (let index = Math.max(6, Math.floor(center - radius)); index <= Math.min(raw.length - 1, Math.ceil(center + radius)); index += 1) {
        const weight = Math.max(0.1, 1 - Math.abs(index - center) / (radius + 1));
        sum += raw[index] * weight; total += weight;
    }
    const floor = 16 + (1 - position) * 12;
    const normalized = Math.max(0, Math.min(1, ((total > 0 ? sum / total : 0) - floor) / (255 - floor)));
    return Math.max(0, Math.min(1, Math.pow(normalized, 1.8 + (1 - position) * 0.4)
        * (0.52 + position * 0.62) * (0.92 + Math.sqrt(position) * 0.14)));
};

describe('cached Monet spectrum sampler', () => {
    for (const length of [0, 6, 7, 64, 512, 1024, 2048]) {
        it(`matches the original 72-point curve for ${length} FFT bins and changing amplitudes`, () => {
            const sample = createMonetSpectrumSampler(length, 72);
            for (let frame = 0; frame < 8; frame += 1) {
                const raw = Uint8Array.from({ length }, (_, bin) => (bin * 73 + frame * 19) % 256);
                for (let index = 0; index < 72; index += 1) {
                    expect(sample(raw, index)).toBeCloseTo(reference(raw, index / 71), 13);
                }
            }
        });
    }
});
