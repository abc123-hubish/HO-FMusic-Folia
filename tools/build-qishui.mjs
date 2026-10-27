import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from '../upstream/folia-major/node_modules/vite/dist/node/index.js';
import { patchQishuiProtocol } from './qishui/compatibility.mjs';

// Bundle the pinned protocol for native ArkJS; no protocol or credentials execute in ArkWeb.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export async function buildQishuiNative() {
  const source = path.join(root, 'upstream/folia-major');
  const packageRoot = path.join(source, 'node_modules/qishui-music-api');
  if (JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'))).version !== '0.2.2') {
    throw new Error('Review the Qishui native adapter before upgrading the protocol');
  }
  await build({ configFile: false, root: source, logLevel: 'warn', plugins: [{
    name: 'qishui-native', enforce: 'pre',
    resolveId(id) { if (id === 'node:crypto') return path.join(root, 'tools/qishui/crypto.mjs'); },
    load(id) {
      if (!id.replaceAll('\\', '/').includes('/qishui-music-api/src/') || !id.endsWith('.cjs')) return;
      const globals = `const { URL, URLSearchParams } = require(${JSON.stringify(path.join(root, 'tools/bodian/url.mjs'))});\nconst { Buffer } = require('buffer');\n`;
      // Native RCP enforces the transport deadline; ArkJS has no browser AbortSignal global.
      return globals + patchQishuiProtocol(path.basename(id), fs.readFileSync(id, 'utf8'))
        .replace('signal: AbortSignal.timeout(25000)', 'signal: undefined');
    },
  }], build: { outDir: path.join(root, 'entry/src/main/ets/services/qishui'), emptyOutDir: false,
    minify: false, target: 'es2020', lib: { entry: path.join(root, 'tools/qishui/runtime.mjs'), formats: ['es'], fileName: () => 'QishuiRuntime.js' },
    rolldownOptions: { external: ['@ohos.url'], output: { banner: '// Generated from qishui-music-api@0.2.2. Native ArkJS only.' } },
  } });
  const notices = path.join(root, 'entry/src/main/resources/rawfile/qishui-licenses');
  fs.mkdirSync(notices, { recursive: true });
  fs.copyFileSync(path.join(packageRoot, 'LICENSE'), path.join(notices, 'qishui-music-api-LICENSE'));
  fs.copyFileSync(path.join(source, 'node_modules/buffer/LICENSE'), path.join(notices, 'buffer-LICENSE'));
  for (const name of ['base64-js', 'ieee754']) {
    fs.copyFileSync(path.join(source, `node_modules/${name}/LICENSE`), path.join(notices, `${name}-LICENSE`));
  }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await buildQishuiNative();
