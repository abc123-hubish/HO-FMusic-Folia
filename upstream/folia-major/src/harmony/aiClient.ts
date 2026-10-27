import type { DualTheme } from '../types';
import { THEME_GENERATION_PROMPT_PREFIX, buildThemeSourcePrompt, parseAiThemeJsonInput } from '../utils/aiThemePrompts';
import { sanitizeDualTheme } from '../services/themeSanitizer';
import { applyStoredAnimationIntensityToDualTheme } from '../services/themePreferences';
import {
  detectOpenAICompatibleProvider,
  rejectsOpenAICompatibleParameter,
  sendOpenAICompatibleRequest,
} from '../../shared/openAICompatibleRequest.mjs';
import {
  REASONING_SUPPRESSION_ATTEMPTS,
  SEGMENTATION_GEMINI_GENERATION_CONFIG,
  SEGMENTATION_JSON_SCHEMA,
  SEGMENTATION_MAX_OUTPUT_TOKENS,
  SEGMENTATION_SCHEMA_NAME,
  buildSegmentationSourcePrompt,
  buildSegmentationSystemPrompt,
  parseSegmentationResponse,
} from '../../shared/lyricSegmentationPrompt.mjs';
import { getHarmonyAiConfig, hasHarmonyAi, type HarmonyAiConfig } from './aiConfig';
import { HarmonyAiHttpError, readHarmonyAiResponse } from './aiResponse';

// Dedicated native HTTP transport: AI keys and prompts are sent only to the selected AI endpoint.
let sequence = 0;
const pending = new Map<string, { resolve(response: Response): void; reject(error: Error): void }>();
export function normalizeHarmonyAiUrl(raw: string): string {
  const url = new URL(raw.trim());
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.hash) throw new Error('Invalid AI API URL');
  const path = url.pathname.replace(/\/+$/, '');
  if (!path) url.pathname = '/v1/chat/completions';
  else if (/\/v\d+$/.test(path)) url.pathname = `${path}/chat/completions`;
  else if (!path.endsWith('/chat/completions')) url.pathname = `${path}/chat/completions`;
  else url.pathname = path;
  return url.toString();
}
function nativeFetch(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  if (!hasHarmonyAi()) return Promise.reject(new Error('Native AI requests are unavailable'));
  window.HarmonyAi = { receive(id, payload) {
    const request = pending.get(id);
    if (!request) return;
    try {
      const result = JSON.parse(payload);
      if (result.error) throw new Error(result.error);
      request.resolve(new Response(result.body, { status: result.status, headers: { 'Content-Type': result.contentType } }));
    } catch (error) { request.reject(error instanceof Error ? error : new Error(String(error))); }
  } };
  return new Promise((resolve, reject) => {
    const id = `ai-${++sequence}`;
    const finish = () => { pending.delete(id); clearTimeout(timer); init.signal?.removeEventListener('abort', abort); };
    const abort = () => { finish(); reject(new Error('AI request timed out or was cancelled')); };
    const timer = window.setTimeout(abort, timeoutMs + 1000);
    pending.set(id, { resolve(response) { finish(); resolve(response); }, reject(error) { finish(); reject(error); } });
    if (init.signal?.aborted) { abort(); return; }
    init.signal?.addEventListener('abort', abort, { once: true });
    try {
      window.FoliaNative!.requestAi!(id, JSON.stringify({ url, headers: Object.fromEntries(new Headers(init.headers)), body: init.body, timeoutMs }));
    } catch (error) { finish(); reject(error); }
  });
}
function validate(config: HarmonyAiConfig) {
  const apiKey = (config.provider === 'gemini' ? config.geminiApiKey : config.apiKey).trim();
  const model = (config.provider === 'gemini' ? config.geminiModel : config.model).trim();
  if (!apiKey) throw new Error('AI API Key is not configured in settings');
  if (!model) throw new Error('Please configure the AI model');
  return { apiKey, model };
}
type HarmonyAiRequestMode = 'theme' | 'segmentation' | 'test';
interface HarmonyAiRequestOptions { mode?: HarmonyAiRequestMode; signal?: AbortSignal; }

// Sends every HarmonyOS AI feature through the same saved connection; segmentation adds its
// stricter JSON schema and walks the portable no-reasoning request shapes before parsing results.
async function complete(config: HarmonyAiConfig, systemPrompt: string | null, sourcePrompt: string, timeoutMs: number,
  { mode = systemPrompt === null ? 'test' : 'theme', signal }: HarmonyAiRequestOptions = {}) {
  const { apiKey, model } = validate(config);
  const generation = mode !== 'test';
  const segmentation = mode === 'segmentation';
  const maxTokens = segmentation ? SEGMENTATION_MAX_OUTPUT_TOKENS : generation ? 8192 : 512;
  let response: Response;
  if (config.provider === 'gemini') {
    response = await nativeFetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({ contents: [{ parts: [{ text: sourcePrompt }] }],
        ...(systemPrompt !== null ? { systemInstruction: { parts: [{ text: systemPrompt }] } } : {}),
        generationConfig: segmentation
          ? { ...SEGMENTATION_GEMINI_GENERATION_CONFIG, temperature: Number(config.temperature) }
          : { maxOutputTokens: maxTokens, ...(generation ? { responseMimeType: 'application/json', temperature: Number(config.temperature) } : {}) } }),
      signal,
    }, timeoutMs);
  } else {
    const apiUrl = normalizeHarmonyAiUrl(config.apiUrl);
    const provider = detectOpenAICompatibleProvider(apiUrl);
    const attempts = segmentation ? REASONING_SUPPRESSION_ATTEMPTS : [{ params: {} }];
    let finalResponse: Response | null = null;
    for (let index = 0; index < attempts.length; index += 1) {
      const { params } = attempts[index]!;
      const isLastAttempt = index === attempts.length - 1;
      const budget = segmentation && isLastAttempt ? maxTokens * 4 : maxTokens;
      const reasoningParams = segmentation && provider === 'deepseek'
        ? { thinking: { type: 'disabled' }, ...params }
        : params;
      const responseFormat = segmentation && provider === 'openai'
        ? { type: 'json_schema', json_schema: { name: SEGMENTATION_SCHEMA_NAME, strict: true, schema: SEGMENTATION_JSON_SCHEMA } }
        : { type: 'json_object' };
      const body = { model, messages: [...(systemPrompt !== null ? [{ role: 'system', content: systemPrompt }] : []), { role: 'user', content: sourcePrompt }],
        ...(provider === 'openai' ? { max_completion_tokens: budget } : { max_tokens: budget }),
        ...(generation ? { temperature: Number(config.temperature), response_format: responseFormat } : {}),
        ...reasoningParams, ...(config.stream ? { stream: true } : {}) };
      response = await sendOpenAICompatibleRequest({ apiUrl, provider, body,
        init: { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` }, signal },
        fetchImpl: (input, init) => nativeFetch(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url, init || {}, timeoutMs) });
      finalResponse = response;
      if (!segmentation || response.ok || isLastAttempt) break;
      const errorText = await response.clone().text();
      if (!Object.keys(params).some(parameter => rejectsOpenAICompatibleParameter(response.status, errorText, parameter))) break;
    }
    response = finalResponse!;
  }
  const result = await readHarmonyAiResponse(response).catch(error => {
    if (error instanceof Error) {
      error.message = error.message.replaceAll(apiKey, '[redacted]');
      error.stack = error.stack?.replaceAll(apiKey, '[redacted]');
      throw error;
    }
    throw new Error(String(error).replaceAll(apiKey, '[redacted]'));
  });
  return { ...result, model: result.model || model, status: response.status };
}
export async function generateHarmonyAiTheme(lyrics: string, options?: { isPureMusic?: boolean; songTitle?: string }): Promise<DualTheme> {
  const config = getHarmonyAiConfig();
  const result = await complete(config, THEME_GENERATION_PROMPT_PREFIX,
    buildThemeSourcePrompt(lyrics, options?.isPureMusic === true, options?.songTitle), 120000);
  if (result.truncated) throw new Error('AI theme response exceeded the output token limit');
  const theme = sanitizeDualTheme(parseAiThemeJsonInput(result.text) as DualTheme);
  theme.light.provider = theme.dark.provider = config.provider === 'gemini' ? 'Google Gemini (Local)' : 'OpenAI Compatible (Local)';
  return applyStoredAnimationIntensityToDualTheme(theme);
}
export async function segmentHarmonyLyrics(lines: string[], signal?: AbortSignal): Promise<(string[] | null)[]> {
  const config = getHarmonyAiConfig();
  // A manual segmentation uses the saved connection even when automatic AI themes are disabled.
  // complete() validates the selected provider's credentials before sending any request.
  const result = await complete(config, buildSegmentationSystemPrompt(), buildSegmentationSourcePrompt(lines), 120000,
    { mode: 'segmentation', signal });
  if (result.truncated) throw new Error('AI segmentation response exceeded the output token limit');
  return parseSegmentationResponse(result.text, lines).boundaries;
}
export async function testHarmonyAiConnection(payload: AiConnectionTestPayload): Promise<AiConnectionTestResult> {
  const start = Date.now();
  const config = { ...getHarmonyAiConfig(), provider: payload.provider, apiUrl: payload.apiUrl || '', model: payload.model || '',
    apiKey: payload.apiKey, geminiApiKey: payload.apiKey, geminiModel: payload.model || 'gemini-3-flash-preview', stream: payload.stream === true };
  try {
    const result = await complete(config, null, 'hello', 30000);
    return { ok: true, durationMs: Date.now() - start, status: result.status, model: result.model,
      text: result.text.slice(0, 500), ...(!result.text.trim() ? { emptyReason: 'empty' as const } : {}) };
  } catch (error) {
    const message = (error instanceof Error ? error.message : String(error)).replaceAll(payload.apiKey || '\u0000', '[redacted]');
    return { ok: false, durationMs: Date.now() - start, error: message.slice(0, 500),
      ...(error instanceof HarmonyAiHttpError ? { status: error.status } : {}),
      errorKind: error instanceof HarmonyAiHttpError ? 'http' : /timed out/.test(message) ? 'timeout'
        : /API Key/.test(message) ? 'config' : /Invalid|configure|Invalid URL/.test(message) ? 'invalid' : 'network' };
  }
}
