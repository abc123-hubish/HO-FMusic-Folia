import { http } from '@kit.NetworkKit';

// Proxy issued audio and known Kuwo images so ArkWeb can play, cache and sample covers with CORS.
export class BodianMedia {
  private readonly imagePattern: RegExp;
  private readonly audioPattern: RegExp;
  constructor(imagePattern: RegExp = /^https?:\/\/img\d+\.(?:kwcdn\.)?kuwo\.cn\//i,
    audioPattern: RegExp = /^https?:\/\/(?:[\w-]+\.)*kuwo\.cn\/[^?#]*\.(?:mp3|flac|m4a|aac|ogg|wav)(?:[?#]|$)/i) {
    this.imagePattern = imagePattern; this.audioPattern = audioPattern;
  }
  private readonly issued: Map<string, number> = new Map();
  private readonly pending: Set<http.HttpRequest> = new Set();
  register(url: string): void {
    if (!/^https?:\/\/[^\s@]+$/i.test(url)) return;
    this.issued.set(url, Date.now() + 2 * 60 * 60 * 1000);
    if (this.issued.size > 2048) this.issued.delete(this.issued.keys().next().value);
  }
  intercept(url: string, input?: WebResourceRequest): WebResourceResponse | undefined {
    const expiry = this.issued.get(url) || 0;
    if (expiry && expiry <= Date.now()) this.issued.delete(url);
    const image = this.imagePattern.test(url);
    const cachedAudio = this.audioPattern.test(url);
    if (expiry <= Date.now() && !image && !cachedAudio) return undefined;
    if (input && !['GET', 'HEAD', 'OPTIONS'].includes(input.getRequestMethod())) return undefined;
    const response = new WebResourceResponse();
    response.setResponseIsReady(false);
    response.setResponseEncoding('UTF-8');
    void this.fetch(url, input, response);
    return response;
  }
  private async fetch(url: string, input: WebResourceRequest | undefined, response: WebResourceResponse): Promise<void> {
    const request = http.createHttp();
    this.pending.add(request);
    const headers: Record<string, string> = {};
    input?.getRequestHeader().forEach((item: Header): void => {
      if (['range', 'if-range'].includes(item.headerKey.toLowerCase())) headers[item.headerKey] = item.headerValue;
    });
    try {
      const result = await request.request(url, { method: input?.getRequestMethod() === 'HEAD' ? http.RequestMethod.HEAD : http.RequestMethod.GET,
        header: headers, expectDataType: http.HttpDataType.ARRAY_BUFFER, connectTimeout: 15000,
        readTimeout: 60000, maxLimit: 128 * 1024 * 1024, usingCache: false });
      const source = result.header as Record<string, string>;
      const reply: Header[] = [
        { headerKey: 'Access-Control-Allow-Origin', headerValue: '*' },
        { headerKey: 'Access-Control-Expose-Headers', headerValue: 'Content-Length,Content-Range,Accept-Ranges' }
      ];
      Object.keys(source).forEach((key: string): void => {
        if (['content-type', 'content-length', 'content-range', 'accept-ranges', 'cache-control'].includes(key.toLowerCase())) {
          reply.push({ headerKey: key, headerValue: String(source[key]) });
          if (key.toLowerCase() === 'content-type') response.setResponseMimeType(String(source[key]).split(';')[0]);
        }
      });
      response.setResponseHeader(reply);
      response.setResponseData(result.result as ArrayBuffer);
      response.setResponseCode(result.responseCode);
      response.setReasonMessage(result.responseCode === 206 ? 'Partial Content' : 'OK');
    } catch (_) {
      response.setResponseData(''); response.setResponseCode(502); response.setReasonMessage('Bad Gateway');
    } finally {
      this.pending.delete(request); request.destroy(); response.setResponseIsReady(true);
    }
  }
  release(): void { this.pending.forEach((request: http.HttpRequest): void => request.destroy()); this.pending.clear(); }
}
