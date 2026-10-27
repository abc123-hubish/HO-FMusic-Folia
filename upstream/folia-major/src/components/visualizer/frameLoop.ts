import { isAppVisible, subscribeAppVisibility } from '../../services/appVisibility';

// src/components/visualizer/frameLoop.ts
// One cancellable loop: live while playing, bounded settling while paused, no work while hidden.
export interface VisualizerFrameScheduler {
    now: () => number;
    request: (callback: FrameRequestCallback) => number;
    cancel: (handle: number) => void;
}

export interface VisualizerFrameLoopOptions {
    paused: boolean;
    settleMs?: number;
    scheduler?: VisualizerFrameScheduler;
    visibility?: { get: () => boolean; subscribe: (listener: () => void) => () => void };
}

/** External changes wake a frozen frame; draw returning false sleeps even while playback runs. */
export const createVisualizerFrameLoop = (
    draw: (timestamp: number) => void | boolean,
    {
        paused: initialPaused,
        settleMs = 0,
        scheduler = {
            now: () => performance.now(),
            request: callback => requestAnimationFrame(callback),
            cancel: handle => cancelAnimationFrame(handle),
        },
        visibility = { get: isAppVisible, subscribe: subscribeAppVisibility },
    }: VisualizerFrameLoopOptions,
) => {
    let paused = initialPaused;
    let disposed = false;
    let pending: number | null = null;
    let settleUntil = scheduler.now() + (paused ? settleMs : 0);
    const cancel = () => {
        if (pending !== null) scheduler.cancel(pending);
        pending = null;
    };
    const schedule = () => {
        if (!disposed && visibility.get() && pending === null) pending = scheduler.request(render);
    };
    const render = (timestamp: number) => {
        pending = null;
        if (disposed || !visibility.get()) return;
        const keepRunning = draw(timestamp);
        if (keepRunning !== false && (!paused || timestamp < settleUntil)) schedule();
    };
    const invalidate = () => {
        if (disposed) return;
        if (paused) settleUntil = scheduler.now() + settleMs;
        schedule();
    };
    const unsubscribe = visibility.subscribe(() => {
        cancel();
        invalidate();
    });
    schedule();
    return {
        invalidate,
        setPaused(next: boolean) {
            if (disposed || next === paused) return;
            paused = next;
            cancel();
            invalidate();
        },
        dispose() { disposed = true; cancel(); unsubscribe(); },
    };
};
