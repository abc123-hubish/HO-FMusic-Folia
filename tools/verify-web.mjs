import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { chromium } from '../upstream/folia-major/node_modules/playwright-core/index.mjs';

// Exercise the production bundle with a mocked native host and generated, copyright-free audio.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const assets = path.join(root, 'entry/src/main/resources/rawfile/folia');
const evidence = path.resolve(root, process.env.FOLIA_VERIFICATION_DIR || 'verification');
fs.mkdirSync(evidence, { recursive: true });
const rate = 22050, seconds = 30, count = rate * seconds;
const wav = Buffer.alloc(44 + count * 2);
wav.write('RIFF'); wav.writeUInt32LE(wav.length - 8, 4); wav.write('WAVEfmt ', 8);
wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22);
wav.writeUInt32LE(rate, 24); wav.writeUInt32LE(rate * 2, 28); wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34);
wav.write('data', 36); wav.writeUInt32LE(count * 2, 40);
for (let i = 0; i < count; i++) wav.writeInt16LE(Math.round(Math.sin(i * 2 * Math.PI * 220 / rate) * 400), 44 + i * 2);
const lyric = '[00:00.00]Folia 鸿蒙测试\n[00:03.00]让音乐成为眼前的风景\n[00:08.00]辞曲新境\n[00:14.00]原版歌词引擎\n[00:22.00]愿每次聆听都有新的样子';
const mime = file => ({ '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.svg': 'image/svg+xml',
  '.json': 'application/json', '.png': 'image/png', '.woff2': 'font/woff2' })[path.extname(file)] || 'application/octet-stream';
const server = http.createServer((req, res) => {
  const name = decodeURIComponent(new URL(req.url, 'http://localhost').pathname).slice(1);
  const file = path.resolve(assets, name || 'harmony.html');
  if (!file.startsWith(assets + path.sep) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404); res.end(); return;
  }
  res.writeHead(200, { 'Content-Type': mime(file) }); fs.createReadStream(file).pipe(res);
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const url = `http://127.0.0.1:${server.address().port}/harmony.html`;
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true, args: ['--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
const errors = [], notes = [], checks = [], bridgeSamples = [];
const sampleBridge = async label => {
  const start = await page.evaluate(() => window.__bridgeMetrics.length);
  await page.waitForTimeout(3000);
  const metrics = await page.evaluate(start => window.__bridgeMetrics.slice(start), start);
  bridgeSamples.push({ label, durationMs: 3000, calls: metrics.length,
    bytes: metrics.reduce((sum, item) => sum + item.bytes, 0),
    listTransfers: metrics.filter(item => item.hasLists).length,
    changedFields: [...new Set(metrics.flatMap(item => item.changedFields))] });
};
page.on('pageerror', error => errors.push(error.message));
page.on('console', msg => { if (msg.type() === 'error') notes.push(msg.text()); });
try {
  await page.route('https://folia.local/native/**', async route => {
    const audio = route.request().url().endsWith('/test-audio');
    await route.fulfill({ status: 200, body: audio ? wav : lyric, contentType: audio ? 'audio/wav' : 'text/plain',
      headers: { 'Access-Control-Allow-Origin': '*' } });
  });
  await page.addInitScript(() => {
    localStorage.setItem('default_theme_daylight', 'true');
    window.__snapshots = []; window.__toasts = []; window.__exports = []; window.__chunks = {};
    window.__bridgeMetrics = [];
    window.FoliaNative = {
      getConfig: () => JSON.stringify({ netease: '', qq: '', kugou: '', server: '', aiProvider: 'gemini' }),
      saveConfig: payload => { window.__savedConfig = JSON.parse(payload); return ''; },
      getPortraitMode: () => localStorage.getItem('test_portrait_mode') === 'true',
      setPortraitMode: enabled => { localStorage.setItem('test_portrait_mode', String(enabled));
        window.dispatchEvent(new CustomEvent('harmonyorientationchange', { detail: enabled })); },
      getFiles: () => localStorage.getItem('test_native_files') || '[]',
      removeFiles: payload => { const ids = JSON.parse(payload);
        localStorage.setItem('test_native_files', JSON.stringify(JSON.parse(localStorage.getItem('test_native_files') || '[]').filter(file => !ids.includes(file.id)))); },
      openExternal: url => { window.__external = url; },
      publish: payload => {
        const update = JSON.parse(payload);
        const previous = window.__snapshots.at(-1) || {};
        window.__bridgeMetrics.push({ bytes: new TextEncoder().encode(payload).length,
          hasLists: ['queue', 'local', 'results'].some(key => key in update),
          changedFields: Object.keys(update).filter(key => !['queue', 'local', 'results'].includes(key)
            && update[key] !== previous[key]) });
        window.__snapshots.push({ ...window.__snapshots.at(-1), ...update });
      },
      toast: message => { window.__toasts.push(message); },
      beginBlob: id => { window.__chunks[id] = []; }, appendBlob: (id, value) => window.__chunks[id].push(value),
      finishBlob: id => id, exportFile: (id, name) => window.__exports.push({ id, name }),
      requestImport: () => { void window.HarmonyApp.importFiles('[]'); },
      requestBackend: (id, _payload) => window.HarmonyBackend.receive(id, JSON.stringify({ status: 503, body: '', error: 'test backend unavailable' })),
    };
  });
  await page.goto(url);
  await page.waitForFunction(() => window.HarmonyApp && window.__snapshots.some(item => item.ready), { timeout: 45000 });
  checks.push('Production bundle booted and published native snapshot');
  await page.waitForTimeout(1000);
  await sampleBridge('idle-home');
  assert.equal(await page.evaluate(() => window.__snapshots.at(-1).view), 'home');
  assert.equal(await page.locator('[data-library-home-header]').count(), 1);
  await page.locator('[data-library-connect-panel]').waitFor({ state: 'visible', timeout: 45000 });
  for (const viewport of [{ width: 390, height: 844 }, { width: 640, height: 360 }, { width: 844, height: 390 }, { width: 960, height: 540 }, { width: 1280, height: 800 }]) {
    await page.setViewportSize(viewport);
    await page.locator('[data-library-home-tabs]').waitFor({ state: 'visible' });
    const layout = await page.evaluate(() => {
      const tabs = document.querySelector('[data-library-home-tabs]').getBoundingClientRect();
      const search = document.querySelector('[data-library-home-search]').getBoundingClientRect();
      const panel = document.querySelector('[data-library-connect-panel]').getBoundingClientRect();
      return { width: innerWidth, height: innerHeight, overflow: document.documentElement.scrollWidth > innerWidth,
        tabs: { x: tabs.x, right: tabs.right, bottom: tabs.bottom }, search: { x: search.x, right: search.right, bottom: search.bottom },
        panel: { bottom: panel.bottom }, font: getComputedStyle(document.documentElement).fontSize };
    });
    assert(!layout.overflow, `Page overflow at ${viewport.width}: ${JSON.stringify(layout)}`);
    assert(layout.tabs.x >= 0 && layout.tabs.right <= layout.width && layout.search.right <= layout.width,
      `Header clipped: ${JSON.stringify(layout)}`);
    assert(layout.panel.bottom <= layout.height + 1, `Home panel clipped: ${JSON.stringify(layout)}`);
    await page.screenshot({ path: path.join(evidence, `home-${viewport.width}x${viewport.height}.png`) });
  }
  checks.push('Library is the direct home and fits portrait and landscape phone/tablet sizes');
  await page.setViewportSize({ width: 844, height: 390 });
  await page.locator('[data-library-home-header] button').first().click();
  await page.waitForFunction(() => window.__snapshots.at(-1).settings);
  const settingsBounds = await page.locator('[data-settings-dialog]').boundingBox();
  const settingsViewport = page.viewportSize();
  assert(settingsBounds && settingsBounds.x >= 0 && settingsBounds.y >= 0
    && settingsBounds.x + settingsBounds.width <= settingsViewport.width + 1
    && settingsBounds.y + settingsBounds.height <= settingsViewport.height + 1,
  'Settings must fit the current window');
  const closeBounds = await page.locator('[data-settings-close]').boundingBox();
  const headerBounds = await page.locator('[data-settings-header]').boundingBox();
  assert(closeBounds && headerBounds && closeBounds.y >= headerBounds.y
    && closeBounds.y + closeBounds.height <= headerBounds.y + headerBounds.height + 1,
  'Close control must stay in its own header');
  assert.equal(await page.locator('[data-settings-tabs]').count(), 0);
  assert.equal(await page.locator('[data-ponder-page-scope="settings-page"]').count(), 1);
  checks.push('Original Web settings button opens without native navigation');
  await page.evaluate(() => window.HarmonyApp.command(JSON.stringify({ action: 'settings', section: 'general' })));
  const portraitSwitch = page.getByRole('switch', { name: '开启竖屏', exact: true });
  await portraitSwitch.click();
  await page.waitForFunction(() => window.FoliaNative.getPortraitMode());
  assert.equal(await portraitSwitch.getAttribute('aria-checked'), 'true');
  await portraitSwitch.click();
  await page.waitForFunction(() => !window.FoliaNative.getPortraitMode());
  checks.push('Web orientation switch selects fixed portrait or landscape through the system host');
  await page.evaluate(() => window.HarmonyApp.command(JSON.stringify({ action: 'settings', section: 'integration' })));
  await page.locator('[data-harmony-services]').waitFor({ state: 'visible' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(300);
  const portraitDialog = await page.locator('[data-settings-dialog]').boundingBox();
  assert(portraitDialog && portraitDialog.x >= 20 && portraitDialog.x + portraitDialog.width <= 370,
    `Portrait settings do not leave margins: ${JSON.stringify(portraitDialog)}`);
  await page.screenshot({ path: path.join(evidence, 'settings-portrait.png') });
  await page.setViewportSize({ width: 844, height: 390 });
  await page.locator('[data-harmony-services]').getByRole('textbox', { name: '易 API', exact: true }).fill('https://music.example.com');
  await page.getByRole('button', { name: '保存并应用', exact: true }).click();
  assert.equal(await page.evaluate(() => window.__savedConfig?.netease), 'https://music.example.com');
  await page.screenshot({ path: path.join(evidence, 'integration-phone.png') });
  checks.push('Service configuration is saved from the original Web integration page');
  await page.evaluate(() => window.HarmonyApp.command(JSON.stringify({ action: 'dismissSettings' })));
  await page.setViewportSize({ width: 960, height: 540 });
  const files = [{ id: 'test-audio', name: 'Folia - 鸿蒙测试.wav', url: 'https://folia.local/native/test-audio',
    size: wav.length, mime: 'audio/wav', modified: 1 }, { id: 'test-lyric', name: 'Folia - 鸿蒙测试.lrc',
    url: 'https://folia.local/native/test-lyric', size: Buffer.byteLength(lyric), mime: 'text/plain', modified: 1 }];
  await page.evaluate(async items => { localStorage.setItem('test_native_files', JSON.stringify(items));
    await window.HarmonyApp.importFiles(JSON.stringify(items)); }, files);
  await page.waitForFunction(() => window.__snapshots.at(-1).local.length === 1);
  checks.push('Native WAV and matching LRC imported via original metadata worker and catalogue');
  await page.evaluate(() => window.HarmonyApp.command(JSON.stringify({ action: 'local', id: 'test-audio' })));
  await page.waitForFunction(() => window.__snapshots.at(-1).songId !== '' && window.__snapshots.at(-1).playing
    && window.__snapshots.at(-1).duration > 0, null, { timeout: 45000 });
  const loaded = await page.evaluate(() => window.__snapshots.at(-1));
  assert(loaded.duration > 25 && loaded.duration < 35, `Incorrect duration: ${loaded.duration}`);
  checks.push('Local playback started with correct 30-second duration');
  await page.waitForFunction(() => window.__snapshots.at(-1).lyricLines >= 5, { timeout: 45000 });
  checks.push('Imported local lyric timeline reached the active player');
  await sampleBridge('playing');
  await page.evaluate(() => window.HarmonyApp.command(JSON.stringify({ action: 'pause' })));
  await page.waitForFunction(() => !window.__snapshots.at(-1).playing);
  await page.waitForFunction(() => [...document.querySelectorAll('audio')].every(audio => audio.paused));
  await page.waitForTimeout(1000);
  await sampleBridge('paused');
  // Seeking resumes playback in the original app. Read its immediate result before the moving clock advances.
  const seekPosition = await page.evaluate(async () => {
    await window.HarmonyApp.command(JSON.stringify({ action: 'seek', id: '8000' }));
    return window.__snapshots.at(-1).position;
  });
  assert(Math.abs(seekPosition - 8) < 0.2, `Incorrect immediate seek position: ${seekPosition}`);
  checks.push('System seek works while playback is paused');
  await page.waitForTimeout(1000);
  await sampleBridge('after-seek');
  const modes = ['cadenza', 'cappella', 'claddagh', 'classic', 'diorama', 'fume', 'lumiere', 'monet', 'partita', 'pendolo', 'sonnet', 'still', 'tempera', 'tilt'];
  for (const id of modes) {
    await page.evaluate(id => window.HarmonyApp.command(JSON.stringify({ action: 'mode', id })), id);
    await page.waitForFunction(id => window.__snapshots.at(-1).mode === id, id);
  }
  checks.push('All 14 original visualizer IDs selected successfully');
  await page.evaluate(() => window.HarmonyApp.command(JSON.stringify({ action: 'mode', id: 'classic' })));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(evidence, 'lyrics-landscape.png') });
  await page.evaluate(() => window.HarmonyApp.command(JSON.stringify({ action: 'settings', section: 'playback' })));
  await page.waitForFunction(() => window.__snapshots.at(-1).settings);
  await page.screenshot({ path: path.join(evidence, 'settings-landscape.png') });
  checks.push('Original playback settings opened through native command port');
  const audioSupport = await page.evaluate(() => typeof AudioContext === 'function' && typeof (new AudioContext()).createBiquadFilter === 'function');
  assert(audioSupport); checks.push('Web Audio DSP remains available');
  await page.evaluate(async () => {
    const a = document.createElement('a'); a.download = 'Folia-test.json';
    a.href = URL.createObjectURL(new Blob(['{"test":true}'], { type: 'application/json' }));
    a.click(); URL.revokeObjectURL(a.href);
  });
  await page.waitForFunction(() => window.__exports.length === 1);
  const exported = await page.evaluate(() => {
    const record = window.__exports[0];
    return { name: record.name, data: window.__chunks[record.id].map(chunk => atob(chunk)).join('') };
  });
  assert.equal(exported.name, 'Folia-test.json'); assert.equal(exported.data, '{"test":true}');
  checks.push('Detached Blob download survived immediate URL revoke and transferred exact bytes');
  await page.reload();
  await page.waitForFunction(() => window.__snapshots.at(-1)?.local.length === 1, { timeout: 45000 });
  checks.push('Local catalogue restored after page reload');
  assert.equal(errors.length, 0, `Runtime errors: ${errors.join('; ')}`);
  checks.push('No uncaught page exceptions');
  fs.writeFileSync(path.join(evidence, 'web-checks.json'), JSON.stringify({ checks, errors, notes, bridgeSamples }, null, 2));
  console.log(JSON.stringify({ passed: checks.length, checks, bridgeSamples }, null, 2));
} catch (error) {
  await page.screenshot({ path: path.join(evidence, 'failure.png') });
  fs.writeFileSync(path.join(evidence, 'web-checks.json'), JSON.stringify({ checks, errors, notes, failure: String(error),
    toasts: await page.evaluate(() => window.__toasts || []),
    snapshot: await page.evaluate(() => window.__snapshots?.at(-1)),
    audio: await page.evaluate(() => [...document.querySelectorAll('audio')].map(item => ({ src: item.src, currentSrc: item.currentSrc,
      paused: item.paused, time: item.currentTime, duration: item.duration }))) }, null, 2));
  throw error;
} finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
