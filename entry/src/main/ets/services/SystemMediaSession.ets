import { common, wantAgent } from '@kit.AbilityKit';
import { avSession } from '@kit.AVSessionKit';
import { backgroundTaskManager } from '@kit.BackgroundTasksKit';
import { image } from '@kit.ImageKit';
import { http } from '@kit.NetworkKit';
import { util } from '@kit.ArkTS';
import { FoliaSnapshot } from '../model/FoliaModel';

// Mirror Folia's transport into the system media panel and request audio continuous-task privileges only while playing.
export class SystemMediaSession {
  private session: avSession.AVSession | undefined = undefined;
  private creating: Promise<void> | undefined = undefined;
  private running: boolean = false;
  private lastTrack: string = '';
  private lastPlayback: string = '';
  private released: boolean = false;
  private pendingSnapshot: FoliaSnapshot | undefined = undefined;
  private updating: Promise<void> | undefined = undefined;
  private latestSnapshot: FoliaSnapshot | undefined = undefined;
  private retryTimer: number | undefined = undefined;
  private retryDelay: number = 1000;
  private artworkKey: string = '';
  private artworkBuffer: ArrayBuffer | undefined = undefined;
  private artworkRevision: number = 0;
  private artworkRequest: number = 0;
  private artworkRetryTimer: number | undefined = undefined;
  private artworkRetryDelay: number = 1000;
  private context: common.UIAbilityContext;
  private command: (action: string) => void;
  constructor(context: common.UIAbilityContext, command: (action: string) => void) {
    this.context = context; this.command = command;
  }

  private async create(): Promise<void> {
    if (this.session) return;
    if (this.creating) return this.creating;
    this.creating = this.initialize();
    try { await this.creating; } finally { this.creating = undefined; }
  }
  private async initialize(): Promise<void> {
    const session = await avSession.createAVSession(this.context, 'FMusic', 'audio');
    session.on('play', () => this.command('play'));
    session.on('pause', () => this.command('pause'));
    session.on('playNext', () => this.command('next'));
    session.on('playPrevious', () => this.command('previous'));
    session.on('stop', () => this.command('pause'));
    session.on('seek', (time: number) => {
      AppStorage.setOrCreate<number>('folia_system_seek', time);
    });
    await session.activate();
    this.session = session;
  }
  update(snapshot: FoliaSnapshot): Promise<void> {
    if (this.released || !snapshot.songId) return Promise.resolve();
    const artworkKey = JSON.stringify([snapshot.songId, snapshot.cover || '']);
    if (this.artworkKey !== artworkKey) {
      this.artworkKey = artworkKey;
      this.artworkBuffer = undefined;
      this.artworkRevision++;
      this.artworkRequest++;
      clearTimeout(this.artworkRetryTimer);
      this.artworkRetryTimer = undefined;
      this.artworkRetryDelay = 1000;
    }
    this.latestSnapshot = snapshot;
    this.pendingSnapshot = snapshot;
    if (!this.updating) {
      this.updating = this.drainUpdates().finally(() => {
        this.updating = undefined;
        if (this.pendingSnapshot && !this.released) void this.update(this.pendingSnapshot);
      });
    }
    return this.updating;
  }
  // Artwork loads independently of transport updates; late results must never replace the current song's cover.
  async setArtwork(songId: string, cover: string, source: string): Promise<void> {
    const key = JSON.stringify([songId, cover]);
    if (this.released || key !== this.artworkKey || !cover || !source) return;
    const request = ++this.artworkRequest;
    clearTimeout(this.artworkRetryTimer);
    this.artworkRetryTimer = undefined;
    try {
      const buffer = await this.readArtwork(source);
      if (this.released || request !== this.artworkRequest || key !== this.artworkKey) return;
      this.artworkBuffer = buffer;
      this.artworkRevision++;
      this.artworkRetryDelay = 1000;
      if (this.latestSnapshot) await this.update(this.latestSnapshot);
    } catch (error) {
      if (this.released || request !== this.artworkRequest || key !== this.artworkKey) return;
      console.warn(`Folia media artwork: ${String(error)}`);
      this.artworkRetryTimer = setTimeout(() => {
        this.artworkRetryTimer = undefined;
        void this.setArtwork(songId, cover, source);
      }, this.artworkRetryDelay);
      this.artworkRetryDelay = Math.min(this.artworkRetryDelay * 2, 30000);
    }
  }
  private async readArtwork(source: string): Promise<ArrayBuffer> {
    if (/^data:image\/[^;,]+;base64,/.test(source)) {
      if (source.length > 12 * 1024 * 1024) throw new Error('Cover data is too large');
      const bytes = await new util.Base64Helper().decode(source.slice(source.indexOf(',') + 1));
      return bytes.buffer as ArrayBuffer;
    }
    if (!/^https?:\/\//i.test(source) || /^https?:\/\/folia\.local(?:\/|$)/i.test(source)) {
      throw new Error('Cover must contain image data or a network image URL');
    }
    const request = http.createHttp();
    try {
      const response = await request.request(source, { method: http.RequestMethod.GET,
        expectDataType: http.HttpDataType.ARRAY_BUFFER, connectTimeout: 10000, readTimeout: 10000,
        maxLimit: 8 * 1024 * 1024 });
      if (response.responseCode !== 200) throw new Error(`Cover request failed: ${response.responseCode}`);
      return response.result as ArrayBuffer;
    } finally { request.destroy(); }
  }
  private async publishMetadata(session: avSession.AVSession, snapshot: FoliaSnapshot): Promise<boolean> {
    const key = JSON.stringify([snapshot.songId, snapshot.cover || '']);
    const buffer = key === this.artworkKey ? this.artworkBuffer : undefined;
    let imageSource: image.ImageSource | undefined = undefined;
    let pixelMap: image.PixelMap | undefined = undefined;
    try {
      if (buffer) {
        try {
          imageSource = image.createImageSource(buffer);
          const info = await imageSource.getImageInfo();
          const scale = Math.min(1, 512 / Math.max(info.size.width, info.size.height));
          pixelMap = await imageSource.createPixelMap({ desiredSize: {
            width: Math.max(1, Math.round(info.size.width * scale)),
            height: Math.max(1, Math.round(info.size.height * scale))
          } });
        } catch (error) {
          // A corrupt image must not block playback-state or background-task updates.
          console.warn(`Folia cover decode: ${String(error)}`);
          if (buffer === this.artworkBuffer) this.artworkBuffer = undefined;
        }
      }
      if (this.released || key !== this.artworkKey) return false;
      await session.setAVMetadata({ assetId: snapshot.songId, title: snapshot.title,
        artist: snapshot.artist, duration: Math.round(snapshot.duration * 1000), mediaImage: pixelMap || '' });
      return true;
    } finally {
      if (pixelMap) { try { await pixelMap.release(); } catch (_) {} }
      if (imageSource) { try { await imageSource.release(); } catch (_) {} }
    }
  }
  // AVSession operations stay ordered; if ArkWeb publishes faster, only the latest pending state is needed.
  private async drainUpdates(): Promise<void> {
    while (this.pendingSnapshot && !this.released) {
      const snapshot = this.pendingSnapshot;
      this.pendingSnapshot = undefined;
      await this.applySnapshot(snapshot);
    }
  }
  private async applySnapshot(snapshot: FoliaSnapshot): Promise<void> {
    try {
      await this.create();
      const session = this.session;
      if (!session || this.released) return;
      const metadataKey = JSON.stringify([snapshot.songId, snapshot.duration, snapshot.title, snapshot.artist,
        snapshot.cover || '', this.artworkRevision]);
      if (this.lastTrack !== metadataKey) {
        if (await this.publishMetadata(session, snapshot)) this.lastTrack = metadataKey;
      }
      const position = Math.round(snapshot.position * 1000);
      const playbackKey = `${snapshot.songId}:${snapshot.playing}:${position}`;
      if (this.lastPlayback !== playbackKey) {
        await session.setAVPlaybackState({ state: snapshot.playing ? avSession.PlaybackState.PLAYBACK_STATE_PLAY :
          avSession.PlaybackState.PLAYBACK_STATE_PAUSE, position: {
          elapsedTime: position, updateTime: Date.now()
        }, isFavorite: false });
        this.lastPlayback = playbackKey;
      }
      if (snapshot.playing && !this.running) {
        const agent = await wantAgent.getWantAgent({ wants: [{ bundleName: 'com.bogdan.folia', abilityName: 'EntryAbility' }],
          operationType: wantAgent.OperationType.START_ABILITY, requestCode: 0,
          wantAgentFlags: [wantAgent.WantAgentFlags.UPDATE_PRESENT_FLAG] });
        await backgroundTaskManager.startBackgroundRunning(this.context, backgroundTaskManager.BackgroundMode.AUDIO_PLAYBACK, agent);
        this.running = true;
      } else if (!snapshot.playing && this.running) {
        await backgroundTaskManager.stopBackgroundRunning(this.context);
        this.running = false;
      }
      clearTimeout(this.retryTimer);
      this.retryTimer = undefined;
      this.retryDelay = 1000;
    } catch (error) {
      console.warn(`Folia media session: ${String(error)}`);
      // Idle Web snapshots are deduplicated, so transient system failures retry here instead.
      if (!this.released && this.retryTimer === undefined) {
        this.retryTimer = setTimeout(() => {
          this.retryTimer = undefined;
          if (this.latestSnapshot) void this.update(this.latestSnapshot);
        }, this.retryDelay);
        this.retryDelay = Math.min(this.retryDelay * 2, 30000);
      }
    }
  }
  async release(): Promise<void> {
    this.released = true;
    clearTimeout(this.retryTimer);
    clearTimeout(this.artworkRetryTimer);
    this.artworkRequest++;
    this.artworkBuffer = undefined;
    this.pendingSnapshot = undefined;
    await this.updating;
    if (this.running) { try { await backgroundTaskManager.stopBackgroundRunning(this.context); } catch (_) {} }
    if (this.session) { await this.session.destroy(); this.session = undefined; }
  }
}
