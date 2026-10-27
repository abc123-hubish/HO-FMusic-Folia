import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from '../upstream/folia-major/node_modules/vite/dist/node/index.js';

// Bundle the pinned upstream protocol for ArkJS without modifying the installed package.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'upstream/folia-major');
const packageRoot = path.join(source, 'node_modules/bodian-music-api');
const nativeRoot = path.join(root, 'entry/src/main/ets/services/bodian');
export async function buildBodianNative() {
  const version = JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8')).version;
  if (version !== '0.1.2') throw new Error('Review the Bodian native adapters before upgrading the protocol');
  const httpSource = fs.readFileSync(path.join(packageRoot, 'src/http.cjs'), 'utf8');
  const start = httpSource.indexOf('const API_ORIGIN');
  const end = httpSource.indexOf('// Bounded requests');
  const client = httpSource.slice(httpSource.indexOf('function createBodianClient'));
  const transport = `async function requestJson(url, { method = 'GET', headers = {}, body = '', requestFactory } = {}) {
    if (!requestFactory) throw new BodianError('unavailable', 'Bodian native transport is unavailable');
    let result;
    try { result = JSON.parse(await requestFactory(JSON.stringify({ url: url.toString(), method, headers, body }))); }
    catch { throw new BodianError('network', 'Bodian native request failed'); }
    if (result.status < 200 || result.status >= 300) throw new BodianError(result.status === 401 ? 'auth-required' : 'network', 'Bodian HTTP ' + result.status);
    if (Buffer.byteLength(result.body || '', 'utf8') > MAX_RESPONSE_BYTES) throw new BodianError('invalid-response', 'Bodian response exceeded the size limit');
    try { return JSON.parse(result.body); } catch { throw new BodianError('invalid-response', 'Bodian returned an unreadable response'); }
  }`;
  await build({
    configFile: false, root: source, logLevel: 'warn',
    plugins: [{
      name: 'bodian-native-adapters', enforce: 'pre',
      resolveId(id) { if (id === 'qrcode') return path.join(root, 'tools/bodian/qrcode.cjs'); },
      load(id) {
        const normalized = id.replaceAll('\\', '/');
        if (!normalized.includes('/bodian-music-api/src/') || !normalized.endsWith('.cjs')) return;
        const globals = `const { URL, URLSearchParams } = require(${JSON.stringify(path.join(root, 'tools/bodian/url.mjs'))});\nconst { Buffer } = require('buffer');\n`;
        if (normalized.endsWith('/http.cjs')) {
          const core = httpSource.slice(start, end).replace("const md5 = text => crypto.createHash('md5').update(text).digest('hex');", "const md5 = require('blueimp-md5');");
          return globals + core + transport + '\n' + client;
        }
        return globals + fs.readFileSync(id, 'utf8');
      },
    }],
    build: {
      outDir: nativeRoot, emptyOutDir: false, minify: false, target: 'es2017',
      lib: { entry: path.join(root, 'tools/bodian/runtime.mjs'), formats: ['es'], fileName: () => 'BodianRuntime.js' },
      rolldownOptions: { external: ['@ohos.url'], output: { banner: '// Generated from bodian-music-api@0.1.2 by tools/build-bodian.mjs. Runs only in native ArkJS.' } },
    },
  });
  const licenses = path.join(nativeRoot, 'licenses');
  const packagedLicenses = path.join(root, 'entry/src/main/resources/rawfile/bodian-licenses');
  fs.mkdirSync(licenses, { recursive: true });
  fs.mkdirSync(packagedLicenses, { recursive: true });
  for (const name of ['LICENSE', 'NOTICE']) fs.copyFileSync(path.join(packageRoot, name), path.join(licenses, `bodian-${name}`));
  for (const [name, file] of [['buffer', 'LICENSE'], ['blueimp-md5', 'LICENSE.txt']]) {
    fs.copyFileSync(path.join(source, 'node_modules', name, file), path.join(licenses, `${name}-LICENSE`));
  }
  for (const name of fs.readdirSync(licenses)) fs.copyFileSync(path.join(licenses, name), path.join(packagedLicenses, name));
  console.log('Generated native Bodian protocol (0.1.2)');
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await buildBodianNative();
