import { afterEach, describe, expect, it, vi } from 'vitest';
import type { FoliumStageContext } from '../../../src/mods/folium/contract';
import { createVinylContext } from '../../../src/components/visualizer/vinylDisc/adapter';
import { setAppForeground } from '../../../src/services/appVisibility';

// test/unit/visualizer/vinylDiscAdapter.test.ts
afterEach(() => { setAppForeground(true); vi.unstubAllGlobals(); });
describe('Vinyl Disc clock adapter', () => {
    it('paints on the host clock, gates background work and releases every subscription', () => {
        const clocks = new Set<() => void>();
        const changes = new Set<() => void>();
        const disconnect = vi.fn();
        vi.stubGlobal('ResizeObserver', class { observe() {} disconnect = disconnect; });
        const ctx = {
            staticMode: false, isPaused: () => false,
            currentTime: { get: () => 5, on: (_event: string, fn: () => void) => {
                clocks.add(fn); return () => { clocks.delete(fn); };
            } },
            subscribe: (fn: () => void) => { changes.add(fn); return () => { changes.delete(fn); }; },
        } as unknown as FoliumStageContext;
        const container = { clientWidth: 390, clientHeight: 844 } as HTMLElement;
        const adapter = createVinylContext(container, ctx);
        const events: string[] = [];
        adapter.context.onChange(() => events.push('change'));
        adapter.context.onLyricTime(() => events.push('line'));
        adapter.context.onFrame(() => events.push('words'));
        const resized = vi.fn();
        adapter.context.onResize(resized);
        expect(resized).toHaveBeenCalledWith({ width: 390, height: 844 });
        events.length = 0;
        clocks.forEach(fn => fn());
        expect(events).toEqual(['line', 'words']);
        setAppForeground(false);
        expect(adapter.context.isPaused()).toBe(true);
        events.length = 0;
        clocks.forEach(fn => fn());
        expect(events).toEqual([]);
        setAppForeground(true);
        expect(events).toEqual(['change', 'line', 'words']);
        adapter.dispose();
        adapter.dispose();
        expect(clocks.size).toBe(0);
        expect(changes.size).toBe(0);
        expect(disconnect).toHaveBeenCalledTimes(1);
        events.length = 0;
        setAppForeground(false);
        expect(events).toEqual([]);
    });
});
