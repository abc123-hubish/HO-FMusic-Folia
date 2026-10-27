import { qqMusicRequest, buildQQAuthComm } from './upstream/api/qq.js';
import { qqCookieUin } from './upstream/api/cookies.js';
import { QqApiError, normalizeQqFailure, toNewRouteErrorResponse } from './explore333/protocol/errors.js';

// Run pinned 3.3.3 read descriptors on the existing native cookie/network host.
// Only fixed Explore operations reach this module; no module/method comes from ArkWeb.
export const credentialMusicId = credential => qqCookieUin(credential);
export const okResult = body => ({ status: 200, headers: {}, body: { code: 200, ...body } });
export const failureResult = (_phase, error) => toNewRouteErrorResponse(error);
export const diagnose = () => {};

/** Preserve the official gateway/business-code and decoder boundary with native credentials. */
export const createSessionMusicuClient = (session, options = {}) => ({
  async execute(request) {
    const [answer] = await this.executeBatch([request]);
    if (!answer.ok) throw answer.error;
    return answer.data;
  },
  async executeBatch(requests) {
    if (requests.some(request => request.readOnly !== true)) throw new QqApiError('input');
    const cookie = session?.credential || '';
    const result = await qqMusicRequest({
      comm: cookie ? buildQQAuthComm(cookie) : { ct: 24, cv: 0, ...(options.anonymousUin === 0 ? { uin: 0 } : {}) },
      ...Object.fromEntries(requests.map((request, index) => [
        `req_${index}`, { module: request.module, method: request.method, param: request.param },
      ])),
    }, cookie);
    if (!result || !Number.isSafeInteger(result.code)) throw new QqApiError('invalid-response');
    if (result.code !== 0) throw normalizeQqFailure({ source: 'gateway', upstreamGlobalCode: result.code });
    return requests.map((request, index) => {
      try {
        const block = result[`req_${index}`];
        if (!block || !Number.isSafeInteger(block.code)
          || (block.subcode !== undefined && !Number.isSafeInteger(block.subcode))) throw new QqApiError('invalid-response');
        if (block.code !== 0 && !request.allowedCodes?.includes(block.code)) {
          throw normalizeQqFailure({ source: 'business', upstreamCode: block.code,
            upstreamGlobalCode: result.code, upstreamSubCode: block.subcode }, { operation: request.operation });
        }
        if (!Object.hasOwn(block, 'data') || (block.subcode !== undefined && block.subcode !== 0)) {
          throw new QqApiError('invalid-response');
        }
        return { ok: true, data: request.decode ? request.decode(block.data) : block.data };
      } catch (error) { return { ok: false, error }; }
    });
  },
});
