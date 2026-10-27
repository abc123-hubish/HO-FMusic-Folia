import { expect, test } from './fixtures';

// test/component/previewLyricClock.spec.ts
test('a paused preview restores, offsets and seeks the correct full-song lyric positions', async ({ page, mount }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await mount('previewLyricClock');
    const sample = async () => {
        await page.getByRole('button', { name: 'Sample', exact: true }).click();
        return JSON.parse(await page.locator('[data-preview-clock]').innerText());
    };
    await expect.poll(async () => (await sample()).lyric).toBeCloseTo(76.026, 2);
    await page.getByRole('button', { name: 'Seek clip', exact: true }).click();
    await expect.poll(async () => (await sample()).lyric).toBeCloseTo(81.026, 2);
    expect((await sample()).media).toBeCloseTo(5, 2);
    await page.getByRole('button', { name: 'Offset', exact: true }).click();
    await expect.poll(async () => (await sample()).lyric).toBeCloseTo(80.526, 2);
    expect((await sample()).line).toBe(2);
    await page.getByRole('button', { name: 'Seek lyric', exact: true }).click();
    await expect.poll(async () => (await sample()).media).toBeCloseTo(10, 2);
    await expect.poll(async () => (await sample()).lyric).toBeCloseTo(85.526, 2);
    expect(errors).toEqual([]);
});
