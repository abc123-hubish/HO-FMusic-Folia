import type { HarmonyNative } from './contracts';

// Send generated downloads to the native save picker, including detached programmatic anchors.
export async function exportHarmonyBlob(host: HarmonyNative, blob: Blob, name: string): Promise<void> {
  const id = `export-${crypto.randomUUID()}`;
  host.beginBlob(id);
  for (let offset = 0; offset < blob.size; offset += 192 * 1024) {
    const bytes = new Uint8Array(await blob.slice(offset, offset + 192 * 1024).arrayBuffer());
    let binary = '';
    for (let start = 0; start < bytes.length; start += 8192) {
      binary += String.fromCharCode(...bytes.subarray(start, start + 8192));
    }
    host.appendBlob(id, btoa(binary));
  }
  host.finishBlob(id);
  host.exportFile(id, name);
}

export function installDownloads(host: HarmonyNative): void {
  const send = (anchor: HTMLAnchorElement): boolean => {
    if (!anchor.hasAttribute('download') || !/^(blob:|data:)/.test(anchor.href)) return false;
    // Read the Blob immediately: original exporters often revoke its URL as soon as click() returns.
    const response = fetch(anchor.href);
    void response.then(value => value.blob()).then(blob => exportHarmonyBlob(host, blob, anchor.download || 'FMusic-export'))
      .catch(error => host.toast(error instanceof Error ? error.message : String(error)));
    return true;
  };
  const click = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function () { if (!send(this)) click.call(this); };
  document.addEventListener('click', event => {
    const anchor = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[download]');
    if (anchor && send(anchor)) event.preventDefault();
  }, true);
}
