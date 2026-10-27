import type { HarmonyNative } from './contracts';
import { OnlineProviderError, type ProviderErrorCode, type OnlineProviderErrorDetails } from '../types/onlineMusic';

// src/harmony/music.ts — operation-only IPC; credentials and platform HTTP stay native.
interface NativeReply { ok: boolean; data?: unknown; error?: { code?: string; message?: string; httpStatus?: number; retryAfterMs?: number; details?: OnlineProviderErrorDetails }; }
const NATIVE_ERROR_CODES: ReadonlySet<string> = new Set<ProviderErrorCode>(['auth-required', 'unsupported', 'unavailable', 'not-playable',
  'preview-only', 'region-restricted', 'network', 'invalid-response', 'timeout', 'rate-limited', 'service-unavailable',
  'membership-required', 'purchase-required', 'entitlement-required', 'taken-down']);
export function installHarmonyMusic(host: Pick<HarmonyNative, 'requestMusic'>): void {
  if (typeof host.requestMusic !== 'function') return;
  let sequence = 0;
  const generation = Date.now();
  const pending = new Map<string, { resolve(value: unknown): void; reject(error: Error): void; timer: number; provider: 'qq' | 'kugou' }>();
  window.HarmonyMusic = {
    request(provider, operation, params) {
      return new Promise((resolve, reject) => {
        const id = `music-${generation}-${++sequence}`;
        const timer = window.setTimeout(() => {
          pending.delete(id); reject(new OnlineProviderError('timeout', '内置音乐连接请求超时，请重试', provider));
        }, 180000);
        pending.set(id, { resolve, reject, timer, provider });
        try { host.requestMusic!(id, provider, operation, JSON.stringify(params)); }
        catch {
          pending.delete(id); window.clearTimeout(timer);
          reject(new OnlineProviderError('unavailable', '内置音乐连接不可用', provider, undefined, undefined, undefined, { stage: 'ipc' }));
        }
      });
    },
    receive(id, payload) {
      const request = pending.get(id);
      if (!request) return;
      pending.delete(id); window.clearTimeout(request.timer);
      try {
        const result = JSON.parse(payload) as NativeReply;
        if (typeof result.ok !== 'boolean') throw new Error('Invalid native music response');
        if (!result.ok) {
          const code = result.error?.code;
          request.reject(new OnlineProviderError(code && NATIVE_ERROR_CODES.has(code) ? code as ProviderErrorCode : 'network',
            result.error?.message || '内置音乐连接失败', request.provider, undefined, result.error?.httpStatus,
            result.error?.retryAfterMs, result.error?.details));
        } else request.resolve(result.data);
      } catch { request.reject(new OnlineProviderError('invalid-response', 'Invalid native music response', request.provider)); }
    },
  };
  const webFetch = window.fetch.bind(window);
  // Preserve the existing QQ search/QRC parser while serving its two fixed musicu methods natively.
  window.fetch = async (input, init) => {
    const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url, location.href);
    if (!window.HarmonyConfig?.qq && url.origin === location.origin && url.pathname === '/api/lyric-proxy'
      && url.searchParams.get('url') === 'https://u.y.qq.com/cgi-bin/musicu.fcg') {
      const request = new Request(input instanceof Request ? input : url, init);
      const result = await window.HarmonyMusic!.request('qq', 'lyric_request', { payload: await request.text() });
      return Response.json(result);
    }
    if (url.origin === location.origin && url.pathname === '/api/lyric-proxy') {
      const target = new URL(url.searchParams.get('url') || '', location.href);
      if (!window.HarmonyConfig?.kugou && target.origin === 'https://m.kugou.com'
        && target.pathname === '/app/i/getSongInfo.php' && target.searchParams.get('cmd') === 'playInfo') {
        const result = await window.HarmonyMusic!.request('kugou', 'legacy_play_info', { hash: target.searchParams.get('hash') || '' });
        return Response.json(result);
      }
      // Artwork proxies normally live on the Web server. ArkWeb's native media interceptor serves these CDNs.
      if (/^https?:\/\/(?:[\w-]+\.)*(?:kgimg\.com|gtimg\.cn|qpic\.cn|qlogo\.cn)\//i.test(target.href)) {
        return webFetch(target.href, init);
      }
    }
    return webFetch(input, init);
  };
}
