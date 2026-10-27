import React, { useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Check, Smartphone, User } from 'lucide-react';
import type { OnlineProviderId, ProviderUser } from '../../../types/onlineMusic';
import { settingsTokens, useSettingsKitTheme } from '../../modal/settings/kit/kitTheme';
import { AccountPicture, PlatformMark, platformMarkOf } from '../PlatformMark';
import { platformShades } from './platformShades';
import { boxOf, type LoginDoneParts } from './useLoginDone';

// src/components/login/done/LoginDone.tsx
// Upstream completion visuals, sized for this application's responsive login window.
export { useLoginDone } from './useLoginDone';
const TILE = 176;
const PICTURE = 88;
const keep = (parts: React.RefObject<LoginDoneParts>, name: string) => (element: HTMLElement | SVGElement | null): void => {
    parts.current[name] = element;
};

type TileLayerProps = {
    parts: React.RefObject<LoginDoneParts>;
    /** 这一面颜色（platformShades 的 surface）。 */
    surface: string;
    /** 颜色长出来之前那一块画里的东西：二维码，或者浏览器的小画。 */
    source: React.ReactNode;
    /** 底下是二维码：它有一张白底，和它一起淡掉。 */
    onPaper: boolean;
};

/** 那一块画里的一层。颜色和窗口上铺的那一面是同一幅画的同一处，所以颜色离开这一块时什么都不跳。 */
export const LoginDoneTile: React.FC<TileLayerProps> = ({ parts, surface, source, onPaper }) => {
    const root = useRef<HTMLDivElement>(null);
    // 这一块画在窗口里的位置，量出来给那一面颜色对齐用。
    useLayoutEffect(() => {
        const layer = root.current;
        const frame = boxOf(parts.current.flood);
        const box = boxOf(layer);
        if (!layer || !frame || !box) return;
        layer.style.setProperty('--login-done-size', `${frame.width}px ${frame.height}px`);
        layer.style.setProperty('--login-done-at', `${frame.left - box.left}px ${frame.top - box.top}px`);
    }, [parts]);

    return (
        <div ref={root} className="absolute inset-0 text-[color:var(--login-on-pc)]">
            <div ref={keep(parts, 'source')} className="absolute inset-0">
                {onPaper && <i className="absolute inset-0 bg-white" />}
                <div className="absolute inset-0 grid place-items-center">{source}</div>
            </div>
            <i
                ref={keep(parts, 'colour')}
                className="absolute inset-0"
                style={{ background: surface, backgroundRepeat: 'no-repeat', backgroundSize: 'var(--login-done-size, 100% 100%)', backgroundPosition: 'var(--login-done-at, 0 0)', clipPath: `inset(${TILE / 2}px)` }}
            />
            <svg className="absolute inset-0" width={TILE} height={TILE} viewBox={`0 0 ${TILE} ${TILE}`} fill="none" stroke="currentColor">
                <circle ref={keep(parts, 'ring0')} cx={TILE / 2} cy={TILE / 2} r="44" strokeWidth="1.25" style={{ opacity: 0 }} />
                <circle ref={keep(parts, 'ring1')} cx={TILE / 2} cy={TILE / 2} r="44" strokeWidth="1.25" style={{ opacity: 0 }} />
                <circle ref={keep(parts, 'arc')} cx={TILE / 2} cy={TILE / 2} r="52" pathLength="1" strokeWidth="2" strokeLinecap="round" strokeDasharray="0.7 0.3" style={{ opacity: 0, transformOrigin: `${TILE / 2}px ${TILE / 2}px` }} />
            </svg>
            <i ref={keep(parts, 'disc')} className="absolute left-[44px] top-[44px] h-[88px] w-[88px] rounded-full bg-[color-mix(in_srgb,var(--login-on-pc)_13%,transparent)]" style={{ opacity: 0 }} />
            <span ref={keep(parts, 'phone')} className="absolute inset-0 grid place-items-center" style={{ opacity: 0 }}><Smartphone size={36} strokeWidth={1.6} /></span>
            <span ref={keep(parts, 'person')} className="absolute inset-0 grid place-items-center" style={{ opacity: 0 }}><User size={36} strokeWidth={1.6} /></span>
        </div>
    );
};

type DoneProps = {
    parts: React.RefObject<LoginDoneParts>;
    providerId: OnlineProviderId;
    /** 平台的名字：读到的账号没有资料时写它。 */
    label: string;
    /** 读到的账号。 */
    user: ProviderUser | null;
};

// 头像外面的圈和对勾的底在每一种平台的颜色上都是白的（样机定的），只有字跟着「深色还是白色」的规则走。
const WHITE_RING = '0 0 0 3px #fff, 0 14px 30px -8px rgba(0, 0, 0, 0.4)';

const DonePicture: React.FC<Pick<DoneProps, 'providerId' | 'label' | 'user'> & { cornerRef?: React.Ref<HTMLSpanElement> }> = ({ providerId, label, user, cornerRef }) => (
    user
        ? <AccountPicture user={user} size={PICTURE} providerId={cornerRef ? providerId : undefined} cornerRef={cornerRef} />
        : <PlatformMark providerId={providerId} label={label} size={PICTURE} />
);

type FloodProps = DoneProps & {
    surface: string;
    tickColour: string;
    /** 读到了账号：这一面的内容挂上。之前只有一个空框，给画的人量窗口用。 */
    shown: boolean;
    title: string;
    /** 头像那一行离窗口左边多远。 */
    left: number;
};

/** 铺满窗口的那一面颜色：它带着自己的头像、两行字和水印，底下的东西不用跟着变色。 */
export const LoginDoneFlood: React.FC<FloodProps> = ({ parts, providerId, label, user, surface, tickColour, shown, title, left }) => (
    <div ref={keep(parts, 'flood')} data-testid={shown ? 'login-success' : undefined} className="absolute inset-0 overflow-hidden text-[color:var(--login-on-pc)]" style={{ visibility: 'hidden' }}>
        {shown && (
            <div ref={keep(parts, 'surface')} className="absolute inset-0 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12),inset_0_1px_0_rgba(255,255,255,0.2)]" style={{ background: surface }}>
                <i ref={keep(parts, 'light')} className="absolute inset-0" style={{ opacity: 0 }} />
                <span
                    ref={keep(parts, 'watermark')}
                    className="login-done-watermark absolute -right-[92px] top-1/2 -mt-[170px] grid h-[340px] w-[340px] place-items-center rounded-full text-[196px] font-extrabold leading-none"
                    style={{ opacity: 0 }}
                >
                    {platformMarkOf(providerId, label).letter}
                </span>
                <div className="absolute top-1/2 flex -translate-y-1/2 items-center gap-[22px]" style={{ left, right: 24 }}>
                    <span ref={keep(parts, 'picture')} className="relative flex shrink-0 rounded-full" style={{ opacity: 0, boxShadow: WHITE_RING }}>
                        <DonePicture providerId={providerId} label={label} user={user} />
                        <i ref={keep(parts, 'ping')} className="absolute -inset-[3px] rounded-full shadow-[0_0_0_1.5px_#fff]" style={{ opacity: 0 }} />
                        <span
                            ref={keep(parts, 'tick')}
                            className="absolute -bottom-[3px] -right-[3px] grid h-[26px] w-[26px] place-items-center rounded-full bg-white shadow-[0_0_0_3px_var(--login-pc)]"
                            style={{ opacity: 0, color: tickColour }}
                        >
                            <Check size={14} strokeWidth={3} />
                        </span>
                    </span>
                    <div className="min-w-0">
                        <em ref={keep(parts, 'line1')} className="block text-[13px] font-medium not-italic leading-5 tracking-[0.02em]" style={{ opacity: 0 }}>{title}</em>
                        <b ref={keep(parts, 'line2')} className="mt-0.5 block max-w-[270px] truncate text-[28px] font-semibold leading-9 tracking-[-0.01em]" style={{ opacity: 0 }}>
                            {user?.nickname || label}
                        </b>
                    </div>
                </div>
            </div>
        )}
    </div>
);

/**
 * 飞向切换器的头像：画在窗口外面，窗口淡出之后它还在路上。白圈一路淡掉，角上平台的记号一路出来。
 * 它在应用的颜色变量够不着的地方，所以自己带着（没有头像的账号画的那个字要用）。
 */
export const LoginDoneFlight: React.FC<DoneProps> = ({ parts, providerId, label, user }) => {
    const { isDaylight, theme } = useSettingsKitTheme();
    return createPortal(
        <div
            ref={keep(parts, 'flight')}
            data-testid="login-success-flight"
            className="pointer-events-none fixed left-0 top-0 z-[300] flex"
            style={{ ...settingsTokens(isDaylight, theme), visibility: 'hidden', '--login-edge': 'transparent' } as React.CSSProperties}
        >
            <span ref={keep(parts, 'flightRing')} className="relative flex rounded-full" style={{ boxShadow: WHITE_RING }}>
                <DonePicture providerId={providerId} label={label} user={user} cornerRef={keep(parts, 'flightMark')} />
            </span>
        </div>,
        document.body,
    );
};

/** 一个平台的那一面颜色和对勾的颜色。 */
export const loginDoneColours = (providerId: OnlineProviderId, label: string) => {
    const shades = platformShades(platformMarkOf(providerId, label).color);
    return { surface: shades.surface, tick: shades.tick };
};
