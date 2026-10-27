import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '../upstream/folia-major/node_modules/playwright/index.mjs';

// Browser measurements against the existing Bravais probes; no device FPS claim.
const phase = process.argv[2] ?? 'after';
const out = path.resolve('verification/bravais-page-20261013');
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const page = await browser.newPage({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, serviceWorkers: 'block' });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
await page.addInitScript(() => {
  localStorage.clear();
  localStorage.setItem('i18nextLng', 'zh');
  document.addEventListener('DOMContentLoaded', () => document.documentElement.setAttribute('data-harmony', ''));
});
const layout = [];
for (const [width, height] of [[844, 390], [1116, 660], [390, 844], [960, 444]]) {
 for (const player of [false, true]) {
  await page.setViewportSize({ width, height });
  await page.goto('http://127.0.0.1:4173/dev-probe.html?probe=bravaisKinds&look=solid&current=none');
  await page.waitForFunction(() => window.__bravaisKindsProbe?.ready());
  if (player) await page.evaluate(async () => {
    const { usePlaybackStore } = await import('/src/stores/usePlaybackStore.ts');
    usePlaybackStore.setState({ currentSong: { id: 1, name: 'Viewport test', artists: [], duration: 200000 } });
  });
  await page.locator('.bravais-tile[data-library-entry] article').first().evaluate(node => node.click());
  await page.waitForFunction(() => !!document.querySelector('[data-bravais-expanded]') && !document.querySelector('[data-bravais-reflowing]'));
  await page.waitForTimeout(650);
  const rect = await page.locator('[data-bravais-expanded]').evaluate(node => {
    const { x, y, width, height } = node.getBoundingClientRect();
    return { x, y, width, height };
  });
  layout.push({ viewport: { width, height }, player, card: rect });
  await page.screenshot({ path: path.join(out, `${phase}-${width}x${height}${player ? '-player' : ''}.png`) });
 }
}
if (process.argv.includes('--layout-only')) {
  fs.writeFileSync(path.join(out, `${phase}.json`), JSON.stringify({phase,layout,errors},null,2));
  console.log(JSON.stringify({phase,layout,errors},null,2));
  await browser.close();
  process.exit(errors.length ? 1 : 0);
}
await page.setViewportSize({ width: 844, height: 390 });
await page.goto('http://127.0.0.1:4173/dev-probe.html?probe=bravaisPerf');
await page.waitForFunction(() => window.__bravaisPerfProbe?.ready());
const performance = await page.evaluate(async () => window.__bravaisPerfProbe.run({
  items: [5000], looks: ['solid', 'partial'], windows: [3], scenarios: ['drift', 'pan', 'tab'],
  visualizer: 'none', repeats: 1, warmupMs: 750, settleMs: 300, seconds: 2.8,
}));
fs.writeFileSync(path.join(out, `${phase}.json`), JSON.stringify({ phase, layout, performance, errors }, null, 2));
console.log(JSON.stringify({ phase, layout, performance: performance.map(({ job, counts, motion, tiles }) => ({ job, counts, motion, tiles })), errors }, null, 2));
await browser.close();
