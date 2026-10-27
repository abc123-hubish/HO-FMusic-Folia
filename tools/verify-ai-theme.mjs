import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { stripTypeScriptTypes } from 'node:module';

// Verify native persistence and real HTTP request options without using a user's credentials.
const root = path.resolve(import.meta.dirname, '..');
const stored = new Map();
let flushes = 0; let destroyed = 0;
const calls = [];
const prefs = { getSync: (key, fallback) => stored.get(key) ?? fallback,
  putSync: (key, value) => stored.set(key, value), flushSync: () => { flushes++; } };
const imports = { '@kit.AbilityKit': {}, '@kit.ArkData': { preferences: { getPreferencesSync: () => prefs } },
  '@kit.NetworkKit': { http: { RequestMethod: { POST: 'POST' }, HttpDataType: { STRING: 0 }, createHttp: () => ({
    request: async (url, options) => { calls.push({ url, options }); return { responseCode: 401, result: '{"error":"bad key"}', header: { 'content-type': 'application/json' } }; },
    destroy: () => { destroyed++; },
  }) } } };
const source = fs.readFileSync(path.join(root, 'entry/src/main/ets/services/HarmonyAiService.ets'), 'utf8');
const compiled = stripTypeScriptTypes(source, { mode: 'transform' })
  .replace(/^import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"];?/gm,
    (_match, bindings, name) => `const {${bindings}} = require(${JSON.stringify(name)});`)
  .replace(/^export class /gm, 'class ') + '\nexports.HarmonyAiService = HarmonyAiService;';
const exports = {};
vm.runInNewContext(compiled, { exports, require: name => imports[name] });
const service = new exports.HarmonyAiService({});
const config = { ...JSON.parse(service.getConfig()), enabled: true, provider: 'openai', apiUrl: 'https://ai.example/v1', model: 'user-model', apiKey: 'local-key', temperature: '0.7' };
assert.equal(service.saveConfig(JSON.stringify(config)), '');
assert.equal(flushes, 1);
assert.deepEqual(JSON.parse(new exports.HarmonyAiService({}).getConfig()), config);
assert.match(service.saveConfig(JSON.stringify({ ...config, apiKey: '' })), /密钥/);
assert.match(service.saveConfig(JSON.stringify({ ...config, temperature: '3' })), /温度/);
assert.deepEqual(JSON.parse(service.getConfig()), config);
const result = JSON.parse(await service.request(JSON.stringify({ url: 'https://ai.example/v1/chat/completions',
  body: '{"model":"user-model"}', headers: { Authorization: 'Bearer draft-key' }, timeoutMs: 30000 })));
assert.equal(calls[0].options.method, 'POST'); assert.equal(calls[0].options.header.Authorization, 'Bearer draft-key');
assert.equal(calls[0].options.readTimeout, 30000); assert.equal(result.status, 401); assert.equal(result.body, '{"error":"bad key"}');
const invalid = JSON.parse(await service.request(JSON.stringify({ url: 'file:///private', headers: {}, body: '{}' })));
assert.ok(invalid.error); assert.equal(calls.length, 1); assert.equal(destroyed, 2);
console.log('Native AI checks passed: restart persistence, rejected invalid settings, direct HTTP headers, status/body and cleanup.');
