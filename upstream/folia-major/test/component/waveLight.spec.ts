import { test, expect } from './fixtures';

// test/component/waveLight.spec.ts
test('Wave Light follows each sung glyph during entrance with no handoff jump', async ({ page, mount }) => {
    await mount('waveLight');
    await page.getByRole('button', { name: 'Read start', exact: true }).click();
    const glyphs = page.locator('[data-wave-light-glyph]');
    await expect(glyphs).toHaveCount(5);
    await expect(glyphs.first()).toHaveCSS('opacity', '0.71');
    await expect(glyphs.nth(4)).toHaveCSS('opacity', '0.5');
    // Freeze only the outer entrance mid-flight: lyric-clock changes must
    // continue updating the inner glyphs even before any entrance can finish.
    const entering = await page.locator('[data-wave-light-line]').evaluate(element => {
        const animations = element.getAnimations({ subtree: true })
            .filter(animation => animation instanceof CSSAnimation && animation.animationName === 'wave-light-token-in');
        for (const animation of animations) { animation.pause(); animation.currentTime = 250; }
        return animations.length;
    });
    expect(entering).toBe(5);
    const line = page.locator('[data-wave-light-line]');
    const before = await line.boundingBox();
    await page.evaluate(() => {
        const element = document.querySelector('[data-wave-light-line]')!;
        Object.assign(window, { __waveLyricNode: element, __waveLyricMutations: 0 });
        new MutationObserver(() => { (window as unknown as { __waveLyricMutations: number }).__waveLyricMutations++; })
            .observe(element, { childList: true, subtree: true });
    });
    await page.getByRole('button', { name: 'Read middle', exact: true }).click();
    await expect(glyphs.nth(2)).toHaveCSS('opacity', '0.752');
    expect(Number(await glyphs.nth(2).locator('.wave-light-glyph-ghost').evaluate(element => getComputedStyle(element).opacity))).toBeGreaterThan(0);
    const during = await glyphs.evaluateAll(elements => elements.map(element => element.getAttribute('style')));
    await line.evaluate(element => {
        for (const animation of element.getAnimations({ subtree: true })) animation.finish();
    });
    await page.waitForTimeout(80);
    expect(await glyphs.evaluateAll(elements => elements.map(element => element.getAttribute('style')))).toEqual(during);
    await page.locator('[data-wave-light-probe-stage]').screenshot({ path: '../../verification/wave-light-parallel-20261027/follow-sing.png' });
    await page.getByRole('button', { name: 'Read tail', exact: true }).click();
    await expect(glyphs.nth(3)).toHaveCSS('opacity', '0.92');
    expect(await glyphs.nth(3).locator('.wave-light-glyph-ghost').evaluate(element =>
        new DOMMatrixReadOnly(getComputedStyle(element).transform).m42 / parseFloat(getComputedStyle(element).fontSize))).toBeLessThan(-0.025);
    await page.getByRole('button', { name: 'Read back', exact: true }).click();
    await expect(glyphs.first()).toHaveCSS('opacity', '0.71');
    expect(await page.evaluate(() => document.querySelector('[data-wave-light-line]') === (window as unknown as { __waveLyricNode: Element }).__waveLyricNode)).toBe(true);
    expect(await page.evaluate(() => (window as unknown as { __waveLyricMutations: number }).__waveLyricMutations)).toBe(0);
    expect(await line.boundingBox()).toEqual(before);
    await page.getByRole('button', { name: 'Background', exact: true }).click();
    await expect(page.locator('.wave-light-glyph-live')).toHaveCount(0);
    const hidden = await glyphs.first().getAttribute('style');
    await page.getByRole('button', { name: 'Read middle', exact: true }).click();
    expect(await glyphs.first().getAttribute('style')).toBe(hidden);
    await page.getByRole('button', { name: 'Foreground', exact: true }).click();
    await expect(glyphs.first()).toHaveCSS('opacity', '0.92');
    expect(await page.locator('.wave-light-glyph-live').count()).toBeGreaterThan(0);
    await page.getByRole('button', { name: 'Static', exact: true }).click();
    await expect(glyphs.nth(4)).toHaveCSS('opacity', '0.92');
    await expect(glyphs.nth(2).locator('.wave-light-glyph-ghost')).toHaveCSS('opacity', '0');
    await expect(page.locator('.wave-light-glyph-live')).toHaveCount(0);
});

test('Wave Light renders centered lyrics at landscape, portrait and offset preview-card sizes', async ({ page, mount }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await mount('waveLight');
    await expect(page.locator('[data-wave-light-line]')).toHaveText('My life was kinda short');
    await expect(page.locator('[data-wave-light-translation]')).toHaveText('我的人生很短暂');
    for (const size of [{ width: 1280, height: 720 }, { width: 390, height: 844 }]) {
        await page.setViewportSize(size);
        await page.waitForTimeout(1400);
        const bounds = await page.locator('[data-wave-light-line]').boundingBox();
        expect(bounds).not.toBeNull();
        expect(Math.abs(bounds!.x + bounds!.width / 2 - size.width / 2)).toBeLessThan(2);
        expect(Math.abs(bounds!.y + bounds!.height / 2 - size.height / 2)).toBeLessThan(2);
        await page.locator('[data-wave-light-probe-stage]').screenshot({ path: `../../verification/wave-light-20261027/${size.width}.png` });
    }
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.getByRole('button', { name: 'Card', exact: true }).click();
    await page.waitForTimeout(200);
    const card = await page.locator('[data-wave-light]').boundingBox();
    const line = await page.locator('[data-wave-light-line]').boundingBox();
    expect(Math.abs(line!.x + line!.width / 2 - card!.x - card!.width / 2)).toBeLessThan(2);
    expect(Math.abs(line!.y + line!.height / 2 - card!.y - card!.height / 2)).toBeLessThan(2);
    await page.getByRole('button', { name: 'Chinese', exact: true }).click();
    await page.getByRole('button', { name: 'Gap', exact: true }).click();
    await expect(page.locator('[data-wave-light-line]')).toHaveText('再度重相逢');
    await page.getByRole('button', { name: 'Intro', exact: true }).click();
    await expect(page.locator('[data-wave-light-line]')).toHaveText('Test Song');
    await page.getByRole('button', { name: 'Segmented', exact: true }).click();
    await expect(page.locator('.wave-light-keyword')).toHaveText('回忆拼好');
    expect(errors).toEqual([]);
});

test('Wave Light reduced-motion view shows readable lyrics without follow-sing ghosts', async ({ page, mount }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await mount('waveLight');
    await page.getByRole('button', { name: 'Read start', exact: true }).click();
    const glyphs = page.locator('[data-wave-light-glyph]');
    await expect(glyphs.nth(4)).toHaveCSS('opacity', '0.92');
    await expect(glyphs.first().locator('.wave-light-glyph-ghost')).toHaveCSS('opacity', '0');
    await page.getByRole('button', { name: 'Read middle', exact: true }).click();
    await expect(glyphs.nth(4)).toHaveCSS('opacity', '0.92');
    await expect(glyphs.nth(2).locator('.wave-light-glyph-ghost')).toHaveCSS('opacity', '0');
});

test('Wave Light preserves foreground pause flow, sleeps in background/static mode and cleans up on switch', async ({ page, mount }) => {
    await page.addInitScript(() => {
        const state = { frames: 0 };
        Object.assign(window, { __waveLightFrames: state });
        const clear = CanvasRenderingContext2D.prototype.clearRect;
        CanvasRenderingContext2D.prototype.clearRect = function (...args) {
            if (this.canvas.classList.contains('wave-light-canvas')) state.frames++;
            return clear.apply(this, args);
        };
        const draw = WebGL2RenderingContext.prototype.drawArraysInstanced;
        WebGL2RenderingContext.prototype.drawArraysInstanced = function (...args) {
            if ((this.canvas as HTMLCanvasElement).classList.contains('wave-light-canvas')) state.frames++;
            return draw.apply(this, args);
        };
    });
    await mount('waveLight');
    const frames = () => page.evaluate(() => (window as unknown as { __waveLightFrames: { frames: number } }).__waveLightFrames.frames);
    await expect.poll(frames).toBeGreaterThan(2);
    await page.getByRole('button', { name: 'Pause', exact: true }).click();
    const paused = await frames();
    await expect.poll(frames).toBeGreaterThan(paused + 2);
    await page.getByRole('button', { name: 'Background', exact: true }).click();
    await page.waitForTimeout(150);
    const hidden = await frames();
    await page.waitForTimeout(250);
    expect(await frames()).toBe(hidden);
    await page.getByRole('button', { name: 'Foreground', exact: true }).click();
    await expect.poll(frames).toBeGreaterThan(hidden + 2);
    await page.getByRole('button', { name: 'Static', exact: true }).click();
    await page.waitForTimeout(150);
    const still = await frames();
    await page.waitForTimeout(250);
    expect(await frames()).toBe(still);
    await page.getByRole('button', { name: 'Animate', exact: true }).click();
    await expect.poll(frames).toBeGreaterThan(still + 2);
    await page.getByRole('button', { name: 'Switch mode', exact: true }).click();
    await expect(page.locator('[data-wave-light]')).toHaveCount(0);
    const removed = await frames();
    await page.waitForTimeout(250);
    expect(await frames()).toBe(removed);
});

test('Wave Light saves all mode controls and restores them after remount', async ({ page, mount }) => {
    await mount('waveLight');
    await page.getByRole('button', { name: 'Settings', exact: true }).click();
    await page.getByRole('button', { name: 'Theme color', exact: true }).click();
    const sliders = page.locator('input[type=range]');
    for (const [index, value] of [[0, '1.4'], [1, '0.6'], [2, '1.2']] as const) {
        await sliders.nth(index).fill(value);
        await sliders.nth(index).dispatchEvent('input');
    }
    await page.getByRole('button', { name: 'Off', exact: true }).click();
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('wave_light_tuning') || 'null'));
    expect(stored).toEqual({ waveSource: 'theme', brightness: 1.4, speed: 0.6, keyword: false, textScale: 1.2 });
    await expect(page.locator('.wave-light-keyword')).toHaveCount(0);
    await page.getByRole('button', { name: 'Switch mode', exact: true }).click();
    await page.getByRole('button', { name: 'Switch mode', exact: true }).click();
    await expect(page.locator('.wave-light-keyword')).toHaveCount(0);
    await page.getByRole('button', { name: 'Reset', exact: true }).click();
    await expect(page.locator('.wave-light-keyword')).toHaveCount(1);
});

test('Wave Light uses GPU batching and recovers after WebGL context loss', async ({ page, mount }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(() => {
        const state = { draws: 0, gradients: 0 };
        Object.assign(window, { __waveGPUStats: state });
        const draw = WebGL2RenderingContext.prototype.drawArraysInstanced;
        WebGL2RenderingContext.prototype.drawArraysInstanced = function (...args) {
            if ((this.canvas as HTMLCanvasElement).classList.contains('wave-light-canvas')) state.draws++;
            return draw.apply(this, args);
        };
        const gradient = CanvasRenderingContext2D.prototype.createLinearGradient;
        CanvasRenderingContext2D.prototype.createLinearGradient = function (...args) {
            if (this.canvas.classList.contains('wave-light-canvas')) state.gradients++;
            return gradient.apply(this, args);
        };
    });
    await mount('waveLight');
    await expect(page.locator('[data-wave-light-renderer=webgl2]')).toHaveCount(1);
    const stats = () => page.evaluate(() => (window as unknown as { __waveGPUStats: { draws: number; gradients: number } }).__waveGPUStats);
    await expect.poll(async () => (await stats()).draws).toBeGreaterThan(2);
    expect((await stats()).gradients).toBe(0);
    await page.evaluate(() => {
        const canvas = document.querySelector<HTMLCanvasElement>('.wave-light-canvas')!;
        const gl = canvas.getContext('webgl2')!;
        const extension = gl.getExtension('WEBGL_lose_context')!;
        Object.assign(window, { __waveContextExtension: extension });
        extension.loseContext();
    });
    await page.waitForTimeout(150);
    const lostDraws = (await stats()).draws;
    await page.waitForTimeout(150);
    expect((await stats()).draws).toBe(lostDraws);
    await page.evaluate(() => (window as unknown as { __waveContextExtension: WEBGL_lose_context }).__waveContextExtension.restoreContext());
    await expect.poll(async () => (await stats()).draws).toBeGreaterThan(lostDraws + 2);
    await expect.poll(() => page.evaluate(() => {
        const canvas = document.querySelector<HTMLCanvasElement>('.wave-light-canvas')!;
        const gl = canvas.getContext('webgl2')!;
        return !gl.isContextLost() && gl.getError() === gl.NO_ERROR;
    })).toBe(true);
    await page.waitForTimeout(200);
    await expect(page.locator('[data-wave-light-line]')).toHaveText('My life was kinda short');
    expect(errors).toEqual([]);
});

test('Wave Light retains a working centered Canvas2D fallback without WebGL2', async ({ page, mount }) => {
    await page.addInitScript(() => {
        const original = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, options?: unknown) {
            if (type === 'webgl2') return null;
            return Reflect.apply(original, this, [type, options]);
        } as typeof original;
    });
    await mount('waveLight');
    await expect(page.locator('[data-wave-light-renderer=canvas2d]')).toHaveCount(1);
    await page.getByRole('button', { name: 'Static', exact: true }).click();
    await expect(page.locator('[data-wave-light-line]')).toHaveText('My life was kinda short');
});
