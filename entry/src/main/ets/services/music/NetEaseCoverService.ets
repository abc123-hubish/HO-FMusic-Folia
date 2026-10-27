import { common } from '@kit.AbilityKit';
import { fileIo as fs } from '@kit.CoreFileKit';
import { http } from '@kit.NetworkKit';
import { util } from '@kit.ArkTS';
import { hilog } from '@kit.PerformanceAnalysisKit';

// Native NetEase artwork lookup keeps the local library usable when ArkWeb cannot call the
// configured HTTP API or paint the provider CDN directly (CORS / mixed content). Covers are
// downloaded into the app sandbox and served from https://folia.local/native/cover/<id>.

interface NeteaseArtist { name?: string; }
interface NeteaseAlbum { id?: number; name?: string; picUrl?: string; coverUrl?: string; }
interface NeteaseSong {
  id?: number;
  name?: string;
  ar?: NeteaseArtist[];
  artists?: NeteaseArtist[];
  al?: NeteaseAlbum;
  album?: NeteaseAlbum;
  dt?: number;
  duration?: number;
  durationMs?: number;
}
interface NeteaseSearchBody { songs?: NeteaseSong[]; }
interface NeteaseSearchReply { code?: number; result?: NeteaseSearchBody; songs?: NeteaseSong[]; }
interface NeteaseCoverRequest { id?: string; title?: string; artist?: string; durationMs?: number; }
interface NeteaseCoverReply {
  ok: boolean;
  url?: string;
  songId?: number;
  title?: string;
  artist?: string;
  error?: string;
}
interface ScoredSong { song: NeteaseSong; score: number; titleScore: number; artistScore: number; durationScore: number; }

const MAX_COVER_BYTES = 12 * 1024 * 1024;
const SEARCH_TIMEOUT_MS = 12000;
const COVER_TIMEOUT_MS = 20000;

export class NetEaseCoverService {
  private readonly context: common.UIAbilityContext;
  private readonly directory: string;
  private readonly openDescriptors: number[] = [];
  private readonly memory = new Map<string, string>();

  constructor(context: common.UIAbilityContext) {
    this.context = context;
    this.directory = `${context.filesDir}/covers`;
    if (!fs.accessSync(this.directory)) fs.mkdirSync(this.directory, true);
  }

  private normalize(value: string | undefined): string {
    if (!value) return '';
    return value
      .normalize('NFKC')
      .toLowerCase()
      .replace(/\([^)]*\)|\[[^\]]*\]|（[^）]*）|【[^】]*】/g, ' ')
      .replace(/[\s\-_.,，。!！?？'"“”‘’·:：;；/\\|&+~@#$%^*=<>]+/g, '')
      .trim();
  }

  private titleMatches(candidate: string, wanted: string): number {
    const left = this.normalize(candidate);
    const right = this.normalize(wanted);
    if (!left || !right) return 0;
    if (left === right) return 1;
    if (left.includes(right) || right.includes(left)) {
      const shorter = Math.min(left.length, right.length);
      const longer = Math.max(left.length, right.length);
      return shorter >= 3 ? 0.72 + 0.2 * (shorter / longer) : 0.6;
    }
    const a = new Set<string>();
    const b = new Set<string>();
    for (let index = 0; index + 1 < left.length; index++) a.add(left.substring(index, index + 2));
    for (let index = 0; index + 1 < right.length; index++) b.add(right.substring(index, index + 2));
    if (a.size === 0 || b.size === 0) return 0;
    let shared = 0;
    a.forEach((token: string) => { if (b.has(token)) shared++; });
    const overlap = (2 * shared) / (a.size + b.size);
    return overlap >= 0.6 ? 0.55 + 0.25 * overlap : 0;
  }

  private artistMatches(candidate: string | undefined, wanted: string): number {
    const left = this.normalize(candidate);
    const right = this.normalize(wanted);
    if (!left || !right) return 0;
    if (left === right) return 1;
    return left.includes(right) || right.includes(left) ? 0.75 : 0;
  }

  private songDuration(song: NeteaseSong): number {
    return Number(song.dt ?? song.duration ?? song.durationMs ?? 0);
  }

  private songArtists(song: NeteaseSong): NeteaseArtist[] {
    return song.ar ?? song.artists ?? [];
  }

  private artistText(song: NeteaseSong): string {
    return this.songArtists(song)
      .map((artist: NeteaseArtist): string => artist.name ?? '')
      .filter((name: string): boolean => name.length > 0)
      .join(', ');
  }

  private coverUrlOf(song: NeteaseSong): string {
    const album = song.al ?? song.album;
    const raw = album?.picUrl ?? album?.coverUrl ?? '';
    return raw.replace(/^http:/i, 'https:');
  }

  private async requestJson(url: string): Promise<NeteaseSearchReply> {
    const request = http.createHttp();
    try {
      const response = await request.request(url, {
        method: http.RequestMethod.GET,
        expectDataType: http.HttpDataType.STRING,
        connectTimeout: 10000,
        readTimeout: SEARCH_TIMEOUT_MS,
        maxLimit: 4 * 1024 * 1024,
      });
      if (response.responseCode < 200 || response.responseCode >= 300) {
        throw new Error(`NetEase search returned HTTP ${response.responseCode}`);
      }
      return JSON.parse(response.result as string) as NeteaseSearchReply;
    } finally {
      request.destroy();
    }
  }

  private async search(base: string, keywords: string): Promise<NeteaseSong[]> {
    const root = base.replace(/\/+$/, '');
    const query = encodeURIComponent(keywords);
    const sources: string[] = [`${root}/cloudsearch?keywords=${query}&limit=10&offset=0`,
      `${root}/search?keywords=${query}&limit=10&offset=0`];
    for (const url of sources) {
      try {
        const reply = await this.requestJson(url);
        const songs = reply.result?.songs ?? reply.songs ?? [];
        if (songs.length > 0) return songs;
      } catch (_) {
        // Try the other public search route before giving up.
      }
    }
    return [];
  }

  private async detail(base: string, id: number): Promise<NeteaseSong | undefined> {
    const root = base.replace(/\/+$/, '');
    try {
      const reply = await this.requestJson(`${root}/song/detail?ids=${id}`);
      return reply.songs?.[0];
    } catch (_) {
      return undefined;
    }
  }

  private pick(songs: NeteaseSong[], title: string, artist: string, durationMs: number): NeteaseSong | undefined {
    const scored: ScoredSong[] = [];
    for (const song of songs) {
      const titleScore = this.titleMatches(song.name ?? '', title);
      if (titleScore < 0.5) continue;
      const artistScore = this.artistMatches(this.artistText(song), artist);
      const length = this.songDuration(song);
      const durationScore = durationMs > 0 && length > 0 && Math.abs(length - durationMs) <= 12000 ? 1 : 0;
      const score = titleScore * 0.7 + artistScore * 0.2 + durationScore * 0.1;
      scored.push({ song, score, titleScore, artistScore, durationScore });
    }
    scored.sort((left: ScoredSong, right: ScoredSong): number => right.score - left.score);
    const best = scored[0];
    if (!best) return undefined;
    // A remaster or live version shares the title; prefer a candidate the artist or length confirms.
    if (best.titleScore < 0.9 && best.artistScore === 0 && best.durationScore === 0 && best.score < 0.62) return undefined;
    return best.song;
  }

  private async downloadCover(url: string): Promise<string> {
    const request = http.createHttp();
    let data: ArrayBuffer;
    try {
      const response = await request.request(url, {
        method: http.RequestMethod.GET,
        expectDataType: http.HttpDataType.ARRAY_BUFFER,
        connectTimeout: 10000,
        readTimeout: COVER_TIMEOUT_MS,
        maxLimit: MAX_COVER_BYTES,
      });
      if (response.responseCode < 200 || response.responseCode >= 300) {
        throw new Error(`Cover returned HTTP ${response.responseCode}`);
      }
      data = response.result as ArrayBuffer;
    } finally {
      request.destroy();
    }
    if (!data || data.byteLength < 64) throw new Error('Cover response was empty');
    const pathName = url.split('?')[0].toLowerCase();
    const extension = pathName.endsWith('.png') ? 'png' : pathName.endsWith('.webp') ? 'webp' : 'jpg';
    const id = util.generateRandomUUID(true);
    const path = `${this.directory}/${id}.${extension}`;
    const file = fs.openSync(path, fs.OpenMode.CREATE | fs.OpenMode.READ_WRITE | fs.OpenMode.TRUNC);
    try {
      let offset = 0;
      while (offset < data.byteLength) {
        const written = fs.writeSync(file.fd, offset === 0 ? data : data.slice(offset));
        if (written <= 0) throw new Error('Cannot write cover');
        offset += written;
      }
    } finally {
      fs.closeSync(file);
    }
    return `https://folia.local/native/cover/${id}`;
  }

  async resolve(base: string, payload: string): Promise<string> {
    const reply: NeteaseCoverReply = { ok: false };
    try {
      if (!/^https?:\/\/[^\s]+$/i.test(base)) throw new Error('网易云 API 地址未配置');
      const input = JSON.parse(payload) as NeteaseCoverRequest;
      const title = (input.title ?? '').trim();
      const artist = (input.artist ?? '').trim();
      const durationMs = Number(input.durationMs ?? 0);
      if (!title) throw new Error('歌曲名为空');
      const cacheKey = JSON.stringify([title, artist, durationMs]);
      const cached = this.memory.get(cacheKey);
      if (cached) {
        reply.ok = true;
        reply.url = cached;
        return JSON.stringify(reply);
      }

      let songs = await this.search(base, artist ? `${title} ${artist}` : title);
      hilog.info(0x0000, 'FoliaCover', `search "${title} ${artist}" -> ${songs.length}`);
      if (this.pick(songs, title, artist, durationMs) === undefined) {
        songs = await this.search(base, title);
      }
      let chosen = this.pick(songs, title, artist, durationMs);
      if (!chosen) {
        // Different editions often differ by a suffix; search the title alone once more.
        songs = await this.search(base, title);
        chosen = this.pick(songs, title, '', durationMs);
      }
      if (!chosen) throw new Error('网易云未找到匹配歌曲');
      hilog.info(0x0000, 'FoliaCover', `picked ${chosen.id} ${chosen.name}`);

      if (!this.coverUrlOf(chosen) && typeof chosen.id === 'number') {
        const detailed = await this.detail(base, chosen.id);
        if (detailed) chosen = detailed;
      }
      const coverUrl = this.coverUrlOf(chosen);
      if (!coverUrl) throw new Error('网易云未提供封面');
      hilog.info(0x0000, 'FoliaCover', `download ${coverUrl}`);

      const localUrl = await this.downloadCover(coverUrl);
      this.memory.set(cacheKey, localUrl);
      reply.ok = true;
      reply.url = localUrl;
      reply.songId = chosen.id;
      reply.title = chosen.name;
      reply.artist = this.artistText(chosen);
    } catch (error) {
      reply.error = error instanceof Error ? error.message : '网易云封面获取失败';
      hilog.error(0x0000, 'FoliaCover', `resolve failed: ${reply.error}`);
    }
    return JSON.stringify(reply);
  }

  resource(url: string): WebResourceResponse | undefined {
    const rawId = url.split('?')[0].replace('https://folia.local/native/cover/', '');
    if (!/^[0-9a-f-]{36}$/i.test(rawId)) return undefined;
    for (const extension of ['jpg', 'png', 'webp']) {
      const path = `${this.directory}/${rawId}.${extension}`;
      if (!fs.accessSync(path)) continue;
      const source = fs.openSync(path, fs.OpenMode.READ_ONLY);
      this.openDescriptors.push(source.fd);
      const response = new WebResourceResponse();
      response.setResponseData(source.fd);
      response.setResponseCode(200);
      response.setReasonMessage('OK');
      response.setResponseMimeType(extension === 'png' ? 'image/png' : extension === 'webp' ? 'image/webp' : 'image/jpeg');
      response.setResponseEncoding('binary');
      response.setResponseHeader([
        { headerKey: 'Access-Control-Allow-Origin', headerValue: '*' },
        { headerKey: 'Cache-Control', headerValue: 'public, max-age=31536000, immutable' },
      ]);
      return response;
    }
    return undefined;
  }

  release(): void {
    for (const fd of this.openDescriptors) {
      try { fs.closeSync(fd); } catch (_) {}
    }
    this.openDescriptors.length = 0;
    this.memory.clear();
  }
}
