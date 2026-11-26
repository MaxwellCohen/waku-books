#!/usr/bin/env node
// Build the app for production, run the feature specs against `waku start`, write results.json.
import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const here = path.join(root, 'feature-tests');
const env = { ...process.env, POSTGRES_URL: '' };
for (const k of ['VERCEL', 'NETLIFY', 'CLOUDFLARE', 'WORKERS_CI', 'ANALYZE', 'FT_DIST_DIR']) delete env[k];

console.log('> waku build');
execFileSync(path.join(root, 'node_modules/.bin/waku'), ['build'], { cwd: root, env, stdio: 'inherit' });

const reportFile = path.join(here, '.report.json');
rmSync(reportFile, { force: true });
console.log('> playwright test');
const run = spawnSync(
  path.join(root, 'node_modules/.bin/playwright'),
  ['test', '-c', 'feature-tests/playwright.config.ts', '--reporter=list,json'],
  { cwd: root, env: { ...env, PLAYWRIGHT_JSON_OUTPUT_NAME: reportFile }, stdio: 'inherit' },
);

const report = JSON.parse(readFileSync(reportFile, 'utf8'));
const meta = JSON.parse(readFileSync(path.join(here, 'meta.json'), 'utf8'));

const byFile = {};
const walk = suite => {
  for (const spec of suite.specs ?? []) {
    const file = path.basename(spec.file);
    for (const t of spec.tests) {
      const last = t.results.at(-1);
      (byFile[file] ??= []).push({
        title: spec.title,
        ok: t.status === 'expected',
        evidence: last?.annotations?.filter(a => a.type === 'evidence').map(a => a.description) ?? [],
        error: last?.error?.message?.split('\n')[0]?.replace(/\u001b\[\d+m/g, ''),
      });
    }
  }
  for (const s of suite.suites ?? []) walk(s);
};
for (const s of report.suites) walk(s);

const results = {};
for (const [id, m] of Object.entries(meta)) {
  const file = `${id}.spec.ts`;
  const tests = byFile[file] ?? [];
  const pass = tests.length > 0 && tests.every(t => t.ok);
  const status = m.blocked ? 'blocked' : pass ? 'pass' : 'fail';
  const evidence = pass
    ? tests.flatMap(t => t.evidence).join(' | ')
    : tests.filter(t => !t.ok).map(t => `${t.title}: ${t.error ?? 'no result'}`).join(' | ') || 'spec did not run';
  results[id] = {
    claimedLabel: m.claimedLabel,
    status,
    method: m.method,
    evidence: m.note ? `${evidence} — ${m.note}` : evidence,
    ...(m.suggestedLabel ? { suggestedLabel: m.suggestedLabel } : {}),
    test: `feature-tests/${file}`,
  };
}

const commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
writeFileSync(
  path.join(here, 'results.json'),
  JSON.stringify({ framework: 'waku', repo: 'waku-books', commit, ranAt: new Date().toISOString(), results }, null, 2) + '\n',
);
console.log(Object.entries(results).map(([k, v]) => `${v.status.padEnd(7)} ${k}`).join('\n'));
process.exit(run.status ?? 1);
