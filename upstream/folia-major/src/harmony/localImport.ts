import type { LocalSong } from '../types';
import type { NativeFile } from './contracts';
import { assignImportedSongs } from '../services/localLibraryImportCatalog';
import { parseEmbeddedMetadataAsync } from '../utils/localMetadataWorkerClient';
import { prepareLocalCoverBlob, stageLocalCoverAsset } from '../services/localCoverAssetService';
import { extractMetadataFromFilename, getAudioDuration } from '../services/localMusicService';
import { getLocalSongs } from '../services/db';
import { readLyricFile } from '../utils/lyrics/lyricFileDecoding';
import { buildImportedMetadataSnapshot } from '../utils/localSongMetadata';
import { getLocalLyricFilePriority } from '../utils/lyrics/localLyricFormatOrder';
import { useLyricSettingsStore } from '../stores/useLyricSettingsStore';

// Keep native files in the original catalogue, including format priority, translations and folder covers.
const audioExtension = /\.(mp3|flac|m4a|aac|wav|ogg|opus|aiff|aif|wma|alac|ape|wv|tta|caf)$/i;
const pathOf = (file: NativeFile) => file.relativePath || `HarmonyOS/${file.name}`;
const parentOf = (path: string) => path.slice(0, path.lastIndexOf('/'));
const baseOf = (path: string) => path.replace(audioExtension, '').toLowerCase();
let reconciliation: Promise<void> = Promise.resolve();

export function importHarmonyFiles(files: NativeFile[]): Promise<void> {
  // React StrictMode and simultaneous native imports must not race the catalogue transaction.
  const next = reconciliation.then(() => reconcile(files), () => reconcile(files));
  reconciliation = next;
  return next;
}

async function reconcile(files: NativeFile[]): Promise<void> {
  const existing = new Map((await getLocalSongs()).map(song => [song.id, song]));
  const order = useLyricSettingsStore.getState().localLyricFormatOrder;
  const lyrics = new Map<string, NativeFile>(), translations = new Map<string, NativeFile>();
  const covers = new Map<string, NativeFile>();
  const coverPriority = ['cover.png', 'cover.jpg', 'cover.jpeg'];
  for (const file of files) {
    const path = pathOf(file);
    const translated = /\.t\.(lrc|vtt)$/i.test(file.name) || /\.tlrc$/i.test(file.name);
    if (/\.(lrc|tlrc|vtt|ttml|qrc|yrc|krc|fia)$/i.test(file.name)) {
      const map = translated ? translations : lyrics;
      const key = baseOf(path.replace(translated ? /(\.t\.(lrc|vtt)|\.tlrc)$/i : /\.(lrc|vtt|ttml|qrc|yrc|krc|fia)$/i, ''));
      const previous = map.get(key);
      if (!previous || getLocalLyricFilePriority(file.name, order) < getLocalLyricFilePriority(previous.name, order)) map.set(key, file);
    }
    const priority = coverPriority.indexOf(file.name.toLowerCase());
    const previousCover = covers.get(parentOf(path));
    if (priority >= 0 && (!previousCover || priority < coverPriority.indexOf(previousCover.name.toLowerCase()))) {
      covers.set(parentOf(path), file);
    }
  }
  const readBlob = async (file: NativeFile) => {
    const response = await fetch(file.url);
    if (!response.ok) throw new Error(`无法读取文件：${file.name}`);
    return response.blob();
  };
  const preparedCovers = new Map<string, Promise<Awaited<ReturnType<typeof prepareLocalCoverBlob>>>>();
  const songs: LocalSong[] = [];
  for (const item of files.filter(file => audioExtension.test(file.name))) {
    const path = pathOf(item), previous = existing.get(item.id);
    const lyric = lyrics.get(baseOf(path)), translation = translations.get(baseOf(path));
    const cover = covers.get(parentOf(path));
    const revision = JSON.stringify([lyric?.id, lyric?.modified, lyric?.size, translation?.id, translation?.modified, translation?.size]);
    const sidecarChanged = revision !== previous?.nativeSidecarRevision;
    let song: LocalSong;
    if (previous) {
      song = { ...previous, filePath: path, nativeFileUrl: item.url };
    } else {
      const file = new File([await readBlob(item)], item.name, { type: item.mime, lastModified: item.modified });
      const metadata = await parseEmbeddedMetadataAsync(file, true);
      const inferred = extractMetadataFromFilename(item.name);
      const importedMetadata = buildImportedMetadataSnapshot({ fileName: item.name,
        embeddedTitle: metadata?.title, fallbackTitle: inferred.title, embeddedArtist: metadata?.artist,
        embeddedArtists: metadata?.artists, fallbackArtist: inferred.artist, embeddedAlbum: metadata?.album });
      song = { id: item.id, fileName: item.name, filePath: path, nativeFileUrl: item.url,
        duration: metadata?.duration || await getAudioDuration(file), fileSize: item.size,
        fileLastModified: item.modified, mimeType: item.mime, addedAt: Date.now(),
        title: importedMetadata.title, titleOrigin: 'import', importedMetadata,
        localCoverAssetId: metadata?.coverAssetId, localCoverSource: metadata?.cover ? 'embedded' : undefined,
        trackNumber: metadata?.trackNumber, discNumber: metadata?.discNumber, bitrate: metadata?.bitrate,
        replayGain: metadata?.replayGain, replayGainTrackGain: metadata?.replayGainTrackGain,
        replayGainTrackPeak: metadata?.replayGainTrackPeak, replayGainAlbumGain: metadata?.replayGainAlbumGain,
        replayGainAlbumPeak: metadata?.replayGainAlbumPeak, folderName: path.split('/')[0], noAutoMatch: false,
        hasEmbeddedLyrics: Boolean(metadata?.lyrics), embeddedLyricsContent: metadata?.lyrics,
        hasEmbeddedTranslationLyrics: Boolean(metadata?.translationLyrics), embeddedTranslationLyricsContent: metadata?.translationLyrics,
      };
      stageLocalCoverAsset(metadata?.coverAssetId, metadata?.cover);
    }
    if (lyric && sidecarChanged) {
      song.localLyricsContent = await readLyricFile(await readBlob(lyric));
      song.hasLocalLyrics = Boolean(song.localLyricsContent);
      const extension = lyric.name.toLowerCase().split('.').pop();
      song.localLyricsFormat = extension === 'lrc' || extension === 'fia' ? undefined : extension as LocalSong['localLyricsFormat'];
      song.localLyricsOrigin = 'sidecar';
    }
    if (translation && sidecarChanged) {
      song.localTranslationLyricsContent = await readLyricFile(await readBlob(translation));
      song.hasLocalTranslationLyrics = Boolean(song.localTranslationLyricsContent);
      song.localTranslationLyricsOrigin = 'sidecar';
    }
    song.nativeSidecarRevision = revision;
    if (cover && (sidecarChanged || !previous?.localCoverAssetId)) {
      if (!preparedCovers.has(cover.id)) preparedCovers.set(cover.id, readBlob(cover).then(prepareLocalCoverBlob));
      const prepared = await preparedCovers.get(cover.id);
      if (prepared?.assetId) { song.localCoverAssetId = prepared.assetId; song.localCoverSource = 'folder'; }
    }
    if (!previous || sidecarChanged || song.filePath !== previous.filePath || song.localCoverAssetId !== previous.localCoverAssetId) songs.push(song);
  }
  await assignImportedSongs(songs);
}
