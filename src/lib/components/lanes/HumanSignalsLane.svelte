<script lang="ts">
	import { scoutItems } from '$lib/mock/data';
	import ScoutCard from '$lib/components/ScoutCard.svelte';
</script>

<section>
	<div class="flex items-center mb-1">
		<div class="flex items-center gap-2">
			<div class="w-0.75 h-3.5 rounded-full bg-accent/65" aria-hidden="true"></div>
			<p class="text-sm font-bold uppercase tracking-widest text-base-content/88">Human Signals</p>
		</div>
	</div>
	<p class="text-[12px] text-base-content/50 mb-4 ml-3.5">Follow people, not just songs</p>

	<div class="flex gap-3 overflow-x-auto -mx-5 px-5 pb-2 scrollbar-none items-start">
		{#each scoutItems as scout (scout.id)}
			<ScoutCard {scout} />
		{/each}
	</div>
</section>
