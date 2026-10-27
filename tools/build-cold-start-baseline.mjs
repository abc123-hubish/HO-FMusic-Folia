import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { build } from '../upstream/folia-major/node_modules/vite/dist/node/index.js';

// tools/build-cold-start-baseline.mjs
// Build isolated comparison bundles; the baseline substitutes only this task's backed-up files.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'upstream/folia-major');
const before = path.join(root, 'verification/cold-start/before');
const variant = process.argv[2] === 'after' ? 'after' : 'baseline';
const originals = new Map(['src/bootstrap.tsx', 'src/components/app/dialogs/AppDialogs.tsx',
  'src/components/app/overlays/AppOverlays.tsx', 'src/utils/lyrics/matchScore.ts'].map(name => [path.join(source, name).replaceAll('\\', '/'), fs.readFileSync(path.join(before, name), 'utf8')]));
process.chdir(source);
const sourceFingerprint = () => {
  const hash = createHash('sha256');
  const files = fs.readdirSync(path.join(source, 'src'), { recursive: true }).sort().filter(name => fs.statSync(path.join(source, 'src', name)).isFile());
  for (const name of files) hash.update(name).update(fs.readFileSync(path.join(source, 'src', name)));
  for (const name of ['vite.config.ts', 'vite.harmony.config.ts', 'package.json']) hash.update(fs.readFileSync(path.join(source, name)));
  return hash.digest('hex');
};
const fingerprint = sourceFingerprint();
await build({
  configFile: path.join(source, 'vite.harmony.config.ts'),
  plugins: variant === 'baseline' ? [{ name: 'cold-start-originals', enforce: 'pre', load(id) { return originals.get(id.replaceAll('\\', '/')) ?? null; } }] : [],
  build: { outDir: path.join(root, `verification/cold-start/${variant}-web`), emptyOutDir: true },
});
if (sourceFingerprint() !== fingerprint) throw new Error('Source changed during comparison build; rebuild this variant.');
fs.writeFileSync(path.join(root, `verification/cold-start/${variant}-source.json`), JSON.stringify({ fingerprint, variant }, null, 2));
