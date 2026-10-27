import { useMemo, useSyncExternalStore } from 'react';
import { useTranslation } from 'react-i18next';
import type { SongResult, UnifiedSong } from '../../../../types';
import type { OmniExploreSection, OmniProviderId } from '../../../../types/onlineMusic';
import { getPlaybackSongKey } from '../../../../utils/appPlaybackGuards';
import { recentPlaysOf, replayedSongsOf, watchRecentPlays } from './recentPlays';

// src/components/app/home/explore/ownSections.ts
// The explore page's own sections: what Folia itself knows of the listener, the same under
// every provider. Both are read from its own record of the songs played here (recentPlays.ts),
// for the provider and the account the page is shown for:
//  - "recently played": the songs played here in the last seven days, newest first;
//  - "play again": the songs listened to here more than once, those listened to most of late first.
// A provider's page brings neither (see `OnlineExploreProvider`). All of a section's songs are
// in it: there is nothing "more" could ask for.

const RECENT_SECTION_ID = 'folia-recent-plays';
const AGAIN_SECTION_ID = 'folia-play-again';
/** The ids of the app's own sections, which no read of a provider's page brings or takes away. */
export const OWN_SECTION_IDS: ReadonlySet<string> = new Set([RECENT_SECTION_ID, AGAIN_SECTION_ID]);

const sectionOf = (id: string, title: string, songs: SongResult[]): OmniExploreSection => ({
    id, title, items: songs.map(song => ({ kind: 'song', song: song as UnifiedSong })),
});

// A provider is handed this many of the listener's songs with a read of its page.
const MAX_LISTENED = 30;
/**
 * The songs of the app's own sections as one list, each once, the ones listened to more than
 * once first: what a provider is handed with a read of its page (`OnlineExploreProvider.getFeed`).
 */
export const listenedSongsOf = (providerId: OmniProviderId, accountId: string): UnifiedSong[] => {
    const songs = new Map<string, SongResult>();
    for (const song of [...replayedSongsOf(providerId, accountId), ...recentPlaysOf(providerId, accountId)]) {
        if (!songs.has(getPlaybackSongKey(song))) songs.set(getPlaybackSongKey(song), song);
    }
    return [...songs.values()].slice(0, MAX_LISTENED) as UnifiedSong[];
};

/** The app's own sections that hold something, in the order they stand in, followed as songs are played. */
export const useOwnExploreSections = (providerId: OmniProviderId, accountId: string): OmniExploreSection[] => {
    const { t } = useTranslation();
    const recent = useSyncExternalStore(watchRecentPlays, () => recentPlaysOf(providerId, accountId));
    const replayed = useSyncExternalStore(watchRecentPlays, () => replayedSongsOf(providerId, accountId));
    return useMemo(() => [
        sectionOf(RECENT_SECTION_ID, t('home.exploreRecent'), recent),
        sectionOf(AGAIN_SECTION_ID, t('home.exploreAgain'), replayed),
    ].filter(section => section.items.length > 0), [recent, replayed, t]);
};
