import type { BeatThisWgslManifest } from '../analysis/beatThisWgsl/runtime';

// src/services/beatFx/packedModel.ts
// Same FOLIABTW container as upstream packedWeights.cjs, using Web APIs instead of Node Buffer.
export function unpackBeatModel(file: ArrayBuffer): { weights: Uint8Array<ArrayBuffer>; manifest: BeatThisWgslManifest } {
    const bytes = new Uint8Array(file), end = bytes.length - 16;
    if (end <= 0 || new TextDecoder().decode(bytes.subarray(end, end + 8)) !== 'FOLIABTW') throw new Error('Invalid beat model trailer');
    const at = Number(new DataView(file).getBigUint64(bytes.length - 8, true));
    if (!Number.isSafeInteger(at) || at <= 0 || at >= end || at % 4 !== 0) throw new Error('Invalid beat model offset');
    const manifest = JSON.parse(new TextDecoder().decode(bytes.subarray(at, end))) as BeatThisWgslManifest;
    if (manifest.bytes !== at || !manifest.tensors || !manifest.hyper_parameters) throw new Error('Invalid beat model manifest');
    return { weights: bytes.subarray(0, at), manifest };
}
