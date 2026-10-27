import { readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import type { Page } from '@playwright/test';
import { expect, test } from './fixtures';

// test/component/customLyricsFontImport.spec.ts
// Use a valid font bundled with the locked test dependency, without distributing a system font.
const require = createRequire(import.meta.url);
const fontDirectory = path.join(path.dirname(require.resolve('playwright-core/package.json')), 'lib/vite/traceViewer');
const fontBytes = readFileSync(path.join(fontDirectory, readdirSync(fontDirectory).find(name => name.endsWith('.ttf'))!));
const downloadedFont = { name: 'Downloaded Font.ttf', mimeType: 'font/ttf', buffer: fontBytes };

async function openFontPicker(page: Page) {
    await page.locator('.vis-playground-tabs button').first().click();
    await page.locator('.vis-playground-settings').getByRole('button', { name: '自定义字体', exact: true }).click();
    const picker = page.locator('[data-lyrics-font-picker]');
    await expect(picker).toBeVisible();
    return picker;
}

async function importFont(page: Page) {
    const chooser = page.waitForEvent('filechooser');
    await page.locator('[data-lyrics-font-picker]').getByRole('button', { name: '导入字体', exact: true }).click();
    await (await chooser).setFiles(downloadedFont);
    await expect(page.locator('[data-lyrics-font-picker]')).toHaveCount(0);
    await expect(page.locator('.vis-playground-settings').getByRole('button', { name: 'Downloaded Font', exact: true })).toBeVisible();
    return page.evaluate(() => JSON.parse(localStorage.getItem('lyrics_custom_font')!).family as string);
}

test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
        localStorage.setItem('folia_app_language', 'zh-CN');
        Object.defineProperty(window, 'queryLocalFonts', { value: undefined, configurable: true });
        document.addEventListener('DOMContentLoaded', () => document.documentElement.setAttribute('data-harmony', 'true'));
    });
});

for (const [width, height] of [[844, 390], [390, 844]]) {
    test(`import button opens a font file picker at ${width}x${height}`, async ({ page, mount }) => {
        await page.setViewportSize({ width, height });
        await mount('visPlaygroundHarmony');
        const picker = await openFontPicker(page);
        const button = picker.getByRole('button', { name: '导入字体', exact: true });
        await expect(button).toBeInViewport({ ratio: 1 });
        const pause = (await page.locator('.vis-playground-preview > button').boundingBox())!;
        expect(await picker.evaluate((node, point) => node.contains(document.elementFromPoint(point.x, point.y)),
            { x: pause.x + pause.width / 2, y: pause.y + pause.height / 2 })).toBe(true);
        await page.screenshot({ path: `../../verification/custom-font-import/${width}x${height}.png` });
        const family = await importFont(page);
        await expect(page.locator('.vis-playground-renderer > div').first()).toHaveCSS('font-family', new RegExp(family));
        expect(await page.evaluate(family => Array.from(document.fonts).some(font => font.family === family && font.status === 'loaded'), family)).toBe(true);
    });
}

test('import stays available when system font access is denied', async ({ page, mount }) => {
    await page.addInitScript(() => Object.defineProperty(window, 'queryLocalFonts', {
        value: async () => { throw new Error('System font permission denied'); }, configurable: true,
    }));
    await mount('visPlaygroundHarmony');
    const picker = await openFontPicker(page);
    await expect(picker.getByText('System font permission denied')).toBeVisible();
    await importFont(page);
});

test('invalid imports preserve the selected font and successful imports restore in a fresh page', async ({ page, mount }) => {
    await mount('visPlaygroundHarmony');
    await openFontPicker(page);
    const family = await importFont(page);
    await page.locator('.vis-playground-settings').getByRole('button', { name: 'Downloaded Font', exact: true }).click();
    const picker = page.locator('[data-lyrics-font-picker]');
    await picker.locator('input[type=file]').setInputFiles({ name: 'not-a-font.txt', mimeType: 'text/plain', buffer: Buffer.from('invalid font') });
    await expect(picker.getByRole('alert')).toContainText('woff2');
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('lyrics_custom_font')!).family)).toBe(family);
    await picker.locator('input[type=file]').setInputFiles({ name: 'broken.ttf', mimeType: 'font/ttf', buffer: Buffer.from('broken') });
    await expect(picker.getByRole('button', { name: '导入字体', exact: true })).toBeEnabled();
    await expect(picker.getByRole('alert')).toBeVisible();
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('lyrics_custom_font')!).family)).toBe(family);

    const restoredPage = await page.context().newPage();
    try {
        await restoredPage.goto('http://127.0.0.1:4173/dev-probe.html?probe=visPlaygroundHarmony');
        await expect.poll(() => restoredPage.evaluate(family => Array.from(document.fonts).some(font => font.family === family && font.status === 'loaded'), family)).toBe(true);
        await expect(restoredPage.locator('.vis-playground-renderer > div').first()).toHaveCSS('font-family', new RegExp(family));
    } finally {
        await restoredPage.close();
    }
});
