import { expect, test } from '@playwright/test';
import { evidence } from './helpers';

const STATIC_MARKER = 'ft-static-only-marker-91c2';
const ISLAND_MARKER = 'ft-island-marker-5d1e';

test('static server component ships no JS; client island hydrates; lazy slice streams in separately', async ({ page, request }, testInfo) => {
  const scripts = new Map<string, string>();
  const rscRequests: string[] = [];
  page.on('request', req => {
    if (req.url().includes('/RSC/')) rscRequests.push(new URL(req.url()).pathname);
  });
  page.on('response', async res => {
    const type = res.headers()['content-type'] ?? '';
    if (res.request().resourceType() === 'script' || type.includes('javascript')) {
      scripts.set(res.url(), await res.text().catch(() => ''));
    }
  });

  const html = await (await request.get('/feature-tests/islands')).text();
  expect(html).toContain('data-testid="static-block"');
  expect(html, 'lazy slice is not in the initial HTML').not.toContain('data-testid="server-island"');

  await page.goto('/feature-tests/islands');
  await expect(page.getByTestId('static-block')).toBeVisible();
  await expect(page.getByTestId('server-island')).toBeVisible();
  await page.waitForLoadState('networkidle');

  await page.getByTestId('island-button').click();
  await page.getByTestId('island-button').click();
  await expect(page.getByTestId('island-count')).toHaveText('2');

  const all = [...scripts.values()].join('\n');
  expect(all, 'static component code shipped to client').not.toContain(STATIC_MARKER);
  expect(html).not.toContain(STATIC_MARKER);
  expect(all, 'positive control: island code is shipped').toContain(ISLAND_MARKER);
  const sliceReqs = rscRequests.filter(p => p.includes('ft-server-island'));
  expect(sliceReqs.length).toBeGreaterThan(0);

  evidence(
    testInfo,
    `island counter → 2 after clicks; static marker absent from ${scripts.size} JS files + HTML (island marker present); lazy slice fetched via ${sliceReqs[0]}`,
  );
});
