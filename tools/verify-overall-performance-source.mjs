import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { stripTypeScriptTypes } from 'node:module';

// tools/verify-overall-performance-source.mjs
// Check the exact edit scope against the dirty baseline and compare local data-processing results/work.
const root = 'D:/folia', web = 'D:/Desktop/upstream/folia-major';
const evidence = `${root}/verification/overall-performance-20261013`;
const baseline = JSON.parse(fs.readFileSync(`${evidence}/source-baseline.json`, 'utf8'));
const allowed = new Set([
  'web/src/utils/localLibraryIndex.ts', 'web/src/hooks/usePlaybackQueueController.ts', 'web/src/harmony/HarmonyHost.tsx',
  'native/entry/src/main/ets/services/NativeFileStore.ets', 'native/entry/src/main/ets/services/NativeTransferStore.ets',
  'native/entry/src/main/ets/services/FoliaBridge.ets',
]);
// The user separately requested defaults in the concurrent chat "默认开启这两个选项".
const concurrent = new Set(['web/src/stores/usePlayerChromeSettingsStore.ts', 'web/src/stores/useTypographySettingsStore.ts']);
const concurrentChanges = [], generatedComments = [];
const actual = {}, changes = [];
for (const [kind, base, folder] of [['web', web, 'src'], ['native', root, 'entry/src/main/ets']]) {
  for (const name of fs.readdirSync(path.join(base, folder), { recursive: true })) {
    const absolute = path.join(base, folder, name);
    if (!fs.statSync(absolute).isFile()) continue;
    actual[`${kind}/${folder}/${name.replaceAll('\\', '/')}`] = crypto.createHash('sha256').update(fs.readFileSync(absolute)).digest('hex');
  }
}
for (const [name, hash] of Object.entries(baseline)) {
  assert(name in actual, `Existing source was removed: ${name}`);
  if (actual[name] !== hash) {
    if (concurrent.has(name)) { concurrentChanges.push(name); continue; }
    if (name === 'native/entry/src/main/ets/services/bodian/BodianRuntime.js') {
      const archive = fs.readFileSync(`${evidence}/bodian-archive.js`);
      assert.equal(crypto.createHash('sha256').update(archive).digest('hex'), hash);
      const generated = fs.readFileSync(`${root}/entry/src/main/ets/services/bodian/BodianRuntime.js`, 'utf8')
        .replace(/^\/\/#region \.\.\/Desktop\/upstream\/folia-major\//gm, '//#region upstream/folia-major/');
      assert.equal(generated, archive.toString('utf8'), 'Generated protocol code changed beyond source-path comments');
      generatedComments.push(name); continue;
    }
    assert(allowed.has(name), `Out-of-scope source changed: ${name}`); changes.push(name);
  }
}
const added = Object.keys(actual).filter(name => !(name in baseline));
assert.deepEqual(added, ['web/src/utils/localPlaybackQueue.ts']);
const protectedFiles = Object.keys(baseline).filter(name => !concurrent.has(name) && (name.startsWith('web/src/components/') ||
  name.startsWith('web/src/library/') || name.startsWith('web/src/stores/') || /\.(?:css|glsl|frag|vert)$/.test(name)));
assert(protectedFiles.every(name => baseline[name] === actual[name]));

function loadFunction(file, symbol) {
  const source = stripTypeScriptTypes(fs.readFileSync(file, 'utf8'), { mode: 'transform' }).replace(/^export /gm, '');
  return vm.runInNewContext(`${source}\n${symbol}`);
}
const resolve = loadFunction(`${web}/src/utils/localPlaybackQueue.ts`, 'resolveLocalPlaybackQueue');
const previousIndex = loadFunction(`${evidence}/before/web/src/utils/localLibraryIndex.ts`, 'buildLocalLibraryIndex');
const nextIndex = loadFunction(`${web}/src/utils/localLibraryIndex.ts`, 'buildLocalLibraryIndex');
const songs = Array.from({ length: 5000 }, (_, i) => ({ id: `song-${i}` }));
const queue = Array.from({ length: 500 }, (_, i) => ({ localRef: { songId: `song-${4999 - i}` } }));
const previousQueue = (queue, songs) => queue.map(song => {
  const songId = song.localRef?.songId; return songId ? songs.find(localSong => localSong.id === songId) : undefined;
}).filter(Boolean);
const expected = previousQueue(queue, songs), received = resolve(queue, songs);
assert.equal(expected.length, received.length); expected.forEach((song, i) => assert.equal(received[i], song));
function compareWork(before, after, input) {
  const times = [[], []];
  before(...input); after(...input);
  for (let i = 0; i < 7; i++) {
    for (const [index, run] of [[0, before], [1, after]]) {
      const start = performance.now(); run(...input); times[index].push(performance.now() - start);
    }
  }
  const median = values => values.slice().sort((a, b) => a - b)[Math.floor(values.length / 2)];
  return { samples: 7, beforeMedianMs: median(times[0]), afterMedianMs: median(times[1]) };
}
const entities = Array.from({ length: 5000 }, (_, i) => ({ id: `entity-${i}`, kind: 'artist', normalizedAliases: ['shared'] }));
const buckets = value => JSON.stringify([...value.entityIdsByAlias]);
assert.equal(buckets(previousIndex(entities)), buckets(nextIndex(entities)));
const modes = fs.readdirSync(`${web}/src/components/visualizer`, { withFileTypes: true })
  .filter(item => item.isDirectory() && fs.existsSync(`${web}/src/components/visualizer/${item.name}/entry.tsx`)).map(item => item.name).sort();
assert.equal(modes.length, 14);
const report = {
  existingSourcesCompared: Object.keys(baseline).length, changedSources: changes, addedSources: added,
  concurrentUserRequestedChanges: concurrentChanges, generatedSourcePathCommentsOnly: generatedComments,
  protectedSourcesByteIdentical: protectedFiles.length, visualizerModes: modes,
  queue: { library: 5000, entries: 500, resultIdentityEqual: true, ...compareWork(previousQueue, resolve, [queue, songs]) },
  aliasIndex: { entities: 5000, bucketOrderEqual: true, ...compareWork(previousIndex, nextIndex, [entities]) },
  limitation: 'Local synthetic CPU benchmarks; unchanged rendering/animation source is source evidence, not device visual acceptance.',
};
fs.writeFileSync(`${evidence}/source-and-benchmarks.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
