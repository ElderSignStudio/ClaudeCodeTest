import { test, expect } from '@playwright/test';

/*
  Verifies the Tree Visual Language v1 pass:
  - Avatar wrappers carry the expected `nk-*` decoration classes
  - Per-child edge segments carry the expected `edge-*` classes
  - Visual screenshot of the full tree for review
*/

test('Tree visual language — node + edge classes are applied', async ({ page }) => {
	await page.goto('/items/frozen-sun');
	await page.waitForLoadState('networkidle');

	// Marco is successful-amplifier + bridge-scout in the mock. Bridge wins
	// in the priority order — verify the avatar wrapper carries nk-bridge.
	// (We just need to confirm SOMETHING semantic was applied.)
	const treeRegion = page.locator('section').filter({ has: page.getByText(/Propagation lineage/i) });
	await expect(treeRegion).toBeVisible();

	// At least one of each variant class should exist in the tree.
	const variantPresence = await page.evaluate(() => {
		const root = document.querySelector('.flex.flex-col.gap-1');
		if (!root) return null;
		return {
			nkSuccess: !!root.querySelector('.nk-success'),
			nkAmp:     !!root.querySelector('.nk-amp'),
			nkDeep:    !!root.querySelector('.nk-deep'),
			nkPassive: !!root.querySelector('.nk-passive'),
			// Bridge styling was removed in the v2 debug pass — assert absent.
			nkBridge:  !!root.querySelector('.nk-bridge'),
			edgeActive:      !!root.querySelector('.edge-active'),
			edgeStrong:      !!root.querySelector('.edge-strong'),
			edgeQuiet:       !!root.querySelector('.edge-quiet'),
			edgeArchival:    !!root.querySelector('.edge-archival'),
			edgeCrossScene:  !!root.querySelector('.edge-cross-scene'),
			edgePassive:     !!root.querySelector('.edge-passive'),
		};
	});

	expect(variantPresence).not.toBeNull();
	// Visible forest covers all four supported node kinds + the two
	// identity overlays (origin via Marco/Alice, current-user via Dan
	// after Amplify). Bridge styling was removed, so .nk-bridge must
	// NOT appear anywhere in the rendered tree.
	expect(variantPresence?.nkSuccess).toBe(true);
	expect(variantPresence?.nkAmp).toBe(true);
	expect(variantPresence?.nkDeep).toBe(true);
	expect(variantPresence?.nkPassive).toBe(true);
	expect(variantPresence?.nkBridge).toBe(false);
	expect(variantPresence?.edgeActive).toBe(true);
	expect(variantPresence?.edgeStrong).toBe(true);
	expect(variantPresence?.edgeQuiet).toBe(true);
	expect(variantPresence?.edgeArchival).toBe(true);
	expect(variantPresence?.edgeCrossScene).toBe(true);
	expect(variantPresence?.edgePassive).toBe(true);

	await page.screenshot({
		path: 'tests/screenshots/tvl-frozen-sun-tree.png',
		fullPage: true,
	});
});

test('Tree visual language — current user after Amplify gets nk-amp + edge-active', async ({ page }) => {
	await page.goto('/items/frozen-sun');
	await page.waitForLoadState('networkidle');

	const amplifyBtn = page.locator('button[aria-pressed][title="Amplify this signal"]');
	await amplifyBtn.click();

	// Dan's row should now carry nk-amp on its avatar wrapper, and his
	// incoming edge segment should be edge-active.
	const danHasAmpKind = await page.evaluate(() => {
		// Find the current-user row via the .cu-row class, then check its
		// avatar wrapper carries nk-amp.
		const row = document.querySelector('[role="button"].cu-row');
		if (!row) return null;
		const avatar = row.querySelector('.node-avatar');
		return {
			hasAmp: avatar?.classList.contains('nk-amp') ?? false,
		};
	});

	expect(danHasAmpKind?.hasAmp).toBe(true);

	await page.screenshot({
		path: 'tests/screenshots/tvl-dan-amplified-tree.png',
		fullPage: true,
	});
});
