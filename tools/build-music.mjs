import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { build } from '../upstream/folia-major/node_modules/vite/dist/node/index.js';
import { parseAst } from '../upstream/folia-major/node_modules/rolldown/dist/parse-ast-index.mjs';

// Adapt the pinned Android protocol to ArkJS; vendor files remain byte-for-byte upstream sources.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'upstream/folia-major');
const vendor = path.join(root, 'tools/music/upstream');
const exploreVendor = path.join(root, 'tools/music/explore333');
const nativeRoot = path.join(root, 'entry/src/main/ets/services/music');
const functions = new Set(['firstValue','numberValue','encodeBridgeKey','decodeBridgeKey','qqChannelOf','describeUrlHost','qqProfile','qqPlaylistRow','kgCollectionRow','mergeOperationParams','pathSegments','qqGtk','handleFoliaQqRequest','routeFoliaQqRequest','handleFoliaKugouRequest']);
const modules = new Set(['./libraryTrace.js','./cookies.js','./qq.js','./qq-wechat-login.js','./qq-login-qr.js','./qq-native-login.js','./kugou.js']);
export async function buildMusicNative() {
  const manifest = JSON.parse(fs.readFileSync(path.join(vendor,'manifest.json'),'utf8'));
  const exploreManifest = JSON.parse(fs.readFileSync(path.join(exploreVendor,'manifest.json'),'utf8'));
  for (const [name, hash] of Object.entries(exploreManifest.files)) {
    if (createHash('sha256').update(fs.readFileSync(path.join(exploreVendor,name))).digest('hex') !== hash) {
      throw new Error(`Review the pinned QQ Explore protocol before changing ${name}`);
    }
  }
  for (const [name, hash] of Object.entries(manifest.files)) {
    if (createHash('sha256').update(fs.readFileSync(path.join(vendor,name))).digest('hex') !== hash) {
      throw new Error(`Review the pinned music protocol before changing ${name}`);
    }
  }
  const result = await build({
    configFile: false, root: source, logLevel: 'warn',
    plugins: [{ name: 'harmony-music-native', enforce: 'pre',
      load(id) {
        const file = id.replaceAll('\\','/');
        const host = path.join(root, 'tools/music/host.mjs');
        if (file.endsWith('/node_modules/qrcode/lib/core/byte-data.js')) {
          // This dependency also needs the native encoder; ArkJS has no browser TextEncoder global.
          return `const { TextEncoder } = require(${JSON.stringify(host)});\n` + fs.readFileSync(id, 'utf8');
        }
        if (!file.includes('/tools/music/upstream/')) return;
        let code = fs.readFileSync(id, 'utf8');
        if (file.endsWith('/utils/lyrics/providers/krcDecrypt.ts')) {
          // ArkJS has no DecompressionStream; retain the upstream KRC XOR and use the bundled inflater.
          code = code.replace(/: Uint8Array(?:\[\])?|: Promise<string>/g, '');
          const ast = parseAst(code);
          const fn = ast.body.find(node => node.type === 'FunctionDeclaration' && node.id.name === 'decompressDeflate');
          code = code.slice(0, fn.body.start) + '{ return new TextDecoder().decode(unzlibSync(bytes)); }' + code.slice(fn.body.end);
          return `import { unzlibSync } from ${JSON.stringify(path.join(source,'node_modules/fflate/esm/browser.js'))};\nimport { TextDecoder } from ${JSON.stringify(host)};\n` + code;
        }
        if (file.endsWith('/vendor/crypto-es.mjs')) {
          code = code.replace("crypto = require('crypto');", 'crypto = undefined;');
          return `import { crypto as nativeCrypto } from ${JSON.stringify(host)};\n` + code.replace('var crypto;', 'var crypto = nativeCrypto;');
        }
        if (file.endsWith('/api/weapi.js')) return code.slice(code.indexOf('export const UA'), code.indexOf('const IV'));
        if (file.endsWith('/api/kugou.js')) {
          code += '\nexport { kgFetchAndroidSigned, buildKGTrackerKey };';
          // The Web provider's page size may exceed Android's UI-specific 30-song search cap.
          code = code.replace('limit = Math.max(4, Math.min(30, Number(limit) || 16));', 'limit = Math.max(1, Math.min(100, Number(limit) || 16));');
          const ast = parseAst(code);
          const mapping = ast.body.find(node => node.type === 'FunctionDeclaration' && node.id?.name === 'mapKGPlaylist');
          const row = mapping.body.body.find(node => node.type === 'ReturnStatement').argument;
          // Retain the raw album discriminator that the Web library uses alongside user playlists.
          code = code.slice(0,row.start+1) + '\n musiclib_id: item.musiclib_id, collectionSource: item.source,\n' + code.slice(row.start+1);
        }
        if (file.endsWith('/api/qq.js')) {
          // Preserve a business rejection as upstream evidence, rather than a network failure.
          code = code.replace("__foliaBridgeError: 'NETWORK',", "__foliaBridgeError: 'NETWORK', upstreamCode: code,");
          code = code.replaceAll('const safeLimit = Math.max(4, Math.min(30, Number(limit) || 12));', 'const safeLimit = Math.max(1, Math.min(100, Number(limit) || 12));');
          code = code.replace('if (!songs.length) {\n    const base = await qqSmartboxSearch', 'if (!songs.length && Number(page || 1) === 1) {\n    const base = await qqSmartboxSearch');
        }
        if (file.endsWith('/api/qq-login-qr.js')) {
          code = code.replace('signal: controller.signal', 'signal: controller.signal, foliaTimeoutMs: timeout');
          // The upstream matcher can swallow the following callback arguments when commas have no spaces.
          code = code.replace(/const quotedUrlMatch = [^\n]+/, "const quotedUrlMatch = data.match(/'https?:\\/\\/[^'\\s]+'/g);");
        }
        if (file.endsWith('/api/qq-native-login.js')) {
          // Native events continue between UI polls: persist confirmed credentials and reject canceled exchanges.
          code = 'let nativeLoginGeneration = 0;\n' + code;
          code = code.replace('try { session.listener?.close?.();', 'session.cancelled = true;\n  try { session.listener?.close?.();');
          code = code.replace('  const cookies = (payload', '  if (session.cancelled) return;\n  const cookies = (payload');
          code = code.replace('  const data = (result.data', '  if (session.cancelled) return;\n  const data = (result.data');
          code = code.replace("  session.state = 'confirmed';", "  session.state = 'confirmed';\n  persistHost();");
          code = code.replace("  const type = String((event", "  if (session.cancelled || (['exchanging','confirmed','failed'].includes(session.state) && ['scanned','cookies','authorized'].includes(event?.type))) return;\n  const type = String((event");
          code = code.replace("if (type === 'canceled') { session.state", "if (type === 'canceled') { session.cancelled = true; session.state");
          code = code.replace("if (type === 'timeout') { session.state", "if (type === 'timeout') { session.cancelled = true; session.state");
          code = code.replace('export async function qqNativeCreateLoginQr() {', 'export async function qqNativeCreateLoginQr() {\n  cancelNativeQrSessions();\n  const generation = nativeLoginGeneration;');
          code = code.replace('  const session = {\n    qrcodeId,', "  if (generation !== nativeLoginGeneration) throw new Error('QQ 登录已取消');\n  const session = {\n    qrcodeId,");
          code = code.replace('  await listener.ready;', `  void listener.done.catch(() => { if (!session.cancelled && ['waiting','scanned'].includes(session.state)) { session.state = 'failed'; session.error = 'QQ 扫码连接已断开，请重新获取二维码'; } });\n  try { await listener.ready; } catch (error) { dropSession(qrcodeId); throw error; }`);
          code = code.replace("return { refresh: true, message: '已取消登录' };", "return { status: 'cancelled', refresh: true, message: '已取消登录' };");
          code += '\nexport function cancelNativeQrSessions() { nativeLoginGeneration++; for (const id of nativeQrSessions.keys()) dropSession(id); }';
        }
        if (file.endsWith('/api/folia.js')) {
          const ast = parseAst(code);
          code = ast.body.filter(node => node.type === 'ImportDeclaration' ? modules.has(node.source.value)
            : node.type === 'FunctionDeclaration' && functions.has(node.id?.name)).map(node => code.slice(node.start,node.end)).join('\n');
          code += '\nexport { handleFoliaQqRequest, handleFoliaKugouRequest };';
          code = code.replace("error: result?.error || '',", "level: result?.level || '',\n            restriction: result?.restriction, qqCode: result?.qqCode, rawMessage: result?.rawMessage,\n            error: result?.error || '',");
          code = code.replace("if (result?.refresh) return", "if (result?.status === 'cancelled') return { code: 800, failureReason: 'user-canceled', message: '已在手机取消登录' };\n    if (result?.refresh) return");
        }
        code = code.replaceAll('(globalThis.crypto || window.crypto)', 'nativeCrypto');
        return `import { crypto as nativeCrypto, chrome, fetch, URL, URLSearchParams, atob, btoa, AbortController, TextEncoder, TextDecoder, WebSocket, setInterval, clearInterval, persistHost } from ${JSON.stringify(host)};\n` + code;
      },
      resolveId(id, importer) {
        if (importer?.replaceAll('\\','/').includes('/tools/music/explore333/')
          && /(?:sessionMusicu|newRouteResult|androidDevice)\.js$/.test(id)) {
          return path.join(root, 'tools/music/qqExploreSession.mjs');
        }
        if (id === '../../utils/lyrics/providers/krcDecrypt' && importer?.includes('tools/music/upstream')) return path.join(vendor,'utils/lyrics/providers/krcDecrypt.ts');
        if (id.startsWith('qrcode/') && importer?.includes('tools')) return path.join(source, 'node_modules', id);
      },
    }],
    build: { write: false, minify: false, target: 'es2022',
      lib: { entry: path.join(root,'tools/music/runtime.mjs'), formats: ['iife'], name: 'MusicProtocol' },
      rolldownOptions: { external: ['@ohos.url'], output: { globals: { '@ohos.url': 'nativeUrl' } } },
    },
  });
  const chunk = (Array.isArray(result) ? result : [result]).flatMap(item => item.output || []).find(item => item.type === 'chunk');
  if (!chunk) throw new Error('Native music protocol bundle missing');
  fs.mkdirSync(nativeRoot, { recursive: true });
  fs.writeFileSync(path.join(nativeRoot,'MusicRuntime.js'), `// Generated from folia-android@${manifest.commit.slice(0,7)} by tools/build-music.mjs. Native ArkJS only.\nimport nativeUrl from '@ohos.url';\nexport function createMusicRuntime(provider, request, read, write, random) {\n${chunk.code}\nreturn MusicProtocol.createRuntime(provider, request, read, write, random);\n}\n`);
  const notices = path.join(root,'entry/src/main/resources/rawfile/music-licenses');
  fs.mkdirSync(notices, { recursive: true });
  fs.copyFileSync(path.join(exploreVendor,'LICENSE'),path.join(notices,'qq-explore-3.3.3-LICENSE'));
  for (const name of ['LICENSE','THIRD-PARTY-NOTICES.md']) fs.copyFileSync(path.join(vendor,name),path.join(notices,name));
  for (const [name,file] of [['buffer','LICENSE'],['qrcode','license']]) fs.copyFileSync(path.join(source,'node_modules',name,file),path.join(notices,name+'-LICENSE'));
  fs.copyFileSync(path.join(source,'node_modules/fflate/LICENSE'),path.join(notices,'fflate-LICENSE'));
  fs.copyFileSync(path.join(source,'node_modules/kugoumusicapi/LICENSE'),path.join(notices,'KuGouMusicApi-LICENSE'));
  console.log(`Generated native QQ/KuGou protocol (folia-android@${manifest.commit.slice(0,7)})`);
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await buildMusicNative();
