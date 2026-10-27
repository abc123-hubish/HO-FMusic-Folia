import { http } from '@kit.NetworkKit';

// Serve provider audio and artwork through native HTTP so ArkWeb can play, seek and cache them with CORS.
interface IssuedMusicMedia { provider: string; url: string; }
export class MusicMedia {
  private readonly issued: Map<string, IssuedMusicMedia> = new Map();
  private readonly pending: Set<http.HttpRequest> = new Set();
  register(provider: string, url: string): void {
    if (!/^https?:\/\/[^\s@]+$/i.test(url)) return;
    const allowed = provider === 'qq'
      ? /^https?:\/\/(?:[\w-]+\.)*(?:qq\.com|qqmusic\.com|gtimg\.cn|qpic\.cn|qlogo\.cn)\//i
      : /^https?:\/\/(?:[\w-]+\.)*(?:kugou\.com|kugou\.net|kgimg\.com)\//i;
    if (!allowed.test(url)) return;
    this.issued.set(url.replace(/^http:/i, 'https:'), { provider, url });
    if (this.issued.size > 4096) this.issued.delete(this.issued.keys().next().value);
  }
  intercept(url: string, input?: WebResourceRequest): WebResourceResponse | undefined {
    const issued = this.issued.get(url.replace(/^http:/i, 'https:'));
    const artwork = /^https?:\/\/(?:(?:[\w-]+\.)*(?:kgimg\.com|gtimg\.cn|qpic\.cn|qlogo\.cn)|(?:imge|imgessl|singerimg)\.kugou\.com)\//i.test(url);
    // Cached tracks survive a Web reload; only recognize the providers' audio CDN paths here.
    const audio = /^https?:\/\/(?:[\w-]+\.)*(?:qqmusic\.qq\.com|kugou\.com|kugou\.net)\/[^?#]*\.(?:mp3|flac|m4a|aac|ogg|wav)(?:[?#]|$)/i.test(url);
    if (!issued && !artwork && !audio) return undefined;
    const method = input?.getRequestMethod() || 'GET';
    if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) return undefined;
    const response = new WebResourceResponse();
    response.setResponseIsReady(false); response.setResponseEncoding('UTF-8');
    // The Web URL normalizer upgrades KuGou HTTP links. Fetch the exact URL issued by the platform.
    void this.fetch(issued?.url || url, issued?.provider || (url.includes('kugou') || url.includes('kgimg') ? 'kugou' : 'qq'), input, response);
    return response;
  }
  private async fetch(url: string, provider: string, input: WebResourceRequest | undefined, response: WebResourceResponse): Promise<void> {
    const request = http.createHttp(); this.pending.add(request);
    const reply: Header[] = [
      { headerKey: 'Access-Control-Allow-Origin', headerValue: '*' },
      { headerKey: 'Access-Control-Allow-Methods', headerValue: 'GET, HEAD, OPTIONS' },
      { headerKey: 'Access-Control-Allow-Headers', headerValue: 'Range, If-Range' },
      { headerKey: 'Access-Control-Expose-Headers', headerValue: 'Content-Length, Content-Range, Accept-Ranges, Content-Type' }
    ];
    try {
      if (input?.getRequestMethod() === 'OPTIONS') {
        response.setResponseData(''); response.setResponseCode(204); response.setReasonMessage('No Content');
      } else {
        const headers: Record<string, string> = {
          'Referer': provider === 'qq' ? 'https://y.qq.com/' : 'https://www.kugou.com/',
          'User-Agent': 'Mozilla/5.0'
        };
        input?.getRequestHeader().forEach((item: Header): void => {
          if (['range', 'if-range'].includes(item.headerKey.toLowerCase())) headers[item.headerKey] = item.headerValue;
        });
        const result = await request.request(url, { method: input?.getRequestMethod() === 'HEAD' ? http.RequestMethod.HEAD : http.RequestMethod.GET,
          header: headers, expectDataType: http.HttpDataType.ARRAY_BUFFER, connectTimeout: 15000,
          readTimeout: 60000, maxLimit: 100 * 1024 * 1024, usingCache: false });
        const source = result.header as Record<string, string>;
        Object.keys(source).forEach((key: string): void => {
          if (['content-type','content-length','content-range','accept-ranges','cache-control','etag','last-modified'].includes(key.toLowerCase())) {
            reply.push({ headerKey: key, headerValue: String(source[key]) });
            if (key.toLowerCase() === 'content-type') response.setResponseMimeType(String(source[key]).split(';')[0]);
          }
        });
        response.setResponseData(result.result as ArrayBuffer); response.setResponseCode(result.responseCode);
        response.setReasonMessage(result.responseCode === 206 ? 'Partial Content' : 'OK');
      }
    } catch (_) {
      response.setResponseData(''); response.setResponseCode(502); response.setReasonMessage('Bad Gateway');
    } finally {
      response.setResponseHeader(reply); this.pending.delete(request); request.destroy(); response.setResponseIsReady(true);
    }
  }
  release(): void { this.pending.forEach((request: http.HttpRequest): void => request.destroy()); this.pending.clear(); this.issued.clear(); }
}
