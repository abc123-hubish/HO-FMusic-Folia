import { common } from '@kit.AbilityKit';
import { preferences } from '@kit.ArkData';
import { window } from '@kit.ArkUI';
import { hilog } from '@kit.PerformanceAnalysisKit';

// Persists the user's screen setting and holds the screen only while the main window is visible.
export class ScreenKeepOn {
  private static mainWindow?: window.Window;
  private static foreground: boolean = false;
  private static pending: Promise<void> = Promise.resolve();

  static getEnabled(context: common.UIAbilityContext): boolean {
    return preferences.getPreferencesSync(context, { name: 'folia_native' }).getSync('keep_screen_on', false) as boolean;
  }

  // Serialize lifecycle and settings requests so a late enable cannot outlive a background transition.
  private static enqueue(operation: () => Promise<void>): Promise<void> {
    const result = ScreenKeepOn.pending.catch(() => {}).then(operation);
    ScreenKeepOn.pending = result;
    return result;
  }

  static attach(context: common.UIAbilityContext, appWindow: window.Window): void {
    ScreenKeepOn.mainWindow = appWindow;
    ScreenKeepOn.setForeground(context, AppStorage.get<boolean>('folia_foreground') !== false);
  }

  static setForeground(context: common.UIAbilityContext, foreground: boolean): void {
    ScreenKeepOn.foreground = foreground;
    const appWindow = ScreenKeepOn.mainWindow;
    if (!appWindow) return;
    void ScreenKeepOn.enqueue(async (): Promise<void> => {
      if (ScreenKeepOn.mainWindow !== appWindow) return;
      await appWindow.setWindowKeepScreenOn(ScreenKeepOn.foreground && ScreenKeepOn.getEnabled(context));
    }).catch((error: Error) => hilog.warn(0x0000, 'Folia', 'Screen keep-on unavailable: %{public}s', error.message));
  }

  static setEnabled(context: common.UIAbilityContext, enabled: boolean): Promise<void> {
    const appWindow = ScreenKeepOn.mainWindow;
    return ScreenKeepOn.enqueue(async (): Promise<void> => {
      if (!appWindow || ScreenKeepOn.mainWindow !== appWindow) throw new Error('Main window unavailable');
      const prefs = preferences.getPreferencesSync(context, { name: 'folia_native' });
      const previous = ScreenKeepOn.getEnabled(context);
      await appWindow.setWindowKeepScreenOn(ScreenKeepOn.foreground && enabled);
      try {
        prefs.putSync('keep_screen_on', enabled);
        await prefs.flush();
      } catch (error) {
        prefs.putSync('keep_screen_on', previous);
        await appWindow.setWindowKeepScreenOn(ScreenKeepOn.foreground && previous);
        throw new Error(String(error));
      }
    });
  }

  static release(): void {
    ScreenKeepOn.mainWindow = undefined;
    ScreenKeepOn.foreground = false;
  }
}
