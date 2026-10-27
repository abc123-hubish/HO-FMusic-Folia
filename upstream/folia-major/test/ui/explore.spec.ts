import { expect, test, type Page } from '@playwright/test';
import { installBaseState, mockNeteaseApi, openApp, svgDataUrl } from './helpers/appFixtures';

// Exercise the real Home/Omni/collection/history path with deterministic Explore catalogue data.
const cover = svgDataUrl('Explore', '#735c8e');
const song = { id: 8101, name: 'Explore song', ar: [{ id: 81, name: 'Explore artist' }],
  al: { id: 8201, name: 'Explore album', picUrl: cover }, dt: 120000 };
const playlist = { id: 9001, name: 'Explore playlist', coverImgUrl: cover, trackCount: 2 };

/** Add Explore responses on top of the repository's existing account/library fixture. */
async function prepare(page: Page, suite: 'grid' | 'bravais') {
  await installBaseState(page, { neteaseMode: 'logged-in', navidromeEnabled: false, preserveNativeMediaQueries: true });
  await page.addInitScript(suiteId => {
    localStorage.setItem('library_suite', suiteId);
    localStorage.setItem('last_home_view_tab', 'playlist');
    localStorage.setItem('library_wall_initial_entry', 'seam');
    localStorage.setItem('library_wall_seam_clear', 'false');
  }, suite);
  await mockNeteaseApi(page, 'logged-in');
  await page.route('**/__mock_netease__/**', async route => {
    const path = new URL(route.request().url()).pathname.replace('/__mock_netease__', '');
    const rows = [
      { blockCode: 'EXPLORE_PLAYLISTS', uiElement: { subTitle: { title: 'Explore playlists' } }, creatives: [{ resources: [
        { resourceType: 'list', resourceId: playlist.id, uiElement: { mainTitle: { title: playlist.name }, image: { imageUrl: cover } } },
      ] }] },
      { blockCode: 'EXPLORE_ALBUMS', uiElement: { subTitle: { title: 'Explore albums' } }, creatives: [{ resources: [
        { resourceType: 'album', resourceId: 8201, uiElement: { mainTitle: { title: 'Explore album' }, image: { imageUrl: cover } } },
      ] }] },
      { blockCode: 'EXPLORE_SONGS', uiElement: { subTitle: { title: 'Explore songs' } }, creatives: [{ resources: [
        { resourceType: 'song', resourceExtInfo: { songData: song } },
      ] }] },
    ];
    const responses: Record<string, unknown> = {
      '/homepage/block/page': { code: 200, data: { blocks: rows, hasMore: false } },
      '/toplist': { code: 200, list: [{ ...playlist, updateFrequency: 'Daily' }] },
      '/recommend/songs': { code: 200, data: { dailySongs: [] } },
      '/recommend/resource': { code: 200, recommend: [] },
      '/top/song': { code: 200, data: [song] },
      '/album/new': { code: 200, albums: [{ id: 8201, name: 'Explore album', picUrl: cover, artists: song.ar }], total: 1 },
      '/top/playlist': { code: 200, playlists: [playlist], more: false },
      '/playlist/detail': { code: 200, playlist: { ...playlist, tracks: [song], trackIds: [{ id: song.id }] } },
      '/playlist/track/all': { code: 200, songs: [song], more: false },
      '/album': { code: 200, album: { id: 8201, name: 'Explore album', picUrl: cover }, songs: [song] },
      '/simi/song': { code: 200, songs: [song] },
    };
    if (!(path in responses)) return route.fallback();
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(responses[path]) });
  });
  await openApp(page);
  await page.getByRole(suite === 'bravais' ? 'tab' : 'button', { name: 'Explore', exact: true }).first().click();
}

test('grid Explore opens collections and restores the same feed on Back', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await prepare(page, 'grid');
  const surface = page.locator('[data-explore-surface]');
  await expect(surface).toBeVisible();
  await expect(surface.getByTitle(playlist.name, { exact: true }).first()).toBeVisible();
  await surface.getByTitle(playlist.name, { exact: true }).first().click();
  await expect(page.locator('[data-library-renderer="grid"]')).toBeVisible();
  await page.goBack();
  await expect(page.locator('[data-explore-surface]')).toBeVisible();
  await expect(page.locator('[data-explore-refresh]')).toBeVisible();
  await page.screenshot({ path: 'D:/folia/verification/explore-0721-20261019/grid-explore.png' });
  expect(errors).toEqual([]);
});

test('Explore Lattice shows collection posters and returns to the selected poster', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await prepare(page, 'grid');
  await expect(page.locator('[data-explore-card]')).not.toHaveCount(0);
  await page.getByTestId('home-lattice-pill').click();
  await expect(page.locator('.lattice-root')).toBeVisible();
  const poster = page.locator('.lattice-poster.is-kind-playlist').first();
  await expect(poster).toBeAttached();
  await poster.evaluate(element => (element as HTMLElement).click());
  await expect(page.locator('.lattice-open-collection')).toBeVisible();
  await page.screenshot({ path: 'D:/folia/verification/explore-0721-20261019/lattice-explore.png' });
  await page.locator('.lattice-open-collection').click();
  await expect(page.locator('[data-library-renderer="grid"]')).toBeVisible();
  await page.goBack();
  await expect(page.locator('.lattice-root')).toBeVisible();
  await expect(page.locator('.lattice-poster.is-expanded.is-kind-playlist')).toBeVisible();
  expect(errors).toEqual([]);
});

test('Bravais Explore projects the same feed into its wall', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await prepare(page, 'bravais');
  await expect(page.locator('[data-library-home="bravais"]')).toBeAttached();
  await expect(page.locator('.bravais-tile[data-library-entry]')).not.toHaveCount(0);
  const stage = page.locator('[data-library-stage="bravais"]');
  await expect(stage).toHaveAttribute('data-bravais-layer', 'home:explore');
  await expect(stage).not.toHaveAttribute('data-bravais-settling', /./);
  await expect(stage).toContainText('Explore playlist');
  await expect.poll(() => stage.locator('.bravais-tile[data-library-entry]').evaluateAll(tiles => tiles.filter(tile => {
    const rect = tile.getBoundingClientRect();
    return rect.right > 0 && rect.bottom > 0 && rect.left < innerWidth && rect.top < innerHeight
      && Number(getComputedStyle(tile).opacity) > 0.9;
  }).length)).toBeGreaterThan(0);
  await page.screenshot({ path: 'D:/folia/verification/explore-0721-20261019/bravais-explore.png' });
  const slot = await stage.locator('.bravais-tile[data-library-card^="collection:playlist:"]').evaluateAll(tiles => tiles.find(tile => {
    const rect = tile.getBoundingClientRect();
    return rect.left >= 0 && rect.right <= innerWidth && rect.top >= 0 && rect.bottom <= innerHeight;
  })?.getAttribute('data-bravais-slot'));
  expect(slot).toBeTruthy();
  await stage.locator(`[data-bravais-slot="${slot}"] article`).click();
  await expect(stage).not.toHaveAttribute('data-bravais-layer', 'home:explore');
  await page.goBack();
  await expect(stage).toHaveAttribute('data-bravais-layer', 'home:explore');
  await expect(stage).not.toHaveAttribute('data-bravais-settling', /./);
  await stage.locator('[data-bravais-seam-action="queue"]').click();
  await expect(page.locator('.lattice-root')).toBeVisible();
  await expect(page.locator('.lattice-poster.is-kind-playlist').first()).toBeAttached();
  expect(errors).toEqual([]);
});

test('Explore preserves recent plays and fits portrait and landscape screens', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await prepare(page, 'grid');
  // Exercise the actual persistence/read path; listening thresholds are covered in recorder unit tests.
  await page.evaluate(async () => {
    const modulePath = '/src/components/app/home/explore/recentPlays.ts';
    const recent = await import(/* @vite-ignore */ modulePath);
    const played = {
      id: '8101', name: 'Previously played song', artists: [{ id: '81', name: 'Explore artist' }],
      album: { id: '8201', name: 'Explore album' }, durationMs: 120000,
      sourceRef: { kind: 'online', providerId: 'netease', mediaId: '8101' },
    };
    recent.noteSongPlayed(played, '1001');
    recent.noteSongListened(played, '1001', 120000, true);
    recent.noteSongListened(played, '1001', 120000, true);
  });
  for (const [name, width, height] of [['portrait', 412, 915], ['landscape', 915, 412]] as const) {
    await page.setViewportSize({ width, height });
    const surface = page.locator('[data-explore-surface]');
    await expect(surface).toBeVisible();
    await expect(surface.getByText('Recently played', { exact: true })).toBeVisible();
    await expect(surface.getByText('Play again', { exact: true })).toBeAttached();
    const box = await surface.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(width + 1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await page.screenshot({ path: `D:/folia/verification/explore-0721-20261019/explore-${name}.png` });
  }
  expect(errors).toEqual([]);
});

test('Harmony phone Explore scales its content and scrolls behind floating controls', async ({ page }) => {
  await prepare(page, 'grid');
  await expect(page.locator('[data-explore-card]')).not.toHaveCount(0);
  await page.evaluate(async () => {
    // Use the shipped Harmony stylesheet with the real home and floating-player components.
    const cssPath = '/src/harmony/mobile.css';
    const feedPath = '/src/stores/useExploreFeedStore.ts';
    const playbackPath = '/src/stores/usePlaybackStore.ts';
    await import(/* @vite-ignore */ cssPath);
    document.documentElement.setAttribute('data-harmony', '');
    const { useExploreFeedStore } = await import(/* @vite-ignore */ feedPath);
    const { usePlaybackStore } = await import(/* @vite-ignore */ playbackPath);
    const feed = useExploreFeedStore.getState().feed;
    const first = feed.sections.find((section: any) => section.items.some((item: any) => item.kind === 'collection'));
    const collection = first.items.find((item: any) => item.kind === 'collection');
    const track = {
      id: '8101', name: 'Layout song', artists: [{ id: '81', name: 'Explore artist' }],
      album: { id: '8201', name: 'Explore album' }, durationMs: 120000,
      sourceRef: { kind: 'online', providerId: 'netease', mediaId: '8101' },
    };
    usePlaybackStore.getState().setCurrentSong(track);
    useExploreFeedStore.setState({ feed: { ...feed, sections: [
      { id: 'layout-songs', title: 'Recommended songs', items: Array.from({ length: 6 }, (_, i) => ({ kind: 'song', song: { ...track, id: String(8101 + i), name: `Layout song ${i}` } })) },
      { ...first, id: 'layout-playlists', title: 'Recommended playlists', items: Array.from({ length: 8 }, (_, i) => ({ ...collection, collection: { ...collection.collection, id: String(9100 + i), name: `Layout playlist ${i}` } })) },
    ] } });
  });
  for (const [name, width, height] of [['portrait', 412, 915], ['landscape', 915, 412], ['desktop', 1440, 1000], ['desktop-compact', 915, 412]] as const) {
    await page.evaluate(isPc => document.documentElement.toggleAttribute('data-harmony-window', isPc), name === 'desktop-compact');
    await page.setViewportSize({ width, height });
    const surface = page.locator('[data-explore-surface]');
    const root = page.locator('[data-ponder-page-scope="grid-page"]');
    await expect.poll(() => root.evaluate(element => getComputedStyle(element).paddingBottom)).toBe('0px');
    const rect = await surface.boundingBox();
    expect(Math.abs(rect!.y + rect!.height - height)).toBeLessThanOrEqual(1);
    const content = page.locator('[data-explore-content]');
    const expectedScale = name.startsWith('desktop') ? 1 : 0.85;
    expect(await content.evaluate(element => Number(getComputedStyle(element).zoom))).toBe(expectedScale);
    const rowCover = surface.locator('[data-explore-place] [data-explore-beat]').first();
    await expect(rowCover).toBeAttached();
    await expect.poll(async () => (await rowCover.boundingBox())!.width).toBeCloseTo(162 * expectedScale, 0);
    const account = await page.getByTestId('online-provider-switcher').boundingBox();
    expect(rect!.y + rect!.height).toBeGreaterThan(account!.y + account!.height);
    await expect(page.locator('[data-ponder="player-bar"]')).toBeVisible();
    expect(await page.getByTestId('online-provider-switcher').evaluate(element => getComputedStyle(element).zoom)).toBe('1');
    expect(await page.locator('[data-ponder="player-bar"]').evaluate(element => getComputedStyle(element).zoom)).toBe('1');
    await surface.evaluate(element => { element.scrollTop = element.scrollHeight; });
    const lastCard = surface.locator('[data-explore-card]').last();
    await expect.poll(async () => (await lastCard.boundingBox())!.y + (await lastCard.boundingBox())!.height).toBeLessThan(height - 90);
    await surface.evaluate(element => { element.scrollTop = (element.scrollHeight - element.clientHeight) * 0.55; });
    // Let the row's reveal/fade finish before recording its backdrop under the controls.
    await page.waitForTimeout(400);
    await page.screenshot({ path: `D:/folia/verification/explore-mobile-layout-20261020/${name}.png` });
  }
});
