import type { HarmonyNative } from './contracts';
import { installBackend } from './backend';
import { installDownloads } from './export';
import { installHarmonyBodian } from './bodian';
import { installHarmonyMusic } from './music';
import { installHarmonyQishui } from './qishui';

// Preserve Web Audio (EQ, replay gain and automix). Only file exports cross the native boundary.
export function installHarmonyPlatform(): void {
  const host = window.FoliaNative as HarmonyNative;
  installBackend(host);
  installHarmonyBodian(host);
  installHarmonyMusic(host);
  installHarmonyQishui(host);
  installDownloads(host);
  document.addEventListener('click', event => {
    const anchor = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href]');
    if (anchor && /^https?:/.test(anchor.href) && new URL(anchor.href).origin !== location.origin) {
      event.preventDefault(); host.openExternal(anchor.href);
    }
  }, true);
  window.open = url => {
    if (url) host.openExternal(String(url));
    return null;
  };
}
