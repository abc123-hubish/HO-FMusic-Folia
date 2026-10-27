import type { QishuiOperation, QishuiParams, QishuiBridgeResult } from 'qishui-music-api';
import type { HarmonyNative } from './contracts';

// src/harmony/qishui.ts — operation-only bridge; account credentials remain native.
export function installHarmonyQishui(host: HarmonyNative): void {
  if (typeof host.requestQishui !== 'function') return;
  let sequence = 0;
  const generation = Date.now();
  const pending = new Map<string, { resolve(value: QishuiBridgeResult): void; reject(error: Error): void; timer: number }>();
  window.HarmonyQishui = {
    receive(id, payload) {
      const request = pending.get(id);
      if (!request) return;
      pending.delete(id); window.clearTimeout(request.timer);
      try {
        const result = JSON.parse(payload) as QishuiBridgeResult;
        if (typeof result.ok !== 'boolean') throw new Error('Invalid response');
        request.resolve(result);
      } catch { request.reject(new Error('Invalid Qishui response')); }
    },
    request(operation: QishuiOperation, params: QishuiParams): Promise<QishuiBridgeResult> {
      return new Promise((resolve, reject) => {
        const id = `qishui-${generation}-${++sequence}`;
        const timer = window.setTimeout(() => {
          pending.delete(id); reject(new Error('Qishui native request timed out'));
        }, 65000);
        pending.set(id, { resolve, reject, timer });
        try { host.requestQishui!(id, operation, JSON.stringify(params)); }
        catch { pending.delete(id); window.clearTimeout(timer); reject(new Error('Qishui native bridge failed')); }
      });
    },
  };
}
