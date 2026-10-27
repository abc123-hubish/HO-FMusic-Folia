import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { chromium } from '../upstream/folia-major/node_modules/playwright-core/index.mjs';

// tools/verify-audio-source-transitions.mjs
// Capture the real production audio graph on its audio thread while changing tracks and stalling the page.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const baseline = process.argv.includes('--baseline');
const assets = process.env.FOLIA_AUDIO_ASSETS || path.join(root, 'entry/src/main/resources/rawfile/folia');
const evidence = path.join(root, 'verification/audio-source-transitions');
fs.mkdirSync(evidence, { recursive: true });
const makeWav = frequency => {
    const rate = 48000, count = rate * 18;
    const wav = Buffer.alloc(44 + count * 2);
    wav.write('RIFF'); wav.writeUInt32LE(wav.length - 8, 4); wav.write('WAVEfmt ', 8);
    wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22);
    wav.writeUInt32LE(rate, 24); wav.writeUInt32LE(rate * 2, 28); wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34);
    wav.write('data', 36); wav.writeUInt32LE(count * 2, 40);
    for (let n = 0; n < count; n++) wav.writeInt16LE(Math.round(Math.cos(n * 2 * Math.PI * frequency / rate) * 18000), 44 + n * 2);
    return wav;
};
const tones = { one: makeWav(150), two: makeWav(225) };
const lyric = '[00:00.00]Audio source regression\n[00:05.00]Keep the music playing\n[00:10.00]Smooth source changes';
const mime = file => ({ '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css',
    '.svg': 'image/svg+xml', '.json': 'application/json', '.png': 'image/png', '.woff2': 'font/woff2' })[path.extname(file)] || 'application/octet-stream';
const server = http.createServer((request, response) => {
    const name = decodeURIComponent(new URL(request.url, 'http://localhost').pathname).slice(1);
    const file = path.resolve(assets, name || 'harmony.html');
    if (!file.startsWith(assets + path.sep) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
        response.writeHead(404); response.end(); return;
    }
    response.writeHead(200, { 'Content-Type': mime(file) }); fs.createReadStream(file).pipe(response);
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true, args: ['--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
const errors = [], samples = [], checks = [];
page.on('pageerror', error => errors.push(error.message));
const waitFor = (predicate, arg = null) => page.waitForFunction(predicate, arg, { polling: 50, timeout: 45000 });
const command = (action, id = '') => page.evaluate(({ action, id }) => window.HarmonyApp.command(JSON.stringify({ action, id })), { action, id });
const capture = operation => page.evaluate(operation => new Promise(resolve => {
    window.__capture.port.onmessage = event => resolve(event.data);
    window.__capture.port.postMessage(operation);
}), operation);
const worklet = `class Capture extends AudioWorkletProcessor {
    constructor() { super(); this.reset(); this.port.onmessage = e => {
        if (e.data === 'reset') this.reset();
        this.port.postMessage({ maxStep: this.maxStep, peak: this.peak, frames: this.frames,
            nonzero: this.nonzero, maxZeroRun: this.maxZeroRun, rate: sampleRate, step: this.step });
    }; }
    reset() { this.previous = null; this.maxStep = 0; this.peak = 0; this.frames = 0;
        this.nonzero = 0; this.zeroRun = 0; this.maxZeroRun = 0; this.step = null; }
    process(inputs) { const samples = inputs[0]?.[0]; if (samples) for (const sample of samples) {
        if (this.previous !== null && Math.abs(sample - this.previous) > this.maxStep) {
            this.maxStep = Math.abs(sample - this.previous); this.step = { time: currentTime, from: this.previous, to: sample };
        }
        this.previous = sample; this.peak = Math.max(this.peak, Math.abs(sample)); this.frames++;
        if (Math.abs(sample) > 1e-7) { this.nonzero++; this.zeroRun = 0; }
        else { this.zeroRun++; this.maxZeroRun = Math.max(this.maxZeroRun, this.zeroRun); }
    } return true; }
} registerProcessor('capture', Capture);`;
try {
    await page.route('https://folia.local/native/**', async route => {
        const url = route.request().url();
        const isLyric = url.endsWith('.lrc');
        await route.fulfill({ status: 200, body: isLyric ? lyric : tones[url.includes('two') ? 'two' : 'one'],
            contentType: isLyric ? 'text/plain' : 'audio/wav', headers: { 'Access-Control-Allow-Origin': '*' } });
    });
    await page.addInitScript(() => {
        localStorage.setItem('harmony_initialized', 'true');
        localStorage.setItem('folia_app_language', 'en');
        localStorage.setItem('playback_entry_view', 'player');
        localStorage.setItem('library_suite', 'grid');
        localStorage.setItem('automix_enabled', 'false');
        window.__snapshots = []; window.__toasts = []; window.__explicitLoads = 0; window.__audioEdges = []; window.__envelopeEvents = [];
        const NativeContext = window.AudioContext;
        window.AudioContext = class extends NativeContext {
            constructor(options) { super(options); window.__audioContext = this; window.__audioOptions = options || {}; }
        };
        const connect = AudioNode.prototype.connect;
        AudioNode.prototype.connect = function (target, ...rest) {
            window.__audioEdges.push([this, target]);
            if (this instanceof AnalyserNode && target === this.context.destination) window.__audioOutput = this;
            return connect.call(this, target, ...rest);
        };
        for (const method of ['setValueAtTime', 'linearRampToValueAtTime', 'cancelAndHoldAtTime']) {
            const original = AudioParam.prototype[method];
            AudioParam.prototype[method] = function (...args) {
                const fade = window.__audioEdges.find(([, target]) => target === window.__audioOutput)?.[0];
                const sourceFade = window.__audioEdges.find(([, target]) => target === fade)?.[0];
                if (sourceFade?.gain === this) window.__envelopeEvents.push({ method, args, at: sourceFade.context.currentTime });
                return original.apply(this, args);
            };
        }
        const load = HTMLMediaElement.prototype.load;
        HTMLMediaElement.prototype.load = function () { if (this.isConnected) window.__explicitLoads++; return load.call(this); };
        window.FoliaNative = {
            getConfig: () => JSON.stringify({ netease: '', qq: '', kugou: '', server: '', aiProvider: 'gemini' }),
            saveConfig: () => '', getForeground: () => true, getPortraitMode: () => false, setPortraitMode: () => {},
            getFiles: () => localStorage.getItem('test_native_files') || '[]', removeFiles: () => {},
            openExternal: () => {}, toast: message => window.__toasts.push(message),
            publish: payload => window.__snapshots.push({ ...window.__snapshots.at(-1), ...JSON.parse(payload) }),
            beginBlob: () => {}, appendBlob: () => {}, finishBlob: id => id, exportFile: () => {}, requestImport: () => {},
            requestBackend: id => window.HarmonyBackend.receive(id, JSON.stringify({ status: 503, body: '', error: 'No test backend' })),
        };
    });
    await page.goto(`http://127.0.0.1:${server.address().port}/harmony.html`);
    await waitFor(() => window.HarmonyApp && window.__snapshots.at(-1)?.ready);
    const files = ['one', 'two'].flatMap((id, index) => [
        { id: `source-${id}`, name: `Source - Track ${index + 1}.wav`, url: `https://folia.local/native/source-${id}`,
            size: tones[id].length, mime: 'audio/wav', modified: index + 1 },
        { id: `source-${id}.lrc`, name: `Source - Track ${index + 1}.lrc`, url: `https://folia.local/native/source-${id}.lrc`,
            size: Buffer.byteLength(lyric), mime: 'text/plain', modified: index + 1 },
    ]);
    await page.evaluate(async files => {
        localStorage.setItem('test_native_files', JSON.stringify(files));
        await window.HarmonyApp.importFiles(JSON.stringify(files));
    }, files);
    await waitFor(() => window.__snapshots.at(-1)?.local?.length === 2);
    const ids = await page.evaluate(() => window.__snapshots.at(-1).local.map(song => song.id));
    await command('local', ids[0]);
    await waitFor(() => window.__snapshots.at(-1).playing && window.__audioOutput);
    await page.evaluate(async worklet => {
        const context = window.__audioContext;
        const url = URL.createObjectURL(new Blob([worklet], { type: 'application/javascript' }));
        await context.audioWorklet.addModule(url); URL.revokeObjectURL(url);
        window.__capture = new AudioWorkletNode(context, 'capture');
        window.__audioOutput.connect(window.__capture).connect(context.destination);
    }, worklet);
    await waitFor(() => window.__audioContext.currentTime > 1);
    await capture('reset');
    await page.evaluate(() => { const until = performance.now() + 700; while (performance.now() < until) {} });
    const busy = await capture('snapshot');
    samples.push({ label: 'busy-page-steady-playback', ...busy });
    assert(busy.nonzero > busy.rate * 0.5, JSON.stringify(busy));
    assert(busy.maxZeroRun < busy.rate * 0.02, JSON.stringify(busy));
    checks.push('Audio-thread PCM continues while the page thread is blocked for 700ms');

    const loadsBefore = await page.evaluate(() => window.__explicitLoads);
    for (let n = 0; n < 8; n++) {
        await capture('reset');
        await command('local', ids[(n + 1) % 2]);
        await waitFor(() => window.__snapshots.at(-1).playing && [...document.querySelectorAll('audio')].some(audio => !audio.paused && audio.currentTime > 0.08));
        await page.waitForTimeout(200);
        const sample = await capture('snapshot');
        samples.push({ label: `source-change-${n + 1}`, ...sample });
        if (!baseline) assert(sample.maxStep < 0.045, JSON.stringify(sample));
        assert(sample.nonzero > 1000, JSON.stringify(sample));
    }
    checks.push('Eight local source replacements captured after the real effects, volume and fade nodes');
    const explicitLoads = await page.evaluate(() => window.__explicitLoads) - loadsBefore;
    if (!baseline) assert.equal(explicitLoads, 0, 'No second load() after React assigned src');
    await command('pause');
    await waitFor(() => [...document.querySelectorAll('audio')].every(audio => audio.paused));
    await command('play');
    await waitFor(() => [...document.querySelectorAll('audio')].some(audio => !audio.paused));
    await page.waitForTimeout(250);
    await capture('reset'); await page.waitForTimeout(150);
    const resumed = await capture('snapshot');
    assert(resumed.peak > 0.1, JSON.stringify(resumed));
    checks.push('Pause/resume remains audible after source replacement');
    const selected = await page.evaluate(() => window.__snapshots.at(-1).songId.replace(/^local:/, ''));
    await command('local', selected);
    await page.waitForTimeout(300);
    await capture('reset'); await page.waitForTimeout(150);
    assert((await capture('snapshot')).peak > 0.1);
    checks.push('Selecting the already-playing song again restores its source envelope');
    await page.evaluate(ids => Promise.all(ids.map(id => window.HarmonyApp.command(JSON.stringify({ action: 'local', id })))), ids);
    await waitFor(id => window.__snapshots.at(-1).songId === `local:${id}` && window.__snapshots.at(-1).playing
        && [...document.querySelectorAll('audio')].some(audio => !audio.paused && audio.currentSrc.endsWith(id) && audio.currentTime > 0.08), ids.at(-1));
    await capture('reset'); await page.waitForTimeout(150);
    assert((await capture('snapshot')).peak > 0.1);
    checks.push('Concurrent track requests play the last requested source audibly without an uncaught rejection');
    assert.equal(errors.length, 0, errors.join('\n'));
    const context = await page.evaluate(() => ({ options: window.__audioOptions, baseLatency: window.__audioContext.baseLatency,
        sampleRate: window.__audioContext.sampleRate }));
    if (!baseline) assert.equal(context.options.latencyHint, 'playback');
    const report = { checks, samples, explicitLoads, context, errors,
        limitation: 'Desktop Chrome with a simulated Harmony bridge and synthetic tones. Physical phone listening and underrun profiling remain unverified.' };
    fs.writeFileSync(path.join(evidence, baseline ? 'baseline.json' : 'fixed.json'), JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
} catch (error) {
    fs.writeFileSync(path.join(evidence, baseline ? 'baseline-failure.json' : 'failure.json'), JSON.stringify({ error: String(error), samples, errors,
        state: await page.evaluate(() => ({ snapshot: window.__snapshots?.at(-1), toasts: window.__toasts,
            envelopeEvents: window.__envelopeEvents, context: { state: window.__audioContext?.state, latency: window.__audioContext?.baseLatency } })) }, null, 2));
    throw error;
} finally {
    await browser.close(); await new Promise(resolve => server.close(resolve));
}
