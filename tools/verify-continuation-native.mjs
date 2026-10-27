import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { stripTypeScriptTypes } from 'node:module';

// tools/verify-continuation-native.mjs
// Run the real native continuation coordinator with deterministic system calls and timeout races.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = fs.readFileSync(path.join(root, 'entry/src/main/ets/services/AppContinuation.ets'), 'utf8');
const code = stripTypeScriptTypes(source, { mode: 'transform' })
  .replace(/^import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"];?/gm,
    (_match, bindings, name) => `const {${bindings}} = require(${JSON.stringify(name)});`)
  .replace(/^export class /gm, 'class ') + '\nmodule.exports = AppContinuation;';
const constants = { OnContinueResult: { AGREE: 0, REJECT: 1 }, ContinueState: { ACTIVE: 0, INACTIVE: 1 } };
const Params = { SUPPORT_CONTINUE_PAGE_STACK_KEY: 'stack', SUPPORT_CONTINUE_SOURCE_EXIT_KEY: 'exit' };
const payload = JSON.stringify({ schemaVersion: 1, transferId: 'transfer-1', queue: [], positionSec: 12 });
function harness() {
  const timers = new Map(); const states = []; let revision = 0;
  const module = { exports: {} };
  const mocks = {
    '@kit.AbilityKit': { AbilityConstant: constants, wantConstant: { Params } },
    '@kit.ArkTS': { util: { generateRandomUUID: () => `request-${++revision}`,
      TextEncoder: class { encodeInto(value) { return new TextEncoder().encode(value); } } } },
    '@kit.PerformanceAnalysisKit': { hilog: { warn() {} } },
  };
  vm.runInNewContext(code, { module, require: name => mocks[name],
    setTimeout: callback => { const id = ++revision; timers.set(id, callback); return id; },
    clearTimeout: id => timers.delete(id) });
  const service = module.exports;
  const context = { setMissionContinueState: async state => states.push(state) };
  return { service, timers, states, context };
}
const checks = [];
{
  const { service, context } = harness();
  service.attach(context, request => service.finishExport(request, payload));
  assert.equal(await service.save({}), constants.OnContinueResult.REJECT);
  service.setAvailable(true);
  const want = {}; assert.equal(await service.save(want), constants.OnContinueResult.AGREE);
  assert.equal(want['folia.continuation.v1'], payload); assert.equal(want.stack, false); assert.equal(want.exit, true);
  checks.push('Only ready playback exports; manual Web navigation and successful source exit are requested');
}
{
  const { service, context, timers } = harness(); let requested;
  service.attach(context, request => { requested = request; }); service.setAvailable(true);
  const pending = service.save({});
  assert.equal(await service.save({}), constants.OnContinueResult.REJECT);
  service.finishExport('wrong-request', payload);
  assert.equal(timers.size, 1);
  [...timers.values()][0](); assert.equal(await pending, constants.OnContinueResult.REJECT);
  const oldRequest = requested;
  service.finishExport(requested, payload);
  const fresh = {}; const next = service.save(fresh); service.finishExport('wrong-request', payload);
  service.finishExport(oldRequest, payload);
  assert.equal(timers.size, 1);
  service.finishExport(requested, payload); assert.equal(await next, constants.OnContinueResult.AGREE);
  checks.push('Timeouts and concurrent exports reject; stale response IDs cannot complete a later export');
}
{
  const { service, context } = harness();
  service.attach(context, request => service.finishExport(request, '歌'.repeat(30_000))); service.setAvailable(true);
  assert.equal(await service.save({}), constants.OnContinueResult.REJECT);
  service.attach(context, request => service.finishExport(request, '{"schemaVersion":2,"transferId":"x"}'));
  service.setAvailable(true); assert.equal(await service.save({}), constants.OnContinueResult.REJECT);
  checks.push('UTF-8 oversize and unknown schema exports are rejected');
}
{
  const { service } = harness();
  assert.equal(service.receive({ parameters: { 'folia.continuation.v1': payload } }), true);
  assert.equal(service.getPending(), payload);
  service.acknowledge('unrelated'); assert.equal(service.getPending(), payload);
  service.acknowledge(payload); assert.equal(service.getPending(), '');
  assert.equal(service.receive({ parameters: { 'folia.continuation.v1': payload } }), false);
  service.receive({}); assert.equal(service.getPending(), '{}');
  checks.push('Cold/hot launch payload persists until exact acknowledgement; duplicate Want is ignored');
}
{
  const { service, context } = harness();
  const oldExporter = () => {};
  const exporter = request => service.finishExport(request, payload);
  service.attach(context, oldExporter); service.attach(context, exporter); service.setAvailable(true);
  service.setHostAvailable(oldExporter, false);
  service.detach(oldExporter); assert.equal(await service.save({}), constants.OnContinueResult.AGREE);
  service.detach(exporter); assert.equal(await service.save({}), constants.OnContinueResult.REJECT);
  service.attach(context, oldExporter); service.setAvailable(true);
  const abandoned = service.save({}); service.attach(context, exporter);
  assert.equal(await abandoned, constants.OnContinueResult.REJECT);
  checks.push('A destroyed old Web host cannot detach a newer host');
}
console.log(JSON.stringify({ passed: checks.length, checks }, null, 2));
