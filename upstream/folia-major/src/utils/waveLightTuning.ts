import { DEFAULT_WAVE_LIGHT_TUNING, type WaveLightTuning } from '../types/waveLight';

// src/utils/waveLightTuning.ts
export const WAVE_LIGHT_TUNING_STORAGE_KEY = 'wave_light_tuning';
const clamp = (value: unknown, min: number, max: number, fallback: number) => (
    typeof value === 'number' && Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : fallback
);

export const normalizeWaveLightTuning = (input: unknown): WaveLightTuning => {
    const value = input && typeof input === 'object' ? input as Partial<WaveLightTuning> : {};
    return {
        waveSource: value.waveSource === 'theme' ? 'theme' : 'cover',
        brightness: clamp(value.brightness, 0.3, 2, 1),
        speed: clamp(value.speed, 0.2, 3, 1),
        keyword: typeof value.keyword === 'boolean' ? value.keyword : true,
        textScale: clamp(value.textScale, 0.6, 1.8, 1),
    };
};

export const readStoredWaveLightTuning = (): WaveLightTuning => {
    try {
        return normalizeWaveLightTuning(JSON.parse(localStorage.getItem(WAVE_LIGHT_TUNING_STORAGE_KEY) || 'null'));
    } catch { return { ...DEFAULT_WAVE_LIGHT_TUNING }; }
};
