import { expect, test } from '@playwright/test';
import { evidence } from './helpers';

test('hover (router.prefetch) and in-view (Link unstable_prefetchOnView) prefetch before click', async ({ page }, testInfo) => {
  const log: { url: string; t: number }[] = [];
  page.on('request', req => log.push({ url: req.url(), t: Date.now() }));
  const hits = (slug: string) => log.filter(r => r.url.includes(`/RSC/`) && r.url.includes(`route-prefetching/${slug}`));

  await page.goto('/feature-tests/route-prefetching');
  await page.waitForLoadState('networkidle');
  expect(hits('hover')).toEqual([]);
  expect(hits('view')).toEqual([]);

  await page.getByTestId('hover-link').hover();
  await expect.poll(() => hits('hover').length).toBeGreaterThan(0);
  const hoverReq = hits('hover')[0];

  await page.getByTestId('view-link').scrollIntoViewIfNeeded();
  await expect.poll(() => hits('view').length).toBeGreaterThan(0);
  const viewReq = hits('view')[0];

  const clickAt = Date.now();
  await page.getByTestId('view-link').click();
  await expect(page.getByTestId('prefetch-target')).toContainText('view');
  expect(viewReq.t).toBeLessThan(clickAt);
  expect(hoverReq.t).toBeLessThan(clickAt);

  evidence(
    testInfo,
    `hover → ${new URL(hoverReq.url).pathname} before click; scroll into view → ${new URL(viewReq.url).pathname} before click`,
  );
});
