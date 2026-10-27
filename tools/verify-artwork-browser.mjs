import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { stripTypeScriptTypes } from 'node:module';
import { chromium } from '../upstream/folia-major/node_modules/playwright-core/index.mjs';

// tools/verify-artwork-browser.mjs
// Exercise the real cover conversion with browser Blob/data images, rather than mocking canvas decoding.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = fs.readFileSync(path.join(root, 'upstream/folia-major/src/harmony/artworkPublisher.ts'), 'utf8');
const compiled = stripTypeScriptTypes(source, { mode: 'transform' }).replace(/^export /gm, '');
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
let server;
try {
  const page = await browser.newPage();
  await page.addScriptTag({ content: compiled });
  const result = await page.evaluate(async () => {
    const canvas = document.createElement('canvas'); canvas.width = 1400; canvas.height = 1000;
    const context = canvas.getContext('2d'); context.fillStyle = '#a5326c'; context.fillRect(0, 0, 1400, 1000);
    const input = canvas.toDataURL('image/png');
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    const url = URL.createObjectURL(blob);
    const inspect = async value => {
      const picture = new Image(); picture.src = value; await picture.decode();
      return { jpeg: value.startsWith('data:image/jpeg;base64,'), width: picture.naturalWidth,
        height: picture.naturalHeight, bytes: value.length };
    };
    try {
      const blobImage = await inspect(await readHarmonyArtwork(url));
      const dataImage = await inspect(await readHarmonyArtwork(input));
      const sent = [];
      const publisher = createHarmonyArtworkPublisher((...args) => sent.push(args));
      publisher.update('local:one', url);
      for (let i = 0; i < 100 && sent.length === 0; i++) await new Promise(resolve => setTimeout(resolve, 10));
      for (let i = 0; i < 60; i++) publisher.update('local:one', url);
      publisher.dispose();
      return { blobImage, dataImage, calls: sent.length, songId: sent[0]?.[0], cover: sent[0]?.[1] === url,
        sourceIsJpeg: sent[0]?.[2].startsWith('data:image/jpeg;base64,') };
    } finally { URL.revokeObjectURL(url); }
  });
  for (const image of [result.blobImage, result.dataImage]) {
    assert.equal(image.jpeg, true); assert.equal(image.width, 512); assert.equal(image.height, 366);
    assert.ok(image.bytes < 100000);
  }
  assert.equal(result.calls, 1); assert.equal(result.songId, 'local:one');
  assert.equal(result.cover, true); assert.equal(result.sourceIsJpeg, true);
  const assets = path.join(root, 'entry/src/main/resources/rawfile/folia');
  server = http.createServer((req, res) => {
    const name = decodeURIComponent(new URL(req.url, 'http://localhost').pathname).slice(1);
    const file = path.resolve(assets, name || 'harmony.html');
    if (!file.startsWith(assets + path.sep) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404); res.end(); return;
    }
    const mime = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.svg': 'image/svg+xml',
      '.json': 'application/json', '.png': 'image/png', '.woff2': 'font/woff2' }[path.extname(file)] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime }); fs.createReadStream(file).pipe(res);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const rate = 22050, count = rate * 30, wav = Buffer.alloc(44 + count * 2);
  wav.write('RIFF'); wav.writeUInt32LE(wav.length - 8, 4); wav.write('WAVEfmt ', 8);
  wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(rate, 24); wav.writeUInt32LE(rate * 2, 28); wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34);
  wav.write('data', 36); wav.writeUInt32LE(count * 2, 40);
  const png = Buffer.from(await page.evaluate(() => {
    const canvas = document.createElement('canvas'); canvas.width = 900; canvas.height = 900;
    const context = canvas.getContext('2d'); context.fillStyle = '#a5326c'; context.fillRect(0, 0, 900, 900);
    return canvas.toDataURL('image/png').split(',')[1];
  }), 'base64');
  const app = await browser.newPage({ viewport: { width: 960, height: 540 } });
  const errors = []; app.on('pageerror', error => errors.push(error.message));
  await app.route('https://folia.local/native/**', route => route.fulfill({ status: 200,
    body: route.request().url().endsWith('/cover') ? png : wav,
    contentType: route.request().url().endsWith('/cover') ? 'image/png' : 'audio/wav',
    headers: { 'Access-Control-Allow-Origin': '*' } }));
  await app.addInitScript(() => {
    window.__snapshot = {}; window.__artworks = [];
    window.FoliaNative = {
      getConfig: () => JSON.stringify({ netease: '', qq: '', kugou: '', server: '', aiProvider: 'gemini' }),
      getPortraitMode: () => false, getFiles: () => '[]',
      publish: payload => { window.__snapshot = { ...window.__snapshot, ...JSON.parse(payload) }; },
      publishArtwork: (songId, cover, source) => { window.__artworks.push({ songId, cover, source,
        matchesSnapshot: songId === window.__snapshot.songId && cover === window.__snapshot.cover }); },
      toast: () => {}, requestBackend: id => window.HarmonyBackend.receive(id,
        JSON.stringify({ status: 503, body: '', error: 'test backend unavailable' })),
    };
  });
  await app.goto(`http://127.0.0.1:${server.address().port}/harmony.html`);
  await app.waitForFunction(() => window.HarmonyApp && window.__snapshot.ready);
  const files = [
    { id: 'art-audio', name: 'Artwork probe.wav', relativePath: 'covered/Artwork probe.wav',
      url: 'https://folia.local/native/audio', size: wav.length, mime: 'audio/wav', modified: 1 },
    { id: 'art-cover', name: 'cover.png', relativePath: 'covered/cover.png',
      url: 'https://folia.local/native/cover', size: png.length, mime: 'image/png', modified: 1 },
    { id: 'plain-audio', name: 'No cover.wav', relativePath: 'plain/No cover.wav',
      url: 'https://folia.local/native/plain', size: wav.length, mime: 'audio/wav', modified: 1 },
  ];
  await app.evaluate(items => window.HarmonyApp.importFiles(JSON.stringify(items)), files);
  await app.waitForFunction(() => window.__snapshot.local?.length === 2);
  await app.evaluate(() => window.HarmonyApp.command(JSON.stringify({ action: 'local', id: 'art-audio' })));
  await app.waitForFunction(() => window.__snapshot.playing && window.__artworks.length > 0);
  await app.evaluate(() => window.HarmonyApp.command(JSON.stringify({ action: 'pause' })));
  await app.waitForFunction(() => !window.__snapshot.playing);
  // The local-cover cache can replace the initial object URL once its background read finishes.
  await app.waitForTimeout(1500);
  const transfer = await app.evaluate(() => ({ count: window.__artworks.length,
    matchesSnapshot: window.__artworks.every(item => item.matchesSnapshot),
    blobCover: window.__artworks.at(-1).cover.startsWith('blob:'),
    jpeg: window.__artworks.at(-1).source.startsWith('data:image/jpeg;base64,') }));
  await app.waitForTimeout(2200);
  const settled = await app.evaluate(() => ({ count: window.__artworks.length,
    sources: window.__artworks.map(item => item.cover), current: window.__snapshot.cover }));
  assert.equal(settled.count, transfer.count, JSON.stringify(settled));
  assert.equal(transfer.matchesSnapshot, true); assert.equal(transfer.blobCover, true); assert.equal(transfer.jpeg, true);
  await app.evaluate(() => window.HarmonyApp.command(JSON.stringify({ action: 'local', id: 'plain-audio' })));
  await app.waitForFunction(() => window.__snapshot.songId.includes('plain-audio') && window.__snapshot.cover === '');
  await app.evaluate(() => window.HarmonyApp.command(JSON.stringify({ action: 'pause' })));
  assert.deepEqual(errors, []);
  const evidence = path.join(root, 'verification/control-center-artwork');
  fs.writeFileSync(path.join(evidence, 'browser-artwork-checks.json'), JSON.stringify({ passed: true, ...result,
    productionHost: { ...transfer, noCoverTrack: true, pageErrors: errors },
    limitation: 'Chrome validates browser image conversion, not HarmonyOS control-center rendering.' }, null, 2));
  console.log(JSON.stringify({ ...result, productionHost: transfer }, null, 2));
} finally { await browser.close(); if (server) server.close(); }
