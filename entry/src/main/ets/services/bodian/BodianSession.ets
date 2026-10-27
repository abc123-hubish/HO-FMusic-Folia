import { common } from '@kit.AbilityKit';
import { preferences } from '@kit.ArkData';
import { asset } from '@kit.AssetStoreKit';
import { cryptoFramework } from '@kit.CryptoArchitectureKit';
import { util } from '@kit.ArkTS';

// Account secrets stay in the native Asset Store; Preferences holds only the device identity.
export class BodianSession {
  readonly deviceId: string;
  private current: string = '';
  private readonly alias: Uint8Array = new util.TextEncoder().encodeInto('FOLIA_BODIAN_SESSION_V1');
  constructor(context: common.UIAbilityContext) {
    const prefs = preferences.getPreferencesSync(context, { name: 'folia_native' });
    let device = prefs.getSync('bodian_device_id', '') as string;
    if (!/^[a-f0-9]{32}$/.test(device)) {
      device = Array.from(cryptoFramework.createRandom().generateRandomSync(16).data)
        .map((value: number): string => value.toString(16).padStart(2, '0')).join('');
      prefs.putSync('bodian_device_id', device);
      void prefs.flush();
    }
    this.deviceId = device;
    try {
      const query = this.query();
      query.set(asset.Tag.RETURN_TYPE, asset.ReturnType.ALL);
      const secret = asset.querySync(query)[0]?.get(asset.Tag.SECRET) as Uint8Array;
      if (secret) this.current = new util.TextDecoder('utf-8', { fatal: true }).decodeToString(secret);
    } catch (_) { this.current = ''; }
  }
  private query(): asset.AssetMap {
    const query: asset.AssetMap = new Map();
    query.set(asset.Tag.ALIAS, this.alias);
    return query;
  }
  read(): string { return this.current; }
  write(value: string): void {
    this.current = value;
    if (!value) { try { asset.removeSync(this.query()); } catch (_) {} return; }
    const update: asset.AssetMap = new Map();
    update.set(asset.Tag.SECRET, new util.TextEncoder().encodeInto(value));
    try { asset.updateSync(this.query(), update); return; } catch (_) {}
    const attributes = this.query();
    attributes.set(asset.Tag.SECRET, new util.TextEncoder().encodeInto(value));
    attributes.set(asset.Tag.ACCESSIBILITY, asset.Accessibility.DEVICE_FIRST_UNLOCKED);
    attributes.set(asset.Tag.SYNC_TYPE, asset.SyncType.NEVER);
    try { asset.addSync(attributes); }
    catch (_) {
      // Encryption unavailable: retain only this run's session, never plaintext credentials.
      try { asset.removeSync(this.query()); } catch (_) {}
    }
  }
}
