import { test, expect } from '@playwright/test';

/*
  Verifies the Tree Visual Language (Node Types only — edge types,
  branch variables, and special structures were removed in the cleanup
  pass):
  - Avatar wrappers carry the expected `nk-*` decoration classes
  - Edge / branch / special-structure classes must be ABSENT
  - Visual screenshot of the full tree for review
*/

test('Tree visual language — node kind classes are applied; edge/branch leftovers are absent', async ({ page }) => {
	await page.goto('/items/frozen-sun');
	await page.waitForLoadState('networkidle');

	const treeRegion = page.locator('section').filter({ has: page.getByText(/Propagation lineage/i) });
	await expect(treeRegion).toBeVisible();

	const variantPresence = await page.evaluate(() => {
		const root = document.querySelector('.flex.flex-col.gap-1');
		if (!root) return null;
		return {
			// Node kinds — should all be present.
			nkSuccess: !!root.querySelector('.nk-success'),
			nkAmp:     !!root.querySelector('.nk-amp'),
			nkDeep:    !!root.querySelector('.nk-deep'),
			nkPassive: !!root.querySelector('.nk-passive'),
			// Bridge / edge / branch / row-tint systems were removed.
			nkBridge:        !!root.querySelector('.nk-bridge'),
			edgeLine:        !!root.querySelector('.edge-line'),
			edgeActive:      !!root.querySelector('.edge-active'),
			edgeStrong:      !!root.querySelector('.edge-strong'),
			edgeQuiet:       !!root.querySelector('.edge-quiet'),
			edgeArchival:    !!root.querySelector('.edge-archival'),
			edgeCrossScene:  !!root.querySelector('.edge-cross-scene'),
			edgePassive:     !!root.querySelector('.edge-passive'),
			edgesFromHub:    !!root.querySelector('.edges-from-hub'),
		};
	});

	expect(variantPresence).not.toBeNull();
	// At least one node-kind class must be applied — the procedural
	// forest may not include every kind on every item, but some kind
	// styling should always render.
	const anyNodeKind =
		!!variantPresence?.nkSuccess || !!variantPresence?.nkAmp ||
		!!variantPresence?.nkDeep    || !!variantPresence?.nkPassive;
	expect(anyNodeKind).toBe(true);
	// Bridge styling and all edge/branch leftovers must remain absent.
	expect(variantPresence?.nkBridge).toBe(false);
	expect(variantPresence?.edgeLine).toBe(false);
	expect(variantPresence?.edgeActive).toBe(false);
	expect(variantPresence?.edgeStrong).toBe(false);
	expect(variantPresence?.edgeQuiet).toBe(false);
	expect(variantPresence?.edgeArchival).toBe(false);
	expect(variantPresence?.edgeCrossScene).toBe(false);
	expect(variantPresence?.edgePassive).toBe(false);
	expect(variantPresence?.edgesFromHub).toBe(false);

	await page.screenshot({
		path: 'tests/screenshots/tvl-frozen-sun-tree.png',
		fullPage: true,
	});
});

test('Tree visual language — current user after Amplify gets nk-amp', async ({ page }) => {
	await page.goto('/items/frozen-sun');
	await page.waitForLoadState('networkidle');

	const amplifyBtn = page.locator('button[aria-pressed][title="Amplify this signal"]');
	await amplifyBtn.click();

	// Dan's row should now carry nk-amp on its avatar wrapper.
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
