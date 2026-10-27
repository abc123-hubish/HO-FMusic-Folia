import { expect, it, vi } from 'vitest';
import { installHarmonyLifecycle } from '@/harmony/lifecycle';
import { isAppVisible } from '@/services/appVisibility';
import { restoreGlobalVisualizerFrameRateLimiter, setGlobalVisualizerFrameRate } from '@/utils/frameRateLimiter';

// test/unit/harmony/lifecycle.test.ts
// Native background state wins even when ArkWeb still reports a visible document.
it('combines native and document visibility and gates all RAF with the FPS cap disabled', () => {
    const nativeFrames = new Map<number, FrameRequestCallback>();
    let nextFrame = 0;
    const root = { toggleAttribute: vi.fn() };
    const doc = Object.assign(new EventTarget(), { hidden: false, documentElement: root });
    vi.stubGlobal('document', doc);
    vi.stubGlobal('window', {
        FoliaNative: { getForeground: () => false }, localStorage: { getItem: () => 'off' },
        requestAnimationFrame: (callback: FrameRequestCallback) => { nativeFrames.set(++nextFrame, callback); return nextFrame; },
        cancelAnimationFrame: (handle: number) => { nativeFrames.delete(handle); },
    });
    try {
        installHarmonyLifecycle();
        expect(isAppVisible()).toBe(false);
        expect(root.toggleAttribute).toHaveBeenLastCalledWith('data-harmony-background', true);
        let rendered = 0;
        const render = () => { rendered++; window.requestAnimationFrame(render); };
        window.requestAnimationFrame(render);
        setGlobalVisualizerFrameRate('off');
        expect(nativeFrames.size).toBe(0);
        window.HarmonyLifecycle!.setForeground(true);
        window.HarmonyLifecycle!.setForeground(true);
        expect(nativeFrames.size).toBe(1);
        const callback = [...nativeFrames.values()][0]; nativeFrames.clear(); callback(1000);
        expect(rendered).toBe(1);

        doc.hidden = true; doc.dispatchEvent(new Event('visibilitychange'));
        expect(isAppVisible()).toBe(false); expect(nativeFrames.size).toBe(0);
        window.HarmonyLifecycle!.setForeground(false);
        doc.hidden = false; doc.dispatchEvent(new Event('visibilitychange'));
        expect(isAppVisible()).toBe(false); expect(nativeFrames.size).toBe(0);
        window.HarmonyLifecycle!.setForeground(true);
        expect(isAppVisible()).toBe(true); expect(nativeFrames.size).toBe(1);
        expect(root.toggleAttribute).toHaveBeenLastCalledWith('data-harmony-background', false);
    } finally {
        window.HarmonyLifecycle?.setForeground(true);
        restoreGlobalVisualizerFrameRateLimiter();
        vi.unstubAllGlobals();
    }
});
