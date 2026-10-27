import { expect, test } from './fixtures';

// test/component/playerControlIdle.spec.ts
// Exercise idle timing on the real capsule, including held and interrupted pointers.
const CAPSULE = '[data-ponder="player-bar"]';

test.beforeEach(async ({ page, mount }) => {
    await page.clock.install();
    await mount('playerBottomBar');
    await page.clock.pauseAt(await page.evaluate(() => Date.now() + 100));
    const box = (await page.locator(CAPSULE).boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await expect(page.locator(CAPSULE).getByText('Probe Song', { exact: true })).toBeVisible();
});

test('collapses after three idle seconds even with the pointer over the bar', async ({ page }) => {
    const title = page.locator(CAPSULE).getByText('Probe Song', { exact: true });
    await page.clock.runFor(2999);
    await expect(title).toBeVisible();
    await page.clock.runFor(1);
    await expect(title).toHaveCount(0);
    await expect(page.locator(CAPSULE).locator('input[type="range"]')).toBeVisible();
    await page.clock.runFor(500);
    const box = (await page.locator(CAPSULE).boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await expect(title).toBeVisible();
    await page.clock.runFor(3000);
    await expect(title).toHaveCount(0);
});

test('only activity on the bar restarts its three second timer', async ({ page }) => {
    const title = page.locator(CAPSULE).getByText('Probe Song', { exact: true });
    await page.clock.runFor(2000);
    const box = (await page.locator(CAPSULE).boundingBox())!;
    await page.mouse.move(box.x + box.width / 2 + 1, box.y + box.height / 2);
    await page.clock.runFor(2000);
    await expect(title).toBeVisible();
    await page.mouse.move(10, 200);
    await page.clock.runFor(999);
    await expect(title).toBeVisible();
    await page.clock.runFor(1);
    await expect(title).toHaveCount(0);
});

test('keeps a held touch expanded and starts timing when released', async ({ page }) => {
    const capsule = page.locator(CAPSULE);
    const title = capsule.getByText('Probe Song', { exact: true });
    await capsule.dispatchEvent('pointerdown', { pointerId: 7, pointerType: 'touch', buttons: 1 });
    await page.clock.runFor(4000);
    await expect(title).toBeVisible();
    await capsule.dispatchEvent('pointerup', { pointerId: 7, pointerType: 'touch', buttons: 0 });
    await page.clock.runFor(2999);
    await expect(title).toBeVisible();
    await page.clock.runFor(1);
    await expect(title).toHaveCount(0);
});

test('still collapses if a child stops the release event from bubbling', async ({ page }) => {
    const button = page.locator(CAPSULE).locator('button').first();
    await button.evaluate(element => {
        element.addEventListener('pointerup', event => event.stopPropagation());
    });
    await button.dispatchEvent('pointerdown', { pointerId: 7, pointerType: 'touch', buttons: 1 });
    await button.dispatchEvent('pointerup', { pointerId: 7, pointerType: 'touch', buttons: 0 });
    await page.clock.runFor(3000);
    await expect(page.locator(CAPSULE).getByText('Probe Song', { exact: true })).toHaveCount(0);
});

test('recovers from a missing release when the window loses focus', async ({ page }) => {
    await page.locator(CAPSULE).dispatchEvent('pointerdown', { pointerId: 7, pointerType: 'touch', buttons: 1 });
    await page.evaluate(() => window.dispatchEvent(new Event('blur')));
    await page.clock.runFor(3000);
    await expect(page.locator(CAPSULE).getByText('Probe Song', { exact: true })).toHaveCount(0);
});

test('a cancelled touch returns to the idle timer', async ({ page }) => {
    await page.locator(CAPSULE).dispatchEvent('pointerdown', { pointerId: 7, pointerType: 'touch', buttons: 1 });
    await page.locator(CAPSULE).dispatchEvent('pointercancel', { pointerId: 7, pointerType: 'touch', buttons: 0 });
    await page.clock.runFor(3000);
    await expect(page.locator(CAPSULE).getByText('Probe Song', { exact: true })).toHaveCount(0);
});
