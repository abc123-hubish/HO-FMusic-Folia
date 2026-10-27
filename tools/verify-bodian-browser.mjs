import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { chromium } from '../upstream/folia-major/node_modules/playwright-core/index.mjs';

// Check the production Omni UI with the actual native protocol and synthetic QR/search responses.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const assets = path.join(root, 'entry/src/main/resources/rawfile/folia');
const evidence = path.join(root, 'verification/bodian');
fs.mkdirSync(evidence, { recursive: true });
const runtimeSource = fs.readFileSync(path.join(root, 'entry/src/main/ets/services/bodian/BodianRuntime.js'), 'utf8')
  .replace(/import (\w+) from ["']@ohos\.url["'];/, 'const $1 = { URL: globalThis.URL, URLParams: globalThis.URLSearchParams };');
const { createBodianRuntime } = await import(`data:text/javascript;base64,${Buffer.from(runtimeSource).toString('base64')}`);
const calls = [], replies = [], errors = [];
const runtime = createBodianRuntime('a'.repeat(32), () => '', () => {}, async payload => {
  const input = JSON.parse(payload), endpoint = new URL(input.url).pathname;
  let data = {};
  if (endpoint.endsWith('qrCode')) data = { qrCode: 'synthetic-browser-qr' };
  else if (endpoint.endsWith('qrCodeStatus')) data = { status: 1 };
  else if (endpoint.includes('search/music/list')) data = { resultList: [{ id: 123, songName: '波点测试歌曲', artist: '测试歌手', duration: 30 }], total: 1 };
  else if (endpoint.endsWith('finds/playlist')) data = { lists: [] };
  else if (endpoint.endsWith('home/module')) data = { songList: [] };
  else if (endpoint.endsWith('recommendList')) data = { musicList: [] };
  return JSON.stringify({ status: 200, body: JSON.stringify({ code: 200, data }) });
});
const server = http.createServer((req, res) => {
  const file = path.resolve(assets, decodeURIComponent(new URL(req.url, 'http://localhost').pathname).slice(1));
  if (!file.startsWith(assets + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404); res.end(); return; }
  const type = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' }[path.extname(file)] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': type }); fs.createReadStream(file).pipe(res);
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
  page.on('pageerror', error => errors.push(error.message));
  await page.exposeFunction('__nativeBodian', async (operation, payload) => {
    calls.push(operation);
    const result = await runtime.request(operation, payload);
    replies.push(result);
    return result;
  });
  await page.addInitScript(() => {
    localStorage.clear();
    window.__snapshots = [];
    window.FoliaNative = {
      getConfig: () => JSON.stringify({ netease: '', qq: '', kugou: '', server: '', aiProvider: 'gemini' }),
      getPortraitMode: () => false, getFiles: () => '[]', toast: () => {}, openExternal: () => {},
      publish: payload => window.__snapshots.push({ ...window.__snapshots.at(-1), ...JSON.parse(payload) }),
      requestBackend: id => window.HarmonyBackend.receive(id, JSON.stringify({ status: 503, body: '', error: 'verification offline' })),
      requestBodian: (id, operation, payload) => { void window.__nativeBodian(operation, payload).then(reply => window.HarmonyBodian.receive(id, reply)); },
    };
  });
  await page.goto(`http://127.0.0.1:${server.address().port}/harmony.html`);
  await page.waitForFunction(() => window.__snapshots.at(-1)?.ready);
  const button = page.getByRole('button', { name: /波点/ }).first();
  await button.waitFor();
  await button.click();
  await button.click();
  const image = page.getByRole('img', { name: 'QR Code' });
  await image.waitFor();
  await page.waitForFunction(() => {
    const image = document.querySelector('img[alt="QR Code"]');
    return image?.complete && image.naturalWidth === 320;
  });
  assert.match(await image.getAttribute('src'), /^data:image\/png;base64,/);
  const search = await page.evaluate(async () => window.HarmonyBodian.request('search', { query: 'test', limit: 20, offset: 0 }));
  assert.equal(search.data.resultList[0].songName, '波点测试歌曲');
  assert.ok(calls.includes('login_qr_key') && calls.includes('login_qr_create'));
  assert.ok(!replies.some(reply => /"(?:token|uid)":/.test(reply)));
  assert.deepEqual(errors, []);
  await page.screenshot({ path: path.join(evidence, 'browser-qr.png') });
  const checks = { checks: ['Production provider entry visible', 'Existing login flow reaches native protocol', 'Public QR URL renders to 320px PNG', 'Search traverses asynchronous native bridge', 'Credentials absent from renderer replies'], errors,
    limitation: 'Production Chrome and actual protocol bundle with synthetic upstream responses; no real account or device network.' };
  fs.writeFileSync(path.join(evidence, 'browser-checks.json'), JSON.stringify(checks, null, 2));
  console.log(JSON.stringify(checks));
} finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
