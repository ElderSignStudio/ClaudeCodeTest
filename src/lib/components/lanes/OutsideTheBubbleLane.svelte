<script lang="ts">
	import { Radio } from 'lucide-svelte';
	import { outsideBubbleItems } from '$lib/mock/data';
	import LaneHeader from '$lib/components/LaneHeader.svelte';
	import PlayOverlay from '$lib/components/PlayOverlay.svelte';

	const bubbleFeatured = outsideBubbleItems.find(i => i.featured)!;
	const bubbleSupporting = outsideBubbleItems.filter(i => !i.featured);
</script>

<section class="relative pt-8 pb-4">
	<!-- Cyan accent: this lane is cold, not warm like Breaking Out -->
	<LaneHeader
		title="Outside the Bubble"
		subtitle="Signals that crossed into your branch from distant scenes"
		accentClass="bg-cyan-400/55"
		variant="refresh"
		href="/discover"
	/>

	<!--
		Asymmetric split: hero ~74% / supporting echoes ~26%. Hero still
		dominates clearly, but the right column is wide enough that the echoes
		read as real secondary signals rather than squeezed metadata.
		minmax(240px, 1fr) on the right keeps cards readable if the viewport
		shrinks (right column floors at 240px before the hero gives up width).
		minmax(0, …) on the left lets the hero shrink without grid-overflow.
	-->
	<div class="mt-6 grid gap-6 items-stretch" style="grid-template-columns: minmax(0, 2.85fr) minmax(240px, 1fr);">

		<!-- ── Hero card (left) — transmission window, not panel ── -->
		<div
			class="group relative rounded-xl overflow-hidden cursor-pointer border border-cyan-300/15 min-h-44 h-full transition-transform duration-400 hover:-translate-y-0.5"
			style="box-shadow: 0 0 0 1px oklch(0.72 0.16 220 / 0.10), 0 8px 28px rgba(0,0,0,0.28), 0 2px 6px rgba(0,0,0,0.20), inset 0 1px 0 rgba(255,255,255,0.04);"
		>
			<img
				src={bubbleFeatured.image}
				alt={bubbleFeatured.title}
				class="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-82 transition-opacity duration-500"
			/>
			<!-- Cold tint overlay — cyan instead of warm yellow -->
			<div class="absolute inset-0 bg-linear-to-br from-cyan-400/6 to-transparent mix-blend-color"></div>
			<!-- Softer top fade, similar bottom protection — image breathes more, text stays readable -->
			<div class="absolute inset-0 bg-linear-to-b from-black/22 via-transparent to-black/86"></div>
			<!--
				Directional signal haze. Faint cyan concentrated at the hero's
				right edge, fading inward. Peak ~7% cyan opacity at the edge,
				fading to transparent before reaching the middle of the card.
				Reads subconsciously as transmission energy moving toward the
				echo column on the right, not as a decorative line or arrow.
				No animation, no hard edges, no UI affordance.
			-->
			<div
				class="absolute inset-0 pointer-events-none"
				style="background: radial-gradient(ellipse 65% 55% at 100% 50%, oklch(0.72 0.16 220 / 0.07) 0%, oklch(0.72 0.16 220 / 0.025) 35%, transparent 70%);"
				aria-hidden="true"
			></div>
			<!-- Hover radial — cold cyan, not warm -->
			<div
				class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
				style="background: radial-gradient(ellipse at 50% 60%, oklch(0.72 0.16 220 / 0.07) 0%, transparent 65%);"
				aria-hidden="true"
			></div>

			<!-- Corner vignette — darkens card edges slightly, increases hero isolation -->
			<div
				class="absolute inset-0 pointer-events-none"
				style="background: radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(0,0,0,0.10) 100%);"
				aria-hidden="true"
			></div>

			<!-- Genre chip — muted, signal-metadata feel -->
			<div class="absolute top-3.5 left-3.5">
				<span class="text-[11px] font-medium text-white/64 border border-white/16 rounded-full px-2 py-0.5 bg-black/52 backdrop-blur-sm tracking-wide">
					{bubbleFeatured.genre}
				</span>
			</div>

			<PlayOverlay size="lg" />

			<!-- Bottom text block — slightly shorter pt so the image dominates more vertically -->
			<div class="absolute bottom-0 left-0 right-0 px-4 pb-3.5 pt-8">
				<p class="text-[22px] font-extrabold text-white leading-tight tracking-tight mb-1">{bubbleFeatured.title}</p>
				<p class="text-[12px] text-white/58 mb-2">{bubbleFeatured.artist}</p>

				<!--
					Scene-crossing metadata — monospace so it reads like routing information
					rather than editorial copy. Very dim: a technical signal, not a headline.
				-->
				{#if bubbleFeatured.crossingPath}
					<p class="font-mono text-[11px] text-cyan-300/58 mb-3.5 tracking-wide">{bubbleFeatured.crossingPath}</p>
				{/if}

				<!--
					CROSSING PATHS: replaces "WHY THIS IS HERE".
					Label is tiny, uppercase, muted. Explanatory line is calm prose, not promotional.
				-->
				{#if bubbleFeatured.whyHere}
					<div class="mb-4">
						<p class="text-[10px] font-semibold uppercase tracking-widest mb-1.5 text-cyan-300/52">Crossing paths</p>
						<p class="text-xs leading-relaxed text-white/78">{bubbleFeatured.whyHere}</p>
					</div>
				{/if}

				<button
					class="flex items-center gap-1.5 h-7 px-3 rounded-full text-[11px] font-semibold text-accent border border-accent/46 bg-black/40 hover:bg-accent/22 hover:border-accent/65 transition-all backdrop-blur-sm"
					aria-label="Amplify this signal"
				>
					<Radio size={10} />
					Amplify
				</button>
			</div>
		</div>

		<!--
			── Right column — supporting echoes from adjacent scenes ──
			pt-5 offsets the first card down from the hero's top edge, creating
			a directional drift feeling (signals arriving slightly later than the
			hero, not perfectly aligned). gap-6 (vs the previous gap-5) widens the
			vertical breathing between the two echoes. The left divider is softened
			from /10 to /05 — it now reads as a faint atmospheric edge instead of
			a hard column wall, supporting the "less boxed-in" goal.
		-->
		<div class="flex flex-col gap-6 pt-5 pl-3" style="border-left: 1px solid oklch(0.72 0.16 220 / 0.05);">

			{#each bubbleSupporting.slice(0, 2) as item (item.id)}
				<!--
					Hover adds a faint cyan border ring — "nearby anomaly" feel.
					-mx-1.5 + px-1.5 so the ring extends slightly beyond the text column.
				-->
				<div class="group flex gap-3 cursor-pointer rounded-lg px-1.5 py-1.5 -mx-1.5 border border-transparent hover:bg-cyan-400/4 hover:border-cyan-300/8 transition-all duration-250">

					<!-- Thumbnail — slightly taller than before (h-16 vs h-14) -->
					<div class="relative w-20 h-16 rounded-md overflow-hidden shrink-0">
						<img
							src={item.image}
							alt={item.title}
							class="absolute inset-0 w-full h-full object-cover opacity-58 group-hover:opacity-80 transition-opacity duration-300"
						/>
						<div class="absolute inset-0 bg-linear-to-br from-cyan-400/6 to-transparent mix-blend-color"></div>
						<PlayOverlay size="xs" scaleOnHover={false} />
					</div>

					<!-- Text block: title → crossing path → explanation → Amplify -->
					<div class="flex-1 min-w-0 flex flex-col justify-center">
						<p class="text-[13px] font-semibold text-base-content/88 leading-snug truncate">{item.title}</p>

						<!--
							Scene-crossing path — monospace, reads like routing metadata.
							More prominent than artist name; less prominent than title.
						-->
						{#if item.crossingPath}
							<p class="font-mono text-[11px] text-cyan-300/55 mt-0.5 tracking-wide">{item.crossingPath}</p>
						{/if}

						{#if item.whyHere}
							<p class="text-[12px] leading-normal text-base-content/68 mt-1.5 mb-2 line-clamp-2">{item.whyHere}</p>
						{/if}

						<button
							class="self-start flex items-center gap-1 h-5 px-2 rounded-full text-[11px] font-semibold text-accent/82 border border-accent/36 hover:bg-accent/16 hover:border-accent/54 hover:text-accent transition-all"
							aria-label="Amplify this signal"
						>
							<Radio size={7} />
							Amplify
						</button>
					</div>

				</div>
			{/each}
		</div>

	</div>
</section>
