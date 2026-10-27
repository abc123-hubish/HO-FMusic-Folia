import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { HarmonyNative, HarmonyPort } from '@/harmony/contracts';
import type { LocalSong, SongResult } from '@/types';
import { PlayerState } from '@/types';
import { encodeContinuation } from '@/harmony/continuationData';

// test/unit/harmony/continuation.test.ts
// Verify startup ownership and stale-work cancellation across the actual continuation coordinator.
const mocks = vi.hoisted(() => ({ state: {} as Record<string, unknown>, detail: vi.fn(), available: true,
  revision: 0, setProvider: vi.fn(), setMode: vi.fn() }));
vi.mock('@/stores/usePlaybackStore', () => ({ usePlaybackStore: { getState: () => mocks.state } }));
vi.mock('@/stores/motionSignals', () => ({ currentTime: { get: () => 42.5 } }));
vi.mock('@/stores/useAppViewStore', () => ({ useAppViewStore: { getState: () => ({ view: 'player' }) } }));
vi.mock('@/stores/useVisualizerSettingsStore', () => ({ useVisualizerSettingsStore: {
  getState: () => ({ visualizerMode: 'classic', handleSetVisualizerMode: mocks.setMode }) } }));
vi.mock('@/stores/useOnlineProviderAccountStore', () => ({ useOnlineProviderAccountStore: {
  getState: () => ({ setActiveProviderId: mocks.setProvider }) } }));
vi.mock('@/services/playbackSourceEnvelope', () => ({ beginPlaybackSourceRequest: () => {
  const revision = ++mocks.revision;
  return () => revision === mocks.revision;
} }));
vi.mock('@/services/playbackAdapters', () => ({ buildLocalQueue: (locals: LocalSong[]) => locals.map(local => ({
  id: local.id, name: local.fileName, sourceRef: { kind: 'local', mediaId: local.id },
  localRef: { songId: local.id }, isLocal: true, artists: [], album: { id: 0, name: '' }, durationMs: local.duration,
})) }));
vi.mock('@/services/onlineMusic/omni', () => ({ omni: {
  canPlaySong: () => mocks.available, getSongDetail: mocks.detail } }));
const { createHarmonyContinuation } = await import('@/harmony/continuation');
const song: SongResult = { id: 'mid', name: 'QQ song', artists: [], album: { id: 0, name: '' }, durationMs: 90000,
  sourceRef: { kind: 'online', providerId: 'qq', mediaId: 'mid' } };
const payload = () => encodeContinuation({ transferId: 't1', song, queue: [song], locals: [],
  positionSec: 31.75, playing: false, view: 'player', mode: 'classic' });
function setup(pending = '', locals: LocalSong[] = []) {
  const native = { getContinuation: () => pending, toast: vi.fn(), completeContinuation: vi.fn(),
    finishContinuation: vi.fn(), setContinuationAvailable: vi.fn() } as unknown as HarmonyNative;
  const port = { restorePlayback: vi.fn(async () => {}), home: vi.fn(), player: vi.fn(), lattice: vi.fn() } as unknown as HarmonyPort;
  return { native, port, runtime: createHarmonyContinuation(native, () => port, () => locals) };
}
beforeEach(() => {
  vi.clearAllMocks(); mocks.detail.mockResolvedValue(null); mocks.available = true; mocks.revision = 0;
  mocks.state = { activePlaybackContext: 'main', transitionDisplay: null, audioSrc: 'blob:target',
    currentSong: song, playerState: PlayerState.PAUSED, playQueue: [song] };
});
describe('Harmony continuation coordinator', () => {
  it('keeps a target paused and resolves its own provider metadata before playback', async () => {
    const fresh = { ...song, name: 'fresh' }; mocks.detail.mockResolvedValue(fresh);
    const { native, port, runtime } = setup(payload());
    await runtime.start();
    expect(mocks.detail).toHaveBeenCalledWith('qq', 'mid');
    expect(mocks.setProvider).toHaveBeenCalledWith('qq');
    const [restored, queue, initial] = vi.mocked(port.restorePlayback).mock.calls[0];
    expect(restored).toMatchObject(fresh);
    expect(queue).toEqual([restored]);
    expect(initial).toEqual({ positionSec: 31.75, playing: false });
    expect(port.player).toHaveBeenCalledOnce();
    expect(native.finishContinuation).toHaveBeenCalledOnce();
    await runtime.start(); expect(port.restorePlayback).toHaveBeenCalledOnce();
  });
  it('exports a fresh progress snapshot and advertises only stable transferable playback', async () => {
    const { native, runtime } = setup();
    runtime.updateAvailable(); expect(native.setContinuationAvailable).toHaveBeenLastCalledWith(false);
    await runtime.start(); expect(native.setContinuationAvailable).toHaveBeenLastCalledWith(true);
    runtime.export('request');
    const [, snapshot] = vi.mocked(native.completeContinuation!).mock.calls[0];
    expect(JSON.parse(snapshot)).toMatchObject({ positionSec: 42.5, playing: false });
    mocks.state.transitionDisplay = {}; runtime.updateAvailable();
    expect(native.setContinuationAvailable).toHaveBeenLastCalledWith(false);
    runtime.export('request2'); expect(native.completeContinuation).toHaveBeenLastCalledWith('request2', '');
    runtime.dispose(); expect(native.setContinuationAvailable).toHaveBeenLastCalledWith(false);
  });
  it('preserves a cloud recording variant while refreshing target metadata', async () => {
    const original: SongResult = { ...song, sourceType: 'cloud', t: 1,
      sourceRef: { kind: 'online', providerId: 'netease', mediaId: 'mid', variant: 'cloud' } };
    mocks.detail.mockResolvedValue({ ...song, sourceRef: { kind: 'online', providerId: 'netease', mediaId: 'mid' } });
    const data = encodeContinuation({ transferId: 'cloud', song: original, queue: [original], locals: [],
      positionSec: 10, playing: false, view: 'player', mode: 'classic' });
    const { port, runtime } = setup(data); await runtime.start();
    expect(vi.mocked(port.restorePlayback).mock.calls[0][0]).toMatchObject({ sourceType: 'cloud', t: 1,
      sourceRef: { kind: 'online', providerId: 'netease', mediaId: 'mid', variant: 'cloud' } });
  });
  it('allows a user play during catalogue reconciliation to supersede startup continuation', async () => {
    const { native, port, runtime } = setup(payload());
    mocks.revision++;
    await runtime.start();
    expect(port.restorePlayback).not.toHaveBeenCalled();
    expect(native.finishContinuation).toHaveBeenCalledOnce();
  });
  it.each(['user-action', 'unmount'])('drops a delayed detail response after %s', async reason => {
    let finish!: (song: SongResult) => void;
    mocks.detail.mockImplementation(() => new Promise(resolve => { finish = resolve; }));
    const { native, port, runtime } = setup(payload()); const pending = runtime.start();
    if (reason === 'unmount') runtime.dispose(); else mocks.revision++;
    finish(song); await pending;
    expect(port.restorePlayback).not.toHaveBeenCalled(); expect(mocks.setProvider).not.toHaveBeenCalled();
    if (reason === 'unmount') expect(native.finishContinuation).not.toHaveBeenCalled();
  });
  it('reports invalid payloads without loading a previous target session', async () => {
    const { native, port, runtime } = setup('{}'); await runtime.start();
    expect(native.toast).toHaveBeenCalledWith(expect.stringContaining('版本不兼容'));
    expect(port.restorePlayback).not.toHaveBeenCalled(); expect(native.finishContinuation).toHaveBeenCalledWith('{}');
  });
  it('reports unavailable providers before changing playback', async () => {
    mocks.available = false;
    const { native, port, runtime } = setup(payload()); await runtime.start();
    expect(native.toast).toHaveBeenCalledWith(expect.stringContaining('音乐平台'));
    expect(port.restorePlayback).not.toHaveBeenCalled();
  });
});
