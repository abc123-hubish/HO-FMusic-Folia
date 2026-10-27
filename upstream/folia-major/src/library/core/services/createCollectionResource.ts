import type { MediaId } from '../../../types/onlineMusic';
import type { LibraryCollectionDescriptor } from '../contracts/collection';
import type { CollectionResource } from '../contracts/resource';
import { collectionKey, isCloudDriveCollection } from '../model/collectionIdentity';
import { omni } from '../../../services/onlineMusic/omni';
import { readOnlineTracksCache, writeOnlineTracksCache } from './onlineCollectionCache';
import { createOnlineCollectionResource, type OnlineCollectionResourceDeps } from './onlineCollectionResource';
import { createNavidromeCollectionResource } from './navidromeCollectionResource';
import { resolveNavidromeServerScope } from './navidromeCollectionTracks';
import { createStaticCollectionResource } from './staticCollectionResource';

// src/library/core/services/createCollectionResource.ts
// 资源的默认装配：在线走 omni 与在线缓存，Navidrome 走 Subsonic。单测直接构造各资源并注入依赖，
// 不经过这里，所以不需要 mock 整个 omni。

const onlineDeps: OnlineCollectionResourceDeps = {
    getCollectionTracks: (collection, page) => omni.getCollectionTracks(collection, page),
    getCollectionDetail: collection => omni.getCollectionDetail(collection),
    getPersonalFm: () => omni.getPersonalFm(),
    getDailySongs: () => omni.getDailySongs(),
    readCache: readOnlineTracksCache,
    writeCache: writeOnlineTracksCache,
};

/**
 * 资源的身份：云盘和汽水的私人集合按账号区分，Navidrome 按服务器与账号区分。
 * 其余在线集合沿用原有身份，避免用户信息晚到时重建资源。
 */
export const resolveCollectionResourceKey = (
    descriptor: LibraryCollectionDescriptor,
    currentUserId?: MediaId | null,
): string => {
    const base = collectionKey(descriptor);
    if (descriptor.source === 'online' && (isCloudDriveCollection(descriptor) || descriptor.providerId === 'qishui')) {
        return `${base}|u:${currentUserId ?? 'anonymous'}`;
    }
    if (descriptor.source === 'navidrome') {
        return `${base}|srv:${resolveNavidromeServerScope()}`;
    }
    return base;
};

/** 按来源创建资源；本地集合的曲目由调用方算好，用 createStaticCollectionResource。 */
export const createCollectionResource = (key: string, descriptor: LibraryCollectionDescriptor): CollectionResource => {
    if (descriptor.source === 'online') return createOnlineCollectionResource(key, onlineDeps);
    if (descriptor.source === 'navidrome') return createNavidromeCollectionResource(key);
    return createStaticCollectionResource(key, []);
};
