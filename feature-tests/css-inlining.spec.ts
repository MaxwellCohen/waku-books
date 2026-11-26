import { expect, test } from '@playwright/test';
import { evidence } from './helpers';

const MARKER = 'ft-inline-marker-7f3a';

test('route CSS is inlined in <head> and not shipped as a render-blocking stylesheet', async ({ page, request }, testInfo) => {
  const html = await (await request.get('/feature-tests/css-inlining')).text();
  const head = html.slice(0, html.indexOf('</head>'));

  const inlineStyle = [...head.matchAll(/<style\b([^>]*)>([\s\S]*?)<\/style>/g)].find(m => m[2].includes(MARKER));
  expect(inlineStyle, 'inline <style> containing the route CSS inside <head>').toBeTruthy();

  const stylesheetHrefs = [...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*>/g)].map(
    m => m[0].match(/href="([^"]+)"/)![1],
  );
  for (const href of stylesheetHrefs) {
    const css = await (await request.get(href)).text();
    expect(css, `linked stylesheet ${href} must not carry the route CSS`).not.toContain(MARKER);
  }

  await page.goto('/feature-tests/css-inlining');
  const outline = await page.getByTestId('inline-styled').evaluate(el => getComputedStyle(el).outlineStyle);
  expect(outline).toBe('dashed');

  evidence(
    testInfo,
    `<style${inlineStyle![1]}> in <head> holds .${MARKER}; ${stylesheetHrefs.length} linked stylesheet(s) (${stylesheetHrefs.join(', ')}) don't contain it; computed outline=dashed`,
  );
});
