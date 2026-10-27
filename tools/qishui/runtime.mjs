import { createQishuiApi } from '../../upstream/folia-major/node_modules/qishui-music-api/src/api.cjs';
// The build aliases this specifier to the same adapter used by every CommonJS protocol module.
import { installNativeCrypto } from 'node:crypto';

// All credentials remain inside native ArkJS and the platform's encrypted Asset Store.
export function createQishuiRuntime(deviceId, readSession, writeSession, nativeRequest, nativeCrypto) {
  installNativeCrypto(nativeCrypto);
  let revision = 0;
  const sessions = { deviceId, get revision() { return revision; },
    get() { const value = readSession(); return value ? JSON.parse(value) : null; },
    set(value) { revision++; writeSession(JSON.stringify(value)); },
    clear() { revision++; writeSession(''); },
  };
  const fetch = async (url, options = {}) => {
    const reply = JSON.parse(await nativeRequest(JSON.stringify({ url: String(url), method: options.method || 'GET',
      headers: options.headers || {}, body: options.body || '' })));
    return { ok: reply.status >= 200 && reply.status < 300, status: reply.status,
      json: async () => JSON.parse(reply.body),
      headers: { get: name => reply.headers[String(name).toLowerCase()] ?? null } };
  };
  const api = createQishuiApi({ deviceId, sessions, fetch, log: () => {}, warn: () => {} });
  return { async request(operation, payload) {
    try { return JSON.stringify(await api.request(operation, JSON.parse(payload))); }
    catch { return JSON.stringify({ ok: false, error: { code: 'invalid-response', message: 'Invalid Qishui request' } }); }
  } };
}
