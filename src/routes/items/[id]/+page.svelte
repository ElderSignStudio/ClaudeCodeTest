<script lang="ts">
	import ItemHero from '$lib/components/itemDetail/ItemHero.svelte';
	import PropagationTree from '$lib/components/itemDetail/PropagationTree.svelte';
	import BranchInspector from '$lib/components/itemDetail/BranchInspector.svelte';
	import type { PropagationUser, PreviewTarget } from '$lib/mock/propagation';
	import {
		findUserInForest,
		removeUserFromForest,
		markUserInForest,
		addChildToUserInForest,
	} from '$lib/mock/propagation';
	import { scoutItems } from '$lib/mock/data';

	/*
		Item Detail page.

		Two-tier inspector state — preview (hover, ephemeral) vs selection
		(click, committed). Hover wins over selection so the inspector
		responds immediately; when hover clears, the inspector falls back to
		the committed selection (or the global state).

		Amplification state — the current viewer (mock: Dan) either belongs to
		this item's lineage or doesn't. Four cases drive a derived
		`displayedForest`:

		  (1) Dan in forest + amplified ON  → forest as-is, Dan tagged
		      `isCurrentUser`.
		  (2) Dan in forest + amplified OFF → Dan removed from forest.
		      Preview not shown because removing him IS the action; clicking
		      Amplify again restores him in place.
		  (3) Dan NOT in forest + amplified ON  → insert Dan as a child of
		      the route's source scout.
		  (4) Dan NOT in forest + amplified OFF → insert a faint, non-
		      selectable preview node under the source scout that reads
		      "Amplify to be included here."

		The route's source scout comes from `item.sourceScoutId`. If absent
		(Origin Stories items have no per-user route) we skip preview/insert.
		Edge case: if Dan IS the source scout, we treat him as origin
		(no preview, no self-insertion).
	*/

	let { data } = $props();
	const { item, forest } = $derived(data);

	const CURRENT_USER_ID = 'dan';
	const danScout = $derived(scoutItems.find(s => s.id === CURRENT_USER_ID));

	let selectedTarget = $state<PreviewTarget | null>(null);
	let hoveredTarget  = $state<PreviewTarget | null>(null);

	const activeTarget = $derived<PreviewTarget | null>(hoveredTarget ?? selectedTarget);

	// Is Dan already somewhere in the loaded forest? Only used when there's
	// no route context — i.e. items where Dan is genuinely the origin (or no
	// route can be resolved).
	const userAlreadyInForest = $derived(findUserInForest(forest, CURRENT_USER_ID) !== null);

	// Where the preview / insertion should go. Null when there's no usable
	// route (Origin Stories items, or items where Dan IS the route scout).
	const routeSourceScoutId = $derived<string | null>(
		item.sourceScoutId && item.sourceScoutId !== CURRENT_USER_ID
			? item.sourceScoutId
			: null,
	);

	// Initial amplified state.
	//   - With a route in context: ALWAYS start unamplified. The route wins
	//     over any existing Dan node in the mock forest — the user has not
	//     yet amplified *through this specific route*. (Future: check a
	//     per-route discovery record.)
	//   - Without a route: mirror Dan's presence in the forest, so origin-
	//     route pages where Dan is genuinely the origin start "Amplified".
	let isAmplifiedByCurrentUser = $state(false);
	$effect(() => {
		isAmplifiedByCurrentUser = routeSourceScoutId ? false : userAlreadyInForest;
	});

	function makeCurrentUserNode(): PropagationUser {
		return {
			id: CURRENT_USER_ID,
			name: danScout?.name ?? 'Dan',
			avatar: danScout?.avatar ?? '',
			character: 'Your signal',
			amplifications: 1,
			branchSize: 0,
			discoveredAgo: 'Just now',
			behaviorNote: 'You amplified this signal forward through this branch.',
			scenes: [],
			children: [],
			depthLevels: 0,
			isCurrentUser: true,
			nodeKind: 'amplifier',
		};
	}

	function makePreviewNode(): PropagationUser {
		return {
			id: `${CURRENT_USER_ID}-preview`,
			name: danScout?.name ?? 'Dan',
			avatar: danScout?.avatar ?? '',
			character: 'Amplify to be included here',
			amplifications: 0,
			branchSize: 0,
			discoveredAgo: '',
			children: [],
			isCurrentUser: true,
			isPreviewNode: true,
		};
	}

	const displayedForest = $derived.by(() => {
		// Route wins. When the page resolves to a specific source scout, Dan
		// MUST appear (or preview) under that scout — never as an origin in
		// his own right, even if he happens to exist somewhere else in the
		// mock forest. Strip Dan first, then insert under the route.
		if (routeSourceScoutId) {
			const baseWithoutUser = removeUserFromForest(forest, CURRENT_USER_ID);
			return isAmplifiedByCurrentUser
				? addChildToUserInForest(baseWithoutUser, routeSourceScoutId, makeCurrentUserNode())
				: addChildToUserInForest(baseWithoutUser, routeSourceScoutId, makePreviewNode());
		}

		// No route context (Origin Stories item, or item whose source scout IS
		// Dan himself). Fall back to Dan's existing position in the forest:
		// when amplified, keep him as an origin if he's there; when unamplified,
		// strip him out.
		if (isAmplifiedByCurrentUser) {
			return userAlreadyInForest
				? markUserInForest(forest, CURRENT_USER_ID, { isCurrentUser: true })
				: forest;
		}
		return userAlreadyInForest
			? removeUserFromForest(forest, CURRENT_USER_ID)
			: forest;
	});

	function handleSelect(user: PropagationUser) {
		// Preview nodes ARE selectable now — the inspector renders a special
		// "Your entry point" card explaining where the user would join the
		// lineage. The preview row itself stays cursor-default + aria-
		// disabled in PropagationNode, but click still surfaces the card.
		selectedTarget = { kind: 'user', user };
	}
	function handlePreview(target: PreviewTarget | null) {
		// Preview nodes flow through to the inspector so the entry-point
		// card opens on hover. The inspector branches on isPreviewNode and
		// renders dedicated content instead of the normal user card.
		hoveredTarget = target;
	}
	function resetToGlobal() {
		selectedTarget = null;
		hoveredTarget = null;
	}
	function handleToggleAmplify() {
		const wasAmplified = isAmplifiedByCurrentUser;
		isAmplifiedByCurrentUser = !wasAmplified;
		// If the user un-amplifies and their own node was selected, clear
		// the selection so the inspector doesn't reference a vanished node.
		if (wasAmplified
			&& selectedTarget?.kind === 'user'
			&& selectedTarget.user.id === CURRENT_USER_ID
		) {
			selectedTarget = null;
		}
	}
</script>

<svelte:head>
	<title>{item.title} — {item.artist} · Outer Signal</title>
</svelte:head>

<div class="max-w-360 mx-auto w-full px-6 xl:px-8 py-8 space-y-8">

	<!-- ── Hero / item header ── -->
	<ItemHero
		{item}
		{forest}
		isAmplified={isAmplifiedByCurrentUser}
		onReset={resetToGlobal}
		onToggleAmplify={handleToggleAmplify}
	/>

	<!--
		Split workspace. CSS Grid with a single fr-template that collapses to a
		single column below lg. Inspector sticks to the top of its container so
		it remains in view while the lineage scrolls.
	-->
	<div class="grid gap-8 lg:gap-10" style="grid-template-columns: 1fr;">
		<div
			class="grid gap-8 lg:gap-10"
			style="grid-template-columns: minmax(0, 1.55fr) minmax(280px, 1fr);"
		>
			<!--
				LEFT — propagation explorer. Uses an inset surface so it reads
				as a distinct workspace pane rather than free-floating text.
			-->
			<section
				class="rounded-xl border border-white/6 bg-base-200/35 p-5 lg:p-6"
				style="box-shadow: 0 0 0 1px rgba(255,255,255,0.04), 0 4px 18px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.025);"
			>
				<PropagationTree
					forest={displayedForest}
					selectedUserId={selectedTarget?.kind === 'user' ? selectedTarget.user.id : null}
					onSelect={handleSelect}
					onPreview={handlePreview}
				/>
			</section>

			<!--
				RIGHT — contextual inspector. `lg:sticky` only kicks in at the
				breakpoint where the split actually applies. `top-6` keeps the
				inspector clear of the page top padding.
			-->
			<aside class="lg:sticky lg:top-6 lg:self-start">
				<div
					class="rounded-xl border border-white/6 bg-base-200/35 p-5 lg:p-6"
					style="box-shadow: 0 0 0 1px rgba(255,255,255,0.04), 0 4px 18px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.025);"
				>
					<BranchInspector forest={displayedForest} target={activeTarget} />
				</div>
			</aside>
		</div>
	</div>

</div>

<style>
	/*
		Below lg, collapse the inner 2-column split to a single column so the
		tree sits above the inspector — natural stacking on tablet/mobile. The
		inline grid-template-columns above applies at all sizes; we override
		here for sub-lg widths.
	*/
	@media (max-width: 1023px) {
		.grid[style*="1.55fr"] {
			grid-template-columns: minmax(0, 1fr) !important;
		}
	}
</style>
