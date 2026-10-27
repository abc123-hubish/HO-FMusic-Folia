import React, { useEffect, useState } from 'react';
import { useThemeController } from '../../src/hooks/useThemeController';
import { saveToCache } from '../../src/services/db';
import { FALLBACK_AI_DUAL_THEME } from '../../src/services/themeSanitizer';
import type { ProbeDefinition } from './definition';

// dev/probes/themePreference.probe.tsx
// Exercise the real controller and IndexedDB across complete browser reloads.

const noop = () => {};
const translate = (key: string) => key;
const cachedTheme = {
    light: { ...FALLBACK_AI_DUAL_THEME.light, name: 'Saved AI light' },
    dark: { ...FALLBACK_AI_DUAL_THEME.dark, name: 'Saved AI dark' },
};

function ThemeControllerProbe() {
    const controller = useThemeController({ defaultTheme: FALLBACK_AI_DUAL_THEME.dark,
        daylightTheme: FALLBACK_AI_DUAL_THEME.light, isDaylight: false,
        setDaylightPreference: noop, t: translate });
    const [restored, setRestored] = useState(false);
    const [generated, setGenerated] = useState(false);
    useEffect(() => {
        let active = true;
        void controller.restoreCachedThemeForSong('theme-preference-song', {
            allowLastUsedFallback: true, preserveCurrentOnMiss: false,
        }).then(() => { if (active) setRestored(true); });
        return () => { active = false; };
    }, [controller.restoreCachedThemeForSong]);
    return <div>
        <output data-theme-mode={controller.bgMode} data-theme-ready={restored}
            data-theme-name={controller.aiTheme?.dark.name ?? ''} data-theme-generated={generated} />
        <button onClick={() => controller.handleBgModeChange('default')}>Default</button>
        <button onClick={() => controller.handleBgModeChange('ai')}>AI</button>
        <button onClick={() => controller.handleBgModeChange('custom')}>Custom</button>
        <button onClick={() => {
            void controller.generateAITheme(null, null, { source: 'auto', generationSource: 'cover' })
                .then(() => setGenerated(true));
        }}>Generate automatic cover theme</button>
    </div>;
}

function ThemePreferenceProbe() {
    const [ready, setReady] = useState(false);
    useEffect(() => {
        let active = true;
        void (async () => {
            const cache = new URLSearchParams(location.search).get('cache');
            if (cache === 'song') await saveToCache('dual_theme_theme-preference-song', cachedTheme);
            if (cache === 'last') await saveToCache('last_dual_theme', cachedTheme);
            if (active) setReady(true);
        })();
        return () => { active = false; };
    }, []);
    return ready ? <ThemeControllerProbe /> : null;
}

const definition: ProbeDefinition = { id: 'themePreference', title: 'Theme selection persistence',
    description: 'Real controller and persisted song themes after reopening', Component: ThemePreferenceProbe };
export default definition;
