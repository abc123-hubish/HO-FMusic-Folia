import { describe, expect, it, vi } from 'vitest';
import { getSongNativeLyricProviderSource, getLyricProviderLabel } from '@/utils/lyrics/lyricSourceLabels';

vi.mock('@/i18n/config', () => ({ default: { t: (key: string) => key } }));

// test/unit/lyrics/lyricSourceLabels.test.ts

describe('getSongNativeLyricProviderSource', () => {
    it('labels Qishui native lyrics without falling back to NetEase', () => {
        const source = getSongNativeLyricProviderSource({ sourceRef: { kind: 'online', providerId: 'qishui', mediaId: '123' } });
        expect(source).toBe('qishui');
        expect(getLyricProviderLabel(source)).toBe('lyricProvider.qishui');
        expect(getLyricProviderLabel('netease')).toBe('lyricProvider.netease');
    });
    it('uses the online playback provider as the native lyric source', () => {
        expect(getSongNativeLyricProviderSource({
            sourceRef: { kind: 'online', providerId: 'kugou', mediaId: 'HASH' },
        })).toBe('kugou');
        expect(getSongNativeLyricProviderSource({
            sourceRef: { kind: 'online', providerId: 'netease', mediaId: '1' },
        })).toBe('netease');
    });

    it('does not invent a lyric source for unrelated playback providers', () => {
        expect(getSongNativeLyricProviderSource({
            sourceRef: { kind: 'online', providerId: 'future-provider', mediaId: '1' },
        })).toBeUndefined();
    });
});
