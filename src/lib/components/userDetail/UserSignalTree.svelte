<script lang="ts">
	import type { UserSignalTree } from '$lib/mock/userSignalTree';
	import SignalTreeSignalNode from './SignalTreeSignalNode.svelte';
	import SignalTreeFullPropagation from './SignalTreeFullPropagation.svelte';

	/* PROTOTYPE GATE — see `SignalTreeFullPropagation.svelte`.
	   Only Dan's Cold Dispatch branch routes through the full
	   Item-Tree integration; every other signal stays on the
	   lightweight static renderer. Keying off `itemId` is
	   sufficient because no other user mock has Cold Dispatch in
	   their tree. */
	const FULL_PROPAGATION_ITEM_IDS = new Set(['cold-dispatch']);

	/*
		User Detail page — mixed Signal Tree.

		Layout (deliberately NOT the Item Detail tree):
		  User (root) ──┬── Signal ── User ── User
		                ├── Signal ── User
		                └── Signal ── User ── User

		Visual hierarchy: signal cards are the main anchors (cover
		artwork + warm-amber impact chip + accent title), user
		descendants are quieter. Connectors are pure CSS — a dashed
		vertical line on each `.tree-children` container plus a
		short horizontal stub per `.tree-child` via `::before`. No
		SVG, no particles, no offset-path animation — this overview
		tree intentionally avoids the Item Detail tree's full
		propagation simulation.

		See `SignalTreeSignalNode.svelte` and
		`SignalTreeUserNode.svelte` for per-node markup; both
		descend through `.tree-children` so the connector geometry
		composes seamlessly across the whole tree.
	*/

	let {
		tree,
	}: {
		tree: UserSignalTree;
	} = $props();
</script>

<div class="signal-tree">
	<!-- Root scout: wrapped in a subtle inset card with a faint
	     primary-accent bar on the left so the row reads as the
	     SOURCE of the tree rather than the first item in a list.
	     Translucent dark surface mirrors the rest of the page's
	     card recipe; intentionally NOT clickable since the viewer
	     is already on this scout's profile. -->
	<div class="root-node relative flex items-center gap-3 rounded-xl border border-white/8 bg-base-200/40 pl-4 pr-4 py-3">
		<span class="absolute left-0 top-3 bottom-3 w-0.5 rounded-r-full bg-primary/55" aria-hidden="true"></span>
		<span class="shrink-0 w-12 h-12 rounded-full border border-primary/40 overflow-hidden bg-white/5">
			<img src={tree.root.avatar} alt="" class="w-full h-full object-cover" />
		</span>
		<div class="min-w-0 flex-1">
			<p class="text-[16px] font-bold text-base-content/94 leading-snug truncate">{tree.root.name}</p>
			<p class="text-[12px] text-base-content/58 italic leading-snug truncate">{tree.root.role}</p>
		</div>
	</div>

	<!-- Signals — top-level children of the root. Renders inside
	     `.tree-children` so the connector treatment is consistent
	     with deeper levels. -->
	{#if tree.root.children.length > 0}
		<div class="tree-children">
			{#each tree.root.children as signal (signal.id)}
				{#if tree.root.id === 'dan' && FULL_PROPAGATION_ITEM_IDS.has(signal.itemId)}
					<SignalTreeFullPropagation {signal} />
				{:else}
					<SignalTreeSignalNode {signal} />
				{/if}
			{/each}
		</div>
	{/if}
</div>

<style>
	/* ── Connectors ────────────────────────────────────────────
	   Polished pass: cooler hue (subtle cyan-violet, not neutral
	   white), lower alpha, and a tight dash-array carried via
	   `background-image` instead of `border-style: dashed` so the
	   strokes feel like faint signal paths rather than a folder-
	   tree skeleton. Two pieces:
	     • Vertical line on `.tree-children` — runs the full height
	       of the children block; rendered via a left-aligned
	       background gradient so the dash spacing is independent
	       of border-width's browser-default ratio.
	     • Horizontal stub on each `.tree-child` — pseudo-element
	       with the same dash-array, meeting the vertical line and
	       reaching to just before the child's content.
	   Selectors use :global() so the rules reach the markup
	   defined inside `SignalTreeSignalNode` and
	   `SignalTreeUserNode`, scoped to `.signal-tree` to prevent
	   any leak. */

	:global(.signal-tree .tree-children) {
		position: relative;
		margin-left: 1.5rem;
		padding-left: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.875rem;
		margin-top: 0.875rem;
		/* Vertical signal-path: a 1 px-wide image of a 4 px-on /
		   3 px-off pattern, left-aligned. Hue is cool cyan-violet,
		   alpha 0.12 — quiet enough to recede behind the cards. */
		background-image: linear-gradient(
			to bottom,
			oklch(0.74 0.04 245 / 0.18) 0 4px,
			transparent 4px 7px
		);
		background-repeat: repeat-y;
		background-size: 1px 7px;
		background-position: left 0 top 0;
	}
	:global(.signal-tree .tree-children > .tree-child) {
		position: relative;
	}
	:global(.signal-tree .tree-children > .tree-child)::before {
		content: '';
		position: absolute;
		left: -1.5rem;
		top: 1.5rem;
		width: 1.25rem;
		height: 1px;
		pointer-events: none;
		background-image: linear-gradient(
			to right,
			oklch(0.74 0.04 245 / 0.18) 0 4px,
			transparent 4px 7px
		);
		background-repeat: repeat-x;
		background-size: 7px 1px;
	}

	/* Slightly stronger connector tone at the FIRST level
	   (signals branching off the root) so the viewer clearly sees
	   "these come from me". Subsequent levels (user→user) keep
	   the softer default. */
	:global(.signal-tree > .tree-children) {
		background-image: linear-gradient(
			to bottom,
			oklch(0.74 0.05 245 / 0.26) 0 4px,
			transparent 4px 7px
		);
	}
	:global(.signal-tree > .tree-children > .tree-child)::before {
		background-image: linear-gradient(
			to right,
			oklch(0.74 0.05 245 / 0.26) 0 4px,
			transparent 4px 7px
		);
	}
</style>
