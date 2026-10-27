import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { performance } from 'node:perf_hooks';
import { createServer, transformWithOxc } from '../upstream/folia-major/node_modules/vite/dist/node/index.js';
import { chromium } from '../upstream/folia-major/node_modules/playwright-core/index.mjs';

// tools/verify-music-animation.mjs
// Compare original/current canvas pixels and work counts locally; never connects to a device.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'upstream/folia-major');
const baselineEvidence = path.join(root, 'verification/music-animation-performance');
const evidence = path.resolve(root, process.env.FOLIA_ANIMATION_VERIFICATION_DIR || baselineEvidence);
fs.mkdirSync(evidence, { recursive: true });
const before = name => fs.readFileSync(path.join(baselineEvidence, 'before/src/components/visualizer', name), 'utf8');
const baselineModules = {
  '\0baseline-sora.tsx': before('backgrounds/sora/SoraBackground.tsx')
    .replace("'../../colorMix'", "'/src/components/visualizer/colorMix'"),
  '\0baseline-monet.tsx': before('monet/AudioOverlay.tsx')
    .replace("'../colorMix'", "'/src/components/visualizer/colorMix'"),
};
const html = `<!doctype html><html><head><style>
html,body{margin:0;background:#111}.pair{display:flex}.surface{position:relative;width:360px;height:240px}
.surface>canvas{display:block;width:100%;height:100%}
</style></head><body><div id="root"></div><script type="module" src="/__animation-main.js"></script></body></html>`;
// Module imports resolve through Vite so the exact installed React/Motion/TWGL versions are used.
const app = `import React from 'react';
import {createRoot} from 'react-dom/client';
import {motionValue} from 'framer-motion';
import BeforeSora from '/__baseline-sora.tsx';
import AfterSora from '/src/components/visualizer/backgrounds/sora/SoraBackground.tsx';
import BeforeMonet from '/__baseline-monet.tsx';
import AfterMonet from '/src/components/visualizer/monet/AudioOverlay.tsx';
const root=createRoot(document.getElementById('root'));
const bands={bass:motionValue(90),lowMid:motionValue(64),mid:motionValue(52),vocal:motionValue(110),treble:motionValue(35),spectrum:motionValue(new Uint8Array(0))};
window.__render=(kind,options={})=>{
 const theme={primaryColor:options.primary||'#80aaff',accentColor:options.accent||'#ff88aa'};
 bands.spectrum.set(options.raw?Uint8Array.from({length:1024},(_,i)=>(i*29)%256):new Uint8Array(0));
 const props=kind==='sora'?{theme,isDaylight:options.daylight||false,paused:options.paused??true}:{theme,mode:options.mode||'line',audioBands:bands,audioPower:bands.bass};
 const components=kind==='sora'?[BeforeSora,AfterSora]:[BeforeMonet,AfterMonet];
 root.render(React.createElement('div',{className:'pair'},...components.map((Component,i)=>React.createElement('div',{id:i?'after':'before',className:'surface',key:i},React.createElement(Component,props)))));
};
window.__render('sora');`;
const server = await createServer({
  configFile: false, root: source, cacheDir: path.join(evidence, 'vite-cache'),
  resolve: { alias: { '@': path.join(source, 'src') } },
  optimizeDeps: { noDiscovery: true, include: ['react', 'react-dom/client', 'framer-motion', 'twgl.js', 'react/jsx-runtime', 'react/jsx-dev-runtime'] },
  server: { host: '127.0.0.1', port: 0 },
  plugins: [{ name: 'animation-verification',
    resolveId(id) {
      if (id.startsWith('/__baseline-')) return '\0' + id.slice('/__'.length);
      if (id === '/__animation-main.js') return '\0animation-main.js';
    },
    async load(id) {
      if (baselineModules[id]) return (await transformWithOxc(baselineModules[id], id.slice(1))).code;
      return id === '\0animation-main.js' ? app : null;
    },
    configureServer(instance) {
      instance.middlewares.use((request, response, next) => {
        if (request.url !== '/__animation.html') return next();
        response.setHeader('Content-Type', 'text/html');
        response.end(html);
      });
    },
  }],
});
let browser;
const report = { limitation: 'Local deterministic browser/logic checks only; no device, FPS, CPU, temperature or power measurements.', pixelChecks: [], soraDrawCounts: {}, lyricLookup: {} };
try {
  await server.listen();
  browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const page = await browser.newPage({ viewport: { width: 1000, height: 800 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    window.__now = 0;
    performance.now = () => window.__now;
    const callbacks = new Map();
    let handle = 1;
    window.requestAnimationFrame = callback => { const id = handle++; callbacks.set(id, callback); return id; };
    window.cancelAnimationFrame = id => callbacks.delete(id);
    window.__tick = now => {
      window.__now = now;
      const pending = [...callbacks.values()];
      callbacks.clear();
      for (const callback of pending) callback(now);
    };
    window.__pixels = new WeakMap();
    window.__draws = { before: 0, after: 0 };
    for (const Context of [WebGLRenderingContext, WebGL2RenderingContext]) {
      const draw = Context.prototype.drawArrays;
      Context.prototype.drawArrays = function (...args) {
        draw.apply(this, args);
        const id = this.canvas.parentElement?.id;
        if (id === 'before' || id === 'after') window.__draws[id] += 1;
        const pixels = new Uint8Array(this.drawingBufferWidth * this.drawingBufferHeight * 4);
        this.readPixels(0, 0, this.drawingBufferWidth, this.drawingBufferHeight, this.RGBA, this.UNSIGNED_BYTE, pixels);
        window.__pixels.set(this.canvas, pixels);
      };
    }
  });
  await page.goto(`http://127.0.0.1:${server.httpServer.address().port}/__animation.html`);
  await page.waitForFunction(() => window.__render && document.querySelectorAll('canvas').length === 2);
  const settle = async () => { await page.waitForTimeout(120); await page.evaluate(() => window.__tick(window.__now)); };
  const compare = async (label, webgl) => {
    const result = await page.evaluate(webgl => {
      const canvases = [...document.querySelectorAll('canvas')];
      const pixels = canvases.map(canvas => webgl ? window.__pixels.get(canvas) : canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data);
      if (!pixels[0] || !pixels[1]) throw new Error('Missing rendered pixels');
      let changedChannels = 0;
      for (let index = 0; index < pixels[0].length; index += 1) if (pixels[0][index] !== pixels[1][index]) changedChannels += 1;
      return { dimensions: canvases.map(canvas => [canvas.width, canvas.height]), changedChannels, lengths: pixels.map(value => value.length) };
    }, webgl);
    assert.deepEqual(result.dimensions[0], result.dimensions[1], label);
    assert.equal(result.lengths[0], result.lengths[1], label);
    assert.equal(result.changedChannels, 0, label);
    report.pixelChecks.push({ label, ...result });
  };
  await settle();
  await compare('sora: initial frozen stars', true);
  report.soraDrawCounts = await page.evaluate(() => {
    const start = { ...window.__draws };
    for (let frame = 1; frame <= 60; frame += 1) window.__tick(frame * 16);
    return { original: window.__draws.before - start.before, optimized: window.__draws.after - start.after };
  });
  assert.equal(report.soraDrawCounts.original, 60);
  assert.equal(report.soraDrawCounts.optimized, 0);
  await page.evaluate(() => window.__render('sora', { primary: '#a070fa', accent: '#90fa70', daylight: true }));
  await settle();
  await compare('sora: frozen theme update', true);
  await page.evaluate(() => document.querySelectorAll('.surface').forEach(node => { node.style.width = '240px'; node.style.height = '400px'; }));
  await settle();
  await compare('sora: frozen portrait resize', true);
  await page.evaluate(() => window.__render('sora', { primary: '#a070fa', accent: '#90fa70', daylight: true, paused: false }));
  await page.waitForTimeout(120);
  for (const now of [976, 992, 1008]) {
    await page.evaluate(now => window.__tick(now), now);
    await compare(`sora: running frame ${now}`, true);
  }
  for (const mode of ['line', 'bars']) {
    for (const raw of [false, true]) {
      await page.evaluate(({ mode, raw }) => window.__render('monet', { mode, raw }), { mode, raw });
      await settle();
      for (const now of [1200, 1800, 2500]) {
        await page.evaluate(now => window.__tick(now), now);
        await compare(`monet: ${mode}, ${raw ? 'raw FFT' : 'band fallback'}, frame ${now}`, false);
      }
    }
  }
  assert.deepEqual(errors, []);
  const compiled = await transformWithOxc(fs.readFileSync(path.join(source, 'src/utils/lyrics/activeLineLookup.ts'), 'utf8'), 'activeLineLookup.ts');
  const { createActiveLineLookup, findLatestActiveLineIndex } = await import('data:text/javascript;base64,' + Buffer.from(compiled.code).toString('base64'));
  const lines = Array.from({ length: 5000 }, (_, index) => ({ startTime: index * 2, endTime: index * 2 + 1, words: [], fullText: '本地性能验证' }));
  const buildStart = performance.now();
  const indexed = createActiveLineLookup(lines);
  const indexBuildMs = performance.now() - buildStart;
  const queries = Array.from({ length: 3600 }, (_, index) => (index % 1800) / 60);
  const measure = fn => {
    const samples = [];
    let checksum = 0;
    for (let repeat = 0; repeat < 5; repeat += 1) {
      const start = performance.now();
      for (const time of queries) checksum += fn(time);
      samples.push(performance.now() - start);
    }
    return { medianMs: [...samples].sort((a, b) => a - b)[2], samplesMs: samples, checksum };
  };
  const original = measure(time => findLatestActiveLineIndex(lines, time));
  const optimized = measure(indexed);
  assert.equal(original.checksum, optimized.checksum);
  report.lyricLookup = { lines: lines.length, queriesPerSample: queries.length, indexBuildMs, original, optimized,
    limitation: 'Node microbenchmark of this lookup only; not total playback performance.' };
  fs.writeFileSync(path.join(evidence, 'browser-comparison.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser?.close();
  await server.close();
}
