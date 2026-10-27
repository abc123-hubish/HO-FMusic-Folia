import { common } from '@kit.AbilityKit';
import { rcp } from '@kit.RemoteCommunicationKit';
import { BodianSession } from './BodianSession';
import { BodianRuntime, createBodianRuntime } from './BodianRuntime';
import { BodianMedia } from './BodianMedia';

// The upstream protocol executes in ArkJS, using RCP for GET bodies and Asset Store for credentials.
interface BodianNativeRequest { url: string; method: string; headers: Record<string, string>; body: string; }
interface BodianNativeResponse { status: number; body: string; }
interface BodianAudioResult { ok: boolean; data?: BodianAudioData; }
interface BodianAudioData { url?: string; }

export class BodianService {
  readonly media: BodianMedia = new BodianMedia();
  private readonly network: rcp.Session = rcp.createSession({ requestConfiguration: {
    transfer: { timeout: { connectMs: 15000, transferMs: 15000 }, autoRedirect: false }
  } });
  private readonly runtime: BodianRuntime;
  constructor(context: common.UIAbilityContext) {
    const session = new BodianSession(context);
    this.runtime = createBodianRuntime(session.deviceId, (): string => session.read(),
      (value: string): void => session.write(value), (payload: string): Promise<string> => this.fetch(payload));
  }
  private async fetch(payload: string): Promise<string> {
    const input = JSON.parse(payload) as BodianNativeRequest;
    if (!/^https:\/\/(?:bd-api|mlyric)\.kuwo\.cn\//.test(input.url) ||
      !['GET', 'POST'].includes(input.method) || input.body.length > 131072) throw new Error('Invalid Bodian transport');
    const request = new rcp.Request(input.url, input.method === 'POST' ? 'POST' : 'GET', input.headers,
      input.body || undefined);
    const response = await this.network.fetch(request);
    if ((response.body?.byteLength || 0) > 8 * 1024 * 1024) throw new Error('Bodian response exceeded the size limit');
    const result: BodianNativeResponse = { status: response.statusCode, body: response.toString() || '' };
    return JSON.stringify(result);
  }
  async request(operation: string, payload: string): Promise<string> {
    if (operation.length > 64 || payload.length > 131072) {
      return '{"ok":false,"error":{"code":"invalid-response","message":"Invalid Bodian request"}}';
    }
    const result = await this.runtime.request(operation, payload);
    if (operation === 'audio') {
      const audio = JSON.parse(result) as BodianAudioResult;
      if (audio.ok && audio.data?.url) this.media.register(audio.data.url);
    }
    return result;
  }
  release(): void { this.network.close(); this.media.release(); }
}
