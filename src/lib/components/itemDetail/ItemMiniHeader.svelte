<script lang="ts">
	import { fly } from 'svelte/transition';
	import type { DetailItem } from '../../../routes/items/[id]/+page';

	/*
		A quiet floating context pill that surfaces only after the
		user has scrolled past the main hero. Contains just the item
		title and artist — by design NOT a toolbar. The hero (with
		full Play / Amplify controls) is one scroll away; this pill
		is purely for orientation during deep tree exploration. Spec
		explicitly allowed dropping the controls if they made the
		pill feel crowded, and a true "quiet breadcrumb" reads
		cleanest without them.

		Layout-neutral: positioned `fixed` so it never causes a
		reflow, and `left-1/2 -translate-x-1/2` so it floats centered
		near the top of the content column without spanning its
		width. Z-index 40 sits below the global top nav (z-50).
	*/

	let {
		item,
		visible,
	}: {
		item: DetailItem;
		visible: boolean;
	} = $props();
</script>

{#if visible}
	<!--
		Subtle floating context pill. Background is a touch lighter
		than the page surface so the title reads at a glance against
		the dark tree behind it, but it's still translucent enough
		that the tree never fully disappears under it. Title brighter
		than the artist so the eye lands on the SIGNAL name first;
		the artist trails as quieter context.

		Background uses an explicit oklch value (rather than `bg-base-200/X`)
		so the alpha + lightness combo is independent of theme-token
		swings — the pill needs a stable "slightly above the page"
		feel rather than mirroring the page surface.
	-->
	<div
		class="fixed top-16 left-1/2 -translate-x-1/2 z-40 rounded-full border border-white/12 bg-[oklch(0.16_0.018_260/0.82)] backdrop-blur-sm px-4 py-1 inline-flex items-baseline gap-1.5 max-w-[90vw]"
		transition:fly={{ duration: 180, y: -6, opacity: 0 }}
		aria-hidden="true"
	>
		<!-- "Signal · " context label — reuses the same muted alpha
		     as the artist line so the eye still lands on the title
		     first; midpoint-dot separator matches the em-dash
		     treatment (alpha /35). -->
		<span class="text-[11.5px] text-base-content/58 shrink-0">Signal</span>
		<span class="text-base-content/35 shrink-0" aria-hidden="true">·</span>
		<p class="text-[12px] font-medium text-base-content/90 truncate">
			{item.title}
		</p>
		<span class="text-base-content/35 shrink-0" aria-hidden="true">—</span>
		<p class="text-[11.5px] text-base-content/58 truncate">
			{item.artist}
		</p>
	</div>
{/if}
