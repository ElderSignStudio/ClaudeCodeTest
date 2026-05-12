<script lang="ts">
	import type { OriginItem } from '$lib/mock/data';
	import OriginPropagationDiagram from './OriginPropagationDiagram.svelte';
	import MultiOriginMarker from './MultiOriginMarker.svelte';

	let { item }: { item: OriginItem } = $props();
</script>

<!--
	Cinematic Origin Stories card. Aggressively spacious — diagram is the
	visual centerpiece, rendered via OriginPropagationDiagram in cinematic
	mode (taller viewBox = ~60% more rendered height at the same width).
	Metadata simplified to a single line to remove the dashboard feel.
-->

<div
	class="group h-full rounded-xl border border-white/6 bg-base-200/40 cursor-pointer transition-all duration-250 hover:border-secondary/22 hover:bg-base-200/55 flex flex-col"
	style="box-shadow: 0 0 0 1px rgba(255,255,255,0.04), 0 8px 22px rgba(0,0,0,0.26), inset 0 1px 0 rgba(255,255,255,0.025), inset 0 -1px 0 rgba(0,0,0,0.22), inset 0 0 28px rgba(0,0,0,0.16);"
>
	<div class="p-7 flex-1 flex flex-col">

		<!--
			Header — track identity. 48px thumbnail, 14px / 12px type pairing.
		-->
		<div class="flex items-start gap-4 mb-6">
			<div class="w-12 h-12 rounded-md overflow-hidden border border-white/10 shrink-0">
				<img
					src={item.image}
					alt=""
					class="w-full h-full object-cover opacity-50 group-hover:opacity-68 transition-opacity duration-300"
				/>
			</div>
			<div class="flex-1 min-w-0 pt-0.5">
				<p class="text-[14px] font-semibold text-base-content/82 truncate">{item.title} · {item.artist}</p>
				<p class="text-[12px] text-base-content/55 truncate mt-1">{item.genre}</p>
			</div>
		</div>

		<!--
			Headline — primary narrative element. flex-1 lets empty space
			accumulate above the diagram when content is short.
		-->
		<p class="text-[20px] font-bold text-base-content/92 leading-relaxed mb-8 flex-1 max-w-[34ch]">
			{item.headline}
		</p>

		<!--
			Diagram — emotional centerpiece. No horizontal inset: diagram fills
			the full inner card width so it occupies maximum available space on
			both the wider left card and the narrower right card. Cinematic mode
			in OriginPropagationDiagram gives it the editorial vertical scale.
		-->
		<div class="my-5" aria-hidden="true" style="filter: brightness(1.10);">
			<OriginPropagationDiagram {item} cinematic={true} />
		</div>

		<!--
			Metadata — single calm line instead of two stacked dashboard lines.
		-->
		<p class="mt-7 mb-6 text-[12px] text-base-content/52 leading-normal">
			{#if item.multiOrigin}<MultiOriginMarker seed={item.id} colorClass="text-secondary/28" /> {/if}First surfaced: {item.seedLocation} · {item.reachedScouts} scouts reached
		</p>

		<!--
			Trace Signal CTA — slightly taller than standard (h-9 vs h-7) to
			match the cinematic card scale.
		-->
		<button
			class="w-full flex items-center justify-center h-9 rounded-full text-[13px] font-semibold border border-white/26 text-base-content/82 hover:text-secondary hover:border-secondary/46 hover:bg-white/6 transition-all duration-150"
		>
			Trace Signal →
		</button>

	</div>
</div>
