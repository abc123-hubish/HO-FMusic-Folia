import type { FoliumStageContext } from '@/mods/folium/contract';
import { isAppVisible, subscribeAppVisibility } from '@/services/appVisibility';

// src/components/visualizer/vinylDisc/adapter.ts
// Adapt the newer mod callbacks to this checkout's Folium clock. No extra RAF,
// timer or React state: line changes run before word painting on the same tick.
export const createVinylContext = (container: HTMLElement, ctx: FoliumStageContext) => {
    const changes = new Set<() => void>();
    const times = new Set<() => void>();
    const frames = new Set<() => void>();
    const paint = () => {
        if (!isAppVisible()) return;
        times.forEach(listener => listener());
        frames.forEach(listener => listener());
    };
    const refresh = () => { changes.forEach(listener => listener()); paint(); };
    const offClock = ctx.currentTime.on('change', paint);
    const offChange = ctx.subscribe(refresh);
    const offVisibility = subscribeAppVisibility(refresh);
    const disposers = new Set<() => void>();
    const listen = (listeners: Set<() => void>, listener: () => void) => {
        listeners.add(listener);
        return () => { listeners.delete(listener); };
    };
    return {
        context: {
            ...ctx,
            lyricTime: ctx.currentTime,
            isPaused: () => ctx.isPaused() || !isAppVisible() || ctx.staticMode,
            onChange: (listener: () => void) => listen(changes, listener),
            onLyricTime: (listener: () => void) => listen(times, listener),
            onFrame: (listener: () => void) => listen(frames, listener),
            onResize: (listener: (size: { width: number; height: number }) => void) => {
                let width = -1;
                let height = -1;
                const measure = () => {
                    const w = container.clientWidth;
                    const h = container.clientHeight;
                    if (w === width && h === height) return;
                    width = w; height = h;
                    listener({ width, height });
                    paint();
                };
                const observer = new ResizeObserver(measure);
                observer.observe(container);
                const off = () => { observer.disconnect(); disposers.delete(off); };
                disposers.add(off);
                measure();
                return off;
            },
        },
        paint,
        dispose: () => {
            offClock(); offChange(); offVisibility();
            disposers.forEach(off => off());
            changes.clear(); times.clear(); frames.clear();
        },
    };
};
