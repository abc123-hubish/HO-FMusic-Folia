import { describe, expect, it } from 'vitest';
import { analyseCpuSmartBeat, CPU_BEAT_MODEL } from '@/services/beatFx/smartBeatCpu';

// test/unit/beatFx/smartBeatCpu.test.ts
// Validate measured beat timing, silence and cancellation with actual spectral preprocessing.
const rhythm = (bpm: number, seconds: number, intro = 0) => {
    const audio = new Float32Array(seconds * 22050), period = 60 / bpm;
    for (let i = 0; i < audio.length; i++) {
        const t = i / 22050 - intro;
        if (t < 0) continue;
        const beat = Math.floor(t / period), phase = t % period;
        audio[i] = (beat % 4 === 0 ? 0.9 : 0.5) * Math.sin(2 * Math.PI * 110 * t) * Math.exp(-phase * 40)
            + 0.2 * Math.sin(2 * Math.PI * 1200 * t) * Math.exp(-phase * 80);
    }
    return audio;
};
describe('CPU compatibility beat detector', () => {
    for (const bpm of [90, 120, 150]) it(`tracks actual ${bpm} BPM onsets without WebGPU`, async () => {
        const result = await analyseCpuSmartBeat(rhythm(bpm, 35, 2));
        expect(result.model).toBe(CPU_BEAT_MODEL);
        expect(result.beats.length).toBeGreaterThan(25);
        expect(result.beats.some(t => t > 30)).toBe(true);
        expect(result.beats.every(t => t >= 1.9)).toBe(true);
        const errors = result.beats.map(t => Math.abs((t - 2) / (60 / bpm) - Math.round((t - 2) / (60 / bpm))) * 60 / bpm);
        expect(Math.max(...errors)).toBeLessThan(0.085);
        expect(result.accents.impact).toHaveLength(result.beats.length);
    });
    it('does not invent beats over digital silence or a sustained sine', async () => {
        expect((await analyseCpuSmartBeat(new Float32Array(22050 * 6))).beats).toEqual([]);
        const sine = Float32Array.from({ length: 22050 * 6 }, (_, i) => 0.4 * Math.sin(i * 2 * Math.PI * 440 / 22050));
        expect((await analyseCpuSmartBeat(sine)).beats).toEqual([]);
    });
    it('honours cancellation before doing work', async () => {
        const controller = new AbortController(); controller.abort();
        await expect(analyseCpuSmartBeat(rhythm(120, 8), controller.signal)).rejects.toThrow('Cancelled');
    });
});
