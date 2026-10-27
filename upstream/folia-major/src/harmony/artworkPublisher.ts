// src/harmony/artworkPublisher.ts
// Transfer browser-owned covers once per source, outside the small playback-clock snapshots.
export async function readHarmonyArtwork(cover: string): Promise<string> {
  if (/^https?:\/\//i.test(cover) && new URL(cover).hostname !== 'folia.local') return cover;
  const picture = new Image();
  try {
    await new Promise<void>((resolve, reject) => {
      const timeout = window.setTimeout(() => reject(new Error('Cover loading timed out')), 10000);
      picture.onload = () => { clearTimeout(timeout); resolve(); };
      picture.onerror = () => { clearTimeout(timeout); reject(new Error('Cover loading failed')); };
      picture.src = cover;
    });
    const scale = Math.min(1, 512 / Math.max(picture.naturalWidth, picture.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(picture.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(picture.naturalHeight * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Cover canvas is unavailable');
    context.drawImage(picture, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.85);
  } finally { picture.onload = null; picture.onerror = null; picture.src = ''; }
}

// Generation checks cover A -> B -> A switches as well as ordinary late image loads.
export function createHarmonyArtworkPublisher(
  send: (songId: string, cover: string, source: string) => void,
  read: (cover: string) => Promise<string> = readHarmonyArtwork,
) {
  let key = '', generation = 0, pending = false, sent = false, retryAt = 0, disposed = false;
  return {
    update(songId: string, cover: string) {
      if (disposed) return;
      const nextKey = JSON.stringify([songId, cover]);
      if (key !== nextKey) {
        key = nextKey; generation++; pending = false; sent = false; retryAt = 0;
      }
      if (!songId || !cover || pending || sent || Date.now() < retryAt) return;
      const request = generation;
      pending = true;
      void read(cover).then(source => {
        if (disposed || request !== generation) return;
        send(songId, cover, source);
        sent = true;
      }).catch(() => {
        if (request === generation) retryAt = Date.now() + 5000;
      }).finally(() => { if (request === generation) pending = false; });
    },
    dispose() { disposed = true; generation++; },
  };
}
