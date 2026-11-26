import path from 'node:path';
import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { imagetools } from 'vite-imagetools';
import { defineConfig } from 'waku/config';
import type { VitePlugin } from 'waku/config';

const isCloudflare = Boolean(process.env.CLOUDFLARE);

// Feature tests: build into an alternate dist dir (multi-host / analyzer builds)
// so they never clobber the `dist` being served.
const distDir = process.env.FT_DIST_DIR || 'dist';

// Feature tests: `ANALYZE=1 waku build` writes a client bundle report
// (rollup-plugin-visualizer) into `<distDir>/analyze/`.
function analyzerPlugins(): VitePlugin[] {
  if (!process.env.ANALYZE) return [];
  const clientOnly = (plugin: VitePlugin): VitePlugin => ({
    ...plugin,
    applyToEnvironment: env => env.name === 'client',
  });
  return [
    clientOnly(
      visualizer({ filename: path.resolve(distDir, 'analyze/stats.html'), template: 'treemap' }) as VitePlugin,
    ),
    clientOnly(
      visualizer({ filename: path.resolve(distDir, 'analyze/stats.json'), template: 'raw-data' }) as VitePlugin,
    ),
  ];
}

export default defineConfig({
  distDir,
  vite: {
    define: {
      'import.meta.env.CLOUDFLARE': JSON.stringify(isCloudflare),
    },
    plugins: [
      tailwindcss(),
      react(),
      babel({ presets: [reactCompilerPreset()] }),
      imagetools(),
      ...analyzerPlugins(),
    ],
    resolve: {
      alias: {
        '@': path.resolve('./src'),
      },
    },
  },
});
