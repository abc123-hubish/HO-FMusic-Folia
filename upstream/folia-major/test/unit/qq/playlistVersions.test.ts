import { describe, expect, it } from 'vitest';
import { normalizeQqCollection } from '@/services/onlineMusic/qqNormalize';

// test/unit/qq/playlistVersions.test.ts
// Cache hydration must not multiply already-normalized timestamps or trust drifting empty likes.
const owned = { tid: 7, dirId: 201, dirName: 'Liked', songNum: 3 };
describe('QQ playlist version normalization', () => {
    it('preserves milliseconds when a cached account is hydrated again', () => {
        const collection = normalizeQqCollection({ ...owned, updateTime: 1792948021 });
        expect(collection.updatedAt).toBe(1792948021000);
        expect(normalizeQqCollection(collection)).toEqual(collection);
        expect(normalizeQqCollection({ ...owned, updatedAt: 1792948021000, updateTime: 1 }).updatedAt)
            .toBe(1792948021000);
        expect(normalizeQqCollection({ tid: 8, dirId: 1, dirName: 'Empty playlist', songNum: 0, updateTime: '1792948025' }).updatedAt)
            .toBe(1792948025000);
    });
    it('ignores empty likes, favourite ordering time and invalid versions', () => {
        expect(normalizeQqCollection({ ...owned, songNum: 0, updateTime: 1792948021 }).updatedAt).toBeUndefined();
        expect(normalizeQqCollection({ ...owned, songNum: 0, updatedAt: 1792948021000 }).updatedAt).toBeUndefined();
        expect(normalizeQqCollection({ tid: 9, name: 'Favourite', songnum: 3, orderTime: 1792948021 }).updatedAt).toBeUndefined();
        for (const updateTime of [undefined, null, '', 0, -1, 'invalid', Infinity]) {
            expect(normalizeQqCollection({ ...owned, updateTime }).updatedAt).toBeUndefined();
        }
    });
});
