import type { LocalSong, SongResult } from '../types';
import { getLocalSong } from './db';
import { omni } from './onlineMusic/omni';
import { normalizeOnlineMetadataCandidate, type OnlineMetadataCandidate } from './onlineMetadataSearchService';
import { applyLocalSongMatchSelection } from './localSongMatchSelectionService';
import { calculateMatchScoreDetails } from '../utils/lyrics/matchScore';
import { extractMetadataFromFilename } from './localMusicService';
import { getPreferredLocalSongCoverUrl } from './localCoverAssetUrl';
import { hasHarmonyLocalCoverBridge, requestHarmonyLocalCover } from '../harmony/localCover';

// src/services/localSongCoverMatchService.ts
// Fills missing local artwork through NetEase without changing imported metadata or lyrics.
const pending = new Map<string, Promise<boolean>>();
const completed = new Map<string, boolean>();
const imageChecks = new Map<string, Promise<boolean>>();

const canAutoMatch = (song: LocalSong): boolean => !song.noAutoMatch
    && !(song.useOnlineCover === false && song.hasManualLyricSelection)
    && song.onlineMetadata?.matchMode !== 'manual';

const importedArtist = (song: LocalSong): string => (
    song.importedMetadata?.artistNames?.join(', ')
    || song.onlineMetadata?.artists.map(artist => artist.name).join(', ')
    || ''
);

// Covers follow the title the card shows; the filename is only a fallback for rows without a title.
const coverTarget = (song: LocalSong) => ({
    title: (song.title || extractMetadataFromFilename(song.fileName).title || '').trim(),
    artist: importedArtist(song),
    durationMs: song.duration || 0,
});

// A saved URL or asset id is not proof that a card can paint it (e.g. a missing Web cover route).
const canReadImage = (url: string): Promise<boolean> => {
    if (typeof Image === 'undefined') return Promise.resolve(true);
    const previous = imageChecks.get(url);
    if (previous) return previous;
    const request = new Promise<boolean>(resolve => {
        const image = new Image();
        const finish = (readable: boolean) => {
            clearTimeout(timer); image.onload = null; image.onerror = null;
            resolve(readable);
        };
        const timer = setTimeout(() => finish(false), 8000);
        image.referrerPolicy = 'no-referrer';
        image.onload = () => finish(image.naturalWidth > 0);
        image.onerror = () => finish(false);
        image.src = url;
    });
    // Failed routes can recover after import or an offline connection; never memoize a broken image forever.
    void request.then(readable => { if (!readable) imageChecks.delete(url); });
    imageChecks.set(url, request);
    return request;
};

const needsCover = async (song: LocalSong): Promise<boolean> => {
    if (!canAutoMatch(song)) return false;
    const url = getPreferredLocalSongCoverUrl(song);
    return !url || !await canReadImage(url);
};

// The Harmony host downloads NetEase artwork itself, so a title match here does not depend on the
// WebView being able to call the API or paint the provider CDN.
async function matchHarmonyCover(song: LocalSong, target: ReturnType<typeof coverTarget>): Promise<OnlineMetadataCandidate | null> {
    const resolved = await requestHarmonyLocalCover({
        title: target.title,
        artist: target.artist,
        durationMs: target.durationMs,
    });
    if (!resolved?.url) return null;
    return {
        source: 'netease',
        songId: resolved.songId ?? `harmony-cover:${song.id}`,
        title: resolved.title || target.title,
        artists: resolved.artist ? resolved.artist.split(',').map(name => ({ name: name.trim() })).filter(artist => artist.name) : [],
        coverUrl: resolved.url.replace(/^http:/i, 'https:'),
        durationMs: target.durationMs,
        score: 1,
        titleMatched: true,
        durationMatched: null,
        raw: {} as SongResult,
    };
}

async function matchWebCover(target: ReturnType<typeof coverTarget>): Promise<OnlineMetadataCandidate | null> {
    const page = await omni.searchProviderSongs('netease', target.title, { limit: 10, offset: 0 });
    const matches = page.items.map(result => ({ result, details: calculateMatchScoreDetails(target, result) }))
        .filter(({ details }) => details.titleMatched)
        .sort((a, b) => b.details.titleSimilarity - a.details.titleSimilarity);
    for (const { result: best } of matches) {
        const result = best.album?.coverUrl ? best : await omni.getSongDetail('netease', best.id);
        if (!result) continue;
        const match = normalizeOnlineMetadataCandidate('netease', result, target);
        if (!match.coverUrl) continue;
        match.coverUrl = match.coverUrl.replace(/^http:/i, 'https:');
        if (await canReadImage(match.coverUrl)) return match;
    }
    return null;
}

// Recheck the persisted selection after network requests so edits and deletions win over late matches.
async function applyCoverCandidate(
    song: LocalSong,
    target: ReturnType<typeof coverTarget>,
    candidate: OnlineMetadataCandidate,
): Promise<boolean> {
    const current = await getLocalSong(song.id);
    if (!current || !canAutoMatch(current)
        || (current.useOnlineCover === false && current.useOnlineCover !== song.useOnlineCover)
        || JSON.stringify(coverTarget(current)) !== JSON.stringify(target)) return false;
    if (getPreferredLocalSongCoverUrl(current) !== getPreferredLocalSongCoverUrl(song)
        && !await needsCover(current)) return false;
    await applyLocalSongMatchSelection({
        songId: current.id,
        candidate,
        metadata: 'keep',
        cover: 'online',
        lyrics: 'keep',
        matchMode: 'automatic',
    });
    return true;
}

async function matchCover(song: LocalSong): Promise<boolean> {
    const target = coverTarget(song);
    if (!target.title) return false;
    // Use exactly the same Omni/NetEase search as the search page before trying the host fallback.
    try {
        const candidate = await matchWebCover(target);
        if (candidate && await applyCoverCandidate(song, target, candidate)) return true;
    } catch (error) {
        console.warn('[LocalMusic] NetEase cover search failed:', error);
        if (!hasHarmonyLocalCoverBridge()) throw error;
    }
    if (hasHarmonyLocalCoverBridge()) {
        const nativeCandidate = await matchHarmonyCover(song, target);
        if (nativeCandidate && await applyCoverCandidate(song, target, nativeCandidate)) return true;
    }
    return false;
}

// Imports stay available while two workers fill artwork; overlapping startup/import runs share requests.
export async function backfillLocalSongCovers(
    songs: LocalSong[],
    onUpdated?: (songId: string) => Promise<void>,
): Promise<number> {
    let next = 0;
    let remaining = 0;
    const worker = async () => {
        while (next < songs.length) {
            const song = songs[next++];
            if (!await needsCover(song)) continue;
            const key = JSON.stringify([song.id, song.fileLastModified, coverTarget(song)]);
            let request = pending.get(key);
            if (!request && completed.has(key)) {
                const stored = await getLocalSong(song.id);
                if (stored && await needsCover(stored)) completed.delete(key);
            }
            // A newer Web effect may still hold the pre-match row after the original subscriber unmounted.
            if (!request && completed.has(key)) request = Promise.resolve(completed.get(key)!);
            if (!request) {
                request = matchCover(song).then(updated => {
                    if (updated) completed.set(key, updated);
                    return updated;
                }).finally(() => pending.delete(key));
                pending.set(key, request);
            }
            try {
                if (await request) await onUpdated?.(song.id);
                else remaining += 1;
            } catch (error) {
                remaining += 1;
                console.warn(`[LocalMusic] Failed to match NetEase cover for ${song.fileName}:`, error);
            }
        }
    };
    await Promise.all([worker(), worker()]);
    return remaining;
}
