import React, { useEffect, useRef } from 'react';
import { createVisualizerFrameLoop } from '../frameLoop';
import { drawWaveLight } from './waveLightDraw';
import { createWaveLightWebGL } from './waveLightWebGL';

// src/components/visualizer/waveLight/WaveLightCanvas.tsx
// Paused foreground flow matches the original; the shared scheduler stops all hidden frames.
export default function WaveLightCanvas({ wave, speed, brightness, frozen }: {
    wave: string; speed: number; brightness: number; frozen: boolean;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const values = useRef({ wave, speed, brightness, frozen });
    values.current = { wave, speed, brightness, frozen };
    const loopRef = useRef<ReturnType<typeof createVisualizerFrameLoop> | null>(null);
    useEffect(() => {
        const host = ref.current;
        if (!host) return;
        let canvas = document.createElement('canvas');
        let renderer: ReturnType<typeof createWaveLightWebGL> = null;
        try { renderer = createWaveLightWebGL(canvas); } catch (error) { console.warn('[WaveLight] GPU unavailable', error); }
        // A canvas which has obtained WebGL cannot also obtain Canvas2D. Use a fresh one on fallback.
        if (!renderer) canvas = document.createElement('canvas');
        let context = renderer ? null : canvas.getContext('2d');
        if (!renderer && !context) return;
        canvas.className = 'wave-light-canvas';
        canvas.dataset.waveLightRenderer = renderer ? 'webgl2' : 'canvas2d';
        canvas.setAttribute('aria-hidden', 'true');
        host.appendChild(canvas);
        let seconds = 12;
        let lastTimestamp: number | null = null;
        let contextLost = false;
        const loop = createVisualizerFrameLoop(timestamp => {
            if (contextLost) return false;
            const value = values.current;
            const delta = lastTimestamp === null ? 0 : Math.min(0.05, (timestamp - lastTimestamp) / 1000);
            lastTimestamp = timestamp;
            if (!value.frozen) seconds += delta * value.speed;
            if (renderer) renderer.draw(value.wave, seconds, value.brightness);
            else if (context) drawWaveLight(context, value.wave, seconds, value.brightness);
        }, { paused: values.current.frozen });
        loopRef.current = loop;
        const resize = () => {
            const { width, height } = canvas.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
            const w = Math.max(1, Math.round(width * dpr));
            const h = Math.max(1, Math.round(height * dpr));
            if (canvas.width !== w || canvas.height !== h) {
                canvas.width = w;
                canvas.height = h;
                loop.invalidate();
            }
        };
        const observer = new ResizeObserver(resize);
        observer.observe(canvas);
        const onLost = (event: Event) => {
            event.preventDefault(); contextLost = true; lastTimestamp = null;
            loop.setPaused(true);
        };
        const onRestored = () => {
            // Context restoration invalidates every old program and buffer, not just the frame.
            renderer?.dispose(false);
            renderer = null;
            try { renderer = createWaveLightWebGL(canvas); } catch (error) { console.warn('[WaveLight] GPU restore failed', error); }
            if (!renderer) {
                observer.unobserve(canvas);
                canvas.removeEventListener('webglcontextlost', onLost);
                canvas.removeEventListener('webglcontextrestored', onRestored);
                const replacement = document.createElement('canvas');
                replacement.className = canvas.className;
                replacement.dataset.waveLightRenderer = 'canvas2d';
                replacement.setAttribute('aria-hidden', 'true');
                canvas.replaceWith(replacement);
                canvas = replacement;
                context = canvas.getContext('2d');
                observer.observe(canvas); resize();
            }
            contextLost = false; lastTimestamp = null;
            loop.setPaused(values.current.frozen); loop.invalidate();
        };
        canvas.addEventListener('webglcontextlost', onLost);
        canvas.addEventListener('webglcontextrestored', onRestored);
        resize();
        return () => {
            observer.disconnect(); loop.dispose(); loopRef.current = null;
            canvas.removeEventListener('webglcontextlost', onLost); canvas.removeEventListener('webglcontextrestored', onRestored);
            renderer?.dispose(); canvas.remove();
        };
    }, []);
    useEffect(() => {
        loopRef.current?.setPaused(frozen);
        loopRef.current?.invalidate();
    }, [wave, speed, brightness, frozen]);
    return <div ref={ref} className="wave-light-canvas-host" aria-hidden="true" />;
}
