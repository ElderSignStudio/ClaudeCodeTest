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
	}: {
		forest: PropagationForest;
		selectedUserId: string | null;
		onSelect: (user: PropagationUser) => void;
		onPreview: (target: PreviewTarget | null) => void;
	} = $props();

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
	<div class="tree-scroll-x">
	<div class="tree-scroll-content">

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

	</div><!-- /.tree-scroll-content -->
	</div><!-- /.tree-scroll-x -->
</div>

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
	}
</style>
