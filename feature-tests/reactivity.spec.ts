import { expect, test } from '@playwright/test';
import { evidence } from './helpers';

test('@preact/signals-react updates bound text without re-running the component', async ({ page }, testInfo) => {
  await page.goto('/feature-tests/reactivity');
  await page.waitForFunction(() => (window.__ftSignalRenders ?? 0) >= 1 && (window.__ftStateRenders ?? 0) >= 1);
  await page.waitForLoadState('networkidle');
  const before = await page.evaluate(() => ({ s: window.__ftSignalRenders!, u: window.__ftStateRenders! }));
  expect(before.s).toBe(1);

  for (let i = 0; i < 3; i++) await page.getByTestId('signal-inc').click();
  await expect(page.getByTestId('signal-text')).toHaveText('3');
  const afterSignal = await page.evaluate(() => window.__ftSignalRenders!);
  expect(afterSignal).toBe(1);

  for (let i = 0; i < 3; i++) await page.getByTestId('state-inc').click();
  await expect(page.getByTestId('state-text')).toHaveText('3');
  const afterState = await page.evaluate(() => window.__ftStateRenders!);
  expect(afterState).toBe(before.u + 3);

  evidence(
    testInfo,
    `signal text 0→3 with SignalCounter renders ${before.s}→${afterSignal}; useState control renders ${before.u}→${afterState}`,
  );
});
