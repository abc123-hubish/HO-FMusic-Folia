import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import AdmZip from '../upstream/folia-major/node_modules/adm-zip/adm-zip.js';

// tools/verify-music-animation-package.mjs
// Check the new verification HAP's Web files before copying the deliverable; no installation.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const evidence = path.resolve(root, process.env.FOLIA_ANIMATION_VERIFICATION_DIR || 'verification/music-animation-performance');
fs.mkdirSync(evidence, { recursive: true });
const hap = path.join(root, 'entry/build/verification/outputs/default/entry-default-signed.hap');
const assets = path.join(root, 'entry/src/main/resources/rawfile/folia');
const bytes = fs.readFileSync(hap);
const zip = new AdmZip(bytes);
assert(zip.test(), 'HAP ZIP integrity failed');
const webEntry = zip.getEntries().find(entry => entry.entryName.endsWith('/folia/harmony.html'));
assert(webEntry, 'Missing HarmonyOS Web entry');
const prefix = webEntry.entryName.slice(0, -'harmony.html'.length);
const files = fs.readdirSync(assets, { recursive: true }).filter(name => fs.statSync(path.join(assets, name)).isFile());
for (const name of files) {
  const entry = zip.getEntry(prefix + name.replaceAll(path.sep, '/'));
  assert(entry, `Missing Web asset: ${name}`);
  assert(entry.getData().equals(fs.readFileSync(path.join(assets, name))), `Web asset mismatch: ${name}`);
}
const modes = fs.readdirSync(path.join(root, 'upstream/folia-major/src/components/visualizer'), { withFileTypes: true })
  .filter(entry => entry.isDirectory() && fs.existsSync(path.join(root, 'upstream/folia-major/src/components/visualizer', entry.name, 'entry.tsx')))
  .map(entry => entry.name).sort();
assert.equal(modes.length, 14);
const output = path.join(evidence, 'FMusic-player-performance-signed.hap');
fs.copyFileSync(hap, output);
const module = JSON.parse(zip.readAsText('module.json'));
const report = { source: hap, output, size: bytes.length, sha256: crypto.createHash('sha256').update(bytes).digest('hex'),
  bundle: module.app.bundleName, version: module.app.versionName, zipIntegrity: true, webAssetsCompared: files.length,
  visualizerModes: modes, limitation: 'Build/package evidence only; not installed or tested on a device.' };
fs.writeFileSync(path.join(evidence, 'package-checks.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
