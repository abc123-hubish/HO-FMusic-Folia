import { common } from '@kit.AbilityKit';
import { preferences } from '@kit.ArkData';
import { http } from '@kit.NetworkKit';

// AI credentials are kept in app-private preferences, separate from service URLs and Web snapshots.
export class HarmonyAiConfig {
  enabled: boolean = false;
  provider: string = 'openai';
  apiUrl: string = '';
  model: string = '';
  apiKey: string = '';
  geminiModel: string = 'gemini-3-flash-preview';
  geminiApiKey: string = '';
  temperature: string = '0.7';
  stream: boolean = false;
}
interface AiHttpRequest { url: string; body: string; headers: Record<string, string>; timeoutMs: number; }
interface AiHttpResponse { status: number; body: string; contentType: string; error: string; }

export class HarmonyAiService {
  private readonly prefs: preferences.Preferences;
  private config: HarmonyAiConfig = new HarmonyAiConfig();
  constructor(context: common.UIAbilityContext) {
    this.prefs = preferences.getPreferencesSync(context, { name: 'folia_ai' });
    try {
      const saved = JSON.parse(this.prefs.getSync('config', '{}') as string) as HarmonyAiConfig;
      this.config.enabled = saved.enabled === true;
      this.config.provider = saved.provider === 'gemini' ? 'gemini' : 'openai';
      this.config.apiUrl = saved.apiUrl || '';
      this.config.model = saved.model || '';
      this.config.apiKey = saved.apiKey || '';
      this.config.geminiModel = saved.geminiModel || 'gemini-3-flash-preview';
      this.config.geminiApiKey = saved.geminiApiKey || '';
      this.config.temperature = saved.temperature || '0.7';
      this.config.stream = saved.stream === true;
    } catch (_) {}
  }
  getConfig(): string { return JSON.stringify(this.config); }
  saveConfig(payload: string): string {
    try {
      const config = JSON.parse(payload) as HarmonyAiConfig;
      if (config.provider !== 'openai' && config.provider !== 'gemini') return 'AI 服务类型无效';
      if (config.enabled && config.provider === 'openai' && !this.validUrl(config.apiUrl)) return '请输入完整的 AI 接口地址';
      if (config.enabled && !(config.provider === 'openai' ? config.apiKey : config.geminiApiKey)?.trim()) return '请填写 AI 密钥';
      if (config.enabled && !(config.provider === 'openai' ? config.model : config.geminiModel)?.trim()) return '请填写模型名称';
      const temperature = Number(config.temperature);
      if (!Number.isFinite(temperature) || temperature < 0 || temperature > 2) return '温度必须在 0–2 之间';
      this.prefs.putSync('config', JSON.stringify(config));
      this.prefs.flushSync();
      this.config = config;
      return '';
    } catch (_) { return 'AI 配置保存失败，请重试'; }
  }
  private validUrl(url: string): boolean {
    return /^https?:\/\/[^\s/#?@]+(?::\d+)?(?:[/?][^\s#]*)?$/i.test(url);
  }
  // The dedicated bridge only sends POST JSON requests; response bodies also cover SSE-only providers.
  async request(payload: string): Promise<string> {
    const request = http.createHttp();
    let result: AiHttpResponse = { status: 0, body: '', contentType: '', error: '' };
    try {
      const input = JSON.parse(payload) as AiHttpRequest;
      if (!this.validUrl(input.url)) throw new Error('AI 接口地址无效');
      const response = await request.request(input.url, {
        method: http.RequestMethod.POST, extraData: input.body,
        header: input.headers, expectDataType: http.HttpDataType.STRING,
        readTimeout: Math.min(Math.max(input.timeoutMs || 120000, 1000), 120000),
        connectTimeout: 15000, maxLimit: 16 * 1024 * 1024
      });
      const headers = response.header as Record<string, string>;
      result = { status: response.responseCode, body: String(response.result),
        contentType: headers['content-type'] || headers['Content-Type'] || 'application/json', error: '' };
    } catch (error) {
      // Avoid reflecting headers or credentials from native error objects into the Web UI.
      result.error = 'AI 网络请求失败，请检查接口地址、网络连接或超时';
    } finally { request.destroy(); }
    return JSON.stringify(result);
  }
}
