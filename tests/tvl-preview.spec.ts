import { test } from '@playwright/test';

test('Tree visual language — preview state before Amplify', async ({ page }) => {
	await page.setViewportSize({ width: 1600, height: 1200 });
	await page.goto('/items/frozen-sun');
	await page.waitForLoadState('networkidle');

	const treeSection = page.locator('section').filter({ has: page.getByText(/Propagation lineage/i) });
	await treeSection.screenshot({ path: 'tests/screenshots/tvl-v2-preview.png' });
});
