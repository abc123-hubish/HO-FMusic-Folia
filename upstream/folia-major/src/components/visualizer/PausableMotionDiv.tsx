import { useEffect, useRef, type HTMLAttributes } from 'react';
import { useAppVisibility } from '../../hooks/useAppVisibility';

// src/components/visualizer/PausableMotionDiv.tsx
// Run repeating transform/opacity decorations on the compositor; retain their exact phase on pause.
type KeyframeValue = string | number;
type KeyframeTarget = Record<string, KeyframeValue | KeyframeValue[]>;
type PausableMotionDivProps = HTMLAttributes<HTMLDivElement> & {
    animate: KeyframeTarget;
    transition: { duration?: number; delay?: number; repeat?: number; ease?: 'easeInOut' | 'easeOut' | 'linear' };
    paused?: boolean;
};

/** Motion eases each keyframe interval; WAAPI's timing-level easing would distort the entire path. */
export const buildDecorationKeyframes = (target: KeyframeTarget, easing: string): Keyframe[] => {
    const count = Math.max(1, ...Object.values(target).map(value => Array.isArray(value) ? value.length : 1));
    const valueAt = (value: KeyframeValue | KeyframeValue[], index: number) => (
        Array.isArray(value) ? value[Math.min(index, value.length - 1)] : value
    );
    const frames = Array.from({ length: count }, (_, index): Keyframe => {
        const frame: Keyframe = { easing };
        const transforms: string[] = [];
        for (const [key, value] of Object.entries(target)) {
            const next = valueAt(value, index);
            if (key === 'x' || key === 'y') transforms.push(`translate${key.toUpperCase()}(${next}${typeof next === 'number' ? 'px' : ''})`);
            else if (key === 'rotate') transforms.push(`rotate(${next}${typeof next === 'number' ? 'deg' : ''})`);
            else frame[key] = next;
        }
        if (transforms.length) frame.transform = transforms.join(' ');
        return frame;
    });
    // Scalar targets interpolate from the current underlying style, just like a normal Motion tween.
    return count === 1 ? [{ easing }, frames[0]] : frames;
};

export const PausableMotionDiv = ({ animate, transition, paused = false, ...props }: PausableMotionDivProps) => {
    const elementRef = useRef<HTMLDivElement | null>(null);
    const controlsRef = useRef<Animation | null>(null);
    const visible = useAppVisibility();
    const latest = useRef({ animate, transition, paused: paused || !visible });
    latest.current = { animate, transition, paused: paused || !visible };
    const signature = JSON.stringify([animate, transition]);
    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;
        const next = latest.current;
        const easing = next.transition.ease === 'easeInOut' ? 'cubic-bezier(0.42, 0, 0.58, 1)'
            : next.transition.ease === 'linear' ? 'linear' : 'cubic-bezier(0, 0, 0.58, 1)';
        const controls = element.animate(buildDecorationKeyframes(next.animate, easing), {
            duration: (next.transition.duration ?? 0.3) * 1000,
            delay: (next.transition.delay ?? 0) * 1000,
            iterations: (next.transition.repeat ?? 0) + 1,
            fill: 'both',
        });
        controlsRef.current = controls;
        if (next.paused) controls.pause();
        return () => {
            // A setting/theme change can replace a moving target with a scalar tween. Start that
            // tween at the current pose, rather than snapping back when the old animation is removed.
            try { controls.commitStyles?.(); } catch { /* Detached elements have no style to commit. */ }
            controls.cancel();
            controlsRef.current = null;
        };
    }, [signature]);
    useEffect(() => {
        const controls = controlsRef.current;
        if (!controls || controls.playState === 'finished') return;
        if (paused || !visible) controls.pause();
        else controls.play();
    }, [paused, visible]);
    return <div {...props} ref={elementRef} />;
};
