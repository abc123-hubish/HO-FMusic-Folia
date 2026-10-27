import { cryptoFramework } from '@kit.CryptoArchitectureKit';
import { util } from '@kit.ArkTS';

// Native entropy, P-256 key generation and ECDSA signatures for user-authorized ticket guards.
interface CryptoRequest { operation: string; length?: number; data?: string; key?: string; }
interface CryptoResult { data?: string; privateKey?: string; publicKey?: string; }
export class QishuiCrypto {
  private readonly base64: util.Base64Helper = new util.Base64Helper();
  run(payload: string): string {
    if (payload.length > 65536) throw new Error('Invalid crypto request');
    const input = JSON.parse(payload) as CryptoRequest;
    let result: CryptoResult;
    if (input.operation === 'random') {
      const length = input.length || 0;
      if (!Number.isInteger(length) || length < 1 || length > 64) throw new Error('Invalid random size');
      result = { data: this.base64.encodeToStringSync(cryptoFramework.createRandom().generateRandomSync(length).data) };
    } else if (input.operation === 'keypair') {
      const pair = cryptoFramework.createAsyKeyGenerator('ECC256').generateKeyPairSync();
      result = { privateKey: this.base64.encodeToStringSync(pair.priKey.getEncoded().data),
        publicKey: this.base64.encodeToStringSync(pair.pubKey.getEncoded().data) };
    } else if (input.operation === 'sign') {
      const key = this.base64.decodeSync(input.key || '');
      const pair = cryptoFramework.createAsyKeyGenerator('ECC256').convertKeySync(null, { data: key });
      const signer = cryptoFramework.createSign('ECC256|SHA256');
      signer.initSync(pair.priKey);
      result = { data: this.base64.encodeToStringSync(signer.signSync({ data: this.base64.decodeSync(input.data || '') }).data) };
    } else if (input.operation === 'hash') {
      const digest = cryptoFramework.createMd('MD5');
      digest.updateSync({ data: this.base64.decodeSync(input.data || '') });
      result = { data: this.base64.encodeToStringSync(digest.digestSync().data) };
    } else throw new Error('Unsupported crypto operation');
    return JSON.stringify(result);
  }
}
