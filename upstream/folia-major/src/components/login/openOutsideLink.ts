// src/components/login/openOutsideLink.ts
// Reuse the app's existing external-link route for the upstream presentation components.
export const openOutsideLink = (url: string) => window.electron?.openExternalUrl ? window.electron.openExternalUrl(url) : Promise.resolve(Boolean(window.open(url, '_blank', 'noopener,noreferrer')));
