import { AbilityConstant, ConfigurationConstant, UIAbility, Want } from '@kit.AbilityKit';
import { hilog } from '@kit.PerformanceAnalysisKit';
import { window } from '@kit.ArkUI';
import { DisplayOrientation } from '../services/DisplayOrientation';
import { ScreenKeepOn } from '../services/ScreenKeepOn';
import { DesktopWindowChrome } from '../services/DesktopWindowChrome';
import { DesktopTray } from '../services/DesktopTray';
import { AppContinuation } from '../services/AppContinuation';

const DOMAIN = 0x0000;

export default class EntryAbility extends UIAbility {
  private mainWindow?: window.Window;
  private desktopTray?: DesktopTray;
  private readonly onWindowVisibility = (event: window.WindowEventType): void => {
    // Split-screen focus changes leave the window visible; only shown/hidden changes stop rendering.
    if (event === window.WindowEventType.WINDOW_SHOWN) this.updateForeground(true);
    else if (event === window.WindowEventType.WINDOW_HIDDEN) this.updateForeground(false);
  };
  private updateForeground(foreground: boolean): void {
    AppStorage.setOrCreate<boolean>('folia_foreground', foreground);
    ScreenKeepOn.setForeground(this.context, foreground);
  }
  private refreshInsets(): void {
    if (!this.mainWindow) return;
    DesktopWindowChrome.refresh();
    try {
      const area = this.mainWindow.getWindowAvoidArea(window.AvoidAreaType.TYPE_SYSTEM);
      const cutout = this.mainWindow.getWindowAvoidArea(window.AvoidAreaType.TYPE_CUTOUT);
      const ui = this.mainWindow.getUIContext();
      let cameraArea = cutout;
      try {
        cameraArea = this.mainWindow.getWindowAvoidAreaIgnoringVisibility(window.AvoidAreaType.TYPE_CUTOUT);
      } catch (_) {}
      const topCutout = cameraArea.topRect;
      // Send the camera's lower edge to Web; native top padding would leave a blank background strip.
      const cutoutTop = topCutout.width > 0 && topCutout.height > 0
        ? ui.px2vp(Math.max(0, topCutout.top + topCutout.height)) : 0;
      if (AppStorage.get<number>('folia_cutout_top') !== cutoutTop) {
        AppStorage.setOrCreate<number>('folia_cutout_top', cutoutTop);
      }
      // Pass every camera edge to Web dialogs, including landscape cutouts hidden from TYPE_SYSTEM.
      const bounds = this.mainWindow.getWindowProperties().windowRect;
      const left = cameraArea.leftRect;
      const right = cameraArea.rightRect;
      const bottom = cameraArea.bottomRect;
      AppStorage.setOrCreate<number>('folia_cutout_left', left.width > 0 && left.height > 0
        ? ui.px2vp(Math.max(0, left.left + left.width)) : 0);
      AppStorage.setOrCreate<number>('folia_cutout_right', right.width > 0 && right.height > 0
        ? ui.px2vp(Math.max(0, bounds.width - right.left)) : 0);
      AppStorage.setOrCreate<number>('folia_cutout_bottom', bottom.width > 0 && bottom.height > 0
        ? ui.px2vp(Math.max(0, bounds.height - bottom.top)) : 0);
      // Pure fullscreen: the Web fills the top edge in every orientation, so no top safe area is reserved.
      AppStorage.setOrCreate<number>('folia_safe_top', 0);
      AppStorage.setOrCreate<number>('folia_safe_bottom', ui.px2vp(Math.max(area.bottomRect.height, cutout.bottomRect.height)));
      AppStorage.setOrCreate<number>('folia_safe_left', ui.px2vp(Math.max(area.leftRect.width, cutout.leftRect.width)));
      AppStorage.setOrCreate<number>('folia_safe_right', ui.px2vp(Math.max(area.rightRect.width, cutout.rightRect.width)));
    } catch (error) {
      hilog.warn(DOMAIN, 'Folia', 'Insets unavailable: %{public}s', String(error));
    }
  }
  private openContent(windowStage: window.WindowStage): void {
    if (this.mainWindow) this.releaseWindow();
    const appWindow = windowStage.getMainWindowSync();
    this.mainWindow = appWindow;
    ScreenKeepOn.attach(this.context, appWindow);
    this.desktopTray = DesktopTray.attach(this.context, appWindow);
    // The manifest gives the startup window its orientation. Window setup must never block loadContent.
    const portrait = DisplayOrientation.getPortraitMode(this.context);
    void appWindow.setPreferredOrientation(DisplayOrientation.getPreferredOrientation(portrait))
      .catch((error: Error) => hilog.warn(DOMAIN, 'Folia', 'Orientation unavailable: %{public}s', error.message));
    windowStage.loadContent('pages/Index', (err) => {
      if (err.code) {
        hilog.error(DOMAIN, 'Folia', 'Failed to load content: %{public}s', JSON.stringify(err));
        return;
      }
      DesktopWindowChrome.attach(appWindow);
      this.refreshInsets();
      appWindow.on('windowSizeChange', () => this.refreshInsets());
      appWindow.on('avoidAreaChange', () => this.refreshInsets());
      appWindow.on('windowEvent', this.onWindowVisibility);
      void appWindow.setWindowLayoutFullScreen(true).then(() => this.refreshInsets())
        .catch((error: Error) => hilog.warn(DOMAIN, 'Folia', 'Fullscreen unavailable: %{public}s', error.message));
      void appWindow.setWindowSystemBarEnable(['navigation']).then(() => this.refreshInsets())
        .catch((error: Error) => hilog.warn(DOMAIN, 'Folia', 'System bars unavailable: %{public}s', error.message));
      void appWindow.setWindowSystemBarProperties({ statusBarColor: '#00000000',
        statusBarContentColor: '#FFE4E4E7', navigationBarColor: '#00000000', navigationBarContentColor: '#FFE4E4E7' });
    });
  }
  onCreate(want: Want, launchParam: AbilityConstant.LaunchParam): void {
    AppStorage.setOrCreate<boolean>('folia_foreground', true);
    this.restoreContinuation(want, launchParam);
    hilog.info(DOMAIN, 'testTag', '%{public}s', 'Ability onCreate');
  }

  onNewWant(want: Want, launchParam: AbilityConstant.LaunchParam): void {
    this.restoreContinuation(want, launchParam);
  }

  private restoreContinuation(want: Want, launchParam: AbilityConstant.LaunchParam): void {
    if (launchParam.launchReason !== AbilityConstant.LaunchReason.CONTINUATION) return;
    if (!AppContinuation.receive(want)) return;
    // Must run synchronously inside onCreate/onNewWant so the restored WindowStage is created.
    this.context.restoreWindowStage(new LocalStorage());
  }

  async onContinue(wantParam: Record<string, Object>): Promise<AbilityConstant.OnContinueResult> {
    return AppContinuation.save(wantParam);
  }

  onWindowStageRestore(windowStage: window.WindowStage): void {
    this.initializeWindow(windowStage);
  }

  onDestroy(): void {
    hilog.info(DOMAIN, 'testTag', '%{public}s', 'Ability onDestroy');
  }

  onWindowStageCreate(windowStage: window.WindowStage): void {
    this.initializeWindow(windowStage);
  }

  private initializeWindow(windowStage: window.WindowStage): void {
    this.openContent(windowStage);

    try {
      this.context.getApplicationContext().setColorMode(ConfigurationConstant.ColorMode.COLOR_MODE_NOT_SET);
    } catch (err) {
      hilog.error(DOMAIN, 'testTag', 'Failed to set colorMode. Cause: %{public}s', JSON.stringify(err));
    }
  }

  onWindowStageDestroy(): void {
    this.releaseWindow();
    // Main window is destroyed, release UI related resources
    hilog.info(DOMAIN, 'testTag', '%{public}s', 'Ability onWindowStageDestroy');
  }

  private releaseWindow(): void {
    ScreenKeepOn.release();
    this.desktopTray?.release();
    this.desktopTray = undefined;
    DesktopWindowChrome.release();
    this.mainWindow?.off('windowSizeChange');
    this.mainWindow?.off('avoidAreaChange');
    this.mainWindow?.off('windowEvent', this.onWindowVisibility);
    this.mainWindow = undefined;
  }

  onForeground(): void {
    this.updateForeground(true);
    // Ability has brought to foreground
    hilog.info(DOMAIN, 'testTag', '%{public}s', 'Ability onForeground');
  }

  onBackground(): void {
    this.updateForeground(false);
    // Ability has back to background
    hilog.info(DOMAIN, 'testTag', '%{public}s', 'Ability onBackground');
  }
}
