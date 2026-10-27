import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { stripTypeScriptTypes } from 'node:module';

// tools/verify-overall-performance.mjs
// Compare actual before/after native sources with identical synthetic files and system APIs.
const root = 'D:/folia', evidence = `${root}/verification/overall-performance-20261013`;
const checks = [], metrics = {};
const responseClass = class {
  setResponseData(value) { this.data = value; }
  setResponseCode(value) { this.code = value; }
  setReasonMessage(value) { this.reason = value; }
  setResponseMimeType(value) { this.mime = value; }
  setResponseEncoding(value) { this.encoding = value; }
  setResponseHeader(value) { this.headers = value; }
};
function loadService(name, before, mocks) {
  const file = `${before ? `${evidence}/before/native` : root}/entry/src/main/ets/services/${name}.ets`;
  const code = stripTypeScriptTypes(fs.readFileSync(file, 'utf8'), { mode: 'transform' })
    .replace(/^import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"];?/gm,
      (_, bindings, name) => `const {${bindings.replace(/\bas\b/g, ':')}} = require(${JSON.stringify(name)});`)
    .replace(/^export class /gm, 'class ') + `\nmodule.exports.${name} = ${name};`;
  const module = { exports: {} };
  vm.runInNewContext(code, { module, console, require: name => {
    assert(name in mocks, `Unexpected import ${name}`); return mocks[name];
  }, WebResourceResponse: responseClass, setTimeout, clearTimeout });
  return module.exports[name];
}
const normalize = value => JSON.parse(JSON.stringify(value));
const tick = () => new Promise(resolve => setImmediate(resolve));
const deferred = () => { let resolve, reject; const promise = new Promise((a, b) => { resolve = a; reject = b; }); return { promise, resolve, reject }; };
const musicFile = (i, extra = {}) => ({ id: `id-${i}`, name: `Song ${i}.flac`, size: 10000 + i,
  modified: 1000 * (100 + i), mime: 'audio/flac', url: `https://folia.local/native/id-${i}`,
  path: `/sandbox/music/id-${i}.flac`, relativePath: `HarmonyOS/Song ${i}.flac`, ...extra });

function fileHarness(before, initial, selected = []) {
  let counter = 0, nextSelection = selected;
  const descriptors = new Map(), calls = { open: [], copy: [], close: [], unlink: [], saved: [] };
  const io = {
    OpenMode: { READ_ONLY: 0 },
    open: async uri => { const fd = ++counter; descriptors.set(fd, uri); calls.open.push(uri); return { fd }; },
    stat: async fd => { const item = descriptors.get(fd); return { size: item.size, mtime: item.modified / 1000 }; },
    copyFile: async (fd, target) => { calls.copy.push([descriptors.get(fd).name, target]); },
    close: async file => { calls.close.push(file.fd); },
    openSync: target => { calls.open.push(target); return { fd: ++counter }; },
    closeSync: fd => { calls.close.push(typeof fd === 'number' ? fd : fd.fd); },
    unlinkSync: target => { calls.unlink.push(target); },
  };
  const Files = loadService('NativeFileStore', before, {
    '@kit.AbilityKit': {}, '../model/FoliaModel': {},
    '@kit.CoreFileKit': { fileIo: io, fileUri: { FileUri: class { constructor(uri) { this.name = uri.name; } } },
      picker: { DocumentViewPicker: class { async select() { return nextSelection; } }, DocumentSelectOptions: class {} } },
    '@kit.ArkTS': { util: { generateRandomUUID: () => `new-${counter}` } },
    '@kit.ArkData': { preferences: { getPreferencesSync: () => ({ putSync: (_, value) => calls.saved.push(JSON.parse(value)), flush: async () => {} }) } },
  });
  const store = Object.create(Files.prototype);
  store.files = initial; store.context = { filesDir: '/sandbox' }; store.openDescriptors = [];
  return { store, io, calls, select: items => { nextSelection = items; } };
}
for (const before of [true, false]) {
  const first = musicFile(1), second = musicFile(2);
  const duplicate = musicFile(3, { name: first.name, size: first.size, modified: first.modified, url: first.url });
  const added = musicFile(50), altered = musicFile(1, { size: 42 });
  const run = fileHarness(before, [first, duplicate, second], [first, added, added, altered]);
  const imported = await run.store.pick();
  assert.equal(imported[0], first); assert.equal(imported[1], imported[2]);
  assert.equal(run.store.resource(first.url + '?query=1').code, 200);
  run.store.remove([first.id, first.id, 'missing']);
  assert.equal(run.store.resource(first.url).code, 200); // Duplicate URL now selects the next surviving record.
  run.store.remove([duplicate.id]);
  assert.equal(run.store.resource(first.url), undefined);
  run.select([first]); await run.store.pick();
  assert(run.store.list().some(item => item.name === first.name && item.size === first.size));
  run.store.release();
  const result = normalize({ imported, files: run.store.list(), calls: run.calls });
  if (before) metrics.fileBaseline = result;
  else assert.deepEqual(result, metrics.fileBaseline);
}
delete metrics.fileBaseline;
checks.push('Native import, first duplicate, repeated selections, resource query, deletion, reimport and descriptor release match the original');

{
  const run = fileHarness(false, [musicFile(1)]);
  await run.store.pick(); // Populate the lookup before a concurrent mutation.
  const gate = deferred(), newFile = musicFile(80);
  const open = run.io.open;
  run.io.open = async uri => { if (uri === newFile) await gate.promise; return open(uri); };
  run.select([newFile, musicFile(90)]);
  const pending = run.store.pick(); await tick();
  run.store.remove(['id-1']);
  run.select([musicFile(90)]); await run.store.pick();
  gate.resolve(); const imported = await pending;
  assert.equal(imported[1], run.store.list().find(item => item.name === musicFile(90).name));
  assert.equal(run.calls.copy.filter(([name]) => name === musicFile(90).name).length, 1);
  checks.push('Overlapping picks and deletion rebuild/refresh the same shared index without stale duplicate records');
}
{
  for (const value of [NaN, Infinity, -Infinity]) {
    const initial = musicFile(1, { size: value, modified: value });
    const outputs = [];
    for (const before of [true, false]) {
      const run = fileHarness(before, [initial], [initial]);
      outputs.push(normalize(await run.store.pick()));
    }
    assert.deepEqual(outputs[0], outputs[1]);
  }
  checks.push('Exceptional numeric metadata retains strict-equality matching rather than colliding in JSON index keys');
}
{
  const counts = [];
  for (const before of [true, false]) {
    let reads = 0;
    const initial = Array.from({ length: 5000 }, (_, i) => {
      const file = musicFile(i); Object.defineProperty(file, 'name', { enumerable: true, get: () => { reads++; return `Song ${i}.flac`; } }); return file;
    });
    const run = fileHarness(before, initial, Array.from({ length: 500 }, () => musicFile(4999)));
    const start = performance.now(); await run.store.pick();
    counts.push({ nameReads: reads, ms: performance.now() - start });
  }
  assert.equal(counts[0].nameReads, 2505000); // Includes the unchanged persistence pass.
  assert(counts[1].nameReads <= 15000);
  metrics.import = { before: counts[0], after: counts[1], library: 5000, selected: 500 };
  checks.push('A 500-file selection no longer rescans 5000 catalogue records for each duplicate');
}

function transferHarness(before, { partial = false, slice = false, cancel = false, failure = false, gate } = {}) {
  const calls = [], written = []; let fd = 0, copies = 0;
  const io = { OpenMode: { CREATE: 1, READ_WRITE: 2, TRUNC: 4 },
    openSync: target => { calls.push(['open', target]); return { fd: ++fd }; },
    closeSync: file => { calls.push(['close', file.fd]); },
    writeSync: (file, buffer) => { const bytes = new Uint8Array(buffer); const size = partial ? Math.min(7, bytes.length) : bytes.length;
      written.push(Buffer.from(bytes.subarray(0, size))); return size; },
    copyFileSync: (source, destination) => { calls.push(['copy', source, destination]); if (failure) throw new Error('copy failed'); },
    unlinkSync: target => { calls.push(['unlink', target]); },
  };
  io.open = async target => io.openSync(target); io.close = async file => io.closeSync(file);
  io.copyFile = async (source, destination) => { if (gate) await gate.promise; io.copyFileSync(source, destination); };
  io.unlink = async target => io.unlinkSync(target);
  const Transfer = loadService('NativeTransferStore', before, {
    '@kit.AbilityKit': {}, '@kit.CoreFileKit': { fileIo: io, picker: {
      DocumentSaveOptions: class {}, DocumentViewPicker: class { async save(options) { calls.push(['picker', options.newFileNames]); return cancel ? [] : ['/selected/export']; } },
    } }, '@kit.ArkTS': { util: { Base64Helper: class { decodeSync(value) {
      const input = Uint8Array.from(Buffer.from(value, 'base64'));
      const data = slice ? new Uint8Array(input.length + 12).subarray(4, 4 + input.length) : input;
      data.set(input);
      const nativeSlice = data.buffer.slice.bind(data.buffer);
      data.buffer.slice = (...args) => { copies++; return nativeSlice(...args); };
      return data;
    } } } },
  });
  return { transfer: new Transfer({ cacheDir: '/cache' }), calls, written, copies: () => copies };
}
for (const options of [{}, { partial: true }, { slice: true }, { slice: true, partial: true }, { cancel: true }, { failure: true }]) {
  const results = [];
  for (const before of [true, false]) {
    const run = transferHarness(before, options); const bytes = Buffer.from(Array.from({ length: 255 }, (_, i) => i));
    run.transfer.begin('export-1'); run.transfer.append('export-1', bytes.toString('base64'));
    run.transfer.append('export-1', ''); assert.equal(run.transfer.finish('export-1'), '/cache/export-1');
    let result, error;
    try { result = await run.transfer.export('export-1', 'A/B:歌曲.png'); } catch (caught) { error = caught.message; }
    assert.deepEqual(Buffer.concat(run.written), bytes);
    run.transfer.release(); results.push(normalize({ calls: run.calls, result, error }));
  }
  assert.deepEqual(results[0], results[1]);
}
checks.push('Export bytes, partial writes, typed-array offsets, empty chunks, picker cancellation and copy failures match the original');
{
  const counts = [];
  for (const before of [true, false]) {
    const run = transferHarness(before); run.transfer.begin('export-2');
    const input = Buffer.alloc(192 * 1024, 90).toString('base64');
    for (let i = 0; i < 30; i++) run.transfer.append('export-2', input);
    run.transfer.finish('export-2'); counts.push(run.copies());
  }
  assert.deepEqual(counts, [30, 0]);
  metrics.export = { chunkBytes: 192 * 1024, chunks: 30, beforeCopies: counts[0], afterCopies: counts[1], removedCopiedBytes: 30 * 192 * 1024 };
  const gate = deferred(), run = transferHarness(false, { gate });
  let finished = false;
  const saving = run.transfer.export('export-3', '歌曲.flac').then(() => { finished = true; });
  await tick(); assert.equal(finished, false); assert.equal(run.calls.filter(([type]) => type === 'close').length, 0);
  gate.resolve(); await saving;
  assert.equal(run.calls.filter(([type]) => type === 'close').length, 1);
  assert.equal(run.calls.filter(([type]) => type === 'unlink').length, 1);
  checks.push('Normal chunks perform zero extra buffer copies; large-file saving yields until completion and then closes/deletes in the original order');
}

for (const before of [true, false]) {
  const replies = [], calls = [];
  const Bridge = loadService('FoliaBridge', before, {
    '@kit.AbilityKit': {}, '@kit.ArkWeb': {}, '@kit.ArkData': {}, '@kit.ArkUI': {}, '../model/FoliaModel': {},
    './NativeFileStore': {}, './NativeTransferStore': {}, './SystemMediaSession': {}, './DisplayOrientation': {}, './DesktopWindowChrome': {}, './bodian/BodianService': {},
    '@kit.NetworkKit': { http: { createHttp: () => ({ request: async () => ({ responseCode: 200, result: Uint8Array.from([0, 255, 65, 128]).buffer }), destroy: () => calls.push('destroy') }), RequestMethod: { GET: 'GET', POST: 'POST' }, HttpDataType: { ARRAY_BUFFER: 3 } } },
    '@kit.ArkTS': { util: { Base64Helper: class { encodeToStringSync(input) { return Buffer.from(input).toString('base64'); } async encodeToString(input) { return Buffer.from(input).toString('base64'); } } } },
  });
  const bridge = Object.create(Bridge.prototype); bridge.config = { server: 'https://example.invalid' };
  bridge.run = async code => { replies.push(code); return ''; };
  await bridge.fetchBackend('req-1', JSON.stringify({ path: '/api/synthetic', method: 'GET', body: '' }));
  const actual = normalize({ replies, calls });
  if (before) metrics.backendBaseline = actual; else assert.deepEqual(actual, metrics.backendBaseline);
}
delete metrics.backendBaseline;
checks.push('Backend binary response encoding, callback payload and request cleanup match the original');
fs.writeFileSync(`${evidence}/native-equivalence.json`, JSON.stringify({ checks, metrics,
  limitation: 'Synthetic system APIs and local operation counts; no HarmonyOS device performance claim.' }, null, 2));
console.log(JSON.stringify({ passed: checks.length, checks, metrics }, null, 2));
