import React from 'react';
import { motionValue } from 'framer-motion';
import VisualizerMonet from '../../src/components/visualizer/monet/VisualizerMonet';
import FloatingPlayerControls from '../../src/components/FloatingPlayerControls';
import { PlayerBottomBarLayoutContext } from '../../src/components/floating-player/PlayerBottomBarLayoutContext';
import { DEFAULT_THEME } from '../../src/services/baseThemes';
import { DEFAULT_MONET_TUNING, PlayerState, type Line } from '../../src/types';
import type { ProbeDefinition } from './definition';

// dev/probes/monetMobileLayout.probe.tsx

const variants: Record<string, Line> = {
    credits: {
        startTime: 2, endTime: 12,
        fullText: 'Composed by: Glenn Frey',
        words: [],
    },
    lrc: {
        startTime: 2, endTime: 12,
        fullText: '在这漫长的旅途中我们依然记得那些温柔的时光和未曾说出口的愿望',
        translation: 'On this long journey we still remember the gentle days and all our unspoken wishes.',
        words: [],
    },
    phrase: {
        startTime: 2, endTime: 12,
        fullText: '在这漫长的旅途中我们依然记得那些温柔的时光',
        translation: 'We still remember the gentle days on this long journey.',
        words: [{ text: '在这漫长的旅途中我们依然记得那些温柔的时光', startTime: 2, endTime: 12 }],
    },
    english: {
        startTime: 2, endTime: 12,
        fullText: 'We remember every gentle moment along this unforgettable journey together.',
        translation: '在这段难忘的旅途中，我们记得彼此共同度过的每一个温柔瞬间。',
        words: [],
    },
    graphemes: {
        startTime: 2, endTime: 12,
        fullText: '时光  时光👨‍👩‍👧‍👦温柔的愿望café，依然记得时光  时光👨‍👩‍👧‍👦温柔的愿望café。',
        translation: '重复词、连续空格、组合字符和完整的表情符号。',
        words: [],
    },
};

const MonetMobileLayoutProbe: React.FC = () => {
    const [variant, setVariant] = React.useState('lrc');
    const [fontScale, setFontScale] = React.useState(DEFAULT_MONET_TUNING.fontScale);
    const [livePlayer, setLivePlayer] = React.useState(false);
    const currentTime = React.useMemo(() => motionValue(6), []);
    const audioPower = React.useMemo(() => motionValue(0), []);
    const audioBands = React.useMemo(() => ({ bass: motionValue(0), lowMid: motionValue(0), mid: motionValue(0), vocal: motionValue(0), treble: motionValue(0) }), []);
    const lines = React.useMemo<Line[]>(() => [
        { startTime: 0, endTime: 2, fullText: variant === 'credits' ? 'Lyrics by: Glenn Frey' : '上一句歌词', words: [] },
        variants[variant],
        { startTime: 12, endTime: 14, fullText: variant === 'credits' ? '••••••' : '下一句歌词', words: [] },
        { startTime: 14, endTime: 18, fullText: 'On a dark desert highway', words: [] },
    ], [variant]);

    return (
        <div className="relative h-dvh w-full" style={{ background: DEFAULT_THEME.backgroundColor }}>
            <div className="fixed right-2 top-2 z-90 flex gap-2 text-white">
                {Object.keys(variants).map(value => <button key={value} data-variant={value} onClick={() => setVariant(value)}>{value}</button>)}
                <button data-large-font onClick={() => setFontScale(value => value === DEFAULT_MONET_TUNING.fontScale ? 1.5 : DEFAULT_MONET_TUNING.fontScale)}>font</button>
                <button data-live-player onClick={() => setLivePlayer(value => !value)}>player</button>
            </div>
            <PlayerBottomBarLayoutContext.Provider value={livePlayer}>
            <VisualizerMonet
                currentTime={currentTime} currentLineIndex={1} lines={lines}
                theme={DEFAULT_THEME} audioPower={audioPower} audioBands={audioBands}
                coverUrl={'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect width="400" height="400" fill="%23b87f52"/%3E%3Cpath d="M0 300L160 100L400 320V400H0Z" fill="%236e5742"/%3E%3C/svg%3E'}
                songTitle={variant === 'credits' ? 'Hotel California' : '在旅途中记得那些温柔的时光'}
                songArtist={variant === 'credits' ? 'Eagles' : '歌手'}
                songAlbum={variant === 'credits' ? 'HOTEL CALIFORNIA' : '旅途'}
                staticMode isPreviewMode={!livePlayer}
                monetTuning={{ ...DEFAULT_MONET_TUNING, fontScale, showAudioVisualization: false }}
            />
            </PlayerBottomBarLayoutContext.Provider>
            {livePlayer && <FloatingPlayerControls
                currentSong={{ name: 'Hotel California' }} playerState={PlayerState.PLAYING}
                currentTime={currentTime} duration={391} loopMode="all" currentView="player"
                audioSrc="probe://audio" canTogglePlay lyrics={null} isDaylight={false}
                onSeek={value => currentTime.set(value)} onTogglePlay={() => {}}
                onToggleLoop={() => {}} onNavigateToPlayer={() => {}}
                slotPrimary="loop" slotSecondary="lyrics-timeline"
                slotContext={{
                    onShuffle: () => {}, canShuffle: true, onLike: () => {},
                    isLiked: false, likeDisabled: false,
                    invokeCommandById: () => {}, canInvokeCommandById: () => true,
                }}
                onCommitBottomBarOffset={() => {}}
            />}
        </div>
    );
};

const definition: ProbeDefinition = {
    id: 'monetMobileLayout',
    title: 'Monet 手机歌词布局',
    description: '手机竖屏和横屏下，整句 LRC 与超宽逐词歌词应完整换行，翻译不重叠。',
    Component: MonetMobileLayoutProbe,
};

export default definition;
