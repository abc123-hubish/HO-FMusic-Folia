// src/components/visualizer/backgrounds/sora/soraRenderLoop.ts
// Keep a frozen starfield on screen without continuously submitting identical GPU frames.

interface SoraFrameScheduler {
    now: () => number;
    request: (callback: FrameRequestCallback) => number;
    cancel: (handle: number) => void;
}

/** Render on demand while paused; resuming advances only by time spent running. */
export const createSoraRenderLoop = (
    draw: (timeSeconds: number) => void,
    clock: { current: number },
    initialPaused: boolean,
    scheduler: SoraFrameScheduler = {
        now: () => performance.now(),
        request: callback => requestAnimationFrame(callback),
        cancel: handle => cancelAnimationFrame(handle),
    },
) => {
    let paused = initialPaused;
    let disposed = false;
    let pendingFrame: number | null = null;
    let lastTimestamp = scheduler.now();

    const invalidate = () => {
        if (!disposed && pendingFrame === null) pendingFrame = scheduler.request(render);
    };
    const render = (now: number) => {
        pendingFrame = null;
        if (disposed) return;
        if (!paused) clock.current += (now - lastTimestamp) / 1000;
        lastTimestamp = now;
        draw(clock.current);
        if (!paused) invalidate();
    };

    invalidate();
    return {
        invalidate,
        setPaused: (next: boolean) => {
            if (disposed || next === paused) return;
            paused = next;
            if (pendingFrame !== null) scheduler.cancel(pendingFrame);
            pendingFrame = null;
            lastTimestamp = scheduler.now();
            invalidate();
        },
        dispose: () => {
            disposed = true;
            if (pendingFrame !== null) scheduler.cancel(pendingFrame);
            pendingFrame = null;
        },
    };
};
