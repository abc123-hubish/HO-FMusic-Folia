import { describe, expect, it } from 'vitest';
import type { LocalLibraryAssignment, LocalLibraryEntity } from '../../../src/types/localLibrary';
import { buildLocalLibraryIndex } from '../../../src/utils/localLibraryIndex';

// test/unit/localLibrary/localLibraryIndex.test.ts
// Alias buckets must retain the original order and duplicates while avoiding repeated array copies.
const original = (entities: LocalLibraryEntity[], assignments: LocalLibraryAssignment[]) => {
    const entityIdsByAlias = new Map<string, string[]>();
    entities.forEach(entity => entity.normalizedAliases.forEach(alias => {
        const key = `${entity.kind}:${alias}`;
        entityIdsByAlias.set(key, [...(entityIdsByAlias.get(key) || []), entity.id]);
    }));
    return {
        entitiesById: new Map(entities.map(entity => [entity.id, entity])), entityIdsByAlias,
        assignmentsBySongId: new Map(assignments.map(assignment => [assignment.songId, assignment])),
    };
};

describe('buildLocalLibraryIndex', () => {
    it('matches the original for duplicate aliases, duplicate IDs and separate artist/album keys', () => {
        const entities = Array.from({ length: 300 }, (_, index) => ({
            id: `entity-${index % 80}`, kind: index % 2 === 0 ? 'artist' : 'album',
            normalizedAliases: [`name:${index % 7}`, 'shared', 'shared', ''],
        } as LocalLibraryEntity));
        const assignments = Array.from({ length: 200 }, (_, index) => ({ songId: `song-${index % 40}` } as LocalLibraryAssignment));
        const before = JSON.stringify({ entities, assignments });
        expect(buildLocalLibraryIndex(entities, assignments)).toEqual(original(entities, assignments));
        expect(JSON.stringify({ entities, assignments })).toBe(before);
        expect(buildLocalLibraryIndex([], [])).toEqual(original([], []));
    });

    it('creates independent buckets and retains source record references', () => {
        const first = { id: 'one', kind: 'artist', normalizedAliases: ['a', 'b'] } as LocalLibraryEntity;
        const last = { ...first, normalizedAliases: ['a'] };
        const index = buildLocalLibraryIndex([first, last]);
        expect(index.entitiesById.get('one')).toBe(last);
        expect(index.entityIdsByAlias.get('artist:a')).toEqual(['one', 'one']);
        index.entityIdsByAlias.get('artist:a')!.push('other');
        expect(index.entityIdsByAlias.get('artist:b')).toEqual(['one']);
        expect(first.normalizedAliases).toEqual(['a', 'b']);
    });
});
