import { expect, test, type APIRequestContext, type Page } from '@playwright/test';
import { evidence } from './helpers';

const TTL_MS = 4_000;

async function read(request: APIRequestContext) {
  const html = await (await request.get('/feature-tests/caching')).text();
  return {
    cached: html.match(/data-testid="cached-stamp">([^<]+)</)![1],
    uncached: html.match(/data-testid="uncached-stamp">([^<]+)</)![1],
  };
}

async function invalidate(page: Page) {
  await page.goto('/feature-tests/caching');
  await page.waitForLoadState('networkidle');
  await page.getByTestId('invalidate').click();
  await expect(page.getByTestId('invalidated')).toBeVisible();
}

test('waku-cache cache.fn reuses within TTL, refreshes after TTL and on invalidate', async ({ page, request }, testInfo) => {
  await invalidate(page);
  const a = await read(request);
  const b = await read(request);
  expect(b.cached).toBe(a.cached);
  expect(b.uncached).not.toBe(a.uncached);

  await new Promise(r => setTimeout(r, TTL_MS + 750));
  const c = await read(request);
  expect(c.cached).not.toBe(a.cached);
  const c2 = await read(request);
  expect(c2.cached).toBe(c.cached);

  await invalidate(page);
  const d = await read(request);
  expect(d.cached).not.toBe(c.cached);
  const e = await read(request);
  expect(e.cached).toBe(d.cached);

  evidence(
    testInfo,
    `2 requests → same cached value ${a.cached} (uncached differed); after ${TTL_MS}ms TTL → ${c.cached} (then reused); after cache.invalidate server action → ${d.cached} (then reused)`,
  );
});
