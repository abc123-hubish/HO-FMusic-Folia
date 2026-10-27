import type { SmartBeatResult } from './smartBeatTypes';
import { useSmartBeatStore } from '../../stores/useSmartBeatStore';

// src/services/beatFx/smartBeatClient.ts
// Use CPU compatibility analysis when WebGPU is absent. Models are read by the document interceptor.
let serial = 0;
let active: { cancel: () => void } | null = null;
let probing: Promise<boolean> | null = null;
let engine: 'gpu' | 'cpu' = 'cpu';
let transport: 'url' | 'inline' | 'page' = 'url';
let capability = false;
export const canAnalyseSmartBeat = () => capability;
export const getSmartBeatEngine = () => engine;
const createWorker = async (inline: boolean): Promise<Worker> => {
    if (inline) { const { default: InlineWorker } = await import('../../workers/smartBeat.worker?worker&inline'); return new InlineWorker(); }
    return new Worker(new URL('../../workers/smartBeat.worker.ts', import.meta.url), { type: 'module' });
};
const probeWorker = async (inline: boolean): Promise<boolean> => {
    let worker: Worker;
    try { worker = await createWorker(inline); } catch { return false; }
    return new Promise(resolve => {
        let settled = false;
        const finish = (value: boolean) => { if (settled) return; settled = true; clearTimeout(timer); worker.terminate(); resolve(value); };
        const timer = setTimeout(() => finish(false), 4000);
        worker.onmessage = event => { engine = navigator.gpu && event.data.engine === 'gpu' ? 'gpu' : 'cpu'; finish(event.data.result === true); };
        worker.onerror = event => { event.preventDefault(); finish(false); };
        worker.postMessage({ id: 0, operation: 'probe' });
    });
};
export function probeSmartBeat(refresh = false): Promise<boolean> {
    if (refresh) probing = null;
    if (probing) return probing;
    probing = (async () => {
        if (typeof OfflineAudioContext === 'undefined') return capability = false;
        if (typeof Worker !== 'undefined') {
            if (await probeWorker(false)) { transport = 'url'; return capability = true; }
            if (await probeWorker(true)) { transport = 'inline'; return capability = true; }
        }
        // The identical CPU detector yields to painting on engines without a working worker loader.
        engine = 'cpu'; transport = 'page'; return capability = true;
    })().then(value => { useSmartBeatStore.setState(state => ({ available: value,
        engine: ['ready', 'cached'].includes(state.status) ? state.engine : value ? engine : null })); return value; });
    return probing;
}
export const cancelSmartBeatAnalysis = () => active?.cancel();
export async function analyseSmartBeat(mono: Float32Array<ArrayBuffer>, signal: AbortSignal): Promise<SmartBeatResult> {
    const check = () => { if (signal.aborted) throw new DOMException('Cancelled', 'AbortError'); };
    check(); cancelSmartBeatAnalysis();
    if (!await probeSmartBeat()) throw new Error('Audio decoding unavailable');
    check(); cancelSmartBeatAnalysis();
    const controller = new AbortController(), cancel = () => controller.abort();
    active = { cancel }; signal.addEventListener('abort', cancel, { once: true });
    const timeout = setTimeout(cancel, 180_000);
    let worker: Worker | undefined;
    const progress = (value: number) => useSmartBeatStore.setState({ engine, progress: value });
    try {
        progress(0);
        if (transport === 'page') {
            const { analyseCpuSmartBeat } = await import('./smartBeatCpu');
            return await analyseCpuSmartBeat(mono, controller.signal, progress);
        }
        let modelBytes: ArrayBuffer | undefined;
        if (engine === 'gpu') {
            try {
                // ArkWeb's onInterceptRequest belongs to the document; never fetch folia.local in the worker.
                useSmartBeatStore.getState().report('analysing', 'model');
                const response = await fetch(new URL('models/beat_this-wgsl.bin', document.baseURI), { signal: controller.signal });
                if (!response.ok) throw new Error(`Beat model HTTP ${response.status}`);
                modelBytes = await response.arrayBuffer();
            } catch (error) {
                if (controller.signal.aborted) throw error;
                engine = 'cpu'; progress(0);
            }
        }
        check();
        if (controller.signal.aborted) throw new DOMException('Cancelled', 'AbortError');
        worker = await createWorker(transport === 'inline');
        check();
        if (controller.signal.aborted) throw new DOMException('Cancelled', 'AbortError');
        const job = worker, id = ++serial;
        useSmartBeatStore.getState().report('analysing');
        return await new Promise<SmartBeatResult>((resolve, reject) => {
            const abort = () => reject(new DOMException('Cancelled', 'AbortError'));
            controller.signal.addEventListener('abort', abort, { once: true });
            job.onmessage = event => {
                if (controller.signal.aborted) return;
                if (event.data.id !== id) return;
                if (typeof event.data.progress === 'number') { progress(event.data.progress); return; }
                controller.signal.removeEventListener('abort', abort);
                if (event.data.error) reject(new Error(event.data.error)); else resolve(event.data.result);
            };
            job.onerror = event => { event.preventDefault(); controller.signal.removeEventListener('abort', abort); reject(new Error('Beat worker failed')); };
            const transfer: Transferable[] = [mono.buffer]; if (modelBytes) transfer.push(modelBytes);
            job.postMessage({ id, operation: 'analyse', mono, engine, modelBytes }, transfer);
        });
    } finally {
        clearTimeout(timeout); signal.removeEventListener('abort', cancel); worker?.terminate();
        if (active?.cancel === cancel) active = null;
    }
}
