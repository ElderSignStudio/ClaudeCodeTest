<script lang="ts">
	import type { UserSignalTree } from '$lib/mock/userSignalTree';
	import SignalTreeSignalNode from './SignalTreeSignalNode.svelte';

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
	<!-- Root scout: bigger avatar + name; subtitle communicates
	     archetype + score in one quiet line. NOT a clickable link
	     to /users/{id} — the viewer is already on this scout's
	     profile, so the row reads as an anchor, not navigation. -->
	<div class="root-node flex items-center gap-3 px-1 py-1">
		<span class="shrink-0 w-12 h-12 rounded-full border border-primary/30 overflow-hidden bg-white/5">
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
				<SignalTreeSignalNode {signal} />
			{/each}
		</div>
	{/if}
</div>

<style>
	/* ── Connectors ────────────────────────────────────────────
	   Selectors use :global() so the rules reach the
	   `.tree-children` and `.tree-child` markup defined in the
	   sibling components (`SignalTreeSignalNode`,
	   `SignalTreeUserNode`) without manually re-declaring CSS in
	   each file. Scoped to `.signal-tree` so other parts of the
	   app can't be accidentally hit.

	   Two pieces:
	     • Vertical dashed line on `.tree-children` — runs the full
	       height of the children block.
	     • Horizontal stub on each `.tree-child` — pseudo-element
	       that meets the vertical line and reaches the child's
	       content. Width tuned so the stub stops cleanly at the
	       avatar/cover edge, not under it.
	   No solid borders — dashed reads as "lineage continues" the
	   same way the Item Detail tree's dashed ghost-child rails do
	   elsewhere in the app. */

	:global(.signal-tree .tree-children) {
		position: relative;
		margin-left: 1.5rem;
		padding-left: 1.5rem;
		border-left: 1px dashed oklch(1 0 0 / 0.14);
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-top: 0.5rem;
	}
	:global(.signal-tree .tree-children > .tree-child) {
		position: relative;
	}
	:global(.signal-tree .tree-children > .tree-child)::before {
		content: '';
		position: absolute;
		left: -1.5rem;
		top: 1.25rem;
		width: 1rem;
		height: 1px;
		border-top: 1px dashed oklch(1 0 0 / 0.14);
		pointer-events: none;
	}

	/* Slightly stronger connector tone at the FIRST level
	   (signals branching off the root) so the viewer clearly sees
	   "these come from me". Subsequent levels (user→user) stay at
	   the softer default. */
	:global(.signal-tree > .tree-children) {
		border-left-color: oklch(1 0 0 / 0.18);
	}
	:global(.signal-tree > .tree-children > .tree-child)::before {
		border-top-color: oklch(1 0 0 / 0.18);
	}
</style>
