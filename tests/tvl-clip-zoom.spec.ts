import { test } from '@playwright/test';

test('Zoom into Alice node to inspect clipping', async ({ page }) => {
	await page.setViewportSize({ width: 2400, height: 2000 });
	await page.goto('/items/frozen-sun');
	await page.waitForLoadState('networkidle');
	await page.waitForTimeout(800);

	// Capture the first tree row for inspection (whoever that is — the
	// forest is procedurally generated, so the first-root scout varies
	// per item).
	const firstRow = page.locator('section')
		.filter({ has: page.getByText(/Propagation lineage/i) })
		.locator('[role="button"]').first();
	const box = await firstRow.boundingBox();
	if (!box) throw new Error('First tree row not found');

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
