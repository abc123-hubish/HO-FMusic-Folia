import { useNativeProviderLibrary } from './useNativeProviderLibrary';

// src/hooks/useBodianLibrary.ts
// Preserve the established entry while sharing the native-account lifecycle.
export const useBodianLibrary = () => useNativeProviderLibrary('bodian');
