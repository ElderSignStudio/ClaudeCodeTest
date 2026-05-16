import { test } from '@playwright/test';

test('Pale Verge — Dan is origin AND current user, debug label shows both overlays', async ({ page }) => {
	await page.setViewportSize({ width: 2200, height: 1800 });
	await page.goto('/items/pale-verge');
	await page.waitForLoadState('networkidle');

	const treeSection = page.locator('section').filter({ has: page.getByText(/Propagation lineage/i) });
	await treeSection.screenshot({ path: 'tests/screenshots/tvl-pale-verge.png' });
});
