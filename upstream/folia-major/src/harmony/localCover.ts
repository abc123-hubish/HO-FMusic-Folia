// src/harmony/localCover.ts
// Requests the HarmonyOS host to look up NetEase artwork and return a same-origin cover URL.
// The host downloads the image into the app sandbox, so ArkWeb never depends on provider CORS
// or mixed-content rules for local-library covers.

export interface HarmonyLocalCoverInput {
    title: string;
    artist?: string;
    durationMs?: number;
}

export interface HarmonyLocalCoverResult {
    url: string;
    songId?: number;
    title?: string;
    artist?: string;
}

interface HarmonyLocalCoverReply {
    ok?: boolean;
    url?: string;
    songId?: number;
    title?: string;
    artist?: string;
    error?: string;
}

const pending = new Map<string, {
    resolve(value: HarmonyLocalCoverResult | null): void;
    timer: number;
}>();

let sequence = 0;

export const hasHarmonyLocalCoverBridge = (): boolean => (
    typeof window !== 'undefined'
    && typeof window.FoliaNative?.requestLocalCover === 'function'
);

export const requestHarmonyLocalCover = (
    input: HarmonyLocalCoverInput,
): Promise<HarmonyLocalCoverResult | null> => new Promise(resolve => {
    const native = window.FoliaNative;
    if (!native?.requestLocalCover) {
        resolve(null);
        return;
    }
    const id = `cover-${Date.now()}-${++sequence}`;
    const timer = window.setTimeout(() => {
        pending.delete(id);
        resolve(null);
    }, 20000);
    pending.set(id, { resolve, timer });
    try {
        native.requestLocalCover(id, JSON.stringify(input));
    } catch {
        pending.delete(id);
        window.clearTimeout(timer);
        resolve(null);
    }
});

export const installHarmonyLocalCover = (): void => {
    window.HarmonyCover = {
        receive(id: string, payload: string): void {
            const request = pending.get(id);
            if (!request) return;
            pending.delete(id);
            window.clearTimeout(request.timer);
            try {
                const reply = JSON.parse(payload) as HarmonyLocalCoverReply;
                if (!reply.ok || !reply.url) {
                    request.resolve(null);
                    return;
                }
                request.resolve({
                    url: reply.url,
                    songId: reply.songId,
                    title: reply.title,
                    artist: reply.artist,
                });
            } catch {
                request.resolve(null);
            }
        },
    };
};
