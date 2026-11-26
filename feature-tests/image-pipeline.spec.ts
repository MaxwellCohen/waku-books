import { expect, test } from '@playwright/test';
import { evidence } from './helpers';

function widths(srcset: string) {
  return srcset.split(',').map(s => Number(s.trim().split(/\s+/)[1]?.replace('w', '')));
}

test('build-time srcset, dimensions, lazy loading, and modern formats', async ({ page, request }, testInfo) => {
  const coverB: string[] = [];
  page.on('request', req => {
    if (req.url().includes('ft-cover-b')) coverB.push(req.url());
  });
  await page.goto('/feature-tests/image-pipeline');
  await page.waitForLoadState('networkidle');

  const hero = page.getByTestId('hero-image');
  const heroSrcset = (await hero.getAttribute('srcset'))!;
  const heroWidths = widths(heroSrcset);
  expect(new Set(heroWidths).size).toBeGreaterThanOrEqual(2);
  expect(await hero.getAttribute('width')).toBeTruthy();
  expect(await hero.getAttribute('height')).toBeTruthy();

  const lazy = page.getByTestId('lazy-image');
  expect(await lazy.getAttribute('loading')).toBe('lazy');
  expect(await lazy.getAttribute('width')).toBeTruthy();
  expect(await lazy.getAttribute('height')).toBeTruthy();
  expect(coverB, 'offscreen lazy image not fetched before scroll').toEqual([]);

  await lazy.scrollIntoViewIfNeeded();
  await expect.poll(() => coverB.length).toBeGreaterThan(0);
  await expect.poll(() => lazy.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);

  const heroUrl = heroSrcset.split(',')[0].trim().split(/\s+/)[0];
  const lazyUrl = (await lazy.getAttribute('srcset'))!.split(',')[0].trim().split(/\s+/)[0];
  const heroType = (await request.get(heroUrl)).headers()['content-type'];
  const lazyType = (await request.get(lazyUrl)).headers()['content-type'];
  expect(heroType).toMatch(/image\/(webp|avif)/);
  expect(lazyType).toMatch(/image\/(webp|avif)/);

  evidence(
    testInfo,
    `srcset widths ${heroWidths.join('/')}w with width/height; lazy img fetched only after scroll; ${heroUrl}→${heroType}, ${lazyUrl}→${lazyType}`,
  );
});
