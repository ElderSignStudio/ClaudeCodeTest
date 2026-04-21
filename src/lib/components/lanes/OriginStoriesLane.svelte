<script lang="ts">
	import { originItems } from '$lib/mock/data';
	import StoryCard from '$lib/components/StoryCard.svelte';
</script>

<section>
	<div class="flex items-center mb-2">
		<div class="flex items-center gap-2">
			<div class="w-0.75 h-3.5 rounded-full bg-secondary" aria-hidden="true"></div>
			<p class="text-sm font-bold uppercase tracking-widest leading-relaxed text-base-content/88">Origin Stories</p>
		</div>
	</div>
	<p class="text-[12px] leading-relaxed text-base-content/50 mb-6 ml-3.5">How signals spread through the network</p>

	<div class="grid grid-cols-3 gap-3">
		{#each originItems as item (item.id)}
			<div class="h-full">
				<StoryCard {item} />
			</div>
		{/each}
	</div>
</section>
