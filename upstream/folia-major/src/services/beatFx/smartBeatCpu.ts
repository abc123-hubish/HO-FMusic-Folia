import { melSpectrogram, BEAT_THIS_FPS } from '../analysis/beatThis';
import { computeBeatAccents } from '../analysis/beatAccents';
import { estimateTempo, estimateDownbeat, MIN_TEMPO_CONFIDENCE } from '../automix/signalAnalysis';
import { yieldToUi, YIELD_BUDGET_MS } from '../automix/uiYield';
import type { SmartBeatResult } from './smartBeatTypes';

// src/services/beatFx/smartBeatCpu.ts
// A labelled compatibility detector, not Beat This! inference. Track actual spectral onsets with
// the project's tempo estimator and dynamic programming. Silence never receives extrapolated beats.
export const CPU_BEAT_MODEL = 'cpu-spectral-onset-v1';
const HOP = 1 / BEAT_THIS_FPS;
const WINDOW = 30 * BEAT_THIS_FPS;
export async function analyseCpuSmartBeat(mono: Float32Array<ArrayBuffer>, signal?: AbortSignal,
    progress: (value: number) => void = () => {}): Promise<SmartBeatResult> {
    const check = () => { if (signal?.aborted) throw new DOMException('Cancelled', 'AbortError'); };
    check();
    const mel = await melSpectrogram(mono, signal);
    const flux = new Float32Array(mel.frames), low = new Float32Array(mel.frames);
    for (let t = 1; t < mel.frames; t++) {
        let sum = 0, bass = 0;
        for (let band = 0; band < 128; band++) {
            const rise = Math.max(0, mel.data[t * 128 + band] - mel.data[(t - 1) * 128 + band]);
            sum += rise; if (band < 12) bass += rise;
        }
        flux[t] = sum / 128; low[t] = bass / 12;
    }
    const prefix = new Float64Array(mel.frames + 1);
    for (let i = 0; i < flux.length; i++) prefix[i + 1] = prefix[i] + flux[i];
    const onset = Array.from(flux, (value, i) => {
        const from = Math.max(0, i - 12), to = Math.min(flux.length, i + 13);
        return Math.max(0, value - (prefix[to] - prefix[from]) / (to - from));
    });
    const beats: number[] = [], downbeats: number[] = [];
    let yieldBy = performance.now() + YIELD_BUDGET_MS;
    for (let start = 0; start < mel.frames; start += WINDOW) {
        check();
        const from = Math.max(0, start - BEAT_THIS_FPS), to = Math.min(mel.frames, start + WINDOW + BEAT_THIS_FPS);
        const values = onset.slice(from, to), estimate = estimateTempo(values, HOP);
        if (!estimate || estimate.confidence < MIN_TEMPO_CONFIDENCE) continue;
        const sorted = values.filter(value => value > 1e-6).sort((a, b) => a - b);
        if (!sorted.length) continue;
        const normal = sorted[Math.floor((sorted.length - 1) * 0.9)];
        const period = estimate.periodSec / HOP, scores = new Float32Array(values.length);
        const previous = new Int32Array(values.length).fill(-1);
        let last = -1, best = 0;
        for (let t = 0; t < values.length; t++) {
            if (performance.now() > yieldBy) { check(); await yieldToUi(); yieldBy = performance.now() + YIELD_BUDGET_MS; }
            let before = 0, at = -1;
            for (let s = Math.max(0, t - Math.ceil(period * 2)); s <= t - Math.max(1, Math.floor(period / 2)); s++) {
                const score = scores[s] - 4 * Math.log((t - s) / period) ** 2;
                if (score > before) { before = score; at = s; }
            }
            scores[t] = Math.min(3, values[t] / normal) + before;
            previous[t] = at;
            if (scores[t] > best && values[t] > normal * 0.15) { best = scores[t]; last = t; }
        }
        const picked: number[] = [];
        while (last >= 0) {
            const t = from + last, time = t * HOP;
            // Only measured onset peaks are emitted, including across silent intros/breaks.
            if (t >= start && t < start + WINDOW && values[last] > normal * 0.15
                && values[last] >= (values[last - 1] || 0) && values[last] >= (values[last + 1] || 0)) picked.push(time);
            last = previous[last];
        }
        picked.reverse();
        const phase = estimateDownbeat(Array.from(low.subarray(from, to)), HOP, estimate.periodSec,
            picked.length ? picked[0] - from * HOP : 0);
        for (const time of picked) {
            if (beats.length && time - beats[beats.length - 1] < estimate.periodSec * 0.45) continue;
            beats.push(time);
            if (phase !== null) {
                const bar = estimate.periodSec * 4, position = ((time - from * HOP - phase) % bar + bar) % bar;
                if (Math.min(position, bar - position) < Math.max(0.06, estimate.periodSec * 0.15)) downbeats.push(time);
            }
        }
        progress(Math.round(Math.min(mel.frames, start + WINDOW) * 100 / mel.frames));
        await yieldToUi();
    }
    check();
    const accents = computeBeatAccents(mel, beats, downbeats);
    // A detected onset is already a felt hit, rather than an extra subdivision predicted by a model.
    accents.pulse.fill(1);
    return { beats, downbeats, accents, schema: 1, duration: mono.length / 22050, model: CPU_BEAT_MODEL };
}
