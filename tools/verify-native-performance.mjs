import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { stripTypeScriptTypes } from 'node:module';

// tools/verify-native-performance.mjs
// Exercise service state machines from the real ArkTS sources with mocked system APIs.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const checks = [];
const loadService = (name, mocks, globals = {}) => {
  const source = fs.readFileSync(path.join(root, `entry/src/main/ets/services/${name}.ets`), 'utf8');
  const compiled = stripTypeScriptTypes(source, { mode: 'transform' })
    .replace(/^import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"];?/gm,
      (_match, bindings, name) => `const {${bindings.replace(/\bas\b/g, ':')}} = require(${JSON.stringify(name)});`)
    .replace(/^export class /gm, 'class ') + `\nmodule.exports.${name} = ${name};`;
  const module = { exports: {} };
  vm.runInNewContext(compiled, { exports: module.exports, module, console: { warn() {} },
    require: name => { if (!(name in mocks)) throw new Error(`Unexpected import: ${name}`); return mocks[name]; },
    setTimeout, clearTimeout, ...globals });
  return module.exports[name];
};
const deferred = () => { let resolve; const promise = new Promise(done => { resolve = done; }); return { promise, resolve }; };
const snapshot = (overrides = {}) => ({ songId: 'local:one', title: 'Song', artist: 'Artist',
  cover: '', duration: 30, position: 1, playing: true, ...overrides });

function mediaHarness() {
  const calls = { metadata: [], playback: [], starts: 0, stops: 0, destroys: 0, commands: [], events: {},
    images: [], pixelReleases: 0, sourceReleases: 0, requests: [], requestDestroys: 0 };
  const session = { on: (event, handler) => { calls.events[event] = handler; }, activate: async () => {},
    setAVMetadata: async data => { calls.metadata.push(data); },
    setAVPlaybackState: async data => { calls.playback.push(data); },
    destroy: async () => { calls.destroys++; } };
  const background = { BackgroundMode: { AUDIO_PLAYBACK: 1 },
    startBackgroundRunning: async () => { calls.starts++; },
    stopBackgroundRunning: async () => { calls.stops++; } };
  const av = { createAVSession: async () => session,
    PlaybackState: { PLAYBACK_STATE_PLAY: 1, PLAYBACK_STATE_PAUSE: 2 } };
  const timers = [];
  const image = { createImageSource: buffer => ({ getImageInfo: async () => ({ size: { width: 1024, height: 768 } }),
    createPixelMap: async options => {
      const pixel = { buffer, options, release: async () => { calls.pixelReleases++; } };
      calls.images.push(pixel); return pixel;
    }, release: async () => { calls.sourceReleases++; } }) };
  const network = { createHttp: () => ({ request: async (url, options) => {
    calls.requests.push({ url, options }); return { responseCode: 200, result: new Uint8Array([1, 2, 3]).buffer };
  }, destroy: () => { calls.requestDestroys++; } }), RequestMethod: { GET: 'GET' }, HttpDataType: { ARRAY_BUFFER: 3 } };
  const SystemMediaSession = loadService('SystemMediaSession', {
    '@kit.AbilityKit': { wantAgent: { getWantAgent: async () => ({}), OperationType: {}, WantAgentFlags: {} } },
    '@kit.AVSessionKit': { avSession: av }, '@kit.BackgroundTasksKit': { backgroundTaskManager: background },
    '@kit.ImageKit': { image }, '@kit.NetworkKit': { http: network },
    '@kit.ArkTS': { util: { Base64Helper: class { async decode(value) { return Uint8Array.from(Buffer.from(value, 'base64')); } } } },
    '../model/FoliaModel': {},
  }, { AppStorage: { setOrCreate: (key, time) => calls.commands.push([key, time]) },
    setTimeout: callback => { timers.push(callback); return timers.length; }, clearTimeout: () => {} });
  return { calls, session, background, av, image, network, timers,
    media: new SystemMediaSession({}, action => calls.commands.push(action)) };
}

{
  const { media, calls } = mediaHarness();
  await media.update(snapshot());
  await media.update(snapshot({ mode: 'lumiere', settings: true }));
  assert.equal(calls.metadata.length, 1); assert.equal(calls.playback.length, 1); assert.equal(calls.starts, 1);
  await media.update(snapshot({ playing: false, position: 8 }));
  assert.equal(calls.playback.at(-1).position.elapsedTime, 8000);
  assert.equal(calls.stops, 1);
  calls.events.seek(12000); calls.events.play(); calls.events.pause(); calls.events.playNext(); calls.events.playPrevious();
  assert.equal(JSON.stringify(calls.commands), JSON.stringify([
    ['folia_system_seek', 12000], 'play', 'pause', 'next', 'previous']));
  await media.release();
  checks.push('Unchanged media state is skipped; pause, seek and system controls are preserved');
}
{
  const { media, calls, session } = mediaHarness();
  const gate = deferred(); let inFlight = 0, maximum = 0;
  session.setAVPlaybackState = async data => {
    inFlight++; maximum = Math.max(maximum, inFlight); calls.playback.push(data);
    if (calls.playback.length === 1) await gate.promise;
    inFlight--;
  };
  const first = media.update(snapshot());
  await new Promise(resolve => setImmediate(resolve));
  const second = media.update(snapshot({ position: 2 }));
  const paused = media.update(snapshot({ position: 3, playing: false }));
  gate.resolve(); await Promise.all([first, second, paused]);
  assert.equal(maximum, 1); assert.equal(calls.playback.length, 2);
  assert.equal(calls.playback.at(-1).state, 2);
  assert.equal(calls.playback.at(-1).position.elapsedTime, 3000);
  await media.release();
  checks.push('Overlapping updates are serialized and converge on the latest paused position');
}
{
  const { media, calls, av, session } = mediaHarness();
  const gate = deferred(); av.createAVSession = () => gate.promise;
  const pending = media.update(snapshot()); const released = media.release();
  gate.resolve(session); await Promise.all([pending, released]);
  assert.equal(calls.starts, 0); assert.equal(calls.destroys, 1);
  await media.update(snapshot()); assert.equal(calls.playback.length, 0);
  checks.push('Release during session creation destroys the session without starting background audio');
}
{
  const { media, calls, background } = mediaHarness();
  const gate = deferred(); background.startBackgroundRunning = async () => { calls.starts++; await gate.promise; };
  const pending = media.update(snapshot());
  await new Promise(resolve => setImmediate(resolve));
  const released = media.release(); gate.resolve(); await Promise.all([pending, released]);
  assert.equal(calls.starts, 1); assert.equal(calls.stops, 1); assert.equal(calls.destroys, 1);
  checks.push('Release during a background grant waits and cleans up the grant');
}
{
  const { media, calls, session, timers } = mediaHarness();
  let failures = 1;
  session.setAVPlaybackState = async data => {
    if (failures-- > 0) throw new Error('Transient service failure');
    calls.playback.push(data);
  };
  await media.update(snapshot()); assert.equal(timers.length, 1);
  timers.shift()(); await new Promise(resolve => setImmediate(resolve));
  assert.equal(calls.playback.length, 1); assert.equal(calls.starts, 1);
  await media.release();
  checks.push('Transient media failures retry without requiring periodic idle Web messages');
}

{
  const { media, calls } = mediaHarness();
  await media.update(snapshot({ cover: 'blob:one', playing: false }));
  assert.equal(calls.metadata.at(-1).mediaImage, '');
  await media.setArtwork('local:one', 'blob:one', 'data:image/jpeg;base64,AQID');
  assert.equal(calls.metadata.at(-1).mediaImage, calls.images[0]);
  assert.equal(calls.images[0].options.desiredSize.width, 512);
  assert.equal(calls.images[0].options.desiredSize.height, 384);
  assert.equal(calls.pixelReleases, 1); assert.equal(calls.sourceReleases, 1);
  assert.equal(calls.playback.length, 1); assert.equal(calls.starts, 0);
  await media.update(snapshot({ cover: 'blob:one', playing: false, position: 2 }));
  assert.equal(calls.images.length, 1);
  await media.update(snapshot({ cover: 'blob:replacement', playing: false }));
  assert.equal(calls.metadata.at(-1).mediaImage, '');
  await media.setArtwork('local:one', 'blob:replacement', 'data:image/jpeg;base64,BAUG');
  assert.equal(calls.images.length, 2);
  await media.update(snapshot({ songId: 'local:two', cover: '', playing: false }));
  assert.equal(calls.metadata.at(-1).mediaImage, '');
  await media.setArtwork('local:one', 'blob:replacement', 'data:image/jpeg;base64,BAUG');
  assert.equal(calls.images.length, 2);
  await media.release();
  checks.push('Late paused artwork becomes a bounded PixelMap; source replacement and no-cover tracks clear previous artwork');
}
{
  const { media, calls, network } = mediaHarness();
  const gate = deferred();
  network.createHttp = () => ({ request: () => gate.promise, destroy: () => { calls.requestDestroys++; } });
  await media.update(snapshot({ cover: 'https://example.com/one.jpg' }));
  const pending = media.setArtwork('local:one', 'https://example.com/one.jpg', 'https://example.com/one.jpg');
  await media.update(snapshot({ songId: 'local:two', playing: false }));
  assert.equal(calls.playback.at(-1).state, 2); assert.equal(calls.stops, 1);
  gate.resolve({ responseCode: 200, result: new Uint8Array([1]).buffer }); await pending;
  assert.equal(calls.images.length, 0); assert.equal(calls.requestDestroys, 1);
  assert.equal(calls.metadata.at(-1).assetId, 'local:two');
  await media.release();
  checks.push('An in-flight cover download does not delay pause or publish old artwork after a track switch');
}
{
  const { media, calls, network } = mediaHarness();
  const gate = deferred();
  network.createHttp = () => ({ request: () => gate.promise, destroy: () => { calls.requestDestroys++; } });
  await media.update(snapshot({ cover: 'https://example.com/one.jpg' }));
  const pending = media.setArtwork('local:one', 'https://example.com/one.jpg', 'https://example.com/one.jpg');
  await media.release();
  gate.resolve({ responseCode: 200, result: new Uint8Array([1]).buffer }); await pending;
  assert.equal(calls.images.length, 0); assert.equal(calls.destroys, 1); assert.equal(calls.requestDestroys, 1);
  checks.push('Release discards an unfinished artwork download and destroys its request');
}
{
  const { media, calls, network, timers } = mediaHarness();
  let failures = 1;
  network.createHttp = () => ({ request: async () => ({ responseCode: failures-- > 0 ? 503 : 200,
    result: new Uint8Array([1]).buffer }), destroy: () => { calls.requestDestroys++; } });
  await media.update(snapshot({ cover: 'https://example.com/one.jpg', playing: false }));
  await media.setArtwork('local:one', 'https://example.com/one.jpg', 'https://example.com/one.jpg');
  assert.equal(timers.length, 1); assert.equal(calls.requestDestroys, 1);
  timers.shift()(); await new Promise(resolve => setImmediate(resolve));
  assert.equal(calls.images.length, 1); assert.equal(calls.requestDestroys, 2);
  assert.equal(calls.metadata.at(-1).mediaImage, calls.images[0]);
  await media.release();
  checks.push('Network artwork retries while paused without needing another Web snapshot');
}
{
  const { media, calls, image } = mediaHarness();
  image.createImageSource = () => ({ getImageInfo: async () => { throw new Error('Bad image'); },
    release: async () => { calls.sourceReleases++; } });
  await media.update(snapshot({ cover: 'blob:broken' }));
  await media.setArtwork('local:one', 'blob:broken', 'data:image/jpeg;base64,AQID');
  await media.update(snapshot({ cover: 'blob:broken', playing: false }));
  assert.equal(calls.metadata.at(-1).mediaImage, ''); assert.equal(calls.stops, 1);
  assert.equal(calls.sourceReleases, 1);
  await media.release();
  checks.push('Invalid image bytes are discarded and resources are released while transport remains usable');
}

const visibilityStorage = new Map();
const FoliaBridge = loadService('FoliaBridge', {
  '@kit.AbilityKit': {},
  '@kit.ArkWeb': {}, '@kit.ArkData': {}, '@kit.ArkUI': {}, '@kit.NetworkKit': {}, '@kit.ArkTS': {},
  '../model/FoliaModel': {}, './NativeFileStore': {}, './SystemMediaSession': {},
  './NativeTransferStore': {}, './DisplayOrientation': {},
  './DesktopWindowChrome': {}, './bodian/BodianService': {}, './HarmonyAiService': {},
}, { AppStorage: { get: key => visibilityStorage.get(key) }, WebResourceResponse: class {
  setResponseData(data) { this.data = data; } setResponseCode(code) { this.code = code; }
  setReasonMessage(reason) { this.reason = reason; } setResponseMimeType(mime) { this.mime = mime; }
  setResponseEncoding(encoding) { this.encoding = encoding; } setResponseHeader(headers) { this.headers = headers; }
  setResponseIsReady(ready) { this.ready = ready; }
} });
{
  const bridge = Object.create(FoliaBridge.prototype);
  const calls = [], scripts = [];
  bridge.controller = { onActive: () => calls.push('active'), onInactive: () => calls.push('inactive') };
  bridge.run = async code => { scripts.push(code); return ''; };
  assert.equal(bridge.getForeground(), true);
  visibilityStorage.set('folia_foreground', false); bridge.syncForeground();
  visibilityStorage.set('folia_foreground', true); bridge.syncForeground();
  assert.deepEqual(calls, ['inactive', 'active']);
  assert.deepEqual(scripts, ['window.HarmonyLifecycle?.setForeground(false)', 'window.HarmonyLifecycle?.setForeground(true)']);
  bridge.controller.onInactive = () => { throw new Error('Controller not ready'); };
  visibilityStorage.set('folia_foreground', false); bridge.syncForeground();
  assert.equal(scripts.at(-1), 'window.HarmonyLifecycle?.setForeground(false)');
  visibilityStorage.clear();
  checks.push('Native visibility pauses/resumes ArkWeb visual activity and still notifies JavaScript after controller failures');
}
{
  const bridge = Object.create(FoliaBridge.prototype);
  bridge.snapshot = { queue: [], local: [], results: [] };
  const received = []; bridge.onSnapshot = data => received.push(data);
  bridge.session = { update: async () => {} }; bridge.toast = message => { throw new Error(message); };
  bridge.publish(JSON.stringify({ ...snapshot(), queue: [{ id: 'queue' }], local: [{ id: 'local' }], results: [{ id: 'result' }] }));
  bridge.publish(JSON.stringify(snapshot({ position: 2 })));
  assert.equal(received.at(-1).queue[0].id, 'queue'); assert.equal(received.at(-1).local[0].id, 'local');
  bridge.publish(JSON.stringify({ ...snapshot(), results: [] }));
  assert.equal(received.at(-1).results.length, 0); assert.equal(received.at(-1).local.length, 1);
  checks.push('Native delta merge keeps omitted lists and applies explicit list clearing');
}
{
  const bridge = Object.create(FoliaBridge.prototype);
  const gate = deferred(); bridge.context = { resourceManager: { getRawFileContent: () => gate.promise } };
  bridge.bodian = { media: { intercept: () => undefined } };
  const response = bridge.intercept('https://folia.local/assets/player-abcdefgh.js');
  assert.equal(response.ready, false);
  const data = new Uint8Array([1, 2, 3]); gate.resolve(data);
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(response.ready, true); assert.equal(response.code, 200); assert.equal(response.data, data.buffer);
  assert(response.headers.some(item => item.headerKey === 'Cache-Control' && item.headerValue.includes('immutable')));
  bridge.context.resourceManager.getRawFileContent = async () => { throw new Error('Missing asset'); };
  const missing = bridge.intercept('https://folia.local/harmony.html');
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(missing.ready, true); assert.equal(missing.code, 404);
  assert(missing.headers.some(item => item.headerValue === 'no-store'));
  assert.equal(bridge.intercept('https://external.example/asset.js'), undefined);
  assert.equal(bridge.intercept('https://folia.local/../secret'), undefined);
  checks.push('Package resources return pending immediately, deliver exact bytes, and finish missing resources safely');
}

{
  const copied = [], closed = [], saved = []; const gate = deferred();
  const NativeFileStore = loadService('NativeFileStore', {
    '@kit.AbilityKit': {}, '../model/FoliaModel': {},
    '@kit.CoreFileKit': { picker: { DocumentViewPicker: class { async select() { return ['file://one', 'file://one']; } },
      DocumentSelectOptions: class {} }, fileUri: { FileUri: class { name = 'Song.flac'; } },
      fileIo: { OpenMode: { READ_ONLY: 0 }, open: async () => ({ fd: 1 }),
        stat: async () => ({ size: 100000000, mtime: 1000 }),
        copyFile: async (fd, target) => { copied.push([fd, target]); await gate.promise; },
        close: async source => { closed.push(source.fd); } } },
    '@kit.ArkData': { preferences: { getPreferencesSync: () => ({
      putSync: (key, value) => saved.push([key, JSON.parse(value)]), flush: async () => {} }) } },
    '@kit.ArkTS': { util: { generateRandomUUID: () => 'unique' } },
  });
  const files = Object.create(NativeFileStore.prototype); files.files = []; files.context = { filesDir: '/sandbox' };
  let completed = false; const importing = files.pick().then(result => { completed = true; return result; });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(completed, false); assert.equal(copied.length, 1); assert.equal(closed.length, 0);
  gate.resolve(); const imported = await importing;
  assert.equal(imported.length, 2); assert.equal(imported[0], imported[1]);
  assert.equal(files.list().length, 1); assert.equal(closed.length, 2); assert.equal(saved[0][1].length, 1);
  assert.equal(imported[0].size, 100000000); assert.equal(imported[0].mime, 'audio/flac');
  checks.push('Large file copy yields while pending, closes descriptors, preserves duplicates and persists the index');
}

const evidence = path.resolve(root, process.env.FOLIA_NATIVE_VERIFICATION_DIR || 'verification/harmony-performance');
fs.mkdirSync(evidence, { recursive: true });
fs.writeFileSync(path.join(evidence, 'native-service-checks.json'), JSON.stringify({ checks,
  limitation: 'System APIs are mocked; ArkWeb, media panel and background audio need device validation.' }, null, 2));
console.log(JSON.stringify({ passed: checks.length, checks }, null, 2));
