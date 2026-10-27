import React, { useEffect, useState } from 'react';
import '../../src/i18n/config';
import type { ProbeDefinition } from './definition';
import { useAccountProbeEnvironment, useAccountProbeModel } from './accountBehavior/useAccountProbeHarness';
import LoginHost from '../../src/components/login/LoginHost';
import { openLoginWindow } from '../../src/components/login/loginWindowStore';
import ControlsTab from '../../src/components/panelTab/ControlsTab';
import { DEFAULT_THEME, DAYLIGHT_THEME } from '../../src/services/baseThemes';
import { buildThemeSourceModel } from '../../src/hooks/themeControllerState';
import { useVisualizerSettingsStore } from '../../src/stores/useVisualizerSettingsStore';
import { ACCOUNT_ALPHA } from './accountBehavior/accountFixtureRules';
import { installHarmonyWindowChrome } from '../../src/harmony/windowChrome';
import '../../src/harmony/mobile.css';

// dev/probes/loginPanel.probe.tsx
// Exercise shared account presentation against the real account controller and existing fake auth ports.
const Stage = () => {
    const { account } = useAccountProbeModel();
    const [theme, setTheme] = useState(DEFAULT_THEME);
    const [volume, setVolume] = useState(.7);
    const [light, setLight] = useState(false);
    const [loop, setLoop] = useState<'off' | 'all' | 'one'>('off');
    const [liked, setLiked] = useState(false);
    const mode = useVisualizerSettingsStore(state => state.visualizerMode);
    const setMode = useVisualizerSettingsStore(state => state.handleSetVisualizerMode);
    const themeSourceModel = buildThemeSourceModel({ bgMode: 'default', aiTheme: null, legacyTheme: null, customTheme: null, isDaylight: light,
        defaultTheme: DEFAULT_THEME, daylightTheme: DAYLIGHT_THEME, currentSongHasLocalAiTheme: false });
    return <main className={`min-h-screen p-4 ${light ? 'bg-zinc-100 text-zinc-900' : 'bg-zinc-950 text-zinc-100'}`}>
        <button onClick={() => openLoginWindow(ACCOUNT_ALPHA)} className="mb-4 rounded-xl bg-white/10 p-3">Open shared login</button>
        <div className="w-[320px] max-w-full rounded-3xl border border-current/10 p-5">
            <ControlsTab theme={theme} onThemeChange={setTheme} isDaylight={light} onToggleDaylight={() => setLight(!light)}
                loopMode={loop} onToggleLoop={() => setLoop(loop === 'off' ? 'all' : loop === 'all' ? 'one' : 'off')}
                onLike={() => setLiked(!liked)} isLiked={liked} onGenerateAITheme={() => {}} isGeneratingTheme={false} canGenerateAITheme={false}
                bgMode="default" onBgModeChange={() => {}} hasCustomTheme={false} themeSourceModel={themeSourceModel}
                defaultTheme={DEFAULT_THEME} daylightTheme={DAYLIGHT_THEME} visualizerMode={mode} onVisualizerModeChange={setMode}
                useCoverColorBg={false} onToggleCoverColorBg={() => {}} volume={volume} isMuted={false}
                onVolumePreview={setVolume} onVolumeChange={setVolume} onToggleMute={() => setVolume(volume ? 0 : .7)} />
        </div>
        <LoginHost account={account} />
    </main>;
};
const LoginPanelProbe = () => {
    useEffect(() => installHarmonyWindowChrome(), []);
    const ready = useAccountProbeEnvironment();
    return ready ? <Stage /> : null;
};
export default { id: 'loginPanel', title: 'Shared login and player controls', description: 'Responsive account window and compact player controls.', Component: LoginPanelProbe } satisfies ProbeDefinition;
