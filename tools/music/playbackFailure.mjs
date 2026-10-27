// Keep native transport evidence intact for the shared playback-failure policy in ArkWeb.
const publicCodes = new Set(['auth-required', 'unsupported', 'unavailable', 'not-playable', 'preview-only',
  'region-restricted', 'network', 'invalid-response', 'timeout', 'rate-limited', 'service-unavailable',
  'membership-required', 'purchase-required', 'entitlement-required', 'taken-down']);

export function nativeMusicError(error) {
  const message = String(error?.message || 'Music request failed').replace(/https?:\/\/\S+/g, '[platform request]').slice(0, 240);
  const code = publicCodes.has(error?.code) ? error.code : /timeout|timed out|ETIMEDOUT/i.test(message) ? 'timeout' : 'network';
  return { code, message, ...(Number.isInteger(error?.httpStatus) ? { httpStatus: error.httpStatus } : {}),
    ...(Number.isFinite(error?.retryAfterMs) ? { retryAfterMs: error.retryAfterMs } : {}),
    details: { stage: 'upstream', ...(Number.isFinite(error?.upstreamCode) ? { upstreamCode: error.upstreamCode } : {}) } };
}

/** A failed HTTP request must not be reinterpreted as a successful but empty catalogue/audio result. */
export const checkedNativeRequest = request => async payload => {
  const reply = await request(payload);
  const data = JSON.parse(reply);
  if (data.status === 429 || data.status === 408 || data.status >= 500) {
    const retry = data.headers?.find(header => header.name.toLowerCase() === 'retry-after')?.value;
    const seconds = Number(retry);
    throw Object.assign(new Error(`Music upstream HTTP ${data.status}`), {
      code: data.status === 429 ? 'rate-limited' : data.status === 408 || data.status === 504 ? 'timeout' : 'service-unavailable',
      httpStatus: data.status,
      ...(Number.isFinite(seconds) && seconds > 0 ? { retryAfterMs: seconds * 1000 } : {}),
    });
  }
  return reply;
};

/** QQ's legacy bridge has real codes/text, but its generic copyright category proves no particular cause. */
export function withQqPlaybackEvidence(result) {
  for (const entry of Object.values(result?.data?.playUrl || {})) {
    if (!entry || entry.url) continue;
    const raw = String(entry.rawMessage || entry.restriction?.rawMessage || '');
    const code = Number(entry.qqCode ?? entry.restriction?.code);
    const key = /region|地区|地域|territory/i.test(raw) ? 'playback.maybe-region-restricted'
      : /vip|会员|付费|购买|purchase|pay/i.test(raw) ? 'playback.maybe-membership' : undefined;
    entry.restriction = {
      codes: Number.isSafeInteger(code) && code !== 0 ? { result: code } : {},
      ...(key ? { hint: { key } } : {}),
    };
  }
  return result;
}
