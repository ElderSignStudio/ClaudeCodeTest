<script lang="ts">
	import { Radio } from 'lucide-svelte';
	import { deepUndergroundItems } from '$lib/mock/data';
	import LaneHeader from '$lib/components/LaneHeader.svelte';
	import PlayOverlay from '$lib/components/PlayOverlay.svelte';
	import { navigateToItem, navigateToItemKey } from '$lib/navigation';

	// Capped scout count: minimum 1 (never show 0), maximum 3
	function capped(scouts: number): number {
		return Math.min(Math.max(scouts, 1), 3);
	}

	function presenceLabel(scouts: number): string {
		const n = capped(scouts);
		return `${n} scout${n === 1 ? '' : 's'}`;
	}
</script>

<section class="relative isolate">
	<!--
		Passive network motion. Two ultra-subtle masses drift slowly behind the
		lane to give the section a sense of submerged depth without reading as
		decorative animation. Both sit mostly outside the section's clip so the
		viewer only ever sees directional pressure, never a defined shape.
		`isolate` on the section + `-z-10` here keep the atmosphere inside this
		lane's stacking context, so it can't bleed behind the page body.
		`pointer-events-none` ensures no hover interference. Timing, color, and
		opacity all live in app.css.
	-->
	<div class="absolute inset-0 -z-10 overflow-hidden pointer-events-none deep-atmosphere-field" aria-hidden="true">
		<div class="deep-atmo-blob deep-atmo-blob-1"></div>
		<div class="deep-atmo-blob deep-atmo-blob-2"></div>
	</div>

	<LaneHeader
		title="Deep Underground"
		subtitle="Signals barely discovered anywhere — find them first"
		accentClass="bg-secondary/60"
		linkHoverClass="hover:text-base-content/88"
		href="/discover"
	/>

	<div class="mt-5 grid gap-3 pb-2 w-full" style="grid-template-columns: repeat(7, minmax(130px, 1fr));">
		{#each deepUndergroundItems as item (item.id)}
			{@const coverDim = item.coverDim === true}
			<!--
				`coverDim` cards (Silver Coast, Static Bloom, Zero Archive) carry
				naturally dim cover art and would cross into "visually broken" with
				the lane's full darkening stack. They get a small per-card boost:
				image opacity +7pp, gradient-bottom darkness eased, archival
				compression skipped, title +6pp opacity. Still well within the
				lane's "barely surfaced" mood — every other lane stays brighter.
			-->
			<div
				class="group relative rounded-lg overflow-hidden border border-white/3 hover:border-white/5 cursor-pointer transition-colors duration-300 os-card-deep"
				onclick={(e) => navigateToItem(item.id, e)}
				onkeydown={(e) => navigateToItemKey(item.id, e)}
				role="button"
				tabindex="0"
				aria-label={`View ${item.title}`}
			>

				<div class="relative w-full aspect-square">
					<img
						src={item.image}
						alt={item.title}
						class={['w-full h-full object-cover group-hover:opacity-64 transition-opacity duration-500', coverDim ? 'opacity-55' : 'opacity-48']}
					/>
					<div class={['absolute inset-0 bg-linear-to-t', coverDim ? 'from-black/68 via-black/16 to-black/10' : 'from-black/80 via-black/18 to-black/12']}></div>
					<div class="absolute inset-0 bg-black/10"></div>
					{#if !coverDim}
						<!-- Archival density — uniform very slight tonal compression, DU only -->
						<div class="absolute inset-0 bg-black/4 pointer-events-none" aria-hidden="true"></div>
					{/if}
					<div
						class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
						style="background: radial-gradient(circle at 50% 50%, oklch(0.75 0.04 265 / 0.07) 0%, transparent 60%);"
						aria-hidden="true"
					></div>
					<PlayOverlay size="xs" blur={false} />
					<!--
						Presence pulse — last child inside the image section so DOM order
						places it above all overlays without needing z-index.
						Animation is driven by CSS class (not inline style) to avoid the
						SvelteKit + Tailwind v4 issue where dynamic animation: values in
						inline style attributes fail silently.
					-->
					<div
						class="deep-pulse deep-pulse-scout-{capped(item.scouts)} absolute inset-0 pointer-events-none"
						aria-hidden="true"
					></div>
				</div>

				<div class="p-2 bg-base-300/70">
					<p class={['text-[12px] font-semibold truncate leading-snug', coverDim ? 'text-base-content/88' : 'text-base-content/82']}>{item.title}</p>
					<p class="text-[11px] text-base-content/64 truncate mt-0.5">{item.artist}</p>
					<!-- Presence first (factual anchor), origin second (flavor) -->
					<div class="mt-2 space-y-0.5">
						<p class="text-sm font-medium text-zinc-400/88 truncate">{presenceLabel(item.scouts)}</p>
						<p class="text-[13px] text-zinc-400/75 truncate">{item.whisperHint ?? 'Barely surfaced'}</p>
					</div>
					<!-- Amplify — quiet but clearly available: opacity-75 at rest, 90 on hover -->
					<div class="flex justify-end mt-2">
						<button
							class="flex items-center gap-1 h-5 px-2 rounded-full text-[11px] font-medium text-zinc-300/90 border border-white/34 hover:border-white/48 hover:text-white transition-all"
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
