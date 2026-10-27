import { useCallback, useEffect, useRef, useState } from 'react';
import type { OnlineProviderId } from '../../types/onlineMusic';
import type { LibraryAccountController, LibraryAccountSnapshot } from '../../library/core/contracts/account';
import { useLibraryAccountSelector, type LibraryLoginView } from '../../library/core/bindings/useLibraryAccount';
import { useKitReducedMotion } from '../modal/settings/kit/motion';
import { closeLoginWindow, setLoginLanding } from './loginWindowStore';

// src/components/login/useLoginSuccess.ts
// Bind only this window's QR attempt to the controller's completion; restored accounts never animate.
const selectCompletion = (snapshot: LibraryAccountSnapshot) => snapshot.lastLoginCompletion;
type Attempt = { requestId: number; providerId: OnlineProviderId; sessionId: number };

export const useLoginSuccess = (account: LibraryAccountController, {
    isOpen, requestId, selected, login,
}: { isOpen: boolean; requestId: number; selected: OnlineProviderId | null; login: LibraryLoginView | null }) => {
    const completion = useLibraryAccountSelector(account, selectCompletion);
    const still = useKitReducedMotion();
    const seen = useRef(completion);
    const attempt = useRef<Attempt | null>(null);
    const held = useRef<LibraryLoginView | null>(null);
    const [success, setSuccess] = useState<Attempt | null>(null);
    if (isOpen && login && login.session.providerId === selected) {
        attempt.current = { requestId, providerId: selected, sessionId: login.session.id };
        held.current = login;
    }
    const current = success?.requestId === requestId && success.providerId === selected ? success : null;
    const done = Boolean(current) && !still;

    useEffect(() => {
        if (completion === seen.current) return;
        seen.current = completion;
        const own = attempt.current;
        if (!isOpen || !completion || !own || own.requestId !== requestId || own.providerId !== selected
            || completion.providerId !== selected || completion.sessionId !== own.sessionId
            || completion.outcome === 'refresh-failed') return;
        if (still) closeLoginWindow();
        else setSuccess(own);
    }, [completion, isOpen, requestId, selected, still]);

    // Turning motion off during the finale must also finish it: there will be no rAF to close it.
    useEffect(() => {
        if (!current || !still) return;
        setSuccess(null);
        closeLoginWindow();
    }, [current, still]);

    const landing = !still && (done || (isOpen && login?.session.providerId === selected
        && login.session.phase === 'confirmed')) ? selected : null;
    useEffect(() => {
        setLoginLanding(landing);
        return () => setLoginLanding(null);
    }, [landing]);

    const finish = useCallback(() => {
        attempt.current = null;
        held.current = null;
        setSuccess(null);
    }, []);
    return { done, finish, shownLogin: login ?? (done ? held.current : null) };
};
