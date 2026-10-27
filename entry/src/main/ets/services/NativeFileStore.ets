import { common } from '@kit.AbilityKit';
import { picker, fileIo as fs, fileUri } from '@kit.CoreFileKit';
import { preferences } from '@kit.ArkData';
import { util } from '@kit.ArkTS';
import { NativeMusicFile } from '../model/FoliaModel';

// Copy user-selected files to the application sandbox so playback survives picker permission expiry.
export class NativeFileStore {
  private files: NativeMusicFile[] = [];
  private resourceIndex: Map<string, NativeMusicFile> | undefined = undefined;
  private duplicateIndex: Map<string, NativeMusicFile> | undefined = undefined;
  private context: common.UIAbilityContext;
  constructor(context: common.UIAbilityContext) {
    this.context = context;
    const prefs = preferences.getPreferencesSync(context, { name: 'folia_native' });
    try { this.files = JSON.parse(prefs.getSync('files', '[]') as string) as NativeMusicFile[]; } catch (_) {}
    const directory = `${context.filesDir}/music`;
    if (!fs.accessSync(directory)) fs.mkdirSync(directory, true);
  }

  list(): NativeMusicFile[] { return this.files; }

  private mime(name: string): string {
    const ext = name.split('.').pop()?.toLowerCase() || '';
    if (ext === 'mp3') return 'audio/mpeg';
    if (ext === 'flac') return 'audio/flac';
    if (ext === 'm4a' || ext === 'aac') return 'audio/mp4';
    if (ext === 'wav') return 'audio/wav';
    if (ext === 'ogg' || ext === 'opus') return 'audio/ogg';
    if (ext === 'aiff' || ext === 'aif') return 'audio/aiff';
    if (ext === 'wma') return 'audio/x-ms-wma';
    if (ext === 'png') return 'image/png';
    if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
    if (ext === 'webp') return 'image/webp';
    return 'text/plain';
  }

  async pick(): Promise<NativeMusicFile[]> {
    const view = new picker.DocumentViewPicker(this.context);
    const options = new picker.DocumentSelectOptions();
    options.maxSelectNumber = 500;
    options.fileSuffixFilters = ['音乐、歌词与封面|.mp3,.flac,.m4a,.aac,.wav,.ogg,.opus,.aiff,.aif,.wma,.lrc,.tlrc,.vtt,.ttml,.qrc,.yrc,.krc,.fia,.jpg,.jpeg,.png,.webp'];
    const selected = await view.select(options);
    const imported: NativeMusicFile[] = [];
    for (const uri of selected) {
      const source = await fs.open(uri, fs.OpenMode.READ_ONLY);
      try {
        const name = new fileUri.FileUri(uri).name;
        const stat = await fs.stat(source.fd);
        const modified = stat.mtime * 1000;
        const duplicate = this.findDuplicate(name, stat.size, modified);
        if (duplicate) { imported.push(duplicate); continue; }
        const id = util.generateRandomUUID(true);
        const extension = name.split('.').pop()?.toLowerCase() || 'bin';
        const path = `${this.context.filesDir}/music/${id}.${extension}`;
        await fs.copyFile(source.fd, path);
        const item: NativeMusicFile = {
          id, name, size: stat.size, modified: stat.mtime * 1000, mime: this.mime(name),
          url: `https://folia.local/native/${id}`, path, relativePath: `HarmonyOS/${name}`
        };
        this.files.push(item);
        this.resourceIndex = undefined;
        const key = this.duplicateKey(name, stat.size, modified);
        if (key !== undefined && this.duplicateIndex && !this.duplicateIndex.has(key)) this.duplicateIndex.set(key, item);
        imported.push(item);
      } finally { await fs.close(source); }
    }
    const prefs = preferences.getPreferencesSync(this.context, { name: 'folia_native' });
    prefs.putSync('files', JSON.stringify(this.files));
    await prefs.flush();
    return imported;
  }

  private duplicateKey(name: string, size: number, modified: number): string | undefined {
    // JSON keys are exact for finite sizes/timestamps; exceptional values keep the original equality check.
    return Number.isFinite(size) && Number.isFinite(modified) ? JSON.stringify([name, size, modified]) : undefined;
  }

  private findDuplicate(name: string, size: number, modified: number): NativeMusicFile | undefined {
    const key = this.duplicateKey(name, size, modified);
    if (key === undefined) {
      return this.files.find((file: NativeMusicFile) => file.name === name && file.size === size && file.modified === modified);
    }
    if (!this.duplicateIndex) {
      // Rebuilt after deletion; additions update this shared index even across overlapping pick calls.
      this.duplicateIndex = new Map();
      for (const file of this.files) {
        const entryKey = this.duplicateKey(file.name, file.size, file.modified);
        if (entryKey !== undefined && !this.duplicateIndex.has(entryKey)) this.duplicateIndex.set(entryKey, file);
      }
    }
    return this.duplicateIndex.get(key);
  }

  // A library deletion removes only the app-owned copies, keeping the user's original documents intact.
  remove(ids: string[]): void {
    const selected: Set<string> = new Set(ids);
    const removed = this.files.filter((file: NativeMusicFile) => selected.has(file.id));
    for (const file of removed) {
      if (!file.path.startsWith(`${this.context.filesDir}/music/`) || file.path.includes('/../')) continue;
      try { fs.unlinkSync(file.path); } catch (_) {}
    }
    this.files = this.files.filter((file: NativeMusicFile) => !selected.has(file.id));
    this.resourceIndex = undefined;
    this.duplicateIndex = undefined;
    const prefs = preferences.getPreferencesSync(this.context, { name: 'folia_native' });
    prefs.putSync('files', JSON.stringify(this.files));
    void prefs.flush();
  }

  private findResource(url: string): NativeMusicFile | undefined {
    if (!this.resourceIndex) {
      this.resourceIndex = new Map();
      for (const file of this.files) {
        if (!this.resourceIndex.has(file.url)) this.resourceIndex.set(file.url, file);
      }
    }
    return this.resourceIndex.get(url.split('?')[0]);
  }

  // Supply whole files for fetch(). Playback uses the upstream File -> Blob URL path in the Web layer.
  resource(url: string): WebResourceResponse | undefined {
    const item = this.findResource(url);
    if (!item) return undefined;
    const source = fs.openSync(item.path, fs.OpenMode.READ_ONLY);
    const response = new WebResourceResponse();
    // ArkWeb owns and closes the supplied descriptor.
    response.setResponseData(source.fd);
    response.setResponseCode(200);
    response.setReasonMessage('OK');
    response.setResponseMimeType(item.mime);
    response.setResponseEncoding('binary');
    response.setResponseHeader([{ headerKey: 'Content-Length', headerValue: String(item.size) },
      { headerKey: 'Access-Control-Allow-Origin', headerValue: '*' }]);
    return response;
  }

  release(): void {
    this.resourceIndex = undefined;
    this.duplicateIndex = undefined;
  }
}
