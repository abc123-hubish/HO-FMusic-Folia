import { test, expect } from './fixtures';
import { setup, requestCount, reply } from './harmonyAiGenerationHarness';

test('AI selection and opening the editor share one model request, then reuse the cache', async ({ page }) => {
    await setup(page);
    await page.getByRole('button', { name: 'Select AI theme', exact: true }).click();
    await expect.poll(() => requestCount(page)).toBe(1);
    await page.getByRole('button', { name: 'Open AI editor', exact: true }).click();
    await expect(page.getByRole('status')).toContainText('Generating an AI theme');
    await expect(page.getByRole('button', { name: 'Save AI Theme', exact: true })).toHaveCount(0);
    expect(await requestCount(page)).toBe(1);
    expect(await page.evaluate(() => JSON.parse((window as any).aiRequests[0].payload.body).model)).toBe('my-model');
    await reply(page);
    await expect(page.locator('.theme-quick-dialog input').first()).toHaveValue('Model theme 1');
    await expect(page.locator('[data-ai-name]')).toHaveAttribute('data-ai-name', 'Model theme 1');
    await page.screenshot({ path: '../../verification/ai-editor-generated.png', fullPage: true });
    await page.getByRole('button', { name: 'Close', exact: true }).click();
    await page.getByRole('button', { name: 'Open AI editor', exact: true }).click();
    await expect(page.locator('.theme-quick-dialog input').first()).toHaveValue('Model theme 1');
    expect(await requestCount(page)).toBe(1);
});

for (const cache of ['cover', 'model']) {
    test(`opening editor with a ${cache} cache`, async ({ page }) => {
        await setup(page, `&cache=${cache}`);
        await page.getByRole('button', { name: 'Open AI editor', exact: true }).click();
        if (cache === 'cover') {
            await expect.poll(() => requestCount(page)).toBe(1);
            await reply(page);
            await expect(page.locator('.theme-quick-dialog input').first()).toHaveValue('Model theme 1');
        } else {
            await expect(page.locator('.theme-quick-dialog input').first()).toHaveValue('Cached dark');
            expect(await requestCount(page)).toBe(0);
        }
    });
}

test('API errors are visible without exposing the key, and retry generates the theme', async ({ page }) => {
    await setup(page);
    await page.getByRole('button', { name: 'Open AI editor', exact: true }).click();
    await expect.poll(() => requestCount(page)).toBe(1);
    await reply(page, 0, 401);
    await expect(page.getByRole('alert')).toContainText('401');
    await expect(page.getByRole('alert')).not.toContainText('draft-key');
    await page.getByRole('button', { name: 'Retry generation' }).click();
    await expect.poll(() => requestCount(page)).toBe(2);
    await reply(page, 1);
    await expect(page.locator('.theme-quick-dialog input').first()).toHaveValue('Model theme 2');
});

test('a response from the previous song cannot replace the current song theme', async ({ page }) => {
    await setup(page);
    await page.getByRole('button', { name: 'Open AI editor', exact: true }).click();
    await expect.poll(() => requestCount(page)).toBe(1);
    await page.evaluate(() => document.querySelector<HTMLButtonElement>('[data-ai-next]')!.click());
    await expect.poll(() => requestCount(page)).toBe(2);
    await reply(page, 1);
    await expect(page.locator('[data-ai-name]')).toHaveAttribute('data-ai-name', 'Model theme 2');
    await reply(page, 0);
    await expect(page.locator('.theme-quick-dialog input').first()).toHaveValue('Model theme 2');
    await page.evaluate(() => document.querySelector<HTMLButtonElement>('[data-ai-default]')!.click());
    await expect(page.locator('[data-ai-mode]')).toHaveAttribute('data-ai-mode', 'default');
});

test('lyrics arriving after the editor opens start generation', async ({ page }) => {
    await setup(page, '&noLyrics=1');
    await page.getByRole('button', { name: 'Open AI editor', exact: true }).click();
    await expect(page.getByRole('alert')).toContainText('Waiting for lyrics');
    expect(await requestCount(page)).toBe(0);
    await page.evaluate(() => document.querySelector<HTMLButtonElement>('[data-ai-lyrics]')!.click());
    await expect.poll(() => requestCount(page)).toBe(1);
    await reply(page);
    await expect(page.locator('.theme-quick-dialog input').first()).toHaveValue('Model theme 1');
});

test('instrumental songs can generate a theme from the title', async ({ page }) => {
    await setup(page, '&noLyrics=1&pure=1');
    await page.getByRole('button', { name: 'Open AI editor', exact: true }).click();
    await expect.poll(() => requestCount(page)).toBe(1);
    expect(await page.evaluate(() => JSON.parse((window as any).aiRequests[0].payload.body).messages[1].content)).toContain('Evening song');
    await reply(page);
    await expect(page.locator('.theme-quick-dialog input').first()).toHaveValue('Model theme 1');
});

test('selecting AI before lyrics load generates once lyrics arrive without opening the editor', async ({ page }) => {
    await setup(page, '&noLyrics=1');
    await page.getByRole('button', { name: 'Select AI theme', exact: true }).click();
    await expect(page.locator('[data-ai-mode]')).toHaveAttribute('data-ai-mode', 'ai');
    await page.getByRole('button', { name: 'Load lyrics', exact: true }).click();
    await expect.poll(() => requestCount(page)).toBe(1);
    await reply(page);
    await expect(page.locator('[data-ai-name]')).toHaveAttribute('data-ai-name', 'Model theme 1');
});

test('switching to default while generation is pending keeps the default theme', async ({ page }) => {
    await setup(page);
    await page.getByRole('button', { name: 'Select AI theme', exact: true }).click();
    await expect.poll(() => requestCount(page)).toBe(1);
    await page.getByRole('button', { name: 'Default theme', exact: true }).click();
    await reply(page);
    // Wait for persistence before checking that the response did not change the selected mode.
    await expect.poll(() => page.evaluate(async () => {
        const cacheModule = '/src/services/themeCache.ts';
        const playbackModule = '/src/stores/usePlaybackStore.ts';
        const { getCachedThemeStateForSong } = await import(cacheModule);
        const { usePlaybackStore } = await import(playbackModule);
        const song = usePlaybackStore.getState().currentSong;
        return song && (await getCachedThemeStateForSong(song)).kind;
    })).toBe('dual');
    await expect(page.locator('[data-ai-mode]')).toHaveAttribute('data-ai-mode', 'default');
    await expect(page.locator('[data-ai-ready]')).not.toHaveAttribute('data-ai-name', 'Model theme 1');
});

test('saving an enabled API configuration starts generation when AI is already selected', async ({ page }) => {
    await setup(page);
    await page.evaluate(() => {
        (window as any).aiConfig.enabled = false;
        window.dispatchEvent(new Event('harmony-ai-config-change'));
    });
    await page.getByRole('button', { name: 'Select AI theme', exact: true }).click();
    expect(await requestCount(page)).toBe(0);
    await page.evaluate(() => {
        (window as any).aiConfig.enabled = true;
        window.dispatchEvent(new Event('harmony-ai-config-change'));
    });
    await expect.poll(() => requestCount(page)).toBe(1);
    await reply(page);
    await expect(page.locator('[data-ai-name]')).toHaveAttribute('data-ai-name', 'Model theme 1');
});
