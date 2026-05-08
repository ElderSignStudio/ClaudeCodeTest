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

/**
 * Three review viewports — one per atmospheric accent:
 *   1. Top viewport (Best Picks faint blue orbit)
 *   2. Breaking Out (kinetic teal momentum)
 *   3. Origin Stories (cinematic violet memory field)
 */
test('lane accent viewports', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(800);

  await page.screenshot({
    path: 'tests/screenshots/full-page.png',
    fullPage: true,
  });

  // 1. Top viewport — Best Picks visible from the start
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }));
  await page.waitForTimeout(200);
  await page.screenshot({ path: 'tests/screenshots/viewport-top.png', fullPage: false });

  const positions = await page.evaluate(() => {
    const sections = Array.from(document.querySelectorAll('main section'));
    return sections.map((s) => {
      const r = s.getBoundingClientRect();
      return { top: r.top + window.scrollY, bottom: r.bottom + window.scrollY };
    });
  });

  // 2. Breaking Out — center the BO lane vertically in viewport
  const boCenter = (positions[3].top + positions[3].bottom) / 2;
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' as ScrollBehavior }), boCenter - 450);
  await page.waitForTimeout(200);
  await page.screenshot({ path: 'tests/screenshots/viewport-breaking-out.png', fullPage: false });

  // 3. Origin Stories — center the OS lane vertically in viewport
  const osCenter = (positions[6].top + positions[6].bottom) / 2;
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' as ScrollBehavior }), osCenter - 450);
  await page.waitForTimeout(200);
  await page.screenshot({ path: 'tests/screenshots/viewport-origin-stories.png', fullPage: false });
});
