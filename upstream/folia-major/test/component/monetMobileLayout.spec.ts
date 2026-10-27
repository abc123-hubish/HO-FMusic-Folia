import { expect, test } from './fixtures';

// test/component/monetMobileLayout.spec.ts

for (const viewport of [{ width: 320, height: 568 }, { width: 390, height: 844 }, { width: 430, height: 932 }]) {
    test(`手机 ${viewport.width}px 下长句与译文完整显示，且不与下一句重叠`, async ({ mount, page }) => {
        await page.setViewportSize(viewport);
        await page.addInitScript(() => document.documentElement.setAttribute('data-harmony', ''));
        await mount('monetMobileLayout');
        const subtitle = page.locator('[data-subtitle-track="translation"]');
        await expect(subtitle).toBeVisible();

        for (const variant of ['lrc', 'phrase', 'english', 'graphemes']) {
            await page.locator(`[data-variant="${variant}"]`).click();
            await expect(subtitle).toHaveCount(1);
            for (const largeFont of [false, true]) {
                if (largeFont) await page.locator('[data-large-font]').click();
                await expect.poll(async () => subtitle.evaluate(el => {
                    const active = el.parentElement!;
                    const text = active.firstElementChild as HTMLElement;
                    const content = text.firstElementChild!;
                    const rail = active.parentElement!;
                    const railRect = rail.getBoundingClientRect();
                    const subtitleRect = el.getBoundingClientRect();
                    const contentRect = content.getBoundingClientRect();
                    const next = Array.from(rail.children).find(node => node !== active && (node as HTMLElement).style.zIndex === '2');
                    const fragments = Array.from(content.querySelectorAll(':scope > .relative > span:first-child'));
                    return {
                        mask: getComputedStyle(text).maskImage,
                        completeSubtitle: el.scrollHeight <= el.clientHeight + 1,
                        readableTop: contentRect.top >= railRect.top + railRect.height * 0.11 - 1,
                        readableBottom: subtitleRect.bottom <= railRect.top + railRect.height * 0.88 + 1,
                        translationBelow: subtitleRect.top >= contentRect.bottom - 1,
                        nextBelow: !next || next.getBoundingClientRect().top >= subtitleRect.bottom - 1,
                        fragmentsFit: fragments.length > 1 && fragments.every(node => {
                            const rects = Array.from(node.getClientRects());
                            return rects.length === 1 && rects.every(rect => rect.left >= 0 && rect.right <= innerWidth);
                        }),
                    };
                })).toEqual({ mask: 'none', completeSubtitle: true, readableTop: true, readableBottom: true, translationBelow: true, nextBelow: true, fragmentsFit: true });
                if (largeFont) await page.locator('[data-large-font]').click();
            }
        }
        await page.locator('[data-variant="lrc"]').click();
        await expect(subtitle).toHaveCount(1);
        await page.screenshot({ path: `../../verification/monet-mobile-fixed-${viewport.width}.png` });
    });
}

for (const viewport of [{ width: 744, height: 440 }, { width: 844, height: 390 }, { width: 932, height: 430 }, { width: 640, height: 360 }]) {
    test(`横屏 ${viewport.width}x${viewport.height} 整个莫奈页面在进度条上方完整显示`, async ({ mount, page }) => {
        await page.setViewportSize(viewport);
        await page.addInitScript(() => document.documentElement.setAttribute('data-harmony', ''));
        await mount('monetMobileLayout');
        await page.locator('[data-variant="credits"]').click();
        await page.locator('[data-live-player]').click();
        const stage = page.locator('[data-monet-stage]');

        for (const size of [viewport, { width: viewport.height, height: viewport.width }, viewport]) {
            await page.setViewportSize(size);
            await expect.poll(() => stage.evaluate(el => {
                const stageRect = el.getBoundingClientRect();
                const column = el.querySelector('[data-monet-column]')!;
                const rail = el.querySelector('[data-monet-rail-slot]')!;
                const artist = el.querySelector('[data-monet-artist]')!;
                const header = el.querySelector('[data-monet-header]')!;
                const description = el.querySelector('[data-monet-description]')!;
                const controls = document.querySelector('[data-ponder="player-bar"]');
                const portrait = el.querySelector('[data-monet-portrait]');
                const image = portrait?.querySelector('img');
                const active = Array.from(rail.firstElementChild!.children).find(node => (node as HTMLElement).style.zIndex === '4');
                const railRect = rail.getBoundingClientRect();
                const contentBottom = stageRect.bottom - parseFloat(getComputedStyle(el).paddingBottom);
                const blocks = [artist, header, rail, description];
                return {
                    complete: blocks.every(node => {
                        const rect = node.getBoundingClientRect();
                        return rect.height > 0 && rect.top >= stageRect.top - 1 && rect.bottom <= contentBottom + 1;
                    }),
                    columnFits: column.scrollHeight <= column.clientHeight + 1,
                    railAfterHeader: rail.getBoundingClientRect().top >= header.getBoundingClientRect().bottom - 1,
                    descriptionAfterRail: description.getBoundingClientRect().top >= rail.getBoundingClientRect().bottom - 1,
                    aboveControls: !!controls && description.getBoundingClientRect().bottom <= controls.getBoundingClientRect().top,
                    coverVisible: !!image && image.complete && image.naturalWidth > 0
                        && image.getBoundingClientRect().width >= 60 && image.getBoundingClientRect().height >= 60,
                    coverClearOfText: !!portrait && [artist, header, rail, description].every(node => {
                        const rect = node.getBoundingClientRect();
                        const cover = portrait.getBoundingClientRect();
                        return rect.right <= cover.left + 1 || rect.left >= cover.right - 1
                            || rect.bottom <= cover.top + 1 || rect.top >= cover.bottom - 1;
                    }),
                    activeFits: !!active && active.getBoundingClientRect().top >= railRect.top + railRect.height * 0.11 - 1
                        && active.getBoundingClientRect().bottom <= railRect.top + railRect.height * 0.88 + 1,
                    portraitFits: !!portrait && (
                        portrait.getBoundingClientRect().top >= stageRect.top - 1
                        && portrait.getBoundingClientRect().bottom <= contentBottom + 1
                    ),
                };
            })).toEqual({ complete: true, columnFits: true, railAfterHeader: true, descriptionAfterRail: true, aboveControls: true, coverVisible: true, coverClearOfText: true, activeFits: true, portraitFits: true });
        }
        await expect(page.locator('[data-monet-artist]')).toHaveCSS('transform', 'none');
        await page.screenshot({ path: `../../verification/monet-landscape-fixed-${viewport.width}.png` });
    });
}
