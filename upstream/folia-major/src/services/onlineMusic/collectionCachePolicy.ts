import type { ProviderCollection } from '../../types/onlineMusic';

// src/services/onlineMusic/collectionCachePolicy.ts
// Qishui supplies no playlist revision. Bound reuse by time and explicit local edits instead.
export const UNVERSIONED_COLLECTION_CACHE_MS = 10 * 60_000;
const memory = new Map<string, string>();
type Identity = Pick<ProviderCollection, 'providerId' | 'id' | 'type'>;
const keyOf = (collection: Pick<Identity, 'providerId'>, id = '*') =>
    `folia.collectionRevision.${collection.providerId}.${encodeURIComponent(id)}`;
const read = (key: string): string => {
    const numberOf = (value: string | null | undefined) => {
        const number = Number(value);
        return Number.isSafeInteger(number) && number >= 0 ? number : 0;
    };
    const sessionRevision = numberOf(memory.get(key));
    try { return String(Math.max(numberOf(localStorage.getItem(key)), sessionRevision)); }
    catch { return String(sessionRevision); }
};
export const supportsTimedCollectionCache = (collection?: Partial<Identity> | null): boolean => (
    collection?.providerId === 'qishui' && (collection.type === 'playlist' || collection.type === 'history')
);
export const getCollectionCacheRevision = (collection: Identity): string =>
    `${read(keyOf(collection))}:${read(keyOf(collection, String(collection.id)))}`;

// A provider-wide change covers its liked list even before the account has returned that list's id.
export const invalidateCollectionCache = (providerId: string, id?: string | number): void => {
    if (providerId !== 'qishui') return;
    const key = keyOf({ providerId }, id === undefined ? '*' : String(id));
    const next = String(Math.max(Date.now(), Number(read(key)) + 1));
    memory.set(key, next);
    try { localStorage.setItem(key, next); } catch { /* Session reuse still observes the edit. */ }
};
