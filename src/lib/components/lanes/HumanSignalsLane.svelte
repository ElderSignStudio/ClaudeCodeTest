<script lang="ts">
	import { scoutItems } from '$lib/mock/data';
	import ScoutCard from '$lib/components/ScoutCard.svelte';
</script>

<section class="pt-6 pb-2">
	<div class="flex items-center justify-between">
		<div class="w-0.75 h-3.5 rounded-full bg-accent/65" aria-hidden="true"></div>
		<a href="/discover" class="text-[12px] text-base-content/55 hover:text-accent/80 transition-colors">
			See all →
		</a>
	</div>
	<p class="ml-3.5 mt-1.5 text-sm font-bold uppercase tracking-widest leading-tight text-base-content/95">Human Signals</p>
	<p class="ml-3.5 mt-0.5 text-[12px] leading-normal text-base-content/65 max-w-105">Scouts shaping the signal network with taste close to yours</p>

	<div class="mt-5 flex gap-3 overflow-x-auto -mx-5 px-5 pb-2 scrollbar-none items-start">
		{#each scoutItems as scout (scout.id)}
			<ScoutCard {scout} />
		{/each}
	</div>
</section>
