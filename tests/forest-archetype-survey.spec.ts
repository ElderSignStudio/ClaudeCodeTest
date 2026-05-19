import { test } from '@playwright/test';

/*
  Survey screenshots — captures the propagation tree for several distinct
  items so we can compare the procedurally generated forests side by side.
  Each itemId hashes to one of six archetypes (hub-dominant, fragmented,
  late-bloomer, deep-chain, bursty, sparse) so different items should
  feel structurally different.
*/

const ITEMS = [
	'frozen-sun',         // marco-sourced
	'hollow-coast',       // alice-sourced
	'pale-verge',         // dan-sourced
	'soft-border',        // dan-sourced
	'wolves-under-glass', // yuki-sourced
	'iron-weather',       // alice-sourced
	'cinder-plain',       // marco-sourced
	'soft-collapse',      // dan-sourced
];

for (const itemId of ITEMS) {
	test(`Forest survey — ${itemId}`, async ({ page }) => {
		await page.setViewportSize({ width: 1800, height: 2400 });
		await page.goto(`/items/${itemId}`);
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(300);

		const treeSection = page.locator('section').filter({ has: page.getByText(/Propagation lineage/i) });
		await treeSection.screenshot({ path: `tests/screenshots/forest-${itemId}.png` });
	});
}
