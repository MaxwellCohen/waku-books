import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import { evidence, ROOT } from './helpers';

const stamp = (html: string) => html.match(/data-testid="rendered-at">([^<]+)</)![1];

test("getConfig render 'static' is prerendered; render 'dynamic' renders per request", async ({ request }, testInfo) => {
  const staticFile = path.join(ROOT, 'dist/public/feature-tests/render-modes/static/index.html');
  const dynamicFile = path.join(ROOT, 'dist/public/feature-tests/render-modes/dynamic/index.html');
  expect(existsSync(staticFile)).toBe(true);
  expect(existsSync(dynamicFile)).toBe(false);
  const built = stamp(readFileSync(staticFile, 'utf8'));

  const s1 = stamp(await (await request.get('/feature-tests/render-modes/static')).text());
  await new Promise(r => setTimeout(r, 50));
  const s2 = stamp(await (await request.get('/feature-tests/render-modes/static')).text());
  expect(s1).toBe(built);
  expect(s2).toBe(built);

  const d1 = stamp(await (await request.get('/feature-tests/render-modes/dynamic')).text());
  await new Promise(r => setTimeout(r, 50));
  const d2 = stamp(await (await request.get('/feature-tests/render-modes/dynamic')).text());
  expect(d1).not.toBe(d2);

  evidence(
    testInfo,
    `static: dist/public/.../static/index.html exists, served stamp ${built} on both requests; dynamic: no HTML file, stamps ${d1} → ${d2}`,
  );
});
