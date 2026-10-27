import type { BeatGrid } from '../analysis/beatThis';
import type { BeatAccents } from '../analysis/beatAccents';

// src/services/beatFx/smartBeatTypes.ts
export type BeatFxSourceKind = 'beat_this' | 'cpu' | 'none';
export type SmartBeatResult = BeatGrid & { accents: BeatAccents; duration: number; model: string; schema: 1 };
export type SmartBeatStatus = 'idle' | 'reading' | 'analysing' | 'ready' | 'cached' | 'unsupported' | 'unavailable' | 'error';
