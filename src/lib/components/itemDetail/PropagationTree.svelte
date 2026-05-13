<script lang="ts">
	import type { PropagationForest, PropagationUser } from '$lib/mock/propagation';
	import PropagationNode from './PropagationNode.svelte';

	/*
		Renders the propagation forest as a list of independent root branches,
		each its own subtree. Below the visible roots, an editorial hint about
		further hidden origins acts as a quiet acknowledgement that this view
		is the "currently explored region" of the network, not the whole graph.
	*/

	let {
		forest,
		selectedUserId,
		onSelect,
	}: {
		forest: PropagationForest;
		selectedUserId: string | null;
		onSelect: (user: PropagationUser) => void;
	} = $props();
</script>

<div class="flex flex-col gap-1">
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

	<!-- Roots — each is its own independent origin tree -->
	<div class="flex flex-col gap-3.5">
		{#each forest.roots as root (root.id)}
			<PropagationNode
				user={root}
				{selectedUserId}
				{onSelect}
				depth={0}
			/>
		{/each}
	</div>

	<!--
		Hidden roots indicator. Static for v1 — represents quieter origins not
		surfaced in the primary view. Distinguishes itself from the in-branch
		"+N more" by sitting outside any branch's left rail.
	-->
	{#if forest.hiddenRoots > 0}
		<div class="mt-3 pl-1">
			<div class="flex items-start gap-2 py-1.5 text-base-content/52">
				<span class="shrink-0 mt-1 w-4 h-4"></span>
				<span class="shrink-0 mt-0.5 w-7 h-7 rounded-full border border-dashed border-white/12 flex items-center justify-center text-[10px] font-mono text-base-content/45">
					+{forest.hiddenRoots}
				</span>
				<div class="min-w-0 flex-1 pt-0.5">
					<p class="text-[12px] leading-snug text-base-content/62">
						+{forest.hiddenRoots} more independent origins
					</p>
					<p class="text-[11px] leading-snug text-base-content/40 italic">
						Quieter starting points · further from main propagation
					</p>
				</div>
			</div>
		</div>
	{/if}
</div>
