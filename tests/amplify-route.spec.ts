import { test, expect } from '@playwright/test';

/*
  Verifies the Item Detail amplify behavior on a route page where Dan is NOT
  the source scout. Frozen Sun routes through Marco (sourceScoutId: 'marco').
  Expected: route context wins — Dan must appear (preview or real) under
  Marco, never as a root origin, regardless of whether Dan also lives
  elsewhere in the mock forest.
*/

test('Frozen Sun via Marco — preview, amplify, un-amplify cycle', async ({ page }) => {
	await page.goto('/items/frozen-sun');
	await page.waitForLoadState('networkidle');

	// (A) Initial state — should show preview, NOT amplified.
	// Scope to the hero button (has aria-pressed). BottomPlayer also has an
	// "Amplify this signal" button so we filter by aria-pressed presence.
	const amplifyBtn = page.locator('button[aria-pressed][title="Amplify this signal"]');
	await expect(amplifyBtn).toBeVisible();
	await expect(amplifyBtn).toHaveAttribute('aria-pressed', 'false');

	// Preview row should exist (italicized "Amplify to be included here").
	await expect(page.getByText('Amplify to be included here')).toBeVisible();

	await page.screenshot({
		path: 'tests/screenshots/amp-route-A-preview.png',
		fullPage: true,
	});

	// (B) Click Amplify — Dan replaces preview as real child under Marco.
	await amplifyBtn.click();

	const amplifiedBtn = page.locator('button[aria-pressed][title="Remove your amplification"]');
	await expect(amplifiedBtn).toHaveAttribute('aria-pressed', 'true');

	// Preview row should be gone.
	await expect(page.getByText('Amplify to be included here')).not.toBeVisible();

	// Dan's row should carry the .cu-row class — the current-user visual
	// treatment that replaces the old "YOU" text label.
	await expect(page.locator('[role="button"].cu-row')).toBeVisible();

	await page.screenshot({
		path: 'tests/screenshots/amp-route-B-amplified.png',
		fullPage: true,
	});

	// (C) Click Dan's row to inspect — Branch Context should reference Marco.
	const danRow = page.locator('[role="button"].cu-row');
	await danRow.click();
	await expect(page.getByText(/Discovered through/i)).toBeVisible();

	await page.screenshot({
		path: 'tests/screenshots/amp-route-C-inspector.png',
		fullPage: true,
	});

	// (D) Click Amplify again — preview returns.
	await amplifiedBtn.click();
	await expect(amplifyBtn).toHaveAttribute('aria-pressed', 'false');
	await expect(page.getByText('Amplify to be included here')).toBeVisible();

	await page.screenshot({
		path: 'tests/screenshots/amp-route-D-reverted.png',
		fullPage: true,
	});
});

/*
  Origin route — pale-verge has sourceScoutId: 'dan'. The route resolves
  back to Dan himself, so routeSourceScoutId should be null and we fall
  back to Dan's existing forest position. If Dan is in the forest he
  starts Amplified (no preview).
*/
test('Pale Verge — Dan is the route source, starts Amplified', async ({ page }) => {
	await page.goto('/items/pale-verge');
	await page.waitForLoadState('networkidle');

	// Preview node must NOT be visible — Dan is the origin here.
	await expect(page.getByText('Amplify to be included here')).toHaveCount(0);

	await page.screenshot({
		path: 'tests/screenshots/amp-origin-pale-verge.png',
		fullPage: true,
	});
});
