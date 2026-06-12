<script lang="ts">
	import type { PropagationForest, PropagationUser, PreviewTarget } from '$lib/mock/propagation';
	import { sortNodesByPropagation } from '$lib/mock/propagation';
	import PropagationNode from './PropagationNode.svelte';

	/*
		Renders the propagation forest as a list of independent root branches,
		each its own subtree.

		The "+N more independent origins" row at the bottom is a real toggle:
		when expanded it reveals the forest's hidden root users inline as
		additional root nodes (NOT downstream of any other root — they are
		independent origins in their own right). Toggling back collapses the
		hidden roots and restores the compact "+N more" row.

		Hover behavior: each node fires `onPreview` with itself; the tree-level
		`mouseleave` clears the preview to null. The page combines that with
		click selection to compute the inspector's active target.
	*/

	let {
		forest,
		selectedUserId,
		onSelect,
		onPreview,
		lineageIds = null,
		lineageOrderedIds = null,
		currentUserId = null,
		hasPlayed = true,
		revealNonce = 0,
		onAmplify = undefined,
	}: {
		forest: PropagationForest;
		selectedUserId: string | null;
		onSelect: (user: PropagationUser) => void;
		onPreview: (target: PreviewTarget | null) => void;
		/** When the user clicks their OWN real node, the +page derives the
		 *  ORIGIN → … → USER ancestor chain and passes it here. Every node
		 *  in the set stays at full opacity; everything else dims via
		 *  CSS rules under `[data-lineage-active="true"]`. Null when no
		 *  lineage reveal is active — tree renders normally. */
		lineageIds?: Set<string> | null;
		/** Same ids, but ORDERED origin → user. Used by each lineage node
		 *  to derive its position and set --lineage-index, which drives
		 *  the cascade-illumination animation-delay so the reveal sweeps
		 *  from origin downward toward the user. */
		lineageOrderedIds?: string[] | null;
		/** The id of the current viewer's node (Dan). When non-null and
		 *  the corresponding wrapper is outside the visible tree
		 *  viewport, an offscreen "Your signal" pill renders at the
		 *  appropriate edge with a click-to-scroll handler. */
		currentUserId?: string | null;
		/** Lifecycle gate — `false` means the user is in State A
		 *  (preview node only). The locator pill switches into a
		 *  more subdued "Play to join" variant that points at the
		 *  preview node's location instead of the real user node;
		 *  copy and styling distinguish it from the active "Your
		 *  signal" pill. Defaults to `true` so callers that don't
		 *  pass the prop get the existing post-play behaviour. */
		hasPlayed?: boolean;
		/** Monotonic counter from the parent: increments on every fresh
		 *  insertion of Dan into the tree (amplify-on transition). When
		 *  it changes, the tree runs the post-amplify reveal sequence:
		 *  fade the locator pill out, smooth-scroll Dan into the
		 *  middle-third of the viewport, then briefly highlight his
		 *  row before settling. Defaulting to 0 means SSR / first-mount
		 *  never triggers a reveal — only true increments do. */
		revealNonce?: number;
		/** Same handler the hero's Amplify button uses. Passed
		 *  through to PropagationNode so the ghost-child placeholder
		 *  under the user's row can render an inline "Amplify" button
		 *  in State B (played, not amplified). Undefined when no
		 *  inline action is wanted. */
		onAmplify?: (() => void) | undefined;
	} = $props();

	const lineageActive = $derived(lineageIds !== null && lineageIds.size > 0);

	/* ── Lineage-path SVG overlay ──────────────────────────────────
	   When the user selects their own real node, we draw a dedicated
	   highlight path over the tree connecting every avatar on the
	   ORIGIN → … → USER chain. This is the user's explicit
	   requirement: a static, unmistakable overlay that makes the
	   route readable in a screenshot — independent of any dim/boost
	   on the underlying conduits.

	   The path is built segment-by-segment with an L-shape per pair:
	     (parent avatar center) → straight down at the conduit RAIL X
	     → straight right to (child avatar center)
	   matching the visual geometry the tree already uses for
	   parent → child connectors.

	   Positions come from getBoundingClientRect (deferred to mount
	   via $effect, recomputed when lineageOrderedIds or layout
	   changes). Stored in component state and used to drive `d`.
	   Pointer-events: none and a moderate-stroke render means it
	   never blocks interaction and never affects layout. */
	let scrollRoot: HTMLDivElement | null = $state(null);
	let scrollContent: HTMLDivElement | null = $state(null);
	let overlayPathD = $state<string>('');
	let overlayHeight = $state<number>(0);

	function recomputeLineageOverlay() {
		if (!lineageOrderedIds || lineageOrderedIds.length < 2 || !scrollContent) {
			overlayPathD = '';
			return;
		}
		const contentBox = scrollContent.getBoundingClientRect();
		overlayHeight = scrollContent.scrollHeight;
		const points: { ax: number; ay: number; railX: number }[] = [];
		for (const id of lineageOrderedIds) {
			const wrapper = scrollContent.querySelector(`[data-user-id="${id}"]`) as HTMLElement | null;
			if (!wrapper) continue;
			const avatar = wrapper.querySelector('.node-avatar') as HTMLElement | null;
			if (!avatar) continue;
			const aBox = avatar.getBoundingClientRect();
			/* Rail x = the vertical conduit position this child's elbow
			   feeds into. Find this wrapper's elbow SVG and read its
			   left edge; if not present (origin nodes have no parent
			   conduit), fall back to the avatar's left edge. */
			const elbow = wrapper.querySelector(':scope > .conduit-elbow') as HTMLElement | null;
			const railX = elbow
				? elbow.getBoundingClientRect().left - contentBox.left + 2.5
				: aBox.left - contentBox.left;
			points.push({
				ax: aBox.left + aBox.width / 2 - contentBox.left,
				ay: aBox.top + aBox.height / 2 - contentBox.top,
				railX,
			});
		}
		if (points.length < 2) {
			overlayPathD = '';
			return;
		}
		let d = '';
		for (let i = 0; i < points.length - 1; i++) {
			const a = points[i];
			const b = points[i + 1];
			/* L-shape via the child's rail X: from parent's avatar
			   center → over to railX at parent's y → down to railX at
			   child's y → over to child's avatar center. Rounded
			   stroke-linejoin softens the corners. */
			if (i === 0) d += `M ${a.ax.toFixed(1)} ${a.ay.toFixed(1)} `;
			d += `L ${b.railX.toFixed(1)} ${a.ay.toFixed(1)} `;
			d += `L ${b.railX.toFixed(1)} ${b.ay.toFixed(1)} `;
			d += `L ${b.ax.toFixed(1)} ${b.ay.toFixed(1)} `;
		}
		overlayPathD = d.trim();
	}

	/* Recompute whenever the chain changes or the tree layout shifts.
	   ResizeObserver picks up tree-scroll-content size changes; window
	   resize covers viewport changes. Both unbind on teardown. */
	$effect(() => {
		// Read dependencies so the effect re-runs on changes
		void lineageOrderedIds;
		void forest;
		if (typeof requestAnimationFrame !== 'undefined') {
			requestAnimationFrame(() => recomputeLineageOverlay());
		}
	});

	/* When the lineage activates, snap tree-scroll-x.scrollLeft back to 0.
	   `scrollIntoViewIfNeeded` (fired by the row click) typically scrolls
	   the tree's horizontal axis to bring Dan's row content into view,
	   which moves the trunk's vertical rail (where the lineage overlay
	   path lives) OFF the visible scroll-area. Resetting the scroll
	   ensures the origin → user path is in view the moment it lights up.
	   Window scroll is untouched so the user keeps whatever vertical
	   context they had. */
	$effect(() => {
		if (!lineageActive) return;
		if (!scrollRoot) return;
		scrollRoot.scrollLeft = 0;
	});
	$effect(() => {
		if (!scrollContent) return;
		const handler = () => recomputeLineageOverlay();
		const ro = new ResizeObserver(handler);
		ro.observe(scrollContent);
		window.addEventListener('resize', handler);
		window.addEventListener('scroll', handler, true);
		return () => {
			ro.disconnect();
			window.removeEventListener('resize', handler);
			window.removeEventListener('scroll', handler, true);
		};
	});

	/* ── "Your signal" offscreen indicator ──────────────────────────
	   When the current user's node sits outside the visible portion of
	   the tree, render a small pill near the appropriate edge with a
	   click-to-scroll handler. State is recomputed via rAF on:
	     • initial mount
	     • window scroll (capture phase covers nested scrollers)
	     • window resize
	     • ResizeObserver on the tree content (catches expand/collapse,
	       lineage activation, ghost placeholder appearance, …)
	     • forest / currentUserId changes
	   No depth heuristics — purely DOM bounding-rect math. */
	let userIndicator = $state<{
		direction: 'up' | 'down';
		top: number | null;
		bottom: number | null;
		centerX: number;
	} | null>(null);

	function findCurrentUser(): { wrapper: HTMLElement; avatar: HTMLElement } | null {
		if (!currentUserId || !scrollContent) return null;
		/* In State A the page inserts a preview placeholder under
		   the route's source scout with id `${currentUserId}-preview`
		   instead of the real user node. The locator pill should
		   still appear (it teaches WHERE the user will land) so we
		   fall back to the preview node when the real node isn't
		   in the DOM. The pill copy / styling is then varied by the
		   `hasPlayed` prop, not by which node we found. */
		const realId = currentUserId;
		const previewId = `${currentUserId}-preview`;
		const lookupId = hasPlayed ? realId : previewId;
		const wrapper = scrollContent.querySelector(`[data-user-id="${lookupId}"]`) as HTMLElement | null;
		if (!wrapper) return null;
		const avatar = wrapper.querySelector('.node-avatar') as HTMLElement | null;
		if (!avatar) return null;
		return { wrapper, avatar };
	}

	function recomputeUserIndicator() {
		/* While the post-amplify reveal sequence is running we freeze the
		   indicator — `pillFading` owns the visual state (fading to
		   opacity 0), and once the scroll completes Dan is in view so the
		   pill should disappear naturally. Recomputing during the fade
		   would yank the element out of the DOM mid-transition and kill
		   the handoff animation. */
		if (revealInProgress) return;
		const u = findCurrentUser();
		if (!u || !scrollRoot) {
			userIndicator = null;
			return;
		}
		const userBox = u.avatar.getBoundingClientRect();
		const wrapBox = u.wrapper.getBoundingClientRect();
		const treeBox = scrollRoot.getBoundingClientRect();
		const vh = window.innerHeight;
		const visibleTop = Math.max(0, treeBox.top);
		const visibleBottom = Math.min(vh, treeBox.bottom);
		/* No part of the tree visible (page scrolled past it entirely);
		   hide the indicator — the user isn't even looking at this card. */
		if (visibleBottom <= visibleTop) {
			userIndicator = null;
			return;
		}
		/* Safe-area offsets — keep the pill clear of page chrome that
		   sits at the window edges, so it always reads as INSIDE the
		   Propagation Lineage card rather than as a floating overlay
		   near the bottom player. */
		/* TOP_SAFE/BOTTOM_SAFE include extra room for the 22 px dashed
		   guide segment that extends OUT of the pill toward the
		   off-screen branch — the line itself must stay inside the
		   visible card, not behind the header or player. */
		const TOP_SAFE = 50;
		const BOTTOM_SAFE = 120;
		const buffer = 16;
		/* Branch-column alignment: position the pill above the actual
		   rail that leads down to the user's row, not the tree's
		   horizontal center. The rail in each child wrapper is rendered
		   at left=-21.5 px with width 4 px, so its center sits at
		   wrapBox.left − 19.5 px in viewport coords. Clamping to the
		   visible tree's horizontal range keeps the pill inside the
		   card if the rail itself happens to be horizontally
		   scrolled off-screen. */
		const railCenterX = wrapBox.left - 19.5;
		const visibleLeft = Math.max(scrollRoot.getBoundingClientRect().left, 0);
		const visibleRight = scrollRoot.getBoundingClientRect().right;
		const centerX = Math.max(visibleLeft + 36, Math.min(visibleRight - 36, railCenterX));
		if (userBox.bottom < visibleTop + buffer) {
			const naturalTop = visibleTop + 18;
			userIndicator = { direction: 'up', top: Math.max(TOP_SAFE, naturalTop), bottom: null, centerX };
		} else if (userBox.top > visibleBottom - buffer) {
			const naturalBottom = vh - visibleBottom + 18;
			userIndicator = { direction: 'down', top: null, bottom: Math.max(BOTTOM_SAFE, naturalBottom), centerX };
		} else {
			userIndicator = null;
		}
	}

	function scrollToCurrentUser() {
		const u = findCurrentUser();
		if (!u) return;
		u.avatar.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
	}

	/* ── Post-amplify reveal sequence ──────────────────────────────
	   Triggered by the parent bumping `revealNonce` when the user
	   amplifies (i.e., Dan transitions from preview-or-absent into a
	   real node in the forest). The three steps follow the spec:
	     1. Concurrent locator fade-out + smooth page scroll. The
	        scroll target places Dan ≈ 40 % from the top of the
	        viewport — solidly inside the "middle third" the spec
	        asks for, without dead-centering.
	     2. After the scroll settles, briefly raise a calm "I'm
	        here" highlight on Dan's row (brighter bg + soft glow).
	     3. Settle back to the persistent "Your signal" styling and
	        let the indicator recompute (it will now be null because
	        Dan is in view). */
	let pillFading       = $state(false);
	let revealInProgress = $state(false);
	let lastRevealNonce  = $state(0);

	function sleep(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	async function runRevealSequence() {
		/* Wait two frames so the freshly-inserted Dan node is in the
		   DOM with stable layout before we measure it. */
		await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
		const u = findCurrentUser();
		if (!u) return;
		revealInProgress = true;
		/* Begin the locator fade-out (no-op visually if the pill wasn't
		   visible; harmless to set in either case). The CSS transition
		   carries opacity to 0 over ~300 ms while the scroll begins. */
		pillFading = true;
		/* Smooth-scroll the PAGE so Dan sits ≈ 40 % from the top.
		   Using window.scrollTo with behavior:'smooth' inherits the
		   browser's default ease curve (close enough to ease-in-out
		   for this duration). The tree itself is rendered inside the
		   normal page flow so the page scroll is the right axis. */
		const userBox = u.avatar.getBoundingClientRect();
		const targetTop = Math.max(0, window.scrollY + userBox.top - window.innerHeight * 0.4);
		window.scrollTo({ top: targetTop, behavior: 'smooth' });
		/* Wait for the scroll to land. ~900 ms covers the typical
		   browser smooth-scroll duration for distances up to a few
		   thousand pixels; if the scroll is shorter we just spend
		   the leftover time idle, which still feels calm. */
		await sleep(900);
		/* Reveal flash — find Dan's row-selection-zone and toggle a
		   class that triggers the one-shot keyframe animation. We do
		   this imperatively (rather than via a reactive attribute on
		   the scroll root) because CSS can't dynamically match a
		   descendant's data-user-id against a value held on a
		   parent. Class lives on the actual node so the animation
		   resolves locally and resumes the baseline styling on
		   completion. */
		const u2 = findCurrentUser();
		const selectionZone = u2?.wrapper.querySelector('.row-selection-zone') as HTMLElement | null;
		if (selectionZone) selectionZone.classList.add('reveal-flash-active');
		await sleep(1000);
		if (selectionZone) selectionZone.classList.remove('reveal-flash-active');
		pillFading = false;
		revealInProgress = false;
		/* Now that the sequence is over the indicator should
		   recompute naturally — Dan is in view, so it stays null. */
		recomputeUserIndicator();
	}

	$effect(() => {
		/* Watch revealNonce; on a true increment (not the initial 0),
		   run the sequence. lastRevealNonce is local state so a
		   forest swap that re-mounts the component won't replay the
		   reveal — only fresh increments do. */
		if (revealNonce > lastRevealNonce) {
			lastRevealNonce = revealNonce;
			runRevealSequence();
		}
	});

	$effect(() => {
		if (!scrollContent || !scrollRoot) return;
		let rafId: number | null = null;
		const schedule = () => {
			if (rafId !== null) return;
			rafId = requestAnimationFrame(() => {
				rafId = null;
				recomputeUserIndicator();
			});
		};
		schedule();
		const ro = new ResizeObserver(schedule);
		ro.observe(scrollContent);
		ro.observe(scrollRoot);
		window.addEventListener('scroll', schedule, { passive: true, capture: true });
		window.addEventListener('resize', schedule);
		return () => {
			if (rafId !== null) cancelAnimationFrame(rafId);
			ro.disconnect();
			window.removeEventListener('scroll', schedule, { capture: true });
			window.removeEventListener('resize', schedule);
		};
	});

	/* Re-measure when reactive inputs change (forest swap, current user
	   id change, lineage activation that may shift Dan's row). Deferred
	   to next frame so DOM has settled. */
	$effect(() => {
		void forest;
		void currentUserId;
		void lineageActive;
		if (typeof requestAnimationFrame !== 'undefined') {
			requestAnimationFrame(() => recomputeUserIndicator());
		}
	});

	let hiddenRootsExpanded = $state(false);

	// Sort roots by propagation strength so the strongest origins appear
	// first. Hidden roots use the same ordering when expanded.
	/* Root ordering:
	     1. Established origins (have descendants) keep their
	        `sortNodesByPropagation` order — kind rank, then
	        branchSize descending. Untouched by this pass.
	     2. Childless origins (the "unheard" group) are
	        deterministically reordered: non-user origins
	        alphabetically by name, current-user origin always last.
	   Without this tiebreaker, childless origins sort to the bottom
	   correctly but their relative order falls back to the input
	   array (stable sort on equal branchSize) which reads as
	   arbitrary. */
	const sortedRoots = $derived.by(() => {
		const sorted = sortNodesByPropagation(forest.roots);
		const populated: PropagationUser[] = [];
		const childless: PropagationUser[] = [];
		for (const r of sorted) {
			if (r.children.length > 0 || r.hiddenChildren) populated.push(r);
			else childless.push(r);
		}
		childless.sort((a, b) => {
			const aIsUser = currentUserId !== null && a.id === currentUserId;
			const bIsUser = currentUserId !== null && b.id === currentUserId;
			if (aIsUser !== bIsUser) return aIsUser ? 1 : -1;
			return a.name.localeCompare(b.name);
		});
		return [...populated, ...childless];
	});
	const sortedHiddenRoots = $derived(sortNodesByPropagation(forest.hiddenRootUsers));
</script>

<div
	class="flex flex-col gap-1"
	onmouseleave={() => onPreview(null)}
	role="presentation"
>
	<!-- Section eyebrow — quiet, archival framing -->
	<div class="flex items-center justify-between mb-3 px-1">
		<div class="flex items-center gap-2">
			<span class="w-0.5 h-3.5 rounded-full bg-accent/55" aria-hidden="true"></span>
			<p class="text-[11px] font-semibold uppercase tracking-widest text-base-content/68">
				Propagation lineage
			</p>
		</div>
		<p class="text-[11px] font-mono text-base-content/40 tabular-nums">
			{forest.independentOrigins} origins · {forest.totalReach} reached
		</p>
	</div>

	<!--
		Horizontal-scroll container for the tree body. Deep trees (12+
		levels) reach widths that exceed the lineage column's track,
		especially under the lg-grid split where the tree column is
		~1.55fr — they would otherwise clip silently because the
		grid track is `minmax(0, …)` and the inner rows use
		`min-w-0` for truncation. Wrapping just the roots (not the
		header above) lets the eyebrow stay aligned with the panel
		while the tree body scrolls horizontally on demand.

		Inner `min-width: max-content` makes the content adopt its
		NATURAL intrinsic width — preserving the indentation rhythm —
		instead of being squeezed by the container. When the tree
		fits, max-content ≤ container width and no scrollbar appears.
	-->
	<div
		class="tree-scroll-x"
		data-lineage-active={lineageActive ? 'true' : 'false'}
		bind:this={scrollRoot}
	>
	<div class="tree-scroll-content" bind:this={scrollContent}>

	<!-- Roots — each is its own independent origin tree. Sorted by
	     propagation strength: successful-amplifier → amplifier → deep
	     → passive. -->
	<div class="flex flex-col gap-3.5">
		{#each sortedRoots as root (root.id)}
			<PropagationNode
				user={root}
				{selectedUserId}
				{onSelect}
				{onPreview}
				{lineageIds}
				{lineageOrderedIds}
				depth={0}
				{onAmplify}
			/>
		{/each}
	</div>

	<!--
		Hidden root origins. Collapsed by default into a quiet "+N more"
		toggle. When expanded, the hidden roots render INLINE as additional
		root nodes (same indentation, same origin treatment as primary
		roots) — they are independent origins, not downstream of anything.
		Distinguished from in-branch "+N more" by sitting outside any
		branch's left rail.
	-->
	{#if forest.hiddenRootUsers.length > 0}
		{#if hiddenRootsExpanded}
			<!-- Revealed hidden roots — rendered exactly like the primary
			     roots above, with the same gap rhythm. Same sort order. -->
			<div class="mt-3.5 flex flex-col gap-3.5">
				{#each sortedHiddenRoots as root (root.id)}
					<PropagationNode
						user={root}
						{selectedUserId}
						{onSelect}
						{onPreview}
						depth={0}
						{onAmplify}
					/>
				{/each}
			</div>

			<!-- Collapse toggle — keep visual parity with the expand row. -->
			<button
				class="mt-3 pl-1 flex items-start gap-2 py-1.5 text-base-content/52 hover:text-base-content/82 transition-colors text-left rounded-md hover:bg-white/3"
				onclick={() => { hiddenRootsExpanded = false; }}
			>
				<span class="shrink-0 mt-1 w-4 h-4" aria-hidden="true"></span>
				<span class="shrink-0 mt-0.5 w-7 h-7 rounded-full border border-dashed border-white/14 flex items-center justify-center text-[10px] font-mono text-base-content/55" aria-hidden="true">
					−
				</span>
				<p class="text-[12px] leading-snug pt-1.5 text-base-content/62">
					Show fewer origins
				</p>
			</button>
		{:else}
			<button
				class="mt-3 pl-1 flex items-start gap-2 py-1.5 text-base-content/52 hover:text-base-content/82 transition-colors text-left rounded-md hover:bg-white/3 w-full"
				onclick={() => { hiddenRootsExpanded = true; }}
				aria-label={`Reveal ${forest.hiddenRootUsers.length} quieter independent origins`}
			>
				<span class="shrink-0 mt-1 w-4 h-4" aria-hidden="true"></span>
				<span class="shrink-0 mt-0.5 w-7 h-7 rounded-full border border-dashed border-white/14 flex items-center justify-center text-[10px] font-mono text-base-content/55">
					+{forest.hiddenRootUsers.length}
				</span>
				<div class="min-w-0 flex-1 pt-0.5">
					<p class="text-[12px] leading-snug text-base-content/68">
						+{forest.hiddenRootUsers.length} more independent origins
					</p>
					<p class="text-[11px] leading-snug text-base-content/40 italic">
						Quieter starting points · further from main propagation
					</p>
				</div>
			</button>
		{/if}
	{/if}

	<!-- Lineage-path overlay — rendered LAST in DOM so it paints
	     above every conduit and dimmed branch, but pointer-events:
	     none keeps the row hit areas intact. Conditional render means
	     Svelte unmounts it the instant the lineage deactivates — no
	     persistent state. -->
	{#if lineageActive && overlayPathD}
		<svg
			class="lineage-overlay-svg"
			width="100%"
			height={overlayHeight}
			style="pointer-events: none; position: absolute; top: 0; left: 0; overflow: visible;"
			aria-hidden="true"
		>
			<path
				d={overlayPathD}
				fill="none"
				stroke="oklch(0.88 0.13 65)"
				stroke-width="2.8"
				stroke-linecap="round"
				stroke-linejoin="round"
				opacity="0.95"
				style="filter: drop-shadow(0 0 4px oklch(0.88 0.13 65 / 0.65)) drop-shadow(0 0 12px oklch(0.84 0.13 65 / 0.40));"
			/>
		</svg>
	{/if}

	</div><!-- /.tree-scroll-content -->
	</div><!-- /.tree-scroll-x -->
</div>

<!-- Offscreen "Your signal" pill — position:fixed so it overlays the
     tree card from the top-level stacking context. Visibility +
     direction + edge position computed in the script via DOM bounding
     rects (no depth heuristics). Click smoothly scrolls Dan into view. -->
{#if userIndicator}
	<button
		type="button"
		class="lineage-find-me-pill"
		data-direction={userIndicator.direction}
		data-fading={pillFading ? 'true' : 'false'}
		data-variant={hasPlayed ? 'active' : 'preview'}
		style="left: {userIndicator.centerX}px; {userIndicator.top !== null ? `top: ${userIndicator.top}px;` : `bottom: ${userIndicator.bottom}px;`}"
		onclick={scrollToCurrentUser}
		aria-label={hasPlayed ? 'Scroll to your signal' : 'Scroll to your future place in the lineage'}
	>
		{hasPlayed ? 'Your signal' : 'Play to join'}
	</button>
{/if}

<style>
	/*
		Horizontal scroll behaviour for the tree body.
		- `overflow-x: auto` activates a scrollbar only when content
		  exceeds the container's width — shallow trees never see it.
		- The inner `.tree-scroll-content` uses `min-width: max-content`
		  so the tree adopts its natural intrinsic width (preserving
		  the indentation rhythm) instead of being squeezed by the
		  parent's grid track.
		- Custom scrollbar styling keeps it subtle: a 8 px-tall track,
		  semi-transparent thumb that strengthens on hover, matching
		  the dark UI. Firefox uses the same colour via the standard
		  `scrollbar-color` / `scrollbar-width` properties.
	*/
	.tree-scroll-x {
		overflow-x: auto;
		/* `overflow-y` becomes `auto` implicitly when overflow-x is
		   not `visible`. The tree's children are bounded by their own
		   wrapper heights (and particle paths are clipped by each
		   `overflow-clip` children container further down), so this
		   does not affect particle rendering or vertical layout. */
		scrollbar-width: thin;
		scrollbar-color: rgba(255, 255, 255, 0.08) transparent;
	}
	.tree-scroll-x::-webkit-scrollbar {
		height: 8px;
	}
	.tree-scroll-x::-webkit-scrollbar-track {
		background: transparent;
	}
	.tree-scroll-x::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.08);
		border-radius: 4px;
	}
	.tree-scroll-x::-webkit-scrollbar-thumb:hover {
		background: rgba(255, 255, 255, 0.16);
	}
	.tree-scroll-content {
		min-width: max-content;
		position: relative;
	}

	/* "Your signal" offscreen indicator — quiet locator anchored
	   directly above (or below) the user's branch column, not
	   centered in the viewport. Reads as a temporary signpost
	   attached to the branch:
	     • the pill itself is a small label (smaller padding, lower
	       opacity, thinner border, no shadow) — not a CTA
	     • ::after draws a short dashed guide line extending OUT of
	       the pill toward the off-screen part of the branch
	     • ::before adds a faint vertical halo behind the pill so it
	       feels embedded into the tree's edge rather than floating */
	.lineage-find-me-pill {
		position: fixed;
		transform: translateX(-50%);
		display: inline-flex;
		align-items: center;
		/* Discoverability pass — pill silhouette grows ~15-20 %
		   (padding 0.2→0.3 / 0.6→0.85 rem, font 9.75→10.75 px),
		   bg / border / text each step ~10-15 % toward higher
		   contrast. Beacon, glow, and positioning untouched. */
		padding: 0.3rem 0.85rem;
		border-radius: 9999px;
		background-color: color-mix(in srgb, var(--color-primary), transparent 86%);
		color: oklch(from var(--color-primary) calc(l + 0.04) c h / 0.88);
		border: 1px solid color-mix(in srgb, var(--color-primary), transparent 74%);
		font-size: 10.75px;
		font-weight: 500;
		letter-spacing: 0.04em;
		line-height: 1;
		cursor: pointer;
		pointer-events: auto;
		/* Above the fixed bottom player (z-50) so the pill stays
		   clickable even when it sits near the tree's bottom edge. */
		z-index: 60;
		transition: background-color 200ms ease, color 200ms ease, border-color 200ms ease, opacity 300ms ease-in-out;
		backdrop-filter: blur(6px);
		-webkit-backdrop-filter: blur(6px);
		/* Idle beacon — slow opacity cycle plus a barely-there outer
		   shadow expansion. Reads as a distant navigation light, not
		   as a CTA. Paused on hover/focus so interaction reads
		   crisply. The animation only touches opacity and box-shadow
		   so the pill's bg / border / text color cycles stay
		   independent (see :hover overrides further down). */
		animation: lineage-pill-beacon 3s ease-in-out infinite;
	}
	@keyframes lineage-pill-beacon {
		0%, 100% {
			opacity: 0.75;
			box-shadow: 0 0 0 0 color-mix(in srgb, var(--color-primary), transparent 100%);
		}
		50% {
			opacity: 1;
			box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary), transparent 92%);
		}
	}
	/* Locator handoff — when the post-amplify reveal sequence begins
	   it sets data-fading="true" on the pill. The animation halts
	   (no more cycling) and the opacity transition takes the pill
	   smoothly to 0 over ~300 ms, concurrent with the page
	   smooth-scroll that brings Dan into view. */
	.lineage-find-me-pill[data-fading='true'] {
		animation: none;
		opacity: 0;
	}
	/* Preview variant — fires in State A (the user hasn't played
	   yet so there's no real "Your signal" node, just a preview
	   placeholder). Reads as anticipatory: same shape and beacon,
	   lower contrast across bg / border / text, and the halo +
	   guide line dim in proportion. Deliberately NOT a disabled
	   grey — the pill is fully clickable and scrolls to the
	   preview node so the user can see WHERE they'll land. */
	.lineage-find-me-pill[data-variant='preview'] {
		background-color: color-mix(in srgb, var(--color-primary), transparent 92%);
		border-color: color-mix(in srgb, var(--color-primary), transparent 84%);
		color: oklch(from var(--color-primary) calc(l + 0.04) c h / 0.72);
	}
	.lineage-find-me-pill[data-variant='preview']::after {
		border-left-color: color-mix(in srgb, var(--color-primary), transparent 72%);
	}
	.lineage-find-me-pill[data-variant='preview']:hover {
		background-color: color-mix(in srgb, var(--color-primary), transparent 84%);
		color: oklch(from var(--color-primary) calc(l + 0.06) c h / 0.86);
		border-color: color-mix(in srgb, var(--color-primary), transparent 70%);
	}
	/* Subtle vertical fade behind the pill — creates the impression
	   that the tree edge softly dissolves into the pill. Pointer-
	   events none so clicks always hit the pill itself. */
	.lineage-find-me-pill::before {
		content: '';
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		width: calc(100% + 80px);
		height: 56px;
		border-radius: 9999px;
		background: radial-gradient(
			ellipse at center,
			color-mix(in srgb, var(--color-primary), transparent 92%) 0%,
			color-mix(in srgb, var(--color-primary), transparent 97%) 45%,
			transparent 80%
		);
		pointer-events: none;
		z-index: -1;
	}
	/* Short dashed guide segment — extends ~22 px from the pill toward
	   the off-screen branch it refers to. Direction-aware via the
	   data-direction attribute: 'down' → line below the pill, 'up' →
	   line above. The line is the same primary tint as the pill's
	   border so the pill reads as the cap of a branch stub. */
	.lineage-find-me-pill::after {
		content: '';
		position: absolute;
		left: 50%;
		width: 0;
		height: 22px;
		/* Stepped ~6 % toward higher opacity (62→56 %) so it stays
		   visually balanced with the larger, slightly brighter pill
		   above. Same height — guide length is unchanged. */
		border-left: 1px dashed color-mix(in srgb, var(--color-primary), transparent 56%);
		pointer-events: none;
	}
	.lineage-find-me-pill[data-direction='down']::after {
		top: 100%;
		transform: translate(-50%, 0);
	}
	.lineage-find-me-pill[data-direction='up']::after {
		bottom: 100%;
		transform: translate(-50%, 0);
	}
	.lineage-find-me-pill:hover,
	.lineage-find-me-pill:focus-visible {
		/* Cancel the idle beacon on interaction so the affordance
		   reads at full opacity / no shadow ring — a stable, crisp
		   button under the cursor. (Using `animation: none` rather
		   than `animation-play-state: paused` so the explicit
		   `opacity: 1` here actually wins; a paused animation still
		   asserts its current frame's opacity.) */
		animation: none;
		opacity: 1;
	}
	.lineage-find-me-pill:hover {
		/* Hover stays ~10 % denser than the resting tones above,
		   matching the brighter resting palette in this pass. */
		background-color: color-mix(in srgb, var(--color-primary), transparent 76%);
		color: oklch(from var(--color-primary) calc(l + 0.06) c h / 0.97);
		border-color: color-mix(in srgb, var(--color-primary), transparent 58%);
	}
	.lineage-find-me-pill:focus-visible {
		outline: 2px solid color-mix(in srgb, var(--color-primary), transparent 40%);
		outline-offset: 2px;
	}

	/* ── Post-amplify reveal flash ─────────────────────────────────
	   When the reveal sequence reaches step B, the script sets
	   `data-reveal-flash-user="<id>"` on .tree-scroll-x. We target
	   the matching wrapper's row-selection-zone — the same element
	   that carries the persistent "Your signal" cu-row styling — and
	   run a one-shot 1 s keyframe animation that briefly raises the
	   bg tint and adds an outer glow, then settles back to baseline.

	   The trailing 100 % keyframe holds nothing (animation:
	   forwards is NOT set), so when the animation ends the
	   underlying class styles (bg-primary/9, etc.) resume
	   unchanged. No scale, no spring, no bounce. */
	@keyframes lineage-reveal-flash {
		0% {
			background-color: color-mix(in srgb, var(--color-primary), transparent 91%);
			box-shadow: 0 0 0 0 transparent;
		}
		35% {
			background-color: color-mix(in srgb, var(--color-primary), transparent 72%);
			box-shadow:
				0 0 22px 4px color-mix(in srgb, var(--color-primary), transparent 65%),
				0 0 0 1px color-mix(in srgb, var(--color-primary), transparent 55%);
		}
		100% {
			background-color: color-mix(in srgb, var(--color-primary), transparent 91%);
			box-shadow: 0 0 0 0 transparent;
		}
	}
	/* The reveal-flash-active class is added imperatively by the
	   script (`runRevealSequence`) to Dan's row-selection-zone after
	   the smooth-scroll lands, and removed 1 s later. :global is
	   required because .row-selection-zone lives inside the child
	   PropagationNode component's scoped CSS namespace. */
	:global(.row-selection-zone.reveal-flash-active) {
		animation: lineage-reveal-flash 1000ms ease-in-out;
	}
</style>
