// src/types/smartBeat.ts
// Shareable visual settings; analysis results and device diagnostics are stored separately.
export type SmartBeatMode = 'off' | 'cached' | 'on';
export type BeatEffectSetting = { on: boolean; strength: number };
export type SmartBeatSettings = { mode: SmartBeatMode; effects: Record<string, BeatEffectSetting> };
export const DEFAULT_SMART_BEAT_SETTINGS: SmartBeatSettings = { mode: 'off', effects: {} };
