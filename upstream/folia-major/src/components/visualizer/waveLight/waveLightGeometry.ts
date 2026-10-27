// src/components/visualizer/waveLight/waveLightGeometry.ts
// Original wave-light motion (pomepii, MIT), sampled into reusable GPU instance arrays.
export const WAVE_LIGHT_RING_COUNT = 30;
export const WAVE_LIGHT_GLOW_COUNT = 3;
const TAU = Math.PI * 2;
const rand = (index: number, salt: number) => {
    const value = Math.sin((index + 1) * 127.1 + salt * 311.7) * 43758.5453;
    return value - Math.floor(value);
};
// These values depend only on the ring, never on the frame or song.
const seeds = [1, 2].map(seed => ({
    rings: Array.from({ length: 9 }, (_, index) => [rand(index + 1 + seed * 13, 1), rand(index + 1 + seed * 13, 2)]),
    arcs: Array.from({ length: 3 }, (_, index) => [rand(index + seed * 31, 4), rand(index + seed * 31, 6), rand(index + seed * 31, 5)]),
    pulse: rand(seed, 7),
}));
export const createWaveLightFrame = () => ({
    shapes: new Float32Array((WAVE_LIGHT_RING_COUNT + WAVE_LIGHT_GLOW_COUNT) * 4),
    styles: new Float32Array((WAVE_LIGHT_RING_COUNT + WAVE_LIGHT_GLOW_COUNT) * 4),
});
export type WaveLightFrame = ReturnType<typeof createWaveLightFrame>;

/** Both circles share the exact lyric midline, at every size and animation phase. */
export const getWaveLightCenters = (width: number, height: number) => ({ left: width * 0.015, right: width * 0.985, y: height * 0.5 });

/** Update fixed buffers in place: 30 breathing/pulse/arc rings followed by three soft glows. */
export const fillWaveLightFrame = (frame: WaveLightFrame, w: number, h: number, seconds: number, brightness: number) => {
    const { shapes, styles } = frame;
    let count = 0;
    const ring = (cx: number, radius: number, alpha: number, width: number, blur: number, start = 0, span = TAU) => {
        const offset = count++ * 4;
        shapes[offset] = cx; shapes[offset + 1] = h * 0.5; shapes[offset + 2] = radius; shapes[offset + 3] = alpha;
        styles[offset] = width; styles[offset + 1] = blur; styles[offset + 2] = start; styles[offset + 3] = span;
    };
    const centers = getWaveLightCenters(w, h);
    for (let side = 0; side < 2; side++) {
        const seed = side + 1;
        const t = seconds * (side ? 1.06 : 1);
        const alpha = brightness * (side ? 0.92 : 1);
        const cx = side ? centers.right : centers.left;
        const baseR = Math.min(w, h) * 0.62 * (side ? 1.04 : 1);
        const random = seeds[side];
        for (let i = 1; i <= 9; i++) {
            const [r1, r2] = random.rings[i - 1];
            const swell = 1 + 0.15 * Math.sin(t * (0.65 + 0.15 * r1) - i * 0.62 + seed * 2.1);
            const breathe = 0.6 + 0.4 * Math.sin(t * (0.45 + 0.1 * r2) - i * 0.55 + seed);
            ring(cx, baseR * (0.16 + 0.92 * i / 9) * swell,
                Math.max(0.008, alpha * (0.03 + 0.095 * (1 - i / 9)) * breathe), Math.max(0.8, h * (0.0012 + 0.005 * r2)), h * 0.018);
        }
        for (let k = 0; k < 3; k++) {
            const phase = (t * (0.1 + 0.018 * random.pulse) + k / 3 + seed * 0.21) % 1;
            ring(cx, baseR * (0.1 + 1.04 * phase), alpha * 0.17 * Math.pow(1 - phase, 1.6),
                Math.max(0.8, h * (0.0018 + 0.0035 * (1 - phase))), h * 0.022);
            const [r1, r2, r3] = random.arcs[k];
            ring(cx, baseR * (0.28 + 0.72 * r1) * (1 + 0.02 * Math.sin(t * 0.2 + k)),
                Math.max(0.01, alpha * (0.09 + 0.08 * r3) * (0.7 + 0.3 * Math.sin(t * 0.3 + k * 2.2))),
                Math.max(1, h * (0.0018 + 0.0035 * r1)), h * 0.02,
                t * (0.05 + 0.07 * r1) * (k % 2 ? -1 : 1) + k * 2.4 + seed * 1.7, 0.9 + 1.5 * r2);
        }
        const offset = (WAVE_LIGHT_RING_COUNT + side) * 4;
        shapes[offset] = cx; shapes[offset + 1] = centers.y; shapes[offset + 2] = baseR * 0.9; shapes[offset + 3] = 0.15 * alpha;
    }
    const last = (WAVE_LIGHT_RING_COUNT + 2) * 4;
    shapes[last] = w * (0.5 + 0.18 * Math.sin(seconds * 0.08 + 0.7));
    shapes[last + 1] = h * (0.42 + 0.08 * Math.cos(seconds * 0.06 + 2.1));
    shapes[last + 2] = h * 0.4; shapes[last + 3] = 0.05 * brightness;
    styles[last] = 1; // The center glow has a linear falloff, the side glows have the original 0.55 stop.
};
