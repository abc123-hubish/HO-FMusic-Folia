import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { chromium } from '../upstream/folia-major/node_modules/playwright-core/index.mjs';

// tools/verify-local-media.mjs
// Verify the production app's upstream File -> repaired Blob -> audio path, including audible PCM and seeking.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const assets = path.join(root, 'entry/src/main/resources/rawfile/folia');
const evidence = path.join(root, 'verification/local-blob-alignment');
fs.mkdirSync(evidence, { recursive: true });
const rate = 44100, seconds = 90;
const wav = Buffer.alloc(44 + rate * seconds * 2);
wav.write('RIFF'); wav.writeUInt32LE(wav.length - 8, 4); wav.write('WAVEfmt ', 8);
wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22);
wav.writeUInt32LE(rate, 24); wav.writeUInt32LE(rate * 2, 28); wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34);
wav.write('data', 36); wav.writeUInt32LE(wav.length - 44, 40);
for (let index = 0; index < rate * seconds; index++) {
  wav.writeInt16LE(Math.round(Math.sin(index * 2 * Math.PI * 220 / rate) * 1200), 44 + index * 2);
}
fs.writeFileSync(path.join(evidence, 'Local playback verification.wav'), wav);
const mime = file => ({ '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.svg': 'image/svg+xml',
  '.json': 'application/json', '.png': 'image/png', '.woff2': 'font/woff2' })[path.extname(file)] || 'application/octet-stream';
const server = http.createServer((request, response) => {
  const name = decodeURIComponent(new URL(request.url, 'http://localhost').pathname).slice(1);
  const file = path.resolve(assets, name || 'harmony.html');
  if (!file.startsWith(assets + path.sep) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    response.writeHead(404); response.end(); return;
  }
  response.writeHead(200, { 'Content-Type': mime(file) }); fs.createReadStream(file).pipe(response);
});
let browser;
const checks = [], samples = [], requests = [], errors = [];
try {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true, args: ['--autoplay-policy=no-user-gesture-required'] });
  const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
  page.on('pageerror', error => errors.push(error.message));
  await page.route('https://folia.local/native/**', async route => {
    requests.push({ url: route.request().url(), range: route.request().headers().range || null });
    await route.fulfill({ status: 200, body: wav, contentType: 'audio/wav', headers: { 'Access-Control-Allow-Origin': '*' } });
  });
  await page.addInitScript(() => {
    localStorage.setItem('harmony_initialized', 'true');
    localStorage.setItem('folia_app_language', 'en');
    localStorage.setItem('playback_entry_view', 'player');
    localStorage.setItem('library_suite', 'grid');
    localStorage.setItem('automix_enabled', 'false');
    window.__snapshots = []; window.__toasts = [];
    const NativeContext = window.AudioContext;
    window.AudioContext = class extends NativeContext {
      constructor(options) { super(options); window.__audioContext = this; }
    };
    const connect = AudioNode.prototype.connect;
    AudioNode.prototype.connect = function (target, ...rest) {
      if (this instanceof AnalyserNode && target === this.context.destination) window.__audioOutput = this;
      return connect.call(this, target, ...rest);
    };
    window.FoliaNative = {
      getConfig: () => JSON.stringify({ netease: '', qq: '', kugou: '', server: '', aiProvider: 'gemini' }),
      saveConfig: () => '', getForeground: () => true, getPortraitMode: () => false, setPortraitMode: () => {},
      getFiles: () => localStorage.getItem('test_native_files') || '[]', removeFiles: () => {}, openExternal: () => {},
      publish: payload => window.__snapshots.push({ ...window.__snapshots.at(-1), ...JSON.parse(payload) }),
      toast: message => window.__toasts.push(message), beginBlob: () => {}, appendBlob: () => {}, finishBlob: id => id,
      exportFile: () => {}, requestImport: () => {},
      requestBackend: id => window.HarmonyBackend.receive(id, JSON.stringify({ status: 503, body: '', error: 'No test backend' })),
    };
  });
  const waitFor = (predicate, arg, timeout = 30000) => page.waitForFunction(predicate, arg, { polling: 100, timeout });
  const command = (action, id = '') => page.evaluate(async ({ action, id }) =>
    window.HarmonyApp.command(JSON.stringify({ action, id })), { action, id });
  const sample = async label => {
    const value = await page.evaluate(() => {
      const audio = [...document.querySelectorAll('audio')].find(item => !item.paused) || document.querySelector('audio');
      const pcm = new Float32Array(window.__audioOutput?.fftSize || 2048);
      window.__audioOutput?.getFloatTimeDomainData(pcm);
      return { src: audio?.currentSrc, position: audio?.currentTime, paused: audio?.paused, error: audio?.error?.code || 0,
        context: window.__audioContext?.state, peak: pcm.reduce((peak, value) => Math.max(peak, Math.abs(value)), 0),
        published: window.__snapshots.at(-1)?.position };
    });
    samples.push({ label, ...value }); return value;
  };
  await page.goto(`http://127.0.0.1:${server.address().port}/harmony.html`);
  await waitFor(() => window.HarmonyApp && window.__snapshots.at(-1)?.ready);
  const files = ['one', 'two'].map((id, index) => ({ id: `blob-local-${id}`, name: `Test - Local ${index + 1}.wav`,
    url: `https://folia.local/native/blob-local-${id}`, size: wav.length, mime: 'audio/wav', modified: index + 1 }));
  await page.evaluate(async files => {
    localStorage.setItem('test_native_files', JSON.stringify(files));
    await window.HarmonyApp.importFiles(JSON.stringify(files));
  }, files);
  await waitFor(() => window.__snapshots.at(-1)?.local?.length === 2);
  await command('local', files[0].id);
  await waitFor(() => window.__snapshots.at(-1)?.playing && window.__audioOutput
    && [...document.querySelectorAll('audio')].some(audio => !audio.paused && audio.currentTime > 0.5));
  const first = await sample('initial playback');
  assert.ok(first.src.startsWith('blob:'), first.src);
  assert.ok(first.peak > 0.001, JSON.stringify(first));
  checks.push('Production app plays a browser Blob URL with nonzero output PCM');
  await page.evaluate(() => document.querySelectorAll('audio').forEach(audio => { audio.playbackRate = 8; }));
  await waitFor(() => [...document.querySelectorAll('audio')].some(audio => !audio.paused && audio.currentTime > 60), null, 20000);
  const continuous = await sample('past 60 seconds without seeking');
  assert.ok(continuous.peak > 0.001, JSON.stringify(continuous));
  assert.equal(continuous.error, 0);
  checks.push('Audio and progress continue past the former 2 MiB cutoff');
  await page.evaluate(() => document.querySelectorAll('audio').forEach(audio => { audio.playbackRate = 1; }));
  await command('seek', '4000');
  await waitFor(() => [...document.querySelectorAll('audio')].some(audio => Math.abs(audio.currentTime - 4) < 1));
  await command('pause');
  await command('seek', '42000');
  await waitFor(() => [...document.querySelectorAll('audio')].some(audio => Math.abs(audio.currentTime - 42) < 1));
  await command('pause');
  await waitFor(() => [...document.querySelectorAll('audio')].every(audio => audio.paused));
  await command('play');
  await waitFor(() => [...document.querySelectorAll('audio')].some(audio => !audio.paused && audio.currentTime > 42.3));
  const resumed = await sample('paused seek then resume');
  assert.ok(resumed.peak > 0.001, JSON.stringify(resumed));
  checks.push('Backward seek, paused seek and resume retain audio and progress');
  await command('local', files[1].id);
  await waitFor(() => [...document.querySelectorAll('audio')].some(audio => !audio.paused && audio.currentTime > 0.3 && audio.currentTime < 4));
  const switched = await sample('second local song');
  assert.ok(switched.src.startsWith('blob:') && switched.src !== first.src, JSON.stringify(switched));
  assert.ok(switched.peak > 0.001, JSON.stringify(switched));
  checks.push('Switching local songs creates a fresh Blob source and preserves audible PCM');
  await command('pause');
  assert.ok(requests.length >= 4);
  assert.ok(requests.every(request => request.range === null), JSON.stringify(requests));
  assert.deepEqual(errors, []);
  checks.push('Native URLs are fetched as complete files, with no media Range requests or page errors');
  fs.writeFileSync(path.join(evidence, 'production-browser.json'), JSON.stringify({ checks, samples, requests, errors,
    limitation: 'Production Web bundle and real Web Audio in Chrome with a simulated native file host; device validation is separate.' }, null, 2));
  console.log(JSON.stringify({ passed: checks.length, checks }, null, 2));
} finally {
  await browser?.close(); server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
}
