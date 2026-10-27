import { useCallback, useMemo, useRef } from 'react';
import type React from 'react';
import { omni } from '../services/onlineMusic/omni';
import {
    getPersonalFmSelectionLabel,
    isSamePersonalFmSelection,
    toPersonalFmRequestOptions,
    type PersonalFmSelection,
} from '../services/onlineMusic/fmModes';
import { usePersonalFmModeStore, selectProviderPersonalFm } from '../stores/usePersonalFmModeStore';
import { usePersonalFmCatalog } from './usePersonalFmCatalog';
import { useOnlineProviderAccountStore } from '../stores/useOnlineProviderAccountStore';
import { usePlaybackStore } from '../stores/usePlaybackStore';
import { getPlaybackSourceRef } from '../utils/appPlaybackGuards';
import type { SongResult, StatusMessage } from '../types';
import { setStatusMessage as setStatusMsg } from '../stores/useStatusMessageStore';

// src/hooks/usePersonalFmModeController.ts
// Owns "apply a Personal FM mode": persist it, and when FM is on air jump straight to the first
// track of the new mode, the way the official client does — the mode change is meant to be heard.

type UsePersonalFmModeControllerParams = {
    isFmMode: boolean;
    currentSong: SongResult | null;
    playSong: (song: SongResult, queue?: SongResult[], isFmCall?: boolean) => void | Promise<void>;
    t: (key: string, fallback?: string) => string;
};

export function usePersonalFmModeController({
    isFmMode,
    currentSong,
    playSong,
    t,
}: UsePersonalFmModeControllerParams) {
    const activeProviderId = useOnlineProviderAccountStore(state => state.activeProviderId);
    const catalog = usePersonalFmCatalog(activeProviderId);
    const personalFmSelection = usePersonalFmModeStore(state => selectProviderPersonalFm(state, activeProviderId));
    const setSelection = usePersonalFmModeStore(state => state.setProviderSelection);
    const request = useRef(0);
    const beforePending = useRef<{ providerId: string; selection: PersonalFmSelection } | null>(null);

    const isPersonalFmModeSupported = useMemo(() => {
        try {
            return Boolean(catalog && omni.getProviderCapabilities(activeProviderId).personalFmModes);
        } catch (error) {
            void error;
            return false;
        }
    }, [activeProviderId, catalog]);

    const setPersonalFmSelection = useCallback(async (selection: PersonalFmSelection) => {
        const previous = beforePending.current?.providerId === activeProviderId ? beforePending.current.selection : personalFmSelection;
        beforePending.current = null;
        const applied = setSelection(activeProviderId, selection);
        const label = getPersonalFmSelectionLabel(applied, t, catalog);
        const mine = ++request.current;
        const source = currentSong ? getPlaybackSourceRef(currentSong) : null;

        if (!isFmMode || !currentSong || source?.kind !== 'online' || source.providerId !== activeProviderId) {
            // Cutting off an album or playlist the user chose deliberately would be worse than
            // waiting: the mode takes effect the next time Personal FM starts.
            setStatusMsg({ type: 'info', text: `${t('personalFmMode.statusPending', 'Personal FM mode')}: ${label}` });
            return;
        }

        if (isSamePersonalFmSelection(applied, previous)) {
            return;
        }

        beforePending.current = { providerId: activeProviderId, selection: previous };
        const stillCurrent = () => mine === request.current
            && useOnlineProviderAccountStore.getState().activeProviderId === activeProviderId
            && usePlaybackStore.getState().isFmMode;
        const settle = () => { if (mine === request.current) beforePending.current = null; };
        const putBack = () => {
            if (isSamePersonalFmSelection(selectProviderPersonalFm(usePersonalFmModeStore.getState(), activeProviderId), applied)) {
                setSelection(activeProviderId, previous);
            }
        };

        try {
            const songs = await omni.getProviderPersonalFm(activeProviderId, toPersonalFmRequestOptions(applied));
            settle();
            if (!stillCurrent()) return;
            if (songs.length === 0) {
                putBack();
                setStatusMsg({ type: 'error', text: t('personalFmMode.statusEmpty', 'This Personal FM mode returned nothing') });
                return;
            }

            // Announced before handing over, because playSong clears any non-persistent status of
            // its own as it starts.
            setStatusMsg({ type: 'info', text: `${t('personalFmMode.statusApplied', 'Personal FM switched to')} ${label}` });
            // The whole queue is replaced and playback jumps to the head: a new mode means a new
            // stream, so keeping the old one's leftovers around would only muddy it.
            await playSong(songs[0], songs, true);
        } catch (error) {
            settle();
            if (!stillCurrent()) return;
            putBack();
            console.error('[PersonalFm] Failed to refresh queue for mode', error);
            setStatusMsg({ type: 'error', text: t('personalFmMode.statusFailed', 'Failed to switch the Personal FM mode') });
        }
    }, [activeProviderId, catalog, currentSong, isFmMode, personalFmSelection, playSong, setSelection, setStatusMsg, t]);

    const personalFmSelectionLabel = useMemo(
        () => getPersonalFmSelectionLabel(personalFmSelection, t, catalog),
        [catalog, personalFmSelection, t],
    );

    return { personalFmSelection, personalFmSelectionLabel, isPersonalFmModeSupported, setPersonalFmSelection };
}
