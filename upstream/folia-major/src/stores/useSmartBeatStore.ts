import { create } from 'zustand';
import type { SmartBeatMode, SmartBeatSettings } from '../types/smartBeat';
import type { SmartBeatStatus } from '../services/beatFx/smartBeatTypes';
import { resolveSmartBeatSettings, type SmartBeatPatch } from '../services/beatFx/smartBeatSettings';

// src/stores/useSmartBeatStore.ts
// Settings persist and join visual config exports; per-track diagnostics never persist.
const STORAGE = 'folia.smartBeat.v1';
const read = (): SmartBeatSettings => {
    try { return resolveSmartBeatSettings(JSON.parse(localStorage.getItem(STORAGE) || 'null')); }
    catch { return resolveSmartBeatSettings(null); }
};
export const useSmartBeatStore = create<{
    settings: SmartBeatSettings; available: boolean | null; status: SmartBeatStatus; note: string; events: number;
    engine: 'gpu' | 'cpu' | null; progress: number; retry: number; requestRetry: () => void;
    setSettings: (patch: SmartBeatPatch) => void;
    setMode: (mode: SmartBeatMode) => void;
    report: (status: SmartBeatStatus, note?: string, events?: number) => void;
}>(set => ({
    settings: read(), available: null, status: 'idle', note: '', events: 0,
    engine: null, progress: 0, retry: 0, requestRetry: () => set(state => ({ retry: state.retry + 1 })),
    setSettings: patch => set(state => {
        const settings = resolveSmartBeatSettings(patch, state.settings);
        try { localStorage.setItem(STORAGE, JSON.stringify(settings)); } catch { /* Keep this session's choice. */ }
        return { settings };
    }),
    setMode: mode => useSmartBeatStore.getState().setSettings({ mode }),
    report: (status, note = '', events = 0) => set({ status, note, events }),
}));
