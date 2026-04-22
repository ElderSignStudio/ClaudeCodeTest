<script lang="ts">
	import { scoutItems } from '$lib/mock/data';
	import ScoutCard from '$lib/components/ScoutCard.svelte';
</script>

<section class="pt-6 pb-2">
	<div class="flex items-start justify-between w-full">
		<div class="flex items-start gap-3">
			<div class="mt-0.5 w-0.5 h-5 rounded-full bg-accent/65 shrink-0" aria-hidden="true"></div>
			<div>
				<p class="text-sm font-bold uppercase tracking-widest leading-tight text-base-content/95">Human Signals</p>
				<p class="mt-0.5 text-[12px] leading-normal text-base-content/65 max-w-105">Scouts shaping the signal network with taste close to yours</p>
			</div>
		</div>
		<a href="/discover" class="text-[12px] text-base-content/55 hover:text-accent/80 transition-colors shrink-0" style="margin-right: clamp(0px, 6vw - 48px, 120px);">
			See all →
		</a>
	</div>

	<div class="mt-5 grid gap-5 pb-2 w-full" style="grid-template-columns: repeat(4, minmax(240px, 1fr));">
		{#each scoutItems as scout (scout.id)}
			<ScoutCard {scout} />
		{/each}
	</div>
</section>
