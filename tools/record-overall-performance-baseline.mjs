import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

// tools/record-overall-performance-baseline.mjs
// Save the current dirty sources, including every rendering file, before performance-only edits.
const root = 'D:/folia';
const web = 'D:/Desktop/upstream/folia-major';
const evidence = `${root}/verification/overall-performance-20261013`;
if (fs.existsSync(path.join(evidence, 'source-baseline.json'))) throw new Error('Preserve the existing before-change evidence; use a new evidence directory for a new run.');
const selected = [
  ['native', root, 'entry/src/main/ets/services/NativeFileStore.ets'],
  ['native', root, 'entry/src/main/ets/services/NativeTransferStore.ets'],
  ['native', root, 'entry/src/main/ets/services/FoliaBridge.ets'],
  ['web', web, 'src/utils/localLibraryIndex.ts'],
  ['web', web, 'src/services/playbackAdapters.ts'],
  ['web', web, 'src/hooks/usePlaybackQueueController.ts'],
  ['web', web, 'src/harmony/HarmonyHost.tsx'],
];
for (const [kind, base, name] of selected) {
  const target = path.join(evidence, 'before', kind, name);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(path.join(base, name), target);
}
const hashes = {};
for (const [kind, base, folder] of [['web', web, 'src'], ['native', root, 'entry/src/main/ets']]) {
  for (const name of fs.readdirSync(path.join(base, folder), { recursive: true })) {
    const absolute = path.join(base, folder, name);
    if (!fs.statSync(absolute).isFile()) continue;
    hashes[`${kind}/${folder}/${name.replaceAll('\\', '/')}`] = crypto.createHash('sha256').update(fs.readFileSync(absolute)).digest('hex');
  }
}
fs.writeFileSync(path.join(evidence, 'source-baseline.json'), JSON.stringify(hashes, null, 2));
console.log(`Saved ${selected.length} current sources and ${Object.keys(hashes).length} source hashes.`);
