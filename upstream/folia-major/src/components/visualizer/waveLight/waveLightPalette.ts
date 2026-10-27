import { hslToHex, rgbToHsl } from '../../../utils/themeColorMath';
import { mixColors, parseColorChannels } from '../colorMix';

// src/components/visualizer/waveLight/waveLightPalette.ts
// Palette proportions retained from wave-light 1.5.1, Copyright (c) 2026 pomepii (MIT).
export const buildWaveLightPalette = (color: string) => {
    const rgb = parseColorChannels(color) ?? { r: 95, g: 124, b: 255 };
    const { h, s } = rgbToHsl(rgb);
    return {
        wave: hslToHex({ h, s: Math.min(0.9, Math.max(0.45, s * 1.15 + 0.06)), l: 0.58 }),
        tint: hslToHex({ h, s: Math.min(0.45, s * 0.35 + 0.06), l: 0.92 }),
        keyword: mixColors('#000000', color, 0.4),
        mid: mixColors('#000000', color, 0.24),
        edge: mixColors('#000000', color, 0.07),
        deep: mixColors('#000000', color, 0.04),
    };
};
