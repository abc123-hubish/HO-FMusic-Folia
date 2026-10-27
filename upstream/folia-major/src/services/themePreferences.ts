import { DualTheme, Theme } from '../types';

// Shared helpers for persisted theme preferences and applied theme selection.

export type ThemeAnimationIntensity = Theme['animationIntensity'];
// Where a song theme comes from: the AI model reading the lyrics, or the cover's own palette.
export type ThemeGenerationSource = 'ai' | 'cover';
export type LastAppliedThemePointer = 'default' | 'ai' | 'custom';
export type ThemePreferenceSwitchState = {
    isCustomThemePreferred: boolean;
    songThemeAutoSwitchEnabled: boolean;
    songThemeAutoGenerateEnabled: boolean;
};

const THEME_ANIMATION_INTENSITY_KEY = 'theme_animation_intensity';
const THEME_GENERATION_SOURCE_KEY = 'theme_generation_source';
const THEME_AUTO_SWITCH_KEY = 'theme_auto_switch_enabled';
const THEME_AUTO_GENERATE_KEY = 'theme_auto_generate_enabled';
const THEME_AUTO_GENERATE_CHOICE_KEY = 'theme_auto_generate_choice';
const LAST_APPLIED_THEME_POINTER_KEY = 'last_applied_theme_pointer';

const isBrowser = () => typeof window !== 'undefined';

export const isThemeAnimationIntensity = (value: unknown): value is ThemeAnimationIntensity => (
    value === 'calm' || value === 'normal' || value === 'chaotic'
);

const isLastAppliedThemePointer = (value: unknown): value is LastAppliedThemePointer => (
    value === 'default' || value === 'ai' || value === 'custom'
);

export const isThemeGenerationSource = (value: unknown): value is ThemeGenerationSource => (
    value === 'ai' || value === 'cover'
);

export const readStoredThemeGenerationSource = (): ThemeGenerationSource => {
    if (!isBrowser()) {
        return 'ai';
    }

    const storedValue = window.localStorage.getItem(THEME_GENERATION_SOURCE_KEY);
    return isThemeGenerationSource(storedValue) ? storedValue : 'ai';
};

export const saveStoredThemeGenerationSource = (value: ThemeGenerationSource) => {
    if (!isBrowser()) {
        return;
    }

    window.localStorage.setItem(THEME_GENERATION_SOURCE_KEY, value);
};

export const readStoredAnimationIntensity = (): ThemeAnimationIntensity => {
    if (!isBrowser()) {
        return 'normal';
    }

    const storedValue = window.localStorage.getItem(THEME_ANIMATION_INTENSITY_KEY);
    return isThemeAnimationIntensity(storedValue) ? storedValue : 'normal';
};

export const saveStoredAnimationIntensity = (value: ThemeAnimationIntensity) => {
    if (!isBrowser()) {
        return;
    }

    window.localStorage.setItem(THEME_ANIMATION_INTENSITY_KEY, value);
};

export const applyStoredAnimationIntensityToTheme = (theme: Theme): Theme => ({
    ...theme,
    animationIntensity: readStoredAnimationIntensity(),
});

export const applyStoredAnimationIntensityToDualTheme = (dualTheme: DualTheme): DualTheme => ({
    light: applyStoredAnimationIntensityToTheme(dualTheme.light),
    dark: applyStoredAnimationIntensityToTheme(dualTheme.dark),
});

export const readStoredThemeAutoSwitchEnabled = () => {
    if (!isBrowser()) {
        return true;
    }

    return window.localStorage.getItem(THEME_AUTO_SWITCH_KEY) !== 'false';
};

export const saveStoredThemeAutoSwitchEnabled = (enabled: boolean) => {
    if (!isBrowser()) {
        return;
    }

    window.localStorage.setItem(THEME_AUTO_SWITCH_KEY, String(enabled));
};

export const readStoredThemeAutoGenerateEnabled = () => {
    if (!isBrowser()) {
        return false;
    }

    return window.localStorage.getItem(THEME_AUTO_GENERATE_KEY) === 'true';
};

// Older versions persist their default "off" on startup. Keep an explicit user choice separate
// so selecting AI can enable generation once without overriding a later deliberate opt-out.
export const readStoredThemeAutoGenerateChoice = (): boolean | null => {
    if (!isBrowser()) return null;
    const value = window.localStorage.getItem(THEME_AUTO_GENERATE_CHOICE_KEY);
    return value === 'true' ? true : value === 'false' ? false : null;
};

export const saveStoredThemeAutoGenerateChoice = (enabled: boolean) => {
    if (isBrowser()) window.localStorage.setItem(THEME_AUTO_GENERATE_CHOICE_KEY, String(enabled));
};

export const saveStoredThemeAutoGenerateEnabled = (enabled: boolean) => {
    if (!isBrowser()) {
        return;
    }

    window.localStorage.setItem(THEME_AUTO_GENERATE_KEY, String(enabled));
};

export const resolveCustomThemePreferenceChange = (
    state: ThemePreferenceSwitchState,
    enabled: boolean,
): ThemePreferenceSwitchState => (
    enabled
        ? {
            isCustomThemePreferred: true,
            songThemeAutoSwitchEnabled: false,
            songThemeAutoGenerateEnabled: false,
        }
        : {
            ...state,
            isCustomThemePreferred: false,
        }
);

export const resolveSongThemeAutoSwitchChange = (
    state: ThemePreferenceSwitchState,
    enabled: boolean,
): ThemePreferenceSwitchState => (
    enabled
        ? {
            ...state,
            isCustomThemePreferred: false,
            songThemeAutoSwitchEnabled: true,
        }
        : {
            ...state,
            songThemeAutoSwitchEnabled: false,
            songThemeAutoGenerateEnabled: false,
        }
);

export const resolveSongThemeAutoGenerateChange = (
    state: ThemePreferenceSwitchState,
    enabled: boolean,
): ThemePreferenceSwitchState => (
    enabled
        ? {
            ...state,
            isCustomThemePreferred: false,
            songThemeAutoSwitchEnabled: true,
            songThemeAutoGenerateEnabled: true,
        }
        : {
            ...state,
            songThemeAutoGenerateEnabled: false,
        }
);

export const readStoredLastAppliedThemePointer = (fallback: LastAppliedThemePointer = 'default'): LastAppliedThemePointer => {
    if (!isBrowser()) {
        return fallback;
    }

    const storedValue = window.localStorage.getItem(LAST_APPLIED_THEME_POINTER_KEY);
    return isLastAppliedThemePointer(storedValue) ? storedValue : fallback;
};

export const saveStoredLastAppliedThemePointer = (pointer: LastAppliedThemePointer) => {
    if (!isBrowser()) {
        return;
    }

    window.localStorage.setItem(LAST_APPLIED_THEME_POINTER_KEY, pointer);
};
