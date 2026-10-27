import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import AdmZip from '../upstream/folia-major/node_modules/adm-zip/adm-zip.js';

// Check the delivered package against the current renderer and the native protocol's distribution notices.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const artifact = path.resolve(root, process.argv[2] || 'verification/bodian/FMusic-bodian-signed.hap');
const zip = new AdmZip(artifact);
const web = path.join(root, 'entry/src/main/resources/rawfile/folia');
let files = 0;
function verify(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) verify(file);
    else {
      const relative = path.relative(web, file).replaceAll('\\', '/');
      assert.deepEqual(zip.readFile(`resources/rawfile/folia/${relative}`), fs.readFileSync(file), relative);
      files++;
    }
  }
}
verify(web);
for (const name of ['bodian-LICENSE', 'bodian-NOTICE', 'buffer-LICENSE', 'blueimp-md5-LICENSE']) {
  assert.ok(zip.getEntry(`resources/rawfile/bodian-licenses/${name}`), name);
}
const native = zip.readFile('ets/modules.abc');
assert.ok(native?.includes(Buffer.from('BodianRuntime.js')), 'Native ArkJS protocol missing');
assert.ok(native.includes(Buffer.from('requestBodian')), 'Native proxy method missing');
const module = JSON.parse(zip.readAsText('module.json'));
const result = { artifact: path.basename(artifact), sha256: crypto.createHash('sha256').update(fs.readFileSync(artifact)).digest('hex'),
  bytes: fs.statSync(artifact).size, bundle: module.app.bundleName, version: module.app.versionName,
  identicalWebFiles: files, nativeProtocol: 'bodian-music-api@0.1.2', noticesPackaged: true };
fs.writeFileSync(path.join(root, 'verification/bodian/package-checks.json'), JSON.stringify(result, null, 2));
console.log(JSON.stringify(result));
