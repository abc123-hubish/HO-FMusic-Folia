import { common } from '@kit.AbilityKit';
import { rcp } from '@kit.RemoteCommunicationKit';
import { QishuiSession } from './QishuiSession';
import { BodianMedia } from '../bodian/BodianMedia';
import { QishuiCrypto } from './QishuiCrypto';
import { QishuiRuntime, createQishuiRuntime } from './QishuiRuntime';

// Restricted native transport. Ticket guards and account credentials never cross into ArkWeb.
interface NativeRequest { url: string; method: string; headers: Record<string, string>; body: string; }
interface NativeResponse { status: number; body: string; headers: Record<string, string>; }
interface AudioResult { ok: boolean; data?: AudioData; }
interface AudioData { url?: string; }
export class QishuiService {
  readonly media: BodianMedia = new BodianMedia(/^https:\/\/(?:[\w-]+\.)*(?:douyinpic\.com|byteimg\.com|pstatp\.com|douyincdn\.com)\//,
    /^https:\/\/(?:[\w-]+\.)*(?:365yg\.com|douyinvod\.com|douyinscdn\.com|bytefcdn\.com|bytecdn\.cn|byteicdn\.com|ibytedtos\.com|pstatp\.com|snssdk\.com|bytedance\.com|bytetos\.com|volcvideo\.com|volccdn\.com|volces\.com|volcengineapi\.com|douyin\.com|qishui\.com|zijieapi\.com|zjcdn\.com)\//);
  private readonly network: rcp.Session = rcp.createSession({ requestConfiguration: {
    transfer: { timeout: { connectMs: 15000, transferMs: 25000 }, autoRedirect: false }
  } });
  private readonly crypto: QishuiCrypto = new QishuiCrypto();
  private readonly runtime: QishuiRuntime;
  constructor(context: common.UIAbilityContext) {
    const session = new QishuiSession(context);
    this.runtime = createQishuiRuntime(session.deviceId, (): string => session.read(),
      (value: string): void => session.write(value), (payload: string): Promise<string> => this.fetch(payload),
      (payload: string): string => this.crypto.run(payload));
  }
  private async fetch(payload: string): Promise<string> {
    const input = JSON.parse(payload) as NativeRequest;
    const allowed = /^https:\/\/(?:open\.qishui\.com\/api\/luna\/v1\/platform\/|open\.douyin\.com\/(?:oauth\/|api\/luna\/v1\/platform\/)|open-client\.douyin\.com\/passport\/open\/get_access_ticket\/)/;
    const player = /^https:\/\/(?:[\w-]+\.)*(?:365yg\.com|douyinvod\.com|douyinscdn\.com|bytefcdn\.com|bytecdn\.cn|byteicdn\.com|ibytedtos\.com|pstatp\.com|snssdk\.com|bytedance\.com|bytetos\.com|volcvideo\.com|volccdn\.com|volces\.com|volcengineapi\.com|douyin\.com|qishui\.com|zijieapi\.com|zjcdn\.com)\//;
    const publicPlayer = player.test(input.url) && input.method === 'GET'
      && Object.keys(input.headers).every((key: string): boolean => key.toLowerCase() === 'user-agent');
    if ((!allowed.test(input.url) && !publicPlayer) || !['GET', 'POST'].includes(input.method) || input.body.length > 131072) {
      throw new Error('Invalid Qishui transport');
    }
    const request = new rcp.Request(input.url, input.method === 'POST' ? 'POST' : 'GET', input.headers, input.body || undefined);
    const response = await this.network.fetch(request);
    if ((response.body?.byteLength || 0) > 8 * 1024 * 1024) throw new Error('Qishui response exceeded the size limit');
    const headers: Record<string, string> = {};
    Object.keys(response.headers).forEach((key: string): void => { headers[key.toLowerCase()] = String(response.headers[key]); });
    const result: NativeResponse = { status: response.statusCode, body: response.toString() || '', headers };
    return JSON.stringify(result);
  }
  async request(operation: string, payload: string): Promise<string> {
    if (operation.length > 64 || payload.length > 131072) {
      return '{"ok":false,"error":{"code":"invalid-response","message":"Invalid Qishui request"}}';
    }
    const result = await this.runtime.request(operation, payload);
    if (operation === 'audio') {
      const audio = JSON.parse(result) as AudioResult;
      if (audio.ok && audio.data?.url) this.media.register(audio.data.url);
    }
    return result;
  }
  release(): void { this.network.close(); this.media.release(); }
}
