import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import type { MotionValue } from 'framer-motion';
import { createVisualizerFrameLoop } from '../frameLoop';
import { TRANSITION_DURATION } from './dioramaTransition';

// src/components/visualizer/diorama/DioramaFrameControl.tsx
// Demand frames while paused: finish camera easing, then wake only for seek/layout/resource changes.
export const DioramaFrameControl = ({ paused, currentTime }: {
    paused: boolean;
    currentTime: MotionValue<number>;
}) => {
    const invalidate = useThree(state => state.invalidate);
    const loopRef = useRef<ReturnType<typeof createVisualizerFrameLoop> | null>(null);
    useEffect(() => {
        if (!paused) return;
        const loop = createVisualizerFrameLoop(() => { invalidate(); }, {
            paused: true, settleMs: (TRANSITION_DURATION + 0.5) * 1000,
        });
        loopRef.current = loop;
        const unsubscribe = currentTime.on('change', loop.invalidate);
        return () => { unsubscribe(); loop.dispose(); loopRef.current = null; };
    }, [currentTime, invalidate, paused]);
    // Theme, layout and late lyric resources can change while the playback clock is frozen.
    useEffect(() => { loopRef.current?.invalidate(); });
    return null;
};
