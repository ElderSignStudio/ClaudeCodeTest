<script lang="ts">
	import ItemHero from '$lib/components/itemDetail/ItemHero.svelte';
	import PropagationTree from '$lib/components/itemDetail/PropagationTree.svelte';
	import BranchInspector from '$lib/components/itemDetail/BranchInspector.svelte';
	import type { PropagationUser, PreviewTarget } from '$lib/mock/propagation';

	/*
		Item Detail page.

		Two-tier inspector state — preview (hover, ephemeral) vs selection
		(click, committed). The active target is whichever exists, preferring
		hover so the inspector responds immediately as the cursor moves
		through the lineage. When hover clears (cursor leaves the tree), the
		inspector falls back to the committed selection — or to the global
		state if nothing is selected.

		Mental model:
		  - Item   = global context  (no selection, no preview)
		  - User   = branch context  (hovering or selecting a person)
		  - Cluster = collapsed-tail context (hovering "+N more")
		  - Clicking the hero resets the committed selection to null.

		Responsive shape:
		  - At lg+ we use a 2-column grid with the tree taking 1.55fr and the
		    inspector 1fr. Inspector is `sticky` so it stays in view as the
		    tree scrolls.
		  - Below lg the columns collapse to a single stacked column with the
		    tree above the inspector. No cramped desktop imitation.
	*/

	let { data } = $props();
	const { item, forest } = $derived(data);

	let selectedTarget = $state<PreviewTarget | null>(null);
	let hoveredTarget  = $state<PreviewTarget | null>(null);

	// Inspector reads the active target. Hover wins over selection so the
	// pane stays responsive as the cursor moves through nodes; once hover
	// clears, the pane reverts to the committed selection.
	const activeTarget = $derived<PreviewTarget | null>(hoveredTarget ?? selectedTarget);

	function handleSelect(user: PropagationUser) {
		selectedTarget = { kind: 'user', user };
	}
	function handlePreview(target: PreviewTarget | null) {
		hoveredTarget = target;
	}
	function resetToGlobal() {
		selectedTarget = null;
		hoveredTarget = null;
	}
</script>

<svelte:head>
	<title>{item.title} — {item.artist} · Outer Signal</title>
</svelte:head>

<div class="max-w-360 mx-auto w-full px-6 xl:px-8 py-8 space-y-8">

	<!-- ── Hero / item header ── -->
	<ItemHero {item} {forest} onReset={resetToGlobal} />

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
					{forest}
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
					<BranchInspector {forest} target={activeTarget} />
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
