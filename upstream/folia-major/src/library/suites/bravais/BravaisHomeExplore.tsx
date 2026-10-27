import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { SongResult } from '../../../types';
import type { OnlineProviderId } from '../../../types/onlineMusic';
import type { LibraryCollectionDescriptor } from '../../core/contracts/collection';
import type { LibraryHomeOnlineSource } from '../../core/contracts/homeModel';
import type { LibraryAccountController } from '../../core/contracts/account';
import { explorePageKey, useExploreFeedStore } from '../../../stores/useExploreFeedStore';
import { useExploreWall } from '../../../components/app/lattice/useExploreWall';
import { listenedSongsOf } from '../../../components/app/home/explore/ownSections';
import { createOnlineGridViewCollection } from '../../../components/app/home/gridViewCollectionAdapters';
import type { BravaisLayer, BravaisSeamModel } from './bravaisLayer';
import type { BravaisHomeTool } from './bravaisHomeModels';
import { projectExploreItems } from './bravaisExploreProjection';
import type { BravaisHomeChrome } from './useBravaisHomeChrome';
import { useBravaisHomeAccount } from './useBravaisHomeAccount';
import { useBravaisLayerRegistration } from './useBravaisLayerRegistration';

// src/library/suites/bravais/BravaisHomeExplore.tsx
// Project the stable Explore feed into the existing HarmonyOS Bravais wall. The wall keeps its
// current geometry, lifecycle and touch handling; songs play within their section and collection
// cards open through the same host as the grid Explore page.
const NO_KEYS: ReadonlySet<string> = new Set();

const BravaisHomeExplore: React.FC<{
    chrome: BravaisHomeChrome;
    online: LibraryHomeOnlineSource;
    account: LibraryAccountController;
    isInteractive: boolean;
    onPlaySong: (song: SongResult, queue: SongResult[], isFmCall?: boolean) => void;
    onOpenGridView: (collection: LibraryCollectionDescriptor) => void;
}> = ({ chrome, online, account: accountController, isInteractive, onPlaySong, onOpenGridView }) => {
    const { t, i18n } = useTranslation();
    const isOn = online.accountView === 'authenticated' && Boolean(online.canUseExplore);
    const providerId = online.providerId as OnlineProviderId;
    const accountId = String(online.user?.id ?? '');
    // 与网格的探索页（ExploreSurface）同一个页键：换平台、账户或语言就是另一页。
    const key = explorePageKey(providerId, accountId, i18n.language);
    const keptKey = useExploreFeedStore(state => state.key);
    useEffect(() => {
        if (isOn) useExploreFeedStore.getState().show(key, listenedSongsOf(providerId, accountId));
    }, [accountId, isOn, keptKey, key, providerId]);
    const feed = useExploreFeedStore(state => (isOn && state.key === key ? state.feed : null));
    const wall = useExploreWall({ isOn, currentSong: null, providerId: isOn ? providerId : undefined, accountId, pageKey: key });

    const items = useMemo(() => projectExploreItems(wall.tiles), [wall.tiles]);

    const latest = useRef({ tiles: wall.tiles, onPlaySong, onOpenGridView, providerId });
    latest.current = { tiles: wall.tiles, onPlaySong, onOpenGridView, providerId };
    const onOpenItem = useCallback((itemKey: string) => {
        const { tiles, onOpenGridView: open, providerId: provider } = latest.current;
        const tile = tiles.find(candidate => candidate.id === itemKey);
        if (tile?.kind === 'collection') open(createOnlineGridViewCollection(tile.collection, provider));
    }, []);
    const onPlayItem = useCallback((itemKey: string) => {
        const { tiles, onPlaySong: play } = latest.current;
        const tile = tiles.find(candidate => candidate.id === itemKey);
        if (tile?.kind === 'song') play(tile.song, tile.queue ?? [tile.song], false);
    }, []);

    const accountSeam = useBravaisHomeAccount(accountController, online);
    const status = online.accountView === 'guest'
        ? (online.needsRelogin ? t('status.loginExpired') : undefined)
        : online.accountView === 'resolving'
            ? t('home.loadingLibrary')
            // 无账户的平台：与网格对同一状态的说法相同（OnlineProviderAccountlessPanel 的标题）。
            : online.accountView === 'accountless'
                ? t('home.accountlessTitle', { provider: online.providerLabel })
                : items.length > 0
                    ? undefined
                    : !feed || feed.status === 'loading' ? t('playlist.loading') : wall.emptyText ?? t('home.exploreEmpty');
    const refreshTool = useMemo<BravaisHomeTool | null>(() => (isOn ? {
        id: 'refresh-explore',
        label: t('home.exploreRefresh'),
        disabled: !wall.canRefresh,
        busy: wall.isRefreshing,
        run: wall.refresh,
    } : null), [isOn, t, wall.canRefresh, wall.isRefreshing, wall.refresh]);
    const tools = useMemo<BravaisHomeTool[]>(() => [
        chrome.searchTool,
        ...(refreshTool ? [refreshTool] : []),
        ...chrome.appTools,
    ], [chrome.appTools, chrome.searchTool, refreshTool]);
    const seam = useMemo<BravaisSeamModel>(() => ({
        title: chrome.title,
        crumb: chrome.title,
        meta: online.providerLabel,
        status,
        tabs: chrome.tabs,
        onSelectTab: chrome.onSelectTab,
        home: {
            tools,
            menuLabel: t('libraryBravaisHome.more'),
            scan: chrome.scan,
            search: chrome.search,
            account: accountSeam,
        },
    }), [accountSeam, chrome.onSelectTab, chrome.scan, chrome.search, chrome.tabs, chrome.title, online.providerLabel, status, t, tools]);
    const wallRules = useMemo(() => ({ filterKey: 'explore', loading: isOn && items.length === 0 && (!feed || feed.status === 'loading') }), [feed, isOn, items.length]);
    const home = useMemo(() => ({ cycleTab: chrome.cycleTab }), [chrome.cycleTab]);

    const layer = useMemo<BravaisLayer>(() => ({
        key: 'home:explore',
        sessionKey: 'home',
        surface: 'home',
        mode: 'infinite',
        items: isOn ? items : [],
        seam,
        isInteractive,
        focusedEntryKey: null,
        nowPlayingKey: null,
        queuedKeys: NO_KEYS,
        onOpenItem,
        onPlayItem,
        wall: wallRules,
        home,
    }), [home, isInteractive, isOn, items, onOpenItem, onPlayItem, seam, wallRules]);
    useBravaisLayerRegistration('home', layer);
    return null;
};

export default BravaisHomeExplore;
