<script lang="ts">
	import ItemHero from '$lib/components/itemDetail/ItemHero.svelte';
	import PropagationTree from '$lib/components/itemDetail/PropagationTree.svelte';
	import BranchInspector from '$lib/components/itemDetail/BranchInspector.svelte';
	import type { PropagationUser, PreviewTarget } from '$lib/mock/propagation';
	import {
		findUserInForest,
		findParentInForest,
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

	/* Three-state user lifecycle:
	     A — Not yet in tree:    !hasPlayed && !isAmplified  → preview node
	     B — In tree, listener:   hasPlayed && !isAmplified  → real user node, deep-listener kind
	     C — Amplified:                       isAmplified    → real user node, amplifier kind
	   Once amplified, hasPlayed is implicitly true (you can't amplify
	   without having played). The transitions Play (A→B) and Amplify
	   (B→C) both fire `revealNonce++` so the tree smooth-scrolls and
	   highlights the user's row, reusing the same reveal sequence in
	   both cases (per spec — no new animation language). */
	let hasPlayed                = $state(false);
	let isAmplifiedByCurrentUser = $state(false);

	/* Initialisation — only re-runs when route changes (the data
	   prop is replaced). User-driven Play / Amplify mutations to the
	   two state booleans don't trip these dependencies. */
	$effect(() => {
		if (routeSourceScoutId) {
			// Route in context — user hasn't traversed this route yet.
			hasPlayed = false;
			isAmplifiedByCurrentUser = false;
		} else {
			// Origin-stories items, or items whose source scout IS Dan.
			// Mirror his existing position in the forest; if he's already
			// an origin there, treat that as State C (he brought the signal
			// in himself).
			hasPlayed = userAlreadyInForest;
			isAmplifiedByCurrentUser = userAlreadyInForest;
		}
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

	/* State B — the user joined the lineage as a listener (played the
	   signal) but hasn't amplified it forward yet. Same identity as
	   makeCurrentUserNode but `nodeKind: 'deep-listener'` and zero
	   amplifications so the inspector reads "you discovered this
	   signal but haven't passed it forward" rather than "you
	   amplified". Ghost-child placeholder under the row is
	   suppressed for this kind (see PropagationNode) — there's no
	   downstream branch to wait on until they amplify. */
	function makeListenerNode(): PropagationUser {
		return {
			id: CURRENT_USER_ID,
			name: danScout?.name ?? 'Dan',
			avatar: danScout?.avatar ?? '',
			character: 'Your signal',
			amplifications: 0,
			branchSize: 0,
			discoveredAgo: 'Just now',
			behaviorNote: 'You discovered this signal through this branch.',
			scenes: [],
			children: [],
			depthLevels: 0,
			isCurrentUser: true,
			nodeKind: 'deep-listener',
		};
	}

	function makePreviewNode(): PropagationUser {
		return {
			id: `${CURRENT_USER_ID}-preview`,
			name: danScout?.name ?? 'Dan',
			avatar: danScout?.avatar ?? '',
			character: 'Play to be included here',
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
			if (isAmplifiedByCurrentUser) {
				return addChildToUserInForest(baseWithoutUser, routeSourceScoutId, makeCurrentUserNode());
			}
			if (hasPlayed) {
				return addChildToUserInForest(baseWithoutUser, routeSourceScoutId, makeListenerNode());
			}
			return addChildToUserInForest(baseWithoutUser, routeSourceScoutId, makePreviewNode());
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

	/* Personal-lineage reveal: when the user EXPLICITLY clicks their own
	   real node (not the preview placeholder, not a hovered third-party
	   node), the tree highlights every ancestor on the ORIGIN → … → USER
	   path. Hover doesn't trigger this — only selection does. The set of
	   ids is computed once here and passed to the tree so each node /
	   conduit can opt itself in/out of the dim treatment.

	   Walking via `findParentInForest` follows the actual rendered tree
	   structure, so the chain reflects how the signal really reached the
	   user (the route insertion lives there). When no current-user node
	   is selected the set is null and the tree renders normally. */
	const lineageOrderedIds = $derived.by((): string[] | null => {
		if (!selectedTarget || selectedTarget.kind !== 'user') return null;
		const u = selectedTarget.user;
		if (u.isPreviewNode || !u.isCurrentUser) return null;
		/* Walk USER → ORIGIN, then reverse. The ordering matters for the
		   cascade: each lineage node sets --lineage-index to its index in
		   this array, and the CSS staggers the illumination so the eye
		   follows ORIGIN → … → USER as a wave. */
		const reverse: string[] = [];
		let cur: PropagationUser | null = u;
		while (cur) {
			reverse.push(cur.id);
			cur = findParentInForest(displayedForest, cur.id);
		}
		return reverse.reverse();
	});
	const lineageIds = $derived(lineageOrderedIds ? new Set(lineageOrderedIds) : null);

	function handleSelect(user: PropagationUser) {
		// Toggle: clicking the already-selected node deselects.
		// Applies uniformly to origins, leaves, the user node, the
		// preview placeholder — every selectable row in the tree. On
		// deselect the inspector returns to its default global state
		// and any selection-driven tree highlighting (e.g. the lineage
		// reveal triggered by selecting your own node) tears down with
		// it.
		if (selectedTarget?.kind === 'user' && selectedTarget.user.id === user.id) {
			selectedTarget = null;
			return;
		}
		// Preview nodes ARE selectable — the inspector renders a special
		// "Your entry point" card explaining where the user would join
		// the lineage. The preview row itself stays cursor-default +
		// aria-disabled in PropagationNode, but click still surfaces
		// the card.
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
	/* Post-amplify / post-play reveal trigger. PropagationTree
	   watches this counter; every true increment kicks off the
	   locator-fade → smooth-scroll → highlight sequence inside the
	   tree. Fired on Play (A→B insertion) AND Amplify (B→C
	   transition) — both moments are the user "moving into" the
	   tree and deserve the same reveal language. Toggling amplify
	   OFF does NOT bump it (there's no destination to glide to). */
	let revealNonce = $state(0);

	function handlePlay() {
		// State A → State B. Idempotent: a second Play after we're
		// already in the tree is a no-op (the button might be wired
		// to play the song's audio in the future; for now there's no
		// re-play visual). Origin-stories items keep this in lockstep
		// with `isAmplifiedByCurrentUser` since they don't have a
		// listener-only middle state — the user IS the origin.
		if (hasPlayed) return;
		hasPlayed = true;
		if (!routeSourceScoutId) {
			// No-route items have no "play then amplify" sequence —
			// the user joining IS the amplification.
			isAmplifiedByCurrentUser = true;
		}
		revealNonce++;
	}

	function handleToggleAmplify() {
		// Disabled in State A — the spec teaches "Play before Amplify"
		// by removing the action entirely from the un-played state.
		// The button itself is also `disabled` in the ItemHero, but
		// this guard is defensive in case the handler is reached via
		// another path.
		if (!hasPlayed) return;
		const wasAmplified = isAmplifiedByCurrentUser;
		isAmplifiedByCurrentUser = !wasAmplified;
		// If the user un-amplifies and their own node was selected,
		// clear the selection so the inspector doesn't reference a
		// vanished node. (After un-amplify they remain in State B —
		// the listener node still exists, so we keep the selection
		// only when it points at that surviving node.)
		if (wasAmplified
			&& selectedTarget?.kind === 'user'
			&& selectedTarget.user.id === CURRENT_USER_ID
		) {
			selectedTarget = null;
		}
		// Just turned amplify ON → trigger the reveal sequence.
		if (!wasAmplified) {
			revealNonce++;
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
		{hasPlayed}
		onReset={resetToGlobal}
		onPlay={handlePlay}
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
					{lineageIds}
					{lineageOrderedIds}
					currentUserId={CURRENT_USER_ID}
					{hasPlayed}
					{revealNonce}
					onAmplify={handleToggleAmplify}
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
					<BranchInspector forest={displayedForest} target={activeTarget} {lineageOrderedIds} />
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
