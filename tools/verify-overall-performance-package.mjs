import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import AdmZip from '../upstream/folia-major/node_modules/adm-zip/adm-zip.js';

// tools/verify-overall-performance-package.mjs
// Check every packaged Web byte after the final Web and HAP build, then preserve the signed deliverable.
const root = 'D:/folia', evidence = `${root}/verification/overall-performance-20261013`;
const source = `${root}/entry/build/verification/outputs/default/entry-default-signed.hap`;
const assets = `${root}/entry/src/main/resources/rawfile/folia`;
const bytes = fs.readFileSync(source), zip = new AdmZip(bytes);
assert(zip.test(), 'HAP ZIP integrity failed');
const entries = zip.getEntries();
const webEntry = entries.find(item => item.entryName.endsWith('/folia/harmony.html'));
assert(webEntry, 'Missing Web entry');
const prefix = webEntry.entryName.slice(0, -'harmony.html'.length);
const names = fs.readdirSync(assets, { recursive: true }).filter(name => fs.statSync(path.join(assets, name)).isFile());
for (const name of names) {
  const entry = zip.getEntry(prefix + name.replaceAll(path.sep, '/'));
  assert(entry, `Missing asset ${name}`);
  assert(entry.getData().equals(fs.readFileSync(path.join(assets, name))), `Stale asset ${name}`);
}
const module = JSON.parse(zip.readAsText('module.json'));
const output = `${evidence}/FMusic-overall-performance-signed.hap`;
fs.copyFileSync(source, output);
const report = { source, output, zipIntegrity: true, webAssetsCompared: names.length,
  size: bytes.length, sha256: crypto.createHash('sha256').update(bytes).digest('hex'),
  bundle: module.app.bundleName, version: module.app.versionName,
  limitation: 'Compilation/package evidence; not installed or profiled on a device.' };
fs.writeFileSync(`${evidence}/package-checks.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
