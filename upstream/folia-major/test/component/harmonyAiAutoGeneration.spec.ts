import { test, expect } from './fixtures';
import { setup, requestCount, reply } from './harmonyAiGenerationHarness';
import type { Page } from '@playwright/test';

const toggle = (page: Page) => page.getByRole('switch', { name: 'Auto-generate AI themes' });
async function firstTheme(page: Page) {
    await setup(page);
    await page.getByRole('button', { name: 'AI Theme', exact: true }).click();
    await expect(toggle(page)).toHaveAttribute('aria-checked', 'true');
    await expect.poll(() => requestCount(page)).toBe(1);
    await reply(page);
    await expect(page.locator('[data-ai-ready]')).toHaveAttribute('data-ai-name', 'Model theme 1');
}

test('song changes generate automatically without opening the player editor, then reuse saved results', async ({ page }) => {
    await firstTheme(page);
    await page.getByRole('button', { name: 'Next song', exact: true }).click();
    await expect.poll(() => requestCount(page)).toBe(2);
    expect(await page.evaluate(() => JSON.parse((window as any).aiRequests[1].payload.body).messages[1].content)).toContain('Second song lyrics');
    await reply(page, 1);
    await expect(page.locator('[data-ai-ready]')).toHaveAttribute('data-ai-name', 'Model theme 2');
    await page.getByRole('button', { name: 'First song', exact: true }).click();
    await expect(page.locator('[data-ai-ready]')).toHaveAttribute('data-ai-name', 'Model theme 1');
    expect(await requestCount(page)).toBe(2);
    await page.screenshot({ path: '../../verification/ai-auto-generation-on.png', fullPage: true });
});

test('off stops generation on song changes and editor opening, and survives selecting AI again', async ({ page }) => {
    await firstTheme(page);
    await toggle(page).click();
    await expect(toggle(page)).toHaveAttribute('aria-checked', 'false');
    expect(await page.evaluate(() => localStorage.getItem('theme_auto_generate_enabled'))).toBe('false');
    await page.getByRole('button', { name: 'Next song', exact: true }).click();
    await page.waitForTimeout(850); // Beyond the 650 ms song-change delay: absence of a request is the assertion.
    expect(await requestCount(page)).toBe(1);
    await page.getByRole('button', { name: 'Open AI editor', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Save AI Theme', exact: true })).toBeVisible();
    expect(await requestCount(page)).toBe(1);
    await page.getByRole('button', { name: 'Close', exact: true }).click();
    await page.getByRole('button', { name: 'Default theme', exact: true }).click();
    await page.getByRole('button', { name: 'AI Theme', exact: true }).click();
    await expect(toggle(page)).toHaveAttribute('aria-checked', 'false');
    await page.waitForTimeout(850);
    expect(await requestCount(page)).toBe(1);
    await page.screenshot({ path: '../../verification/ai-auto-generation-off.png', fullPage: true });
});

test('a disabled preference survives restarting the view', async ({ page }) => {
    await firstTheme(page);
    await toggle(page).click();
    const persisted = await page.evaluate(() => ({ enabled: localStorage.getItem('theme_auto_generate_enabled'),
        choice: localStorage.getItem('theme_auto_generate_choice') }));
    // The fixture intentionally clears storage on navigation. Restore only the values actually
    // written by the toggle before recreating the real controller and native bridge.
    await page.addInitScript(saved => {
        localStorage.setItem('theme_auto_generate_enabled', saved.enabled!);
        localStorage.setItem('theme_auto_generate_choice', saved.choice!);
    }, persisted);
    await page.reload();
    await expect(page.locator('[data-ai-ready]')).toHaveAttribute('data-ai-ready', 'true');
    await page.getByRole('button', { name: 'AI Theme', exact: true }).click();
    await expect(toggle(page)).toHaveAttribute('aria-checked', 'false');
    await page.getByRole('button', { name: 'Next song', exact: true }).click();
    await page.waitForTimeout(850);
    expect(await requestCount(page)).toBe(0);
});

test('turning off during automatic generation prevents applying the result, then turning on resumes', async ({ page }) => {
    await firstTheme(page);
    await page.getByRole('button', { name: 'Next song', exact: true }).click();
    await expect.poll(() => requestCount(page)).toBe(2);
    await toggle(page).click();
    await reply(page, 1);
    await page.getByRole('button', { name: 'Third song', exact: true }).click();
    await page.waitForTimeout(850);
    expect(await requestCount(page)).toBe(2);
    await expect(page.locator('[data-ai-ready]')).toHaveAttribute('data-ai-name', 'Model theme 1');
    await toggle(page).click();
    await expect.poll(() => requestCount(page)).toBe(3);
    await reply(page, 2);
    await expect(page.locator('[data-ai-ready]')).toHaveAttribute('data-ai-name', 'Model theme 3');
});

test('song changes wait for lyrics and rapid skips generate only the final song', async ({ page }) => {
    await firstTheme(page);
    await page.getByRole('button', { name: 'Next song without lyrics', exact: true }).click();
    await page.waitForTimeout(850);
    expect(await requestCount(page)).toBe(1);
    await page.getByRole('button', { name: 'Load lyrics', exact: true }).click();
    await page.getByRole('button', { name: 'Third song', exact: true }).click();
    await expect.poll(() => requestCount(page)).toBe(2);
    expect(await page.evaluate(() => JSON.parse((window as any).aiRequests[1].payload.body).messages[1].content)).toContain('Third song');
    await reply(page, 1);
    await expect(page.locator('[data-ai-ready]')).toHaveAttribute('data-ai-name', 'Model theme 2');
});

test('a cover cache on the next song does not block model generation', async ({ page }) => {
    await firstTheme(page);
    await page.evaluate(async () => {
        const dbModule = '/src/services/db.ts';
        const themeModule = '/src/services/themeSanitizer.ts';
        const keyModule = '/src/utils/appPlaybackGuards.ts';
        const storeModule = '/src/stores/usePlaybackStore.ts';
        const { saveToCache } = await import(dbModule);
        const { FALLBACK_AI_DUAL_THEME } = await import(themeModule);
        const { getPlaybackSongKey } = await import(keyModule);
        const { usePlaybackStore } = await import(storeModule);
        await saveToCache(`dual_theme_${getPlaybackSongKey({ ...usePlaybackStore.getState().currentSong, id: 'ai-editor-two' })}`, {
            light: { ...FALLBACK_AI_DUAL_THEME.light, provider: 'Built-in' }, dark: { ...FALLBACK_AI_DUAL_THEME.dark, provider: 'Built-in' },
        });
    });
    await page.getByRole('button', { name: 'Next song', exact: true }).click();
    await expect.poll(() => requestCount(page)).toBe(2);
    await reply(page, 1);
    await expect(page.locator('[data-ai-ready]')).toHaveAttribute('data-ai-name', 'Model theme 2');
});
