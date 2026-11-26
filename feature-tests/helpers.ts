import { execFileSync } from 'node:child_process';
import path from 'node:path';
import type { TestInfo } from '@playwright/test';

export const ROOT = path.resolve(import.meta.dirname, '..');

/** Attach a one-line observation; run.mjs copies these into results.json. */
export function evidence(testInfo: TestInfo, text: string) {
  testInfo.annotations.push({ type: 'evidence', description: text });
}

/** Run `waku build` with extra env (used by build-time features). */
export function wakuBuild(env: Record<string, string>) {
  const clean = { ...process.env };
  for (const k of ['VERCEL', 'NETLIFY', 'CLOUDFLARE', 'WORKERS_CI', 'ANALYZE', 'FT_DIST_DIR']) delete clean[k];
  return execFileSync(path.join(ROOT, 'node_modules/.bin/waku'), ['build'], {
    cwd: ROOT,
    env: { ...clean, POSTGRES_URL: '', ...env },
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    maxBuffer: 64 * 1024 * 1024,
  });
}

export function between(html: string, re: RegExp) {
  return html.match(re)?.[1];
}
