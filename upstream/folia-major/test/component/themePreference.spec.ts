import { test, expect } from '@playwright/test';

// test/component/themePreference.spec.ts
// Keep localStorage across reloads, as a user reopening the application would.

for (const cache of ['song', 'last', 'none']) {
    test(`keeps both default and AI selections after reopening with ${cache} cache`, async ({ page }) => {
        await page.addInitScript(() => {
            if (sessionStorage.getItem('theme-test-seeded')) return;
            localStorage.clear();
            localStorage.setItem('i18nextLng', 'en');
            sessionStorage.setItem('theme-test-seeded', 'true');
        });
        await page.goto(`/dev-probe.html?probe=themePreference&cache=${cache}`);
        const state = page.locator('[data-theme-mode]');
        await expect(state).toHaveAttribute('data-theme-ready', 'true');
        await expect(state).toHaveAttribute('data-theme-mode', 'default');
        await page.getByRole('button', { name: 'AI', exact: true }).click();
        expect(await page.evaluate(() => localStorage.getItem('last_applied_theme_pointer'))).toBe('ai');
        await page.reload();
        await expect(state).toHaveAttribute('data-theme-ready', 'true');
        await expect(state).toHaveAttribute('data-theme-mode', 'ai');
        if (cache !== 'none') await expect(state).toHaveAttribute('data-theme-name', 'Saved AI dark');
        await page.getByRole('button', { name: 'Default', exact: true }).click();
        expect(await page.evaluate(() => localStorage.getItem('last_applied_theme_pointer'))).toBe('default');
        await page.reload();
        await expect(state).toHaveAttribute('data-theme-ready', 'true');
        await expect(state).toHaveAttribute('data-theme-mode', 'default');
    });
}

test('keeps AI selected without a cached theme when automatic switching is disabled', async ({ page }) => {
    await page.addInitScript(() => {
        localStorage.setItem('last_applied_theme_pointer', 'ai');
        localStorage.setItem('theme_auto_switch_enabled', 'false');
    });
    await page.goto('/dev-probe.html?probe=themePreference');
    await expect(page.locator('[data-theme-mode]')).toHaveAttribute('data-theme-ready', 'true');
    await expect(page.locator('[data-theme-mode]')).toHaveAttribute('data-theme-mode', 'ai');
});

test('keeps an explicit default selection ahead of the custom-theme preference', async ({ page }) => {
    await page.addInitScript(() => {
        if (sessionStorage.getItem('theme-test-seeded')) return;
        localStorage.setItem('last_applied_theme_pointer', 'default');
        localStorage.setItem('custom_theme_preferred', 'true');
        sessionStorage.setItem('theme-test-seeded', 'true');
    });
    await page.goto('/dev-probe.html?probe=themePreference&cache=song');
    const state = page.locator('[data-theme-mode]');
    await expect(state).toHaveAttribute('data-theme-ready', 'true');
    await expect(state).toHaveAttribute('data-theme-mode', 'default');
    await page.getByRole('button', { name: 'Custom', exact: true }).click();
    await page.reload();
    await expect(state).toHaveAttribute('data-theme-ready', 'true');
    await expect(state).toHaveAttribute('data-theme-mode', 'custom');
});

test('automatic theme generation cannot replace the selected default mode', async ({ page }) => {
    await page.goto('/dev-probe.html?probe=themePreference');
    const state = page.locator('[data-theme-mode]');
    await expect(state).toHaveAttribute('data-theme-ready', 'true');
    await page.getByRole('button', { name: 'Generate automatic cover theme' }).click();
    await expect(state).toHaveAttribute('data-theme-generated', 'true');
    await expect(state).toHaveAttribute('data-theme-mode', 'default');
    expect(await page.evaluate(() => localStorage.getItem('last_applied_theme_pointer'))).not.toBe('ai');
});
