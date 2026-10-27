import { test, expect } from './fixtures';

// test/component/waveLightPerformance.spec.ts
test('Wave Light updates a bounded active window and releases glyph layers after settling', async ({ page, mount }) => {
    await mount('waveLightPerformance');
    const glyphs = page.locator('[data-wave-light-glyph]');
    await expect(glyphs).toHaveCount(240);
    await page.evaluate(() => {
        for (const animation of document.getAnimations()) animation.finish();
        window.__waveLyricPerf.time(6);
    });
    expect(await page.locator('.wave-light-glyph-live').count()).toBeLessThanOrEqual(15);
    const mutations = await page.evaluate(async () => {
        const changed = new Set<Element>();
        const observer = new MutationObserver(records => {
            for (const record of records) changed.add((record.target as Element).closest('[data-wave-light-glyph]')!);
        });
        observer.observe(document.querySelector('[data-wave-light-line]')!, { attributes: true, subtree: true });
        window.__waveLyricPerf.time(6.01);
        await Promise.resolve();
        observer.disconnect();
        return { count: changed.size, indices: [...changed].map(el => [...document.querySelectorAll('[data-wave-light-glyph]')].indexOf(el)) };
    });
    expect(mutations.count).toBeGreaterThan(0);
    expect(mutations.count).toBeLessThanOrEqual(15);
    expect(mutations.indices.every(i => i >= 106 && i <= 120)).toBe(true);
    await page.evaluate(() => window.__waveLyricPerf.time(2.425));
    await expect(glyphs.nth(48)).toHaveCSS('opacity', '0.71');
    await expect(glyphs.nth(100)).toHaveCSS('opacity', '0.5');
    expect(await page.locator('.wave-light-glyph-live').count()).toBeLessThanOrEqual(15);
    await page.evaluate(() => window.__waveLyricPerf.time(13));
    await expect(page.locator('.wave-light-glyph-live')).toHaveCount(0);
    await expect(glyphs.last()).toHaveCSS('opacity', '0.92');
    await expect(glyphs.last().locator('.wave-light-glyph-ghost')).toHaveCSS('opacity', '0');
    const settled = await page.evaluate(async () => {
        let count = 0;
        const observer = new MutationObserver(records => { count += records.length; });
        observer.observe(document.querySelector('[data-wave-light-line]')!, { attributes: true, subtree: true });
        window.__waveLyricPerf.time(14);
        await Promise.resolve();
        observer.disconnect();
        return count;
    });
    expect(settled).toBe(0);
});
