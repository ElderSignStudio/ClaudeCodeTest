<script lang="ts">
	import { originItems } from '$lib/mock/data';
	import StoryCard from '$lib/components/StoryCard.svelte';
</script>

<section class="pt-6 pb-2">
	<div class="flex items-start justify-between w-full">
		<div class="flex items-start gap-3">
			<div class="mt-0.5 w-0.5 h-5 rounded-full bg-secondary shrink-0" aria-hidden="true"></div>
			<div>
				<p class="text-sm font-bold uppercase tracking-widest leading-tight text-base-content/95">Origin Stories</p>
				<p class="mt-0.5 text-[12px] leading-normal text-base-content/65 max-w-105">How signals spread through the network</p>
			</div>
		</div>
		<a href="/discover" class="text-[12px] text-base-content/55 hover:text-secondary/80 transition-colors shrink-0 2xl:mr-30">
			See all →
		</a>
	</div>

	<div class="mt-5 grid gap-5 w-full" style="grid-template-columns: repeat(3, minmax(280px, 1fr));">
		{#each originItems as item (item.id)}
			<div class="h-full">
				<StoryCard {item} />
			</div>
		{/each}
	</div>
</section>
