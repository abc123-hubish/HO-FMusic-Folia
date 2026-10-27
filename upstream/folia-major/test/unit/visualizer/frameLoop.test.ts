import { describe, expect, it, vi } from 'vitest';
import { createVisualizerFrameLoop } from '@/components/visualizer/frameLoop';

// test/unit/visualizer/frameLoop.test.ts
// Verify scheduling under pause, seek, native backgrounding, disposal and empty scenes.
const setup = (paused = false, settleMs = 0) => {
    let now = 0;
    let next = 0;
    let visible = true;
    const callbacks = new Map<number, FrameRequestCallback>();
    const listeners = new Set<() => void>();
    const draw = vi.fn<((timestamp: number) => void | boolean)>();
    const loop = createVisualizerFrameLoop(draw, {
        paused, settleMs,
        scheduler: { now: () => now, request: callback => { const id = next++; callbacks.set(id, callback); return id; },
            cancel: id => { callbacks.delete(id); } },
        visibility: { get: () => visible, subscribe: callback => { listeners.add(callback); return () => { listeners.delete(callback); }; } },
    });
    const tick = (time: number) => {
        now = time;
        const pending = [...callbacks.values()]; callbacks.clear();
        pending.forEach(callback => callback(time));
    };
    return { loop, draw, callbacks, tick, listeners, hide: () => { visible = false; listeners.forEach(callback => callback()); },
        show: () => { visible = true; listeners.forEach(callback => callback()); } };
};

describe('visualizer frame loop', () => {
    it('renders a paused scene once and coalesces multiple seek invalidations', () => {
        const h = setup(true); h.tick(16); h.tick(32);
        expect(h.draw).toHaveBeenCalledTimes(1); expect(h.callbacks.size).toBe(0);
        h.loop.invalidate(); h.loop.invalidate(); h.tick(48);
        expect(h.draw).toHaveBeenCalledTimes(2); expect(h.callbacks.size).toBe(0);
        h.loop.dispose();
    });
    it('finishes bounded pause easing, then resumes exactly one loop', () => {
        const h = setup(false, 100); h.tick(16); h.loop.setPaused(true);
        h.tick(32); h.tick(100); h.tick(116); h.tick(1000);
        expect(h.callbacks.size).toBe(0);
        h.loop.setPaused(false); h.loop.setPaused(false); h.loop.invalidate();
        expect(h.callbacks.size).toBe(1); h.tick(1016); expect(h.callbacks.size).toBe(1);
        h.loop.dispose();
    });
    it('cancels handle zero in background, wakes on foreground and never revives after disposal', () => {
        const h = setup(); h.hide(); h.tick(16); expect(h.draw).not.toHaveBeenCalled();
        h.loop.invalidate(); expect(h.callbacks.size).toBe(0);
        h.show(); h.tick(32); expect(h.draw).toHaveBeenCalledTimes(1);
        h.loop.dispose(); h.show(); h.loop.invalidate(); h.loop.setPaused(false); h.tick(48);
        expect(h.callbacks.size).toBe(0); expect(h.listeners.size).toBe(0); expect(h.draw).toHaveBeenCalledTimes(1);
    });
    it('sleeps on an empty scene and can be invalidated when content arrives', () => {
        const h = setup(); h.draw.mockReturnValueOnce(false); h.tick(16);
        expect(h.callbacks.size).toBe(0); h.loop.invalidate(); h.tick(32);
        expect(h.callbacks.size).toBe(1); h.loop.dispose();
    });
});
