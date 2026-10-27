import { test, expect } from './fixtures';

// Phone and landscape checks cover unsaved testing, save/reopen, provider switching and card overflow.
for (const [width, height] of [[390, 844], [844, 390]]) {
  test(`AI service configuration ${width}x${height}`, async ({ page, mount }) => {
    await page.setViewportSize({ width, height });
    await page.addInitScript(() => {
      const host = window as any;
      host.savedAi = { enabled: false, provider: 'openai', apiUrl: '', model: '', apiKey: '', geminiModel: 'gemini-3-flash-preview', geminiApiKey: '', temperature: '0.7', stream: false };
      host.HarmonyConfig = { netease: '', kugou: '', qq: '', server: '', aiProvider: 'gemini' };
      host.FoliaNative = { getConfig: () => JSON.stringify(host.HarmonyConfig), saveConfig: () => '',
        getAiConfig: () => JSON.stringify(host.savedAi), saveAiConfig: (json: string) => { host.savedAi = JSON.parse(json); return ''; },
        requestAi: (id: string, json: string) => {
          host.testRequest = JSON.parse(json);
          setTimeout(() => host.HarmonyAi.receive(id, JSON.stringify({ status: 200, body: JSON.stringify({ model: 'test-model', choices: [{ message: { content: 'hello' } }] }), contentType: 'application/json', error: '' })), 20);
        },
      };
    });
    const component = await mount('harmonyAi');
    await expect(component.getByLabel('FMusic server (AI and lyric proxy)')).toHaveCount(0);
    await expect(component.getByLabel('AI provider')).toHaveCount(0);
    const form = component.locator('[data-harmony-ai]');
    await form.getByRole('button', { name: 'Use my own AI service', exact: true }).click();
    await form.getByLabel('OpenAI API URL').fill('https://relay.example/v1');
    await form.getByLabel('Model', { exact: true }).fill('user-model');
    await form.getByLabel('Temperature', { exact: true }).fill('0.9');
    await form.locator('input[type=password]').fill('draft-key');
    await form.getByRole('button', { name: 'Test connection', exact: true }).click();
    await expect(form.getByRole('status')).toContainText('hello');
    expect(await page.evaluate(() => (window as any).savedAi.apiKey)).toBe('');
    expect(await page.evaluate(() => JSON.parse((window as any).testRequest.body).model)).toBe('user-model');
    await form.getByRole('button', { name: 'Save and apply' }).click();
    await expect(form).toContainText('AI settings saved and applied');
    expect(await page.evaluate(() => (window as any).savedAi)).toMatchObject({ enabled: true, model: 'user-model', temperature: '0.9', apiKey: 'draft-key' });
    await form.getByRole('button', { name: 'Google Gemini', exact: true }).click();
    await expect(form.getByLabel('Model', { exact: true })).toHaveValue('gemini-3-flash-preview');
    await form.getByRole('button', { name: 'Other Compatible API', exact: true }).click();
    await expect(form.getByLabel('Model', { exact: true })).toHaveValue('user-model');
    await page.screenshot({ path: `../../verification/ai-settings-${width}x${height}.png`, fullPage: true });
    const bounds = await form.evaluate(element => ({ left: element.getBoundingClientRect().left, right: element.getBoundingClientRect().right,
      width: element.clientWidth, content: element.scrollWidth }));
    expect(bounds.left).toBeGreaterThanOrEqual(0); expect(bounds.right).toBeLessThanOrEqual(width); expect(bounds.content).toBeLessThanOrEqual(bounds.width + 1);
  });
}
