<script lang="ts">
	import { originItems } from '$lib/mock/data';
	import OriginStoryCard from '$lib/components/OriginStoryCard.svelte';

	// Show only the first 2 of the 3 origin items.
	// Two oversized cards create breathing room and editorial pacing that
	// three medium cards cannot — the empty space itself becomes composition.
	const featuredOrigins = originItems.slice(0, 2);
</script>

<!--
	Origin Stories — editorial cadence break.

	Deliberately taller and slower than every other lane on the page (~1.5x
	the vertical presence of standard lanes). Two oversized asymmetric cards
	instead of three uniform ones. The lane reads as a cinematic pause near
	the bottom of the page rather than "another content row."

	Header has extra top padding and a longer subtitle reach. The grid uses
	asymmetric columns (1.35fr 1fr) so the left card feels slightly dominant
	without becoming visually rigid. Gap between cards is larger (gap-8 vs
	the standard gap-5) to give each card room to breathe.

	The lane's existing violet atmospheric envelope (defined in +page.svelte)
	is untouched — the larger quieter section simply gives that atmosphere
	more room to be felt as environmental rather than compressed behind
	feed-density content.
-->

<section class="relative pt-14 pb-12">

	<!-- Header — slightly more breathing room than other lane headers -->
	<div class="flex items-start justify-between w-full">
		<div class="flex items-start gap-3">
			<div class="mt-0.5 w-0.5 h-5 rounded-full bg-secondary shrink-0" aria-hidden="true"></div>
			<div>
				<p class="text-sm font-bold uppercase tracking-widest leading-tight text-base-content/95">Origin Stories</p>
				<p class="mt-1 text-[13px] leading-normal text-base-content/72 max-w-130">How signals spread through the network — the hidden propagation history behind the loudest tracks</p>
			</div>
		</div>
		<a href="/discover" class="text-[13px] text-base-content/75 hover:text-secondary/88 transition-colors shrink-0" style="margin-right: clamp(0px, 6vw - 48px, 120px);">
			See all →
		</a>
	</div>

	<!--
		Asymmetric two-card layout.
		Left card takes 1.2fr (~55%), right takes 1fr (~45%). The asymmetry
		creates visual movement and prevents the rigid feed-grid feeling, but
		the right card no longer feels secondary or undernourished. Gap-8 keeps
		each card visually distinct.
	-->
	<div class="mt-8 grid gap-8 w-full items-start" style="grid-template-columns: 1.2fr 1fr;">
		{#each featuredOrigins as item (item.id)}
			<div class="h-full">
				<OriginStoryCard {item} />
			</div>
		{/each}
	</div>

</section>
