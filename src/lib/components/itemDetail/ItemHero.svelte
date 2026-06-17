<script lang="ts">
	import { Radio } from 'lucide-svelte';
	import PlayOverlay from '$lib/components/PlayOverlay.svelte';
	import type { DetailItem } from '../../../routes/items/[id]/+page';
	import { formatCount } from '$lib/format';
	import type { PropagationForest, FameTier } from '$lib/mock/propagation';

	/*
		Item header / hero. The metadata column carries:
		  - identity block (title, artist · genre, contextLine, seedLocation)
		  - global metadata strip: fame-tier badge + monthly listeners +
		    Spotify popularity. Calibrated to feel like archival metadata,
		    not a dashboard.
		  - propagation summary: origin note + crossing prose + small
		    "N origins · M downstream" mono line + scene chips
		  - actions row (Play, Amplify)

		Clicking the hero resets the inspector to global state. Action buttons
		stopPropagation so they remain functional without resetting.
	*/

	let {
		item,
		forest,
		isAmplified,
		hasPlayed = false,
		onReset,
		onPlay,
		onToggleAmplify,
	}: {
		item: DetailItem;
		forest: PropagationForest;
		isAmplified: boolean;
		/** Has the current viewer entered the tree yet? Drives the
		 *  enabled state of Amplify (gated until Play) and the
		 *  Play button's "completed / re-playable" affordance. */
		hasPlayed?: boolean;
		onReset: () => void;
		onPlay: () => void;
		onToggleAmplify: () => void;
	} = $props();

	// One-line contextual sub-copy assembled from whichever editorial fields
	// the source lane provides. Falls back gracefully if all are absent.
	const contextLine = $derived(
		item.headline
			?? item.routeNarrative
			?? item.spreadReason
			?? item.whisperHint
			?? null,
	);

	// Up to 3 scene chips in the hero — keeps the propagation block compact.
	const heroScenes = $derived(forest.scenes.slice(0, 3));

	// Fame-tier visual mapping. Tiers map to a colour family + an optional
	// shimmer hint for the Hot tier. All four read as quiet observations,
	// never as prestige badges.
	const tierStyle: Record<FameTier, { border: string; text: string; bg: string; shimmer: boolean }> = {
		Underground: { border: 'border-base-content/22', text: 'text-base-content/68', bg: 'bg-base-content/4',  shimmer: false },
		Niche:       { border: 'border-secondary/35',    text: 'text-secondary/82',    bg: 'bg-secondary/8',     shimmer: false },
		Emerging:    { border: 'border-accent/40',       text: 'text-accent/85',       bg: 'bg-accent/8',        shimmer: false },
		Hot:         { border: 'border-amber-300/45',    text: 'text-amber-100/92',    bg: 'bg-amber-400/10',    shimmer: true  },
	};
	const tier = $derived(tierStyle[item.fameTier]);
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

				<!--
					Global metadata strip. Fame-tier badge + external metrics.
					Reads as archival metadata, not a dashboard. The Hot tier
					gets a faint shimmer pulse (CSS class, reduced-motion aware).
				-->
				<div class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
					<span
						class={[
							'inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full border',
							tier.border, tier.text, tier.bg,
							tier.shimmer && 'fame-hot-shimmer',
						]}
					>
						{item.fameTier}
					</span>
					<span class="text-[11px] font-mono text-base-content/52 tabular-nums">{formatCount(item.monthlyListeners)} monthly listeners</span>
					<span class="text-[10px] text-base-content/30">·</span>
					<span class="text-[11px] font-mono text-base-content/52 tabular-nums">Popularity {item.spotifyPopularity}/100</span>
				</div>

				<!--
					Propagation summary. Clean editorial copy carries the
					"this signal has a history" message — no duplicate visual
					diagram (the real tree below carries the structural topology).
				-->
				<div class="mt-4 pt-4 border-t border-white/8">
					<p class="text-[12px] text-base-content/72 leading-snug">
						{forest.originNote}
					</p>
					<p class="mt-1.5 text-[12px] text-base-content/55 leading-snug italic">
						{forest.crossingNote}
					</p>
					<p class="mt-1.5 text-[11px] font-mono text-base-content/40 tabular-nums">
						{forest.independentOrigins} independent origins · {forest.totalReach} scouts downstream
					</p>
					{#if heroScenes.length > 0}
						<div class="mt-2 flex flex-wrap gap-1.5">
							{#each heroScenes as scene (scene)}
								<span class="text-[10px] px-2 py-0.5 rounded-full border border-white/10 text-base-content/55 bg-white/3">
									{scene}
								</span>
							{/each}
						</div>
					{/if}
				</div>
			</div>

			<!-- ── Actions row ──
				 Lifecycle gate:
				   • Before Play (State A): Amplify is disabled, the
				     label reads "Play to Amplify". The button itself
				     teaches the order — no separate helper text
				     below the controls. Tooltip on hover ("Play
				     this signal before amplifying") stays as a
				     secondary affordance.
				   • After Play (State B): label flips to "Amplify",
				     enabled.
				   • After Amplify (State C): label flips to
				     "Amplified" in the pressed-in accent treatment.
				 Clicking Play inserts the user as a listener (A→B);
				 the page handler runs the same scroll-and-highlight
				 reveal currently used by Amplify. -->
			<div class="mt-5">
			<div class="flex items-center gap-2.5">
				<button
					class="flex items-center justify-center gap-2 h-9 px-5 rounded-full text-[13px] font-semibold bg-white/10 hover:bg-white/16 border border-white/22 hover:border-white/34 text-white transition-all"
					onclick={(e) => { e.stopPropagation(); onPlay(); }}
					title={hasPlayed ? 'You have already played this signal' : 'Play this signal'}
				>
					<svg class="w-3 h-3 translate-x-px" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
						<path d="M3 2l8 4-8 4V2z" />
					</svg>
					Play
				</button>
				<!--
					Amplify toggle. State C ("Amplified") uses the pressed-
					in brighter treatment; State B uses the base outline
					treatment; State A is `disabled` with reduced opacity
					and no hover affordance, plus a tooltip that teaches
					the order ("Play this signal first to amplify it").
					Click handler stopPropagation so it doesn't bubble
					into the hero's reset-to-global handler.
				-->
				<button
					class={[
						'flex items-center gap-1.5 h-9 px-4 rounded-full text-[13px] font-semibold transition-all',
						!hasPlayed
							? 'text-accent/45 border border-accent/22 bg-black/20 cursor-not-allowed'
							: isAmplified
								? 'text-accent-content bg-accent/30 border border-accent/65 hover:bg-accent/40 hover:border-accent/82'
								: 'text-accent border border-accent/46 bg-black/30 hover:bg-accent/16 hover:border-accent/65',
					]}
					onclick={(e) => { e.stopPropagation(); onToggleAmplify(); }}
					aria-pressed={isAmplified}
					aria-disabled={!hasPlayed}
					disabled={!hasPlayed}
					title={!hasPlayed
						? 'Play this signal before amplifying'
						: isAmplified ? 'Remove your amplification' : 'Amplify this signal'}
				>
					<Radio size={12} />
					{!hasPlayed ? 'Play to Amplify' : isAmplified ? 'Amplified' : 'Amplify'}
				</button>
			</div>
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
