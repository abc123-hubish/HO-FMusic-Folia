import { describe, expect, it } from 'vitest';
import { noteAudioSourceMetadata, isPreviewAudioSource, previewClipStartMsOfAudioSource, audioSourceMetadataVersion } from '@/services/onlineMusic/audioSourceMetadata';
import { resolveLyricSeekMediaTime } from '@/utils/lyrics/lyricSeekTime';

// test/unit/playback/audioSourceMetadata.test.ts
describe('preview media and lyric clocks', () => {
    it('uses URL-specific origins and invalidates reused URLs', () => {
        const url = 'https://audio.test/clock.mp3';
        const version = audioSourceMetadataVersion();
        noteAudioSourceMetadata({ url, preview: true, clipStartMs: 76026, quality: 'standard', fetchedAt: 0 });
        expect(isPreviewAudioSource(url)).toBe(true);
        expect(previewClipStartMsOfAudioSource(url)).toBe(76026);
        expect(previewClipStartMsOfAudioSource('https://audio.test/other.mp3')).toBe(0);
        noteAudioSourceMetadata({ url, quality: 'high', fetchedAt: 1 });
        expect(isPreviewAudioSource(url)).toBe(false);
        expect(previewClipStartMsOfAudioSource(url)).toBe(0);
        expect(audioSourceMetadataVersion()).toBeGreaterThan(version);
    });
    it('seeks from the full-song lyric timeline into the preview, without accidentally ending it', () => {
        const clock = { mediaTimeSec: 5, lyricTimeSec: 80.526, durationSec: 30.838 }; // 76.026 origin, 0.5 manual offset
        expect(resolveLyricSeekMediaTime(85.526, clock)).toBeCloseTo(10);
        expect(resolveLyricSeekMediaTime(20, clock)).toBe(0);
        expect(resolveLyricSeekMediaTime(120, clock)).toBeNull();
    });
    it('bounds retained URLs and ignores invalid clip offsets', () => {
        const source = { url: 'https://audio.test/old.mp3', preview: true, clipStartMs: NaN, quality: 'standard' as const, fetchedAt: 0 };
        noteAudioSourceMetadata(source);
        expect(previewClipStartMsOfAudioSource(source.url)).toBe(0);
        for (let i = 0; i < 201; i++) noteAudioSourceMetadata({ ...source, url: `https://audio.test/${i}.mp3` });
        expect(isPreviewAudioSource(source.url)).toBe(false);
    });
});
