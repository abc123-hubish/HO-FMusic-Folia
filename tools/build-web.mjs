import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { buildBodianNative } from './build-bodian.mjs';
import { buildMusicNative } from './build-music.mjs';
import { buildQishuiNative } from './build-qishui.mjs';
import { verifyBeatModel } from './verify-beat-model.mjs';

// Rebuild and package the full Folia renderer. Only this project's generated rawfile directory is replaced.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'upstream', 'folia-major');
verifyBeatModel(source);
await buildBodianNative();
await buildMusicNative();
await buildQishuiNative();
const result = spawnSync(process.execPath, [path.join(source, 'node_modules/vite/bin/vite.js'),
  'build', '--config', 'vite.harmony.config.ts'], {
  cwd: source, stdio: 'inherit', env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=8192' },
});
if (result.status !== 0) process.exit(result.status ?? 1);
const target = path.join(root, 'entry/src/main/resources/rawfile/folia');
if (!target.startsWith(`${root}${path.sep}`) || path.basename(target) !== 'folia') throw new Error('Invalid output path');
fs.rmSync(target, { force: true, recursive: true });
fs.cpSync(path.join(source, 'dist-harmony'), target, { recursive: true });
const media = path.join(root, 'entry/src/main/resources/base/media');
for (const name of ['fume', 'lumi', 'diorama', 'tilt', 'cappella', 'pat', 'cad', 'pendolo']) {
  const ext = name === 'cappella' ? 'jpg' : 'png';
  fs.copyFileSync(path.join(source, `img/preview-${name}.${ext}`), path.join(media, `preview_${name}.${ext}`));
}
// Preserve the HarmonyOS app icon and keep AppScope in sync with the entry resource.
fs.copyFileSync(path.join(media, 'folia_icon.png'), path.join(root, 'AppScope/resources/base/media/folia_icon.png'));
fs.copyFileSync(path.join(source, 'LICENSE'), path.join(root, 'LICENSE'));
fs.copyFileSync(path.join(source, 'LICENSE'), path.join(target, 'LICENSE'));
console.log(`Packaged complete Folia web runtime: ${target}`);
