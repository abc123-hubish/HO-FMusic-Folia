import { colorWithAlpha } from '../colorMix';
import { getWaveLightCenters } from './waveLightGeometry';

// src/components/visualizer/waveLight/waveLightDraw.ts
// Wave geometry adapted from wave-light 1.5.1, Copyright (c) 2026 pomepii (MIT).
const frac = (value: number) => value - Math.floor(value);
const rand = (index: number, salt: number) => frac(Math.sin((index + 1) * 127.1 + salt * 311.7) * 43758.5453);

/** Paint one speaker-like cluster: breathing rings, travelling pulses and rotating arcs. */
const drawCluster = (
    g: CanvasRenderingContext2D, wave: string, cx: number, cy: number,
    baseR: number, t: number, seed: number, alphaScale: number,
) => {
    const h = g.canvas.height;
    const coreR = baseR * 0.9;
    const glow = g.createRadialGradient(cx, cy, 0, cx, cy, Math.max(1, coreR));
    glow.addColorStop(0, colorWithAlpha(wave, 0.15 * alphaScale));
    glow.addColorStop(0.55, colorWithAlpha(wave, 0.06 * alphaScale));
    glow.addColorStop(1, colorWithAlpha(wave, 0));
    g.fillStyle = glow;
    g.fillRect(cx - coreR, cy - coreR, coreR * 2, coreR * 2);

    const ring = (radius: number, alpha: number, lineWidth: number, blur: number, start = 0, span = Math.PI * 2) => {
        const gradient = g.createLinearGradient(0, cy - radius, 0, cy + radius);
        [0, 0.3, 0.5, 0.7, 1].forEach((stop, index) => {
            gradient.addColorStop(stop, colorWithAlpha(wave, alpha * [0, 0.6, 1, 0.6, 0][index]));
        });
        g.strokeStyle = gradient;
        g.lineWidth = lineWidth;
        g.shadowColor = colorWithAlpha(wave, Math.min(0.6, alpha * 1.5));
        g.shadowBlur = blur;
        g.beginPath();
        g.arc(cx, cy, radius, start, start + span);
        g.stroke();
    };
    for (let i = 1; i <= 9; i++) {
        const r1 = rand(i + seed * 13, 1);
        const r2 = rand(i + seed * 13, 2);
        const swell = 1 + 0.15 * Math.sin(t * (0.65 + 0.15 * r1) - i * 0.62 + seed * 2.1);
        const radius = baseR * (0.16 + 0.92 * i / 9) * swell;
        const breathe = 0.6 + 0.4 * Math.sin(t * (0.45 + 0.1 * r2) - i * 0.55 + seed);
        ring(radius, Math.max(0.008, alphaScale * (0.03 + 0.095 * (1 - i / 9)) * breathe),
            Math.max(0.8, h * (0.0012 + 0.005 * r2)), h * 0.018);
    }
    for (let k = 0; k < 3; k++) {
        const phase = (t * (0.1 + 0.018 * rand(seed, 7)) + k / 3 + seed * 0.21) % 1;
        const alpha = alphaScale * 0.17 * Math.pow(1 - phase, 1.6);
        if (alpha > 0.004) ring(baseR * (0.1 + 1.04 * phase), alpha,
            Math.max(0.8, h * (0.0018 + 0.0035 * (1 - phase))), h * 0.022);
        const r1 = rand(k + seed * 31, 4);
        const r2 = rand(k + seed * 31, 6);
        const radius = baseR * (0.28 + 0.72 * r1) * (1 + 0.02 * Math.sin(t * 0.2 + k));
        const start = t * (0.05 + 0.07 * r1) * (k % 2 ? -1 : 1) + k * 2.4 + seed * 1.7;
        const arcAlpha = Math.max(0.01, alphaScale * (0.09 + 0.08 * rand(k + seed * 31, 5))
            * (0.7 + 0.3 * Math.sin(t * 0.3 + k * 2.2)));
        ring(radius, arcAlpha, Math.max(1, h * (0.0018 + 0.0035 * r1)), h * 0.02, start, 0.9 + 1.5 * r2);
    }
};

export const drawWaveLight = (g: CanvasRenderingContext2D, wave: string, seconds: number, brightness: number) => {
    const { width: w, height: h } = g.canvas;
    g.clearRect(0, 0, w, h);
    g.globalCompositeOperation = 'lighter';
    const baseR = Math.min(w, h) * 0.62;
    const { left: cxL, right: cxR, y: cy } = getWaveLightCenters(w, h);
    drawCluster(g, wave, cxL, cy, baseR, seconds, 1, brightness);
    drawCluster(g, wave, cxR, cy, baseR * 1.04, seconds * 1.06, 2, brightness * 0.92);
    g.shadowBlur = 0;
    const px = w * (0.5 + 0.18 * Math.sin(seconds * 0.08 + 0.7));
    const py = h * (0.42 + 0.08 * Math.cos(seconds * 0.06 + 2.1));
    const radius = h * 0.4;
    const glow = g.createRadialGradient(px, py, 0, px, py, radius);
    glow.addColorStop(0, colorWithAlpha(wave, 0.05 * brightness));
    glow.addColorStop(1, colorWithAlpha(wave, 0));
    g.fillStyle = glow;
    g.fillRect(px - radius, py - radius, radius * 2, radius * 2);
    g.globalCompositeOperation = 'source-over';
};
