import { test, expect } from './fixtures';

// test/component/visualizerPerformance.spec.ts
// Count real Canvas/WebGL submissions, rather than assuming a frozen clock stops rendering.
for (const mode of ['cadenza', 'pendolo', 'monet', 'diorama', 'claddagh']) {
    test(`${mode} sleeps after pause and redraws after seek/resume/background`, async ({ page, mount }) => {
        const errors: string[] = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.addInitScript(() => {
            const state = { draws: 0 };
            Object.assign(window, { __performanceDraws: state });
            const intercept = (prototype: object, key: string) => {
                const target = prototype as Record<string, (...args: unknown[]) => unknown>;
                const original = target[key];
                if (!original) return;
                target[key] = function (...args: unknown[]) { state.draws += 1; return original.apply(this, args); };
            };
            document.addEventListener('DOMContentLoaded', () => {
                new MutationObserver(mutations => {
                    state.draws += mutations.filter(mutation => mutation.attributeName === 'style'
                        && mutation.target instanceof Element && mutation.target.closest('[data-performance-mode]')).length;
                }).observe(document.documentElement, { attributes: true, subtree: true, attributeFilter: ['style'] });
            });
            intercept(CanvasRenderingContext2D.prototype, 'clearRect');
            for (const prototype of [WebGLRenderingContext.prototype, WebGL2RenderingContext.prototype]) {
                for (const name of ['drawArrays', 'drawElements', 'drawArraysInstanced', 'drawElementsInstanced']) intercept(prototype, name);
            }
        });
        await mount('visualizerPerformance');
        await page.getByRole('button', { name: mode, exact: true }).click();
        await expect(page.locator('[data-performance-mode]')).toHaveAttribute('data-performance-mode', mode);
        const draws = () => page.evaluate(() => (window as unknown as { __performanceDraws: { draws: number } }).__performanceDraws.draws);
        await expect.poll(draws).toBeGreaterThan(0);
        if (mode === 'monet') await expect(page.locator('[data-monet-header]')).toHaveCSS('opacity', '1');
        await page.getByRole('button', { name: 'Pause', exact: true }).click();
        // Mirror the longest preserved camera flight, then verify a real idle interval.
        await page.waitForTimeout(mode === 'diorama' ? 4300 : mode === 'monet' ? 2800 : 1800);
        const paused = await draws();
        const phase = () => page.locator('[data-monet-particle="0"]').evaluate(node => Number(node.getAnimations()[0]?.currentTime ?? -1));
        const pausedPhase = mode === 'monet' ? await phase() : 0;
        await page.waitForTimeout(250);
        expect(await draws()).toBe(paused);
        if (mode === 'monet') expect(await phase()).toBe(pausedPhase);
        await page.getByRole('button', { name: 'Seek', exact: true }).click();
        if (mode !== 'claddagh') await expect.poll(draws).toBeGreaterThan(paused);
        await page.getByRole('button', { name: 'Resume', exact: true }).click();
        if (mode === 'monet') await expect.poll(phase).toBeGreaterThan(pausedPhase);
        const resumed = await draws();
        if (mode !== 'claddagh') await expect.poll(draws).toBeGreaterThan(resumed);
        await page.getByRole('button', { name: 'Background', exact: true }).click();
        await page.waitForTimeout(500);
        const hidden = await draws(); await page.waitForTimeout(250);
        expect(await draws()).toBe(hidden);
        await page.getByRole('button', { name: 'Foreground', exact: true }).click();
        if (mode !== 'claddagh') await expect.poll(draws).toBeGreaterThan(hidden);
        if (mode === 'monet') {
            await expect(page.locator('[data-monet-header]')).toHaveCSS('opacity', '1');
            await expect(page.locator('[data-monet-rail-slot]')).toHaveCSS('opacity', '1');
        }
        await page.screenshot({ path: `../../verification/visualizer-performance-20261024/${mode}.png` });
        expect(errors).toEqual([]);
    });
}
