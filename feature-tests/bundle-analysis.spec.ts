import { existsSync, readFileSync, rmSync, statSync } from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import { evidence, ROOT, wakuBuild } from './helpers';

test('ANALYZE=1 waku build writes a rollup-plugin-visualizer report', async ({}, testInfo) => {
  test.setTimeout(300_000);
  const dist = 'dist-ft-analyze';
  rmSync(path.join(ROOT, dist), { recursive: true, force: true });
  wakuBuild({ ANALYZE: '1', FT_DIST_DIR: dist });

  const htmlReport = path.join(ROOT, dist, 'analyze/stats.html');
  const jsonReport = path.join(ROOT, dist, 'analyze/stats.json');
  expect(existsSync(htmlReport)).toBe(true);
  expect(existsSync(jsonReport)).toBe(true);
  const data = JSON.parse(readFileSync(jsonReport, 'utf8'));
  const modules = Object.values<{ id: string }>(data.nodeMetas ?? {}).map(m => m.id);
  expect(modules.some(id => id.includes('signal-counter'))).toBe(true);

  evidence(
    testInfo,
    `${dist}/analyze/stats.html (${statSync(htmlReport).size} B) + stats.json (${modules.length} modules, includes signal-counter.tsx)`,
  );
});
