import { Buffer } from '../../upstream/folia-major/node_modules/buffer/index.js';

// Node's protocol-facing crypto subset, backed only by the native CryptoArchitectureKit.
let native;
export const installNativeCrypto = callback => { native = callback; };
const call = payload => JSON.parse(native(JSON.stringify(payload)));
const encode = value => Buffer.from(value).toString('base64');
const wrapKey = (data, privateKey) => ({
  data, asymmetricKeyType: 'ec', asymmetricKeyDetails: { namedCurve: 'prime256v1' },
  export({ format, type }) {
    if (type !== (privateKey ? 'pkcs8' : 'spki')) throw new Error('Unsupported key format');
    const bytes = Buffer.from(data, 'base64');
    if (format === 'der') return bytes;
    if (format !== 'pem') throw new Error('Unsupported key encoding');
    const label = privateKey ? 'PRIVATE KEY' : 'PUBLIC KEY';
    return `-----BEGIN ${label}-----\n${data.match(/.{1,64}/g).join('\n')}\n-----END ${label}-----\n`;
  },
});
export const randomBytes = length => Buffer.from(call({ operation: 'random', length }).data, 'base64');
export const randomUUID = () => {
  const bytes = randomBytes(16); bytes[6] = (bytes[6] & 15) | 64; bytes[8] = (bytes[8] & 63) | 128;
  const hex = bytes.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};
export const generateKeyPairSync = (kind, options) => {
  if (kind !== 'ec' || options.namedCurve !== 'prime256v1') throw new Error('Unsupported key type');
  const pair = call({ operation: 'keypair' });
  return { privateKey: wrapKey(pair.privateKey, true), publicKey: wrapKey(pair.publicKey, false) };
};
export const createPrivateKey = pem => {
  const match = /^-----BEGIN PRIVATE KEY-----\s+([A-Za-z0-9+/=\s]+)-----END PRIVATE KEY-----\s*$/.exec(pem);
  if (!match) throw new Error('Invalid private key');
  return wrapKey(match[1].replace(/\s/g, ''), true);
};
export const sign = (algorithm, data, key) => {
  if (algorithm !== 'sha256') throw new Error('Unsupported signature');
  return Buffer.from(call({ operation: 'sign', data: encode(data), key: key.data }).data, 'base64');
};
export const createHash = algorithm => {
  if (algorithm !== 'md5') throw new Error('Unsupported hash');
  const chunks = [];
  const hash = { update(value) { chunks.push(Buffer.from(value)); return hash; },
    digest(encoding) {
      const bytes = Buffer.from(call({ operation: 'hash', data: encode(Buffer.concat(chunks)) }).data, 'base64');
      return encoding ? bytes.toString(encoding) : bytes;
    } };
  return hash;
};
