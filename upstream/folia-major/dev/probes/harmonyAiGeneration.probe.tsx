import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ProbeDefinition } from './definition';
import ThemeQuickEditorHost from '../../src/components/panelTab/ThemeQuickEditor';
import { useThemeController } from '../../src/hooks/useThemeController';
import { useThemeQuickEditorContext } from '../../src/hooks/useThemeQuickEditorContext';
import { useSongThemeAutoGeneration } from '../../src/hooks/useSongThemeAutoGeneration';
import ThemeSourceRow from '../../src/components/panelTab/controls/ThemeSourceRow';
import { usePlaybackStore } from '../../src/stores/usePlaybackStore';
import { useThemeQuickEditorStore } from '../../src/stores/useThemeQuickEditorStore';
import { saveToCache } from '../../src/services/db';
import { FALLBACK_AI_DUAL_THEME } from '../../src/services/themeSanitizer';
import { getPlaybackSongKey } from '../../src/utils/appPlaybackGuards';
import type { LyricData, SongResult } from '../../src/types';

const song: SongResult = { id: 'ai-editor-one', name: 'Evening song', artists: [], album: { id: 1, name: 'Test' }, durationMs: 180000 };
const lyrics: LyricData = { title: song.name, lines: [{ fullText: 'The evening sky glows blue', startTime: 0, endTime: 180, words: [] }] };
const noop = () => {};

function HarmonyAiGenerationProbe() {
    const { t } = useTranslation();
    const [ready, setReady] = useState(false);
    const controller = useThemeController({ defaultTheme: FALLBACK_AI_DUAL_THEME.dark,
        daylightTheme: FALLBACK_AI_DUAL_THEME.light, isDaylight: false, setDaylightPreference: noop, t });
    useThemeQuickEditorContext({ aiTheme: controller.aiTheme, customTheme: controller.customTheme,
        bgMode: controller.bgMode, coverUrl: null, restoreCachedThemeForSong: controller.restoreCachedThemeForSong });
    useSongThemeAutoGeneration({ enabled: controller.songThemeAutoSwitchEnabled && controller.songThemeAutoGenerateEnabled
        && (!controller.harmonyAiEnabled || controller.bgMode === 'ai'), isLyricsLoading: false,
        themeGenerationSource: controller.harmonyAiEnabled ? 'ai' : controller.themeGenerationSource,
        generateAITheme: controller.generateAITheme,
        prepareCurrentSongAiTheme: controller.harmonyAiEnabled ? controller.prepareCurrentSongAiTheme : undefined });
    useEffect(() => {
        let cancelled = false;
        void (async () => {
            const params = new URLSearchParams(location.search);
            const cache = params.get('cache');
            if (cache) {
                const provider = cache === 'cover' ? 'Built-in' : 'OpenAI Compatible (Local)';
                await saveToCache(`dual_theme_${getPlaybackSongKey(song)}`, {
                    light: { ...FALLBACK_AI_DUAL_THEME.light, name: 'Cached light', provider },
                    dark: { ...FALLBACK_AI_DUAL_THEME.dark, name: 'Cached dark', provider },
                });
            }
            if (cancelled) return;
            usePlaybackStore.setState({ currentSong: { ...song, isPureMusic: params.has('pure') },
                lyrics: params.has('noLyrics') ? null : lyrics });
            setReady(true);
        })();
        return () => { cancelled = true; };
    }, []);
    return <div style={{ padding: 20, background: '#202022', color: '#eeeeee', minHeight: '100vh' }}>
        <div data-ai-ready={ready} data-ai-mode={controller.bgMode} data-ai-name={controller.aiTheme?.dark.name} data-ai-auto={controller.songThemeAutoGenerateEnabled} />
        <div style={{ maxWidth: 360 }}>
            <ThemeSourceRow themeSourceModel={controller.themeSourceModel} onBgModeChange={controller.handleBgModeChange}
                hasCustomTheme={controller.hasCustomTheme} defaultTheme={FALLBACK_AI_DUAL_THEME.dark}
                daylightTheme={FALLBACK_AI_DUAL_THEME.light} isDaylight={false}
                autoGenerateEnabled={controller.songThemeAutoGenerateEnabled} onAutoGenerateChange={controller.handleSongThemeAutoGenerateChange} />
        </div>
        <button onClick={() => controller.handleBgModeChange('ai')}>Select AI theme</button>
        <button onClick={() => useThemeQuickEditorStore.getState().openEditor('ai')}>Open AI editor</button>
        <button data-ai-next onClick={() => usePlaybackStore.setState({ currentSong: { ...song, id: 'ai-editor-two', name: 'Second song' },
            lyrics: { ...lyrics, lines: [{ ...lyrics.lines[0], fullText: 'Second song lyrics with golden light' }] } })}>Next song</button>
        <button data-ai-first onClick={() => usePlaybackStore.setState({ currentSong: song, lyrics })}>First song</button>
        <button data-ai-third onClick={() => usePlaybackStore.setState({ currentSong: { ...song, id: 'ai-editor-three', name: 'Third song' },
            lyrics: { ...lyrics, lines: [{ ...lyrics.lines[0], fullText: 'Third song lyrics beneath silver stars' }] } })}>Third song</button>
        <button data-ai-next-empty onClick={() => usePlaybackStore.setState({ currentSong: { ...song, id: 'ai-editor-two', name: 'Second song' }, lyrics: null })}>Next song without lyrics</button>
        <button data-ai-default onClick={() => controller.handleBgModeChange('default')}>Default theme</button>
        <button data-ai-lyrics onClick={() => usePlaybackStore.setState({ lyrics })}>Load lyrics</button>
        <ThemeQuickEditorHost onSaveAiTheme={controller.saveEditedAiDualTheme} onSaveCustomTheme={controller.saveCustomDualTheme}
            prepareCurrentSongAiTheme={controller.prepareCurrentSongAiTheme} />
    </div>;
}

const definition: ProbeDefinition = { id: 'harmonyAiGeneration', title: 'AI theme selection and editor',
    description: 'Real theme controller, cache and quick editor with a native AI transport mock', Component: HarmonyAiGenerationProbe };
export default definition;
