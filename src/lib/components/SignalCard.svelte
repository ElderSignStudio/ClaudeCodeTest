<script lang="ts">
	import type { Item } from '$lib/mock/data';

	type Props = {
		item: Item;
		tint?: string;
		horizontal?: boolean;
	};

	const { item, tint, horizontal = false }: Props = $props();
</script>

<!--
	Reusable card rendered in two orientations:
	  - vertical (default): square image on top, text footer below — used in ForYou, OneStepAway, Drift
	  - horizontal: fixed-width image on the left, text panel on the right — used in DeepUnderground

	The imageOverlay snippet holds everything that sits inside the image container
	(tint, gradient, hover glow, play button). It's identical in both layouts
	except for the gradient direction and button/icon size.
-->

{#snippet imageOverlay(gradient: string, btnSize: string, iconSize: string)}
	<img
		src={item.image}
		alt={item.title}
		class="w-full h-full object-cover opacity-73 group-hover:opacity-88 transition-opacity duration-300"
	/>
	{#if tint}
		<div class={`absolute inset-0 bg-linear-to-br ${tint} mix-blend-color`}></div>
	{/if}
	<div class={`absolute inset-0 ${gradient}`}></div>
	<div
		class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-250 pointer-events-none"
		style="background: radial-gradient(circle at 50% 50%, oklch(0.68 0.20 265 / 0.10) 0%, transparent 65%);"
		aria-hidden="true"
	></div>
	<div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
		<div class={`${btnSize} rounded-full bg-white/20 border border-white/35 text-white flex items-center justify-center backdrop-blur-sm scale-90 group-hover:scale-100 transition-transform duration-200`}>
			<svg class={`${iconSize} translate-x-px`} viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
				<path d="M3 2l8 4-8 4V2z" />
			</svg>
		</div>
	</div>
{/snippet}

{#if horizontal}
	<div class="group flex h-40 rounded-lg overflow-hidden cursor-pointer border border-white/8 hover:border-white/22 transition-all duration-250 os-card-glow">
		<!-- Left: image -->
		<div class="relative w-44 shrink-0 h-full">
			{@render imageOverlay('bg-linear-to-r from-transparent to-black/20', 'w-9 h-9', 'w-4 h-4')}
		</div>
		<!-- Right: text -->
		<div class="flex-1 px-4 py-3 bg-base-200/70 flex flex-col justify-between min-w-0">
			<div>
				<p class="text-[15px] font-bold text-base-content/95 truncate leading-snug">{item.title}</p>
				<p class="text-[13px] text-base-content/72 truncate mt-1">{item.artist}</p>
			</div>
			<div class="flex items-center gap-2">
				<span class="text-[12px] text-base-content/55">{item.genre}</span>
				{#if item.scouts > 0}
					<span class="text-[11px] text-base-content/40">·</span>
					<span class="text-[12px] text-base-content/50">{item.scouts} {item.scouts === 1 ? 'scout' : 'scouts'}</span>
				{/if}
			</div>
		</div>
	</div>
{:else}
	<div class="group rounded-lg overflow-hidden cursor-pointer border border-white/8 hover:border-white/22 transition-all duration-250 os-card-glow">
		<div class="relative aspect-square w-full">
			{@render imageOverlay('bg-linear-to-t from-black/74 via-black/20 to-transparent', 'w-8 h-8', 'w-3.5 h-3.5')}
			<div class="absolute bottom-0 left-0 right-0 p-2.5">
				<p class="text-[13px] font-bold text-white truncate leading-snug">{item.title}</p>
				<p class="text-[12px] text-white/85 truncate mt-0.5">{item.genre}</p>
			</div>
		</div>
		<div class="px-2.5 py-2 bg-base-200/70">
			<p class="text-[12px] text-base-content/68 truncate">{item.artist}</p>
		</div>
	</div>
{/if}
