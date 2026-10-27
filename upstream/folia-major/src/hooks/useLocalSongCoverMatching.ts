import { useEffect, useState } from 'react';
import type { LocalSong } from '../types';
import { getLocalSong } from '../services/db';
import { backfillLocalSongCovers } from '../services/localSongCoverMatchService';
import { LOCAL_MUSIC_SCAN_PROGRESS_EVENT } from '../services/localMusicService';

// src/hooks/useLocalSongCoverMatching.ts
// Runs for the shared Web library, including startup, browser imports and native imports.
export function useLocalSongCoverMatching(songs: LocalSong[], updateSongs: (songs: LocalSong[]) => void): void {
    const [scanning, setScanning] = useState(false);
    useEffect(() => {
        const activeFolders = new Set<string>();
        const scanProgress = (event: Event) => {
            const detail = (event as CustomEvent<{ folderName: string; active: boolean }>).detail;
            if (!detail) return;
            if (detail.active) activeFolders.add(detail.folderName);
            else activeFolders.delete(detail.folderName);
            setScanning(activeFolders.size > 0);
        };
        window.addEventListener(LOCAL_MUSIC_SCAN_PROGRESS_EVENT, scanProgress);
        return () => window.removeEventListener(LOCAL_MUSIC_SCAN_PROGRESS_EVENT, scanProgress);
    }, []);

    useEffect(() => {
        // Embedded-artwork hydration writes whole records. Wait for it before matching online covers.
        if (scanning || songs.length === 0) return;
        let cancelled = false;
        let retry: ReturnType<typeof setTimeout> | undefined;
        const match = async () => {
            const remaining = await backfillLocalSongCovers(songs, async songId => {
                if (cancelled) return;
                const song = await getLocalSong(songId);
                if (!cancelled && song) updateSongs([song]);
            });
            if (!cancelled && remaining > 0) retry = setTimeout(() => { void match(); }, 30000);
        };
        void match();
        return () => { cancelled = true; clearTimeout(retry); };
    }, [songs, scanning, updateSongs]);
}
