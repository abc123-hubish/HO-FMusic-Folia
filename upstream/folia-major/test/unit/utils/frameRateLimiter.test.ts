import { describe, expect, it } from 'vitest';
import { createFrameRateLimitedRaf, installGlobalVisualizerFrameRateLimiter, parseVisualizerFrameRate, restoreGlobalVisualizerFrameRateLimiter, setGlobalVisualizerFrameRate, setGlobalVisualizerRenderingActive, shouldProcessFrameAtRate } from '../../../src/utils/frameRateLimiter';

// test/unit/utils/frameRateLimiter.test.ts

describe('frameRateLimiter', () => {
    it('parses supported visualizer frame rates', () => {
        expect(parseVisualizerFrameRate(null)).toBe('off');
        expect(parseVisualizerFrameRate('off')).toBe('off');
        expect(parseVisualizerFrameRate('auto')).toBe('off');
        expect(parseVisualizerFrameRate('120')).toBe(120);
        expect(parseVisualizerFrameRate('90')).toBe(90);
        expect(parseVisualizerFrameRate('60')).toBe(60);
        expect(parseVisualizerFrameRate('30')).toBe('off');
        expect(parseVisualizerFrameRate('15')).toBe('off');
        expect(parseVisualizerFrameRate('24')).toBe('off');
    });

    it('skips frames until the target interval has elapsed', () => {
        expect(shouldProcessFrameAtRate(1000, 0, 60)).toBe(true);
        expect(shouldProcessFrameAtRate(1015, 1000, 60)).toBe(false);
        expect(shouldProcessFrameAtRate(1016, 1000, 60)).toBe(true);
    });

    it('always processes frames when disabled', () => {
        expect(shouldProcessFrameAtRate(1001, 1000, 'off')).toBe(true);
    });

    it('flushes all queued callbacks together on allowed frames', () => {
        const nativeCallbacks: FrameRequestCallback[] = [];
        const limiter = createFrameRateLimitedRaf(
            (callback) => {
                nativeCallbacks.push(callback);
                return nativeCallbacks.length;
            },
            () => undefined,
            60,
        );
        const processed: string[] = [];

        limiter.requestAnimationFrame(() => processed.push('a'));
        limiter.requestAnimationFrame(() => processed.push('b'));

        nativeCallbacks[0]?.(1000);
        expect(processed).toEqual(['a', 'b']);

        limiter.requestAnimationFrame(() => processed.push('c'));
        nativeCallbacks[1]?.(1015);
        expect(processed).toEqual(['a', 'b']);

        nativeCallbacks[2]?.(1016);
        expect(processed).toEqual(['a', 'b', 'c']);
    });

    it('continues flushing callbacks when one callback throws', () => {
        const originalConsoleError = console.error;
        const originalSetTimeout = globalThis.setTimeout;
        const nativeCallbacks: FrameRequestCallback[] = [];
        const reportedErrors: unknown[] = [];
        console.error = () => undefined;
        globalThis.setTimeout = ((callback: TimerHandler) => {
            try {
                if (typeof callback === 'function') {
                    callback();
                }
            } catch (error) {
                reportedErrors.push(error);
            }
            return 1 as unknown as ReturnType<typeof setTimeout>;
        }) as unknown as typeof setTimeout;

        try {
            const limiter = createFrameRateLimitedRaf(
                (callback) => {
                    nativeCallbacks.push(callback);
                    return nativeCallbacks.length;
                },
                () => undefined,
                60,
            );
            const error = new Error('boom');
            const processed: string[] = [];

            limiter.requestAnimationFrame(() => {
                throw error;
            });
            limiter.requestAnimationFrame(() => processed.push('after-error'));
            nativeCallbacks[0]?.(1000);

            expect(processed).toEqual(['after-error']);
            expect(reportedErrors).toEqual([error]);

            limiter.requestAnimationFrame(() => processed.push('next-frame'));
            nativeCallbacks[1]?.(1016);
            expect(processed).toEqual(['after-error', 'next-frame']);
        } finally {
            console.error = originalConsoleError;
            globalThis.setTimeout = originalSetTimeout;
        }
    });

    it('restores native requestAnimationFrame when disabled globally', () => {
        const previousWindow = (globalThis as { window?: Window; }).window;
        const originalRequestAnimationFrame = () => 1;
        const originalCancelAnimationFrame = () => undefined;
        Object.defineProperty(globalThis, 'window', {
            configurable: true,
            value: {
                requestAnimationFrame: originalRequestAnimationFrame,
                cancelAnimationFrame: originalCancelAnimationFrame,
                localStorage: { getItem: () => null },
            },
        });

        try {
            installGlobalVisualizerFrameRateLimiter(60);
            expect(globalThis.window.requestAnimationFrame).not.toBe(originalRequestAnimationFrame);

            setGlobalVisualizerFrameRate('off');
            expect(globalThis.window.requestAnimationFrame).toBe(originalRequestAnimationFrame);
            expect(globalThis.window.cancelAnimationFrame).toBe(originalCancelAnimationFrame);
        } finally {
            Object.defineProperty(globalThis, 'window', {
                configurable: true,
                value: previousWindow,
            });
        }
    });

    it('does no native frame work while hidden and resumes pending callbacks once', () => {
        const nativeCallbacks: FrameRequestCallback[] = [];
        const cancelled: number[] = [];
        const processed: string[] = [];
        const limiter = createFrameRateLimitedRaf(callback => {
            nativeCallbacks.push(callback);
            return nativeCallbacks.length;
        }, handle => { cancelled.push(handle); }, 'off');
        limiter.requestAnimationFrame(() => processed.push('retained'));
        limiter.setActive(false);
        const dropped = limiter.requestAnimationFrame(() => processed.push('cancelled'));
        limiter.cancelAnimationFrame(dropped);
        limiter.setFrameRate(120);
        expect(cancelled).toEqual([1]);
        expect(nativeCallbacks).toHaveLength(1);
        nativeCallbacks[0](1000); // A cancelled frame already in flight is harmless.
        expect(processed).toEqual([]);
        limiter.setActive(true);
        limiter.setActive(true);
        expect(nativeCallbacks).toHaveLength(2);
        nativeCallbacks[1](5000);
        expect(processed).toEqual(['retained']);
    });

    it('preserves already queued visual callbacks when a desktop user disables the FPS cap', () => {
        const previousWindow = (globalThis as { window?: Window }).window;
        const nativeCallbacks: FrameRequestCallback[] = [];
        Object.defineProperty(globalThis, 'window', { configurable: true, value: {
            requestAnimationFrame: (callback: FrameRequestCallback) => { nativeCallbacks.push(callback); return nativeCallbacks.length; },
            cancelAnimationFrame: () => {}, localStorage: { getItem: () => '60' },
        } });
        try {
            installGlobalVisualizerFrameRateLimiter(60);
            let rendered = 0;
            window.requestAnimationFrame(() => { rendered++; });
            setGlobalVisualizerFrameRate('off');
            nativeCallbacks[0](1000);
            expect(rendered).toBe(1);
        } finally {
            restoreGlobalVisualizerFrameRateLimiter();
            Object.defineProperty(globalThis, 'window', { configurable: true, value: previousWindow });
        }
    });

    it('can suspend during a flush without running the remaining visual callbacks', () => {
        const nativeCallbacks: FrameRequestCallback[] = [];
        const processed: string[] = [];
        const limiter = createFrameRateLimitedRaf(callback => {
            nativeCallbacks.push(callback);
            return nativeCallbacks.length;
        }, () => {}, 'off');
        limiter.requestAnimationFrame(() => { processed.push('hide'); limiter.setActive(false); });
        limiter.requestAnimationFrame(() => processed.push('after-resume'));
        nativeCallbacks[0](1000);
        expect(processed).toEqual(['hide']);
        expect(nativeCallbacks).toHaveLength(1);
        limiter.setActive(true);
        nativeCallbacks[1](2000);
        expect(processed).toEqual(['hide', 'after-resume']);
    });

    it('keeps the Harmony background gate installed when the FPS cap is turned off', () => {
        const previousWindow = (globalThis as { window?: Window }).window;
        const nativeCallbacks: FrameRequestCallback[] = [];
        const nativeRaf = (callback: FrameRequestCallback) => {
            nativeCallbacks.push(callback);
            return nativeCallbacks.length;
        };
        Object.defineProperty(globalThis, 'window', { configurable: true, value: {
            requestAnimationFrame: nativeRaf, cancelAnimationFrame: () => {},
            localStorage: { getItem: () => '60' },
        } });
        try {
            setGlobalVisualizerRenderingActive(false);
            setGlobalVisualizerFrameRate('off');
            installGlobalVisualizerFrameRateLimiter('off');
            let rendered = 0;
            window.requestAnimationFrame(() => { rendered++; });
            expect(window.requestAnimationFrame).not.toBe(nativeRaf);
            expect(nativeCallbacks).toHaveLength(0);
            setGlobalVisualizerRenderingActive(true);
            nativeCallbacks[0](1000);
            expect(rendered).toBe(1);
        } finally {
            restoreGlobalVisualizerFrameRateLimiter();
            Object.defineProperty(globalThis, 'window', { configurable: true, value: previousWindow });
        }
    });
});
