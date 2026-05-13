import { test } from '@playwright/test';

test('item detail page renders and supports navigation flow', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/items/ember-field');
  await page.waitForLoadState('networkidle');

  // Full-page screenshot of the detail page in its initial (global) state.
  await page.screenshot({
    path: 'tests/screenshots/item-detail-global.png',
    fullPage: true,
  });

  // Click a tree node (Marco) and screenshot the user-selected inspector state.
  // The propagation node renders the user's name in a <p> with the user's id
  // unreliable in DOM, so we find by text.
  const marcoRow = page.getByRole('button', { name: 'Marco', exact: false }).first();
  if (await marcoRow.count() > 0) {
    await marcoRow.click({ force: true });
    await page.waitForTimeout(150);
    await page.screenshot({
      path: 'tests/screenshots/item-detail-user-selected.png',
      fullPage: true,
    });
  }

  // Click hero to reset.
  await page.getByRole('button', { name: /reset to global/i }).click({ force: true });
  await page.waitForTimeout(150);

  // Mobile viewport stack.
  await page.setViewportSize({ width: 420, height: 900 });
  await page.waitForTimeout(150);
  await page.screenshot({
    path: 'tests/screenshots/item-detail-mobile.png',
    fullPage: true,
  });
});
