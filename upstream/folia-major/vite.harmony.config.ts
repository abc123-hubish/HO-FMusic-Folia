import { defineConfig, type PluginOption } from 'vite';
import original from './vite.config';

// HarmonyOS packages the complete renderer locally; service workers are unnecessary inside ArkWeb.
export default defineConfig(async (env) => {
  const config = await original(env);
  const plugins: PluginOption[] = [];
  const collect = (list: PluginOption[]): void => {
    for (const plugin of list) {
      if (Array.isArray(plugin)) collect(plugin);
      else plugins.push(plugin);
    }
  };
  collect(config.plugins ?? []);
  return {
    ...config,
    base: './',
    plugins: plugins.filter(plugin => plugin && typeof plugin === 'object' &&
      'name' in plugin && !String(plugin.name).includes('pwa')),
    build: {
      ...config.build,
      outDir: 'dist-harmony',
      rollupOptions: {
        ...config.build?.rollupOptions,
        input: 'harmony.html',
      },
    },
  };
});
