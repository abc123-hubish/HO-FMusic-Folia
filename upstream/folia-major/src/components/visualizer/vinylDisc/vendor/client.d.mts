import type { FoliumVisualizerDef } from '@/mods/folium/contract';
import { resolveThemeFontStack, resolveThemeFontWeight } from '@/utils/fontStacks';

// src/components/visualizer/vinylDisc/vendor/client.d.mts
export default function activate(host: {
    theme: { resolveFontStack: typeof resolveThemeFontStack; resolveFontWeight: typeof resolveThemeFontWeight };
    registries: { visualizers: { register(def: FoliumVisualizerDef): void } };
}): void;
