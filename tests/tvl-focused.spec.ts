import { test } from '@playwright/test';

/* Focused tree screenshot for visual review at higher resolution. */
test('Tree visual language — focused tree screenshot', async ({ page }) => {
	await page.setViewportSize({ width: 1600, height: 1200 });
	await page.goto('/items/frozen-sun');
	await page.waitForLoadState('networkidle');

	// Amplify so Dan + placeholder appears.
	const amplifyBtn = page.locator('button[aria-pressed][title="Amplify this signal"]');
	await amplifyBtn.click();
	await page.waitForTimeout(200);

	// Screenshot just the propagation tree section.
	const treeSection = page.locator('section').filter({ has: page.getByText(/Propagation lineage/i) });
	await treeSection.screenshot({ path: 'tests/screenshots/tvl-focused-tree.png' });
});
