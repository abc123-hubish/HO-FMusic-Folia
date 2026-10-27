import { expect, type Page } from '@playwright/test';

export async function setup(page: Page, query = '') {
    await page.addInitScript(() => {
        const host = window as any;
        localStorage.setItem('theme_generation_source', 'cover');
        host.aiRequests = [];
        const config = { enabled: true, provider: 'openai', apiUrl: 'https://relay.example/v1', model: 'my-model',
            apiKey: 'draft-key', temperature: '0.7', stream: false };
        host.aiConfig = config;
        host.FoliaNative = { getAiConfig: () => JSON.stringify(config), requestAi: (id: string, json: string) => {
            host.aiRequests.push({ id, payload: JSON.parse(json) });
        } };
        host.replyAi = (index: number, status = 200) => {
            const theme = { name: `Model theme ${index + 1}`, backgroundColor: '#181830', primaryColor: '#ffffff',
                accentColor: '#cc44ff', secondaryColor: '#aabbcc', fontStyle: 'sans', animationIntensity: 'normal' };
            const body = status === 200 ? { choices: [{ message: { content: JSON.stringify({ light: theme, dark: theme }) } }] }
                : { error: { message: 'Invalid draft-key' } };
            host.HarmonyAi.receive(host.aiRequests[index].id, JSON.stringify({ status, body: JSON.stringify(body), contentType: 'application/json', error: '' }));
        };
    });
    await page.goto(`/dev-probe.html?probe=harmonyAiGeneration${query}`);
    await expect(page.locator('[data-ai-ready]')).toHaveAttribute('data-ai-ready', 'true');
}
export const requestCount = (page: Page) => page.evaluate(() => (window as any).aiRequests.length);
export const reply = (page: Page, index = 0, status = 200) => page.evaluate(([i, s]) => (window as any).replyAi(i, s), [index, status]);
