import { test, expect } from '@playwright/test';

test('Tree visual language — mobile readability', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 1500 });
	await page.goto('/items/frozen-sun');
	await page.waitForLoadState('networkidle');

	const amplifyBtn = page.locator('button[aria-pressed][title="Amplify this signal"]');
	await amplifyBtn.click();
	await expect(page.getByText('Signal searching for scouts')).toBeVisible();

	const treeSection = page.locator('section').filter({ has: page.getByText(/Propagation lineage/i) });
	await treeSection.screenshot({ path: 'tests/screenshots/tvl-mobile-tree.png' });
});
