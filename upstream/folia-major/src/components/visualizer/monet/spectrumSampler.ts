// src/components/visualizer/monet/spectrumSampler.ts
// Cache frequency windows and weights; only the spectrum amplitudes change from frame to frame.
export const createMonetSpectrumSampler = (binCount: number, count: number) => {
    const windows = Array.from({ length: count }, (_, index) => {
        const position = index / Math.max(1, count - 1);
        const usable = Math.max(1, binCount - 6);
        const center = 6 + Math.expm1(position * Math.log(usable + 1));
        const radius = Math.max(1, Math.round(5 - (1 - Math.abs(position - 0.5) * 2) * 3));
        const start = Math.max(6, Math.floor(center - radius));
        const end = Math.min(binCount - 1, Math.ceil(center + radius));
        const weights = Array.from({ length: Math.max(0, end - start + 1) }, (_, offset) => (
            Math.max(0.1, 1 - Math.abs(start + offset - center) / (radius + 1))
        ));
        return {
            start, weights, total: weights.reduce((sum, weight) => sum + weight, 0),
            floor: 16 + (1 - position) * 12,
            power: 1.8 + (1 - position) * 0.4,
            compensation: (0.52 + position * 0.62) * (0.92 + Math.sqrt(position) * 0.14),
        };
    });
    return (spectrum: Uint8Array, index: number) => {
        const window = windows[index];
        if (binCount <= 6 || !window || window.total === 0) return 0;
        let sum = 0;
        for (let offset = 0; offset < window.weights.length; offset += 1) {
            sum += spectrum[window.start + offset] * window.weights[offset];
        }
        const normalized = Math.max(0, Math.min(1, (sum / window.total - window.floor) / (255 - window.floor)));
        return Math.max(0, Math.min(1, Math.pow(normalized, window.power) * window.compensation));
    };
};
