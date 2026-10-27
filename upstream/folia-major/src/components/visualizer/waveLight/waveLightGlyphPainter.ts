import type { GraphemeTiming } from '../../../utils/lyrics/graphemeTiming';
import { createWaveLightGlyphFrame, fillWaveLightGlyphFrame } from './waveLightKaraoke';
import { createWaveLightGlyphScheduler } from './waveLightGlyphScheduler';

// src/components/visualizer/waveLight/waveLightGlyphPainter.ts
// Preserve the existing three-decimal envelopes, but update compositor properties directly.
// Per-frame inherited custom properties would invalidate styles on both the glyph and its ghost.
export function createWaveLightGlyphPainter(elements: readonly HTMLElement[], timings: readonly GraphemeTiming[], frozen: boolean) {
    const slots = elements.map(element => ({ element,
        ghost: element.querySelector<HTMLElement>('.wave-light-glyph-ghost'),
        opacity: '', transform: '', ghostOpacity: '', ghostTransform: '',
        lift: NaN, scale: NaN, ghostLift: NaN, ghostScale: NaN,
        live: element.classList.contains('wave-light-glyph-live') }));
    const frame = createWaveLightGlyphFrame();
    return createWaveLightGlyphScheduler(timings, (index, time) => {
        const slot = slots[index];
        if (!slot) return;
        fillWaveLightGlyphFrame(frame, timings[index], time, frozen);
        const live = frame.phase === 1 || frame.phase === 2;
        if (live !== slot.live) {
            slot.element.classList.toggle('wave-light-glyph-live', live);
            slot.live = live;
        }
        const opacity = frame.opacity.toFixed(3);
        if (opacity !== slot.opacity) { slot.element.style.opacity = opacity; slot.opacity = opacity; }
        if (frame.lift !== slot.lift || frame.scale !== slot.scale) {
            const transform = `translateY(${frame.lift.toFixed(3)}em) scale(${frame.scale.toFixed(3)})`;
            if (transform !== slot.transform) { slot.element.style.transform = transform; slot.transform = transform; }
            slot.lift = frame.lift; slot.scale = frame.scale;
        }
        if (!slot.ghost) return;
        const ghostOpacity = frame.ghostOpacity.toFixed(3);
        if (ghostOpacity !== slot.ghostOpacity) { slot.ghost.style.opacity = ghostOpacity; slot.ghostOpacity = ghostOpacity; }
        if (frame.ghostLift !== slot.ghostLift || frame.ghostScale !== slot.ghostScale) {
            const transform = `translateY(${frame.ghostLift.toFixed(3)}em) scale(${frame.ghostScale.toFixed(3)})`;
            if (transform !== slot.ghostTransform) { slot.ghost.style.transform = transform; slot.ghostTransform = transform; }
            slot.ghostLift = frame.ghostLift; slot.ghostScale = frame.ghostScale;
        }
    }, frozen);
}
