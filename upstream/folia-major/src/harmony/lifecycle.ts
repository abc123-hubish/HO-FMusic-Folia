import { isAppVisible, refreshAppVisibility, setAppForeground, subscribeAppVisibility } from '../services/appVisibility';
import { setGlobalVisualizerRenderingActive } from '../utils/frameRateLimiter';

// src/harmony/lifecycle.ts
// Install before the renderer so an app loaded in the background never starts a visual frame loop.
export function installHarmonyLifecycle() {
    const sync = () => {
        const visible = isAppVisible();
        document.documentElement.toggleAttribute('data-harmony-background', !visible);
        setGlobalVisualizerRenderingActive(visible);
    };
    window.HarmonyLifecycle = { setForeground: setAppForeground };
    document.addEventListener('visibilitychange', refreshAppVisibility);
    subscribeAppVisibility(sync);
    setAppForeground(window.FoliaNative?.getForeground?.() ?? true);
    sync();
}
