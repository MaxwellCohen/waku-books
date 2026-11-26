import { expect, test } from '@playwright/test';
import { evidence } from './helpers';

test('Geist is self-hosted, has font-display, and is preloaded', async ({ page, request, baseURL }, testInfo) => {
  const requests: string[] = [];
  const fontRequests: string[] = [];
  page.on('request', req => {
    requests.push(req.url());
    if (req.resourceType() === 'font') fontRequests.push(req.url());
  });

  const html = await (await request.get('/feature-tests/font-optimization')).text();
  const preloads = [...html.matchAll(/<link\b[^>]*rel="preload"[^>]*>/g)].map(m => m[0]).filter(l => /as="font"/.test(l));
  expect(preloads.length, '<link rel=preload as=font>').toBeGreaterThan(0);
  const preloadHref = preloads[0].match(/href="([^"]+)"/)![1];

  await page.goto('/feature-tests/font-optimization');
  await page.evaluate(() => document.fonts.ready);
  const loaded = await page.evaluate(() => document.fonts.check('32px "Geist Variable"'));
  expect(loaded).toBe(true);

  expect(requests.filter(u => /fonts\.(googleapis|gstatic)\.com/.test(u))).toEqual([]);
  expect(fontRequests.length).toBeGreaterThan(0);
  const origin = new URL(baseURL!).origin;
  for (const u of fontRequests) expect(new URL(u).origin).toBe(origin);
  expect(fontRequests.some(u => u.endsWith(preloadHref))).toBe(true);

  const cssHrefs = [...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*>/g)].map(m => m[0].match(/href="([^"]+)"/)![1]);
  let css = '';
  for (const href of cssHrefs) css += await (await request.get(href)).text();
  const faces = [...css.matchAll(/@font-face\s*{([^}]*)}/g)].map(m => m[1]).filter(b => b.includes('Geist Variable'));
  expect(faces.length).toBeGreaterThan(0);
  for (const face of faces) expect(face).toMatch(/font-display:\s*\w+/);
  const display = faces[0].match(/font-display:\s*(\w+)/)![1];

  evidence(
    testInfo,
    `0 Google Fonts requests; ${fontRequests.length} same-origin font request(s); ${faces.length} Geist @font-face rules all with font-display:${display}; preload ${preloadHref}`,
  );
});
