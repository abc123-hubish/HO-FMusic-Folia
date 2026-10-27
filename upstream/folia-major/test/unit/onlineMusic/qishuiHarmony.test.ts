import { afterEach, describe, expect, it, vi } from 'vitest';
import { qishuiProvider } from '@/services/onlineMusic/qishui/qishuiProvider';
import { getQishuiAvailability, requestQishui } from '@/services/onlineMusic/qishui/qishuiTransport';
import { installHarmonyQishui } from '@/harmony/qishui';
import type { HarmonyNative } from '@/harmony/contracts';
import { resolveLoginCopy } from '@/library/core/model/accountRules';
import { omni } from '@/services/onlineMusic/omni';
import { useOnlineProviderAccountStore } from '@/stores/useOnlineProviderAccountStore';
import { getQishuiFmCatalog, clearQishuiRecommendations } from '@/services/onlineMusic/qishui/qishuiRecommendations';
import { usePersonalFmModeStore } from '@/stores/usePersonalFmModeStore';

// test/unit/onlineMusic/qishuiHarmony.test.ts
// Exercise the asynchronous host boundary and the existing account contract, without Electron.
afterEach(() => vi.unstubAllGlobals());
describe('Qishui Harmony account adapter', () => {
    it('is unavailable without a native host', async () => {
        vi.stubGlobal('window', {});
        expect(getQishuiAvailability().configured).toBe(false);
        await expect(requestQishui('login_status')).rejects.toMatchObject({ code: 'unavailable' });
    });
    it('connects native callbacks to the public account result', async () => {
        vi.stubGlobal('window', { setTimeout, clearTimeout });
        const requests: string[] = [];
        installHarmonyQishui({ requestQishui(id, operation) {
            requests.push(operation);
            queueMicrotask(() => window.HarmonyQishui!.receive(id, JSON.stringify({ ok: true,
                data: { id: 'opaque-user', nickname: '汽水账号', isVip: true } })));
        } } as HarmonyNative);
        expect(getQishuiAvailability().configured).toBe(true);
        expect(await qishuiProvider.auth!.getLoginStatus()).toMatchObject({ id: 'opaque-user', nickname: '汽水账号', vipType: 1 });
        expect(requests).toEqual(['login_status']);
    });
    it('maps phone rejection to the existing login cancellation state', async () => {
        vi.stubGlobal('window', { HarmonyQishui: { request: vi.fn(async () => ({ ok: true, data: { state: 'error', failure: { case: 'refused' } } })) } });
        expect(await qishuiProvider.auth!.checkQr!('test-key')).toEqual({ state: 'error', reason: 'canceled-on-device' });
        expect(qishuiProvider.auth!.getQrTtlMs!()).toBe(300000);
        expect(resolveLoginCopy('qishui').note.key).toBe('home.loginNoteQishui');
    });
    it('keeps network polling failures transient', async () => {
        vi.stubGlobal('window', { HarmonyQishui: { request: vi.fn(async () => ({ ok: false, error: { code: 'network', message: 'offline' } })) } });
        expect(await qishuiProvider.auth!.checkQr!('test-key')).toMatchObject({ state: 'error', transient: true });
    });
    it('merges incomplete liked-song lists without erasing known likes', async () => {
        vi.stubGlobal('window', { HarmonyQishui: { request: vi.fn(async () => ({ ok: true, data: { ids: ['123'], whole: false } })) } });
        useOnlineProviderAccountStore.getState().updateAccount('qishui', { user: { id: 'opaque-user', nickname: 'User' }, likedSongIds: ['456'] });
        expect(await omni.getProviderLikedSongIds('qishui', 'opaque-user')).toEqual(['456', '123']);
        expect(await omni.getProviderLikedSongIds('qishui', 'different-user')).toEqual(['123']);
    });
    it('uses Qishui scenes and persists its mode without changing the NetEase selection', async () => {
        clearQishuiRecommendations();
        const request = vi.fn(async (operation: string) => ({ ok: true, data: operation === 'feed_modes'
            ? [{ id: '12345', name: '放松', group: '场景' }] : { items: [] } }));
        vi.stubGlobal('window', { HarmonyQishui: { request } });
        const catalog = await getQishuiFmCatalog();
        const store = usePersonalFmModeStore.getState();
        const legacy = store.selection;
        store.setCatalog('qishui', catalog);
        store.setProviderSelection('qishui', { mode: 'SCENE_RCMD', scene: '12345' });
        await qishuiProvider.recommendations!.getPersonalFm!();
        expect(request).toHaveBeenLastCalledWith('feed', expect.objectContaining({ scene: '12345', queue: 'fm' }));
        expect(usePersonalFmModeStore.getState().selection).toEqual(legacy);
        expect(catalog.modes.some(entry => entry.id === 'PUZZLE_MODE_RCMD')).toBe(false);
        expect(catalog.scenes[0].labelFallback).toBe('放松');
        clearQishuiRecommendations();
    });
    it('exposes and requests only the standard Qishui quality tier', async () => {
        const request = vi.fn(async () => ({ ok: true, data: { url: 'https://test.douyinvod.com/a', quality: 'standard' } }));
        vi.stubGlobal('window', { HarmonyQishui: { request } });
        expect(omni.getProviderAudioQualityLevels('qishui')).toEqual(['standard']);
        const song = qishuiProvider.normalizeSong({ base_info: { id: '123', name: 'Test' } });
        await qishuiProvider.playback!.getAudioSource(song, 'hires');
        expect(request).toHaveBeenCalledWith('audio', { id: '123', quality: 'standard' });
    });
    it('passes the liked-list discriminator for both detail and songs', async () => {
        const request = vi.fn(async () => ({ ok: true, data: { items: [], hasMore: false, nextOffset: 0 } }));
        vi.stubGlobal('window', { HarmonyQishui: { request } });
        const collection = { providerId: 'qishui', type: 'playlist', id: '124', name: '我喜欢', isLiked: true };
        await qishuiProvider.catalog!.getPlaylistTracks!('124', 30, 0, collection);
        expect(request.mock.calls[0]).toEqual(['playlist_tracks', expect.objectContaining({ liked: true })]);
        request.mockResolvedValueOnce({ ok: true, data: null } as any);
        await qishuiProvider.catalog!.getPlaylistDetail!('124', collection);
        expect(request.mock.calls[1]).toEqual(['playlist_detail', expect.objectContaining({ liked: true })]);
        await qishuiProvider.catalog!.getPlaylistTracks!('123', 30, 0, { ...collection, id: '123', isLiked: false });
        expect(request.mock.calls[2][1]).not.toHaveProperty('liked');
    });
    it('surfaces malformed callback replies without leaving a pending request', async () => {
        vi.stubGlobal('window', { setTimeout, clearTimeout });
        installHarmonyQishui({ requestQishui(id) { queueMicrotask(() => window.HarmonyQishui!.receive(id, '{}')); } } as HarmonyNative);
        await expect(requestQishui('login_status')).rejects.toMatchObject({ code: 'network' });
    });
});
