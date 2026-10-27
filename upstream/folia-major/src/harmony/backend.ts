import type { HarmonyNative } from './contracts';

// Original server-side theme generation and lyric proxies are forwarded through HarmonyOS HTTP.
export function installBackend(host: HarmonyNative): void {
  const webFetch = window.fetch.bind(window);
  let seq = 0;
  const requests = new Map<string, { resolve(response: Response): void; reject(reason: Error): void; timer: number }>();
  window.HarmonyBackend = { receive(id, payload) {
    const pending = requests.get(id);
    if (!pending) return;
    requests.delete(id); clearTimeout(pending.timer);
    const result = JSON.parse(payload);
    if (result.error) { pending.reject(new Error(result.error)); return; }
    const bytes = Uint8Array.from(atob(result.body), char => char.charCodeAt(0));
    pending.resolve(new Response(bytes, { status: result.status, headers: { 'Content-Type': 'application/json' } }));
  } };
  window.fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    const resolved = new URL(url, location.href);
    if (resolved.origin !== location.origin || !resolved.pathname.startsWith('/api/')) return webFetch(input, init);
    const request = new Request(input instanceof Request ? input : resolved, init);
    if (request.signal.aborted) throw new DOMException('Aborted', 'AbortError');
    const body = request.method === 'GET' ? '' : await request.text();
    return new Promise<Response>((resolve, reject) => {
      const id = `backend-${++seq}`;
      const timer = window.setTimeout(() => { requests.delete(id); reject(new Error('FMusic server request timed out')); }, 125000);
      requests.set(id, { resolve, reject, timer });
      request.signal.addEventListener('abort', () => { clearTimeout(timer); requests.delete(id); reject(new DOMException('Aborted', 'AbortError')); }, { once: true });
      host.requestBackend(id, JSON.stringify({ path: resolved.pathname + resolved.search, method: request.method, body }));
    });
  };
}
