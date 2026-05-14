<script lang="ts">
	import { Radio } from 'lucide-svelte';
	import { fromYourScoutsItems, scoutItems } from '$lib/mock/data';
	import LaneHeader from '$lib/components/LaneHeader.svelte';
	import PlayOverlay from '$lib/components/PlayOverlay.svelte';
	import { navigateToItem, navigateToItemKey } from '$lib/navigation';

	/*
		From Your Scouts. The warmest, most personal discovery lane on the
		homepage — every card carries a small scout-presence header above the
		artwork so the source scout reads as the primary subject. This is the
		"signals arriving from people you intentionally follow" surface; the
		scout name + avatar lead, the item is the payload.

		Visual differentiation from neighbouring lanes:
		  - sky-blue accent (slightly warmer than the project's cyan)
		  - scout avatar visible in the card chrome
		  - small "shared by" header row
		  - softer card border + quieter glow
		The atmosphere stays archival/calm — explicitly NOT a social feed.
	*/

	function scoutFor(id: string) {
		return scoutItems.find(s => s.id === id);
	}
</script>

<section class="relative">
	<LaneHeader
		title="From your scouts"
		subtitle="Signals directly surfaced by scouts you follow"
		accentClass="bg-sky-300/65"
		linkHoverClass="hover:text-sky-200/88"
		variant="refresh"
		href="/discover"
	/>

	<!--
		Narrower cards than the standard 4-col `1fr` template so the lane reads
		as small personal transmissions rather than a major content lane.
		`minmax(200px, 250px)` caps each card at 250px on wide viewports;
		the grid sits left-aligned in the available space.
	-->
	<div class="mt-5 grid gap-4 pb-2 w-full" style="grid-template-columns: repeat(4, minmax(200px, 250px));">
		{#each fromYourScoutsItems as item (item.id)}
			{@const scout = scoutFor(item.sourceScoutId)}
			<div
				class="group relative rounded-xl overflow-hidden cursor-pointer border border-sky-300/16 hover:border-sky-300/34 bg-base-200/45 transition-all duration-250 hover:-translate-y-px"
				style="box-shadow: 0 0 0 1px oklch(0.85 0.10 230 / 0.06), 0 6px 18px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.03);"
				onclick={(e) => navigateToItem(item.id, e)}
				onkeydown={(e) => navigateToItemKey(item.id, e)}
				role="button"
				tabindex="0"
				aria-label={`View ${item.title}`}
			>
				<!--
					Scout-presence header. Avatar + route line — kept compact so the
					human presence remains, but the artwork below regains priority.
				-->
				{#if scout}
					<div class="flex items-center gap-2 px-3 pt-2.5 pb-1.5">
						<div class="w-5 h-5 rounded-full overflow-hidden border border-sky-300/26 shrink-0">
							<img src={scout.avatar} alt="" class="w-full h-full object-cover" />
						</div>
						<p class="text-[11px] font-medium text-sky-100/72 truncate">{item.routeNarrative}</p>
					</div>
				{/if}

				<!-- Artwork — square, no vertical clipping. Inset trimmed from
				     mx-3 to mx-2 so the cover occupies slightly more of the card's
				     visual mass — "small but emotionally vivid transmissions." -->
				<div class="relative aspect-square w-full mx-2 my-0" style="width: calc(100% - 16px);">
					<div class="absolute inset-0 rounded-lg overflow-hidden border border-white/8">
						<img
							src={item.image}
							alt={item.title}
							class="w-full h-full object-cover opacity-78 group-hover:opacity-92 transition-opacity duration-300"
						/>
						<div class="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent"></div>
						<div class="absolute inset-0 bg-linear-to-br from-sky-300/5 to-transparent mix-blend-color"></div>
						<PlayOverlay size="sm" />
					</div>
				</div>

				<!-- Metadata — tightened spacing. -->
				<div class="px-3 pt-2.5 pb-2.5">
					<p class="text-[13px] font-bold text-base-content/95 truncate leading-snug">{item.title}</p>
					<p class="text-[12px] text-base-content/68 truncate mt-0.5">{item.artist} · {item.genre}</p>
					{#if item.propagationState}
						<p class="text-[11px] text-sky-100/42 leading-snug mt-1.5 truncate">{item.propagationState}</p>
					{/if}
					<div class="flex justify-end mt-2">
						<button
							class="flex items-center gap-1 h-5 px-2 rounded-full text-[11px] font-semibold text-sky-200/82 border border-sky-300/35 hover:bg-sky-300/12 hover:border-sky-300/58 hover:text-sky-100 transition-all"
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
