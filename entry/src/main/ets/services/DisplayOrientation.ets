import { common } from '@kit.AbilityKit';
import { preferences } from '@kit.ArkData';
import { window } from '@kit.ArkUI';

// The app selects portrait or landscape; landscape can reverse when system rotation is unlocked.
export class DisplayOrientation {
  static getPreferredOrientation(portrait: boolean): window.Orientation {
    return portrait ? window.Orientation.PORTRAIT : window.Orientation.AUTO_ROTATION_LANDSCAPE_RESTRICTED;
  }
  static getPortraitMode(context: common.UIAbilityContext): boolean {
    return preferences.getPreferencesSync(context, { name: 'folia_native' }).getSync('portrait_mode', false) as boolean;
  }
  static async setPortraitMode(context: common.UIAbilityContext, enabled: boolean): Promise<void> {
    const appWindow = await window.getLastWindow(context);
    await appWindow.setPreferredOrientation(DisplayOrientation.getPreferredOrientation(enabled));
    const prefs = preferences.getPreferencesSync(context, { name: 'folia_native' });
    prefs.putSync('portrait_mode', enabled);
    await prefs.flush();
  }
}
