import { useEffect, useRef, type Dispatch, type SetStateAction } from 'react';
import { useStableCallbacks } from '../../../hooks/useStableCallbacks';
import { useLatticeControlsStore } from '../../../stores/useLatticeControlsStore';
import { useLatticeSettingsStore } from '../../../stores/useLatticeSettingsStore';
import type { SongResult } from '../../../types';
import { getPlaybackSongKey } from '../../../utils/appPlaybackGuards';
import type { QueueInstance } from '../../wall/layout';
import type { WallLayout } from './wallLayout';
import type { LatticeTile } from './latticeModel';

// Follows discrete song changes; per-frame camera movement stays inside useWallCameraPan.

export type ActiveLatticePoster = { instance: QueueInstance; tile: LatticeTile };

type PlaybackFocusOptions = {
    currentSong: SongResult | null;
    /** The tile the wall opens on, whatever is playing: the one it was left on for a collection's page. Null for any other opening. */
    startTileId: string | null;
    /** Held false until the wall has measured itself; centring needs the real viewport. */
    ready: boolean;
    tiles: LatticeTile[];
    /** How the wall is laid out: finds a tile's nearest copy, and where that copy stands grown. */
    layout: WallLayout;
    getViewportCenter: () => { x: number; y: number };
    setActivePoster: Dispatch<SetStateAction<ActiveLatticePoster | null>>;
    setFocused: (instance: QueueInstance | null) => void;
    panTo: (rect: { x: number; y: number; width: number; height: number }, instant?: boolean) => void;
};

export const useLatticePlaybackFocus = ({
    currentSong,
    startTileId,
    ready,
    tiles,
    layout,
    getViewportCenter,
    setActivePoster,
    setFocused,
    panTo,
}: PlaybackFocusOptions) => {
    const lastFocusedSongKeyRef = useRef<string | null>(null);
    const autoFocusOnSongChange = useLatticeSettingsStore(state => state.autoFocusOnSongChange);

    const currentSongKey = currentSong ? getPlaybackSongKey(currentSong) : null;
    // Grows the tile of that id and takes the camera to it.
    const focusTile = (tileId: string | null, instant?: boolean) => {
        if (!tileId) return;
        const queueIndex = tiles.findIndex(tile => tile.id === tileId);
        if (queueIndex < 0) return;
        // The song is drawn in every cell; jump to whichever copy is closest to what is on screen.
        const instance = layout.nearest(queueIndex, getViewportCenter());
        if (!instance) return;

        const tile = tiles[queueIndex];
        setFocused(instance);
        setActivePoster({ instance, tile });
        const expandedRect = layout.grown(instance).get(instance.instanceId);
        if (expandedRect) panTo(expandedRect, instant);
    };
    // Permanent identity, dispatching to this render's closure: the effects below name these, and
    // are not to run again for every queue or camera change.
    const { focusCurrentSong, focusStartTile } = useStableCallbacks({
        focusCurrentSong: (options?: { instant?: boolean }) => focusTile(currentSongKey, options?.instant),
        focusStartTile: () => focusTile(startTileId, true),
    });

    useEffect(() => {
        if (!currentSongKey) {
            lastFocusedSongKeyRef.current = null;
            return;
        }
        if (!ready || lastFocusedSongKeyRef.current === currentSongKey || !tiles.some(tile => tile.id === currentSongKey)) return;
        // The wall opens already centred on what is playing; later song changes fly there.
        const isEntry = lastFocusedSongKeyRef.current === null;
        lastFocusedSongKeyRef.current = currentSongKey;
        // Consume the song change while following is disabled. Turning the setting back on should
        // not steal the viewport immediately; the next song change is the next follow opportunity.
        if (!autoFocusOnSongChange) return;
        focusCurrentSong({ instant: isEntry });
    }, [autoFocusOnSongChange, currentSongKey, focusCurrentSong, ready, tiles]);

    // Come back to from a collection's page, the wall opens on the tile it was left on. After the
    // effect above, so that this tile has the last word over the playing song.
    const hasOpenedRef = useRef(false);
    useEffect(() => {
        if (!ready || hasOpenedRef.current) return;
        hasOpenedRef.current = true;
        focusStartTile();
    }, [focusStartTile, ready]);

    // Keep the existing tool/palette action available only while this wall contains the song.
    const canFocus = Boolean(currentSongKey && tiles.some(tile => tile.id === currentSongKey));
    useEffect(() => useLatticeControlsStore.getState().registerFocus(canFocus ? focusCurrentSong : null), [canFocus, focusCurrentSong]);

};
