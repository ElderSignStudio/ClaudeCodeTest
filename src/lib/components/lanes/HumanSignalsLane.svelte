<script lang="ts">
	import { scoutItems } from '$lib/mock/data';
	import ScoutCard from '$lib/components/ScoutCard.svelte';
	import LaneHeader from '$lib/components/LaneHeader.svelte';
</script>

<section class="relative pt-1 pb-2">
	<LaneHeader
		title="Human Signals"
		subtitle="Scouts shaping the signal network with taste close to yours"
		accentClass="bg-accent/65"
		linkHoverClass="hover:text-accent/88"
		href="/discover"
	/>

	<div class="mt-5 grid gap-5 pb-2 w-full" style="grid-template-columns: repeat(4, minmax(240px, 1fr));">
		{#each scoutItems as scout, i (scout.id)}
			<ScoutCard {scout} index={i} />
		{/each}
	</div>
</section>
