import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { chromium } from '../upstream/folia-major/node_modules/playwright-core/index.mjs';
import { verifyBeatModel } from './verify-beat-model.mjs';

// tools/verify-smart-beat.mjs
// Exercise the emitted worker and its packaged checkpoint, rather than the Vite development graph.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const web = path.join(root, 'entry/src/main/resources/rawfile/folia');
const evidence = path.resolve(root, process.argv[2] || 'verification/smart-beat-20261026');
verifyBeatModel(path.join(root, 'upstream/folia-major'));
const worker = fs.readdirSync(path.join(web, 'assets')).find(name => /^smartBeat\.worker-.*\.js$/.test(name));
assert(worker, 'Packaged beat worker missing');
const server = http.createServer((request, response) => {
  const url = new URL(request.url, 'http://localhost');
  if (url.pathname === '/__probe__') { response.setHeader('content-type', 'text/html'); response.end('<!doctype html><title>Beat worker verification</title>'); return; }
  const file = path.resolve(web, decodeURIComponent(url.pathname).slice(1));
  if (!file.startsWith(web + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { response.writeHead(404); response.end(); return; }
  response.setHeader('content-type', file.endsWith('.js') ? 'application/javascript' : 'application/octet-stream');
  fs.createReadStream(file).pipe(response);
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
try {
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${server.address().port}/__probe__`);
  const run = engine => page.evaluate(async ({ workerFile, engine }) => {
    const adapter = await navigator.gpu?.requestAdapter();
    if (engine === 'gpu' && !adapter) return { supported: false };
    const info = adapter?.info;
    const mono = new Float32Array(22050 * 35);
    for (let i = 0; i < mono.length; i++) {
      const t = i / 22050, phase = t % 0.5;
      mono[i] = Math.sin(2 * Math.PI * 100 * t) * Math.exp(-phase * 30) * 0.7
        + Math.sin(2 * Math.PI * 1000 * t) * Math.exp(-phase * 90) * 0.2;
    }
    const started = performance.now();
    const data = await new Promise((resolve, reject) => {
      const job = new Worker(`/assets/${workerFile}`, { type: 'module' });
      const timer = setTimeout(() => { job.terminate(); reject(new Error('Production inference timed out')); }, 90_000);
      job.onmessage = event => { if (event.data.progress !== undefined) return; clearTimeout(timer); job.terminate(); event.data.error ? reject(new Error(event.data.error)) : resolve(event.data.result); };
      job.onerror = event => { clearTimeout(timer); job.terminate(); reject(new Error(event.message)); };
      if (engine === 'cpu') job.postMessage({ id: 1, operation: 'analyse', mono, engine }, [mono.buffer]);
      else fetch('/models/beat_this-wgsl.bin').then(response => response.arrayBuffer()).then(modelBytes => {
        job.postMessage({ id: 1, operation: 'analyse', mono, engine, modelBytes }, [mono.buffer, modelBytes]);
      }).catch(error => { clearTimeout(timer); job.terminate(); reject(error); });
    });
    return { supported: true, adapter: { vendor: info?.vendor, architecture: info?.architecture, description: info?.description },
      elapsedMs: Math.round(performance.now() - started), data };
  }, { workerFile: worker, engine });
  const result = await run('gpu');
  const cpu = await run('cpu');
  assert.equal(cpu.data.model, 'cpu-spectral-onset-v1');
  assert(cpu.data.beats.length > 20 && cpu.data.beats.some(time => time > 30));
  assert(result.supported, 'Verification browser has no WebGPU adapter');
  assert.equal(result.data.duration, 35);
  assert(result.data.beats.length > 20);
  assert(result.data.beats.some(time => time > 30), 'Second model chunk did not produce beats');
  assert.equal(result.data.accents.impact.length, result.data.beats.length);
  assert(result.data.beats.every((time, i, list) => Number.isFinite(time) && time >= 0 && time <= 36 && (!i || time > list[i - 1])));
  fs.mkdirSync(evidence, { recursive: true });
  fs.writeFileSync(path.join(evidence, 'production-worker.json'), JSON.stringify({ gpu: result, cpu, worker, browser: browser.version(),
    scope: 'Desktop Chrome, packaged Web assets. Not HarmonyOS device evidence.' }, null, 2));
  console.log(JSON.stringify({ passed: true, gpuBeats: result.data.beats.length, cpuBeats: cpu.data.beats.length,
    gpuElapsedMs: result.elapsedMs, cpuElapsedMs: cpu.elapsedMs, adapter: result.adapter }));
} finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
