import React from 'react';
import { Disc, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { SongResult } from '../../types';
import { getProviderSongMetadata } from '../../services/onlineMusic/songMetadata';
import { getSizedCoverUrl } from '../../utils/coverUrl';

// src/components/panelTab/CompactSongHeader.tsx
// Compact now-playing row; the cover expands the existing artwork shortcuts.

interface CompactSongHeaderProps {
    currentSong: SongResult | null;
    coverUrl: string | null;
    isLiked: boolean;
    onLike: () => void;
    likeDisabled: boolean;
    likeDisabledReason?: string;
    coverActionsOpen: boolean;
    onToggleCoverActions: () => void;
    onShowCover: () => void;
}

const CompactSongHeader: React.FC<CompactSongHeaderProps> = ({ currentSong, coverUrl,
    isLiked, onLike, likeDisabled, likeDisabledReason, coverActionsOpen, onToggleCoverActions, onShowCover }) => {
    const { t } = useTranslation();
    const artists = currentSong ? getProviderSongMetadata(currentSong).artists.map(artist => artist.name).join(' / ') : '';
    const title = currentSong?.name || t('ui.noTrack');
    return <header data-testid="panel-song-header" className="flex min-w-0 items-center gap-3 border-b border-current/10 pb-4">
        <button type="button" data-ponder-panel-artwork onClick={onToggleCoverActions}
            aria-label={t('panel.cover')} aria-expanded={coverActionsOpen}
            className="relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-current/5 shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2">
            {coverUrl ? <img src={getSizedCoverUrl(coverUrl, 128)} alt="Art" decoding="async" className="h-full w-full object-cover" />
                : <Disc size={24} className="opacity-30" />}
        </button>
        <button type="button" onClick={onShowCover} className="min-w-0 flex-1 text-left">
            <span data-testid="panel-song-title" title={title} className="block truncate text-sm font-semibold leading-5">{title}</span>
            <span data-testid="panel-song-artists" title={artists} className="mt-1 block min-h-[18px] truncate text-xs leading-[18px] opacity-60">{artists}</span>
        </button>
        <button type="button" onClick={onLike} disabled={likeDisabled} aria-pressed={isLiked}
            title={likeDisabledReason || (isLiked ? t('player.unlike') : t('player.like'))}
            aria-label={likeDisabledReason || (isLiked ? t('player.unlike') : t('player.like'))}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-current/5 disabled:cursor-not-allowed disabled:opacity-30"
            style={isLiked ? { color: '#f2607a' } : undefined}>
            <Heart size={21} fill={isLiked ? 'currentColor' : 'none'} />
        </button>
    </header>;
};

export default CompactSongHeader;
