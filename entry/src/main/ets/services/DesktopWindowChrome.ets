import { ConfigurationConstant } from '@kit.AbilityKit';
import { deviceInfo } from '@kit.BasicServicesKit';
import { window } from '@kit.ArkUI';
import { hilog } from '@kit.PerformanceAnalysisKit';

// PC window chrome stays native while ArkWeb draws the background beneath it.
export class DesktopWindowInsets {
  enabled: boolean = false;
  top: number = 0;
  right: number = 0;
}

export class DesktopWindowChrome {
  private static readonly HEIGHT: number = 56;
  private static mainWindow?: window.Window;
  private static daylight: boolean = false;
  private static readonly onButtonRectChange = (rect: window.TitleButtonRect): void => {
    DesktopWindowChrome.publishInsets(rect);
  };

  static attach(appWindow: window.Window): void {
    AppStorage.setOrCreate<DesktopWindowInsets>('folia_window_insets', new DesktopWindowInsets());
    if (deviceInfo.deviceType !== '2in1') return;
    try {
      // Decor APIs must run after loadContent; hiding the decor retains the system's three buttons.
      appWindow.setWindowDecorVisible(false);
      DesktopWindowChrome.mainWindow = appWindow;
      appWindow.on('windowTitleButtonRectChange', DesktopWindowChrome.onButtonRectChange);
      appWindow.setWindowDecorHeight(DesktopWindowChrome.HEIGHT);
      appWindow.setWindowTitleMoveEnabled(true);
      DesktopWindowChrome.applyButtonStyle();
      DesktopWindowChrome.refresh();
    } catch (error) {
      hilog.warn(0x0000, 'Folia', 'PC window chrome unavailable: %{public}s', String(error));
    }
  }

  // TitleButtonRect is already in vp; resize/fullscreen events can also hide the button region.
  private static publishInsets(rect: window.TitleButtonRect): void {
    const insets = new DesktopWindowInsets();
    insets.enabled = true;
    if (rect.width > 0 && rect.height > 0) {
      insets.top = Math.max(DesktopWindowChrome.HEIGHT, rect.top + rect.height);
      insets.right = Math.max(0, rect.right) + rect.width;
    }
    const previous = DesktopWindowChrome.getInsets();
    if (previous.enabled !== insets.enabled || previous.top !== insets.top || previous.right !== insets.right) {
      AppStorage.setOrCreate<DesktopWindowInsets>('folia_window_insets', insets);
    }
  }

  static refresh(): void {
    if (!DesktopWindowChrome.mainWindow) return;
    try {
      DesktopWindowChrome.publishInsets(DesktopWindowChrome.mainWindow.getTitleButtonRect());
    } catch (error) {
      hilog.warn(0x0000, 'Folia', 'PC button rectangle unavailable: %{public}s', String(error));
    }
  }

  static getInsets(): DesktopWindowInsets {
    return AppStorage.get<DesktopWindowInsets>('folia_window_insets') ?? new DesktopWindowInsets();
  }

  // Call directly from a native TouchType.Down handler so the window manager owns the drag.
  static async startMoving(): Promise<void> {
    if (!DesktopWindowChrome.mainWindow || !DesktopWindowChrome.getInsets().enabled) return;
    try {
      await DesktopWindowChrome.mainWindow.startMoving();
    } catch (error) {
      hilog.warn(0x0000, 'Folia', 'PC window move unavailable: %{public}s', String(error));
    }
  }

  static setDaylight(daylight: boolean): void {
    DesktopWindowChrome.daylight = daylight;
    if (!DesktopWindowChrome.mainWindow) return;
    try {
      DesktopWindowChrome.applyButtonStyle();
    } catch (error) {
      hilog.warn(0x0000, 'Folia', 'PC button style unavailable: %{public}s', String(error));
    }
  }

  private static applyButtonStyle(): void {
    DesktopWindowChrome.mainWindow?.setDecorButtonStyle({
      colorMode: DesktopWindowChrome.daylight ? ConfigurationConstant.ColorMode.COLOR_MODE_LIGHT :
        ConfigurationConstant.ColorMode.COLOR_MODE_DARK,
      buttonIconSize: 24
    });
  }

  static release(): void {
    DesktopWindowChrome.mainWindow?.off('windowTitleButtonRectChange', DesktopWindowChrome.onButtonRectChange);
    DesktopWindowChrome.mainWindow = undefined;
    AppStorage.setOrCreate<DesktopWindowInsets>('folia_window_insets', new DesktopWindowInsets());
  }
}
