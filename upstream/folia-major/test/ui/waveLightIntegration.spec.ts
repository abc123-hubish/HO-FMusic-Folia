import { test, expect } from '@playwright/test';
import { APP_VERSION, GUIDE_VERSION_STORAGE_KEY, waitForAppMounted } from '../helpers/appState';

// test/ui/waveLightIntegration.spec.ts
test('Wave Light opens in the full app, edits in the real settings editor and exports its saved tuning', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(({ version, guideKey }) => {
        localStorage.clear();
        localStorage.setItem('library_suite_prompt_seen', 'true');
        localStorage.setItem('i18nextLng', 'en');
        localStorage.setItem('open_player_on_launch', 'true');
        localStorage.setItem('visualizer_mode', 'wave-light');
        localStorage.setItem('static_mode', 'true');
        localStorage.setItem(guideKey, version);
    }, { version: APP_VERSION, guideKey: GUIDE_VERSION_STORAGE_KEY });
    await page.route('**/__mock_netease__/**', route => route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
    await page.goto('/');
    await waitForAppMounted(page);
    await expect(page.locator('[data-wave-light]').first()).toBeVisible();
    await page.evaluate(async () => {
        const path = '/src/stores/useSettingsModalStore.ts';
        const { useSettingsModalStore } = await import(path);
        useSettingsModalStore.getState().openSettings('options', 'visualizer', 'visualizer');
    });
    const panel = page.getByText('Wave Light settings', { exact: true }).locator('..');
    await expect(panel).toBeVisible();
    await panel.getByRole('button', { name: 'Theme color', exact: true }).click();
    await panel.locator('input[type=range]').first().fill('1.6');
    await panel.locator('input[type=range]').first().dispatchEvent('input');
    await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('wave_light_tuning') || '{}').brightness)).toBe(1.6);
    const exported = await page.evaluate(async () => {
        const path = '/src/services/obs/visualSettingsConfig.ts';
        const codec = '/src/utils/appearanceCodec.ts';
        const { buildVisualSettingsConfig } = await import(path);
        const { compressConfig, decompressConfig } = await import(codec);
        return decompressConfig(compressConfig(buildVisualSettingsConfig()));
    });
    expect(exported.visualizerMode).toBe('wave-light');
    expect(exported.visualizerTunings['wave-light'].brightness).toBe(1.6);
    expect(exported.visualizerTunings['wave-light'].waveSource).toBe('theme');
    await page.screenshot({ path: '../../verification/wave-light-20261027/app-settings.png' });
    expect(errors).toEqual([]);
});
