import { describe, expect, it } from 'vitest';
import { beginPlaybackSourceRequest, createPlaybackSourceEnvelope, SOURCE_FADE_SECONDS, SOURCE_START_HOLD_SECONDS } from '@/services/playbackSourceEnvelope';
import { createFakeFadeGraph } from './fakeFadeGraph';

// test/unit/services/playbackSourceEnvelope.test.ts
// Assert sample-clock gains, including a busy page that delivers its source-change timer late.

describe('playback source envelope', () => {
    it('invalidates a slow loader as soon as a newer source is requested', () => {
        const local = beginPlaybackSourceRequest();
        expect(local()).toBe(true);
        const online = beginPlaybackSourceRequest();
        expect(local()).toBe(false);
        expect(online()).toBe(true);
    });
    it('reaches silence before replacing a source even when the page stalls', async () => {
        const graph = createFakeFadeGraph();
        let release!: () => void;
        const envelope = createPlaybackSourceEnvelope(() => graph, () => new Promise(resolve => { release = resolve; }));
        const pending = envelope.beforeChange();
        expect(graph.param.value).toBe(1);
        graph.clock.now = SOURCE_FADE_SECONDS / 2;
        expect(graph.param.value).toBeCloseTo(0.5);
        graph.clock.now = 1;
        expect(graph.param.value).toBe(0);
        release();
        await pending;
        expect(graph.param.value).toBe(0);
    });

    it('starts silently and restores the listener volume with a short ramp', () => {
        const graph = createFakeFadeGraph();
        const envelope = createPlaybackSourceEnvelope(() => graph);
        const token = envelope.prepareStart();
        expect(graph.param.value).toBe(0);
        envelope.finishStart(token);
        graph.clock.now = SOURCE_START_HOLD_SECONDS / 2;
        expect(graph.param.value).toBe(0);
        graph.clock.now = SOURCE_START_HOLD_SECONDS + SOURCE_FADE_SECONDS / 2;
        expect(graph.param.value).toBeCloseTo(0.5);
        graph.clock.now = SOURCE_START_HOLD_SECONDS + SOURCE_FADE_SECONDS;
        expect(graph.param.value).toBe(1);
    });

    it('keeps the fade when AudioParam.value has not caught up with a scheduled mute', () => {
        const graph = createFakeFadeGraph();
        Object.defineProperty(graph.param, 'value', { get: () => 1 });
        const envelope = createPlaybackSourceEnvelope(() => graph);
        const token = envelope.prepareStart();
        envelope.finishStart(token);
        expect(graph.param.valueAt(0)).toBe(0);
        expect(graph.param.valueAt(SOURCE_START_HOLD_SECONDS)).toBe(0);
        expect(graph.param.valueAt(SOURCE_START_HOLD_SECONDS + SOURCE_FADE_SECONDS / 2)).toBeCloseTo(0.5);
        expect(graph.param.valueAt(SOURCE_START_HOLD_SECONDS + SOURCE_FADE_SECONDS)).toBe(1);
    });

    it('does not let an old play completion unmute the new source', async () => {
        const graph = createFakeFadeGraph();
        const envelope = createPlaybackSourceEnvelope(() => graph, async () => {});
        const stale = envelope.prepareStart();
        await envelope.beforeChange();
        const current = envelope.prepareStart();
        envelope.finishStart(stale);
        graph.clock.now = 1;
        expect(graph.param.value).toBe(0);
        envelope.finishStart(current);
        graph.clock.now += SOURCE_START_HOLD_SECONDS + SOURCE_FADE_SECONDS;
        expect(graph.param.value).toBe(1);
    });

    it('does not delay a source without a running graph', async () => {
        const graph = createFakeFadeGraph();
        graph.setState('suspended');
        const envelope = createPlaybackSourceEnvelope(() => graph, () => { throw new Error('must not wait'); });
        await envelope.beforeChange();
        await createPlaybackSourceEnvelope(() => null).beforeChange();
    });
});
