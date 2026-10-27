import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { LocalSong, UnifiedSong } from '@/types';
import { appDatabase } from '@/services/appDatabase';
import { assignImportedSongs } from '@/services/localLibraryCatalogService';
import { buildLocalQueue } from '@/services/playbackAdapters';
import { backfillLocalSongCovers } from '@/services/localSongCoverMatchService';

// test/unit/services/localSongCoverMatchService.test.ts
// Checks real catalogue persistence and queue artwork with synthetic Omni responses.
const mocks = vi.hoisted(() => ({ search: vi.fn(), detail: vi.fn(), cache: vi.fn() }));
vi.mock('@/services/onlineMusic/omni', () => ({ omni: { searchProviderSongs: mocks.search, getSongDetail: mocks.detail } }));
vi.mock('@/services/onlineMusic/providerRegistry', () => ({ getOnlineMusicProvider: () => null }));
vi.mock('@/services/coverCache', () => ({ cacheLocalSongOnlineCover: mocks.cache, removeCachedCover: vi.fn() }));

let sequence = 0;
const song = (patch: Partial<LocalSong> = {}): LocalSong => ({
    id: `cover-test-${++sequence}`, fileName: '歌手 - 本地歌曲.flac', filePath: 'HarmonyOS/歌手 - 本地歌曲.flac',
    nativeFileUrl: 'https://folia.local/native/audio', title: '本地歌曲', titleOrigin: 'import',
    importedMetadata: { title: '本地歌曲', titleSource: 'embedded', artistNames: ['歌手'], albumName: '专辑' },
    duration: 180000, fileSize: 1, mimeType: 'audio/flac', addedAt: 1, ...patch,
});
const online = (patch: Partial<UnifiedSong> = {}): UnifiedSong => ({
    id: 123, name: '本地歌曲', artists: [{ id: 2, name: '歌手' }],
    album: { id: 3, name: '专辑', coverUrl: 'http://p1.music.126.net/cover.jpg' }, durationMs: 180000,
    sourceRef: { kind: 'online', providerId: 'netease', mediaId: '123' }, ...patch,
});
const page = (items: UnifiedSong[]) => ({ items, hasMore: false, nextOffset: items.length });

describe('local song cover backfill', () => {
    beforeEach(async () => {
        vi.resetAllMocks();
        await appDatabase.open();
        mocks.search.mockResolvedValue(page([online()]));
        mocks.cache.mockResolvedValue(true);
    });
    afterEach(async () => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
        await appDatabase.delete();
    });

    it('persists a NetEase cover visible in queues while preserving imported tags, assignments and lyrics', async () => {
        const local = song({ hasLocalLyrics: true, localLyricsContent: '[00:01]本地歌词', lyricsSource: 'local' });
        await assignImportedSongs([local]);
        const assignment = await appDatabase.local_library_assignments.get(local.id);
        const updated = vi.fn().mockResolvedValue(undefined);
        await backfillLocalSongCovers([local], updated);
        const stored = (await appDatabase.local_music.get(local.id))!;
        expect(mocks.search).toHaveBeenCalledWith('netease', '本地歌曲', { limit: 10, offset: 0 });
        expect(mocks.cache).toHaveBeenCalledWith(local.id, 'https://p1.music.126.net/cover.jpg');
        expect(stored).toMatchObject({ title: local.title, titleOrigin: 'import', importedMetadata: local.importedMetadata,
            localLyricsContent: local.localLyricsContent, lyricsSource: 'local', nativeFileUrl: local.nativeFileUrl,
            useOnlineCover: true, onlineMetadata: { source: 'netease', songId: 123, matchMode: 'auto' } });
        expect(await appDatabase.local_library_assignments.get(local.id)).toEqual(assignment);
        expect(buildLocalQueue([stored])[0].album?.coverUrl).toBe('https://p1.music.126.net/cover.jpg');
        expect(updated).toHaveBeenCalledOnce();
        expect(mocks.detail).not.toHaveBeenCalled();
        await backfillLocalSongCovers([stored]);
        expect(mocks.search).toHaveBeenCalledOnce();
    });

    it('refreshes a stale Web subscriber after an earlier match completed without issuing another search', async () => {
        const local = song();
        await assignImportedSongs([local]);
        await backfillLocalSongCovers([local]);
        const updated = vi.fn().mockResolvedValue(undefined);
        await backfillLocalSongCovers([local], updated);
        expect(updated).toHaveBeenCalledWith(local.id);
        expect(mocks.search).toHaveBeenCalledOnce();
    });

    it('retries when a later import scan overwrites a successfully matched record', async () => {
        const local = song();
        await assignImportedSongs([local]);
        await backfillLocalSongCovers([local]);
        await appDatabase.local_music.put(local);
        await backfillLocalSongCovers([local]);
        expect(mocks.search).toHaveBeenCalledTimes(2);
        expect((await appDatabase.local_music.get(local.id))?.useOnlineCover).toBe(true);
    });

    it('preserves embedded, folder and chosen covers, manual matches and automatic-match opt-outs', async () => {
        vi.stubGlobal('window', { electron: { hasLocalCoverAsset: vi.fn() } });
        const selected = { source: 'netease' as const, artists: [], matchMode: 'manual' as const, matchedAt: 1 };
        const songs = [song({ localCoverAssetId: `sha256:${'a'.repeat(64)}`, localCoverSource: 'embedded' }),
            song({ localCoverAssetId: `sha256:${'b'.repeat(64)}`, localCoverSource: 'folder' }), song({ noAutoMatch: true }),
            song({ useOnlineCover: false, hasManualLyricSelection: true }), song({ onlineMetadata: selected }),
            song({ useOnlineCover: true, onlineMetadata: { ...selected, matchMode: 'auto', coverUrl: 'https://cover.test/existing' } })];
        await backfillLocalSongCovers(songs);
        expect(mocks.search).not.toHaveBeenCalled();
        expect(mocks.cache).not.toHaveBeenCalled();
    });

    it('fetches song detail when search omits artwork', async () => {
        const local = song();
        await assignImportedSongs([local]);
        mocks.search.mockResolvedValue(page([online({ album: { id: 3, name: '专辑' } })]));
        mocks.detail.mockResolvedValue(online());
        await backfillLocalSongCovers([local]);
        expect(mocks.detail).toHaveBeenCalledWith('netease', 123);
        expect((await appDatabase.local_music.get(local.id))?.useOnlineCover).toBe(true);
    });

    it('matches the displayed song title even when artist and recording length differ', async () => {
        const local = song({ duration: 391000 });
        await assignImportedSongs([local]);
        mocks.search.mockResolvedValue(page([online({ artists: [{ id: 5, name: '另一位' }], durationMs: 180000 })]));
        await backfillLocalSongCovers([local]);
        expect(mocks.search).toHaveBeenCalledWith('netease', '本地歌曲', { limit: 10, offset: 0 });
        expect(mocks.cache).toHaveBeenCalledOnce();
        expect((await appDatabase.local_music.get(local.id))?.title).toBe('本地歌曲');
    });

    it('does not attach a cover for an unrelated song title', async () => {
        const local = song();
        await assignImportedSongs([local]);
        mocks.search.mockResolvedValue(page([online({ name: '完全不同' })]));
        await backfillLocalSongCovers([local]);
        await backfillLocalSongCovers([local]);
        expect(mocks.cache).not.toHaveBeenCalled();
        expect(mocks.search).toHaveBeenCalledTimes(2);
        expect((await appDatabase.local_music.get(local.id))?.useOnlineCover).toBeUndefined();
    });

    it('repairs Hotel California imported by older versions with an automatically disabled cover', async () => {
        const local = song({ fileName: 'Eagles - Hotel California.flac', title: 'Hotel California',
            importedMetadata: { title: 'Hotel California', titleSource: 'embedded', artistNames: ['Eagles'] },
            duration: 391000, useOnlineCover: false, noAutoMatch: false });
        await assignImportedSongs([local]);
        mocks.search.mockResolvedValue(page([online({ name: 'Hotel California', artists: [{ id: 1, name: 'Eagles' }], durationMs: 391000 })]));
        await backfillLocalSongCovers([local]);
        expect(mocks.search).toHaveBeenCalledWith('netease', 'Hotel California', { limit: 10, offset: 0 });
        expect((await appDatabase.local_music.get(local.id))?.useOnlineCover).toBe(true);
    });

    it('does not apply late results after a manual choice or deletion', async () => {
        const edited = song(), deleted = song();
        await assignImportedSongs([edited, deleted]);
        mocks.search.mockImplementation(async () => {
            await appDatabase.local_music.update(edited.id, { useOnlineCover: false });
            await appDatabase.local_music.delete(deleted.id);
            return page([online()]);
        });
        await backfillLocalSongCovers([edited, deleted]);
        expect(mocks.cache).not.toHaveBeenCalled();
        expect((await appDatabase.local_music.get(edited.id))?.useOnlineCover).toBe(false);
        expect(await appDatabase.local_music.get(deleted.id)).toBeUndefined();
    });

    it('shares overlapping requests and limits a batch to two searches', async () => {
        const songs = [song(), song(), song(), song()];
        await assignImportedSongs(songs);
        let active = 0, maximum = 0;
        mocks.search.mockImplementation(async () => {
            active += 1; maximum = Math.max(maximum, active);
            await new Promise(resolve => setTimeout(resolve, 5));
            active -= 1;
            return page([online()]);
        });
        await Promise.all([backfillLocalSongCovers(songs), backfillLocalSongCovers(songs)]);
        expect(mocks.search).toHaveBeenCalledTimes(4);
        expect(maximum).toBe(2);
    });

    it('leaves failed requests retryable and retains the imported audio', async () => {
        const local = song();
        await assignImportedSongs([local]);
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        mocks.search.mockRejectedValueOnce(new Error('offline'));
        await backfillLocalSongCovers([local]);
        expect((await appDatabase.local_music.get(local.id))?.nativeFileUrl).toBe(local.nativeFileUrl);
        await backfillLocalSongCovers([local]);
        expect(mocks.search).toHaveBeenCalledTimes(2);
        expect((await appDatabase.local_music.get(local.id))?.useOnlineCover).toBe(true);
    });
});
