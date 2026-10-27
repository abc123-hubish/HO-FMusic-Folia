// src/services/appVisibility.ts
// Native visibility supplements document.hidden in ArkWeb; focus alone does not hide a split window.
let foreground = true;
let visible = true;
const listeners = new Set<() => void>();

export const isAppVisible = () => visible;

export const refreshAppVisibility = () => {
    const next = foreground && (typeof document === 'undefined' || !document.hidden);
    if (next === visible) return;
    visible = next;
    listeners.forEach(listener => listener());
};

export const setAppForeground = (next: boolean) => {
    foreground = next;
    refreshAppVisibility();
};

export const subscribeAppVisibility = (listener: () => void) => {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
};
