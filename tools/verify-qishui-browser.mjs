import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { chromium } from '../upstream/folia-major/node_modules/playwright-core/index.mjs';
import { createHarness } from './qishui/verificationHarness.mjs';
import { makeAudioFixture } from './qishui/audioFixture.mjs';

// Run the shipped renderer, Omni/account controller and generated native protocol together.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const assets = path.join(root, 'entry/src/main/resources/rawfile/folia');
const evidence = path.resolve(root, process.argv[2] || 'verification/qishui-20261025');
const api = createHarness();
api.state.extraTrack = true;
const operations = [], errors = [];
const server = http.createServer((req, res) => {
  const file = path.resolve(assets, decodeURIComponent(new URL(req.url, 'http://localhost').pathname).slice(1));
  if (!file.startsWith(assets + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' }[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true,
  args: ['--autoplay-policy=no-user-gesture-required'] });
try {
  const page = await browser.newPage({ viewport: { width: 1000, height: 800 }, serviceWorkers: 'block' });
  page.setDefaultTimeout(25000);
  const audio = makeAudioFixture();
  await page.route('https://verification.douyinvod.com/**', async route => {
    const range = route.request().headers().range?.match(/bytes=(\d+)-(\d*)/);
    const start = range ? Number(range[1]) : 0, end = range?.[2] ? Math.min(Number(range[2]), audio.length - 1) : audio.length - 1;
    await route.fulfill({ status: range ? 206 : 200, contentType: 'audio/wav', body: audio.subarray(start, end + 1),
      headers: { 'access-control-allow-origin': '*', 'accept-ranges': 'bytes',
        ...(range ? { 'content-range': `bytes ${start}-${end}/${audio.length}` } : {}) } });
  });
  page.on('pageerror', error => errors.push(error.message));
  await page.exposeFunction('__nativeQishui', async (operation, payload) => { operations.push(operation); return JSON.stringify(await api.request(operation, JSON.parse(payload))); });
  await page.addInitScript(() => {
    if (!sessionStorage.getItem('qishui-seeded')) {
      localStorage.clear(); localStorage.setItem('active_online_provider_id', 'qishui');
      localStorage.setItem('i18nextLng', 'zh-CN'); localStorage.setItem('folia_app_language', 'zh-CN');
      localStorage.setItem('folia_last_seen_ponder_onboarding_version', '0.7.17');
      localStorage.setItem('static_mode', 'true'); sessionStorage.setItem('qishui-seeded', 'true');
    }
    window.__snapshots = [];
    window.FoliaNative = {
      getConfig: () => JSON.stringify({ netease: '', qq: '', kugou: '', server: '', aiProvider: 'gemini' }),
      getPortraitMode: () => false, getFiles: () => '[]', toast: () => {}, openExternal: () => {},
      publish: payload => window.__snapshots.push({ ...window.__snapshots.at(-1), ...JSON.parse(payload) }),
      requestBackend: (id, payload) => {
        (window.__backendRequests ||= []).push(JSON.parse(payload));
        window.HarmonyBackend.receive(id, JSON.stringify({ status: 503, body: '', error: 'verification offline' }));
      },
      requestQishui: (id, operation, payload) => { void window.__nativeQishui(operation, payload).then(reply => window.HarmonyQishui.receive(id, reply)); },
    };
  });
  await page.goto(`http://127.0.0.1:${server.address().port}/harmony.html`);
  await page.waitForFunction(() => window.__snapshots.at(-1)?.ready);
  const open = () => page.getByRole('button', { name: '切换在线音乐平台', exact: true }).click();
  await open();
  const login = page.getByTestId('login-window');
  await login.locator('[data-row="qishui"]').waitFor();
  await login.locator('.login-code').waitFor();
  assert.match(await login.locator('.login-code').getAttribute('src'), /^data:image\/png;base64,/);
  assert.ok((await login.innerText()).includes('请使用抖音 App 扫码并确认授权'));
  await page.screenshot({ path: path.join(evidence, 'login-wide.png') });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);
  assert.equal(await login.getByTestId('login-platforms').getAttribute('data-orientation'), 'row');
  const bounds = await login.boundingBox(); assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= 390);
  await page.screenshot({ path: path.join(evidence, 'login-phone.png') });
  api.state.qr = 'confirmed';
  const success = page.getByTestId('login-success');
  await success.getByText('汽水测试账号', { exact: true }).waitFor();
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(evidence, 'login-success-phone.png') });
  await page.getByTestId('login-success-flight').waitFor({ state: 'visible' });
  await page.screenshot({ path: path.join(evidence, 'login-success-flight-phone.png') });
  await page.getByTestId('login-success-flight').waitFor({ state: 'detached' });
  await login.waitFor({ state: 'detached' });
  assert.equal(await page.locator('[data-login-pill="qishui"]').evaluate(node => getComputedStyle(node).opacity), '1');
  assert.ok(api.state.stored);
  await page.waitForFunction(() => document.body.innerText.includes('汽水测试歌单'), { timeout: 20000 });
  assert.ok(operations.includes('user_playlists'));
  await page.screenshot({ path: path.join(evidence, 'library-phone.png') });
  console.log('Login and library passed; starting playback checks');
  const command = payload => page.evaluate(input => window.HarmonyApp.command(JSON.stringify(input)), payload);
  const trackReads = () => operations.filter(operation => operation === 'playlist_tracks').length;
  const enterLiked = async () => {
    await page.getByText('我喜欢', { exact: true }).first().click();
    // The first tap may only center the 3D card; a second tap opens the focused card.
    await page.waitForTimeout(700);
    if (!await page.locator('[data-library-renderer="grid"]').isVisible()) {
      await page.getByText('我喜欢', { exact: true }).first().click();
    }
    await page.locator('[data-library-renderer="grid"]').waitFor();
    await page.getByText('汽水测试歌曲', { exact: true }).first().waitFor();
    await page.waitForTimeout(400);
  };
  const leaveLiked = async () => {
    await page.locator('[data-library-renderer="grid"] button[data-harmony-window-toolbar]')
      .filter({ has: page.locator('svg.lucide-chevron-left') }).click();
    await page.locator('[data-library-renderer="grid"]').waitFor({ state: 'hidden' });
    await page.waitForTimeout(400);
  };
  await enterLiked();
  const firstLikedReads = trackReads();
  assert.ok(firstLikedReads > 0);
  await leaveLiked();
  await enterLiked();
  assert.equal(trackReads(), firstLikedReads, 'Reopening the liked list must reuse its loaded tracks');
  await leaveLiked();
  api.reopen();
  await page.reload();
  await page.waitForFunction(() => window.__snapshots.at(-1)?.ready);
  await page.getByText('汽水测试歌单', { exact: true }).first().waitFor();
  await enterLiked();
  assert.equal(trackReads(), firstLikedReads, 'A renderer/native restart must restore the persisted track cache');
  await page.screenshot({ path: path.join(evidence, 'liked-cache-restored-phone.png') });
  await leaveLiked();
  console.log('Liked-list memory and persisted cache passed');
  const search = page.getByRole('textbox').first();
  await search.fill('汽水测试'); await search.press('Enter');
  await page.waitForFunction(() => window.__snapshots.at(-1)?.results?.length === 2);
  console.log('Search passed');
  const results = await page.evaluate(() => window.__snapshots.at(-1).results);
  assert.ok(results.every(song => song.id.includes('qishui')));
  const searchCount = operations.filter(operation => operation === 'search').length;
  await command({ action: 'search', query: '汽水原生搜索', source: 'qishui' });
  await page.waitForFunction(() => !window.__snapshots.at(-1)?.searching && window.__snapshots.at(-1)?.results?.length === 2);
  assert.ok(operations.filter(operation => operation === 'search').length > searchCount);
  const addButtons = page.locator('button[title="加入播放队列"]');
  await addButtons.nth(0).click(); await addButtons.nth(1).click();
  await page.getByRole('button', { name: '播放歌曲', exact: true }).first().click();
  console.log('Play request submitted');
  await page.waitForFunction(() => window.__snapshots.at(-1)?.playing && window.__snapshots.at(-1).position > 0.5);
  await page.waitForFunction(() => window.__snapshots.at(-1)?.lyricLines === 2);
  assert.equal(await page.evaluate(() => window.__snapshots.at(-1).duration), 60);
  await command({ action: 'pause' });
  await page.waitForFunction(() => !window.__snapshots.at(-1)?.playing);
  await command({ action: 'seek', id: '15000' });
  await page.waitForFunction(() => Math.abs(window.__snapshots.at(-1).position - 15) < 1);
  await command({ action: 'play' });
  await page.waitForFunction(() => window.__snapshots.at(-1)?.playing && window.__snapshots.at(-1).position > 15.3);
  await command({ action: 'next' });
  await page.waitForFunction(() => window.__snapshots.at(-1)?.title === '汽水下一首' && window.__snapshots.at(-1).playing);
  await page.waitForFunction(() => [...document.querySelectorAll('audio')].some(audio => audio.currentSrc.includes('9876543210123456790') && audio.currentTime > 2));
  await page.screenshot({ path: path.join(evidence, 'playback-phone.png') });
  await page.mouse.move(340, 790);
  await page.getByTestId('panel-toggle').click();
  const panel = page.getByTestId('unified-panel-surface');
  await panel.locator('button[title="歌词"]').click();
  await panel.getByText('汽水音乐', { exact: true }).waitFor();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(evidence, 'qishui-lyric-source-phone.png') });
  const heart = panel.getByTestId('panel-song-header').locator('button[aria-pressed]');
  await heart.click();
  await panel.locator('[data-testid="panel-song-header"] button[aria-pressed="true"]').waitFor();
  assert.ok(api.state.liked.has('9876543210123456790'));
  await heart.click();
  await panel.locator('[data-testid="panel-song-header"] button[aria-pressed="false"]').waitFor();
  assert.ok(!api.state.liked.has('9876543210123456790'));
  await page.getByTestId('panel-toggle').click();
  const playbackBackend = await page.evaluate(() => window.__backendRequests || []);
  assert.ok(!playbackBackend.some(input => /\/(?:lyric|search)(?:[/?]|$)/i.test(input.url || '')),
    'Native Qishui lyrics must not be replaced through other providers');
  await command({ action: 'pause' }); await command({ action: 'home' });
  await enterLiked();
  assert.ok(trackReads() > firstLikedReads, 'A successful like/unlike must invalidate the old liked-list cache');
  await leaveLiked();
  await page.getByRole('button', { name: '电台', exact: true }).click();
  await page.getByText('汽水放松', { exact: true }).first().click();
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => window.__snapshots.at(-1)?.playing);
  assert.ok(api.state.calls.some(input => new URL(input.url).pathname.endsWith('/feed/song-tab/')
    && JSON.parse(input.body).feed_preference?.scene_mode_id === 12345));
  await page.screenshot({ path: path.join(evidence, 'scene-radio-phone.png') });
  await command({ action: 'pause' }); await command({ action: 'home' });
  api.reopen();
  await page.reload();
  await page.waitForFunction(() => window.__snapshots.at(-1)?.ready);
  await open();
  await login.getByText('汽水测试账号', { exact: true }).first().waitFor();
  await login.getByRole('button', { name: '退出登录', exact: true }).click();
  await login.getByRole('button', { name: '退出登录', exact: true }).waitFor({ state: 'hidden' });
  assert.equal(api.state.stored, '');
  const storage = await page.evaluate(() => JSON.stringify({ ...localStorage }));
  assert.ok(!/synthetic-(?:ticket|access|ts-sign|qr-token)|BEGIN PRIVATE KEY/.test(storage));
  assert.deepEqual(errors, []);
  const backend = await page.evaluate(() => window.__backendRequests || []);
  assert.ok(!backend.some(input => /\/(?:lyric|search)(?:[/?]|$)/i.test(input.url || '')),
    'Qishui native lyrics must not trigger alternative lyric/search API requests');
  const checks = { passed: true, checks: ['Production login entry', 'Douyin QR instructions and image', 'Phone horizontal platform list',
    'Successful QR login plays the upstream completion overlay', 'Avatar flight finishes and restores the account button',
    'Confirmation and account library via Omni', 'UI and native search return two source-aware tracks', 'Actual audio clock and duration',
    'KRC lyric parsing', 'Qishui lyric source label in actual playback panel', 'No alternative lyric requests for native Qishui lyrics',
    'Pause and resume', 'Seek to 15 seconds', 'Next track plays',
    'Qishui scene radio card requests its numeric scene and plays',
    'Production panel like and unlike reach the Qishui account and update the heart',
    'Reopening liked list reuses loaded tracks', 'Renderer/native restart restores persisted liked-list cache',
    'Successful like/unlike invalidates liked-list cache',
    'Reopening restores account', 'Logout clears session', 'No credentials in renderer storage'],
    limitation: 'Chrome with actual generated native protocol, synthetic upstream and Node crypto. Real HarmonyOS account authorization remains unverified.' };
  fs.writeFileSync(path.join(evidence, 'browser-checks.json'), JSON.stringify(checks, null, 2));
  console.log(JSON.stringify(checks));
} catch (error) {
  const pages = browser.contexts().flatMap(context => context.pages());
  if (pages[0]) { await pages[0].screenshot({ path: path.join(evidence, 'browser-failure.png') });
    fs.writeFileSync(path.join(evidence, 'browser-failure.txt'), await pages[0].locator('body').innerText());
    fs.writeFileSync(path.join(evidence, 'browser-debug.json'), JSON.stringify({ operations, errors,
      snapshots: await pages[0].evaluate(() => window.__snapshots.slice(-3)),
      audio: await pages[0].locator('audio').evaluateAll(elements => elements.map(el => ({ src: el.src, time: el.currentTime, duration: el.duration, paused: el.paused, error: el.error?.code }))) }, null, 2)); }
  throw error;
} finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
