import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { chromium } from '../upstream/folia-major/node_modules/playwright-core/index.mjs';

// tools/verify-cold-start.mjs
// Test deferred production screens, including a delayed load, cancellation and a failed module retry.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const assets = path.join(root, 'entry/src/main/resources/rawfile/folia');
const evidence = path.join(root, 'verification/cold-start');
const server = http.createServer((req, res) => {
  const file = path.resolve(assets, decodeURIComponent(new URL(req.url, 'http://localhost').pathname).slice(1));
  if (!file.startsWith(assets + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404); res.end(); return; }
  const mime = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' }[path.extname(file)] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': mime }); fs.createReadStream(file).pipe(res);
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const url = `http://127.0.0.1:${server.address().port}/harmony.html`;
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const checks = [];
const errors = [];
try {
  const context = await browser.newContext({ viewport: { width: 960, height: 540 } });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    window.__snapshots = [];
    window.FoliaNative = {
      getConfig: () => JSON.stringify({ netease: '', qq: '', kugou: '', server: '', aiProvider: 'gemini' }),
      getPortraitMode: () => false, getFiles: () => '[]', toast: () => {}, openExternal: () => {},
      publish: payload => window.__snapshots.push({ ...window.__snapshots.at(-1), ...JSON.parse(payload) }),
      requestBackend: id => window.HarmonyBackend.receive(id, JSON.stringify({ status: 503, body: '', error: 'verification offline' })),
    };
  });
  const requests = [];
  page.on('request', request => requests.push(request.url()));
  await page.goto(url);
  await page.waitForFunction(() => window.__snapshots.at(-1)?.ready);
  assert(!requests.some(request => /\/(SettingsModal|SearchWorkspace|DevDebugOverlay|MemoryMonitorWindow|RemoteControlApp|ObsBrowserSourceApp)-/.test(request)));
  checks.push('Closed settings, search, debug, remote and OBS screens request no implementation chunk at startup');

  let releaseSearch;
  const delayedSearch = new Promise(resolve => { releaseSearch = resolve; });
  await page.route('**/SearchWorkspace-*.js', async route => { await delayedSearch; await route.continue(); });
  await page.locator('[data-library-home-search] input').fill('冷启动');
  await page.locator('[data-library-home-search] input').press('Enter');
  await page.locator('[data-deferred-feature-feedback][role="status"]').waitFor();
  await page.locator('[data-deferred-feature-feedback]').getByRole('button', { name: '取消', exact: true }).click();
  await page.locator('[data-deferred-feature-feedback]').waitFor({ state: 'hidden' });
  releaseSearch();
  checks.push('A delayed first search shows feedback and cancelling immediately restores home');
  await page.locator('[data-library-home-search] input').press('Enter');
  await page.locator('section input').waitFor();
  checks.push('Search opens normally after the cancelled request finishes');
  await page.keyboard.press('Escape');

  let rejectSettings = true;
  await page.route('**/SettingsModal-*.js', route => rejectSettings ? route.abort() : route.continue());
  await page.evaluate(() => window.HarmonyApp.command(JSON.stringify({ action: 'settings', section: 'general' })));
  await page.locator('[data-deferred-feature-feedback][role="alert"]').waitFor();
  assert.equal(await page.locator('[data-library-home-header]').count(), 1);
  rejectSettings = false;
  await page.locator('[data-deferred-feature-feedback]').getByRole('button', { name: '重试', exact: true }).click();
  await page.waitForFunction(() => window.__snapshots.at(-1)?.ready);
  await page.evaluate(() => window.HarmonyApp.command(JSON.stringify({ action: 'settings', section: 'general' })));
  await page.locator('[data-settings-dialog]').waitFor();
  await page.getByRole('switch', { name: '开启竖屏', exact: true }).waitFor();
  checks.push('Failed settings chunk leaves the app mounted; retry starts a fresh document and settings opens');
  await page.screenshot({ path: path.join(evidence, 'deferred-settings.png') });
  await page.evaluate(() => window.HarmonyApp.command(JSON.stringify({ action: 'dismissSettings' })));
  await page.locator('[data-settings-dialog]').waitFor({ state: 'hidden' });
  checks.push('Deferred settings retains normal close behavior');
  assert.deepEqual(errors, []);
  fs.writeFileSync(path.join(evidence, 'deferred-checks.json'), JSON.stringify({ checks, errors, limitation: 'Production Chrome with mocked native host; no device interaction.' }, null, 2));
  console.log(JSON.stringify(checks, null, 2));
  await context.close();
} finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
