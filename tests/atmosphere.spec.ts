import { test } from '@playwright/test';

/**
 * Background polish validation.
 * Captures three scrolled viewport positions matching the spec's review checklist:
 *   1. top    — Best Picks + One Step Away
 *   2. middle — Breaking Out + Human Signals
 *   3. lower  — Outside the Bubble + Origin Stories
 * Plus a full-page screenshot for overall feel.
 */
test('background polish viewports', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(800);

  await page.screenshot({
    path: 'tests/screenshots/full-page.png',
    fullPage: true,
  });

  const sections = await page.locator('main section').all();

  const viewports: Array<{ label: string; sectionIndex: number }> = [
    { label: 'top-bestpicks-osa', sectionIndex: 0 },
    { label: 'middle-bo-hs', sectionIndex: 3 },
    { label: 'lower-otb-os', sectionIndex: 5 },
  ];

  for (const v of viewports) {
    await sections[v.sectionIndex].scrollIntoViewIfNeeded();
    // Settle a moment for any post-scroll layout
    await page.waitForTimeout(200);
    await page.screenshot({
      path: `tests/screenshots/${v.label}.png`,
      fullPage: false,
    });
  }
});
