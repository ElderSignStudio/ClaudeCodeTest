import { test } from '@playwright/test';

test('Zoom into Alice node to inspect clipping', async ({ page }) => {
	await page.setViewportSize({ width: 2400, height: 2000 });
	await page.goto('/items/frozen-sun');
	await page.waitForLoadState('networkidle');
	await page.waitForTimeout(800);

	// Find Alice's row (first row in tree)
	const aliceRow = page.locator('[role="button"]').filter({ hasText: 'Alice' }).first();
	const box = await aliceRow.boundingBox();
	if (!box) throw new Error('Alice row not found');

	// Capture a wide area around Alice's avatar to see clipping context.
	await page.screenshot({
		path: 'tests/screenshots/tvl-clip-zoom.png',
		clip: {
			x: Math.max(0, box.x - 80),
			y: Math.max(0, box.y - 20),
			width: 400,
			height: 200,
		},
	});
});
