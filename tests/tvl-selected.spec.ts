import { test } from '@playwright/test';

test('Tree visual language — selected state still overrides nodeKind', async ({ page }) => {
	await page.setViewportSize({ width: 1600, height: 1200 });
	await page.goto('/items/frozen-sun');
	await page.waitForLoadState('networkidle');

	// Click Marco (origin + bridge + successful-amplifier). Selected state
	// should win on row bg/ring; nk-bridge halo should still compose
	// underneath; ORIGIN label should still appear.
	await page.getByText('Marco', { exact: true }).first().click();

	const treeSection = page.locator('section').filter({ has: page.getByText(/Propagation lineage/i) });
	await treeSection.screenshot({ path: 'tests/screenshots/tvl-marco-selected.png' });
});
