import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '../upstream/folia-major/node_modules/playwright-core/index.mjs';

// Count avoided work at identical geometry using the real stage, not a device FPS benchmark.
const phase = process.argv[2] ?? 'after';
const root = path.resolve('upstream/folia-major/src/library/suites/bravais');
const evidence = path.resolve('verification/bravais-page-20261013');
const files = ['BravaisTile.tsx', 'BravaisWall.tsx', 'useBravaisFrame.ts', 'useBravaisReflowDriver.ts'];
const saved = new Map();
let browser;
let page;
try {
  if (phase === 'before') {
    for (const file of files) {
      saved.set(file, fs.readFileSync(path.join(root, file)));
      fs.copyFileSync(path.join(evidence, 'before', file), path.join(root, file));
    }
  }
  browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  page = await browser.newPage({ viewport: { width: 844, height: 390 }, serviceWorkers: 'block' });
  const errors = [];
  page.on('pageerror', e => {errors.push(e.message); console.error('PAGE ERROR', e.message);});
  await page.addInitScript(() => {
    localStorage.clear();
    document.addEventListener('DOMContentLoaded', () => document.documentElement.setAttribute('data-harmony', ''));
  });
  await page.goto('http://127.0.0.1:4173/dev-probe.html?probe=bravaisKinds&current=none&look=partial');
  await page.waitForFunction(() => window.__bravaisKindsProbe?.ready());
  await page.waitForTimeout(1000);
  const transformed = await page.evaluate(async () => (await fetch('/src/library/suites/bravais/useBravaisReflowDriver.ts')).text());
  if (transformed.includes('tileNodesRef') !== (phase !== 'before')) throw new Error('Vite is serving a stale performance module');
  const pan = await page.evaluate(async () => {
    const seamStyle = document.querySelector('[data-bravais-seam]').style;
    const contentStyle = document.querySelector('.bravais-seam-content').style;
    const writes = { seamWidth: 0, contentOpacity: 0 };
    for (const [property, style, key] of [['width', seamStyle, 'seamWidth'], ['opacity', contentStyle, 'contentOpacity']]) {
      const descriptor = Object.getOwnPropertyDescriptor(CSSStyleDeclaration.prototype, property);
      Object.defineProperty(CSSStyleDeclaration.prototype, property, { ...descriptor, set(value) {
        if (this === style) writes[key] += 1;
        descriptor.set.call(this, value);
      } });
    }
    const field = document.querySelector('.bravais-field');
    for (let i = 0; i < 120; i++) {
      field.dispatchEvent(new WheelEvent('wheel', { deltaY: i < 60 ? 1 : -1, bubbles: true, cancelable: true }));
      await new Promise(requestAnimationFrame);
    }
    return writes;
  });
  await page.waitForTimeout(400);
  const targetSlot = await page.locator('.bravais-tile[data-library-entry]').evaluateAll(nodes => {
    const seam = document.querySelector('[data-bravais-seam]').getBoundingClientRect();
    return nodes.map(node => ({node, rect:node.getBoundingClientRect()})).find(({rect}) => {
      const x=rect.x+rect.width/2, y=rect.y+rect.height/2;
      return x>32 && x<innerWidth-32 && y>32 && y<innerHeight-32 && (x<seam.left || x>seam.right);
    })?.node.dataset.bravaisSlot;
  });
  if (!targetSlot) throw new Error('No visible track target');
  await page.evaluate(() => {
    window.__workQueries = { tile: 0, plate: 0 };
    const original = Element.prototype.querySelector;
    Element.prototype.querySelector = function(selector) {
      if (selector.startsWith('[data-bravais-slot=')) window.__workQueries.tile++;
      if (selector.startsWith('[data-bravais-plate-block=')) window.__workQueries.plate++;
      return original.call(this, selector);
    };
  });
  await page.locator(`[data-bravais-slot="${targetSlot}"] article`).click({force:true});
  await page.waitForFunction(() => !!document.querySelector('[data-bravais-expanded]') && !document.querySelector('[data-bravais-reflowing]'));
  await page.waitForTimeout(650);
  const expansionQueries = await page.evaluate(() => window.__workQueries);
  await page.goto('http://127.0.0.1:4173/dev-probe.html?probe=bravaisKinds&current=none&look=solid');
  await page.waitForFunction(() => window.__bravaisKindsProbe?.ready());
  await page.waitForTimeout(1000);
  const songChange = await page.evaluate(async () => {
    const { useBravaisStageStore } = await import('/src/library/suites/bravais/bravaisStageStore.ts');
    const { home } = useBravaisStageStore.getState();
    window.__renderCounts = {};
    const nowPlayingKey = home.layer.items.find(item => item.kind === 'track').key;
    useBravaisStageStore.setState({ home: { ...home, layer: { ...home.layer, nowPlayingKey } } });
    await new Promise(resolve => setTimeout(resolve, 200));
    return { tiles: document.querySelectorAll('.bravais-tile').length,
      currentTiles: document.querySelectorAll('[data-bravais-current]').length,
      renders: window.__renderCounts.BravaisTile ?? 0 };
  });
  const result = { phase, panFrames: 120, pan, expansionQueries, songChange, errors };
  fs.writeFileSync(path.join(evidence, `work-${phase}.json`), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  if (page) {
    console.error(await page.evaluate(()=>({expanded:document.querySelectorAll('[data-bravais-expanded]').length,
      reflowing:document.querySelectorAll('[data-bravais-reflowing]').length, queries:window.__workQueries,
      tiles:document.querySelectorAll('.bravais-tile[data-library-entry]').length})));
    await page.screenshot({path:path.join(evidence, `work-${phase}-failure.png`)});
  }
  throw error;
} finally {
  await browser?.close();
  for (const [file, bytes] of saved) fs.writeFileSync(path.join(root, file), bytes);
}
