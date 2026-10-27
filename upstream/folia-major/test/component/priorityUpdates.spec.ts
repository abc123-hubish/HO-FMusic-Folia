import { test, expect } from '@playwright/test';
import type {} from '../../dev/probes/priorityUpdates.probe';

// test/component/priorityUpdates.spec.ts
// Verify actual DOM writes and all four affected renderers with the production Tailwind/Framer graph.
for (const width of [390, 1100]) test(`original continuous progress, seeking and resize at ${width}px`, async ({ page }) => {
    const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/dev-probe.html?probe=priorityUpdates');
    await page.waitForFunction(() => window.__priorityUpdates?.ready);
    const fill = page.locator('[data-folium-part="progress.fill"]');
    await expect(fill).not.toHaveCSS('clip-path', 'inset(0px 100% 0px 0px round 999px)');
    const measured = await fill.evaluate(async node => {
        await new Promise(requestAnimationFrame);
        await new Promise(requestAnimationFrame);
        let writes = 0;
        const observer = new MutationObserver(records => { writes += records.length; });
        observer.observe(node, { attributes: true, attributeFilter: ['style'] });
        for (let i = 1; i <= 120; i++) window.__priorityUpdates.time(100 + i / 120);
        await Promise.resolve(); observer.disconnect();
        const hidden = Number(node.style.clipPath.match(/inset\(0(?:px)? ([\d.]+)%/)?.[1]);
        const deviceWidth = node.getBoundingClientRect().width * devicePixelRatio;
        return { writes, errorPixels: Math.abs((1 - hidden / 100) - 101 / 240) * deviceWidth };
    });
    expect(measured.writes).toBe(120);
    expect(measured.errorPixels).toBeLessThanOrEqual(0.005);
    const oldClip = await fill.evaluate(node => node.style.clipPath);
    const input = page.locator('[data-testid="priority-progress"] input[type="range"]');
    await page.evaluate(() => window.__priorityUpdates.duration(0));
    await expect(input).toHaveAttribute('max', '100');
    expect(await fill.evaluate(node => node.style.clipPath)).toBe(oldClip);
    await page.evaluate(() => { window.__priorityUpdates.duration(240); window.__priorityUpdates.time(120); });
    await expect.poll(() => fill.evaluate(node => node.style.clipPath)).toContain('50%');
    await input.focus(); await input.press('ArrowRight');
    await expect.poll(() => page.evaluate(() => window.__priorityUpdates.lastSeek())).toBeGreaterThan(120);
    const box = await input.boundingBox(); expect(box).not.toBeNull();
    await page.mouse.move(box!.x + box!.width * 0.25, box!.y + box!.height / 2);
    await page.mouse.down(); await page.mouse.move(box!.x + box!.width * 0.75, box!.y + box!.height / 2); await page.mouse.up();
    await expect.poll(() => page.evaluate(() => window.__priorityUpdates.lastSeek())).toBeGreaterThan(160);
    await page.setViewportSize({ width: width === 390 ? 844 : 900, height: 600 });
    await page.evaluate(() => window.__priorityUpdates.time(180));
    await expect.poll(() => fill.evaluate(node => {
        const hidden = Number(node.style.clipPath.match(/inset\(0(?:px)? ([\d.]+)%/)?.[1]);
        return Math.abs(hidden - 25) / 100 * node.getBoundingClientRect().width * devicePixelRatio;
    })).toBeLessThanOrEqual(0.005);
    await test.info().attach('continuous-progress-write-count', { body: JSON.stringify(measured), contentType: 'application/json' });
    expect(errors).toEqual([]);
});

for (const mode of ['classic', 'partita', 'cadenza', 'monet']) test(`${mode} renders the optimized glow`, async ({ page }) => {
    const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
    await page.setViewportSize({ width: 844, height: 600 });
    await page.goto('/dev-probe.html?probe=priorityUpdates');
    await page.getByRole('button', { name: mode, exact: true }).click();
    const visual = page.getByTestId('priority-visual');
    await expect(visual).toHaveAttribute('data-mode', mode);
    await expect.poll(() => visual.locator('canvas, [style*="text-shadow"]').count()).toBeGreaterThan(0);
    const shadows = await visual.evaluate(async node => {
        const halos = [...node.querySelectorAll<HTMLElement>('[style]')].filter(el => el.style.textShadow && el.style.textShadow !== 'none');
        const before = halos.map(el => el.style.textShadow);
        for (let i = 0; i < 20; i++) {
            window.__priorityUpdates.visualTime(0.5 + i / 40);
            await new Promise(requestAnimationFrame);
        }
        return { count: halos.length, fixed: halos.every((el, i) => el.style.textShadow === before[i]) };
    });
    if (mode !== 'cadenza') { expect(shadows.count).toBeGreaterThan(0); expect(shadows.fixed).toBe(true); }
    await test.info().attach(`${mode}-render`, { body: await page.screenshot(), contentType: 'image/png' });
    expect(errors).toEqual([]);
});
