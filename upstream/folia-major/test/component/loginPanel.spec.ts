import { test, expect } from './fixtures';
import '../../dev/probes/accountBehavior/probeApi';

// test/component/loginPanel.spec.ts
// Layout and presentation regression: real controller semantics, isolated provider fixture, no real login.
for (const viewport of [{ width: 320, height: 568 }, { width: 390, height: 844 }, { width: 640, height: 360 }, { width: 744, height: 440 }, { width: 844, height: 390 }, { width: 1100, height: 800 }]) {
    test(`shared login fits ${viewport.width}x${viewport.height}`, async ({ page, mount }) => {
        await page.setViewportSize(viewport);
        await mount('loginPanel');
        await page.getByRole('button', { name: 'Open shared login' }).click();
        const dialog = page.getByTestId('login-window');
        await expect(dialog).toBeVisible();
        await expect(dialog).toHaveCSS('opacity', '1');
        const bounds = await dialog.boundingBox();
        expect(bounds).not.toBeNull();
        expect(bounds!.x).toBeGreaterThanOrEqual(0);
        expect(bounds!.y).toBeGreaterThanOrEqual(0);
        expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(viewport.width);
        expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(viewport.height);
        expect(bounds!.width).toBeLessThanOrEqual(680);
        expect(bounds!.height).toBeGreaterThanOrEqual(Math.min(320, viewport.height - 32) - 0.5);
        const platform = dialog.getByTestId('login-platforms');
        await expect(platform).toHaveCSS('flex-direction', viewport.width < 680 ? 'row' : 'column');
        const picture = dialog.locator('.login-tile');
        const headline = dialog.getByRole('heading', { name: 'Alpha User', exact: true });
        const pictureBounds = await picture.boundingBox();
        const headlineBounds = await headline.boundingBox();
        expect(headlineBounds!.x).toBeGreaterThanOrEqual(pictureBounds!.x + pictureBounds!.width);
        await expect(dialog.getByRole('button', { name: 'Logout', exact: true })).toBeInViewport();
        expect(await dialog.locator('.st-scroll').last().evaluate(node => node.scrollHeight - node.clientHeight)).toBeLessThanOrEqual(1);
        await dialog.locator('[data-login-platform]').filter({ hasText: 'Beta' }).click();
        await expect(dialog.getByRole('button', { name: /Switch to/ })).toBeInViewport();
        await page.waitForTimeout(700);
        await page.screenshot({ path: `D:/folia/verification/login-account-${viewport.width}x${viewport.height}.png` });
        await dialog.locator('[data-login-platform]').filter({ hasText: 'Quill' }).click();
        await expect(dialog.getByRole('button', { name: 'Q scan', exact: true })).toBeVisible();
        await expect(dialog.getByRole('button', { name: 'Q scan', exact: true })).toBeInViewport();
        if (viewport.width >= 560) {
            expect((await dialog.boundingBox())!.height).toBeCloseTo(bounds!.height, 0);
        }
        await page.waitForTimeout(700);
        await page.screenshot({ path: `D:/folia/verification/upstream-ui-login-${viewport.width}x${viewport.height}.png` });
        await dialog.locator('[data-login-platform]').filter({ hasText: 'Gamma' }).click();
        await expect(dialog.locator('img.login-code')).toBeInViewport();
        if (viewport.width >= 560) {
            expect((await dialog.boundingBox())!.height).toBeCloseTo(bounds!.height, 0);
        }
        await page.waitForTimeout(700);
        await page.screenshot({ path: `D:/folia/verification/login-code-${viewport.width}x${viewport.height}.png` });
        await page.keyboard.press('Escape');
        await expect(dialog).toHaveCount(0);
        await expect(page.getByRole('button', { name: 'Open shared login' })).toBeFocused();
    });
}

for (const side of ['left', 'right', 'top', 'bottom'] as const) {
    test(`Harmony login avoids the ${side} camera cutout`, async ({ page, mount }) => {
        await page.setViewportSize({ width: 744, height: 440 });
        await mount('loginPanel');
        await page.evaluate(edge => {
            document.documentElement.dataset.harmony = 'true';
            window.dispatchEvent(new CustomEvent('harmonywindowinsetschange', { detail: {
                enabled: false, top: 0, right: 0,
                cutoutLeft: edge === 'left' ? 52 : 0, cutoutRight: edge === 'right' ? 52 : 0,
                cutoutTop: edge === 'top' ? 52 : 0, cutoutBottom: edge === 'bottom' ? 40 : 0,
            } }));
        }, side);
        await page.getByRole('button', { name: 'Open shared login' }).click();
        const dialog = page.getByTestId('login-window');
        await expect(dialog).toHaveCSS('opacity', '1');
        const frame = (await dialog.boundingBox())!;
        const sideGap = side === 'left' || side === 'right' ? 64 : 44;
        expect(frame.x).toBeGreaterThanOrEqual(sideGap - 1);
        expect(frame.x + frame.width).toBeLessThanOrEqual(744 - sideGap + 1);
        expect(frame.y).toBeGreaterThanOrEqual(side === 'top' ? 56 : 16);
        expect(frame.y + frame.height).toBeLessThanOrEqual(side === 'bottom' ? 388 : 424);
        await expect(dialog.getByRole('button', { name: 'Logout', exact: true })).toBeInViewport();
        await dialog.locator('[data-login-platform]').filter({ hasText: 'Gamma' }).click();
        await expect(dialog.locator('img.login-code')).toBeInViewport();
        expect(await dialog.evaluate(node => node.scrollWidth - node.clientWidth)).toBeLessThanOrEqual(1);
        expect(await dialog.locator('.st-scroll').last().evaluate(node => node.scrollWidth - node.clientWidth)).toBeLessThanOrEqual(1);
        await page.waitForTimeout(700);
        await page.screenshot({ path: `D:/folia/verification/login-camera-${side}.png` });

        // A newly reported larger camera margin changes usable width without resizing the viewport.
        await page.evaluate(() => window.dispatchEvent(new CustomEvent('harmonywindowinsetschange', { detail: {
            enabled: false, top: 0, right: 0, cutoutLeft: 80, cutoutRight: 0, cutoutTop: 0, cutoutBottom: 0,
        } })));
        await expect(dialog.getByTestId('login-platforms')).toHaveAttribute('data-orientation', 'row');
        await expect(dialog.locator('img.login-code')).toBeInViewport();
        if (side === 'left') {
            await page.setViewportSize({ width: 390, height: 844 });
            await page.evaluate(() => window.dispatchEvent(new CustomEvent('harmonywindowinsetschange', { detail: {
                enabled: false, top: 0, right: 0, cutoutLeft: 0, cutoutRight: 0, cutoutTop: 44, cutoutBottom: 0,
            } })));
            await expect(dialog.locator('img.login-code')).toBeInViewport();
            expect((await dialog.boundingBox())!.y).toBeGreaterThanOrEqual(48);
            await page.setViewportSize({ width: 744, height: 440 });
            await page.evaluate(() => window.dispatchEvent(new CustomEvent('harmonywindowinsetschange', { detail: {
                enabled: false, top: 0, right: 0, cutoutLeft: 0, cutoutRight: 52, cutoutTop: 0, cutoutBottom: 0,
            } })));
            await expect(dialog.getByTestId('login-platforms')).toHaveAttribute('data-orientation', 'column');
            await expect(dialog.locator('img.login-code')).toBeInViewport();
            const rotated = (await dialog.boundingBox())!;
            expect(rotated.x + rotated.width).toBeLessThanOrEqual(681);
        }
    });
}

test('login reserves room and expands only when details need it', async ({ page, mount }) => {
    await page.setViewportSize({ width: 844, height: 700 });
    await mount('loginPanel');
    await page.getByRole('button', { name: 'Open shared login' }).click();
    const dialog = page.getByTestId('login-window');
    await page.evaluate(() => window.__accountProbe!.failCreate('acct-gamma', 1));
    await dialog.locator('[data-login-platform]').filter({ hasText: 'Gamma' }).click();
    const details = dialog.getByRole('button', { name: 'Details', exact: true });
    await expect(details).toBeVisible();
    const baseHeight = (await dialog.boundingBox())!.height;
    await details.click();
    await expect(dialog.getByText(/^Restart (Folia|FMusic), then scan again\.$/)).toBeVisible();
    await expect.poll(async () => (await dialog.boundingBox())!.height).toBeGreaterThan(baseHeight + 30);
    await details.click();
    await expect.poll(async () => (await dialog.boundingBox())!.height).toBeCloseTo(baseHeight, 0);
});

test('switch confirmation and login cancellation keep existing controller rules', async ({ page, mount }) => {
    await page.setViewportSize({ width: 1100, height: 800 });
    await mount('loginPanel');
    await page.getByRole('button', { name: 'Open shared login' }).click();
    const dialog = page.getByTestId('login-window');
    await dialog.locator('[data-login-platform]').filter({ hasText: 'Beta' }).click();
    await dialog.getByRole('button', { name: /Switch to/ }).click();
    await expect(page.getByRole('button', { name: 'Confirm', exact: true })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: 'Confirm', exact: true })).toHaveCount(0);
    await expect(dialog).toBeVisible();
    await dialog.locator('[data-login-platform]').filter({ hasText: 'Gamma' }).click();
    await expect(dialog.locator('img.login-code')).toBeVisible();
    await dialog.getByRole('button', { name: /Close/ }).click();
    await expect(dialog).toHaveCount(0);
    await page.waitForTimeout(150);
    await expect(dialog).toHaveCount(0);
});

test('grid and Bravais account entries open the same window', async ({ page, mount }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await mount('accountBehavior');
    await page.getByTestId('online-provider-switcher').getByRole('button').first().click();
    await expect(page.getByTestId('login-window')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('login-window')).toHaveCount(0);
    await page.evaluate(() => window.__accountProbe!.setSuite('bravais'));
    await page.locator('[data-bravais-account-toggle]:visible').first().click();
    await expect(page.getByTestId('login-window')).toBeVisible();
    await expect(page.getByTestId('login-window').getByTestId('login-platforms')).toBeVisible();
});
