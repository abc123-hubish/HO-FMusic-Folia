import type { BodianOperation, BodianParams, BodianResult } from 'bodian-music-api';
import type { HarmonyNative } from './contracts';

// src/harmony/bodian.ts — transport only; Omni keeps ownership of accounts, songs and playback.
export function installHarmonyBodian(host: HarmonyNative): void {
  if (typeof host.requestBodian !== 'function') return;
  let sequence = 0;
  const generation = Date.now();
  const pending = new Map<string, { resolve(value: BodianResult): void; reject(error: Error): void; timer: number }>();
  const requestNative = (operation: BodianOperation, params: BodianParams): Promise<BodianResult> => (
    new Promise((resolve, reject) => {
      const id = `bodian-${generation}-${++sequence}`;
      const timer = window.setTimeout(() => {
        pending.delete(id); reject(new Error('Bodian native request timed out'));
      }, 65000);
      pending.set(id, { resolve, reject, timer });
      try { host.requestBodian!(id, operation, JSON.stringify(params)); }
      catch {
        pending.delete(id); window.clearTimeout(timer); reject(new Error('Bodian native bridge failed'));
      }
    })
  );
  window.HarmonyBodian = {
    receive(id, payload) {
      const request = pending.get(id);
      if (!request) return;
      pending.delete(id); window.clearTimeout(request.timer);
      try {
        const result: BodianResult = JSON.parse(payload);
        if (typeof result.ok !== 'boolean') throw new Error('Invalid Bodian response');
        request.resolve(result);
      } catch { request.reject(new Error('Invalid Bodian response')); }
    },
    async request(operation, params) {
      const result = await requestNative(operation, params);
      if (operation !== 'login_qr_create' || !result.ok) return result;
      const data = result.data as { imageUrl: string };
      const url = new URL(data.imageUrl);
      if (url.origin !== 'https://bodian-oia.kuwo.cn' || url.pathname !== '/bodian/download.html') {
        throw new Error('Invalid Bodian QR URL');
      }
      // Only this public login URL enters the renderer; the native exchange never returns tokens.
      const { default: QRCode } = await import('qrcode');
      return { ok: true, data: { imageUrl: await QRCode.toDataURL(url.href, { width: 320, margin: 3 }) } };
    },
  };
}
