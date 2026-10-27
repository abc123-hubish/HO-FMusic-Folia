import { expect, test } from '@playwright/test';
import { installBaseState, localImportFixture, mockNeteaseApi, openApp } from './helpers/appFixtures';

// test/ui/localCoverBackfill.spec.ts
// Imports a coverless folder in the ordinary Web app and checks real provider routing, persistence and UI.
test('fills a Web-imported local cover through NetEase without a native host or playback', async ({ page }) => {
    await installBaseState(page, { neteaseMode: 'guest',
        localImportFixture: { ...localImportFixture, entries: localImportFixture.entries.filter(entry => entry.name !== 'cover.jpg') } });
    await page.addInitScript(() => {
        (window as unknown as { __appModule: (path: string) => Promise<any> }).__appModule = path => import(/* @vite-ignore */ path);
    });
    await mockNeteaseApi(page, 'guest');
    let searches = 0;
    await page.route('**/__mock_netease__/cloudsearch?**', async route => {
        searches += 1;
        await route.fulfill({ json: { code: 200, result: { songCount: 1, songs: [{ id: 123, name: 'Midnight Train',
            ar: [{ id: 2, name: 'Test Artist' }], al: { id: 3, name: 'Fixture Album', picUrl: '/__mock_covers__/matched.png' }, dt: 126000 }] } } });
    });
    await page.route('**/__mock_covers__/matched.png', route => route.fulfill({ contentType: 'image/png',
        body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aEJ8AAAAASUVORK5CYII=', 'base64') }));
    await openApp(page);
    expect(await page.evaluate(() => Boolean((window as unknown as { FoliaNative?: unknown }).FoliaNative))).toBe(false);
    await page.getByRole('button', { name: 'Folder' }).last().click();
    await page.getByRole('button', { name: 'Import Folder' }).last().click();
    await expect(page.getByText('All Songs').first()).toBeVisible();
    const snapshot = () => page.evaluate(async () => {
        const load = (window as unknown as { __appModule: (path: string) => Promise<any> }).__appModule;
        const [{ getLocalSongs }, { hasCachedCover }, { usePlaybackStore }] = await Promise.all([
            load('/src/services/db.ts'), load('/src/services/coverCache.ts'), load('/src/stores/usePlaybackStore.ts')]);
        const song = (await getLocalSongs())[0];
        return { cover: song?.onlineMetadata?.coverUrl, selected: song?.useOnlineCover,
            cached: song ? await hasCachedCover(`cover_local_${song.id}`) : false,
            nativeFile: Boolean(song?.nativeFileUrl), playing: Boolean(usePlaybackStore.getState().currentSong),
            lyrics: song?.localLyricsContent, title: song?.title };
    });
    await expect.poll(snapshot).toMatchObject({ cover: '/__mock_covers__/matched.png', selected: true, cached: true,
        nativeFile: false, playing: false, title: 'Midnight Train', lyrics: expect.stringContaining('Leaves the station') });
    await expect(page.locator('img[src*="__mock_covers__"]').first()).toBeVisible();
    await expect.poll(() => page.locator('img[src*="__mock_covers__"]').first()
        .evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
    expect(searches).toBeGreaterThan(0);
    const countBeforeReload = searches;
    await page.reload();
    await page.getByRole('button', { name: 'Folder' }).last().click();
    await expect(page.locator('img[src*="__mock_covers__"]').first()).toBeVisible();
    await expect.poll(snapshot).toMatchObject({ selected: true, cached: true });
    expect(searches).toBe(countBeforeReload);
});

test('repairs the existing Hotel California row with a broken cover and an old false cover flag', async ({ page }) => {
    await installBaseState(page, { neteaseMode: 'guest' });
    await page.addInitScript(() => {
        (window as unknown as { __appModule: (path: string) => Promise<any> }).__appModule = path => import(/* @vite-ignore */ path);
    });
    await mockNeteaseApi(page, 'guest');
    let searchedTitle = '';
    await page.route('**/__mock_netease__/cloudsearch?**', async route => {
        const input = new URL(route.request().url());
        searchedTitle = input.searchParams.get('keywords') || '';
        if (process.env.FOLIA_LIVE_COVER_TEST === '1') {
            const target = new URL(input.pathname.replace('/__mock_netease__', '') + input.search, 'http://106.14.205.179:1000');
            const upstream = await route.fetch({ url: target.href });
            await route.fulfill({ response: upstream });
        } else {
            await route.fulfill({ json: { code: 200, result: { songCount: 1, songs: [{ id: 26289183, name: 'Hotel California',
                ar: [{ id: 1, name: 'Eagles' }], al: { id: 2446101, name: 'Hotel California', picUrl: '/__mock_covers__/hotel.svg' }, dt: 391000 }] } } });
        }
    });
    await page.route('**/__mock_covers__/hotel.svg', route => route.fulfill({ contentType: 'image/svg+xml',
        body: '<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><rect width="128" height="128" fill="#795537"/></svg>' }));
    await openApp(page);
    await page.evaluate(async () => {
        const load = (window as unknown as { __appModule: (path: string) => Promise<any> }).__appModule;
        const { assignImportedSongs } = await load('/src/services/localLibraryCatalogService.ts');
        await assignImportedSongs([{ id: 'hotel-legacy', fileName: 'Eagles - Hotel California.flac',
            filePath: 'HarmonyOS/Eagles - Hotel California.flac', folderName: 'HarmonyOS',
            title: 'Hotel California', titleOrigin: 'import',
            importedMetadata: { title: 'Hotel California', titleSource: 'embedded', artistNames: ['Eagles'], albumName: 'Hotel California' },
            duration: 391000, addedAt: 1, fileSize: 1, mimeType: 'audio/flac', noAutoMatch: false, useOnlineCover: false,
            localCoverAssetId: `sha256:${'c'.repeat(64)}` }]);
        window.dispatchEvent(new CustomEvent('folia-local-music-updated'));
    });
    await page.getByRole('button', { name: 'Folder' }).last().click();
    await expect.poll(() => page.evaluate(async () => {
        const load = (window as unknown as { __appModule: (path: string) => Promise<any> }).__appModule;
        const { getLocalSong } = await load('/src/services/db.ts');
        const song = await getLocalSong('hotel-legacy');
        return Boolean(song?.useOnlineCover && song?.onlineMetadata?.coverUrl);
    }), { timeout: 45000 }).toBe(true);
    expect(searchedTitle).toBe('Hotel California');
    const images = page.locator('img');
    await expect.poll(() => images.evaluateAll(nodes => nodes.some(node => {
        const image = node as HTMLImageElement;
        return (image.src.includes('126.net') || image.src.includes('__mock_covers__/hotel')) && image.complete && image.naturalWidth > 0;
    }))).toBe(true);
    await page.screenshot({ path: '../../verification/hotel-cover-20261020.png' });
    await page.getByText('All Songs', { exact: true }).first().click();
    await expect(page.getByText('Hotel California', { exact: true }).first()).toBeVisible();
    await expect.poll(() => page.locator('[data-library-renderer="grid"] [data-folia-grid-item-id] img').evaluateAll(nodes => nodes.some(node => {
        const image = node as HTMLImageElement;
        return (image.src.includes('126.net') || image.src.includes('__mock_covers__/hotel')) && image.complete && image.naturalWidth > 0;
    }))).toBe(true);
    const trackCover = page.locator('[data-library-renderer="grid"] [data-folia-grid-item-id] img').first();
    await expect(trackCover).toHaveCSS('opacity', '1');
    await expect(trackCover.locator('xpath=following-sibling::*[1]')).toBeHidden();
    await page.screenshot({ path: '../../verification/hotel-cover-track-20261020.png' });
});
