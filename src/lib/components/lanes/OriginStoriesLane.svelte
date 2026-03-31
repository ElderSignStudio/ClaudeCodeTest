<script lang="ts">
	import { originItems } from '$lib/mock/data';
	import StoryCard from '$lib/components/StoryCard.svelte';
</script>

<section>
	<div class="flex items-center mb-1">
		<div class="flex items-center gap-2">
			<div class="w-0.75 h-3.5 rounded-full bg-secondary" aria-hidden="true"></div>
			<p class="text-sm font-bold uppercase tracking-widest text-base-content/88">Origin Stories</p>
		</div>
	</div>
	<p class="text-[12px] text-base-content/50 mb-4 ml-3.5">How signals spread through the network</p>

	<div class="flex gap-3 overflow-x-auto -mx-5 px-5 pb-2 scrollbar-none items-start">
		{#each originItems as item (item.id)}
			<div class="shrink-0 w-80">
				<StoryCard {item} />
			</div>
		{/each}
	</div>
</section>
