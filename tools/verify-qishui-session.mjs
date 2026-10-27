import fs from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { stripTypeScriptTypes } from 'node:module';

// Execute the actual encrypted session class against Asset Store's byte limit and failure semantics.
const values = new Map(); let failWrites = false;
const tag = { ALIAS: 'alias', SECRET: 'secret', RETURN_TYPE: 'return', ACCESSIBILITY: 'access', SYNC_TYPE: 'sync' };
const alias = input => Buffer.from(input.get(tag.ALIAS)).toString();
globalThis.__qishuiSessionTest = {
  asset: { Tag: tag, ReturnType: { ALL: 1 }, Accessibility: { DEVICE_FIRST_UNLOCKED: 1 }, SyncType: { NEVER: 0 },
    querySync(query) { return values.has(alias(query)) ? [new Map([[tag.SECRET, values.get(alias(query))]])] : []; },
    addSync(input) {
      if (failWrites || input.get(tag.SECRET).length > 1024) throw new Error('Asset write rejected');
      values.set(alias(input), input.get(tag.SECRET));
    },
    updateSync(query, input) {
      if (!values.has(alias(query))) throw new Error('Missing asset');
      this.addSync(new Map([[tag.ALIAS, query.get(tag.ALIAS)], [tag.SECRET, input.get(tag.SECRET)]]));
    }, removeSync(query) { values.delete(alias(query)); },
  },
  util: { TextEncoder: class { encodeInto(value) { return new TextEncoder().encode(value); } },
    TextDecoder: class { decodeToString(value) { return new TextDecoder().decode(value); } },
    Base64Helper: class {
      encodeToStringSync(value) { if (!value.length) throw new Error('Empty buffer'); return Buffer.from(value).toString('base64'); }
      decodeSync(value) { if (!value.length) throw new Error('Empty value'); return new Uint8Array(Buffer.from(value, 'base64')); }
    } },
};
const source = fs.readFileSync('entry/src/main/ets/services/music/MusicSession.ets', 'utf8')
  .replace(/import \{ (asset|util) \} from '[^']+';/g, 'const { $1 } = globalThis.__qishuiSessionTest;');
const compiled = stripTypeScriptTypes(source);
const { MusicSession } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
test('long Chinese account snapshots round-trip within the 1024-byte Asset Store limit', () => {
  values.clear(); const saved = JSON.stringify({ ticket: 'x'.repeat(4000), guardCert: 'y'.repeat(3000), user: '汽水账号'.repeat(300) });
  const session = new MusicSession('qishui'); session.write(saved);
  assert.ok([...values.values()].every(value => value.length <= 1024));
  assert.equal(new MusicSession('qishui').read(), saved);
  session.write(''); assert.equal(new MusicSession('qishui').read(), '');
});
test('an encrypted-write failure invalidates the older saved account and retains only memory', () => {
  values.clear(); const session = new MusicSession('qishui'); session.write('{"user":"old"}');
  failWrites = true; session.write('{"user":"new"}'); failWrites = false;
  assert.equal(session.read(), '{"user":"new"}'); assert.equal(new MusicSession('qishui').read(), '');
});
