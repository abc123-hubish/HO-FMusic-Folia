import { rcp } from '@kit.RemoteCommunicationKit';
import { cryptoFramework } from '@kit.CryptoArchitectureKit';
import { util } from '@kit.ArkTS';
import { MusicSession } from './MusicSession';
import { createMusicRuntime, MusicRuntime } from './MusicRuntime';
import { MusicMedia } from './MusicMedia';
import { MusicSockets, MusicSocketRequest } from './MusicSockets';

// Only fixed provider operations reach these isolated ArkJS runtimes and platform network domains.
interface MusicRequest { url: string; method: string; headers: Record<string, string>; body: string; bodyBase64?: boolean; timeoutMs: number; }
interface MusicTransport { transport?: string; }
interface MusicHeader { name: string; value: string; }
interface MusicResponse { status: number; headers: MusicHeader[]; body: string; }
interface MusicReplyMedia { media?: string[]; }
export class MusicService {
  readonly media: MusicMedia = new MusicMedia();
  private readonly network: rcp.Session = rcp.createSession({ requestConfiguration: {
    transfer: { timeout: { connectMs: 15000, transferMs: 15000 }, autoRedirect: false }
  } });
  private readonly runtimes: Map<string, MusicRuntime> = new Map();
  private readonly sockets: MusicSockets = new MusicSockets((payload: string): void => {
    this.runtimes.get('qq')?.receiveSocketEvent(payload);
  });
  constructor() {
    for (const provider of ['qq', 'kugou']) {
      const session = new MusicSession(provider);
      this.runtimes.set(provider, createMusicRuntime(provider,
        (payload: string): Promise<string> => this.fetch(provider, payload),
        (): string => session.read(), (value: string): void => session.write(value),
        (length: number): string => new util.Base64Helper().encodeToStringSync(
          cryptoFramework.createRandom().generateRandomSync(Math.min(4096, Math.max(1, length))).data)));
    }
  }
  private async fetch(provider: string, payload: string): Promise<string> {
    const transport = JSON.parse(payload) as MusicTransport;
    if (transport.transport === 'websocket') {
      if (provider !== 'qq') throw new Error('QQ login socket is unavailable for this provider');
      return this.sockets.request(JSON.parse(payload) as MusicSocketRequest);
    }
    const input = JSON.parse(payload) as MusicRequest;
    const allowed = provider === 'qq'
      ? /^https:\/\/(?:[a-z0-9-]+\.)*(?:qq\.com|tencentmusic\.com)(?::443)?\//i
      : /^https?:\/\/(?:[a-z0-9-]+\.)*kugou\.(?:com|net)(?::(?:80|443))?\//i;
    if (!allowed.test(input.url) || !['GET', 'POST'].includes(input.method) || input.body.length > 262144) {
      throw new Error('Invalid music transport');
    }
    const request = new rcp.Request(input.url, input.method === 'POST' ? 'POST' : 'GET', input.headers,
      input.bodyBase64 && input.body ? new util.Base64Helper().decodeSync(input.body).buffer as ArrayBuffer : input.body || undefined);
    request.configuration = { transfer: { autoRedirect: false,
      timeout: { connectMs: 15000, transferMs: Math.min(60000, Math.max(1000, input.timeoutMs || 15000)) } } };
    const response = await this.network.fetch(request);
    if ((response.body?.byteLength || 0) > 8 * 1024 * 1024) throw new Error('Music response too large');
    const headers: MusicHeader[] = [];
    for (const key of Object.keys(response.headers)) {
      const value = response.headers[key];
      if (Array.isArray(value)) value.forEach((item: string): void => { headers.push({ name: key, value: item }); });
      else if (typeof value === 'string') headers.push({ name: key, value });
    }
    const result: MusicResponse = { status: response.statusCode, headers,
      // QQ check_sig/OAuth redirects can be empty; HarmonyOS Base64 rejects zero-length arrays.
      body: response.body?.byteLength ? new util.Base64Helper().encodeToStringSync(new Uint8Array(response.body)) : '' };
    return JSON.stringify(result);
  }
  async request(provider: string, operation: string, payload: string): Promise<string> {
    const runtime = this.runtimes.get(provider);
    if (!runtime || operation.length > 64 || payload.length > 131072) {
      return '{"ok":false,"error":{"code":"invalid-response","message":"Invalid music request"}}';
    }
    const reply = await runtime.request(operation, payload);
    const result = JSON.parse(reply) as MusicReplyMedia;
    result.media?.forEach((url: string): void => this.media.register(provider, url));
    return reply;
  }
  release(): void { this.sockets.release(); this.network.close(); this.media.release(); }
}
