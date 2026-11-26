import { defineConfig } from '@playwright/test';

const PORT = Number(process.env.FT_PORT ?? 4115);

export default defineConfig({
  testDir: '.',
  testMatch: '*.spec.ts',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  outputDir: './.test-results',
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    browserName: 'chromium',
    viewport: { width: 1280, height: 800 },
    launchOptions: { executablePath: process.env.FT_CHROME ?? '/home/maxc/.local/bin/google-chrome' },
  },
  webServer: {
    // Production server for the build produced by feature-tests/run.mjs.
    command: `node_modules/.bin/waku start --port ${PORT}`,
    cwd: '..',
    env: { POSTGRES_URL: '' },
    url: `http://127.0.0.1:${PORT}/feature-tests`,
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
