import { common } from '@kit.AbilityKit';
import { preferences } from '@kit.ArkData';
import { cryptoFramework } from '@kit.CryptoArchitectureKit';
import { MusicSession } from '../music/MusicSession';

// Long ticket guards use the existing chunked, encrypted Asset Store repository.
export class QishuiSession {
  readonly deviceId: string;
  private readonly session: MusicSession = new MusicSession('qishui');
  constructor(context: common.UIAbilityContext) {
    const prefs = preferences.getPreferencesSync(context, { name: 'folia_native' });
    let device = prefs.getSync('qishui_device_id', '') as string;
    if (!/^[1-9]\d{18}$/.test(device)) {
      const bytes = cryptoFramework.createRandom().generateRandomSync(19).data;
      device = Array.from(bytes).map((value: number, index: number): string => String(index === 0 ? value % 9 + 1 : value % 10)).join('');
      prefs.putSync('qishui_device_id', device); void prefs.flush();
    }
    this.deviceId = device;
  }
  read(): string { return this.session.read(); }
  write(value: string): void { this.session.write(value); }
}
