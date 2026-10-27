import type { HarmonyWindowInsets } from './contracts';

// Keep native window controls over the full background, with insets only on interactive surfaces.
export function installHarmonyWindowChrome() {
  const applyInsets = ({ enabled, top, right, cutoutTop, cutoutLeft, cutoutRight, cutoutBottom }: HarmonyWindowInsets) => {
    const root = document.documentElement;
    root.toggleAttribute('data-harmony-window', enabled);
    root.style.setProperty('--harmony-window-top', `${Math.max(0, Number(top) || 0)}px`);
    root.style.setProperty('--harmony-window-right', `${Math.max(0, Number(right) || 0)}px`);
    const cameraBottom = Math.max(0, Number(cutoutTop) || 0);
    // Reserve only the measured camera edge plus a small touch/visual gap.
    root.style.setProperty('--harmony-cutout-top', `${cameraBottom > 0 ? cameraBottom + 4 : 0}px`);
    root.style.setProperty('--harmony-cutout-left', `${Math.max(0, Number(cutoutLeft) || 0)}px`);
    root.style.setProperty('--harmony-cutout-right', `${Math.max(0, Number(cutoutRight) || 0)}px`);
    root.style.setProperty('--harmony-cutout-bottom', `${Math.max(0, Number(cutoutBottom) || 0)}px`);
  };
  const onInsetsChange = (event: Event) => {
    applyInsets((event as CustomEvent<HarmonyWindowInsets>).detail);
  };
  window.addEventListener('harmonywindowinsetschange', onInsetsChange);
  const initial = window.FoliaNative?.getWindowInsets?.();
  if (initial) applyInsets(JSON.parse(initial) as HarmonyWindowInsets);
  return () => window.removeEventListener('harmonywindowinsetschange', onInsetsChange);
}
