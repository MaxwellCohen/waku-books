import path from 'node:path';
import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig } from 'waku/config';

const isCloudflare = Boolean(process.env.CLOUDFLARE);

export default defineConfig({
  vite: {
    define: {
      'import.meta.env.CLOUDFLARE': JSON.stringify(isCloudflare),
    },
    plugins: [tailwindcss(), react(), babel({ presets: [reactCompilerPreset()] })],
    resolve: {
      alias: {
        '@': path.resolve('./src'),
      },
    },
  },
});
