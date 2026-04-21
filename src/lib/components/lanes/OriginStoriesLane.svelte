<script lang="ts">
	import { originItems } from '$lib/mock/data';
	import StoryCard from '$lib/components/StoryCard.svelte';
</script>

<section class="pt-6 pb-2">
	<div class="w-0.75 h-3.5 rounded-full bg-secondary" aria-hidden="true"></div>
	<p class="ml-3.5 mt-1.5 text-sm font-bold uppercase tracking-widest leading-tight text-base-content/95">Origin Stories</p>
	<p class="ml-3.5 mt-0.5 text-[12px] leading-normal text-base-content/65 max-w-105">How signals spread through the network</p>

	<div class="mt-5 grid grid-cols-3 gap-3">
		{#each originItems as item (item.id)}
			<div class="h-full">
				<StoryCard {item} />
			</div>
		{/each}
	</div>
</section>
