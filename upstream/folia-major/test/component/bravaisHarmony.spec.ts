import type { Page } from '@playwright/test';
import { expect, test } from './fixtures';

// Bravais uses the queue wall's viewport fit on Harmony, including the player safe area.
const loadPlayer = async (page: Page) => page.evaluate(async () => {
    const modulePath = '/src/stores/usePlaybackStore.ts';
    const { usePlaybackStore } = await import(/* @vite-ignore */ modulePath);
    usePlaybackStore.setState({ currentSong: { id: 1, name: 'Viewport test', artists: [], duration: 200000 } });
});

const expandTrack = async (page: Page) => {
    await expect(page.locator('.bravais-tile[data-library-entry]').first()).toBeAttached();
    await page.locator('.bravais-tile[data-library-entry] article').first().evaluate(node => (node as HTMLElement).click());
    await expect(page.locator('[data-bravais-expanded]')).toHaveCount(1);
    await expect(page.locator('[data-bravais-reflowing]')).toHaveCount(0);
};

const expectFits = async (page: Page, width: number, height: number, player: boolean) => {
    await expect.poll(async () => {
        const rect = await page.locator('[data-bravais-expanded]').boundingBox();
        return !rect ? ['missing'] : [
            ...(rect.x < -1 ? [`left=${rect.x}`] : []),
            ...(rect.y < -1 ? [`top=${rect.y}`] : []),
            ...(rect.x + rect.width > width + 1 ? [`right=${rect.x + rect.width}`] : []),
            ...(rect.y + rect.height > height - (player ? 120 : 20) + 1 ? [`bottom=${rect.y + rect.height}, height=${rect.height}`] : []),
        ];
    }).toEqual([]);
    const card = page.locator('[data-bravais-expanded]');
    const actions = card.locator('.bravais-focus-actions');
    await expect(actions).toBeVisible();
    const rect = (await card.boundingBox())!;
    const controls = (await actions.boundingBox())!;
    expect(controls.y + controls.height).toBeLessThanOrEqual(rect.y + rect.height + 1);
};

for (const [width, height] of [[844, 390], [960, 444], [1116, 660], [390, 844]]) {
    for (const player of [false, true]) {
        test(`expanded track fits ${width}x${height}, player=${player}`, async ({ page, mount }) => {
            await page.setViewportSize({ width, height });
            await page.addInitScript(() => document.addEventListener('DOMContentLoaded', () => {
                document.documentElement.setAttribute('data-harmony', '');
            }));
            await mount('bravaisKinds', { current: 'none' });
            if (player) await loadPlayer(page);
            await expandTrack(page);
            await expectFits(page, width, height, player);
        });
    }
}

test('an expanded track stays visible when rotating and loading a player', async ({ page, mount }) => {
    await page.setViewportSize({ width: 844, height: 390 });
    await page.addInitScript(() => document.addEventListener('DOMContentLoaded', () => {
        document.documentElement.setAttribute('data-harmony', '');
    }));
    await mount('bravaisKinds', { current: 'none' });
    await expandTrack(page);
    await expectFits(page, 844, 390, false);
    await page.setViewportSize({ width: 390, height: 844 });
    await expectFits(page, 390, 844, false);
    await loadPlayer(page);
    await page.setViewportSize({ width: 844, height: 390 });
    await expectFits(page, 844, 390, true);
});

test('expansion looks up each moving tile once instead of on every frame', async ({ page, mount }) => {
    await mount('bravaisKinds', { current: 'none', look: 'partial' });
    await expect(page.locator('.bravais-tile[data-library-entry]').first()).toBeAttached();
    await page.evaluate(() => {
        const probe = window as Window & { __bravaisLookupCount: number };
        probe.__bravaisLookupCount = 0;
        const original = Element.prototype.querySelector;
        Element.prototype.querySelector = function<T extends Element>(selector: string): T | null {
            if (selector.startsWith('[data-bravais-slot=')) probe.__bravaisLookupCount++;
            return original.call(this, selector) as T | null;
        };
    });
    await expandTrack(page);
    const count = await page.evaluate(() => (window as Window & { __bravaisLookupCount: number }).__bravaisLookupCount);
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(24);
});

test('changing the playing mark updates only the matching tiles', async ({ page, mount }) => {
    await mount('bravaisKinds', { current: 'none' });
    await expect(page.locator('.bravais-tile[data-library-entry]').first()).toBeAttached();
    // Warm the generated covers before counting the metadata update.
    await page.waitForTimeout(1000);
    await page.evaluate(async () => {
        const modulePath = '/src/library/suites/bravais/bravaisStageStore.ts';
        const { useBravaisStageStore } = await import(/* @vite-ignore */ modulePath);
        const { home } = useBravaisStageStore.getState();
        (window as Window & { __renderCounts: Record<string, number> }).__renderCounts = {};
        const nowPlayingKey = home.layer.items.find((item: { kind: string }) => item.kind === 'track').key;
        useBravaisStageStore.setState({ home: { ...home, layer: { ...home.layer, nowPlayingKey } } });
    });
    await expect(page.locator('[data-bravais-current]').first()).toBeAttached();
    const current = await page.locator('[data-bravais-current]').count();
    const count = await page.evaluate(() => (window as Window & { __renderCounts: Record<string, number> }).__renderCounts.BravaisTile ?? 0);
    expect(count).toBe(current * 2); // The gallery uses StrictMode.
});
