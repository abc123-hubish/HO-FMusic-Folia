import { useCallback, useEffect, useRef } from 'react';
import { omni } from '../services/onlineMusic/omni';
import { clearProviderAccountSnapshot, loadProviderAccountSnapshot, saveProviderAccountSnapshot } from '../services/onlineMusic/providerAccountCache';
import { useOnlineProviderAccountStore } from '../stores/useOnlineProviderAccountStore';
import { OnlineProviderError } from '../types/onlineMusic';
import type { MediaId, ProviderCollection, OnlineProviderId } from '../types/onlineMusic';

// src/hooks/useNativeProviderLibrary.ts
// Shared account lifecycle for providers whose native host owns the credentials.

export const useNativeProviderLibrary = (providerId: OnlineProviderId) => {
    const generation = useRef(0);
    const pendingSave = useRef<Promise<unknown>>(Promise.resolve());
    const refresh = useCallback(async () => {
        const current = ++generation.current;
        const store = useOnlineProviderAccountStore.getState();
        try {
            if (!omni.getProviderAvailability(providerId).configured || !omni.getProviderCapabilities(providerId).auth) {
                store.clearAccount(providerId);
                await pendingSave.current.catch(() => {});
                await clearProviderAccountSnapshot(providerId);
                return false;
            }
            store.updateAccount(providerId, { freshness: 'refreshing', error: undefined });
            const user = await omni.getLoginStatus(providerId);
            if (generation.current !== current) return false;
            if (!user) {
                store.clearAccount(providerId);
                await pendingSave.current.catch(() => {});
                await clearProviderAccountSnapshot(providerId);
                return false;
            }
            // Restore public metadata only after the main-process session identifies the same account.
            const visibleUser = useOnlineProviderAccountStore.getState().accounts[providerId]?.user;
            if (!visibleUser || String(visibleUser.id) !== String(user.id)) {
                store.clearAccount(providerId);
                const snapshot = await loadProviderAccountSnapshot(providerId).catch(() => null);
                if (generation.current !== current) return false;
                const matching = snapshot && String(snapshot.user.id) === String(user.id) ? snapshot : null;
                store.updateAccount(providerId, { status: 'authenticated', user,
                    collections: matching?.collections || [], likedSongIds: matching?.likedSongIds || [],
                    hydration: 'ready', freshness: 'refreshing', lastUpdatedAt: matching?.savedAt, error: undefined });
            }
            const likesBeforeRefresh = useOnlineProviderAccountStore.getState().accounts[providerId].likedSongIds;
            const collections: ProviderCollection[] = [];
            const capabilities = omni.getProviderCapabilities(providerId);
            let offset = 0;
            if (capabilities.userLibrary) {
                while (true) {
                    const page = await omni.getProviderUserPlaylists(providerId, user.id, { offset, limit: 50 });
                    if (generation.current !== current) return false;
                    collections.push(...page.items);
                    if (!page.hasMore || page.nextOffset <= offset) break;
                    offset = page.nextOffset;
                }
            }
            const fetchedLikedSongIds: MediaId[] = capabilities.likes ? await omni.getProviderLikedSongIds(providerId, user.id) : [];
            if (generation.current !== current) return false;
            const save = pendingSave.current.catch(() => {}).then(() => {
                if (generation.current !== current) return null;
                // Omni replaces this array after each like mutation; keep those newer changes.
                const latestLikes = useOnlineProviderAccountStore.getState().accounts[providerId].likedSongIds;
                const likedSongIds = latestLikes === likesBeforeRefresh ? fetchedLikedSongIds : latestLikes;
                // Commit before saving so a mutation during persistence cannot be overwritten afterward.
                store.updateAccount(providerId, { status: 'authenticated', user, collections, likedSongIds,
                    hydration: 'ready', error: undefined });
                return saveProviderAccountSnapshot(providerId, { user, collections, likedSongIds });
            });
            pendingSave.current = save;
            const saved = await save;
            if (generation.current !== current) return false;
            if (!saved) return false;
            store.updateAccount(providerId, { freshness: 'fresh', lastUpdatedAt: saved.savedAt });
            return true;
        } catch (error) {
            if (generation.current !== current) return false;
            if (error instanceof OnlineProviderError && error.code === 'auth-required') {
                store.clearAccount(providerId, 'auth-required');
                await pendingSave.current.catch(() => {});
                await clearProviderAccountSnapshot(providerId);
            } else store.updateAccount(providerId, { hydration: 'ready', freshness: 'error',
                status: useOnlineProviderAccountStore.getState().accounts[providerId]?.user ? 'authenticated' : 'error', error: `${providerId}-refresh-failed` });
            return false;
        }
    }, [providerId]);
    const logout = useCallback(async () => {
        generation.current++;
        useOnlineProviderAccountStore.getState().clearAccount(providerId);
        await pendingSave.current.catch(() => {});
        await Promise.all([omni.logout(providerId), clearProviderAccountSnapshot(providerId)]);
    }, [providerId]);
    useEffect(() => {
        // Check the native session before displaying cached account metadata.
        useOnlineProviderAccountStore.getState().clearAccount(providerId);
        void refresh();
        return () => { generation.current++; };
    }, [refresh]);
    return { refresh, logout };
};
