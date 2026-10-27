import activate from './vendor/client.mjs';
import type { FoliumVisualizerDef } from '@/mods/folium/contract';
import type { StoredFoliumVisualizer } from '@/mods/folium/registries/visualizers';
import { sanitizeFoliumParams } from '@/mods/folium/params';
import { createFoliumParamAccess } from '@/mods/folium/paramStore';
import { resolveThemeFontStack, resolveThemeFontWeight } from '@/utils/fontStacks';
import { createVinylContext } from './adapter';

// src/components/visualizer/vinylDisc/module.ts
// Capture only the upstream visualizer definition; no desktop mod loader needed.
let definition: FoliumVisualizerDef | undefined;
activate({
    theme: { resolveFontStack: resolveThemeFontStack, resolveFontWeight: resolveThemeFontWeight },
    registries: { visualizers: { register: def => { definition = def; } } },
});
if (!definition) throw new Error('Vinyl Disc did not register a visualizer');
const original = definition;
const schema = sanitizeFoliumParams(original.settings);
export const vinylSettings = createFoliumParamAccess('visualizer:vinyl-disc:disc', schema);
export const vinylVisualizer: StoredFoliumVisualizer = {
    mode: 'vinyl-disc', settings: schema, settingsAccess: vinylSettings,
    hostBackground: true, hostSubtitles: false,
    def: {
        ...original,
        mount: (container, ctx) => {
            const adapter = createVinylContext(container, ctx);
            try {
                const off = original.mount(container, adapter.context);
                adapter.paint();
                return () => { try { if (typeof off === 'function') off(); } finally { adapter.dispose(); } };
            } catch (error) {
                adapter.dispose();
                throw error;
            }
        },
    },
};
