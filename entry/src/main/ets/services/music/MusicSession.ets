import { asset } from '@kit.AssetStoreKit';
import { util } from '@kit.ArkTS';

// Chunked Asset Store snapshots keep protocol state encrypted, with an atomic manifest switch.
interface SessionManifest { slot: number; count: number; }
export class MusicSession {
  private current: string = '';
  private manifest: SessionManifest = { slot: 0, count: 0 };
  private readonly prefix: string;
  constructor(provider: string) {
    this.prefix = `FOLIA_MUSIC_${provider.toUpperCase()}_V1`;
    try {
      this.manifest = JSON.parse(this.load('head')) as SessionManifest;
      if (![0, 1].includes(this.manifest.slot) || this.manifest.count < 1 || this.manifest.count > 128) {
        throw new Error('Invalid session manifest');
      }
      let value = '';
      for (let i = 0; i < this.manifest.count; i++) value += this.load(`${this.manifest.slot}_${i}`);
      value = new util.TextDecoder('utf-8', { fatal: true }).decodeToString(new util.Base64Helper().decodeSync(value));
      JSON.parse(value);
      this.current = value;
    } catch (_) { this.manifest = { slot: 0, count: 0 }; }
  }
  private query(name: string): asset.AssetMap {
    const query: asset.AssetMap = new Map();
    query.set(asset.Tag.ALIAS, new util.TextEncoder().encodeInto(`${this.prefix}_${name}`));
    return query;
  }
  private load(name: string): string {
    const query = this.query(name);
    query.set(asset.Tag.RETURN_TYPE, asset.ReturnType.ALL);
    const secret = asset.querySync(query)[0]?.get(asset.Tag.SECRET) as Uint8Array;
    if (!secret) throw new Error('No saved session');
    return new util.TextDecoder('utf-8', { fatal: true }).decodeToString(secret);
  }
  private store(name: string, value: string): void {
    const update: asset.AssetMap = new Map();
    update.set(asset.Tag.SECRET, new util.TextEncoder().encodeInto(value));
    try { asset.updateSync(this.query(name), update); return; } catch (_) {}
    const attributes = this.query(name);
    attributes.set(asset.Tag.SECRET, new util.TextEncoder().encodeInto(value));
    attributes.set(asset.Tag.ACCESSIBILITY, asset.Accessibility.DEVICE_FIRST_UNLOCKED);
    attributes.set(asset.Tag.SYNC_TYPE, asset.SyncType.NEVER);
    asset.addSync(attributes);
  }
  private remove(name: string): void { try { asset.removeSync(this.query(name)); } catch (_) {} }
  read(): string { return this.current; }
  clear(): void {
    this.remove('head');
    for (let i = 0; i < this.manifest.count; i++) this.remove(`${this.manifest.slot}_${i}`);
    this.current = '';
    this.manifest = { slot: 0, count: 0 };
  }
  write(value: string): void {
    if (!value) { this.clear(); return; }
    if (value === this.current) return;
    this.current = value;
    const previous = this.manifest;
    const slot = 1 - previous.slot;
    // Encode to ASCII first so every chunk fits Asset Store's 1024-byte secret limit.
    const encoded = new util.Base64Helper().encodeToStringSync(new util.TextEncoder().encodeInto(value));
    const count = Math.ceil(encoded.length / 960);
    try {
      if (count > 128) throw new Error('Session too large');
      for (let i = 0; i < count; i++) this.store(`${slot}_${i}`, encoded.slice(i * 960, (i + 1) * 960));
      this.store('head', JSON.stringify({ slot, count, encoding: 'base64' }));
      this.manifest = { slot, count };
    } catch (_) {
      // Without encrypted persistence, keep this run's session and invalidate any older saved account.
      this.remove('head');
      for (let i = 0; i < count; i++) this.remove(`${slot}_${i}`);
      this.manifest = { slot, count: 0 };
    }
    for (let i = 0; i < previous.count; i++) this.remove(`${previous.slot}_${i}`);
  }
}
