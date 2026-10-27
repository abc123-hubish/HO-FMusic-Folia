import { common } from '@kit.AbilityKit';
import { picker } from '@kit.CoreFileKit';
import { FoliaSnapshot } from '../model/FoliaModel';
import { FoliaBridge } from '../services/FoliaBridge';
import { DesktopWindowChrome, DesktopWindowInsets } from '../services/DesktopWindowChrome';
import { AnnouncementPresentation } from '../services/AnnouncementPolicy';
import { AnnouncementService } from '../services/AnnouncementService';

// Folia owns every application screen. ArkTS only hosts ArkWeb and system services.
@Entry
@Component
struct Index {
  @StorageLink('folia_system_seek') @Watch('applySystemSeek') systemSeek: number = -1;
  @StorageLink('folia_foreground') @Watch('syncForeground') foreground: boolean = true;
  @StorageLink('folia_safe_top') safeTop: number = 0;
  @StorageLink('folia_safe_bottom') safeBottom: number = 0;
  @StorageLink('folia_safe_left') safeLeft: number = 0;
  @StorageLink('folia_safe_right') safeRight: number = 0;
  @StorageLink('folia_window_insets') @Watch('syncWindowInsets') windowInsets: DesktopWindowInsets = new DesktopWindowInsets();
  @StorageLink('folia_cutout_top') @Watch('syncWindowInsets') cutoutTop: number = 0;
  @StorageLink('folia_cutout_left') @Watch('syncWindowInsets') cutoutLeft: number = 0;
  @StorageLink('folia_cutout_right') @Watch('syncWindowInsets') cutoutRight: number = 0;
  @StorageLink('folia_cutout_bottom') @Watch('syncWindowInsets') cutoutBottom: number = 0;
  @State private isLoading: boolean = true;
  private pageReady: boolean = false;
  private pageVisible: boolean = false;
  private snapshot: FoliaSnapshot = new FoliaSnapshot();
  private bridge: FoliaBridge = new FoliaBridge(getContext(this) as common.UIAbilityContext);
  private announcements: AnnouncementService = new AnnouncementService(getContext(this) as common.UIAbilityContext);
  private pendingAnnouncement: AnnouncementPresentation | null = null;
  private active: boolean = false;

  aboutToAppear(): void {
    this.active = true;
    this.bridge.subscribe((snapshot: FoliaSnapshot) => {
      const becameReady = !this.pageReady && snapshot.ready;
      this.snapshot = snapshot;
      this.pageReady = snapshot.ready;
      if (becameReady) this.syncForeground();
      this.finishLoading();
      this.applySystemSeek();
    });
  }
  // Keep the native animation visible until React has mounted and ArkWeb can display the document.
  private finishLoading(): void {
    if (this.isLoading && this.pageReady && this.pageVisible) {
      this.isLoading = false;
      void this.checkAnnouncements();
    }
  }
  // Present only once the Web startup screen is gone and the application is visible.
  private async checkAnnouncements(): Promise<void> {
    if (!this.active || this.isLoading || !this.foreground) return;
    const announcement = await this.announcements.check();
    if (!this.active) return;
    if (announcement) this.pendingAnnouncement = announcement;
    if (!this.pageReady || !this.pageVisible || !this.foreground || !this.pendingAnnouncement) return;
    const pending = this.pendingAnnouncement;
    this.pendingAnnouncement = null;
    this.getUIContext().showAlertDialog({
      title: pending.title,
      message: pending.message,
      autoCancel: true,
      alignment: DialogAlignment.Center,
      primaryButton: { value: '我知道了', action: () => {} },
      secondaryButton: {
        value: '更新时提醒',
        action: () => {
          if (!this.announcements.remindAfterUpdate(pending.version)) {
            this.getUIContext().getPromptAction().showToast({ message: '提醒设置保存失败，请稍后重试', duration: 2000 });
          }
        }
      }
    });
  }
  private syncWindowInsets(): void {
    if (this.pageVisible) this.bridge.syncWindowInsets();
  }
  private syncForeground(): void {
    if (this.pageVisible || this.pageReady) this.bridge.syncForeground();
    if (this.foreground) void this.checkAnnouncements();
  }
  // System seek must work even while paused, when unchanged Web snapshots are no longer resent.
  private applySystemSeek(): void {
    if (!this.pageReady || this.systemSeek < 0) return;
    const time = this.systemSeek;
    this.systemSeek = -1;
    this.bridge.command('seek', String(time));
  }
  aboutToDisappear(): void {
    this.active = false;
    this.pendingAnnouncement = null;
    this.announcements.release();
    this.bridge.release();
  }
  onBackPress(): boolean {
    if (this.snapshot.settings) {
      this.bridge.command('dismissSettings');
      return true;
    }
    try {
      if (this.bridge.controller.accessBackward()) {
        this.bridge.controller.backward();
        return true;
      }
    } catch (_) {}
    if (this.snapshot.view !== 'home') {
      this.bridge.command('home');
      return true;
    }
    return false;
  }
  private async selectFile(event: OnShowFileSelectorEvent): Promise<void> {
    try {
      const options = new picker.DocumentSelectOptions();
      options.maxSelectNumber = event.fileSelector.getMode() === 1 ? 500 : 1;
      event.result.handleFileList(await new picker.DocumentViewPicker(getContext(this)).select(options));
    } catch (_) { event.result.handleFileList([]); }
  }
  build() {
    Stack({ alignContent: Alignment.Center }) {
    Web({ src: 'https://folia.local/harmony.html', controller: this.bridge.controller })
      .width('100%').height('100%').javaScriptAccess(true).domStorageAccess(true).imageAccess(true)
      .onlineImageAccess(true).fileAccess(true).mixedMode(MixedMode.All).mediaPlayGestureAccess(false)
      .backgroundColor('#09090B').horizontalScrollBarAccess(false)
      .onPageBegin(() => {
        this.bridge.setContinuationAvailable(false);
        this.pageReady = false;
        this.pageVisible = false;
        this.isLoading = true;
      })
      .onPageVisible(() => {
        this.pageVisible = true;
        this.syncForeground();
        this.syncWindowInsets();
        this.finishLoading();
      })
      .javaScriptProxy({ object: this.bridge, name: 'FoliaNative',
        methodList: ['getConfig', 'saveConfig', 'getWindowInsets', 'getForeground', 'setWindowDaylight', 'getPortraitMode', 'setPortraitMode', 'getFiles', 'removeFiles', 'openExternal', 'publish', 'publishArtwork', 'toast',
          'beginBlob', 'appendBlob', 'finishBlob', 'exportFile', 'requestImport', 'requestBackend', 'requestBodian', 'requestQishui', 'requestMusic',
          'requestLocalCover', 'getKeepScreenOn', 'setKeepScreenOn',
          'getAiConfig', 'saveAiConfig', 'requestAi', 'getContinuation', 'finishContinuation',
          'completeContinuation', 'setContinuationAvailable'],
        controller: this.bridge.controller })
      .onInterceptRequest(event => this.bridge.intercept(event?.request.getRequestUrl() || '', event?.request)!)
      .onShowFileSelector(event => { if (event) { void this.selectFile(event); return true; } return false; })
      .onLoadIntercept(event => {
        if (event?.data.isMainFrame() && !event.data.getRequestUrl().startsWith('https://folia.local/')) {
          this.bridge.openExternal(event.data.getRequestUrl());
          return true;
        }
        return false;
      })
      .padding({ top: this.safeTop, bottom: this.safeBottom, left: this.safeLeft, right: this.safeRight })
      if (this.isLoading) {
        Column({ space: 16 }) {
          Text('FMusic').fontSize(28).fontWeight(FontWeight.Medium).fontColor('#E4E4E7').textAlign(TextAlign.Center)
          LoadingProgress().width(40).height(40).color('#E4E4E7')
          Text($r('app.string.startup_loading')).fontSize(14).fontColor('#A1A1AA').textAlign(TextAlign.Center)
        }
        .width('100%').height('100%').justifyContent(FlexAlign.Center)
        .alignItems(HorizontalAlign.Center)
        .backgroundColor('#09090B').hitTestBehavior(HitTestMode.Block)
      }
      if (this.windowInsets.enabled && this.windowInsets.top > 0) {
        // Pin the native drag strip to the window origin; Row.align() cannot position it inside Stack.
        Row() {}
          .id('folia-native-window-drag-bar')
          .width(`calc(100% - ${this.windowInsets.right}vp)`)
          .height(this.windowInsets.top)
          .position({ x: 0, y: 0 })
          .zIndex(1)
          .backgroundColor(Color.Transparent)
          .hitTestBehavior(HitTestMode.Block)
          .onTouch((event: TouchEvent) => {
            // ArkUI also converts a mouse left press into TouchType.Down.
            event.stopPropagation();
            if (event.type === TouchType.Down) void DesktopWindowChrome.startMoving();
          })
      }
    }.width('100%').height('100%').backgroundColor('#09090B')
  }
}
