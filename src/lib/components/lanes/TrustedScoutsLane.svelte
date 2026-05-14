<script lang="ts">
	import { Radio } from 'lucide-svelte';
	import { trustedScoutsItems, scoutItems } from '$lib/mock/data';
	import LaneHeader from '$lib/components/LaneHeader.svelte';
	import PlayOverlay from '$lib/components/PlayOverlay.svelte';
	import { navigateToItem, navigateToItemKey } from '$lib/navigation';

	/*
		Trusted Scouts. Calmly reliable curators — NOT a popularity board, NOT
		a prestige surface. The card chrome stays clean: no avatar, observational
		typography, restrained borders. The scout reads through a single
		integrated metadata row (route + resonance stat) plus a quiet editorial
		quality note. Everything below should feel contemplative.
	*/

	function scoutFor(id: string) {
		return scoutItems.find(s => s.id === id);
	}
</script>

<section class="relative">
	<LaneHeader
		title="Trusted scouts"
		subtitle="Scouts with consistently resonant signals"
		accentClass="bg-white/45"
		linkHoverClass="hover:text-white/82"
		href="/discover"
	/>

	<div class="mt-5 grid gap-4 pb-2 w-full" style="grid-template-columns: repeat(4, minmax(200px, 1fr));">
		{#each trustedScoutsItems as item (item.id)}
			{@const scout = scoutFor(item.sourceScoutId)}
			<div
				class="group relative rounded-lg overflow-hidden cursor-pointer border border-white/16 hover:border-white/28 transition-colors duration-200"
				style="background-color: oklch(0.13 0.018 265 / 0.65); box-shadow: 0 0 0 1px oklch(1 0 0 / 0.04), 0 3px 12px rgba(0,0,0,0.20), inset 0 1px 0 rgba(255,255,255,0.03);"
				onclick={(e) => navigateToItem(item.id, e)}
				onkeydown={(e) => navigateToItemKey(item.id, e)}
				role="button"
				tabindex="0"
				aria-label={`View ${item.title}`}
			>
				<!-- Artwork — quieter hover (less saturation/opacity lift than other lanes). -->
				<div class="relative aspect-square w-full">
					<img
						src={item.image}
						alt={item.title}
						class="w-full h-full object-cover opacity-80 group-hover:opacity-88 transition-opacity duration-300"
					/>
					<div class="absolute inset-0 bg-linear-to-t from-black/56 via-black/12 to-transparent"></div>
					<PlayOverlay size="sm" />
				</div>

				<!-- Metadata — disciplined, observational. -->
				<div class="px-3 pt-3 pb-3">
					<p class="text-[13px] font-bold text-white/95 truncate leading-snug tracking-tight">{item.title}</p>
					<p class="text-[12px] text-white/62 truncate mt-1">{item.artist} · {item.genre}</p>

					<!--
						Route + resonance — one integrated analytical row. The metric
						is the route's structural credibility cue, not a gamified
						badge: same opacity bracket as the route phrase, calm mono
						styling, "resonance" wording (not "hit").
					-->
					<p class="text-[11px] text-white/62 truncate mt-2.5">
						<span class="font-medium">{item.routeNarrative}</span>{#if scout}<span class="font-mono text-white/38"> · </span><span class="font-mono text-white/52 tabular-nums">{scout.hitRate}% resonance</span>{/if}
					</p>

					{#if item.scoutQualityNote}
						<p class="text-[11px] text-white/46 italic leading-snug mt-1 truncate">{item.scoutQualityNote}</p>
					{/if}

					<div class="flex justify-end mt-2.5">
						<button
							class="flex items-center gap-1 h-5 px-2 rounded-full text-[11px] font-semibold text-white/76 border border-white/22 hover:bg-white/5 hover:border-white/36 hover:text-white/92 transition-colors"
							aria-label="Amplify this signal"
						>
							<Radio size={8} />
							Amplify
						</button>
					</div>
				</div>
			</div>
		{/each}
	</div>
</section>
