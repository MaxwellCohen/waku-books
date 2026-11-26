import { expect, test } from '@playwright/test';
import { evidence } from './helpers';

declare global {
  interface Window {
    __ftThirdParty?: { ranAt: number; readyState: string };
    __ftThirdPartyAsync?: { ranAt: number; readyState: string };
  }
}

test('stand-in scripts are non-blocking (async + injected after load) and eventually run', async ({ page, request }, testInfo) => {
  const html = await (await request.get('/feature-tests/third-party-scripts')).text();
  const head = html.slice(0, html.indexOf('</head>'));
  const asyncTag = head.match(/<script\b[^>]*src="\/ft-third-party-async\.js"[^>]*>/)?.[0];
  expect(asyncTag, 'async script hoisted into <head>').toBeTruthy();
  expect(asyncTag).toMatch(/\basync\b/);
  expect(html, 'lazy script not in server HTML').not.toContain('src="/ft-third-party.js"');
  const blocking = [...head.matchAll(/<script\b[^>]*\bsrc="[^"]*"[^>]*>/g)]
    .map(m => m[0])
    .filter(t => !/\b(async|defer)\b|type="module"/.test(t));
  expect(blocking, 'no parser-blocking external scripts in <head>').toEqual([]);

  await page.goto('/feature-tests/third-party-scripts');
  await page.waitForFunction(() => window.__ftThirdParty && window.__ftThirdPartyAsync);
  const r = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    return { lazy: window.__ftThirdParty!, asyncRun: window.__ftThirdPartyAsync!, loadEnd: nav.loadEventEnd, fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime };
  });
  expect(r.lazy.ranAt).toBeGreaterThanOrEqual(r.loadEnd);
  expect(r.lazy.readyState).toBe('complete');

  evidence(
    testInfo,
    `async tag in head (no blocking scripts); lazy script injected after load: ran at ${r.lazy.ranAt.toFixed(0)}ms ≥ loadEventEnd ${r.loadEnd.toFixed(0)}ms; async ran at ${r.asyncRun.ranAt.toFixed(0)}ms`,
  );
});
