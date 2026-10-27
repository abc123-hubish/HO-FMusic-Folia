import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { chromium } from '../upstream/folia-major/node_modules/playwright-core/index.mjs';

// tools/verify-background-playback.mjs
// Real production renderer and Web Audio, with native visibility simulated independently of document.hidden.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const assets = process.env.FOLIA_BACKGROUND_ASSETS || path.join(root, 'entry/src/main/resources/rawfile/folia');
const evidence = path.resolve(root, process.env.FOLIA_BACKGROUND_EVIDENCE || 'verification/background-playback');
fs.mkdirSync(evidence, { recursive: true });
const rate = 22050, seconds = 30, count = rate * seconds;
const wav = Buffer.alloc(44 + count * 2);
wav.write('RIFF'); wav.writeUInt32LE(wav.length - 8, 4); wav.write('WAVEfmt ', 8);
wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22);
wav.writeUInt32LE(rate, 24); wav.writeUInt32LE(rate * 2, 28); wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34);
wav.write('data', 36); wav.writeUInt32LE(count * 2, 40);
for (let index = 0; index < count; index++) wav.writeInt16LE(Math.round(Math.sin(index * 2 * Math.PI * 220 / rate) * 400), 44 + index * 2);
const lyric = '[00:00.00]Background playback\n[00:03.00]The music keeps going\n[00:08.00]Only visible pictures move\n[00:12.00]Return to the right time';
const mime = file => ({ '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css',
    '.svg': 'image/svg+xml', '.json': 'application/json', '.png': 'image/png', '.woff2': 'font/woff2' })[path.extname(file)] || 'application/octet-stream';
const server = http.createServer((request, response) => {
    const name = decodeURIComponent(new URL(request.url, 'http://localhost').pathname).slice(1);
    if (name === 'background-tone.wav') {
        response.writeHead(200, { 'Content-Type': 'audio/wav' }); response.end(wav); return;
    }
    const file = path.resolve(assets, name || 'harmony.html');
    if (!file.startsWith(assets + path.sep) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
        response.writeHead(404); response.end(); return;
    }
    response.writeHead(200, { 'Content-Type': mime(file) }); fs.createReadStream(file).pipe(response);
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true, args: ['--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
// Playwright defaults to RAF polling, which intentionally stops in this test's background state.
const waitFor = (predicate, arg = null, options = {}) => page.waitForFunction(predicate, arg, { polling: 100, ...options });
const checks = [], samples = [], errors = [];
page.on('pageerror', error => errors.push(error.message));
const command = (action, id = '') => page.evaluate(async ({ action, id }) => {
    await window.HarmonyApp.command(JSON.stringify({ action, id }));
}, { action, id });
const foreground = value => page.evaluate(value => {
    window.__nativeForeground = value;
    window.HarmonyLifecycle.setForeground(value);
}, value);
const sample = async label => {
    const before = await page.evaluate(() => ({ ...window.__backgroundMetrics, position: window.__snapshots.at(-1).position }));
    await page.waitForTimeout(2200);
    const after = await page.evaluate(() => ({ ...window.__backgroundMetrics, position: window.__snapshots.at(-1).position,
        playing: window.__snapshots.at(-1).playing, videoPaused: [...document.querySelectorAll('video')]
            .filter(video => video.src.endsWith('background-tone.wav')).every(video => video.paused) }));
    const result = { label, durationMs: 2200, nativeFrames: after.nativeFrames - before.nativeFrames,
        frequencyReads: after.frequencyReads - before.frequencyReads, progressSeconds: after.position - before.position,
        playing: after.playing, videoPaused: after.videoPaused };
    samples.push(result); return result;
};
try {
    await page.route('https://folia.local/native/**', async route => {
        const isLyric = route.request().url().endsWith('.lrc');
        // A seekable test stream must honour ranges. Without this the browser exposes [0, 0]
        // as its seekable range and clamps the near-end seek to zero before the auto-next check.
        const range = !isLyric && /^bytes=(\d+)-(\d*)$/.exec(route.request().headers().range || '');
        const start = range ? Number(range[1]) : 0;
        const end = range && range[2] ? Math.min(Number(range[2]), wav.length - 1) : wav.length - 1;
        await route.fulfill({ status: range ? 206 : 200, body: isLyric ? lyric : wav.subarray(start, end + 1),
            contentType: isLyric ? 'text/plain' : 'audio/wav',
            headers: { 'Access-Control-Allow-Origin': '*', ...(!isLyric ? { 'Accept-Ranges': 'bytes' } : {}),
                ...(range ? { 'Content-Range': `bytes ${start}-${end}/${wav.length}` } : {}) } });
    });
    await page.addInitScript(({ videoUrl }) => {
        localStorage.setItem('harmony_initialized', 'true');
        localStorage.setItem('folia_app_language', 'en');
        localStorage.setItem('visualizer_frame_rate', 'off');
        localStorage.setItem('static_mode', 'false');
        localStorage.setItem('playback_entry_view', 'player');
        localStorage.setItem('library_suite', 'grid');
        localStorage.setItem('video_layer_enabled', 'true');
        localStorage.setItem('video_layer_url', videoUrl);
        window.__snapshots = []; window.__toasts = []; window.__nativeForeground = false;
        window.__backgroundMetrics = { nativeFrames: 0, frequencyReads: 0 };
        const nativeRaf = window.requestAnimationFrame.bind(window);
        window.requestAnimationFrame = callback => nativeRaf(time => { window.__backgroundMetrics.nativeFrames++; callback(time); });
        const readSpectrum = AnalyserNode.prototype.getByteFrequencyData;
        AnalyserNode.prototype.getByteFrequencyData = function (...args) {
            window.__backgroundMetrics.frequencyReads++; return readSpectrum.apply(this, args);
        };
        window.FoliaNative = {
            getConfig: () => JSON.stringify({ netease: '', qq: '', kugou: '', server: '', aiProvider: 'gemini' }),
            saveConfig: () => '', getForeground: () => window.__nativeForeground,
            getPortraitMode: () => false, setPortraitMode: () => {},
            getFiles: () => localStorage.getItem('test_native_files') || '[]', removeFiles: () => {},
            openExternal: () => {}, toast: message => window.__toasts.push(message),
            publish: payload => window.__snapshots.push({ ...window.__snapshots.at(-1), ...JSON.parse(payload) }),
            beginBlob: () => {}, appendBlob: () => {}, finishBlob: id => id, exportFile: () => {}, requestImport: () => {},
            requestBackend: id => window.HarmonyBackend.receive(id, JSON.stringify({ status: 503, body: '', error: 'No test backend' })),
        };
    }, { videoUrl: `${origin}/background-tone.wav` });
    await page.goto(`${origin}/harmony.html`);
    await waitFor(() => window.HarmonyApp && window.__snapshots.at(-1)?.ready, null, { timeout: 45000 });
    assert.equal(await page.evaluate(() => document.hidden), false);
    assert.equal(await page.evaluate(() => window.__backgroundMetrics.nativeFrames), 0);
    assert(await page.locator('html[data-harmony-background]').count());
    checks.push('Cold boot in native background starts no RAF even when document.hidden is false and FPS cap is off');

    const files = ['one', 'two'].flatMap((id, index) => [
        { id: `background-${id}`, name: `Background - Track ${index + 1}.wav`, url: `https://folia.local/native/background-${id}`,
            size: wav.length, mime: 'audio/wav', modified: index + 1 },
        { id: `background-${id}.lrc`, name: `Background - Track ${index + 1}.lrc`, url: `https://folia.local/native/background-${id}.lrc`,
            size: Buffer.byteLength(lyric), mime: 'text/plain', modified: index + 1 },
    ]);
    await page.evaluate(async files => {
        localStorage.setItem('test_native_files', JSON.stringify(files));
        await window.HarmonyApp.importFiles(JSON.stringify(files));
    }, files);
    await waitFor(() => window.__snapshots.at(-1).local.length === 2);
    // A native single-song command intentionally replaces the queue; use the real library to build a two-song queue.
    await foreground(true);
    await page.getByRole('button', { name: 'Folder', exact: true }).last().click();
    await page.getByRole('heading', { name: 'All Songs', exact: true }).first().click();
    await page.locator('[data-library-renderer="grid"] [data-grid-card-play="play"]').first().dispatchEvent('click');
    await waitFor(() => window.__snapshots.at(-1).playing && window.__snapshots.at(-1).duration > 0);
    const firstSong = await page.evaluate(() => window.__snapshots.at(-1).songId);
    assert.equal(await page.evaluate(() => window.__snapshots.at(-1).queue.length), 2);
    checks.push('Two-song queue created through the real local-library play control');
    await foreground(false);
    await page.waitForTimeout(200);
    const hidden = await sample('hidden-playing');
    assert.equal(hidden.nativeFrames, 0); assert.equal(hidden.frequencyReads, 0);
    assert(hidden.progressSeconds >= 1, JSON.stringify(hidden)); assert(hidden.playing); assert(hidden.videoPaused);
    checks.push('Real Web Audio plays and native progress advances with zero RAF/FFT and paused background video');

    await command('pause');
    await waitFor(() => !window.__snapshots.at(-1).playing && [...document.querySelectorAll('audio')].every(audio => audio.paused));
    // The final timeupdate follows pause asynchronously; let the native snapshot catch up.
    await page.waitForTimeout(300);
    const paused = await sample('hidden-paused');
    assert.equal(paused.nativeFrames, 0); assert.equal(paused.frequencyReads, 0); assert(Math.abs(paused.progressSeconds) < 0.2);
    await command('seek', '3000'); await command('play');
    await waitFor(() => window.__snapshots.at(-1).playing && window.__snapshots.at(-1).position >= 3);
    await command('next');
    await waitFor(firstSong => window.__snapshots.at(-1).songId !== firstSong && window.__snapshots.at(-1).playing, firstSong);
    checks.push('System pause, seek, play and next commands still work while visuals are suspended');

    const previousSource = await page.evaluate(() => [...document.querySelectorAll('audio')].find(audio => !audio.paused)?.currentSrc);
    await command('pause');
    await waitFor(() => [...document.querySelectorAll('audio')].every(audio => audio.paused));
    await command('queue', firstSong);
    // Track metadata can arrive before the audio-source effect: seek only after the new deck is really playing.
    await waitFor(({ firstSong, previousSource }) => window.__snapshots.at(-1).songId === firstSong
        && window.__snapshots.at(-1).playing && [...document.querySelectorAll('audio')].some(audio => !audio.paused
            && audio.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA
            && audio.currentSrc !== previousSource && audio.currentTime > 0.08 && audio.currentTime < 1), { firstSong, previousSource });
    await command('seek', String((seconds - 0.5) * 1000));
    samples.push(await page.evaluate(() => ({ label: 'seek-near-end', audio: [...document.querySelectorAll('audio')].map(audio => ({
        time: audio.currentTime, duration: audio.duration, seeking: audio.seeking, readyState: audio.readyState,
        source: audio.currentSrc, seekable: [...Array(audio.seekable.length)].map((_, index) => [audio.seekable.start(index), audio.seekable.end(index)]),
    })) })));
    await waitFor(firstSong => window.__snapshots.at(-1).songId !== firstSong && window.__snapshots.at(-1).playing, firstSong,
        { timeout: 15000 });
    checks.push('End-of-track automatically advances the local queue while still in native background');

    await foreground(true);
    await waitFor(() => window.__backgroundMetrics.frequencyReads > 0);
    await waitFor(() => [...document.querySelectorAll('video')].some(video => video.src.endsWith('background-tone.wav') && !video.paused));
    const shown = await sample('foreground-playing');
    assert(shown.nativeFrames > 0 && shown.frequencyReads > 0);
    checks.push('Returning to foreground restores real visual sampling and background video without restarting the audio');
    for (const mode of ['sonnet', 'diorama', 'fume', 'cadenza']) {
        await command('mode', mode); await page.waitForTimeout(350);
        await foreground(false); await page.waitForTimeout(100);
        const state = await sample(`hidden-${mode}`);
        assert.equal(state.nativeFrames, 0); assert.equal(state.frequencyReads, 0); assert(state.playing);
        await foreground(true); await page.waitForTimeout(100);
    }
    checks.push('Pixi, Three.js and Canvas modes stay suspended across repeated foreground/background transitions');
    assert.equal(errors.length, 0, errors.join('\n'));
    await page.screenshot({ path: path.join(evidence, 'resumed-player.png') });
    fs.writeFileSync(path.join(evidence, 'browser-checks.json'), JSON.stringify({ checks, samples, errors,
        limitation: 'Production bundle tested in desktop Chrome with simulated native visibility. No phone CPU/GPU profiling or lock-screen device acceptance.' }, null, 2));
    console.log(JSON.stringify({ passed: checks.length, checks, samples }, null, 2));
} catch (error) {
    await page.screenshot({ path: path.join(evidence, 'failure.png') });
    fs.writeFileSync(path.join(evidence, 'browser-checks.json'), JSON.stringify({ checks, samples, errors, failure: String(error),
        snapshot: await page.evaluate(() => window.__snapshots?.at(-1)), toasts: await page.evaluate(() => window.__toasts),
        metrics: await page.evaluate(() => window.__backgroundMetrics) }, null, 2));
    throw error;
} finally {
    await browser.close(); await new Promise(resolve => server.close(resolve));
}
