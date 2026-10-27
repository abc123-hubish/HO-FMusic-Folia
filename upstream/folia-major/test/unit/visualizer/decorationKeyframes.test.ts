import { describe, expect, it } from 'vitest';
import { buildDecorationKeyframes } from '@/components/visualizer/PausableMotionDiv';

// test/unit/visualizer/decorationKeyframes.test.ts
// Keep the original decoration path and per-segment easing when moving it onto the compositor.
describe('decoration keyframes', () => {
    it('preserves each translation, rotation and opacity stop without inventing an entrance', () => {
        const frames = buildDecorationKeyframes({ x: [15, -25, 15], y: [-40, 60, -40],
            rotate: [97, -23, 97], opacity: [0.1, 0.2, 0.1] }, 'cubic-bezier(0.42, 0, 0.58, 1)');
        expect(frames).toHaveLength(3);
        expect(frames[0].transform).toBe('translateX(15px) translateY(-40px) rotate(97deg)');
        expect(frames[1].transform).toBe('translateX(-25px) translateY(60px) rotate(-23deg)');
        expect(frames.map(frame => frame.opacity)).toEqual([0.1, 0.2, 0.1]);
        expect(frames.every(frame => frame.easing === 'cubic-bezier(0.42, 0, 0.58, 1)')).toBe(true);
    });
    it('keeps scalar transitions based on the current underlying style', () => {
        const frames = buildDecorationKeyframes({ borderColor: '#fff', boxShadow: 'none' }, 'linear');
        expect(frames).toEqual([{ easing: 'linear' }, { easing: 'linear', borderColor: '#fff', boxShadow: 'none' }]);
    });
    it('preserves transform units when explicitly provided', () => {
        expect(buildDecorationKeyframes({ x: ['10%', '20%'], rotate: ['0.2rad', '0.4rad'] }, 'linear')[1].transform)
            .toBe('translateX(20%) rotate(0.4rad)');
    });
});
