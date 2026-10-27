import type { Page } from '@playwright/test';
import { expect, test } from './fixtures';

// test/component/visPlaygroundHarmony.spec.ts
async function expectEditorFits(page: Page) {
    await expect.poll(() => page.locator('[data-ponder="vis-playground"]').evaluate(editor => {
        const frame = editor.getBoundingClientRect();
        return ['.vis-playground-preview', '.vis-playground-settings', '.vis-playground-tabs',
            '.vis-playground-settings-scroll'].filter(selector => {
            const node = editor.querySelector<HTMLElement>(selector)!;
            const rect = node.getBoundingClientRect();
            return rect.width < 80 || rect.height < 30 || rect.left < frame.left || rect.top < frame.top
                || rect.right > frame.right + 1 || rect.bottom > frame.bottom + 1
                || node.scrollWidth > node.clientWidth + 1;
        });
    })).toEqual([]);
}

for (const [width, height] of [[844, 390], [960, 444], [1116, 660], [390, 844], [320, 568], [1440, 900]]) {
    test(`lyric style preview and all settings fit ${width}x${height}`, async ({ page, mount }) => {
        await page.setViewportSize({ width, height });
        await page.addInitScript(() => {
            localStorage.setItem('folia_app_language', 'zh-CN');
            document.addEventListener('DOMContentLoaded', () => {
                document.documentElement.setAttribute('data-harmony', 'true');
            });
        });
        await mount('visPlaygroundHarmony');
        await expectEditorFits(page);
        const tabs = page.locator('.vis-playground-tabs button');
        for (let index = 0; index < 4; index++) {
            await tabs.nth(index).click();
            await expectEditorFits(page);
            const scroll = page.locator('.vis-playground-settings-scroll');
            await scroll.evaluate(node => { node.scrollTop = node.scrollHeight; });
            await expect.poll(() => scroll.evaluate(node =>
                Math.abs(node.scrollHeight - node.clientHeight - node.scrollTop))).toBeLessThanOrEqual(1);
        }
        await tabs.first().click();
        await expect(tabs.first()).toHaveCSS('border-color', 'rgb(244, 244, 245)');
        await page.locator('.vis-playground-settings-scroll').evaluate(node => { node.scrollTop = 0; });
        await page.screenshot({ path: `../../verification/lyrics-style-layout/${width}x${height}.png` });
        await page.locator('.vis-playground-header button').click();
        await expect(page.locator('[data-ponder="vis-playground"]')).toHaveCount(0);
    });
}

test('lyric style settings remain reachable after rotation', async ({ page, mount }) => {
    await page.setViewportSize({ width: 844, height: 390 });
    await page.addInitScript(() => document.addEventListener('DOMContentLoaded', () => {
        document.documentElement.setAttribute('data-harmony', 'true');
    }));
    await mount('visPlaygroundHarmony');
    await expectEditorFits(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await expectEditorFits(page);
    await page.setViewportSize({ width: 844, height: 390 });
    await expectEditorFits(page);
});
