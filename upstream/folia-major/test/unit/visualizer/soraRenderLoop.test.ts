import { describe, expect, it } from 'vitest';
import { createSoraRenderLoop } from '@/components/visualizer/backgrounds/sora/soraRenderLoop';

// test/unit/visualizer/soraRenderLoop.test.ts
// Verify frozen frames, redraw-on-change, cancellation and resume without paused-time jumps.
const setup = (paused: boolean) => {
    let now = 0;
    let nextHandle = 0;
    const pending = new Map<number, FrameRequestCallback>();
    const frames: number[] = [];
    const clock = { current: 0 };
    const loop = createSoraRenderLoop(time => frames.push(time), clock, paused, {
        now: () => now,
        request: callback => { const handle = nextHandle++; pending.set(handle, callback); return handle; },
        cancel: handle => { pending.delete(handle); },
    });
    const tick = (timestamp: number) => {
        now = timestamp;
        const callbacks = [...pending.values()];
        pending.clear();
        for (const callback of callbacks) callback(timestamp);
    };
    return { loop, frames, clock, pending, tick };
};

describe('soraRenderLoop', () => {
    it('draws an initially paused canvas once and leaves no animation pending', () => {
        const { frames, pending, tick } = setup(true);
        tick(16);
        for (let frame = 2; frame <= 120; frame += 1) tick(frame * 16);
        expect(frames).toEqual([0]);
        expect(pending.size).toBe(0);
    });

    it('redraws frozen theme/size changes once and coalesces repeated invalidation', () => {
        const { loop, frames, pending, tick } = setup(true);
        tick(16);
        loop.invalidate();
        loop.invalidate();
        expect(pending.size).toBe(1);
        tick(32);
        expect(frames).toEqual([0, 0]);
        expect(pending.size).toBe(0);
    });

    it('preserves running timing and does not catch up time spent paused', () => {
        const { loop, frames, pending, tick } = setup(false);
        tick(16);
        tick(32);
        expect(frames).toEqual([0.016, 0.032]);
        loop.setPaused(true);
        tick(1000);
        tick(5000);
        expect(frames).toEqual([0.016, 0.032, 0.032]);
        loop.setPaused(false);
        tick(5016);
        expect(frames.at(-1)).toBeCloseTo(0.048);
        expect(pending.size).toBe(1);
    });

    it('does not add extra running loops when invalidated or resumed repeatedly', () => {
        const { loop, pending, tick } = setup(false);
        loop.invalidate();
        loop.setPaused(false);
        expect(pending.size).toBe(1);
        tick(16);
        loop.invalidate();
        expect(pending.size).toBe(1);
    });

    it('cancels even frame handle zero and ignores invalidation after disposal', () => {
        const { loop, frames, pending, tick } = setup(false);
        loop.dispose();
        loop.invalidate();
        loop.setPaused(false);
        tick(16);
        expect(frames).toEqual([]);
        expect(pending.size).toBe(0);
    });
});
