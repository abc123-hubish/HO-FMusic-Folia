import { Buffer } from '../../upstream/folia-major/node_modules/buffer/index.js';
import { URL, URLSearchParams } from '../bodian/url.mjs';
import { createWebSocketTransport } from './webSocket.mjs';

// Browser primitives used by the pinned protocol, confined to native ArkJS.
export { URL, URLSearchParams };
export const atob = text => Buffer.from(text, 'base64').toString('latin1');
export const btoa = text => Buffer.from(text, 'latin1').toString('base64');
export class TextEncoder { encode(text) { return Uint8Array.from(Buffer.from(text, 'utf8')); } }
export class TextDecoder { decode(bytes) { return Buffer.from(bytes).toString('utf8'); } }
export class AbortController {
  signal = { aborted: false };
  abort() { this.signal.aborted = true; }
}
let send, save, random, epoch = 0, state = { cookies: [], storage: {} };
let socketTransport;
export let WebSocket;
export function receiveSocketEvent(payload) { socketTransport?.receive(payload); }
export function closeHostSockets() { socketTransport?.closeAll(); }
export function setInterval(callback, delay) {
  const timer = { id: undefined, closed:false };
  const tick = () => { if (!timer.closed) { callback(); timer.id = setTimeout(tick,delay); } };
  timer.id = setTimeout(tick,delay); return timer;
}
export function clearInterval(timer) { if (timer) { timer.closed = true; clearTimeout(timer.id); } }
export function configureHost(nativeRequest, read, write, randomBytes) {
  send = nativeRequest; save = write; random = randomBytes;
  socketTransport = createWebSocketTransport(send); WebSocket = socketTransport.WebSocket;
  try { state = JSON.parse(read() || '{}'); } catch { state = {}; }
  state.cookies ||= []; state.storage ||= {};
}
export const crypto = {
  getRandomValues(array) {
    const bytes = Buffer.from(random(array.byteLength), 'base64');
    new Uint8Array(array.buffer, array.byteOffset, array.byteLength).set(bytes);
    return array;
  },
};
export function persistHost() { save(JSON.stringify(state)); }
const matches = (cookie, details) => {
  const host = details.url ? new URL(details.url).hostname : String(details.domain || '').replace(/^\./, '');
  const domain = cookie.domain.replace(/^\./, '');
  if (details.domain) return (domain === host || domain.endsWith('.' + host))
    && (!cookie.expirationDate || cookie.expirationDate > Date.now() / 1000);
  return (host === domain || (!cookie.hostOnly && host.endsWith('.' + domain)))
    && (!cookie.expirationDate || cookie.expirationDate > Date.now() / 1000)
    && (!details.name || cookie.name === details.name);
};
export const chrome = {
  storage: { local: {
    async get(keys) { return Object.fromEntries((keys == null ? Object.keys(state.storage) : [].concat(keys)).map(k => [k, state.storage[k]])); },
    async set(values) { Object.assign(state.storage, values); },
    async remove(keys) { [].concat(keys).forEach(k => delete state.storage[k]); },
  } },
  cookies: {
    async getAll(details) { return state.cookies.filter(c => matches(c, details)); },
    async get(details) { const items = await this.getAll(details); return items[items.length - 1] || null; },
    async set(details) {
      const domain = details.domain || new URL(details.url).hostname;
      state.cookies = state.cookies.filter(c => !(c.domain === domain && c.name === details.name));
      const cookie = { ...details, domain, hostOnly: !details.domain };
      if (!cookie.expirationDate || cookie.expirationDate > Date.now() / 1000) state.cookies.push(cookie);
      return cookie;
    },
    async remove(details) {
      state.cookies = state.cookies.filter(c => !(matches(c, details) && c.name === details.name));
      return details;
    },
    async removeBatch(entries) { for (const entry of entries) await chrome.cookies.remove(entry); return { ok: true }; },
  },
};
export function clearHostProvider(provider) {
  epoch++;
  const domain = provider === 'qq' ? /(^|\.)qq\.com$/ : /(^|\.)kugou\.(com|net)$/;
  state.cookies = state.cookies.filter(c => !domain.test(c.domain.replace(/^\./, '')));
  for (const key of Object.keys(state.storage)) {
    if (provider === 'qq' ? /Qq|qq/i.test(key) : /Kg|Kugou|^kg/i.test(key)) delete state.storage[key];
  }
}
class Headers {
  constructor(entries) { this.entries = entries.map(e => [e.name.toLowerCase(), e.value]); }
  get(name) { const items = this.entries.filter(e => e[0] === name.toLowerCase()).map(e => e[1]); return items.length ? items.join(', ') : null; }
  getSetCookie() { return this.entries.filter(e => e[0] === 'set-cookie').map(e => e[1]); }
}
function response(result, url) {
  const bytes = Buffer.from(result.body, 'base64');
  return {
    status: result.status, ok: result.status >= 200 && result.status < 300, url,
    headers: new Headers(result.headers),
    async text() { return bytes.toString('utf8'); },
    async json() { return JSON.parse(bytes.toString('utf8')); },
    async arrayBuffer() { return Uint8Array.from(bytes).buffer; },
    clone() { return response(result, url); },
  };
}
// Keep every Set-Cookie separate and resolve redirects ourselves, including intermediate cookies.
export async function fetch(input, init = {}) {
  const requestEpoch = epoch;
  let url = String(input), method = String(init.method || 'GET').toUpperCase(), body = init.body || '';
  let headers = Object.fromEntries(Object.entries(init.headers || {}).map(([k,v]) => [k.toLowerCase(), String(v)]));
  const deadline = Number(init.foliaTimeoutMs) || 15000;
  for (let hop = 0; hop <= 8; hop++) {
    if (init.signal?.aborted) throw new Error('Request cancelled');
    const outgoing = { ...headers };
    if (!('cookie' in outgoing)) outgoing.cookie = (await chrome.cookies.getAll({ url })).map(c => `${c.name}=${c.value}`).join('; ');
    const binary = body instanceof ArrayBuffer || ArrayBuffer.isView(body);
    const result = JSON.parse(await send(JSON.stringify({ url, method, headers: outgoing,
      body: binary ? Buffer.from(body instanceof ArrayBuffer ? new Uint8Array(body) : new Uint8Array(body.buffer, body.byteOffset, body.byteLength)).toString('base64') : String(body),
      bodyBase64: binary, timeoutMs: deadline })));
    if (epoch !== requestEpoch) throw new Error('Music session changed');
    if (init.signal?.aborted) throw new Error('Request cancelled');
    // Log protocol status only: signed URLs, headers and account credentials never enter diagnostics.
    const endpoint = new URL(url);
    if (endpoint.hostname.endsWith('.kugou.com') && /\/(?:v5\/url|tracker\/v5\/url|v5\/login_by_token|v1\/authorization)$/.test(endpoint.pathname)) {
      let status, errorCode;
      try { const data = JSON.parse(Buffer.from(result.body, 'base64').toString('utf8')); status = Number(data.status); errorCode = Number(data.error_code ?? data.errcode ?? 0); } catch {}
      console.info(`[FoliaMusic] ${endpoint.hostname}${endpoint.pathname} http=${result.status} status=${status} error_code=${errorCode}`);
    }
    result.headers ||= [];
    for (const entry of result.headers.filter(e => e.name.toLowerCase() === 'set-cookie')) {
      const [pair, ...attributes] = entry.value.split(';'), separator = pair.indexOf('=');
      if (separator < 1) continue;
      const cookie = { url, name: pair.slice(0, separator).trim(), value: pair.slice(separator + 1), path: '/' };
      for (const attr of attributes) {
        const [name, ...values] = attr.trim().split('='), value = values.join('=');
        if (name.toLowerCase() === 'domain') cookie.domain = value;
        if (name.toLowerCase() === 'max-age') cookie.expirationDate = Date.now() / 1000 + Number(value);
        if (name.toLowerCase() === 'expires' && !cookie.expirationDate) cookie.expirationDate = Date.parse(value) / 1000;
      }
      const host = new URL(url).hostname, domain = String(cookie.domain || host).replace(/^\./, '');
      if (host === domain || host.endsWith('.' + domain)) await chrome.cookies.set(cookie);
    }
    const reply = response(result, url), location = reply.headers.get('location');
    if (init.redirect === 'manual' || ![301,302,303,307,308].includes(result.status) || !location) return reply;
    const next = new URL(location, url).toString();
    if (new URL(next).origin !== new URL(url).origin) { delete headers.cookie; delete headers.authorization; }
    if (result.status === 303 || ((result.status === 301 || result.status === 302) && method === 'POST')) {
      method = 'GET'; body = ''; delete headers['content-type'];
    }
    url = next;
  }
  throw new Error('Too many login redirects');
}
