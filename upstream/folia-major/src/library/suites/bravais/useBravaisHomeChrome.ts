import { useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { LibraryHomeSurfaceProps } from '../../core/contracts/suite';
import type { LibraryHomeTabKey, LibraryHomeTabView } from '../../core/contracts/homeModel';
import { isOnlineHomeTab } from '../../core/model/homeSources';
import type { BravaisSeamTab } from './bravaisLayer';
import type { BravaisHomeSearch, BravaisHomeTool } from './bravaisHomeModels';
import { cycleHomeTab } from './bravaisHomeProjection';
import { setBravaisSearchOpen, useBravaisHomeUiStore } from './bravaisHomeUiStore';
import { useBravaisSeamStore } from './bravaisSeamLevel';
import { selectBravaisHasCurrentSong } from './bravaisBack';
import { usePlaybackStore } from '../../../stores/usePlaybackStore';
import { resolveSearchSource, useSearchNavigationStore } from '../../../stores/useSearchNavigationStore';

// src/library/suites/bravais/useBravaisHomeChrome.ts
// 首页缝里与来源无关的那一部分（设计稿 §10.5）：五个一级页签与 F6 的循环、全局搜索框（提交走 onSearchCommitted
// 去 SearchWorkspace，过渡期唯一的离墙路径）、app 级入口（打开队列 = 整墙切到 Lattice、回到播放页、舞台播放器、
// 设置）与扫描进度。各来源的墙（BravaisHomeSources）在它之上补自己的二级切换、「⋯」与刷新。
// 回调身份稳定（latest-ref），层描述不因它们换身份。

export type BravaisHomeChrome = {
    title: string;
    tabs: readonly BravaisSeamTab[];
    onSelectTab: (key: string) => void;
    cycleTab: (delta: 1 | -1) => boolean;
    /** 搜索放最前，app 级入口放最后；来源自己的按钮插在中间。 */
    searchTool: BravaisHomeTool;
    appTools: readonly BravaisHomeTool[];
    search: BravaisHomeSearch;
    /** 本地导入 / 重扫时的扫描进度（没有在扫描时为 null）。 */
    scan: string | null;
};

type ChromeProps = Pick<
    LibraryHomeSurfaceProps,
    | 'onSearchCommitted' | 'onOpenLattice' | 'onBackToPlayer' | 'onOpenStagePlayer' | 'stageEnabled' | 'stageIsActive' | 'onOpenSettings'
    | 'localSongs' | 'localLibraryCatalog'
>;

export const useBravaisHomeChrome = ({
    tab,
    tabs,
    providerId,
    selectTab,
    scanPercent,
    scanning,
    props,
}: {
    tab: LibraryHomeTabKey;
    tabs: readonly LibraryHomeTabView[];
    /** 在线页签搜索的来源：当前在线 provider。 */
    providerId: string;
    selectTab: (key: LibraryHomeTabKey) => boolean;
    scanPercent: number;
    scanning: boolean;
    props: ChromeProps;
}): BravaisHomeChrome => {
    const { t } = useTranslation();
    const searchOpen = useBravaisHomeUiStore(state => state.searchOpen);
    const latest = useRef({ tab, tabs, providerId, selectTab, props });
    latest.current = { tab, tabs, providerId, selectTab, props };

    const onSelectTab = useCallback((key: string) => { latest.current.selectTab(key as LibraryHomeTabKey); }, []);
    const cycleTab = useCallback((delta: 1 | -1) => {
        const { tab: current, tabs: all, selectTab: select } = latest.current;
        const next = cycleHomeTab(all, current, delta);
        return next ? select(next as LibraryHomeTabKey) : false;
    }, []);

    const seamTabs = useMemo<BravaisSeamTab[]>(() => tabs.map(candidate => ({
        key: candidate.key,
        label: candidate.label,
        active: candidate.key === tab,
        disabled: Boolean(candidate.disabledReason),
    })), [tab, tabs]);

    // 先通过共享搜索 store 发起请求，再把同一来源的结果压进历史，避免恢复空缓存或搜错平台。
    const submitSearch = useCallback(async (query: string) => {
        const { tab: current, providerId: activeProviderId, props: host } = latest.current;
        const sourceTab = isOnlineHomeTab(current) ? activeProviderId : resolveSearchSource(current);
        const didSearch = await useSearchNavigationStore.getState().submitSearch({
            query,
            sourceTab,
            deps: {
                localSongs: host.localSongs,
                localLibraryCatalog: host.localLibraryCatalog,
                t: (key, fallback) => t(key, fallback ?? ''),
            },
        });
        if (didSearch) host.onSearchCommitted(query, sourceTab);
    }, [t]);

    const search = useMemo<BravaisHomeSearch>(() => ({
        title: t('libraryBravaisHome.search'),
        placeholder: t('libraryBravaisHome.searchPlaceholder'),
        hint: t('libraryBravaisHome.searchHint'),
        submitLabel: t('libraryBravaisHome.searchSubmit'),
        closeLabel: t('libraryBravaisHome.searchClose'),
        onSubmit: query => { void submitSearch(query); },
    }), [submitSearch, t]);

    const searchTool = useMemo<BravaisHomeTool>(() => ({
        id: 'search',
        // 与「过滤当前页」区分：工具格里的这一格是去在线平台搜索（切到搜索页），不是收窄这面墙。
        label: t('libraryBravaisHome.searchOnline'),
        pressed: searchOpen,
        run: () => {
            const seam = useBravaisSeamStore.getState();
            if (seam.level === 'hidden') seam.restore();
            setBravaisSearchOpen(!useBravaisHomeUiStore.getState().searchOpen);
        },
    }), [searchOpen, t]);

    const { onOpenLattice, onBackToPlayer, onOpenStagePlayer, stageEnabled, stageIsActive, onOpenSettings } = props;
    const stageActive = Boolean(stageIsActive);
    const hasLattice = Boolean(onOpenLattice);
    const hasStage = Boolean(onOpenStagePlayer && stageEnabled);
    const hasSettings = Boolean(onOpenSettings);
    // 「回到播放页」与左上角返回同一个判断：有当前歌曲才显示（没有歌时去的是空的播放页）。
    const hasCurrentSong = usePlaybackStore(selectBravaisHasCurrentSong);
    const hasPlayer = Boolean(onBackToPlayer) && hasCurrentSong;
    const appTools = useMemo<BravaisHomeTool[]>(() => {
        const tools: BravaisHomeTool[] = [];
        if (hasLattice) tools.push({ id: 'queue', label: t(tab === 'explore' ? 'home.latticeExplore' : 'home.lattice'), run: () => latest.current.props.onOpenLattice?.(latest.current.tab === 'explore' ? 'explore' : 'queue') });
        if (hasPlayer) tools.push({ id: 'player', label: t('libraryBravaisHome.backToPlayer'), run: () => latest.current.props.onBackToPlayer() });
        // fb11：舞台开着时它单独占工具格最上面一行（图标 + 短名「舞台」），active 与 grid 的 data-stage-active 同义。
        if (hasStage) tools.push({ id: 'stage', label: t('libraryBravaisHome.stagePlayer'), shortLabel: t('libraryBravaisHome.stageShort'), active: stageActive, run: () => latest.current.props.onOpenStagePlayer?.() });
        if (hasSettings) tools.push({ id: 'settings', label: t('libraryBravaisHome.settings'), run: () => latest.current.props.onOpenSettings?.() });
        return tools;
    }, [hasLattice, hasPlayer, hasSettings, hasStage, stageActive, t, tab]);

    const scan = scanning ? t('libraryBravaisHome.scanProgress', { percent: scanPercent }) : null;

    return useMemo(() => ({
        title: t('libraryBravais.homeTitle'),
        tabs: seamTabs,
        onSelectTab,
        cycleTab,
        searchTool,
        appTools,
        search,
        scan,
    }), [appTools, cycleTab, onSelectTab, scan, search, searchTool, seamTabs, t]);
};
