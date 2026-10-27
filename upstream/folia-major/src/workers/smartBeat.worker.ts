/// <reference types="@webgpu/types" />
import { BeatThisWgsl } from '../services/analysis/beatThisWgsl/runtime';
import { runPercussiveEnergy } from '../services/analysis/beatThisWgsl/percussive';
import { aggregateChunks, beatsFromLogits, melSpectrogram, splitForModel, type ChunkPrediction } from '../services/analysis/beatThis';
import { computeBeatAccents, resolveBeatConfidence } from '../services/analysis/beatAccents';
import { unpackBeatModel } from '../services/beatFx/packedModel';
import modelInfo from '../services/beatFx/modelManifest.json';
import { analyseCpuSmartBeat } from '../services/beatFx/smartBeatCpu';

// src/workers/smartBeat.worker.ts
// Upstream final0 inference on a dedicated WebGPU device. Neither FFT nor inference blocks painting.
let device: GPUDevice | null = null;
let model: BeatThisWgsl | null = null;
let cancelled = false;
async function loadModel(bytes: ArrayBuffer) {
    if (model) return model;
    const adapter = await navigator.gpu?.requestAdapter({ powerPreference: 'high-performance' });
    if (!adapter) throw new Error('WebGPU unavailable in worker');
    const f16 = adapter.features.has('shader-f16');
    device = await adapter.requestDevice({ requiredFeatures: f16 ? ['shader-f16'] : [] });
    if (bytes.byteLength !== modelInfo.bytes) throw new Error('Beat model size mismatch');
    const hash = [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))].map(v => v.toString(16).padStart(2, '0')).join('');
    if (hash !== modelInfo.sha256) throw new Error('Beat model checksum mismatch');
    const packed = unpackBeatModel(bytes);
    model = await BeatThisWgsl.create(device, packed.weights, packed.manifest, { f16: f16 ? 'storage' : undefined });
    return model;
}
self.onmessage = async ({ data }: MessageEvent<{ id: number; operation: 'probe' | 'analyse' | 'dispose'; mono?: Float32Array<ArrayBuffer>; modelBytes?: ArrayBuffer; engine?: 'gpu' | 'cpu' }>) => {
    const { id, operation } = data;
    try {
        if (operation === 'dispose') { cancelled = true; device?.destroy(); model = null; self.postMessage({ id, result: true }); return; }
        if (operation === 'probe') {
            let gpu = false;
            try { gpu = Boolean(await navigator.gpu?.requestAdapter()); } catch { /* CPU remains available. */ }
            self.postMessage({ id, result: true, engine: gpu ? 'gpu' : 'cpu' }); return;
        }
        const mono = data.mono;
        if (!mono?.length || mono.length > 22050 * 900) throw new Error('Unsupported audio length');
        if (data.engine === 'cpu') {
            const result = await analyseCpuSmartBeat(mono, undefined, progress => self.postMessage({ id, progress, engine: 'cpu' }));
            self.postMessage({ id, result }); return;
        }
        if (!data.modelBytes) throw new Error('Beat model bytes missing');
        const runtime = await loadModel(data.modelBytes);
        const mel = await melSpectrogram(mono);
        const predictions: ChunkPrediction[] = [];
        const chunks = splitForModel(mel);
        for (const chunk of chunks) {
            if (cancelled) return;
            const result = await runtime.run(chunk.data, { slice: 'auto' });
            // Model readback storage is reused by the next chunk.
            predictions.push({ start: chunk.start, frames: chunk.frames, beat: result.beat.slice(), downbeat: result.downbeat.slice() });
            self.postMessage({ id, progress: Math.round(predictions.length * 100 / chunks.length), engine: 'gpu' });
        }
        const logits = aggregateChunks(predictions, mel.frames);
        const grid = beatsFromLogits(logits.beat, logits.downbeat);
        let energy;
        try { energy = await runPercussiveEnergy(device!, mel.data, mel.frames); }
        catch { /* Percussive accents are optional; a valid beat grid remains usable. */ }
        const accents = computeBeatAccents(mel, grid.beats, grid.downbeats, energy,
            { confidence: resolveBeatConfidence(logits.beat, grid.beats) });
        self.postMessage({ id, result: { ...grid, accents, schema: 1, duration: mono.length / 22050, model: modelInfo.sha256 } });
    } catch (error) { self.postMessage({ id, error: error instanceof Error ? error.message : String(error) }); }
};
