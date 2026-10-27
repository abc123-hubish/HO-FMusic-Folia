import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import AdmZip from '../upstream/folia-major/node_modules/adm-zip/adm-zip.js';

// Check the actual signed HAP, including every current renderer file and the native login modules.
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const artifact=path.resolve(root,process.argv[2]);
const zip=new AdmZip(artifact), web=path.join(root,'entry/src/main/resources/rawfile/folia');
let files=0;
function verify(directory) {
  for(const item of fs.readdirSync(directory,{withFileTypes:true})) {
    const file=path.join(directory,item.name);
    if(item.isDirectory()) verify(file);
    else {
      const relative=path.relative(web,file).replaceAll('\\','/');
      assert.deepEqual(zip.readFile('resources/rawfile/folia/'+relative),fs.readFileSync(file),relative);
      files++;
    }
  }
}
verify(web);
for(const name of ['LICENSE','THIRD-PARTY-NOTICES.md','buffer-LICENSE','qrcode-LICENSE']) {
  assert.ok(zip.getEntry('resources/rawfile/music-licenses/'+name),name);
}
const native=zip.readFile('ets/modules.abc');
for(const text of ['MusicRuntime.js','MusicService','MusicSession','requestMusic','createMusicRuntime']) {
  assert.ok(native?.includes(Buffer.from(text)),text);
}
const module=JSON.parse(zip.readAsText('module.json'));
const result={artifact,sha256:createHash('sha256').update(fs.readFileSync(artifact)).digest('hex'),
  bytes:fs.statSync(artifact).size,version:module.app.versionName,identicalWebFiles:files,nativeLoginPackaged:true,licensesPackaged:true};
fs.writeFileSync(path.join(root,'verification/native-music-login-20261016/package-checks.json'),JSON.stringify(result,null,2));
console.log(JSON.stringify(result,null,2));
