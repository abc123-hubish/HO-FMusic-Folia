import { expect, test, type Page } from '@playwright/test';
import { installBaseState, mockNeteaseApi } from './helpers/appFixtures';
import type { HarmonyNative } from '../../src/harmony/contracts';

// test/ui/harmonyContinuation.spec.ts
// Real renderer, audio loading and metadata seek; only the system transport and music server are mocked.
test.use({ serviceWorkers: 'block', launchOptions: {
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
  args: ['--autoplay-policy=no-user-gesture-required'],
} });
const rate = 8000, seconds = 90;
const wav = Buffer.alloc(44 + rate * seconds * 2);
wav.write('RIFF'); wav.writeUInt32LE(wav.length - 8, 4); wav.write('WAVEfmt ', 8);
wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22);
wav.writeUInt32LE(rate, 24); wav.writeUInt32LE(rate * 2, 28); wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34);
wav.write('data', 36); wav.writeUInt32LE(wav.length - 44, 40);
for (let i = 0; i < rate * seconds; i++) wav.writeInt16LE(Math.round(Math.sin(i * 2 * Math.PI * 220 / rate) * 500), 44 + i * 2);
const online = (id: number, playing = false, positionSec = 31.75) => ({ schemaVersion: 1, transferId: `t-${id}`,
  positionSec, playing, view: 'player', mode: 'classic', currentIndex: 0, queueTruncated: false,
  queue: [{ kind: 'online', song: { id, name: `Continuation ${id}`, durationMs: 90000,
    artists: [{ id: 1, name: 'Artist' }], album: { id: 1, name: 'Album' },
    sourceRef: { kind: 'online', providerId: 'netease', mediaId: String(id) } } }] });
interface TestWindow extends Window {
  __continueState: { snapshots: Array<{ songId: string; position: number; playing: boolean }>;
    toasts: string[]; exported: string; finished: number; available: boolean };
}
async function prepare(page: Page, payload: object, withLocal = false) {
  await installBaseState(page, { neteaseMode: 'guest' });
  await mockNeteaseApi(page, 'guest');
  await page.route('**/continuation-tone.wav*', route => {
    const range = /^bytes=(\d+)-(\d*)$/.exec(route.request().headers().range || '');
    const start = range ? Number(range[1]) : 0;
    const end = range?.[2] ? Math.min(Number(range[2]), wav.length - 1) : wav.length - 1;
    return route.fulfill({ status: range ? 206 : 200, body: wav.subarray(start, end + 1), contentType: 'audio/wav',
      headers: { 'Accept-Ranges': 'bytes', ...(range ? { 'Content-Range': `bytes ${start}-${end}/${wav.length}` } : {}) } });
  });
  await page.route('**/__mock_netease__/song/detail?**', route => {
    const id = Number(new URL(route.request().url()).searchParams.get('ids'));
    return route.fulfill({ json: { songs: [{ id, name: `Continuation ${id}`, dt: 90000,
      ar: [{ id: 1, name: 'Artist' }], al: { id: 1, name: 'Album' } }], privileges: [] } });
  });
  await page.route('**/__mock_netease__/song/url**', route => {
    const id = Number(new URL(route.request().url()).searchParams.get('id'));
    return route.fulfill({ json: { code: 200, data: [{ id, url: `http://127.0.0.1:4173/continuation-tone.wav?id=${id}`,
      type: 'wav', size: wav.length, br: 128000, code: 200 }] } });
  });
  await page.route('**/__mock_netease__/lyric*', route => route.fulfill({ json: { code: 200,
    lrc: { lyric: '[00:00.00]A continuation test\n[00:30.00]The song continues' } } }));
  await page.addInitScript(({ payload, withLocal, size }) => {
    const w = window as unknown as TestWindow;
    if (!sessionStorage.getItem('continuation-test-initialized')) {
      sessionStorage.setItem('continuation-test-initialized', 'true');
      sessionStorage.setItem('continuation-test-payload', JSON.stringify(payload));
    }
    localStorage.setItem('harmony_initialized', 'true');
    localStorage.setItem('automix_enabled', 'false');
    localStorage.setItem('auto_use_best_lyric', 'false');
    localStorage.setItem('playback_entry_view', 'player');
    w.__continueState = { snapshots: [], toasts: [], exported: '', finished: 0, available: false };
    const native = { getConfig: () => JSON.stringify({ netease: `${location.origin}/__mock_netease__`,
      qq: '', kugou: '', server: '', aiProvider: 'gemini' }),
    saveConfig: () => '', getPortraitMode: () => false, setPortraitMode() {}, getForeground: () => true,
    getFiles: () => JSON.stringify(withLocal ? [{ id: 'target-device-uuid', name: 'Continuation.wav',
      size, modified: 1, mime: 'audio/wav', url: `${location.origin}/continuation-tone.wav`,
      relativePath: 'HarmonyOS/Continuation.wav' }] : []),
    removeFiles() {}, openExternal() {}, publish: (value: string) => w.__continueState.snapshots.push(JSON.parse(value)),
    toast: (message: string) => w.__continueState.toasts.push(message),
    requestBackend: (id: string) => queueMicrotask(() => window.HarmonyBackend?.receive(id,
      JSON.stringify({ status: 200, body: btoa('{}') }))),
    getContinuation: () => sessionStorage.getItem('continuation-test-payload') || '',
    finishContinuation: (value: string) => {
      if (sessionStorage.getItem('continuation-test-payload') === value) sessionStorage.removeItem('continuation-test-payload');
      w.__continueState.finished++;
    },
    setContinuationAvailable: (value: boolean) => { w.__continueState.available = value; },
    completeContinuation: (_id: string, value: string) => { w.__continueState.exported = value; },
    };
    window.FoliaNative = native as unknown as HarmonyNative;
  }, { payload, withLocal, size: wav.length });
}
const media = (page: Page) => page.evaluate(() => [...document.querySelectorAll('audio')]
  .filter(audio => !!audio.currentSrc).map(audio => ({ position: audio.currentTime, paused: audio.paused })));

test('preserves pause and progress, exports fresh state and supersedes a remembered target session', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await prepare(page, online(500)); await page.goto('/harmony.html');
  await expect.poll(() => media(page), { timeout: 60000 }).toContainEqual({ position: 31.75, paused: true });
  await expect.poll(() => page.evaluate(() => (window as unknown as TestWindow).__continueState.finished)).toBe(1);
  await expect.poll(() => page.evaluate(() => (window as unknown as TestWindow).__continueState.available)).toBe(true);
  await page.evaluate(() => window.HarmonyApp!.exportContinuation('source-export'));
  const exported = await page.evaluate(() => JSON.parse((window as unknown as TestWindow).__continueState.exported));
  expect(exported).toMatchObject({ positionSec: 31.75, playing: false, queue: [{ song: { id: 500 } }] });
  expect(JSON.stringify(exported)).not.toContain('continuation-tone.wav');
  await page.evaluate(payload => sessionStorage.setItem('continuation-test-payload', JSON.stringify(payload)), online(501, true, 48));
  await page.reload();
  await expect.poll(async () => (await media(page)).some(audio => !audio.paused && audio.position >= 48 && audio.position < 58),
    { timeout: 60000 }).toBe(true);
  await expect.poll(() => page.evaluate(() => (window as unknown as TestWindow).__continueState.snapshots.at(-1)?.songId))
    .toBe('online:netease:501');
  expect(errors).toEqual([]);
});

for (const playing of [false, true]) test(`resolves a pre-imported local file using target identity (playing=${playing})`, async ({ page }) => {
  const payload = { ...online(1, playing), queue: [{ kind: 'local', fileName: 'Continuation.wav', fileSize: wav.length, durationMs: 90000 }] };
  await prepare(page, payload, true); await page.goto('/harmony.html');
  if (playing) {
    await expect.poll(async () => (await media(page)).some(audio => !audio.paused && audio.position >= 31.75 && audio.position < 42),
      { timeout: 60000 }).toBe(true);
  } else await expect.poll(() => media(page), { timeout: 60000 }).toContainEqual({ position: 31.75, paused: true });
  await expect.poll(() => page.evaluate(() => (window as unknown as TestWindow).__continueState.snapshots.at(-1)?.songId))
    .toBe('local:target-device-uuid');
});

test('reports a missing local file without playing another song', async ({ page }) => {
  const payload = { ...online(1), queue: [{ kind: 'local', fileName: 'Missing.flac', fileSize: 200, durationMs: 90000 }] };
  await prepare(page, payload); await page.goto('/harmony.html');
  await expect.poll(() => page.evaluate(() => (window as unknown as TestWindow).__continueState.toasts.join('\n')),
    { timeout: 60000 }).toContain('请先在此设备导入相同的本地歌曲');
  expect(await media(page)).toEqual([]);
  await expect.poll(() => page.evaluate(() => (window as unknown as TestWindow).__continueState.available)).toBe(false);
});
