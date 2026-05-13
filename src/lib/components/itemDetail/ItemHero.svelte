<script lang="ts">
	import { Radio } from 'lucide-svelte';
	import PlayOverlay from '$lib/components/PlayOverlay.svelte';
	import type { DetailItem } from '../../../routes/items/[id]/+page';

	/*
		Item header / hero section. Kept cinematic but not gigantic — the
		propagation explorer below is the real focus. Clicking the artwork or
		title area resets the inspector to global state (per spec: "clicking
		the hero item section resets selection"). Buttons (Play, Amplify)
		stopPropagation so they remain functional without resetting.
	*/

	let {
		item,
		onReset,
	}: {
		item: DetailItem;
		onReset: () => void;
	} = $props();

	// One-line contextual sub-copy assembled from whichever editorial fields
	// the source lane provides. Falls back gracefully if all are absent.
	// Hero contextual sub-copy:
	//  - Origin Stories items lead with their historical narrative headline.
	//  - Every other item uses its singular discovery route. Fallback chain
	//    keeps spread/whisper editorial text available for items that have it.
	const contextLine = $derived(
		item.headline
			?? item.routeNarrative
			?? item.spreadReason
			?? item.whisperHint
			?? null,
	);
</script>

<div
	class="group relative rounded-xl overflow-hidden cursor-pointer"
	onclick={onReset}
	role="button"
	tabindex="0"
	onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onReset(); } }}
	aria-label="Reset to global item context"
>
	<!--
		Two-column grid on tablet+; collapses to a single stacked column on
		narrow widths so the title isn't squeezed into half-card space.
	-->
	<div class="grid gap-6 p-6 hero-grid">

		<!-- ── Artwork with hover play overlay ── -->
		<div class="relative aspect-square rounded-lg overflow-hidden border border-white/10 os-card-glow">
			<img
				src={item.image}
				alt={item.title}
				class="w-full h-full object-cover opacity-92 group-hover:opacity-100 transition-opacity duration-300"
			/>
			<div class="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent"></div>
			<PlayOverlay size="lg" />
		</div>

		<!-- ── Text block ── -->
		<div class="flex flex-col justify-between min-w-0">
			<div>
				{#if item.crossingPath}
					<p class="font-mono text-[11px] text-cyan-300/60 tracking-wide mb-2">{item.crossingPath}</p>
				{:else if item.tag}
					<p class="text-[11px] font-semibold uppercase tracking-widest text-success/72 mb-2">{item.tag}</p>
				{:else if item.type}
					<p class="text-[11px] font-semibold uppercase tracking-widest text-base-content/55 mb-2">{item.type}</p>
				{/if}

				<h1 class="text-[32px] font-extrabold leading-tight tracking-tight text-base-content/96 mb-1.5">
					{item.title}
				</h1>
				<p class="text-[15px] text-base-content/72 leading-snug">
					{item.artist} · {item.genre}
				</p>

				{#if contextLine}
					<p class="mt-3.5 text-[13px] text-base-content/64 leading-relaxed max-w-160">
						{contextLine}
					</p>
				{/if}

				{#if item.seedLocation}
					<p class="mt-2 text-[12px] text-base-content/52">First surfaced: {item.seedLocation}</p>
				{/if}
			</div>

			<!-- ── Actions row ── -->
			<div class="flex items-center gap-2.5 mt-5">
				<button
					class="flex items-center justify-center gap-2 h-9 px-5 rounded-full text-[13px] font-semibold bg-white/10 hover:bg-white/16 border border-white/22 hover:border-white/34 text-white transition-all"
					onclick={(e) => e.stopPropagation()}
				>
					<svg class="w-3 h-3 translate-x-px" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
						<path d="M3 2l8 4-8 4V2z" />
					</svg>
					Play
				</button>
				<button
					class="flex items-center gap-1.5 h-9 px-4 rounded-full text-[13px] font-semibold text-accent border border-accent/46 bg-black/30 hover:bg-accent/16 hover:border-accent/65 transition-all"
					onclick={(e) => e.stopPropagation()}
				>
					<Radio size={12} />
					Amplify
				</button>
			</div>
		</div>

	</div>
</div>

<style>
	.hero-grid {
		grid-template-columns: minmax(180px, 240px) 1fr;
	}
	/* Stack into a single column at narrow widths so the title can breathe. */
	@media (max-width: 640px) {
		.hero-grid {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
