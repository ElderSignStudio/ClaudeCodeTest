<script lang="ts">
	import { ExternalLink } from 'lucide-svelte';
	import PropagationTree from '$lib/components/itemDetail/PropagationTree.svelte';
	import {
		propagationForestFor,
		findUserInForest,
		type PropagationForest,
		type PropagationUser,
		type PreviewTarget,
	} from '$lib/mock/propagation';
	import type { SignalTreeSignalNode } from '$lib/mock/userSignalTree';

	/*
		PROTOTYPE — Item-Tree integration for the User Tree.

		Renders the signal card exactly like a regular User-Tree
		signal node, but BELOW the card mounts the real
		`PropagationTree` from the Item Detail page. The tree is
		built by calling `propagationForestFor(itemId, scouts,
		'dan')` — the same mock generator the Item Detail page
		uses — so this prototype displays the *actual* Cold
		Dispatch propagation system in the User Tree context.

		Two minor adaptations vs. the Item Detail mount:
		  1. Dan IS the rebranded origin of the generated forest.
		     We render his children as roots so the visual
		     "origin" position is filled by the Item Card above
		     (per spec: "Cold Dispatch becomes the equivalent of
		     an Item Detail tree origin node"). Dan himself is not
		     re-drawn inside the propagation tree.
		  2. `currentUserId` is left null since Dan isn't in the
		     propagation tree any more — that disables the
		     locator pill and lineage-reveal triggers without
		     touching PropagationTree.

		No inspector, no preview, no lineage reveal. Selection
		state is local; clicking a node lights it up via
		PropagationTree's existing selection styling but goes
		nowhere else (per spec: "Selection should simply allow us
		to evaluate the tree visually").
	*/

	let {
		signal,
	}: {
		signal: SignalTreeSignalNode;
	} = $props();

	/* Build the same forest the Item Detail page uses. `signal.listeners`
	   stands in for the "scouts" count (the generator uses it for
	   weighting only). Memoised by signal id via $derived. */
	const fullForest: PropagationForest = $derived(
		propagationForestFor(signal.itemId, signal.listeners, 'dan'),
	);

	/* Strip Dan from the visible tree — the Cold Dispatch card
	   above ALREADY plays the origin role. Dan's children become
	   the visible roots. */
	const subForest: PropagationForest = $derived.by(() => {
		const dan = findUserInForest(fullForest, 'dan');
		if (!dan || dan.children.length === 0) return fullForest;
		return { ...fullForest, roots: dan.children };
	});

	let selectedUserId = $state<string | null>(null);

	function handleSelect(user: PropagationUser) {
		/* Toggle on repeat-click — mirrors the Item Detail tree's
		   selection-toggle behaviour. */
		selectedUserId = selectedUserId === user.id ? null : user.id;
	}

	function handlePreview(_target: PreviewTarget | null) {
		/* No-op: this prototype does not mount an inspector. The
		   prop is required by PropagationTree so we provide a
		   passthrough. */
	}
</script>

<div class="tree-child">
	<!-- Item card — same shape as the lightweight static
	     `SignalTreeSignalNode`, but the descendants below it are
	     not user rows: they are the entire Item-Detail
	     propagation tree. -->
	<a
		href="/items/{signal.itemId}"
		class="signal-card group flex items-start gap-3 rounded-lg border border-white/8 bg-white/3 hover:bg-white/8 hover:border-white/18 transition-colors px-3 py-2.5"
		style="background-image: linear-gradient(to right, oklch(0.74 0.10 230 / 0.05) 0%, transparent 35%);"
	>
		<span class="shrink-0 w-11 h-11 rounded-md border border-white/10 overflow-hidden bg-white/5">
			{#if signal.coverArt}
				<img src={signal.coverArt} alt="" class="w-full h-full object-cover" />
			{/if}
		</span>
		<div class="min-w-0 flex-1">
			<div class="flex items-baseline gap-2 flex-wrap">
				<span class="text-[14px] font-semibold text-accent/92 group-hover:text-accent transition-colors leading-snug">
					{signal.title}
				</span>
				<span class="text-base-content/30">—</span>
				<span class="text-[12.5px] text-base-content/65 leading-snug">{signal.artist}</span>
				<ExternalLink size={10} class="opacity-40 group-hover:opacity-75 transition-opacity -translate-y-px" />
			</div>
			<div class="mt-0.5 flex items-baseline gap-2 text-[11.5px] text-base-content/55 tabular-nums">
				<span>{signal.listeners} listeners</span>
				<span class="text-base-content/28">·</span>
				<span>{signal.generations} {signal.generations === 1 ? 'generation' : 'generations'}</span>
				<span class="text-base-content/28">·</span>
				<span>Impact {signal.impact}</span>
			</div>
		</div>
		<span class="shrink-0 text-[10px] uppercase tracking-widest font-semibold px-1.5 py-0.5 rounded-full border border-[oklch(0.86_0.12_60)]/30 text-[oklch(0.86_0.12_60)]/82 bg-[oklch(0.86_0.12_60)]/8 self-start">
			{signal.impact}
		</span>
	</a>

	<!-- Mounted Item-Detail PropagationTree.
	     `currentUserId` is null because Dan isn't in this
	     sub-forest — the Item Card above plays his role. Disabling
	     it also stops PropagationTree from rendering a locator
	     pill or activating lineage reveal: both of those depend on
	     the current-user node existing in the tree. -->
	<div class="prototype-mount mt-3 ml-3 rounded-md border border-white/8 bg-base-200/25 p-2">
		<p class="text-[10px] uppercase tracking-widest text-base-content/45 px-1 pb-1.5 italic">
			Prototype · Item-Tree propagation embedded
		</p>
		<PropagationTree
			forest={subForest}
			selectedUserId={selectedUserId}
			onSelect={handleSelect}
			onPreview={handlePreview}
			currentUserId={null}
		/>
	</div>
</div>
