import { test, expect } from '@playwright/test';
import type {} from '../../dev/probes/smartBeat.probe';

// test/component/smartBeat.spec.ts
test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
        if (sessionStorage.getItem('smart-beat-seeded')) return;
        localStorage.clear(); localStorage.setItem('i18nextLng', 'en');
        sessionStorage.setItem('smart-beat-seeded', 'true');
    });
});
test('smart beat controls persist, scale independently and reset', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/dev-probe.html?probe=smartBeat');
    const card = page.getByTestId('smart-beat-settings');
    await expect(card.getByRole('button', { name: 'Off', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await card.getByRole('button', { name: 'Cached only' }).click();
    await card.getByRole('switch', { name: 'Hanabi · Beat bursts' }).click();
    await card.getByRole('slider', { name: 'Hanabi · Camera pulse Strength' }).fill('1.6');
    expect(await page.evaluate(() => window.__smartBeatProbe.settings())).toMatchObject({ mode: 'cached', effects: {
        'hanabi.beatBursts': { on: false }, 'hanabi.beatPulse': { strength: 1.6 },
    } });
    await page.screenshot({ path: 'D:/folia/verification/smart-beat-20261026/settings-390.png' });
    await page.reload();
    await expect(card.getByRole('button', { name: 'Cached only' })).toHaveAttribute('aria-pressed', 'true');
    await expect(card.getByRole('switch', { name: 'Hanabi · Beat bursts' })).toHaveAttribute('aria-checked', 'false');
    await expect(card.getByRole('slider', { name: 'Hanabi · Camera pulse Strength' })).toHaveValue('1.6');
    expect(await card.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
    await card.getByRole('button', { name: 'Reset', exact: true }).click();
    await expect(card.getByRole('button', { name: 'Off', exact: true })).toHaveAttribute('aria-pressed', 'true');
});

test('real WebGPU worker analyses a complete two-chunk synthetic rhythm', async ({ page }) => {
    test.setTimeout(150_000);
    await page.goto('/dev-probe.html?probe=smartBeat');
    await expect(page.getByTestId('smart-beat-settings')).toBeVisible();
    const supported = await page.evaluate(() => window.__smartBeatProbe.support());
    const engine = await page.evaluate(() => window.__smartBeatProbe.engine());
    test.skip(!supported || engine !== 'gpu', 'WebGPU absent; CPU compatibility is checked separately.');
    const result = await page.evaluate(() => window.__smartBeatProbe.analyse(35));
    expect(result.duration).toBe(35);
    expect(result.beats.length).toBeGreaterThan(20);
    expect(result.beats.every((t, i) => t >= 0 && t < 36 && (i === 0 || t > result.beats[i - 1]))).toBe(true);
    expect(result.accents.impact).toHaveLength(result.beats.length);
    expect(result.beats.some(t => t > 30)).toBe(true);
    await test.info().attach('real-worker-result', { body: JSON.stringify(result), contentType: 'application/json' });
});

for (const noWorkers of [false, true]) test(`complete playback drives CPU beat effects without WebGPU, workers disabled=${noWorkers}`, async ({ page }) => {
    test.setTimeout(60_000);
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(noWorkers => {
        Object.defineProperty(navigator, 'gpu', { value: undefined, configurable: true });
        if (noWorkers) Object.defineProperty(window, 'Worker', { value: class { constructor() { throw new Error('Workers unavailable'); } }, configurable: true });
    }, noWorkers);
    await page.goto('/dev-probe.html?probe=smartBeat&visual=1');
    await page.evaluate(() => window.__smartBeatProbe.instrumentStage());
    await expect(page.getByTestId('smart-beat-engine')).toContainText('CPU compatibility');
    await expect(page.getByRole('button', { name: 'Analyse', exact: true })).toBeEnabled();
    await page.getByRole('button', { name: 'Play complete rhythm' }).click();
    await expect.poll(() => page.evaluate(() => window.__smartBeatProbe.state().status)).toBe('ready');
    const state = await page.evaluate(() => window.__smartBeatProbe.state());
    expect(state.engine).toBe('cpu'); expect(state.ready).toBe(true); expect(state.beats).toBeGreaterThan(20);
    await page.waitForFunction(() => window.__smartBeatProbe.state().impact > 0.1, { timeout: 15000 });
    await expect(page.locator('canvas').first()).toBeVisible();
    await page.waitForFunction(() => window.__smartBeatProbe.stageScale() > 1.01);
    // A fresh controller reads the real IndexedDB result rather than re-running the detector.
    await page.getByRole('button', { name: 'Off', exact: true }).click();
    await page.getByRole('button', { name: 'Cached only' }).click();
    await expect.poll(() => page.evaluate(() => window.__smartBeatProbe.state().status)).toBe('cached');
    expect((await page.evaluate(() => window.__smartBeatProbe.state())).engine).toBe('cpu');
    expect(errors).toEqual([]);
    await page.screenshot({ path: `D:/folia/verification/smart-beat-fix-20261026/cpu-playback-${noWorkers ? 'page' : 'worker'}.png` });
});
