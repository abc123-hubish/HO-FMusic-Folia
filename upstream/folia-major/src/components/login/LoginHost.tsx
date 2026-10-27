import { useExclusiveKeyLayer } from '../../hooks/useExclusiveKeyLayer';
import React, { useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { LibraryAccountController } from '../../library/core/contracts/account';
import { useLibraryAccountLogin, useLibraryAccountPendingSwitch, useLibraryAccountProviders, useLibraryAccountSelector } from '../../library/core/bindings/useLibraryAccount';
import { useThemeSettingsStore } from '../../stores/useThemeSettingsStore';
import ConfirmDialog from '../shared/ConfirmDialog';
import { LoginWindow } from './LoginWindow';
import { closeLoginWindow, openLoginWindow, useLoginWindowStore } from './loginWindowStore';
import type { OnlineProviderId } from '../../types/onlineMusic';
import { useLoginSuccess } from './useLoginSuccess';

// src/components/login/LoginHost.tsx
// Mount once above home/playback. Existing controller decisions and switch confirmation stay intact.
export default function LoginHost({ account }: { account: LibraryAccountController }) {
    const isOpen = useLoginWindowStore(state => state.isOpen);
    const selected = useLoginWindowStore(state => state.providerId);
    const requestId = useLoginWindowStore(state => state.requestId);
    const isDaylight = useThemeSettingsStore(state => state.isDaylight);
    const { providers, activeProviderId } = useLibraryAccountProviders(account);
    const login = useLibraryAccountLogin(account);
    const success = useLoginSuccess(account, { isOpen, requestId, selected, login });
    const pending = useLibraryAccountPendingSwitch(account);
    // Subscribe to logout progress too, so a completed sign-out immediately updates the account view.
    useLibraryAccountSelector(account, snapshot => snapshot.logout);
    const handled = useRef(-1);
    const confirmRoot = useRef<HTMLDivElement>(null);
    useExclusiveKeyLayer({ isActive: Boolean(pending), containerRef: confirmRoot, onKey: key => {
        if (!pending) return false;
        if (key === 'Escape') { account.cancelSwitch(pending.request.id); return true; }
        if (key === 'Enter') { void account.confirmSwitch(pending.request.id); return true; }
        return false;
    } });
    const visibleProviders = providers.filter(row => row.availability.reason !== 'runtime-unavailable');
    const close = useCallback(() => {
        success.finish();
        account.closeLogin();
        const request = account.getSnapshot().pendingSwitch;
        if (request) account.cancelSwitch(request.id);
        closeLoginWindow();
    }, [account, success.finish]);

    useEffect(() => {
        if (!isOpen || handled.current === requestId) return;
        const id = selected ?? activeProviderId;
        const row = providers.find(provider => provider.providerId === id);
        if (!row) return;
        handled.current = requestId;
        useLoginWindowStore.setState({ providerId: id });
        const existing = account.getSnapshot().login;
        if (existing?.providerId === id) return;
        account.closeLogin();
        if (row.availability.configured && row.requiresAccount !== false && row.status !== 'authenticated') {
            void account.startLogin(id);
        }
    }, [account, activeProviderId, isOpen, providers, requestId, selected]);

    // Older home connect buttons still call selectProvider; present that very session in this window.
    useEffect(() => {
        if (login && !useLoginWindowStore.getState().isOpen) openLoginWindow(login.session.providerId);
    }, [login]);
    const select = (id: OnlineProviderId) => {
        const row = providers.find(provider => provider.providerId === id);
        if (id !== selected || (!login && row?.status !== 'authenticated' && row?.requiresAccount !== false)) openLoginWindow(id);
    };
    return <>
        {(isOpen || success.done) && <LoginWindow isOpen={isOpen} done={success.done} onDoneLeave={closeLoginWindow} onDoneEnd={success.finish}
            providers={visibleProviders} selected={selected} activeProviderId={activeProviderId}
            login={success.shownLogin} account={account} isDaylight={isDaylight} onSelect={select} onClose={close} blocked={Boolean(pending)} />}
        {pending && createPortal(<div ref={confirmRoot} data-folia-keyboard-window><ConfirmDialog isOpen isDaylight={isDaylight} title={pending.title} description={pending.description}
            onConfirm={() => void account.confirmSwitch(pending.request.id)}
            onClose={() => void account.cancelSwitch(pending.request.id)} /></div>, document.body)}
    </>;
}
