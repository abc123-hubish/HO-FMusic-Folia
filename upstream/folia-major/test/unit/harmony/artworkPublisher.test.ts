import { describe, expect, it, vi } from 'vitest';
import { createHarmonyArtworkPublisher, readHarmonyArtwork } from '@/harmony/artworkPublisher';

// test/unit/harmony/artworkPublisher.test.ts
// Browser-owned image loads must not resend on clock ticks or overwrite a newer track.
const flush = async () => { for (let i = 0; i < 5; i++) await Promise.resolve(); };
const deferred = () => {
  let resolve!: (value: string) => void;
  const promise = new Promise<string>(done => { resolve = done; });
  return { promise, resolve };
};

describe('Harmony artwork transfer', () => {
  it('sends artwork once per cover and accepts a late cover while paused', async () => {
    const send = vi.fn(), read = vi.fn(async () => 'data:image/jpeg;base64,image');
    const publisher = createHarmonyArtworkPublisher(send, read);
    publisher.update('one', '');
    expect(read).not.toHaveBeenCalled();
    publisher.update('one', 'blob:cover');
    publisher.update('one', 'blob:cover');
    await flush();
    for (let i = 0; i < 60; i++) publisher.update('one', 'blob:cover');
    expect(read).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith('one', 'blob:cover', 'data:image/jpeg;base64,image');
    publisher.update('one', 'blob:replacement');
    await flush();
    expect(send).toHaveBeenCalledTimes(2);
  });

  it('drops stale results even when playback switches A -> B -> A', async () => {
    const first = deferred(), last = deferred(), send = vi.fn();
    const read = vi.fn().mockReturnValueOnce(first.promise).mockResolvedValueOnce('B').mockReturnValueOnce(last.promise);
    const publisher = createHarmonyArtworkPublisher(send, read);
    publisher.update('A', 'blob:A');
    publisher.update('B', 'blob:B');
    publisher.update('A', 'blob:A');
    first.resolve('old A'); await flush();
    expect(send).not.toHaveBeenCalled();
    last.resolve('new A'); await flush();
    expect(send).toHaveBeenCalledExactlyOnceWith('A', 'blob:A', 'new A');
  });

  it('cancels a pending transfer when the cover clears or the host disposes', async () => {
    for (const dispose of [false, true]) {
      const gate = deferred(), send = vi.fn();
      const publisher = createHarmonyArtworkPublisher(send, () => gate.promise);
      publisher.update('one', 'blob:cover');
      if (dispose) publisher.dispose(); else publisher.update('two', '');
      gate.resolve('image'); await flush();
      expect(send).not.toHaveBeenCalled();
    }
  });

  it('retries failed browser reads after a delay, without flooding the bridge', async () => {
    const now = vi.spyOn(Date, 'now').mockReturnValue(1000), send = vi.fn();
    try {
      const read = vi.fn().mockRejectedValueOnce(new Error('temporary')).mockResolvedValueOnce('image');
      const publisher = createHarmonyArtworkPublisher(send, read);
      publisher.update('one', 'blob:cover'); await flush();
      publisher.update('one', 'blob:cover'); expect(read).toHaveBeenCalledTimes(1);
      now.mockReturnValue(6000);
      publisher.update('one', 'blob:cover'); await flush();
      expect(send).toHaveBeenCalledExactlyOnceWith('one', 'blob:cover', 'image');
    } finally { now.mockRestore(); }
  });

  it('passes online URLs to the native downloader without requiring browser CORS', async () => {
    expect(await readHarmonyArtwork('https://example.com/cover.jpg')).toBe('https://example.com/cover.jpg');
  });
});
