import { createBodianApi } from '../../upstream/folia-major/node_modules/bodian-music-api/src/api.cjs';

// Runs in the native ArkJS runtime. Only operation results cross into ArkWeb.
export function createBodianRuntime(deviceId, readSession, writeSession, nativeRequest) {
  let revision = 0;
  const sessions = {
    get revision() { return revision; },
    get() { const value = readSession(); return value ? JSON.parse(value) : null; },
    set(value) { revision++; writeSession(JSON.stringify(value)); },
    clear() { revision++; writeSession(''); },
  };
  const api = createBodianApi({ deviceId, sessions, requestFactory: nativeRequest });
  return {
    async request(operation, payload) {
      try { return JSON.stringify(await api.request(operation, JSON.parse(payload))); }
      catch { return JSON.stringify({ ok: false, error: { code: 'invalid-response', message: 'Invalid Bodian request' } }); }
    },
  };
}
