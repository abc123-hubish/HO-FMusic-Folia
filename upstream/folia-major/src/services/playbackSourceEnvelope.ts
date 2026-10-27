import { playbackFade } from './playbackFade';

// src/services/playbackSourceEnvelope.ts
// A short, always-on envelope for source replacement, independent of the optional pause fade.

export const SOURCE_FADE_SECONDS = 0.025;
export const SOURCE_START_HOLD_SECONDS = 0.02;
const SOURCE_FADE_GRACE_MS = 15;

type SourceGraph = { context: AudioContext; gain: GainNode };

export const createPlaybackSourceEnvelope = (
    getGraph: () => SourceGraph | null,
    wait: (ms: number) => Promise<void> = ms => new Promise(resolve => setTimeout(resolve, ms)),
) => {
    let generation = 0;
    let scheduled: { node: GainNode; start: number; end: number; from: number; to: number } | null = null;

    // AudioParam.value can still expose the old render quantum when prepare and play settle
    // at the same audio time. Keep this envelope's own linear timeline instead of reading it back.
    const ramp = ({ context, gain }: SourceGraph, to: number, seconds: number, hold = 0) => {
        const now = context.currentTime;
        let from = 1;
        if (scheduled?.node === gain) {
            const progress = scheduled.end <= scheduled.start ? 1
                : Math.min(1, Math.max(0, (now - scheduled.start) / (scheduled.end - scheduled.start)));
            from = scheduled.from + (scheduled.to - scheduled.from) * progress;
        }
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(seconds > 0 ? from : to, now);
        if (hold > 0) gain.gain.setValueAtTime(from, now + hold);
        if (seconds > 0) gain.gain.linearRampToValueAtTime(to, now + hold + seconds);
        scheduled = { node: gain, start: now + hold, end: now + hold + seconds, from: seconds > 0 ? from : to, to };
    };

    // Finish on the audio thread before React replaces src or releases the outgoing blob URL.
    const beforeChange = async () => {
        playbackFade.flush();
        generation += 1;
        const graph = getGraph();
        if (!graph || graph.context.state !== 'running') return;
        ramp(graph, 0, SOURCE_FADE_SECONDS);
        await wait(SOURCE_FADE_SECONDS * 1000 + SOURCE_FADE_GRACE_MS);
    };

    const prepareStart = () => {
        const token = ++generation;
        const graph = getGraph();
        if (graph) ramp(graph, 0, 0);
        return token;
    };

    const finishStart = (token: number) => {
        if (token !== generation) return;
        const graph = getGraph();
        // play() can settle a few render quanta before decoded samples reach this graph. Keep
        // that startup edge muted, then open on the audio clock even if the page becomes busy.
        if (graph) ramp(graph, 1, SOURCE_FADE_SECONDS, SOURCE_START_HOLD_SECONDS);
    };

    return { beforeChange, prepareStart, finishStart, needsStart: () => scheduled?.to === 0 };
};

let graph: SourceGraph | null = null;
export const registerPlaybackSourceGraph = (next: SourceGraph | null) => { graph = next; };
export const playbackSourceEnvelope = createPlaybackSourceEnvelope(() => graph);

let requestRevision = 0;
/** One request order across local, Navidrome and online loaders, including rapid mixed-source skips. */
export const beginPlaybackSourceRequest = () => {
    const revision = ++requestRevision;
    return () => revision === requestRevision;
};
