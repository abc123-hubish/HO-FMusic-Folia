import { common } from '@kit.AbilityKit';
import { deviceInfo, emitter } from '@kit.BasicServicesKit';
import { statusBarManager } from '@kit.DeskTopExtensionKit';
import { image } from '@kit.ImageKit';
import { window } from '@kit.ArkUI';
import { hilog } from '@kit.PerformanceAnalysisKit';

// Keep the same UIAbility and Web player alive when the PC title-bar X is clicked.
export class DesktopTray {
  private context: common.UIAbilityContext;
  private appWindow: window.Window;
  private active: boolean = true;
  private ready: Promise<void>;
  private icons: image.PixelMap[] = [];
  private readonly onIconClick = (event: emitter.EventData): void => {
    if (event.data?.['iconClickType'] === 'leftClick') this.restore();
  };
  private readonly onMenuClick = (event: emitter.EventData): void => {
    if (event.data?.['menuCode'] === 'folia.restore') this.restore();
  };
  private readonly onClose = async (): Promise<boolean> => {
    try {
      await this.ready;
      if (!this.active) return false;
      await this.context.hideAbility();
      hilog.info(0x0000, 'FoliaTray', 'Main window hidden to status bar');
    } catch (error) {
      hilog.error(0x0000, 'FoliaTray', 'Cannot hide to status bar: %{public}s', String(error));
      try {
        this.appWindow.getUIContext().getPromptAction().showToast({ message: '隐藏到托盘失败，请稍后重试' });
      } catch (_) {}
    }
    // true cancels destruction. Failure must also leave the player's window intact.
    return true;
  };

  private constructor(context: common.UIAbilityContext, appWindow: window.Window) {
    this.context = context;
    this.appWindow = appWindow;
    // Install before asynchronous icon decoding so an early X cannot destroy the player.
    this.appWindow.on('windowWillClose', this.onClose);
    this.ready = this.register();
    // Keep rejected initialization observable by onClose without an unhandled rejection.
    void this.ready.catch((error: Error) => {
      hilog.error(0x0000, 'FoliaTray', 'Status bar registration failed: %{public}s', String(error));
    });
  }

  static attach(context: common.UIAbilityContext, appWindow: window.Window): DesktopTray | undefined {
    if (deviceInfo.deviceType !== '2in1') return undefined;
    try {
      return new DesktopTray(context, appWindow);
    } catch (error) {
      hilog.error(0x0000, 'FoliaTray', 'Close listener unavailable: %{public}s', String(error));
      return undefined;
    }
  }

  private async loadIcon(name: string): Promise<image.PixelMap> {
    const data = await this.context.resourceManager.getRawFileContent(name);
    const source = image.createImageSource(data.buffer);
    try {
      const icon = await source.createPixelMap();
      this.icons.push(icon);
      return icon;
    } finally {
      await source.release();
    }
  }

  private async register(): Promise<void> {
    const white = await this.loadIcon('folia-tray-white.svg');
    const black = await this.loadIcon('folia-tray-black.svg');
    if (!this.active) return;
    statusBarManager.on('statusBarIconClick', this.onIconClick);
    statusBarManager.on('rightMenuClick', this.onMenuClick);
    const item: statusBarManager.StatusBarItem = {
      icons: { white, black },
      quickOperation: { title: 'Folia', height: 1, abilityName: '' },
      hoverTips: 'Folia',
      statusBarGroupMenu: [[{
        title: '打开主窗口',
        menuAction: { abilityName: 'EntryAbility', notifyOnly: true, menuCode: 'folia.restore' }
      }]]
    };
    await new Promise<void>((resolve, reject) => {
      statusBarManager.addToStatusBar(this.context, item, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
    hilog.info(0x0000, 'FoliaTray', 'Status bar icon registered');
  }

  private restore(): void {
    if (!this.active) return;
    void this.context.showAbility().catch((error: Error) => {
      hilog.error(0x0000, 'FoliaTray', 'Cannot restore main window: %{public}s', String(error));
    });
  }

  release(): void {
    this.active = false;
    this.appWindow.off('windowWillClose', this.onClose);
    statusBarManager.off('statusBarIconClick', this.onIconClick);
    statusBarManager.off('rightMenuClick', this.onMenuClick);
    // Wait for any outstanding decoding/registration before releasing its PixelMaps.
    void this.ready.catch(() => {}).then(async () => {
      for (const icon of this.icons) await icon.release();
      this.icons = [];
    });
  }
}
