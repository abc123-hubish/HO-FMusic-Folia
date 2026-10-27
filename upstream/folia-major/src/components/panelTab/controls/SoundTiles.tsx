import QuickTile from './QuickTile';
import React from 'react';
import { Blend, Repeat, Repeat1, RepeatOff, SlidersHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAutomixSettingsStore } from '../../../stores/useAutomixSettingsStore';
import { useAudioSettingsStore } from '../../../stores/useAudioSettingsStore';
import { noteLoopButtonPress } from '../../../services/ponder/loopShuffleHint';

// src/components/panelTab/controls/SoundTiles.tsx
// Existing loop, automix and equalizer actions presented as three labelled tiles, as upstream.
export default function SoundTiles({ loopMode, onToggleLoop, loopToggleDisabled, isDaylight }: {
    loopMode: 'off' | 'all' | 'one'; onToggleLoop: () => void; loopToggleDisabled: boolean; isDaylight: boolean;
}) {
    const { t } = useTranslation();
    const automix = useAutomixSettingsStore(state => state.automixEnabled);
    const toggleAutomix = useAutomixSettingsStore(state => state.handleToggleAutomix);
    const equalizer = useAudioSettingsStore(state => state.audioEqualizerSettings.enabled);
    const openEqualizer = useAudioSettingsStore(state => state.openAudioEqualizer);
    const Loop = loopMode === 'one' ? Repeat1 : loopMode === 'off' ? RepeatOff : Repeat;
    const tiles = [
        { icon: Loop, label: t(loopMode === 'off' ? 'player.loopOff' : loopMode === 'one' ? 'player.loopOne' : 'player.loopAll'), active: loopMode !== 'off', disabled: loopToggleDisabled,
            onClick: () => { onToggleLoop(); noteLoopButtonPress(); } },
        { icon: Blend, label: t('ui.automix'), active: automix, onClick: () => toggleAutomix(!automix) },
        { icon: SlidersHorizontal, label: t('ui.equalizerTitle'), active: equalizer, onClick: openEqualizer },
    ];
    return <div className="mt-2 grid grid-cols-3 gap-2" data-testid="panel-sound-tiles">{tiles.map((tile, index) => <QuickTile key={tile.label}
        kind={index === 2 ? 'open' : 'toggle'} icon={<tile.icon size={18} />} iconKey={index === 0 ? loopMode : undefined}
        label={tile.label} lit={tile.active} disabled={tile.disabled} aria-label={index === 2 ? t('ui.openEqualizer') : tile.label}
        data-ponder={index === 2 ? 'audio-equalizer' : undefined}
        onClick={event => { event.stopPropagation(); tile.onClick(); }} />)}</div>;
}
