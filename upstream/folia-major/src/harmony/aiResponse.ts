// Parse normal JSON and buffered SSE through the same path for connection tests and generated themes.
type AiPart = { text?: string; thought?: boolean; type?: string };
type AiPayload = {
  model?: string; modelVersion?: string; error?: { message?: string } | string;
  choices?: { message?: { content?: string | AiPart[] }; delta?: { content?: string | AiPart[] }; finish_reason?: string }[];
  candidates?: { content?: { parts?: AiPart[] }; finishReason?: string }[];
};
export class HarmonyAiHttpError extends Error {
  constructor(readonly status: number, detail: string) { super(`AI API error (${status}): ${detail}`); }
}
const contentText = (value: string | AiPart[] | undefined) => typeof value === 'string'
  ? value : value?.map(part => part.text || '').join('') || '';
const extract = (data: AiPayload) => {
  if (data.error) throw new Error(typeof data.error === 'string' ? data.error : data.error.message || 'AI service error');
  const choice = data.choices?.[0];
  const candidate = data.candidates?.[0];
  return {
    text: contentText(choice?.message?.content ?? choice?.delta?.content)
      || candidate?.content?.parts?.filter(part => !part.thought).map(part => part.text || '').join('') || '',
    model: data.model || data.modelVersion,
    truncated: choice?.finish_reason === 'length' || candidate?.finishReason === 'MAX_TOKENS',
  };
};
export async function readHarmonyAiResponse(response: Response) {
  const raw = await response.text();
  if (!response.ok) {
    let detail = raw.slice(0, 500);
    try { const data = JSON.parse(raw) as AiPayload; detail = typeof data.error === 'string' ? data.error : data.error?.message || detail; } catch {}
    throw new HarmonyAiHttpError(response.status, detail);
  }
  if (!raw.trim()) throw new Error('AI service returned an empty response');
  if (!/^\s*(?:data:|:|event:)/.test(raw)) return extract(JSON.parse(raw));
  let text = ''; let model: string | undefined; let truncated = false;
  for (const frame of raw.split(/\r?\n\r?\n/)) {
    const data = frame.split(/\r?\n/).filter(line => line.startsWith('data:')).map(line => line.slice(5).trimStart()).join('\n');
    if (!data || data.trim() === '[DONE]') continue;
    const result = extract(JSON.parse(data));
    text += result.text; model = result.model || model; truncated ||= result.truncated;
  }
  return { text, model, truncated };
}
