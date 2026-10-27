import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { chromium } from '../upstream/folia-major/node_modules/playwright-core/index.mjs';

// tools/measure-cold-start.mjs
// Compare fresh production contexts under fixed CPU throttling; this is a Web benchmark, not a device trace.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const assets = path.resolve(root, process.env.FOLIA_STARTUP_ASSETS || 'entry/src/main/resources/rawfile/folia');
const output = path.resolve(root, process.env.FOLIA_STARTUP_OUTPUT || 'verification/cold-start/after.json');
const mime = file => ({ '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css',
  '.svg': 'image/svg+xml', '.woff2': 'font/woff2' })[path.extname(file)] || 'application/octet-stream';
const server = http.createServer((req, res) => {
  const file = path.resolve(assets, decodeURIComponent(new URL(req.url, 'http://localhost').pathname).slice(1));
  if (!file.startsWith(assets + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    res.writeHead(404); res.end(); return;
  }
  res.writeHead(200, { 'Content-Type': mime(file), 'Cache-Control': 'no-store' });
  fs.createReadStream(file).pipe(res);
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const url = `http://127.0.0.1:${server.address().port}/harmony.html`;
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const samples = [];
try {
  const runs = Number(process.env.FOLIA_STARTUP_RUNS || 7);
  for (let run = 0; run < runs; run++) {
    const context = await browser.newContext({ viewport: { width: 960, height: 540 } });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await context.route('**/*', route => route.request().url().startsWith(`http://127.0.0.1:${server.address().port}/`)
      ? route.continue() : route.abort());
    const session = await context.newCDPSession(page);
    await session.send('Network.enable');
    await session.send('Network.setCacheDisabled', { cacheDisabled: true });
    await session.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await page.addInitScript(() => {
      window.__startupReady = null;
      window.__startupLongTasks = [];
      new PerformanceObserver(list => window.__startupLongTasks.push(...list.getEntries().map(({ startTime, duration }) => ({ startTime, duration })))).observe({ type: 'longtask', buffered: true });
      window.FoliaNative = {
        getConfig: () => JSON.stringify({ netease: '', qq: '', kugou: '', server: '', aiProvider: 'gemini' }),
        getPortraitMode: () => false, getFiles: () => '[]', toast: () => {},
        publish: payload => {
          if (JSON.parse(payload).ready && window.__startupReady === null) {
            window.__startupReady = performance.now();
            requestAnimationFrame(() => requestAnimationFrame(() => { window.__startupPaint = performance.now(); }));
          }
        },
        requestBackend: id => window.HarmonyBackend.receive(id, JSON.stringify({ status: 503, body: '', error: 'benchmark offline' })),
        openExternal: () => {},
      };
    });
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.__startupPaint, null, { timeout: 45000 });
    await page.locator('[data-library-home-header]').waitFor({ state: 'visible' });
    const sample = await page.evaluate(() => {
      const readyMs = window.__startupReady;
      const scripts = performance.getEntriesByType('resource').filter(entry => entry.name.endsWith('.js') && entry.startTime <= readyMs)
        .map(entry => ({ file: new URL(entry.name).pathname, bytes: entry.decodedBodySize }));
      return { readyMs, paintMs: window.__startupPaint, scripts, scriptBytes: scripts.reduce((sum, script) => sum + script.bytes, 0),
        longTaskMs: window.__startupLongTasks.filter(task => task.startTime < readyMs).reduce((sum, task) => sum + task.duration, 0) };
    });
    assert.deepEqual(errors, []);
    samples.push(sample);
    await context.close();
  }
  const median = key => samples.map(sample => sample[key]).sort((a, b) => a - b)[Math.floor(samples.length / 2)];
  const report = { assets, runs: samples.length, cpuThrottle: 4, freshStorageAndCache: true,
    median: { readyMs: median('readyMs'), paintMs: median('paintMs'), scriptBytes: median('scriptBytes'), longTaskMs: median('longTaskMs') },
    samples, limitation: 'Windows Chrome production Web benchmark with mocked native host and offline providers; not HarmonyOS cold-launch timing.' };
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ output, median: report.median }, null, 2));
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
