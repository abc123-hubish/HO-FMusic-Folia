import { create } from 'zustand';
import type { OnlineProviderId } from '../../types/onlineMusic';

// src/components/login/loginWindowStore.ts
// Shared entry intent; account requests and cancellation remain owned by the account controller.
export const useLoginWindowStore = create<{
    isOpen: boolean;
    providerId: OnlineProviderId | null;
    requestId: number;
    landingProviderId: OnlineProviderId | null;
}>(() => ({ isOpen: false, providerId: null, requestId: 0, landingProviderId: null }));

export const openLoginWindow = (providerId: OnlineProviderId | null = null) => {
    useLoginWindowStore.setState(state => ({ isOpen: true, providerId, requestId: state.requestId + 1 }));
};

export const closeLoginWindow = () => useLoginWindowStore.setState({ isOpen: false });
export const setLoginLanding = (landingProviderId: OnlineProviderId | null) => useLoginWindowStore.setState({ landingProviderId });

export type LoginOrigin = { x: number; y: number; size: number; providerId: OnlineProviderId | null };
