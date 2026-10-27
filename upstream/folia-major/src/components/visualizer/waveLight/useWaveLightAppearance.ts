import { useEffect, useState } from 'react';
import { extractRepresentativeColors } from '../../../utils/colorExtractor';
import { getSizedCoverUrl } from '../../../utils/coverUrl';
import { rememberBounded } from '../textMeasureCache';

// src/components/visualizer/waveLight/useWaveLightAppearance.ts
const coverColors = new Map<string, Promise<string | null>>();

export const useWaveLightCoverColor = (url: string | null | undefined, enabled: boolean) => {
    const [result, setResult] = useState<{ url: string; color: string | null } | null>(null);
    useEffect(() => {
        if (!url || !enabled) return;
        let active = true;
        const sizedUrl = getSizedCoverUrl(url, 96);
        let request = coverColors.get(sizedUrl);
        if (!request) {
            request = extractRepresentativeColors(sizedUrl, 1).then(colors => colors[0] ?? null).catch(() => null);
            rememberBounded(coverColors, sizedUrl, request, 64);
        }
        void request.then(color => { if (active) setResult({ url, color }); });
        return () => { active = false; };
    }, [url, enabled]);
    return enabled && result && result.url === url ? result.color : null;
};

export const useWaveLightSize = (ref: React.RefObject<HTMLDivElement | null>) => {
    const [size, setSize] = useState({ width: 1, height: 1 });
    useEffect(() => {
        const element = ref.current;
        if (!element) return;
        const measure = () => {
            const width = element.clientWidth;
            const height = element.clientHeight;
            setSize(previous => previous.width === width && previous.height === height ? previous : { width, height });
        };
        const observer = new ResizeObserver(measure);
        observer.observe(element);
        measure();
        return () => observer.disconnect();
    }, [ref]);
    return size;
};
