import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import AdmZip from '../upstream/folia-major/node_modules/adm-zip/adm-zip.js';

// tools/verify-performance-package.mjs
// Check the freshly built verification HAP against every packaged Web source asset.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const evidence = path.resolve(root, process.env.FOLIA_PACKAGE_VERIFICATION_DIR || 'verification/harmony-performance');
fs.mkdirSync(evidence, { recursive: true });
const source = path.join(root, 'entry/build/verification/outputs/default/entry-default-signed.hap');
const assets = path.join(root, 'entry/src/main/resources/rawfile/folia');
const bytes = fs.readFileSync(source);
const zip = new AdmZip(bytes);
assert(zip.test(), 'HAP ZIP integrity failed');
const entries = zip.getEntries();
const webEntry = entries.find(item => item.entryName.endsWith('/folia/harmony.html'));
assert(webEntry, 'Missing HarmonyOS Web entry');
const prefix = webEntry.entryName.slice(0, -'harmony.html'.length);
const files = fs.readdirSync(assets, { recursive: true }).filter(name => fs.statSync(path.join(assets, name)).isFile());
for (const name of files) {
  const packaged = zip.getEntry(prefix + name.replaceAll(path.sep, '/'));
  assert(packaged, `Asset not packaged: ${name}`);
  assert(packaged.getData().equals(fs.readFileSync(path.join(assets, name))), `Asset bytes differ: ${name}`);
}
const modes = fs.readdirSync(path.join(root, 'upstream/folia-major/src/components/visualizer'), { withFileTypes: true })
  .filter(item => item.isDirectory() && fs.existsSync(path.join(root,
    'upstream/folia-major/src/components/visualizer', item.name, 'entry.tsx'))).map(item => item.name).sort();
assert.equal(modes.length, 14);
const module = JSON.parse(zip.readAsText('module.json'));
const output = path.join(evidence, 'FMusic-performance-signed.hap');
fs.copyFileSync(source, output);
const report = { source, output, size: bytes.length, sha256: crypto.createHash('sha256').update(bytes).digest('hex'),
  bundle: module.app.bundleName, version: module.app.versionName, zipIntegrity: true,
  webAssetsCompared: files.length, visualizerModes: modes,
  limitation: 'Build/package evidence only; this package has not been installed or profiled on a device.' };
fs.writeFileSync(path.join(evidence, 'package-checks.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
