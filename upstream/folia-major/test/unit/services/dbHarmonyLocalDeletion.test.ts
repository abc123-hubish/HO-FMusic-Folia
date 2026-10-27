import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { appDatabase } from '@/services/appDatabase';
import { deleteLocalSong, deleteLocalSongs, getLocalSongs, saveLocalSongs } from '@/services/db';
import type { LocalSong } from '@/types';

// test/unit/services/dbHarmonyLocalDeletion.test.ts
// Native startup restores its file manifest, so library deletion must update both stores.

const song = (id: string): LocalSong => ({
    id, fileName: `${id}.mp3`, filePath: `HarmonyOS/${id}.mp3`,
    title: id, titleOrigin: 'import',
    importedMetadata: { title: id, titleSource: 'filename', artistNames: [] },
    duration: 10, fileSize: 12, mimeType: 'audio/mpeg', addedAt: 1,
});

describe('HarmonyOS local library deletion', () => {
    beforeEach(async () => {
        await appDatabase.delete();
        await appDatabase.open();
        await saveLocalSongs([song('a'), song('b'), song('c')]);
    });

    afterEach(async () => {
        vi.unstubAllGlobals();
        await appDatabase.delete();
    });

    it.each(['single', 'batch'] as const)('removes only selected songs from the database and native manifest (%s)', async mode => {
        let nativeIds = ['a', 'b', 'c'];
        const removeFiles = vi.fn((payload: string) => {
            const removed: string[] = JSON.parse(payload);
            nativeIds = nativeIds.filter(id => !removed.includes(id));
        });
        vi.stubGlobal('window', { FoliaNative: { removeFiles } });

        if (mode === 'single') await deleteLocalSong('a');
        else await deleteLocalSongs(['a', 'b']);

        const expected = mode === 'single' ? ['b', 'c'] : ['c'];
        expect((await getLocalSongs()).map(item => item.id).sort()).toEqual(expected);
        expect(nativeIds).toEqual(expected);
        expect(removeFiles).toHaveBeenCalledTimes(1);
    });

    it('continues to support browser imports without a native bridge', async () => {
        await deleteLocalSongs(['a']);
        expect((await getLocalSongs()).map(item => item.id).sort()).toEqual(['b', 'c']);
    });
});
