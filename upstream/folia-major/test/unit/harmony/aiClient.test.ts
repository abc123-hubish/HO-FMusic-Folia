import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_HARMONY_AI, getHarmonyAiConfig, saveHarmonyAiConfig } from '../../../src/harmony/aiConfig';
import { generateHarmonyAiTheme, normalizeHarmonyAiUrl, segmentHarmonyLyrics, testHarmonyAiConnection } from '../../../src/harmony/aiClient';
import { generateThemeFromLyrics } from '../../../src/services/gemini';
import { resetOpenAICompatibleCapabilities } from '../../../shared/openAICompatibleRequest.mjs';
import { THEME_GENERATION_PROMPT_PREFIX, buildThemeSourcePrompt } from '../../../src/utils/aiThemePrompts';
import { buildSegmentationSourcePrompt, buildSegmentationSystemPrompt } from '../../../shared/lyricSegmentationPrompt.mjs';

// Verify provider requests cross the native bridge, without contacting a real AI service or the old backend.
let saved = { ...DEFAULT_HARMONY_AI, enabled: true, apiUrl: 'https://relay.example/v1', model: 'my-model', apiKey: 'sk-private' };
let requests: { url: string; headers: Record<string, string>; body: any }[];
let respond: (body: any) => { status: number; body: string; contentType?: string };
const themePart = { name: '主题', backgroundColor: '#ffffff', primaryColor: '#111111', secondaryColor: '#333333',
  accentColor: '#3366aa', wordColors: [], lyricsIcons: ['Cloud'] };
beforeEach(() => {
  resetOpenAICompatibleCapabilities(); requests = [];
  saved = { ...DEFAULT_HARMONY_AI, enabled: true, apiUrl: 'https://relay.example/v1', model: 'my-model', apiKey: 'sk-private' };
  respond = () => ({ status: 200, body: JSON.stringify({ model: 'actual-model', choices: [{ message: { content: 'hello' } }] }) });
  vi.stubGlobal('localStorage', { getItem: () => null });
  vi.stubGlobal('window', { setTimeout, localStorage: { getItem: () => null }, dispatchEvent: vi.fn(), FoliaNative: {
    getAiConfig: () => JSON.stringify(saved), saveAiConfig: (payload: string) => { saved = JSON.parse(payload); return ''; },
    requestAi: (id: string, payload: string) => {
      const request = JSON.parse(payload); request.body = JSON.parse(request.body); requests.push(request);
      queueMicrotask(() => (window as any).HarmonyAi.receive(id, JSON.stringify({ error: '', ...respond(request.body) })));
    },
  } });
});
afterEach(() => vi.unstubAllGlobals());
describe('HarmonyOS AI connection', () => {
  it('tests unsaved model, endpoint and key without changing saved configuration', async () => {
    const result = await testHarmonyAiConnection({ provider: 'openai', apiUrl: 'https://other.example/api/v1/', model: 'draft-model', apiKey: 'draft-key' });
    expect(result).toMatchObject({ ok: true, model: 'actual-model', text: 'hello', status: 200 });
    expect(requests[0]).toMatchObject({ url: 'https://other.example/api/v1/chat/completions', headers: { authorization: 'Bearer draft-key' },
      body: { model: 'draft-model', messages: [{ role: 'user', content: 'hello' }] } });
    expect(getHarmonyAiConfig().model).toBe('my-model');
  });
  it('uses saved native settings to generate light and dark themes without a FMusic backend', async () => {
    respond = () => ({ status: 200, body: JSON.stringify({ choices: [{ message: { content: JSON.stringify({ light: themePart, dark: { ...themePart, backgroundColor: '#111111' } }) } }] }) });
    saveHarmonyAiConfig({ ...saved, model: 'saved-model', temperature: '1.1' });
    const result = await generateThemeFromLyrics('歌词内容');
    expect(requests[0].body).toMatchObject({ model: 'saved-model', temperature: 1.1 });
    expect(requests[0].body.messages[1].content).toContain('歌词内容');
    expect(result.light.name).toBe('主题'); expect(result.dark.provider).toBe('OpenAI Compatible (Local)');
    expect(window.dispatchEvent).toHaveBeenCalled();
  });
  it('uses a configured Gemini model and key directly', async () => {
    respond = () => ({ status: 200, body: JSON.stringify({ modelVersion: 'gemini-custom', candidates: [{ content: { parts: [{ thought: true, text: 'hidden' }, { text: 'hello' }] } }] }) });
    const result = await testHarmonyAiConnection({ provider: 'gemini', model: 'gemini-custom', apiKey: 'google-key' });
    expect(result).toMatchObject({ ok: true, model: 'gemini-custom', text: 'hello' });
    expect(requests[0]).toMatchObject({ url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-custom:generateContent', headers: { 'x-goog-api-key': 'google-key' } });
  });
  it('automatically sends the same full song prompt used by manual JSON import', async () => {
    respond = () => ({ status: 200, body: JSON.stringify({ choices: [{ message: { content: JSON.stringify({ light: themePart, dark: themePart }) } }] }) });
    const lyrics = '完整歌词'.repeat(700) + '最后一句';
    const result = await generateHarmonyAiTheme(lyrics, { songTitle: '歌名', isPureMusic: false });
    expect(requests[0].body.messages).toEqual([
      { role: 'system', content: THEME_GENERATION_PROMPT_PREFIX },
      { role: 'user', content: buildThemeSourcePrompt(lyrics, false, '歌名') },
    ]);
    expect(result.dark.lyricsIcons).toContain('Cloud');
  });
  it('uses the saved AI theme endpoint and model for lyric segmentation', async () => {
    respond = () => ({ status: 200, body: JSON.stringify({ choices: [{ message: { content: JSON.stringify({
      lines: [['我', '想要'], ['Hello ', 'world']],
    }) } }] }) });
    const lines = ['我想要', 'Hello world'];
    const result = await segmentHarmonyLyrics(lines);
    expect(requests).toHaveLength(1);
    expect(requests[0]).toMatchObject({ url: 'https://relay.example/v1/chat/completions', headers: { authorization: 'Bearer sk-private' },
      body: { model: 'my-model', messages: [
        { role: 'system', content: buildSegmentationSystemPrompt() },
        { role: 'user', content: buildSegmentationSourcePrompt(lines) },
      ], reasoning_effort: 'none' } });
    expect(result).toEqual([['我', '想要'], ['Hello ', 'world']]);
  });
  it.each(['openai', 'gemini'] as const)('runs manual %s segmentation with saved credentials when AI themes are disabled', async provider => {
    saved = { ...saved, enabled: false, provider, geminiApiKey: 'google-key', geminiModel: 'gemini-custom' };
    respond = () => ({ status: 200, body: JSON.stringify(provider === 'gemini'
      ? { candidates: [{ content: { parts: [{ text: '{"lines":[["我","想要"]]}' }] } }] }
      : { choices: [{ message: { content: '{"lines":[["我","想要"]]}' } }] }) });
    await expect(segmentHarmonyLyrics(['我想要'])).resolves.toEqual([['我', '想要']]);
    expect(requests).toHaveLength(1);
    expect(requests[0].headers).toMatchObject(provider === 'gemini'
      ? { 'x-goog-api-key': 'google-key' } : { authorization: 'Bearer sk-private' });
    expect(getHarmonyAiConfig().enabled).toBe(false);
  });
  it('still rejects manual segmentation without saved credentials before sending a request', async () => {
    saved = { ...saved, enabled: false, apiKey: '' };
    await expect(segmentHarmonyLyrics(['我想要'])).rejects.toThrow('AI API Key is not configured');
    expect(requests).toHaveLength(0);
  });
  it('reads SSE replies from endpoints requiring streaming', async () => {
    respond = () => ({ status: 200, contentType: 'text/event-stream', body: 'data: {"choices":[{"delta":{"content":"hel"}}]}\n\ndata: {"choices":[{"delta":{"content":"lo"}}]}\n\ndata: [DONE]\n\n' });
    const result = await testHarmonyAiConnection({ provider: 'openai', apiUrl: saved.apiUrl, model: saved.model, apiKey: saved.apiKey, stream: true });
    expect(result.text).toBe('hello'); expect(requests[0].body.stream).toBe(true);
  });
  it('negotiates a rejected JSON format before generating a theme', async () => {
    respond = body => body.response_format ? { status: 400, body: '{"error":{"param":"response_format","message":"Unsupported parameter"}}' }
      : { status: 200, body: JSON.stringify({ choices: [{ message: { content: JSON.stringify({ light: themePart, dark: themePart }) } }] }) };
    await generateHarmonyAiTheme('song');
    expect(requests).toHaveLength(2); expect(requests[1].body.response_format).toBeUndefined();
  });
  it('does not fall back to the old FMusic backend when direct AI is disabled', async () => {
    saved.enabled = false;
    const fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
    await expect(generateThemeFromLyrics('song')).rejects.toThrow('AI API Key is not configured');
    expect(requests).toHaveLength(0); expect(fetch).not.toHaveBeenCalled();
  });
  it('reports invalid input without sending a request and redacts keys in service errors', async () => {
    const missing = await testHarmonyAiConnection({ provider: 'openai', apiUrl: saved.apiUrl, model: '', apiKey: '' });
    expect(missing.ok).toBe(false); expect(requests).toHaveLength(0);
    respond = () => ({ status: 401, body: '{"error":{"message":"Rejected sk-private"}}' });
    const denied = await testHarmonyAiConnection({ provider: 'openai', apiUrl: saved.apiUrl, model: saved.model, apiKey: saved.apiKey });
    expect(denied.error).toContain('401'); expect(denied.error).not.toContain(saved.apiKey);
    expect(denied).toMatchObject({ status: 401, errorKind: 'http' });
  });
  it('rejects an incomplete theme and normalizes base and full completion URLs', async () => {
    respond = () => ({ status: 200, body: '{"choices":[{"message":{"content":"{\\"foo\\":1}"}}]}' });
    await expect(generateHarmonyAiTheme('song')).rejects.toThrow('Invalid AI theme JSON');
    expect(normalizeHarmonyAiUrl('https://relay.example')).toBe('https://relay.example/v1/chat/completions');
    expect(normalizeHarmonyAiUrl('https://relay.example/api/v1')).toBe('https://relay.example/api/v1/chat/completions');
    expect(normalizeHarmonyAiUrl('https://relay.example/v1/chat/completions')).toBe('https://relay.example/v1/chat/completions');
    expect(() => normalizeHarmonyAiUrl('file:///local')).toThrow();
  });
});
