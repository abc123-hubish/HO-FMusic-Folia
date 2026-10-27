import { bundleManager, common } from '@kit.AbilityKit';
import { preferences } from '@kit.ArkData';
import { http } from '@kit.NetworkKit';
import { hilog } from '@kit.PerformanceAnalysisKit';
import {
  ANNOUNCEMENT_API_URL, ANNOUNCEMENT_APP_ID, AnnouncementApiResponse, AnnouncementPresentation,
  buildAnnouncementPresentation
} from './AnnouncementPolicy';

// Native networking and version-scoped reminder preferences for the startup announcement.
const PREFERENCES_NAME: string = 'folia_announcements';
const MUTED_VERSION_KEY: string = 'muted_version';

export class AnnouncementService {
  private context: common.UIAbilityContext;
  private checked: boolean = false;
  private released: boolean = false;
  private request: http.HttpRequest | null = null;

  constructor(context: common.UIAbilityContext) {
    this.context = context;
  }

  // Fetch remote rules before reading the local choice, so FORCE can override it.
  async check(): Promise<AnnouncementPresentation | null> {
    if (this.checked || this.released) return null;
    this.checked = true;
    let request: http.HttpRequest | null = null;
    try {
      request = http.createHttp();
      this.request = request;
      const info: bundleManager.BundleInfo = bundleManager.getBundleInfoForSelfSync(
        bundleManager.BundleFlag.GET_BUNDLE_INFO_DEFAULT);
      const version: string = `${info.versionName}(${info.versionCode})`;
      const response: http.HttpResponse = await request.request(ANNOUNCEMENT_API_URL, {
        method: http.RequestMethod.GET,
        expectDataType: http.HttpDataType.STRING,
        usingCache: false,
        header: { 'app_id': ANNOUNCEMENT_APP_ID, 'Accept': 'application/json' },
        connectTimeout: 8000,
        readTimeout: 8000
      });
      if (this.released) return null;
      if (response.responseCode !== 200 || typeof response.result !== 'string') {
        throw new Error('Announcement HTTP request failed: ' + response.responseCode);
      }
      const body: AnnouncementApiResponse = JSON.parse(response.result) as AnnouncementApiResponse;
      if (body.code !== 0 || !Array.isArray(body.data)) throw new Error('Invalid announcement response');
      const mutedVersion: string = this.readMutedVersion();
      return buildAnnouncementPresentation(body.data, version, mutedVersion);
    } catch (error) {
      if (!this.released) {
        hilog.warn(0x0000, 'FoliaAnnouncement', 'Announcement check failed: %{public}s', String(error));
      }
      return null;
    } finally {
      if (request && this.request === request) {
        this.request = null;
        request.destroy();
      }
    }
  }

  private readMutedVersion(): string {
    try {
      return preferences.getPreferencesSync(this.context, { name: PREFERENCES_NAME })
        .getSync(MUTED_VERSION_KEY, '') as string;
    } catch (error) {
      hilog.warn(0x0000, 'FoliaAnnouncement', 'Read reminder preference failed: %{public}s', String(error));
      return '';
    }
  }

  remindAfterUpdate(version: string): boolean {
    try {
      const pref: preferences.Preferences = preferences.getPreferencesSync(this.context, { name: PREFERENCES_NAME });
      const previous: string = pref.getSync(MUTED_VERSION_KEY, '') as string;
      try {
        pref.putSync(MUTED_VERSION_KEY, version);
        pref.flushSync();
      } catch (error) {
        pref.putSync(MUTED_VERSION_KEY, previous);
        throw new Error('Reminder preference flush failed: ' + String(error));
      }
      return true;
    } catch (error) {
      hilog.warn(0x0000, 'FoliaAnnouncement', 'Save reminder preference failed: %{public}s', String(error));
      return false;
    }
  }

  release(): void {
    this.released = true;
    const request: http.HttpRequest | null = this.request;
    this.request = null;
    request?.destroy();
  }
}
