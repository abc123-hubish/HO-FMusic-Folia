import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

// tools/verify-beat-model.mjs
// Refuse to ship a partial or different checkpoint under the same model cache version.
export function verifyBeatModel(source) {
  const manifest = JSON.parse(fs.readFileSync(path.join(source, 'src/services/beatFx/modelManifest.json'), 'utf8'));
  const target = path.join(source, 'public/models', manifest.file);
  if (!fs.existsSync(target)) {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    console.log('Downloading pinned MIT Beat This! checkpoint…');
    const temporary = `${target}.part`;
    execFileSync(process.platform === 'win32' ? 'curl.exe' : 'curl', [
      '--http1.1', '--location', '--fail', '--silent', '--show-error', '--retry', '2', '--connect-timeout', '20', '--max-time', '300',
      'https://github.com/chthollyphile/folia-major/releases/download/models-v1/beat_this-wgsl.bin', '-o', temporary,
    ], { stdio: 'inherit', windowsHide: true });
    const downloaded = fs.readFileSync(temporary);
    if (downloaded.length !== manifest.bytes || createHash('sha256').update(downloaded).digest('hex') !== manifest.sha256) {
      throw new Error('Downloaded Beat This! checkpoint failed verification.');
    }
    fs.renameSync(temporary, target);
  }
  const model = fs.readFileSync(target);
  if (model.length !== manifest.bytes || createHash('sha256').update(model).digest('hex') !== manifest.sha256) {
    throw new Error('Beat This! model missing or corrupt; restore public/models/beat_this-wgsl.bin before packaging.');
  }
  console.log(`Verified Beat This! model (${model.length} bytes)`);
}
