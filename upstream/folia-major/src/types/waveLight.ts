// src/types/waveLight.ts
// Built-in adaptation of pomepii's MIT-licensed Wave Light visualizer.
export interface WaveLightTuning {
    waveSource: 'cover' | 'theme';
    brightness: number;
    speed: number;
    keyword: boolean;
    textScale: number;
}

export const DEFAULT_WAVE_LIGHT_TUNING: WaveLightTuning = {
    waveSource: 'cover', brightness: 1, speed: 1, keyword: true, textScale: 1,
};
