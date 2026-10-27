import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import AdmZip from '../upstream/folia-major/node_modules/adm-zip/adm-zip.js';

// Inspect the actual delivered packages, rather than trusting a build message or stale output.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const web = path.join(root, 'entry/src/main/resources/rawfile/folia');
const files = process.argv.slice(2);
for (const file of (files.length ? files : ['verification/Folia-HarmonyOS-signed.hap']).map(value => path.resolve(value))) {
  const bytes = fs.readFileSync(file);
  const zip = new AdmZip(bytes);
  const webPrefix = 'resources/rawfile/folia/';
  assert(zip.getEntry(`${webPrefix}harmony.html`), 'HAP is missing the HarmonyOS Web entry; rebuild with tools/build-hap.ps1 -Clean');
  assert(fs.existsSync(path.join(web, 'harmony.html')), 'Generated Web runtime is missing; run node tools/build-web.mjs first');
  // A stale resource cache can produce a signed HAP without the renderer. Check every shipped byte.
  const webFiles = fs.readdirSync(web, { recursive: true }).filter(name => fs.statSync(path.join(web, name)).isFile());
  for (const name of webFiles) {
    const packaged = zip.readFile(webPrefix + name.replaceAll(path.sep, '/'));
    assert(packaged, `HAP is missing Web asset: ${name}`);
    assert(packaged.equals(fs.readFileSync(path.join(web, name))), `HAP contains a stale Web asset: ${name}`);
  }
  assert.equal(zip.getEntries().filter(entry => !entry.isDirectory && entry.entryName.startsWith(webPrefix)).length,
    webFiles.length, 'HAP contains stale extra Web assets');
  const module = JSON.parse(zip.readAsText('module.json'));
  const info = { name: path.basename(file), size: bytes.length, hash: crypto.createHash('sha256').update(bytes).digest('hex'),
    bundle: module.app.bundleName, version: module.app.versionName, orientation: module.module.abilities[0].orientation,
    entries: zip.getEntries().length, webEntry: true, verifiedWebFiles: webFiles.length };
  fs.mkdirSync(path.resolve('verification'), { recursive: true });
  fs.writeFileSync(path.resolve('verification/package-checks.json'), JSON.stringify(info, null, 2));
  console.log(JSON.stringify(info));
}
