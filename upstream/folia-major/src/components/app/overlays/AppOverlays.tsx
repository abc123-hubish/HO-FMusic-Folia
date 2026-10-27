import type { LibraryAccountController } from '../../../library/core/contracts/account';
import LoginHost from '../../login/LoginHost';
import React, { useRef } from 'react';
import FloatingPlayerControls from '../../FloatingPlayerControls';
import { createDeferredComponent } from '../../shared/createDeferredComponent';
import type { AppOverlaysModel } from './buildAppOverlaysModel';
import { countRender } from '../../../dev/renderCount';
import { useLatticeControlsStore } from '../../../stores/useLatticeControlsStore';
import { useSearchNavigationStore } from '../../../stores/useSearchNavigationStore';

const SearchWorkspace = createDeferredComponent(() => import('../search/SearchWorkspace'));
const DevDebugOverlay = createDeferredComponent(() => import('../../DevDebugOverlay'));
const MemoryMonitorWindow = createDeferredComponent(() => import('../../debug/MemoryMonitorWindow'));

// Centralized app-level overlay renderer so App.tsx does not mount leaf overlays directly.
type AppOverlaysProps = {
    model: AppOverlaysModel;
    account?: LibraryAccountController;
};

const AppOverlays: React.FC<AppOverlaysProps> = ({ model, account }) => {
    countRender('AppOverlays');
    const isCurrentSongPosterVisible = useLatticeControlsStore(state => state.isCurrentSongPosterVisible);
    const isSearchOpen = useSearchNavigationStore(state => state.isSearchOpen);
    const searchOpened = useRef(false);
    // Keep the workspace mounted after its first opening so close animations and cached UI still work.
    if (isSearchOpen) searchOpened.current = true;
    const {
        searchOverlay,
        debugOverlay,
        memoryMonitor,
        floatingControls,
    } = model;

    return (
        <>
            {account && <LoginHost account={account} />}
            {searchOverlay && searchOpened.current && <SearchWorkspace {...searchOverlay} deferredFeedbackVisible={isSearchOpen} />}

            {debugOverlay && <DevDebugOverlay {...debugOverlay} />}

            {memoryMonitor && <MemoryMonitorWindow {...memoryMonitor} />}

            {floatingControls
                && (floatingControls.currentView !== 'lattice' || !isCurrentSongPosterVisible)
                && <FloatingPlayerControls {...floatingControls} />}
        </>
    );
};

export default React.memo(AppOverlays);
