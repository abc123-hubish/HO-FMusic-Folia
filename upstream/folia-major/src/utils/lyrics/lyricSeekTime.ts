// src/utils/lyrics/lyricSeekTime.ts
// Convert the full-song lyric clock back to the loaded clip's own media position.
export type LyricSeekClock = { mediaTimeSec: number; lyricTimeSec: number; durationSec: number };
export function resolveLyricSeekMediaTime(lyricTimeSec: number, clock: LyricSeekClock): number | null {
    const target = lyricTimeSec - (clock.lyricTimeSec - clock.mediaTimeSec);
    if (!Number.isFinite(target) || (Number.isFinite(clock.durationSec) && clock.durationSec > 0 && target >= clock.durationSec)) return null;
    return Math.max(0, target);
}
