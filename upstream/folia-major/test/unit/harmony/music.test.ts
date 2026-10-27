import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { installHarmonyMusic } from '@/harmony/music';

// test/unit/harmony/music.test.ts — real transport routing, native replies and manual API precedence.
const storage = new Map<string, string>();
beforeEach(() => {
  vi.resetModules(); storage.clear();
  vi.stubGlobal('location', { href: 'https://folia.local/harmony.html', origin: 'https://folia.local' });
  vi.stubGlobal('localStorage', { getItem: (k: string) => storage.get(k) ?? null,
    setItem: (k: string,v: string) => storage.set(k,v), removeItem: (k: string) => storage.delete(k) });
  vi.stubGlobal('window', { setTimeout, clearTimeout, fetch: vi.fn(), HarmonyConfig: { qq: '', kugou: '' } });
});
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });
function install(respond: (provider: string, operation: string, params: unknown) => unknown = () => ({ code: 200 })) {
  const requestMusic = vi.fn((id: string, provider: string, operation: string, payload: string) => {
    queueMicrotask(() => window.HarmonyMusic!.receive(id, JSON.stringify({ ok: true, data: respond(provider, operation, JSON.parse(payload)) })));
  });
  installHarmonyMusic({ requestMusic });
  return requestMusic;
}
it('routes blank QQ/KuGou addresses to native and retains no native secrets in renderer storage', async () => {
  const native = install(() => ({ code: 803, status: 4, userid: '123' }));
  const qq = await import('@/services/onlineMusic/qqTransport');
  const kg = await import('@/services/onlineMusic/kugouTransport');
  expect(qq.getQqTransportAvailability().configured).toBe(true);
  expect(kg.getKugouTransportAvailability().configured).toBe(true);
  expect(qq.hasQqSession()).toBe(true); // native owns the startup account probe
  await qq.requestQq('login_qr_check', { key: 'qr' });
  await kg.requestKugou('login_qr_check', { key: 'qr', token: 'legacy-token', dfid: 'legacy-device' });
  expect(native).toHaveBeenLastCalledWith(expect.any(String), 'kugou', 'login_qr_check', '{"key":"qr"}');
  expect([...storage.values()]).not.toContain('legacy-token');
  expect(storage.get('online_provider:qq:cookie')).toBeUndefined();
  expect(kg.getKugouNativeUserId()).toBe('123');
});
it('recovers the native KuGou account hint from the profile without overwriting an external API session', async () => {
  storage.set('online_provider:kugou:userid','external-user');
  install(() => ({ status:1,data:{user_info:{userid:'native-user'}} }));
  const kg=await import('@/services/onlineMusic/kugouTransport');
  await kg.requestKugou('user_detail');
  expect(kg.getKugouNativeUserId()).toBe('native-user');
  expect(storage.get('online_provider:kugou:userid')).toBe('external-user');
  await kg.requestKugou('logout'); expect(kg.getKugouNativeUserId()).toBe('');
});
it('sends QQ write bodies to the fixed native operation and keeps legacy KuGou playInfo off the Web backend', async () => {
  const native=install(() => ({ code:0,liked:true }));
  const qq=await import('@/services/onlineMusic/qqTransport');
  const kg=await import('@/services/onlineMusic/kugouTransport');
  await qq.requestQq('user_song_like',{}, { song:{ id:901,mid:'mid',type:0 },liked:true });
  expect(native).toHaveBeenLastCalledWith(expect.any(String),'qq','user_song_like',JSON.stringify({body:JSON.stringify({song:{id:901,mid:'mid',type:0},liked:true})}));
  await kg.requestKugouLegacyPlayInfo('abc');
  expect(native).toHaveBeenLastCalledWith(expect.any(String),'kugou','legacy_play_info','{"hash":"abc"}');
});
it('unwraps QQ and KuGou artwork proxies for the native media interceptor', async () => {
  const fetch=vi.fn(async()=>new Response('image'));
  window.fetch=fetch; install();
  await window.fetch('/api/lyric-proxy?url='+encodeURIComponent('https://c1.kgimg.com/stdmusic/1024/cover.jpg'));
  expect(fetch).toHaveBeenCalledWith('https://c1.kgimg.com/stdmusic/1024/cover.jpg',undefined);
});
it('keeps explicitly configured external APIs on their existing HTTP transports', async () => {
  const native = install();
  window.HarmonyConfig!.qq = 'https://qq.example'; window.HarmonyConfig!.kugou = 'https://kg.example';
  const fetch = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => Response.json({ code: 200, status: 1, data: {} }));
  vi.stubGlobal('fetch', fetch);
  const qq = await import('@/services/onlineMusic/qqTransport');
  const kg = await import('@/services/onlineMusic/kugouTransport');
  await qq.requestQq('login_channels'); await kg.requestKugou('register_dev');
  expect(String(fetch.mock.calls[0][0])).toContain('https://qq.example/login/channels');
  expect(String(fetch.mock.calls[1][0])).toContain('https://kg.example/register/dev');
  expect(native).not.toHaveBeenCalled();
});
it('serves existing QQ search and QRC proxy calls through the fixed native operation', async () => {
  const native = install(() => ({ code: 0, request: { code: 0, data: { lyric: 'qrc' } } }));
  const reply = await window.fetch('/api/lyric-proxy?url=' + encodeURIComponent('https://u.y.qq.com/cgi-bin/musicu.fcg'), {
    method: 'POST', body: '{"request":{"module":"music.musichallSong.PlayLyricInfo","method":"GetPlayLyricInfo"}}' });
  expect((await reply.json()).request.data.lyric).toBe('qrc');
  expect(native).toHaveBeenCalledWith(expect.any(String), 'qq', 'lyric_request', expect.any(String));
});
it('propagates native errors and ignores replies from expired page request ids', async () => {
  installHarmonyMusic({ requestMusic: (id: string) => queueMicrotask(() => {
    window.HarmonyMusic!.receive('old-page-id', '{}');
    window.HarmonyMusic!.receive(id, '{"ok":false,"error":{"code":"unsupported","message":"Unavailable"}}');
  }) });
  await expect(window.HarmonyMusic!.request('qq','login_status',{})).rejects.toMatchObject({ code: 'unsupported' });
});
