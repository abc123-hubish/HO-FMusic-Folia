import { test, expect } from './fixtures';
import '../../dev/probes/accountBehavior/probeApi';

// test/component/loginSuccess.spec.ts
// Real account completion drives the animation; restored, cancelled and failed attempts do not.
for (const width of [390, 1100]) {
    test(`QR success fills the window, flies to the account button and ends at ${width}px`, async ({ page, mount }) => {
        await page.setViewportSize({ width, height: 844 });
        await mount('accountBehavior');
        await page.waitForFunction(() => window.__accountProbe?.ready());
        await page.evaluate(() => {
            window.__accountProbe!.setAccount('acct-alpha', 'anonymous');
            window.__accountProbe!.scriptQr('acct-alpha', ['scanned', 'confirmed']);
        });
        await page.getByTestId('online-provider-switcher').getByRole('button').first().click();
        await expect(page.getByTestId('login-success')).toBeVisible();
        await expect(page.getByTestId('login-success').getByText('Alpha User', { exact: true })).toBeVisible();
        await page.waitForTimeout(650);
        const title = await page.getByTestId('login-success').getByText('Alpha User', { exact: true }).boundingBox();
        const bounds = await page.getByTestId('login-window').boundingBox();
        expect(title!.x).toBeGreaterThanOrEqual(bounds!.x);
        expect(title!.x + title!.width).toBeLessThanOrEqual(bounds!.x + bounds!.width);
        await page.screenshot({ path: `D:/folia/verification/login-success-20261025/success-${width}.png` });
        await expect(page.getByTestId('login-success-flight')).toBeVisible();
        await expect(page.getByTestId('login-success-flight')).toHaveCount(0);
        await expect(page.getByTestId('login-window')).toHaveCount(0);
        await expect(page.locator('[data-login-pill="acct-alpha"]')).toHaveCSS('opacity', '1');
        await expect.poll(() => page.evaluate(() => window.__accountProbe!.accountStatus('acct-alpha'))).toBe('authenticated');
        // Reopening an already authenticated account must not replay an old completion.
        await page.getByTestId('online-provider-switcher').getByRole('button').first().click();
        await expect(page.getByTestId('login-window').getByRole('heading', { name: 'Alpha User', exact: true })).toBeVisible();
        await expect(page.getByTestId('login-success')).toHaveCount(0);
    });
}

test('reduced motion completes QR login immediately without a finale', async ({ page, mount }) => {
    await page.addInitScript(() => localStorage.setItem('reduce_motion_uiMicroMotion', 'true'));
    await mount('loginPanel');
    await page.waitForFunction(() => window.__accountProbe?.ready());
    await page.evaluate(() => {
        window.__accountProbe!.setAccount('acct-alpha', 'anonymous');
        window.__accountProbe!.scriptQr('acct-alpha', ['confirmed']);
    });
    await page.getByRole('button', { name: 'Open shared login' }).click();
    await expect.poll(() => page.evaluate(() => window.__accountProbe!.accountStatus('acct-alpha'))).toBe('authenticated');
    await expect(page.getByTestId('login-window')).toHaveCount(0);
    await expect(page.getByTestId('login-success')).toHaveCount(0);
    await expect(page.getByTestId('login-success-flight')).toHaveCount(0);
});

test('closing after scanning cancels the attempt and leaves no success overlay', async ({ page, mount }) => {
    await mount('loginPanel');
    await page.waitForFunction(() => window.__accountProbe?.ready());
    await page.evaluate(() => {
        window.__accountProbe!.setAccount('acct-alpha', 'anonymous');
        window.__accountProbe!.scriptQr('acct-alpha', ['scanned']);
    });
    await page.getByRole('button', { name: 'Open shared login' }).click();
    await expect(page.locator('[data-login-scene="scanned"]')).toBeVisible();
    await page.keyboard.press('Escape');
    await page.evaluate(() => window.__accountProbe!.scriptQr('acct-alpha', ['confirmed']));
    await page.waitForTimeout(2300);
    await expect(page.getByTestId('login-window')).toHaveCount(0);
    await expect(page.getByTestId('login-success-flight')).toHaveCount(0);
    expect(await page.evaluate(() => window.__accountProbe!.accountStatus('acct-alpha'))).toBe('anonymous');
});

test('account refresh failure retains retry and never shows success', async ({ page, mount }) => {
    await mount('loginPanel');
    await page.waitForFunction(() => window.__accountProbe?.ready());
    await page.evaluate(() => {
        window.__accountProbe!.setAccount('acct-alpha', 'anonymous');
        window.__accountProbe!.failRefresh('acct-alpha', 1);
        window.__accountProbe!.scriptQr('acct-alpha', ['confirmed']);
    });
    await page.getByRole('button', { name: 'Open shared login' }).click();
    await expect(page.locator('[data-login-scene="failed"]')).toBeVisible();
    await expect(page.getByTestId('login-window').getByRole('button', { name: 'Refresh QR code', exact: true })).toBeVisible();
    await expect(page.getByTestId('login-success')).toHaveCount(0);
    await expect(page.getByTestId('login-success-flight')).toHaveCount(0);
});

test('Bravais success flies to its own account avatar', async ({ page, mount }) => {
    await page.setViewportSize({ width: 1100, height: 844 });
    await mount('accountBehavior');
    await page.waitForFunction(() => window.__accountProbe?.ready());
    await page.evaluate(() => {
        window.__accountProbe!.setSuite('bravais');
        window.__accountProbe!.setAccount('acct-alpha', 'anonymous');
        window.__accountProbe!.scriptQr('acct-alpha', ['confirmed']);
    });
    await page.locator('[data-bravais-account-toggle]:visible').first().click();
    await expect(page.getByTestId('login-success')).toBeVisible();
    await expect(page.getByTestId('login-success-flight')).toBeVisible();
    await expect(page.getByTestId('login-success-flight')).toHaveCount(0);
    await expect(page.locator('[data-bravais-account-avatar][data-login-pill="acct-alpha"]:visible')).toHaveCSS('opacity', '1');
});

for (const action of ['close', 'reduce-motion']) {
    test(`${action} during the finale leaves a logged-in account without an animation`, async ({ page, mount }) => {
        await mount('loginPanel');
        await page.waitForFunction(() => window.__accountProbe?.ready());
        await page.evaluate(() => {
            window.__accountProbe!.setAccount('acct-alpha', 'anonymous');
            window.__accountProbe!.scriptQr('acct-alpha', ['confirmed']);
        });
        await page.getByRole('button', { name: 'Open shared login' }).click();
        await expect(page.getByTestId('login-success')).toBeVisible();
        if (action === 'close') await page.keyboard.press('Escape');
        else await page.evaluate(async () => {
            const modulePath = '/src/stores/useMotionSettingsStore.ts';
            const { useMotionSettingsStore } = await import(modulePath);
            useMotionSettingsStore.getState().handleToggleReducedMotionSurface('uiMicroMotion', true);
        });
        await expect(page.getByTestId('login-window')).toHaveCount(0);
        await expect(page.getByTestId('login-success-flight')).toHaveCount(0);
        expect(await page.evaluate(() => window.__accountProbe!.accountStatus('acct-alpha'))).toBe('authenticated');
    });
}
