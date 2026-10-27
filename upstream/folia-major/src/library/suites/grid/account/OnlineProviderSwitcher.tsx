import { openLoginWindow, useLoginWindowStore } from '../../../../components/login/loginWindowStore';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronRight, UserRound } from 'lucide-react';
import { AnimatePresence, motion, useMotionValueEvent } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { OnlineProviderId, ProviderAccountSummary } from '../../../../types/onlineMusic';
import { playerBottomBarLiveOffset } from '../../../../stores/motionSignals';
import {
    PLAYER_BOTTOM_BAR_BASE_OFFSET_PX,
    resolvePlayerBottomComponentBottomPx,
} from '../../../../utils/playerBottomBarLayout';

// src/library/suites/grid/account/OnlineProviderSwitcher.tsx

type OnlineProviderSwitcherProps = {
    providers: ProviderAccountSummary[];
    activeProviderId: OnlineProviderId;
    isDaylight: boolean;
    onSelect: (provider: ProviderAccountSummary) => void;
    onLogout: (provider: ProviderAccountSummary) => void;
    onBackToPlayer: () => void;
};

// 在线平台使用统一的纯色圆形文字徽章。
const AVATAR_BADGE_BY_PROVIDER: Record<string, { label: string; iconUrl?: string; className: string }> = {
    netease: { label: '易', className: 'bg-red-600' },
    kugou: { label: '酷', className: 'bg-blue-600' },
    qq: { label: 'Q', className: 'bg-green-600' },
    bodian: { label: '波', className: 'bg-teal-600' },
};

// Providers without a builtin badge (Folium mod sources) get their name's first letter, like the
// connect panel, rather than a person icon that reads as an account.
const fallbackBadge = (provider: ProviderAccountSummary) => ({
    label: Array.from(provider.shortName)[0] ?? '',
    className: 'bg-zinc-600',
});

const ProviderAvatar = ({ provider, className }: { provider: ProviderAccountSummary; className: string }) => {
    const badge = AVATAR_BADGE_BY_PROVIDER[provider.providerId] ?? fallbackBadge(provider);
    return provider.user?.avatarUrl
        ? <img src={typeof window !== 'undefined' && (window.electron || window.FoliaNative) ? provider.user.avatarUrl : provider.user.avatarUrl.replace(/^http:/, 'https:')} alt={provider.user.nickname} className={`${className} object-cover`} />
        : (
            <span
                aria-label={provider.displayName}
                className={`${className} flex items-center justify-center overflow-hidden font-black text-white ${badge.className}`}
            >
                {badge.iconUrl
                    ? <img src={badge.iconUrl} alt="" aria-hidden="true" className="h-3/5 w-3/5 object-contain" />
                    : badge.label || <UserRound size={20} />}
            </span>
        );
};

const OnlineProviderSwitcher: React.FC<OnlineProviderSwitcherProps> = ({
    providers,
    activeProviderId,
    isDaylight,
    onBackToPlayer,
}) => {
    const { t } = useTranslation();
    const landing = useLoginWindowStore(state => state.landingProviderId);
    const [showProviderLabel, setShowProviderLabel] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const baseBottomPxRef = useRef(16);
    const previousProviderIdRef = useRef(activeProviderId);
    const visibleProviders = providers.filter(provider => provider.availability.reason !== 'runtime-unavailable');
    const activeProvider = visibleProviders.find(provider => provider.providerId === activeProviderId) || visibleProviders[0];
    const surfaceClass = isDaylight ? 'bg-white text-zinc-900' : 'bg-zinc-950 text-white';

    /**
     * 默认高度保留原 CSS（`bottom-4 md:bottom-6`），只有真的产生抬升量时才写内联 bottom。
     *
     * 不是洁癖：把位置常驻交给 motion 的 style 会给这一层加上 will-change，元素被提升成
     * 独立合成层，文字栅格化随之改变 —— app.screenshot 的 local-library 基线能直接照出来。
     */
    const syncBottomOffset = useCallback((globalOffsetPx: number) => {
        const root = rootRef.current;
        if (!root) return;
        if (globalOffsetPx === PLAYER_BOTTOM_BAR_BASE_OFFSET_PX) {
            root.style.removeProperty('bottom');
            return;
        }
        root.style.bottom = `${resolvePlayerBottomComponentBottomPx(globalOffsetPx, baseBottomPxRef.current)}px`;
    }, []);

    useMotionValueEvent(playerBottomBarLiveOffset, 'change', syncBottomOffset);

    /** 先撤掉内联值量回 CSS 里的原始底距（断点会改它），再按当前抬升量重写。 */
    const measureAndSync = useCallback(() => {
        const root = rootRef.current;
        if (!root) return;
        root.style.removeProperty('bottom');
        const measured = Number.parseFloat(getComputedStyle(root).bottom);
        baseBottomPxRef.current = Number.isFinite(measured) ? measured : 16;
        syncBottomOffset(playerBottomBarLiveOffset.get());
    }, [syncBottomOffset]);

    /**
     * 用 callback ref 而不是挂载时的 layout effect：providers 还没到位时下面会 return null，
     * 那一次 effect 拿到的 ref 是空的，而它不会再跑第二遍 —— 切换器就会一直停在原位，
     * 底部其他组件却已经抬起来了。节点真正出现时才量，才不会有这个空窗。
     */
    const setRootNode = useCallback((node: HTMLDivElement | null) => {
        rootRef.current = node;
        if (node) {
            measureAndSync();
        }
    }, [measureAndSync]);

    // 断点跨过去时 CSS 里的原始底距会变，重量一次。
    useEffect(() => {
        window.addEventListener('resize', measureAndSync);
        return () => window.removeEventListener('resize', measureAndSync);
    }, [measureAndSync]);

    useEffect(() => {
        if (previousProviderIdRef.current === activeProviderId) return;
        previousProviderIdRef.current = activeProviderId;
        setShowProviderLabel(true);
        const hideTimer = window.setTimeout(() => setShowProviderLabel(false), 1800);
        return () => window.clearTimeout(hideTimer);
    }, [activeProviderId]);


    if (!activeProvider) return null;

    return (
        <div
            ref={setRootNode}
            data-testid="online-provider-switcher"
            className="pointer-events-auto absolute bottom-4 right-4 z-[100] md:bottom-6 md:right-6"
        >
            <div className={`flex items-center rounded-full p-0.5 shadow-lg md:p-1.5 ${surfaceClass}`}>
                <button
                    type="button"
                    onClick={() => openLoginWindow(activeProviderId)}
                    className={`flex items-center rounded-full gap-0 py-1 pl-1 pr-1 transition-all ${showProviderLabel ? 'md:gap-2 md:pr-3' : 'md:gap-0 md:pr-1'} ${isDaylight ? 'hover:bg-black/5' : 'hover:bg-white/10'}`}
                    title={t('home.switchOnlineProvider')}
                    aria-label={t('home.switchOnlineProvider')}
                    aria-haspopup="dialog"
                >
                    <span data-login-pill={activeProvider.providerId} className="inline-flex shrink-0"
                        style={{ opacity: landing === activeProvider.providerId ? 0 : 1 }}>
                        <ProviderAvatar provider={activeProvider} className="h-9 w-9 shrink-0 rounded-full md:h-10 md:w-10" />
                    </span>
                    <AnimatePresence initial={false}>
                        {showProviderLabel && (
                            <motion.span
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: 'auto', opacity: 1 }}
                                exit={{ width: 0, opacity: 0 }}
                                transition={{ duration: 0.2, ease: 'easeOut' }}
                                className="hidden max-w-16 overflow-hidden whitespace-nowrap text-xs font-semibold md:block"
                            >
                                {activeProvider.shortName}
                            </motion.span>
                        )}
                    </AnimatePresence>
                </button>
                <span className={`mx-1 hidden h-6 w-px md:block ${isDaylight ? 'bg-black/10' : 'bg-white/15'}`} aria-hidden="true" />
                <button
                    type="button"
                    onClick={onBackToPlayer}
                    className={`hidden h-10 w-10 items-center justify-center rounded-full transition-colors md:flex ${isDaylight ? 'hover:bg-black/5' : 'hover:bg-white/10'}`}
                    title={t('home.backToPlayer')}
                    aria-label={t('home.backToPlayer')}
                >
                    <ChevronRight size={21} />
                </button>
            </div>


        </div>
    );
};

export default OnlineProviderSwitcher;
