import { expect, test } from './fixtures';

// test/component/hanabi.spec.ts
// Real WebGL rendering, pause, viewport changes and disposal cannot be verified by scene-unit tests.
for (const paused of [false, true]) {
    test(`Hanabi renders and rotates safely while ${paused ? 'paused' : 'playing'}`, async ({ page }) => {
        const errors: string[] = [];
        page.on('pageerror', error => errors.push(error.message));
        page.on('console', message => {
            if (/destroyed while still bound|Hanabi.*(?:failed|error)|GL_INVALID_OPERATION/i.test(message.text())) errors.push(message.text());
        });
        await page.setViewportSize({ width: 844, height: 390 });
        await page.goto(`/dev-probe.html?probe=visualizerMemory&vis=hanabi&lines=24&cjk=1&speed=1&start=37.5&freeze=${paused ? 1 : 0}`);
        const canvas = page.locator('[data-probe-mode="hanabi"] canvas').first();
        await expect(canvas).toBeVisible({ timeout: 45000 });
        await page.waitForTimeout(1000);
        await page.screenshot({ path: `../../verification/hanabi-qq-20261023/hanabi-landscape-${paused}.png` });
        for (const viewport of [{ width: 390, height: 844 }, { width: 960, height: 540 }]) {
            await page.setViewportSize(viewport);
            await expect.poll(() => canvas.evaluate(node => [node.clientWidth, node.clientHeight])).toEqual([viewport.width, viewport.height]);
            await page.waitForTimeout(500);
        }
        await page.screenshot({ path: `../../verification/hanabi-qq-20261023/hanabi-final-${paused}.png` });
        await page.evaluate(() => window.unmount());
        expect(errors).toEqual([]);
    });
}

test('Hanabi can be selected and its quality saved in the real Harmony lyric editor', async ({ page, mount }) => {
    await page.setViewportSize({ width: 844, height: 390 });
    await page.addInitScript(() => {
        localStorage.setItem('folia_app_language', 'zh-CN');
        document.addEventListener('DOMContentLoaded', () => document.documentElement.setAttribute('data-harmony', 'true'));
    });
    await mount('visPlaygroundHarmony');
    await page.getByRole('button', { name: '花火', exact: true }).click();
    await expect(page.getByText('花火参数', { exact: true })).toBeVisible();
    const quality = page.getByRole('button', { name: '省电', exact: true });
    await quality.click();
    await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('hanabi_tuning') || '{}').renderQuality)).toBe('low');
    expect(await page.evaluate(() => localStorage.getItem('visualizer_mode'))).toBe('hanabi');
    await expect(page.locator('[data-visualizer-hanabi] canvas')).toBeVisible({ timeout: 45000 });
    await page.locator('.vis-playground-settings-scroll').evaluate(node => { node.scrollTop = 0; });
    await page.screenshot({ path: '../../verification/hanabi-qq-20261023/hanabi-settings.png' });
});
