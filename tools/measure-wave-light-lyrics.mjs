import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { chromium } from '../upstream/folia-major/node_modules/playwright-core/index.mjs';

// tools/measure-wave-light-lyrics.mjs
// Repeatable browser CPU/style measurements; these are not phone power or thermal readings.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'upstream/folia-major');
const phase = process.argv[2] || 'after';
const evidence = path.join(root, 'verification/wave-light-glyph-performance-20261027');
const port = 4191, origin = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, [path.join(source, 'node_modules/vite/bin/vite.js'), '--host', '127.0.0.1', '--port', String(port), '--strictPort'],
    { cwd: source, stdio: 'ignore', windowsHide: true, env: { ...process.env, VITE_LIBRARY_INITIAL_SUITE: 'grid' } });
let browser;
try {
    for (let i = 0; i < 100; i++) {
        if (server.exitCode !== null) throw new Error(`Benchmark server exited: ${server.exitCode}`);
        try { if ((await fetch(origin)).ok) break; } catch { /* Await our own Vite startup. */ }
        if (i === 99) throw new Error('Benchmark server unavailable');
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
    const page = await browser.newPage({ viewport: { width: 1100, height: 800 }, serviceWorkers: 'block' });
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${origin}/dev-probe.html?probe=waveLightPerformance`);
    await page.waitForFunction(() => window.__waveLyricPerf?.ready);
    const client = await page.context().newCDPSession(page);
    await client.send('Performance.enable');
    const results = [];
    for (const count of [80, 240]) {
        await page.evaluate(count => window.__waveLyricPerf.resize(count), count);
        await page.waitForFunction(count => document.querySelectorAll('[data-wave-light-glyph]').length === count, count);
        await page.evaluate(() => {
            for (const animation of document.getAnimations()) animation.finish();
            window.__waveLyricPerf.burst(600);
        });
        const bursts = [];
        for (let i = 0; i < 7; i++) bursts.push(await page.evaluate(() => window.__waveLyricPerf.burst(1200)));
        await page.evaluate(() => window.__waveLyricPerf.time(0));
        const before = (await client.send('Performance.getMetrics')).metrics;
        await page.evaluate(async () => {
            for (let i = 0; i < 120; i++) {
                window.__waveLyricPerf.time(i / 120 * 6);
                await new Promise(requestAnimationFrame);
            }
        });
        const after = (await client.send('Performance.getMetrics')).metrics;
        const metrics = Object.fromEntries(after.filter(item => ['TaskDuration', 'ScriptDuration', 'RecalcStyleDuration', 'LayoutDuration', 'RecalcStyleCount', 'LayoutCount'].includes(item.name))
            .map(item => [item.name, item.value - before.find(old => old.name === item.name).value]));
        const snapshots = [];
        for (const time of [0, 0.075, 0.3, 0.9, 3, 6, 12, 12.7, 2.4]) {
            await page.evaluate(time => window.__waveLyricPerf.time(time), time);
            await page.evaluate(() => new Promise(requestAnimationFrame));
            snapshots.push(await page.locator('[data-wave-light-glyph]').evaluateAll((elements, time) => ({ time,
                glyphs: elements.map(el => {
                    const ghost = el.querySelector('.wave-light-glyph-ghost'), body = getComputedStyle(el), trail = getComputedStyle(ghost);
                    return [body.opacity, body.transform, trail.opacity, trail.transform];
                }) }), time));
        }
        await page.screenshot({ path: path.join(evidence, `${phase}-${count}.png`) });
        results.push({ count, bursts, medianBurstMs: [...bursts].sort((a, b) => a - b)[3], metrics, snapshots });
    }
    fs.writeFileSync(path.join(evidence, `${phase}.json`), JSON.stringify({ results, errors, browser: browser.version(), scope: 'Desktop Chrome; real WaveLightLyrics clock/style path, no GPU wave background.' }, null, 2));
    if (errors.length) throw new Error(errors.join('\n'));
    console.log(JSON.stringify(results.map(({ count, medianBurstMs, metrics }) => ({ count, medianBurstMs, metrics }))));
} finally { await browser?.close(); server.kill(); }
