import { useSyncExternalStore } from 'react';
import { isAppVisible, subscribeAppVisibility } from '../services/appVisibility';

// src/hooks/useAppVisibility.ts
// Discrete native visibility changes only; playback time never enters this subscription.
export const useAppVisibility = () => useSyncExternalStore(subscribeAppVisibility, isAppVisible, () => true);
