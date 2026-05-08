import { test } from '@playwright/test';

/**
 * Atmospheric calibration screenshots.
 * Captures full page + cropped strips that isolate the atmospheric regions
 * so colored substrate is visible without card content competing.
 */
test('atmosphere screenshots', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(800);

  await page.screenshot({
    path: 'tests/screenshots/full-page.png',
    fullPage: true,
  });

  const sections = await page.locator('main section').all();
  const labels = ['best-picks', 'one-step-away', 'deep-underground', 'breaking-out', 'human-signals', 'outside-bubble', 'origin-stories', 'drift'];

  for (let i = 0; i < sections.length; i++) {
    const label = labels[i] ?? `section-${i}`;
    await sections[i].scrollIntoViewIfNeeded();
    await page.waitForTimeout(150);
    const box = await sections[i].boundingBox();
    if (!box) continue;

    // Top atmospheric strip: first 90px of the section, where the colored
    // atmosphere is most concentrated (radial centers sit at top: -25% to -45%).
    await page.screenshot({
      path: `tests/screenshots/strip-${i}-${label}.png`,
      clip: {
        x: Math.max(0, box.x - 8),
        y: box.y,
        width: Math.min(1440 - box.x + 8, box.width + 16),
        height: 90,
      },
    });

    await sections[i].screenshot({
      path: `tests/screenshots/section-${i}-${label}.png`,
    });
  }
});
