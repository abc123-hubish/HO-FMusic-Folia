import { expect, test } from './fixtures';

// test/component/playerBackgroundReuse.spec.ts
// Background memoization must skip lyric/chrome work and still deliver real visual changes.
test('lyric changes leave the shared background alone and visual changes reach it', async ({ page }) => {
    await page.goto('/dev-probe.html?probe=playerBackgroundReuse');
    const output = page.locator('[data-background-count]');
    await expect(output).toHaveAttribute('data-color', '#abcdef');
    const initial = await output.getAttribute('data-background-count');
    for (let i = 0; i < 6; i += 1) await page.getByRole('button', { name: 'next line', exact: true }).click();
    await expect(page.locator('[data-current-line]')).toHaveAttribute('data-current-line', '6');
    await expect(output).toHaveAttribute('data-background-count', initial!);
    await page.getByRole('button', { name: 'theme', exact: true }).click();
    await expect(output).toHaveAttribute('data-color', '#123456');
    await page.getByRole('button', { name: 'pause', exact: true }).click();
    await expect(output).toHaveAttribute('data-paused', 'true');
    await page.getByRole('button', { name: 'setting', exact: true }).click();
    await expect(output).toHaveAttribute('data-opacity', '0.5');
    await page.getByRole('button', { name: 'fume', exact: true }).click();
    await expect(page.locator('canvas')).toBeAttached();
    // Fume adds its own background override, which must also retain its identity across lines.
    const fumeInitial = await output.getAttribute('data-background-count');
    for (let i = 0; i < 6; i += 1) await page.getByRole('button', { name: 'next line', exact: true }).click();
    await expect(output).toHaveAttribute('data-background-count', fumeInitial!);
});
