import { DEFAULT_HANABI_TUNING, type HanabiTuning, type HanabiRenderQuality } from '../types/hanabi';
// src/utils/hanabiTuning.ts
const numberWithin = (value: number, fallback: number, min: number, max: number) => Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : fallback;
const COLOR_MODES: HanabiTuning['colorMode'][] = ['theme', 'vivid', 'mixed'];
const RENDER_QUALITIES: HanabiRenderQuality[] = ['full', 'balanced', 'low'];
export const normalizeHanabiTuning = (raw: unknown): HanabiTuning => {
    const input = { ...DEFAULT_HANABI_TUNING, ...(raw && typeof raw === 'object' ? raw as Partial<HanabiTuning> : {}) };
    const d = DEFAULT_HANABI_TUNING;
    return {
        colorMode: COLOR_MODES.includes(input.colorMode) ? input.colorMode : d.colorMode,
        sparkAmount: numberWithin(input.sparkAmount, d.sparkAmount, 0, 2),
        ornamentAmount: numberWithin(input.ornamentAmount, d.ornamentAmount, 0, 2),
        textMotion: numberWithin(input.textMotion, d.textMotion, 0, 2),
        blockOpacity: numberWithin(input.blockOpacity, d.blockOpacity, 0, 1),
        riseSpeed: numberWithin(input.riseSpeed, d.riseSpeed, 0, 2),
        spin: numberWithin(input.spin, d.spin, 0, 2),
        ambient: numberWithin(input.ambient, d.ambient, 0, 2),
        glow: numberWithin(input.glow, d.glow, 0, 2),
        bloom: numberWithin(input.bloom, d.bloom, 0, 2),
        chorusBloom: numberWithin(input.chorusBloom, d.chorusBloom, 0, 2),
        launches: input.launches !== false,
        overlayFrame: input.overlayFrame !== false,
        textOnly: input.textOnly === true,
        sky: numberWithin(input.sky, d.sky, 0, 1),
        collage: numberWithin(input.collage, d.collage, 0, 2),
        renderQuality: RENDER_QUALITIES.includes(input.renderQuality) ? input.renderQuality : d.renderQuality,
    };
};


/** Restore user tuning; missing or malformed storage keeps the balanced default. */
export const readStoredHanabiTuning = (): HanabiTuning => {
    try { return normalizeHanabiTuning(JSON.parse(localStorage.getItem('hanabi_tuning') || 'null')); }
    catch { return normalizeHanabiTuning(null); }
};
