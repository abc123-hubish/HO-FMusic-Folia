import type { ProviderAudioSource } from '../../types/onlineMusic';
import { toSafePlaybackUrl } from '../../utils/appPlaybackHelpers';

// src/services/onlineMusic/audioSourceMetadata.ts
// Bounded, session-only evidence for the exact media URL handed to playback. Never infer previews
// from song duration, account tier or filenames; providers must explicitly mark the source.
const sources = new Map<string, { preview: boolean; clipStartMs: number }>();
let version = 0;
const keyOf = (url: string) => {
    const safe = toSafePlaybackUrl(url) ?? url;
    try { return new URL(safe).href; } catch { return safe; }
};
export const noteAudioSourceMetadata = (source: ProviderAudioSource | null): void => {
    if (!source?.url) return;
    const key = keyOf(source.url);
    sources.delete(key);
    sources.set(key, { preview: source.preview === true,
        clipStartMs: source.preview && Number.isFinite(source.clipStartMs) && source.clipStartMs! > 0 ? source.clipStartMs! : 0 });
    if (sources.size > 200) sources.delete(sources.keys().next().value!);
    version++;
};
export const isPreviewAudioSource = (url: string): boolean => sources.get(keyOf(url))?.preview === true;
export const previewClipStartMsOfAudioSource = (url: string): number => sources.get(keyOf(url))?.clipStartMs ?? 0;
export const audioSourceMetadataVersion = (): number => version;
