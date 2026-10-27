import React, { useEffect, useRef } from 'react';
import type { AudioBands, MonetAudioStyle, Theme } from '../../../types';
import { colorWithAlpha } from '../colorMix';
import { createVisualizerFrameLoop } from '../frameLoop';
import { createMonetSpectrumSampler } from './spectrumSampler';

// src/components/visualizer/monet/AudioOverlay.tsx
// Renders the bottom audio rail for Monet with a lightweight canvas loop in player mode and a static placeholder in preview mode.
interface AudioOverlayProps {
    audioPower: AudioBands['bass'];
    audioBands: AudioBands;
    theme: Theme;
    mode: MonetAudioStyle;
    staticMode?: boolean;
    isPreviewMode?: boolean;
    paused?: boolean;
}

const BAR_COUNT = 72;
const MIN_RAW_SPECTRUM_BIN = 6;

const buildSpectrumAnchors = (bands: number[]) => {
    const [bass, lowMid, mid, vocal, treble] = bands;
    return [
        bass * 1.08,
        bass * 0.96,
        bass * 0.74 + lowMid * 0.26,
        lowMid,
        lowMid * 0.58 + mid * 0.42,
        mid,
        mid * 0.42 + vocal * 0.58,
        vocal,
        vocal * 0.48 + treble * 0.52,
        treble,
        treble * 0.82,
    ].map(value => Math.max(0, Math.min(1, value)));
};

const sampleSpectrumProfile = (anchors: number[], normalizedIndex: number) => {
    const clampedIndex = Math.max(0, Math.min(1, normalizedIndex));
    const logIndex = Math.log10(1 + clampedIndex * 9);
    const scaledIndex = logIndex * (anchors.length - 1);
    const lowerIndex = Math.floor(scaledIndex);
    const upperIndex = Math.min(lowerIndex + 1, anchors.length - 1);
    const interpolation = scaledIndex - lowerIndex;
    const lowerValue = anchors[lowerIndex] ?? 0;
    const upperValue = anchors[upperIndex] ?? lowerValue;
    const interpolated = lowerValue + (upperValue - lowerValue) * interpolation;

    // Add a fuller contour so the profile reads like a continuous response curve.
    const contour =
        0.92 +
        Math.sin(clampedIndex * Math.PI * 3.4 - Math.PI * 0.3) * 0.08 +
        Math.sin(clampedIndex * Math.PI * 9.2 + Math.PI * 0.2) * 0.035;
    return Math.max(0, Math.min(1, interpolated * contour));
};

const drawStaticBars = (context: CanvasRenderingContext2D, width: number, height: number, theme: Theme, mode: MonetAudioStyle) => {
    context.clearRect(0, 0, width, height);
    context.strokeStyle = colorWithAlpha(theme.primaryColor, 0.96);
    context.fillStyle = colorWithAlpha(theme.primaryColor, 0.9);
    context.lineWidth = 1.5;
    context.lineCap = 'round';

    if (mode === 'line') {
        const points: { x: number; y: number }[] = [];
        for (let index = 0; index < BAR_COUNT; index += 1) {
            const x = (index / (BAR_COUNT - 1)) * width;
            const spectrumIndex = index / (BAR_COUNT - 1);
            const envelope = Math.sin(spectrumIndex * Math.PI);
            const val = 0.12 + (Math.sin(index * 0.35) * 0.5 + 0.5) * 0.42;
            const y = height - (height * val * envelope);
            points.push({ x, y });
        }

        const drawCurve = (ctx: CanvasRenderingContext2D) => {
            if (points.length === 0) return;
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 0; i < points.length - 1; i++) {
                const xc = (points[i].x + points[i + 1].x) / 2;
                const yc = (points[i].y + points[i + 1].y) / 2;
                ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
            }
            ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
        };

        // Fill area under the curve
        context.beginPath();
        drawCurve(context);
        context.lineTo(width, height);
        context.lineTo(0, height);
        context.closePath();
        const fillGradient = context.createLinearGradient(0, 0, 0, height);
        fillGradient.addColorStop(0, colorWithAlpha(theme.primaryColor, 0.24));
        fillGradient.addColorStop(1, colorWithAlpha(theme.primaryColor, 0.0));
        context.fillStyle = fillGradient;
        context.fill();

        // Stroke curve
        context.beginPath();
        drawCurve(context);
        context.strokeStyle = colorWithAlpha(theme.primaryColor, 0.96);
        context.lineWidth = 2.0;
        context.stroke();
        return;
    }

    const gap = width / BAR_COUNT;
    for (let index = 0; index < BAR_COUNT; index += 1) {
        const spectrumIndex = index / (BAR_COUNT - 1);
        const envelope = Math.sin(spectrumIndex * Math.PI);
        const val = 0.12 + (Math.sin(index * 0.35) * 0.5 + 0.5) * 0.42;
        const barHeight = height * (0.02 + val * 0.8 * envelope);
        const x = index * gap + gap * 0.14;
        context.fillRect(x, height - barHeight, Math.max(1.35, gap * 0.34), barHeight);
    }
};

const AudioOverlay: React.FC<AudioOverlayProps> = ({
    audioPower,
    audioBands,
    theme,
    mode,
    staticMode = false,
    isPreviewMode = false,
    paused = false,
}) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
            return;
        }

        const context = canvas.getContext('2d');
        if (!context) {
            return;
        }

        let loop: ReturnType<typeof createVisualizerFrameLoop> | undefined;
        let canvasWidth = 0;
        let canvasHeight = 0;

        const resizeCanvas = () => {
            const rect = canvas.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            const nextWidth = Math.max(1, Math.floor(rect.width * dpr));
            const nextHeight = Math.max(1, Math.floor(rect.height * dpr));
            canvasWidth = rect.width;
            canvasHeight = rect.height;
            if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
                canvas.width = nextWidth;
                canvas.height = nextHeight;
            }
            context.setTransform(dpr, 0, 0, dpr, 0, 0);
        };

        // Both gradients depend only on the canvas size and the theme colour (fixed for this effect
        // run), so they are rebuilt when the size changes rather than on every frame.
        let gradientSize = '';
        let inkGradient: CanvasGradient | null = null;
        let areaGradient: CanvasGradient | null = null;
        const resolveGradients = (width: number, height: number) => {
            const size = `${width}x${height}`;
            if (size !== gradientSize || !inkGradient || !areaGradient) {
                gradientSize = size;
                const primaryInk = colorWithAlpha(theme.primaryColor, 0.94);
                const softInk = colorWithAlpha(theme.primaryColor, 0.72);
                inkGradient = context.createLinearGradient(0, 0, width, 0);
                inkGradient.addColorStop(0, softInk);
                inkGradient.addColorStop(0.5, primaryInk);
                inkGradient.addColorStop(1, softInk);
                areaGradient = context.createLinearGradient(0, 0, 0, height);
                areaGradient.addColorStop(0, colorWithAlpha(theme.primaryColor, 0.24));
                areaGradient.addColorStop(1, colorWithAlpha(theme.primaryColor, 0.0));
            }
            return { gradient: inkGradient, fillGradient: areaGradient };
        };

        // These buffers stay inside this canvas loop; no consumer can retain a previous frame.
        const bands = [0, 0, 0, 0, 0];
        const emptyAnchors: number[] = [];
        const emptySpectrum = new Uint8Array(0);
        const points = Array.from({ length: BAR_COUNT }, () => ({ x: 0, y: 0 }));
        const drawCurve = (ctx: CanvasRenderingContext2D) => {
            ctx.moveTo(points[0].x, points[0].y);
            for (let index = 0; index < points.length - 1; index += 1) {
                const xc = (points[index].x + points[index + 1].x) / 2;
                const yc = (points[index].y + points[index + 1].y) / 2;
                ctx.quadraticCurveTo(points[index].x, points[index].y, xc, yc);
            }
            ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
        };
        let spectrumSize = -1;
        let sampleSpectrum = createMonetSpectrumSampler(0, BAR_COUNT);
        const draw = (now: number) => {
            const width = canvasWidth;
            const height = canvasHeight;
            if (width <= 0 || height <= 0) {
                return;
            }

            context.clearRect(0, 0, width, height);
            bands[0] = audioBands.bass.get() / 255;
            bands[1] = audioBands.lowMid.get() / 255;
            bands[2] = audioBands.mid.get() / 255;
            bands[3] = audioBands.vocal.get() / 255;
            bands[4] = audioBands.treble.get() / 255;
            const rawSpectrum = audioBands.spectrum?.get() ?? emptySpectrum;
            const hasRawSpectrum = rawSpectrum.length > MIN_RAW_SPECTRUM_BIN;
            if (rawSpectrum.length !== spectrumSize) {
                spectrumSize = rawSpectrum.length;
                sampleSpectrum = createMonetSpectrumSampler(spectrumSize, BAR_COUNT);
            }
            const anchors = hasRawSpectrum ? emptyAnchors : buildSpectrumAnchors(bands);
            const energy = Math.min(1, Math.max(0.08, audioPower.get() / 255));
            const { gradient, fillGradient } = resolveGradients(width, height);
            context.fillStyle = gradient;
            context.strokeStyle = gradient;
            context.lineWidth = 1.5;
            context.lineCap = 'round';

            if (mode === 'line') {
                for (let index = 0; index < BAR_COUNT; index += 1) {
                    const x = (index / (BAR_COUNT - 1)) * width;
                    const spectrumIndex = index / (BAR_COUNT - 1);
                    const band = hasRawSpectrum
                        ? sampleSpectrum(rawSpectrum, index)
                        : sampleSpectrumProfile(anchors, spectrumIndex);
                    const wave =
                        Math.sin(index * 0.24 + now * 0.004) * 0.08 +
                        Math.sin(index * 0.68 + now * 0.0028) * 0.05;
                    
                    const envelope = Math.sin(spectrumIndex * Math.PI);
                    const amplitude = energy * 0.04 + band * 0.8 + wave * 0.04;
                    const y = height - Math.max(0, height * amplitude * envelope);
                    points[index].x = x;
                    points[index].y = y;
                }

                // Fill area under the curve
                context.beginPath();
                drawCurve(context);
                context.lineTo(width, height);
                context.lineTo(0, height);
                context.closePath();
                context.fillStyle = fillGradient;
                context.fill();

                // Stroke top curve
                context.beginPath();
                drawCurve(context);
                context.strokeStyle = gradient;
                context.lineWidth = 2.0;
                context.stroke();
            } else {
                const gap = width / BAR_COUNT;
                for (let index = 0; index < BAR_COUNT; index += 1) {
                    const spectrumIndex = index / (BAR_COUNT - 1);
                    const band = hasRawSpectrum
                        ? sampleSpectrum(rawSpectrum, index)
                        : sampleSpectrumProfile(anchors, spectrumIndex);
                    const pulse = Math.sin(index * 0.45 + now * 0.006) * 0.5 + 0.5;
                    
                    const envelope = Math.sin(spectrumIndex * Math.PI);
                    const barHeight = height * (0.02 + (energy * 0.04 + band * 0.82 + pulse * 0.02) * envelope);
                    const x = index * gap + gap * 0.14;
                    context.fillRect(x, height - barHeight, Math.max(1.35, gap * 0.34), barHeight);
                }
            }
        };

        const handleResize = () => {
            resizeCanvas();
            loop?.invalidate();
            if ((staticMode || isPreviewMode) && canvasWidth > 0 && canvasHeight > 0) {
                drawStaticBars(context, canvasWidth, canvasHeight, theme, mode);
            }
        };

        resizeCanvas();
        window.addEventListener('resize', handleResize);

        if (staticMode || isPreviewMode) {
            if (canvasWidth > 0 && canvasHeight > 0) {
                drawStaticBars(context, canvasWidth, canvasHeight, theme, mode);
            }
            return () => window.removeEventListener('resize', handleResize);
        }

        loop = createVisualizerFrameLoop(draw, { paused });
        return () => {
            loop?.dispose();
            window.removeEventListener('resize', handleResize);
        };
    }, [audioBands, audioPower, isPreviewMode, mode, paused, staticMode, theme]);

    return <canvas ref={canvasRef} className="h-full w-full" />;
};

export default AudioOverlay;
