import { useCallback, useRef, type RefObject } from 'react';
import type { WallView, WallViewCenter } from '../../../components/wall/wallView';
import { computeBravaisFrame } from './bravaisFrame';

// src/library/suites/bravais/useBravaisFrame.ts
// stage 每帧要写的那几样（相机、缝的锚点与动画中的开口、缝内容的排版宽度、是否折叠）放在一个可变的 ref 里，
// 相机与缝的动画只改它再调 renderFrame：直接写两个世界层的 transform、缝的位置与宽度、缝内容的透明度、
// 边缘标签的显隐与侧别，不经过 React（frontend-runtime-guardrails：拖动、补间期间没有逐帧 setState）。

export type BravaisFrameState = {
    view: WallView | null;
    center: WallViewCenter;
    anchorX: number | null;
    openWidth: number;
    /** 开口正在补间去的宽度（不补间时等于 openWidth）：开口张开途中给聚焦卡的相机让位按张开后的缝算。 */
    targetOpenWidth: number;
    contentWidth: number;
    hidden: boolean;
};

export type BravaisFrameRefs = {
    left: RefObject<HTMLDivElement | null>;
    right: RefObject<HTMLDivElement | null>;
    seam: RefObject<HTMLDivElement | null>;
    seamContent: RefObject<HTMLDivElement | null>;
    tab: RefObject<HTMLButtonElement | null>;
};

/** 相同样式不重复写：相机平移期间缝的宽度与内容透明度通常保持不变。 */
const writeStyle = (element: HTMLElement | null, key: 'transform' | 'width' | 'opacity', value: string) => {
    if (element && element.style[key] !== value) element.style[key] = value;
};

export const useBravaisFrame = (refs: BravaisFrameRefs) => {
    const stateRef = useRef<BravaisFrameState>({
        view: null,
        center: { x: 0, y: 0 },
        anchorX: null,
        openWidth: 0,
        targetOpenWidth: 0,
        contentWidth: 0,
        hidden: false,
    });

    const renderFrame = useCallback(() => {
        const state = stateRef.current;
        if (!state.view) return;
        const frame = computeBravaisFrame({
            center: state.center,
            view: state.view,
            anchorX: state.anchorX,
            openWidth: state.openWidth,
            contentWidth: state.contentWidth,
            hidden: state.hidden,
        });
        const { left, right, seam, seamContent, tab } = refs;
        // 拖动只改世界位置；宽度、透明度等相同值不重复写，避免每帧使缝的布局与样式失效。
        writeStyle(left.current, 'transform', `translate3d(${frame.left.x}px, ${frame.left.y}px, 0px) scale(${frame.scale})`);
        writeStyle(right.current, 'transform', `translate3d(${frame.right.x}px, ${frame.right.y}px, 0px) scale(${frame.scale})`);
        const seamElement = seam.current;
        if (seamElement) {
            writeStyle(seamElement, 'transform', `translate3d(${frame.seam.x - frame.seam.width / 2}px, 0px, 0px)`);
            writeStyle(seamElement, 'width', `${frame.seam.width}px`);
            const visibility = frame.seam.visible ? 'visible' : 'hidden';
            if (seamElement.style.visibility !== visibility) seamElement.style.visibility = visibility;
        }
        writeStyle(seamContent.current, 'opacity', String(frame.contentOpacity));
        const tabElement = tab.current;
        if (tabElement) {
            const display = frame.tab.visible ? '' : 'none';
            if (tabElement.style.display !== display) tabElement.style.display = display;
            if (tabElement.dataset.side !== frame.tab.side) tabElement.dataset.side = frame.tab.side;
        }
    }, [refs]);

    return { stateRef, renderFrame };
};
