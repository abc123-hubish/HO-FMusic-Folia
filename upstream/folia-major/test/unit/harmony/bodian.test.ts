import { afterEach, describe, expect, it, vi } from 'vitest';
import { installHarmonyBodian } from '@/harmony/bodian';
import { getBodianTransportAvailability, requestBodian } from '@/services/onlineMusic/bodianTransport';
import type { HarmonyNative } from '@/harmony/contracts';

// test/unit/harmony/bodian.test.ts — asynchronous native transport, public QR rendering and runtime gating.
const toDataURL = vi.fn().mockResolvedValue('data:image/png;base64,test');
vi.mock('qrcode', () => ({ default: { toDataURL: (...args: unknown[]) => toDataURL(...args) } }));
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); vi.clearAllMocks(); });
function setup() {
  const request = vi.fn();
  const host = { requestBodian: request } as unknown as HarmonyNative;
  vi.stubGlobal('window', { setTimeout, clearTimeout });
  installHarmonyBodian(host);
  return request;
}
describe('Harmony Bodian transport', () => {
  it('enables the provider without impersonating Electron and bounds batch sizes', async () => {
    const native = setup();
    expect(getBodianTransportAvailability()).toEqual({ configured: true });
    const promise = requestBodian('search', { query: 'test', limit: 1000, offset: 100 });
    const [id, operation, payload] = native.mock.calls[0];
    expect(operation).toBe('search');
    expect(JSON.parse(payload)).toEqual({ query: 'test', limit: 100, offset: 100 });
    window.HarmonyBodian!.receive(id, '{"ok":true,"data":{"resultList":[]}}');
    expect(await promise).toEqual({ resultList: [] });
    expect(window.electron).toBeUndefined();
  });
  it('matches concurrent replies by ID and ignores late or unknown replies', async () => {
    const native = setup();
    const first = requestBodian('song_detail', { id: '1' });
    const second = requestBodian('song_detail', { id: '2' });
    window.HarmonyBodian!.receive(native.mock.calls[1][0], '{"ok":true,"data":{"id":2}}');
    window.HarmonyBodian!.receive('unknown', 'invalid');
    window.HarmonyBodian!.receive(native.mock.calls[0][0], '{"ok":true,"data":{"id":1}}');
    expect(await first).toEqual({ id: 1 }); expect(await second).toEqual({ id: 2 });
    window.HarmonyBodian!.receive(native.mock.calls[0][0], 'invalid');
  });
  it('renders the allowed public QR URL as an image', async () => {
    const native = setup();
    const promise = requestBodian('login_qr_create', { key: 'test' });
    const imageUrl = 'https://bodian-oia.kuwo.cn/bodian/download.html?pageName=login_pc&pt=3&id=test';
    window.HarmonyBodian!.receive(native.mock.calls[0][0], JSON.stringify({ ok: true, data: { imageUrl } }));
    expect(await promise).toEqual({ imageUrl: 'data:image/png;base64,test' });
    expect(toDataURL).toHaveBeenCalledWith(imageUrl, { width: 320, margin: 3 });
  });
  it('preserves native permission errors', async () => {
    const native = setup();
    const promise = requestBodian('audio', { id: '1' });
    window.HarmonyBodian!.receive(native.mock.calls[0][0], '{"ok":false,"error":{"code":"region-restricted","message":"region"}}');
    await expect(promise).rejects.toMatchObject({ code: 'region-restricted', providerId: 'bodian' });
  });
  it('releases timed-out requests', async () => {
    vi.useFakeTimers();
    const native = setup();
    const promise = requestBodian('search', { query: 'test' });
    const rejection = expect(promise).rejects.toMatchObject({ code: 'network' });
    await vi.advanceTimersByTimeAsync(65000);
    await rejection;
    window.HarmonyBodian!.receive(native.mock.calls[0][0], 'invalid');
  });
  it('keeps ordinary browsers and older native hosts unavailable', () => {
    vi.stubGlobal('window', { setTimeout, clearTimeout });
    installHarmonyBodian({} as HarmonyNative);
    expect(getBodianTransportAvailability()).toEqual({ configured: false, reason: 'runtime-unavailable' });
  });
});
