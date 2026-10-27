// One capability boundary is shared by the Web settings control and the command palette.
export const hasHarmonyOrientation = () => typeof window !== 'undefined' && !!window.FoliaNative;
export const getHarmonyPortraitMode = () => hasHarmonyOrientation() ? !!window.FoliaNative?.getPortraitMode() : false;
export const setHarmonyPortraitMode = (enabled: boolean) => window.FoliaNative?.setPortraitMode(enabled);
export const hasHarmonyKeepScreenOn = () => typeof window !== 'undefined'
  && typeof window.FoliaNative?.getKeepScreenOn === 'function' && typeof window.FoliaNative?.setKeepScreenOn === 'function';
export const getHarmonyKeepScreenOn = () => hasHarmonyKeepScreenOn() ? !!window.FoliaNative?.getKeepScreenOn?.() : false;
export const setHarmonyKeepScreenOn = (enabled: boolean) => window.FoliaNative?.setKeepScreenOn?.(enabled);
