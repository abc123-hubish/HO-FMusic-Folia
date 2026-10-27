import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { stripTypeScriptTypes } from 'node:module';
import { test } from 'node:test';

// Run the actual ArkTS policy and service with synthetic network, version and preference hosts.
function compile(name) {
  const source = fs.readFileSync(new URL(`../entry/src/main/ets/services/${name}.ets`, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from\s+['"][^'"]+['"];\r?\n/gm, '');
  return stripTypeScriptTypes(source, { mode: 'transform' }).replace(/^export /gm, '');
}
const code = compile('AnnouncementPolicy') + '\n' + compile('AnnouncementService');
const item = (priority, content, extra = {}) => ({ id: String(priority), title: '更新公告', content,
  priority, created_at: '2026-10-17T10:00:00Z', status: 1, ...extra });
const rules = mode => item(10, `//强制提醒\n//强制关闭\n//不强制\n\n当前为//${mode}`);
const data = mode => [rules(mode), item(1, '本次更新内容：\n-优化登录'),
  item(0, '其他用途的内容'), item(11, '应用推荐内容')];
const response = items => ({ responseCode: 200, result: JSON.stringify({ code: 0, data: items }) });

function host(options = {}) {
  const state = { versionName: '1.1.2', versionCode: 1010002, calls: [], destroyed: 0,
    failFlush: false, prefs: new Map(), ...options };
  const pref = {
    getSync: (key, fallback) => state.prefs.get(key) ?? fallback,
    putSync: (key, value) => state.prefs.set(key, value),
    flushSync: () => { if (state.failFlush) throw new Error('disk full'); }
  };
  const context = vm.createContext({
    bundleManager: { BundleFlag: { GET_BUNDLE_INFO_DEFAULT: 0 }, getBundleInfoForSelfSync: () => state },
    preferences: { getPreferencesSync: () => pref },
    http: { RequestMethod: { GET: 'GET' }, HttpDataType: { STRING: 'string' }, createHttp: () => {
      if (state.failCreate) throw new Error('network unavailable');
      return {
        request: async (url, requestOptions) => {
          state.calls.push({ url, ...requestOptions });
          return state.respond ? state.respond() : response(data('不强制'));
        },
        destroy: () => { state.destroyed++; }
      };
    } },
    hilog: { warn: () => {} }
  });
  const api = vm.runInContext(code + '\n({ AnnouncementService, parseAnnouncementMode, buildAnnouncementPresentation });', context);
  return { ...api, state, service: () => new api.AnnouncementService({}) };
}

test('explicit current mode overrides the three command examples', () => {
  const api = host();
  assert.equal(api.parseAnnouncementMode(rules('强制提醒').content), 'force');
  assert.equal(api.parseAnnouncementMode(rules('强制关闭').content), 'closed');
  assert.equal(api.parseAnnouncementMode(rules('不强制').content), 'normal');
  assert.equal(api.parseAnnouncementMode('当前模式：//不强制'), 'normal');
});

test('standalone close wins conflicts and unknown or missing rules stay closed', () => {
  const api = host();
  assert.equal(api.parseAnnouncementMode('//强制关闭\n//强制提醒'), 'closed');
  assert.equal(api.parseAnnouncementMode('//强制提醒'), 'force');
  assert.equal(api.parseAnnouncementMode('//不强制'), 'normal');
  assert.equal(api.parseAnnouncementMode('未知设置'), 'closed');
  assert.equal(api.buildAnnouncementPresentation([item(1, '正文')], '1', ''), null);
});

test('only enabled priority 1 content is shown, with control markers removed', () => {
  const api = host();
  const result = api.buildAnnouncementPresentation([...data('不强制'),
    item(1, '禁用内容', { status: 0 }), item(1, '   ', { title: '   ' }), null], '1', '');
  assert.equal(result.title, '更新公告');
  assert.equal(result.message, '本次更新内容：\n-优化登录');
  const marked = api.buildAnnouncementPresentation([rules('不强制'), item(1, '//提醒\n正文')], '1', '');
  assert.equal(marked.message, '正文');
});

test('newest enabled reminder rule wins even if API records are unsorted', () => {
  const api = host();
  const items = [rules('强制关闭'), item(1, '正文'),
    item(10, '//不强制', { updated_at: '2026-10-17T11:00:00Z' }),
    item(10, '//强制关闭', { updated_at: '2026-10-17T12:00:00Z', status: 0 })];
  assert.equal(api.buildAnnouncementPresentation(items, '1', '').message, '正文');
});

test('multiple announcements keep titles, dates and most recent content first', () => {
  const api = host();
  const result = api.buildAnnouncementPresentation([rules('不强制'),
    item(1, '旧正文', { title: '旧公告' }),
    item(1, '新正文', { title: '新公告', created_at: '2026-10-18T10:00:00Z' })], '1', '');
  assert.equal(result.title, '公告');
  assert.ok(result.message.indexOf('新公告') < result.message.indexOf('旧公告'));
  assert.match(result.message, /2026-10-18/);
});

test('normal honors the muted version, FORCE overrides it, CLOSED always suppresses', () => {
  const api = host();
  assert.equal(api.buildAnnouncementPresentation(data('不强制'), '1', '1'), null);
  assert.ok(api.buildAnnouncementPresentation(data('不强制'), '2', '1'));
  assert.ok(api.buildAnnouncementPresentation(data('强制提醒'), '1', '1'));
  assert.equal(api.buildAnnouncementPresentation(data('强制关闭'), '2', '1'), null);
  assert.equal(api.buildAnnouncementPresentation([rules('强制提醒')], '1', ''), null);
});

test('native request uses the specified software ID and runs once per service', async () => {
  const api = host();
  const service = api.service();
  assert.equal((await service.check()).version, '1.1.2(1010002)');
  assert.equal(await service.check(), null);
  assert.equal(api.state.calls.length, 1);
  assert.equal(api.state.calls[0].url, 'https://api.xxauth.com/open/v1/announcements');
  assert.equal(api.state.calls[0].header.app_id, 'b4f32302-28d0-4062-a0de-380662fa3f70');
  assert.equal(api.state.calls[0].usingCache, false);
  assert.equal(api.state.destroyed, 1);
});

test('update reminder survives a service restart and resets for version name or code changes', async () => {
  const api = host();
  const first = api.service();
  const announcement = await first.check();
  assert.equal(first.remindAfterUpdate(announcement.version), true);
  assert.equal(await api.service().check(), null);
  api.state.versionCode++;
  assert.ok(await api.service().check());
  api.state.versionCode--;
  api.state.versionName = '1.1.3';
  assert.ok(await api.service().check());
});

test('remote FORCE and CLOSED are fetched even when the current version is muted', async () => {
  const api = host();
  api.state.prefs.set('muted_version', '1.1.2(1010002)');
  api.state.respond = () => response(data('强制提醒'));
  assert.ok(await api.service().check());
  api.state.respond = () => response(data('强制关闭'));
  assert.equal(await api.service().check(), null);
  assert.equal(api.state.calls.length, 2);
});

test('network and malformed responses fail quietly and free each request', async () => {
  const api = host();
  const badResponses = [
    () => { throw new Error('offline'); },
    () => ({ responseCode: 503, result: '{}' }),
    () => ({ responseCode: 200, result: '{' }),
    () => ({ responseCode: 200, result: JSON.stringify({ code: 1, data: [] }) }),
    () => ({ responseCode: 200, result: JSON.stringify({ code: 0, data: {} }) })
  ];
  for (const respond of badResponses) {
    api.state.respond = respond;
    assert.equal(await api.service().check(), null);
  }
  assert.equal(api.state.destroyed, badResponses.length);
  api.state.failCreate = true;
  assert.equal(await api.service().check(), null);
});

test('duplicate checks and release during a pending request never yield a late dialog', async () => {
  let complete;
  const api = host({ respond: () => new Promise(resolve => { complete = resolve; }) });
  const service = api.service();
  const pending = service.check();
  assert.equal(await service.check(), null);
  service.release();
  complete(response(data('强制提醒')));
  assert.equal(await pending, null);
  assert.equal(api.state.calls.length, 1);
  assert.equal(api.state.destroyed, 1);
  assert.equal(await service.check(), null);
});

test('failed persistence reports failure and restores the previous local preference', () => {
  const api = host();
  api.state.prefs.set('muted_version', 'previous');
  api.state.failFlush = true;
  assert.equal(api.service().remindAfterUpdate('current'), false);
  assert.equal(api.state.prefs.get('muted_version'), 'previous');
});
