import { useEffect, useLayoutEffect, useRef } from 'react';
import type React from 'react';
import type { OnlineProviderId } from '../../../types/onlineMusic';
import { loginDoneFrame, type LoginDoneFrame } from './loginDoneFrame';

// src/components/login/done/useLoginDone.ts
// Upstream animation runtime; per-frame values update DOM styles, never React state.
/** 画的人要写 style 的那些元素，按名字记着。 */
export type LoginDoneParts = Record<string, HTMLElement | SVGElement | null>;

const TILE = 176;
const PICTURE = 88;
const mix = (a: number, b: number, k: number): number => a + (b - a) * k;

type Geometry = {
    /** 窗口的大小，和那一块画的中心在窗口里的位置。 */
    width: number; height: number; x: number; y: number;
    /** 飞的那一段：头像在屏幕上从哪到哪。切换器不在屏幕上、或者它画的是别的平台，就是 null，头像不飞。 */
    flight: { fromX: number; fromY: number; toX: number; toY: number; size: number } | null;
};

/**
 * 头像要飞去的地方：切换器上画头像的那一格，只在它画的就是这个平台的时候（它在 data-login-pill 上写着自己
 * 画的是谁）。登录了却没有切过去（切换被拒了），切换器上还是原来那个平台的账号：没有地方可去。
 */
export const loginDonePill = (providerId: OnlineProviderId): HTMLElement | null => {
    return [...document.querySelectorAll<HTMLElement>('[data-login-pill]')]
        .find(pill => pill.dataset.loginPill === providerId && pill.getBoundingClientRect().width > 0) ?? null;
};

const style = (parts: LoginDoneParts, name: string, values: Record<string, string | number>): void => {
    const element = parts[name];
    if (element) Object.assign(element.style, values);
};

/** 把一帧写到元素上。 */
const paint = (parts: LoginDoneParts, frame: LoginDoneFrame, at: Geometry | null): void => {
    // 那一块画里。
    const grown = TILE / 2 * frame.cover;
    style(parts, 'source', { opacity: frame.source });
    style(parts, 'colour', { clipPath: `inset(${TILE / 2 - grown}px round ${mix(grown, 12, frame.cover)}px)` });
    style(parts, 'tile', { background: frame.cover >= 1 ? 'var(--login-pc)' : '', borderRadius: frame.gather > 0 ? `${mix(12, TILE / 2, frame.gather)}px` : '' });
    style(parts, 'disc', { opacity: frame.disc, transform: `scale(${mix(0.8, 1, frame.disc)})` });
    style(parts, 'phone', { opacity: frame.phone, transform: `scale(${mix(0.86, 1, frame.phone)})` });
    style(parts, 'person', { opacity: frame.person, transform: `scale(${mix(0.86, 1, frame.person)})` });
    frame.rings.forEach((ring, index) => {
        parts[`ring${index}`]?.setAttribute('r', String(mix(44, 94, ring.at)));
        style(parts, `ring${index}`, { opacity: ring.opacity });
    });
    style(parts, 'arc', { opacity: frame.arc.opacity, transform: `rotate(${frame.arc.turn}deg)` });

    // 铺满窗口的那一面。
    const flooding = frame.front !== null && at !== null;
    style(parts, 'flood', { visibility: flooding ? 'visible' : 'hidden' });
    if (!flooding || frame.front === null || !at) return;
    const reach = Math.hypot(Math.max(at.x, at.width - at.x), Math.max(at.y, at.height - at.y)) + 8;
    const radius = mix(TILE / 2, reach, frame.front);
    const centre = `circle at ${at.x}px ${at.y}px`;
    const mask = frame.front < 1 ? `radial-gradient(${centre}, #000 ${radius - 3}px, transparent ${radius}px)` : '';
    style(parts, 'surface', { maskImage: mask, webkitMaskImage: mask });
    style(parts, 'light', {
        opacity: frame.front < 1 ? 1 : 0,
        background: `radial-gradient(${centre}, transparent ${radius - 30}px, rgba(255, 255, 255, ${frame.light}) ${radius - 11}px, transparent ${radius - 1}px)`,
    });
    const { picture } = frame;
    // 飞向切换器的头像：量到了那一段路才飞。切换器不在屏幕上就不飞，窗口里的那一个留着，跟窗口一起淡出。
    const path = at.flight;
    const flying = frame.flight !== null && path !== null;
    style(parts, 'picture', {
        opacity: flying ? 0 : picture.opacity,
        transform: `translateY(${(at.y - at.height / 2) * picture.lift}px) scale(${picture.scale})`,
        boxShadow: `0 0 0 3px #fff, 0 ${mix(30, 14, picture.settle)}px ${mix(56, 30, picture.settle)}px -8px rgba(0, 0, 0, ${mix(0.2, 0.4, picture.settle)})`,
    });
    style(parts, 'ping', { opacity: frame.ping.opacity, transform: `scale(${frame.ping.scale})` });
    style(parts, 'tick', { opacity: frame.tick * frame.words, transform: `scale(${mix(0.5, 1, frame.tick)})` });
    style(parts, 'line1', { opacity: frame.line1 * frame.words, transform: `translateY(${10 * (1 - frame.line1)}px)` });
    style(parts, 'line2', { opacity: frame.line2 * frame.words, transform: `translateY(${12 * (1 - frame.line2)}px)` });
    style(parts, 'watermark', {
        opacity: frame.watermark.opacity * frame.words,
        transform: `translateX(${30 * frame.watermark.drift}px) scale(${mix(1, 1.08, frame.watermark.drift)})`,
    });

    style(parts, 'flight', { visibility: flying ? 'visible' : 'hidden' });
    if (!frame.flight || !path) return;
    style(parts, 'flight', {
        opacity: frame.flight.opacity,
        transform: `translate(${mix(path.fromX, path.toX, frame.flight.across)}px, ${mix(path.fromY, path.toY, frame.flight.down)}px) scale(${mix(1, path.size / PICTURE, frame.flight.across)})`,
    });
    style(parts, 'flightRing', { boxShadow: `0 0 0 3px rgba(255, 255, 255, ${frame.flight.ring}), 0 14px 30px -8px rgba(0, 0, 0, ${0.4 * frame.flight.ring})` });
    style(parts, 'flightMark', { opacity: frame.flight.mark });
};

/** 屏幕上一个元素的框；没有这个元素、或者它没有大小（没画出来）是 null。 */
export const boxOf = (element: Element | null | undefined): DOMRect | null => {
    const box = element?.getBoundingClientRect();
    return box && box.width > 0 && box.height > 0 ? box : null;
};

/**
 * 放动画：`playing` 的时候每一帧问一次 loginDoneFrame 并画出来。三个时刻从 `scanned`、`confirmed`、`read`
 * 第一次变成 true 的那一刻记起。动画说窗口该走了调 `onLeave`，放完了调 `onEnd`。`providerId` 是登录的
 * 那个平台：头像只飞向画着它的切换器。回的 `parts` 交给下面三个部件，它们把自己的元素记进去。
 */
export const useLoginDone = ({ playing, providerId, scanned, confirmed, read, onLeave, onEnd }: {
    playing: boolean;
    providerId: OnlineProviderId | null;
    scanned: boolean;
    confirmed: boolean;
    read: boolean;
    onLeave: () => void;
    onEnd: () => void;
}): React.RefObject<LoginDoneParts> => {
    const parts = useRef<LoginDoneParts>({});
    const moments = useRef<{ scan: number | null; confirm: number | null; read: number | null }>({ scan: null, confirm: null, read: null });
    const ends = useRef({ onLeave, onEnd, providerId });
    ends.current = { onLeave, onEnd, providerId };

    useLayoutEffect(() => {
        const now = performance.now();
        const at = moments.current;
        if (!playing) {
            moments.current = { scan: null, confirm: null, read: null };
            return;
        }
        if (scanned && at.scan === null) at.scan = now;
        if ((confirmed || read) && at.confirm === null) at.confirm = now;
        if (read && at.read === null) at.read = now;
    }, [playing, scanned, confirmed, read]);

    useEffect(() => {
        if (!playing) return undefined;
        let request = 0;
        let geometry: Geometry | null = null;
        let left = false;
        const step = (now: number): void => {
            const at = moments.current;
            const since = (moment: number | null) => (moment === null ? null : Math.max(0, now - moment));
            const frame = loginDoneFrame({ scan: since(at.scan), confirm: since(at.confirm), read: since(at.read) }, now);
            const { tile, flood, picture } = parts.current;
            // 颜色离开那一块画的那一刻量一次：窗口多大，那一块画的中心在哪。
            if (frame.front !== null && !geometry) {
                const frameBox = boxOf(flood);
                const tileBox = boxOf(tile);
                if (frameBox && tileBox) {
                    geometry = { width: frameBox.width, height: frameBox.height, x: tileBox.left + tileBox.width / 2 - frameBox.left, y: tileBox.top + tileBox.height / 2 - frameBox.top, flight: null };
                }
            }
            // 窗口要走的那一刻、它还没有放大之前量一次：头像在哪，切换器在哪。然后让窗口走。
            if (frame.leaving && !left) {
                left = true;
                const from = boxOf(picture);
                const to = boxOf(ends.current.providerId ? loginDonePill(ends.current.providerId) : null);
                if (geometry && from && to) {
                    geometry.flight = { fromX: from.left, fromY: from.top, toX: to.left + to.width / 2 - PICTURE / 2, toY: to.top + to.height / 2 - PICTURE / 2, size: to.width };
                }
                ends.current.onLeave();
            }
            paint(parts.current, frame, geometry);
            if (frame.ended) {
                ends.current.onEnd();
                return;
            }
            request = requestAnimationFrame(step);
        };
        request = requestAnimationFrame(step);
        return () => {
            cancelAnimationFrame(request);
            // 那一块画是窗口自己的，动画只是借它：还回去时把写在它上面的颜色和圆角拿掉。
            style(parts.current, 'tile', { background: '', borderRadius: '' });
        };
    }, [playing]);

    return parts;
};

