<script lang="ts">
	import { originItems } from '$lib/mock/data';
	import StoryCard from '$lib/components/StoryCard.svelte';
</script>

<section class="relative pt-6 pb-2">
	<!-- Origin Stories atmospheric anchor (PRIMARY benchmark) — most cinematic lane.
	     Two layers: outer atmospheric wash spans the widest vertical (70% height) +
	     inner glow that the propagation diagrams sit inside. The result is the
	     "memory density" the lane is named for — depth, not just color. -->
	<div class="absolute inset-0 pointer-events-none" aria-hidden="true" style="background:radial-gradient(ellipse 92% 70% at 50% 55%,rgba(115,75,200,0.20) 0%,rgba(115,75,200,0.11) 40%,rgba(115,75,200,0.04) 65%,transparent 90%);"></div>
	<div class="absolute inset-0 pointer-events-none" aria-hidden="true" style="background:radial-gradient(ellipse 70% 50% at 50% 58%,rgba(130,90,215,0.18) 0%,rgba(130,90,215,0.09) 45%,transparent 72%);"></div>

	<div class="flex items-start justify-between w-full">
		<div class="flex items-start gap-3">
			<div class="mt-0.5 w-0.5 h-5 rounded-full bg-secondary shrink-0" aria-hidden="true"></div>
			<div>
				<p class="text-sm font-bold uppercase tracking-widest leading-tight text-base-content/95">Origin Stories</p>
				<p class="mt-0.5 text-[13px] leading-normal text-base-content/72 max-w-105">How signals spread through the network</p>
			</div>
		</div>
		<a href="/discover" class="text-[13px] text-base-content/75 hover:text-secondary/88 transition-colors shrink-0" style="margin-right: clamp(0px, 6vw - 48px, 120px);">
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
