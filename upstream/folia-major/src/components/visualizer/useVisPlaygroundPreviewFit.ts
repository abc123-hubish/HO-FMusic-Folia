import { useLayoutEffect, useRef } from 'react';

// src/components/visualizer/useVisPlaygroundPreviewFit.ts
// Keep full-screen lyric layouts inside the smaller Harmony editor preview.
export const useVisPlaygroundPreviewFit = () => {
    const ref = useRef<HTMLDivElement>(null);
    useLayoutEffect(() => {
        const stage = ref.current;
        const preview = stage?.parentElement;
        if (!stage || !preview || !document.documentElement.hasAttribute('data-harmony')) return;
        let previousSize = '';

        // Measure the untransformed box so the dialog's entrance animation cannot change the scale.
        const fit = () => {
            const width = preview.clientWidth;
            const height = preview.clientHeight;
            if (width <= 0 || height <= 0) return;
            const scale = Math.min(1, width / Math.min(window.innerWidth, 960),
                height / Math.min(window.innerHeight, 540));
            const size = `${width}:${height}:${scale}`;
            if (size === previousSize) return;
            previousSize = size;
            stage.style.width = `${width / scale}px`;
            stage.style.height = `${height / scale}px`;
            stage.style.transformOrigin = 'top left';
            stage.style.transform = `scale(${scale})`;
        };
        fit();
        const observer = new ResizeObserver(fit);
        observer.observe(preview);
        window.addEventListener('resize', fit);
        return () => {
            observer.disconnect();
            window.removeEventListener('resize', fit);
            for (const property of ['width', 'height', 'transform-origin', 'transform']) {
                stage.style.removeProperty(property);
            }
        };
    }, []);
    return ref;
};
