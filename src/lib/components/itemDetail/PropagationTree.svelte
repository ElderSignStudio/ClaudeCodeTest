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

	function findCurrentUserAvatar(): HTMLElement | null {
		if (!currentUserId || !scrollContent) return null;
		const wrap = scrollContent.querySelector(`[data-user-id="${currentUserId}"]`) as HTMLElement | null;
		return (wrap?.querySelector('.node-avatar') as HTMLElement | null) ?? null;
	}

	function recomputeUserIndicator() {
		const userEl = findCurrentUserAvatar();
		if (!userEl || !scrollRoot) {
			userIndicator = null;
			return;
		}
		const userBox = userEl.getBoundingClientRect();
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
		   near the bottom player:
		     • bottom 96 px ≈ the fixed player bar (~70 px) + breathing
		       room so the pill is clearly above it
		     • top 28 px ≈ enough clearance from the fixed app header
		   The pill prefers the tree's actual edge when there's room,
		   so on shallow trees it still anchors to the tree's bottom. */
		const TOP_SAFE = 28;
		const BOTTOM_SAFE = 96;
		const buffer = 16;
		const centerX = treeBox.left + treeBox.width / 2;
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
		const userEl = findCurrentUserAvatar();
		if (!userEl) return;
		userEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
	}

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
	const sortedRoots = $derived(sortNodesByPropagation(forest.roots));
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
	<div class="tree-scroll-x" data-lineage-active={lineageActive ? 'true' : 'false'} bind:this={scrollRoot}>
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
		style="left: {userIndicator.centerX}px; {userIndicator.top !== null ? `top: ${userIndicator.top}px;` : `bottom: ${userIndicator.bottom}px;`}"
		onclick={scrollToCurrentUser}
		aria-label="Scroll to your signal"
	>
		{#if userIndicator.direction === 'up'}
			<span aria-hidden="true">↑</span>
			<span>Your signal</span>
		{:else}
			<span>Your signal</span>
			<span aria-hidden="true">↓</span>
		{/if}
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

	/* "Your signal" offscreen indicator — quiet navigation marker
	   anchored to the visible edge of the tree card. Reads as a
	   minimap hint, not a button: small text, soft tint, no neon
	   glow. The ::before pseudo-element adds a subtle vertical
	   gradient fade behind the pill so it feels embedded into the
	   tree's edge rather than floating above it. */
	.lineage-find-me-pill {
		position: fixed;
		transform: translateX(-50%);
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.3rem 0.7rem;
		border-radius: 9999px;
		background-color: color-mix(in srgb, var(--color-primary), transparent 84%);
		color: oklch(from var(--color-primary) calc(l + 0.04) c h / 0.85);
		border: 1px solid color-mix(in srgb, var(--color-primary), transparent 70%);
		box-shadow: 0 1px 6px -3px color-mix(in srgb, var(--color-primary), transparent 70%);
		font-size: 10.5px;
		font-weight: 500;
		letter-spacing: 0.02em;
		line-height: 1;
		cursor: pointer;
		pointer-events: auto;
		/* Above the fixed bottom player (z-50) so the pill stays
		   clickable even when it sits near the tree's bottom edge. */
		z-index: 60;
		transition: background-color 200ms ease, box-shadow 200ms ease, color 200ms ease;
		backdrop-filter: blur(6px);
		-webkit-backdrop-filter: blur(6px);
	}
	/* Subtle vertical fade behind the pill — extends ~32 px above and
	   below from the pill center, creating the impression that the
	   tree edge softly dissolves into the pill. Pointer-events none so
	   clicks always hit the pill itself. */
	.lineage-find-me-pill::before {
		content: '';
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		width: calc(100% + 96px);
		height: 64px;
		border-radius: 9999px;
		background: radial-gradient(
			ellipse at center,
			color-mix(in srgb, var(--color-primary), transparent 90%) 0%,
			color-mix(in srgb, var(--color-primary), transparent 97%) 45%,
			transparent 80%
		);
		pointer-events: none;
		z-index: -1;
	}
	.lineage-find-me-pill:hover {
		background-color: color-mix(in srgb, var(--color-primary), transparent 76%);
		color: oklch(from var(--color-primary) calc(l + 0.06) c h / 0.95);
		box-shadow: 0 2px 9px -3px color-mix(in srgb, var(--color-primary), transparent 60%);
	}
	.lineage-find-me-pill:focus-visible {
		outline: 2px solid color-mix(in srgb, var(--color-primary), transparent 40%);
		outline-offset: 2px;
	}
</style>
