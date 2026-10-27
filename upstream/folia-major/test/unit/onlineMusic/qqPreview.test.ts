import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OnlineProviderError } from '@/types/onlineMusic';
const { request, session } = vi.hoisted(() => ({ request: vi.fn(), session: { value: true } }));
vi.mock('@/services/onlineMusic/qqTransport', () => ({ requestQq: request, hasQqSession: () => session.value }));
import { requestQqPreviewSource } from '@/services/onlineMusic/qqPreview';

// test/unit/onlineMusic/qqPreview.test.ts
describe('QQ preview source', () => {
    beforeEach(() => { request.mockReset(); });
    const answer = (entry: object) => ({ data: { playUrl: { mid: entry } } });
    it('keeps an explicitly supplied clip origin without extra detail requests', async () => {
        request.mockResolvedValue(answer({ url: 'https://audio.test/preview.mp3', preview: true, clipStartMs: 76026 }));
        expect(await requestQqPreviewSource('mid', 'media')).toMatchObject({ preview: true, clipStartMs: 76026 });
        expect(request).toHaveBeenCalledTimes(1);
    });
    it('recovers millisecond try_begin from old remote API song detail', async () => {
        request.mockResolvedValueOnce(answer({ url: 'https://audio.test/preview.mp3', preview: true }))
            .mockResolvedValueOnce({ response: { songinfo: { data: { track_info: { file: { try_begin: 76026, try_end: 106864 } } } } } });
        expect(await requestQqPreviewSource('mid', '')).toMatchObject({ preview: true, clipStartMs: 76026 });
        expect(request).toHaveBeenLastCalledWith('song_info', { songmid: 'mid' });
    });
    it('does not relabel a legacy backend full source as a preview', async () => {
        request.mockResolvedValue(answer({ url: 'https://audio.test/full.mp3' }));
        expect(await requestQqPreviewSource('mid', '')).not.toHaveProperty('preview');
    });
    it('keeps network failures retryable and treats unsupported old routes as no preview', async () => {
        const error = new OnlineProviderError('network', 'reset', 'qq');
        request.mockRejectedValueOnce(error);
        await expect(requestQqPreviewSource('mid', '')).rejects.toBe(error);
        request.mockRejectedValueOnce(new OnlineProviderError('unsupported', 'old backend', 'qq'));
        expect(await requestQqPreviewSource('mid', '')).toBeNull();
    });
});
