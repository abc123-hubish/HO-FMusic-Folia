import React, { useState } from 'react';
import VisPlayground from '../../src/components/visualizer/VisPlayground';
import { DEFAULT_THEME } from '../../src/services/baseThemes';
import type { Theme, VisualizerMode } from '../../src/types';
import { useTypographySettingsStore } from '../../src/stores/useTypographySettingsStore';
import { useVisualizerSettingsStore } from '../../src/stores/useVisualizerSettingsStore';
import { useAppPreferences } from '../../src/hooks/useAppPreferences';
import type { ProbeDefinition } from './definition';
import '../../src/harmony/mobile.css';

// dev/probes/visPlaygroundHarmony.probe.tsx
function VisPlaygroundHarmonyProbe() {
    const visualizer = useVisualizerSettingsStore();
    const mode = visualizer.visualizerMode;
    const setMode = visualizer.handleSetVisualizerMode;
    const typography = useTypographySettingsStore();
    useAppPreferences();
    const [open, setOpen] = useState(true);
    return <div style={{ '--text-primary': DEFAULT_THEME.primaryColor,
        '--text-secondary': DEFAULT_THEME.secondaryColor } as React.CSSProperties}>
        {open && <VisPlayground theme={DEFAULT_THEME} isDaylight={false} visualizerMode={mode}
            hanabiTuning={visualizer.hanabiTuning} onHanabiTuningChange={visualizer.handleSetHanabiTuning}
            onResetHanabiTuning={visualizer.handleResetHanabiTuning}
            initialEditSection="visualizer" staticMode fontStyle={typography.lyricsFontStyle} fontScale={typography.lyricsFontScale}
            fontWeight={typography.lyricsFontWeight} customFontFamily={typography.lyricsCustomFont?.family ?? null}
            customFontLabel={typography.lyricsCustomFont?.label ?? null}
            onFontStyleChange={typography.handleSetLyricsFontStyle} onFontScaleChange={typography.handleSetLyricsFontScale}
            onFontWeightChange={typography.handleSetLyricsFontWeight} onCustomFontChange={typography.handleSetLyricsCustomFont}
            onUploadCustomFont={typography.handleUploadLyricsCustomFont}
            onVisualizerModeChange={setMode} onClose={() => setOpen(false)} />}
    </div>;
}

const probe: ProbeDefinition = { id: 'visPlaygroundHarmony', title: 'Harmony lyric style layout',
    description: 'Real lyric style editor with preview, tabs and scrolling settings in compact viewports',
    Component: VisPlaygroundHarmonyProbe };
export default probe;
