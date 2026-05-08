<script lang="ts">
	import { originItems } from '$lib/mock/data';
	import StoryCard from '$lib/components/StoryCard.svelte';
</script>

<section class="relative pt-6 pb-2">
	<!-- Dark substrate: deepest pocket — propagation diagrams should feel embedded in atmospheric depth -->
	<div class="absolute inset-0 pointer-events-none" aria-hidden="true" style="background:radial-gradient(ellipse 100% 115% at 38% 55%,rgba(0,0,0,0.095) 0%,transparent 75%);"></div>
	<!-- Origin Stories atmosphere: violet-blue memory haze — most cinematic lane -->
	<div class="absolute pointer-events-none" aria-hidden="true" style="width:960px;height:580px;left:10%;top:-38%;background:radial-gradient(ellipse at center,rgba(120,90,220,0.105) 0%,transparent 65%);filter:blur(130px);"></div>
	<div class="absolute pointer-events-none" aria-hidden="true" style="width:560px;height:380px;left:-4%;bottom:-22%;background:radial-gradient(ellipse at center,rgba(80,120,255,0.058) 0%,transparent 65%);filter:blur(115px);"></div>

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
