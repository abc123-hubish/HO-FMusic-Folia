import { common } from '@kit.AbilityKit';
import { webview } from '@kit.ArkWeb';
import { preferences } from '@kit.ArkData';
import { promptAction } from '@kit.ArkUI';
import { ApiConfig, DEFAULT_NETEASE_API_BASE, FoliaSnapshot, HostCommand } from '../model/FoliaModel';
import { NativeFileStore } from './NativeFileStore';
import { SystemMediaSession } from './SystemMediaSession';
import { NativeTransferStore } from './NativeTransferStore';
import { http } from '@kit.NetworkKit';
import { util } from '@kit.ArkTS';
import { hilog } from '@kit.PerformanceAnalysisKit';
import { DisplayOrientation } from './DisplayOrientation';
import { ScreenKeepOn } from './ScreenKeepOn';
import { DesktopWindowChrome } from './DesktopWindowChrome';
import { BodianService } from './bodian/BodianService';
import { QishuiService } from './qishui/QishuiService';
import { HarmonyAiService } from './HarmonyAiService';
import { MusicService } from './music/MusicService';
import { NetEaseCoverService } from './music/NetEaseCoverService';
import { AppContinuation } from './AppContinuation';

interface BackendRequest { path: string; method: string; body: string; }
interface BackendResult { status: number; body: string; error: string; }
interface WebWindowInsets {
  enabled: boolean; top: number; right: number;
  cutoutTop: number; cutoutLeft: number; cutoutRight: number; cutoutBottom: number;
}

// The proxy is attached only to the bundled folia.local document. External pages cannot navigate into this Web.
export class FoliaBridge {
  readonly controller: webview.WebviewController = new webview.WebviewController();
  readonly files: NativeFileStore;
  private config: ApiConfig = new ApiConfig();
  private snapshot: FoliaSnapshot = new FoliaSnapshot();
  private session: SystemMediaSession;
  private transfers: NativeTransferStore;
  private readonly bodian: BodianService;
  private readonly qishui: QishuiService;
  private readonly ai: HarmonyAiService;
  private readonly music: MusicService = new MusicService();
  private readonly covers: NetEaseCoverService;
  private onSnapshot: (value: FoliaSnapshot) => void = (_value: FoliaSnapshot): void => {};
  private context: common.UIAbilityContext;
  private readonly exportContinuation = (requestId: string): void => {
    void this.run(`window.HarmonyApp?.exportContinuation(${JSON.stringify(requestId)})`);
  };
  constructor(context: common.UIAbilityContext) {
    this.context = context;
    this.bodian = new BodianService(context);
    this.qishui = new QishuiService(context);
    this.ai = new HarmonyAiService(context);
    this.files = new NativeFileStore(context);
    this.transfers = new NativeTransferStore(context);
    this.covers = new NetEaseCoverService(context);
    const prefs = preferences.getPreferencesSync(context, { name: 'folia_native' });
    try { this.config = JSON.parse(prefs.getSync('api', JSON.stringify(this.config)) as string) as ApiConfig; } catch (_) {}
    if (!this.config.netease) this.config.netease = DEFAULT_NETEASE_API_BASE;
    this.session = new SystemMediaSession(context, (action: string): void => { this.command(action); });
    AppContinuation.attach(context, this.exportContinuation);
  }
  getContinuation(): string { return AppContinuation.getPending(); }
  finishContinuation(payload: string): void { AppContinuation.acknowledge(payload); }
  completeContinuation(requestId: string, payload: string): void { AppContinuation.finishExport(requestId, payload); }
  setContinuationAvailable(available: boolean): void { AppContinuation.setHostAvailable(this.exportContinuation, available); }
  subscribe(callback: (value: FoliaSnapshot) => void): void { this.onSnapshot = callback; }
  getConfig(): string { return JSON.stringify(this.config); }
  getAiConfig(): string { return this.ai.getConfig(); }
  saveAiConfig(payload: string): string { return this.ai.saveConfig(payload); }
  requestAi(id: string, payload: string): void {
    if (!/^ai-\d+$/.test(id)) return;
    void this.ai.request(payload).then((reply: string): Promise<string> =>
      this.run(`window.HarmonyAi?.receive(${JSON.stringify(id)},${JSON.stringify(reply)})`));
  }
  getWindowInsets(): string {
    const desktop = DesktopWindowChrome.getInsets();
    const insets: WebWindowInsets = { enabled: desktop.enabled, top: desktop.top, right: desktop.right,
      cutoutTop: AppStorage.get<number>('folia_cutout_top') ?? 0,
      cutoutLeft: AppStorage.get<number>('folia_cutout_left') ?? 0,
      cutoutRight: AppStorage.get<number>('folia_cutout_right') ?? 0,
      cutoutBottom: AppStorage.get<number>('folia_cutout_bottom') ?? 0 };
    return JSON.stringify(insets);
  }
  getForeground(): boolean { return AppStorage.get<boolean>('folia_foreground') !== false; }
  // Pause ArkWeb's visual work without globally suspending timers needed for music and system controls.
  syncForeground(): void {
    const foreground = this.getForeground();
    try {
      if (foreground) this.controller.onActive();
      else this.controller.onInactive();
    } catch (error) { console.warn(`Folia Web visibility: ${String(error)}`); }
    void this.run(`window.HarmonyLifecycle?.setForeground(${foreground})`);
  }
  setWindowDaylight(daylight: boolean): void { DesktopWindowChrome.setDaylight(daylight); }
  syncWindowInsets(): void {
    void this.run(`window.dispatchEvent(new CustomEvent('harmonywindowinsetschange',{detail:${this.getWindowInsets()}}))`);
  }
  getPortraitMode(): boolean { return DisplayOrientation.getPortraitMode(this.context); }
  getKeepScreenOn(): boolean { return ScreenKeepOn.getEnabled(this.context); }
  setKeepScreenOn(enabled: boolean): void {
    void ScreenKeepOn.setEnabled(this.context, enabled)
      .catch(() => this.toast('设置屏幕不熄屏失败，请重试'))
      .then(() => this.run(`window.dispatchEvent(new CustomEvent('harmonykeepscreenonchange',{detail:${this.getKeepScreenOn()}}))`));
  }
  setPortraitMode(enabled: boolean): void {
    void DisplayOrientation.setPortraitMode(this.context, enabled)
      .catch(() => this.toast('切换屏幕方向失败，请重试'))
      .then(() => this.run(`window.dispatchEvent(new CustomEvent('harmonyorientationchange',{detail:${this.getPortraitMode()}}))`));
  }
  saveConfig(payload: string): string {
    try {
      const config = JSON.parse(payload) as ApiConfig;
      for (const url of [config.netease, config.kugou, config.qq, config.server]) {
        if (url && !/^https?:\/\/[^\s]+$/i.test(url)) return '请输入以 https:// 或 http:// 开头的完整地址';
      }
      const prefs = preferences.getPreferencesSync(this.context, { name: 'folia_native' });
      prefs.putSync('api', JSON.stringify(config));
      this.config = config;
      void prefs.flush().then(() => this.controller.refresh()).catch(() => this.toast('服务配置保存失败，请重试'));
      return '';
    } catch (_) { return '服务配置格式错误'; }
  }
  getFiles(): string { return JSON.stringify(this.files.list()); }
  removeFiles(payload: string): void { this.files.remove(JSON.parse(payload) as string[]); }
  openExternal(url: string): void {
    if (!/^https?:\/\/[^\s]+$/i.test(url)) return;
    void this.context.startAbility({ action: 'ohos.want.action.viewData', uri: url })
      .catch(() => this.toast('无法打开此链接'));
  }
  beginBlob(id: string): void { this.transfers.begin(id); }
  appendBlob(id: string, base64: string): void { this.transfers.append(id, base64); }
  finishBlob(id: string): string { return this.transfers.finish(id); }
  exportFile(id: string, name: string): void {
    void this.transfers.export(id, name).then((saved: boolean) => {
      if (saved) this.toast('文件已保存');
    }).catch(() => this.toast('保存失败，请重试'));
  }
  requestImport(): void { void this.importMusic(); }
  requestBackend(id: string, payload: string): void { void this.fetchBackend(id, payload); }
  requestLocalCover(id: string, payload: string): void {
    if (!/^cover-\d+$/.test(id)) return;
    hilog.info(0x0000, 'FoliaCover', `request ${payload}`);
    const base = this.config.netease || DEFAULT_NETEASE_API_BASE;
    void this.covers.resolve(base, payload)
      .then((reply: string): Promise<string> => {
        hilog.info(0x0000, 'FoliaCover', `reply ${reply}`);
        return this.run(`window.HarmonyCover?.receive(${JSON.stringify(id)},${JSON.stringify(reply)})`);
      })
      .catch((error: Error): Promise<string> => {
        hilog.error(0x0000, 'FoliaCover', `failed ${error.message}`);
        return this.run(
          `window.HarmonyCover?.receive(${JSON.stringify(id)},` +
          `${JSON.stringify(JSON.stringify({ ok: false, error: '网易云封面获取失败' }))})`);
      });
  }
  requestMusic(id: string, provider: string, operation: string, payload: string): void {
    if (!/^music-\d+-\d+$/.test(id)) return;
    void this.music.request(provider, operation, payload)
      .catch((): string => '{"ok":false,"error":{"code":"network","message":"内置音乐连接请求失败，请重试"}}')
      .then((reply: string): Promise<string> =>
        this.run(`window.HarmonyMusic?.receive(${JSON.stringify(id)},${JSON.stringify(reply)})`));
  }
  requestBodian(id: string, operation: string, payload: string): void {
    if (!/^bodian-\d+-\d+$/.test(id)) return;
    void this.bodian.request(operation, payload)
      .catch((): string => '{"ok":false,"error":{"code":"network","message":"Bodian native request failed"}}')
      .then((reply: string): Promise<string> =>
      this.run(`window.HarmonyBodian?.receive(${JSON.stringify(id)},${JSON.stringify(reply)})`));
  }
  requestQishui(id: string, operation: string, payload: string): void {
    if (!/^qishui-\d+-\d+$/.test(id)) return;
    void this.qishui.request(operation, payload)
      .catch((): string => '{"ok":false,"error":{"code":"network","message":"汽水音乐连接失败，请重试"}}')
      .then((reply: string): Promise<string> =>
        this.run(`window.HarmonyQishui?.receive(${JSON.stringify(id)},${JSON.stringify(reply)})`));
  }
  private async fetchBackend(id: string, payload: string): Promise<void> {
    const request = http.createHttp();
    let reply: BackendResult = { status: 503, body: '', error: '' };
    try {
      const input = JSON.parse(payload) as BackendRequest;
      if (!this.config.server || !input.path.startsWith('/api/') || input.path.includes('..')) {
        throw new Error('请在“设置 → 集成 → 鸿蒙服务连接”中配置 FMusic 服务端地址');
      }
      const response = await request.request(`${this.config.server}${input.path}`, {
        method: input.method === 'POST' ? http.RequestMethod.POST : http.RequestMethod.GET,
        extraData: input.body || undefined, header: { 'Content-Type': 'application/json' },
        expectDataType: http.HttpDataType.ARRAY_BUFFER, readTimeout: 120000, connectTimeout: 15000,
        maxLimit: 16 * 1024 * 1024
      });
      reply = { status: response.responseCode,
        body: await new util.Base64Helper().encodeToString(new Uint8Array(response.result as ArrayBuffer)), error: '' };
    } catch (error) { reply.error = error instanceof Error ? error.message : '服务端请求失败'; }
    finally { request.destroy(); }
    await this.run(`window.HarmonyBackend?.receive(${JSON.stringify(id)},${JSON.stringify(JSON.stringify(reply))})`);
  }
  publish(payload: string): void {
    try {
      const next = JSON.parse(payload) as FoliaSnapshot;
      // Clock/navigation updates omit unchanged lists; native consumers still receive a complete snapshot.
      next.queue = next.queue ?? this.snapshot.queue;
      next.local = next.local ?? this.snapshot.local;
      next.results = next.results ?? this.snapshot.results;
      this.snapshot = next;
      this.onSnapshot(this.snapshot);
      void this.session.update(this.snapshot);
    } catch (_) { this.toast('播放器数据读取失败'); }
  }
  publishArtwork(songId: string, cover: string, source: string): void {
    void this.session.setArtwork(songId, cover, source);
  }
  toast(message: string): void {
    if (message.length > 0) promptAction.showToast({ message: message.slice(0, 150), duration: 2500 });
  }
  getApiConfig(): ApiConfig { return this.config; }
  async saveApi(config: ApiConfig): Promise<void> {
    for (const url of [config.netease, config.kugou, config.qq, config.server]) {
      if (url && !/^https?:\/\/[^\s]+$/i.test(url)) throw new Error('请输入以 https:// 或 http:// 开头的完整地址');
    }
    this.config = config;
    const prefs = preferences.getPreferencesSync(this.context, { name: 'folia_native' });
    prefs.putSync('api', JSON.stringify(config));
    await prefs.flush();
    // Provider transports cache their base; reload after persistence instead of mutating live requests.
    this.controller.refresh();
  }
  command(action: string, id: string = '', section: string = ''): void {
    const command: HostCommand = { action, id, section, query: '', source: '' };
    void this.run(`window.HarmonyApp?.command(${JSON.stringify(JSON.stringify(command))})`);
  }
  search(query: string, source: string): void {
    const command: HostCommand = { action: 'search', id: '', section: '', query, source };
    void this.run(`window.HarmonyApp?.command(${JSON.stringify(JSON.stringify(command))})`);
  }
  async importMusic(): Promise<void> {
    if (!this.snapshot.ready) { this.toast('播放器正在启动，请稍后导入'); return; }
    try {
      const files = await this.files.pick();
      if (files.length > 0) this.toast('正在读取音乐信息…');
      await this.run(`window.HarmonyApp?.importFiles(${JSON.stringify(JSON.stringify(this.files.list()))})`);
    } catch (_) {
      await this.run('window.HarmonyApp?.importFiles("[]")');
      this.toast('导入失败，请检查文件后重试');
    }
  }
  intercept(url: string, request?: WebResourceRequest): WebResourceResponse | undefined {
    const qishuiMedia = this.qishui.media.intercept(url, request);
    if (qishuiMedia) return qishuiMedia;
    const musicMedia = this.music.media.intercept(url, request);
    if (musicMedia) return musicMedia;
    const media = this.bodian.media.intercept(url, request);
    if (media) return media;
    if (url.startsWith('https://folia.local/native/cover/')) {
      const cover = this.covers.resource(url);
      if (cover) return cover;
    }
    if (!url.startsWith('https://folia.local/')) return undefined;
    if (url.startsWith('https://folia.local/native/')) return this.files.resource(url);
    const path = decodeURIComponent(url.slice('https://folia.local/'.length).split('?')[0]);
    if (path.includes('..') || path.includes('\\') || path.length === 0) return undefined;
    const response = new WebResourceResponse();
    let mime = 'application/octet-stream';
    if (path.endsWith('.html')) mime = 'text/html';
    else if (path.endsWith('.js')) mime = 'application/javascript';
    else if (path.endsWith('.css')) mime = 'text/css';
    else if (path.endsWith('.svg')) mime = 'image/svg+xml';
    else if (path.endsWith('.json')) mime = 'application/json';
    else if (path.endsWith('.png')) mime = 'image/png';
    else if (path.endsWith('.jpg')) mime = 'image/jpeg';
    else if (path.endsWith('.woff2')) mime = 'font/woff2';
    response.setResponseMimeType(mime);
    response.setResponseEncoding(path.endsWith('.bin') ? 'binary' : 'UTF-8');
    // Only Vite's fingerprinted assets are immutable across app updates; HTML/config must be reloaded.
    const immutable = /^assets\/([^/]+\/)*[^/]+-[A-Za-z0-9_-]{8,}\.[a-z0-9]+$/.test(path);
    response.setResponseHeader([{ headerKey: 'Access-Control-Allow-Origin', headerValue: '*' },
      { headerKey: 'Cache-Control', headerValue: immutable ? 'public, max-age=31536000, immutable' : 'no-store' }]);
    // Return immediately to ArkWeb while the resource manager reads the package asynchronously.
    response.setResponseIsReady(false);
    void this.context.resourceManager.getRawFileContent(`folia/${path}`).then((data: Uint8Array) => {
      response.setResponseData(data.buffer);
      response.setResponseCode(200);
      response.setReasonMessage('OK');
    }).catch(() => {
      response.setResponseData('');
      response.setResponseCode(404);
      response.setReasonMessage('Not Found');
      response.setResponseHeader([{ headerKey: 'Cache-Control', headerValue: 'no-store' }]);
    }).finally(() => response.setResponseIsReady(true));
    return response;
  }
  async run(code: string): Promise<string> {
    try { return await this.controller.runJavaScript(code); } catch (_) { return ''; }
  }
  release(): void { AppContinuation.detach(this.exportContinuation); this.files.release(); this.transfers.release(); this.bodian.release(); this.qishui.release(); this.music.release(); this.covers.release(); void this.session.release(); }
}
