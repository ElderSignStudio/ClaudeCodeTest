import { test, expect } from '@playwright/test';

/*
  Verifies the current-user emphasis refinements:
  - "Signal searching for scouts" placeholder appears under Dan after
    Amplify (he has no children yet) but NOT before Amplify.
  - Preview node copy ("Amplify to be included here") still shows
    before Amplify and is replaced after.
  - Selected + current-user combined state still reads as selected.
*/

test('Empty-downstream placeholder appears only after Amplify, under Dan', async ({ page }) => {
	await page.goto('/items/frozen-sun');
	await page.waitForLoadState('networkidle');

	// Before Amplify: preview copy visible, placeholder copy absent.
	await expect(page.getByText('Amplify to be included here')).toBeVisible();
	await expect(page.getByText('Signal searching for scouts')).toHaveCount(0);

	await page.screenshot({
		path: 'tests/screenshots/cu-A-before-amplify.png',
		fullPage: true,
	});

	// Click Amplify.
	const amplifyBtn = page.locator('button[aria-pressed][title="Amplify this signal"]');
	await amplifyBtn.click();

	// After Amplify: preview gone, placeholder visible.
	await expect(page.getByText('Amplify to be included here')).toHaveCount(0);
	await expect(page.getByText('Signal searching for scouts')).toBeVisible();

	await page.screenshot({
		path: 'tests/screenshots/cu-B-after-amplify.png',
		fullPage: true,
	});

	// Click Dan's row — selected + current-user combined state.
	const danRow = page.locator('[role="button"].cu-row');
	await danRow.click();

	await page.screenshot({
		path: 'tests/screenshots/cu-C-dan-selected.png',
		fullPage: true,
	});

	// Un-amplify: placeholder gone, preview returns.
	const amplifiedBtn = page.locator('button[aria-pressed][title="Remove your amplification"]');
	await amplifiedBtn.click();
	await expect(page.getByText('Signal searching for scouts')).toHaveCount(0);
	await expect(page.getByText('Amplify to be included here')).toBeVisible();
});

test('Mobile — Dan node and placeholder still readable', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/items/frozen-sun');
	await page.waitForLoadState('networkidle');

	const amplifyBtn = page.locator('button[aria-pressed][title="Amplify this signal"]');
	await amplifyBtn.click();

	await expect(page.getByText('Signal searching for scouts')).toBeVisible();

	await page.screenshot({
		path: 'tests/screenshots/cu-mobile-amplified.png',
		fullPage: true,
	});
});
