<script lang="ts">
	import { scoutItems } from '$lib/mock/data';
	import ScoutCard from '$lib/components/ScoutCard.svelte';
</script>

<section class="relative pt-6 pb-2">
	<!-- Human Signals (SECONDARY) — slightly warmer blue, "inhabited" reading zone.
	     R-channel lifted from 95 to 110 for a subtle warmer cast (not orange — just less cold). -->
	<div class="absolute inset-0 pointer-events-none" aria-hidden="true" style="background:radial-gradient(ellipse 85% 55% at 50% 55%,rgba(110,135,180,0.16) 0%,rgba(110,135,180,0.08) 40%,rgba(110,135,180,0.03) 65%,transparent 85%);"></div>

	<div class="flex items-start justify-between w-full">
		<div class="flex items-start gap-3">
			<div class="mt-0.5 w-0.5 h-5 rounded-full bg-accent/65 shrink-0" aria-hidden="true"></div>
			<div>
				<p class="text-sm font-bold uppercase tracking-widest leading-tight text-base-content/95">Human Signals</p>
				<p class="mt-0.5 text-[13px] leading-normal text-base-content/72 max-w-105">Scouts shaping the signal network with taste close to yours</p>
			</div>
		</div>
		<a href="/discover" class="text-[13px] text-base-content/75 hover:text-accent/88 transition-colors shrink-0" style="margin-right: clamp(0px, 6vw - 48px, 120px);">
			See all →
		</a>
	</div>

	<div class="mt-5 grid gap-5 pb-2 w-full" style="grid-template-columns: repeat(4, minmax(240px, 1fr));">
		{#each scoutItems as scout (scout.id)}
			<ScoutCard {scout} />
		{/each}
	</div>
</section>
