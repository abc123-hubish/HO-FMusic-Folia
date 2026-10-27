import { test, expect } from './fixtures';

// test/component/vinylDisc.spec.ts
const host = '[data-folium-owner="vinyl-disc"][data-folium-kind="visualizer"]';
const spinning = `${host} [data-vinyl-disc]`;

test('Vinyl Disc enlarges lyrics without changing metadata and fills tall landscape with nine rows', async ({ page, mount }) => {
    await mount('vinylDisc');
    const stage = page.locator(host);
    const active = stage.locator('[data-active] > div').first();
    for (const size of [
        { width: 2232, height: 1320, font: '49px', title: '38px' },
        { width: 1280, height: 800, font: '30px', title: '23px' },
        { width: 844, height: 390, font: '20px', title: '15px' },
        { width: 390, height: 844, font: '24px', title: '24px' },
    ]) {
        await page.setViewportSize({ width: size.width, height: size.height });
        await expect(active).toHaveCSS('font-size', size.font);
        await expect(stage.getByText('Vinyl Test', { exact: true }).first()).toHaveCSS('font-size', size.title);
    }
    await page.getByRole('button', { name: 'Long song', exact: true }).click();
    for (const [width, height, count] of [[2232, 1320, 9], [1280, 800, 9], [844, 390, 7], [390, 844, 7]]) {
        await page.setViewportSize({ width, height });
        const rows = stage.locator('[data-active]').locator('..').locator(':scope > div');
        await expect(rows).toHaveCount(count);
        const rect = await active.boundingBox();
        expect(rect!.y).toBeGreaterThanOrEqual(0);
        expect(rect!.y + rect!.height).toBeLessThanOrEqual(height);
        if (width >= height && height >= 600) {
            const block = await stage.locator('[data-active]').locator('../..').boundingBox();
            expect(block!.y).toBeLessThan(height * 0.23);
            expect(block!.y + block!.height).toBeGreaterThan(height * 0.77);
        }
        await stage.screenshot({ path: `../../verification/vinyl-disc-typography-20261027/${width}.png` });
    }
    await page.getByRole('button', { name: 'Settings', exact: true }).click();
    const scale = page.locator('[data-folium-kind="visualizer-settings"] input[type=range]').last();
    await scale.fill('1.5');
    await expect(active).toHaveCSS('font-size', '29px');
});

test('Vinyl Disc renders original scene, timed lyrics, cover and responsive dimensions', async ({ page, mount }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await mount('vinylDisc');
    const stage = page.locator(host);
    await expect(stage.locator('[data-active]')).toContainText('If you miss the train');
    await expect(stage.locator('[data-active]')).toContainText('如果错过那班列车');
    await expect(page.locator(spinning)).toHaveCSS('animation-play-state', 'running');
    await expect(stage.locator('img')).toBeVisible();
    for (const size of [{ width: 1280, height: 800 }, { width: 390, height: 844 }, { width: 844, height: 390 }]) {
        await page.setViewportSize(size);
        await page.waitForTimeout(250);
        const rect = await page.locator(spinning).boundingBox();
        expect(rect!.width).toBeGreaterThan(64);
        expect(Math.abs(rect!.width - rect!.height)).toBeLessThan(1);
        expect(rect!.x).toBeGreaterThanOrEqual(0);
        expect(rect!.x + rect!.width).toBeLessThanOrEqual(size.width);
        await stage.screenshot({ path: `../../verification/vinyl-disc-20261027/${size.width}.png` });
    }
    await page.getByRole('button', { name: 'Karaoke', exact: true }).click();
    const spans = stage.locator('[data-active] span');
    await expect(spans.first()).toHaveCSS('--wp', '100.0%');
    await expect(spans.nth(1)).toHaveCSS('--wp', '50.0%');
    await page.getByRole('button', { name: 'Gap', exact: true }).click();
    await expect(stage.locator('[data-active]')).toContainText('If you miss the train');
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expect(stage.locator('[data-active]')).toHaveText('把回忆拼好给你');
    await expect(stage.locator('[data-active]')).toHaveClass('vinyl-line-in');
    await page.getByRole('button', { name: 'Cover', exact: true }).click();
    await expect(stage.locator('img')).toBeHidden();
    await expect(stage).toContainText('Vinyl Test');
    await page.getByRole('button', { name: 'Theme', exact: true }).click();
    await expect(stage.locator('[data-active] > div').first()).toHaveCSS('font-weight', '500');
    expect(errors).toEqual([]);
});

test('Vinyl Disc pauses, sleeps, cleans up and persists schema settings', async ({ page, mount }) => {
    await mount('vinylDisc');
    await expect(page.locator(spinning)).toHaveCSS('animation-play-state', 'running');
    for (const [stop, resume] of [['Pause', 'Resume'], ['Background', 'Foreground'], ['Static', 'Animate']]) {
        await page.getByRole('button', { name: stop, exact: true }).click();
        await expect(page.locator(spinning)).toHaveCSS('animation-play-state', 'paused');
        await page.getByRole('button', { name: resume, exact: true }).click();
        await expect(page.locator(spinning)).toHaveCSS('animation-play-state', 'running');
    }
    await page.getByRole('button', { name: 'Settings', exact: true }).click();
    const panel = page.locator('[data-folium-kind="visualizer-settings"]');
    await expect(panel.locator('input[type=range]')).toHaveCount(4);
    await panel.locator('select').first().selectOption('left');
    await panel.locator('input[type=range]').nth(1).fill('12');
    await expect(page.locator(spinning)).toHaveCSS('animation-duration', '12s');
    await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('folia_folium_params_v1') || '{}')['visualizer:vinyl-disc:disc']))
        .toMatchObject({ discSide: 'left', spinSeconds: 12 });
    await page.getByRole('button', { name: 'Switch mode', exact: true }).click();
    await expect(page.locator(host)).toHaveCount(0);
    await page.getByRole('button', { name: 'Switch mode', exact: true }).click();
    await expect(page.locator(spinning)).toHaveCSS('animation-duration', '12s');
    await panel.getByRole('button', { name: 'Reset to defaults', exact: true }).click();
    await expect(page.locator(spinning)).toHaveCSS('animation-duration', '20s');
});
