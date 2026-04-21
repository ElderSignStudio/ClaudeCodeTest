<script lang="ts">
	import { ArrowUpRight } from 'lucide-svelte';
	import { driftItems, scoutItems, originItems, breakingOutItems } from '$lib/mock/data';
	import ScoutCard from '$lib/components/ScoutCard.svelte';
	import StoryCard from '$lib/components/StoryCard.svelte';

	const d = driftItems;
	const b = breakingOutItems;
</script>

<!--
	Drift — scripted editorial layout.

	Card sizes respect their original lane dimensions:
	  - Standard signal cards:   w-40 + aspect-square  (ForYou lane)
	  - Breaking Out cards:      w-44 + aspect-square  (BreakingOut lane)
	  - ScoutCard:               w-56                  (HumanSignals lane, hardcoded)
	  - StoryCard:               w-80                  (OriginStories lane)

	Cards are NEVER stretched. Rows fill space by showing more cards.
	The hero is the only exception — it is an intentional full-width anchor.

	Block sequence:
	  1. Hero           — full-width (intentional anchor, not a regular card)
	  2. Row of 3       — d[1] d[2] d[3] at w-40
	  3. Separator
	  4. Scout          — w-56 standalone, left-anchored
	  5. Story          — w-80 wrapper, left-anchored
	  6. Spacing break
	  7. Row of 4       — d[4] d[5] b[1] b[2] mixed w-40/w-44
	  8. Single offset  — b[0] at w-44, left-aligned
-->
<section class="pb-8">
	<div style="max-width: 1200px; margin: 0 auto;">

	<!-- Section header -->
	<div class="w-0.75 h-3.5 rounded-full bg-primary/55" aria-hidden="true"></div>
	<p class="ml-3.5 mt-1.5 text-sm font-bold uppercase tracking-widest leading-tight text-base-content/88">Drift</p>
	<p class="ml-3.5 mt-0.5 text-[12px] leading-normal text-base-content/65 max-w-105">Keep exploring — there's always more</p>

	<!-- ── Block 1: Hero (full-width intentional anchor) ─────────── -->
	<div class="mt-5 group rounded-xl overflow-hidden cursor-pointer border border-white/8 hover:border-white/22 transition-all duration-250 os-card-glow mb-3">
		<div class="relative h-56 w-full">
			<img
				src={d[0].image}
				alt={d[0].title}
				class="w-full h-full object-cover opacity-72 group-hover:opacity-88 transition-opacity duration-300"
			/>
			<div class="absolute inset-0 bg-linear-to-br from-primary/22 to-transparent mix-blend-color"></div>
			<div class="absolute inset-0 bg-linear-to-t from-black/82 via-black/20 to-transparent"></div>
			<div
				class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-250 pointer-events-none"
				style="background: radial-gradient(circle at 50% 50%, oklch(0.68 0.20 265 / 0.10) 0%, transparent 65%);"
				aria-hidden="true"
			></div>
			<div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
				<div class="w-10 h-10 rounded-full bg-white/20 border border-white/35 text-white flex items-center justify-center backdrop-blur-sm scale-90 group-hover:scale-100 transition-transform duration-200">
					<svg class="w-4 h-4 translate-x-px" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
						<path d="M3 2l8 4-8 4V2z" />
					</svg>
				</div>
			</div>
			<div class="absolute bottom-0 left-0 right-0 p-4">
				<p class="text-[18px] font-bold text-white leading-snug">{d[0].title}</p>
				<p class="text-[12px] text-white/65 mt-0.5">{d[0].genre} · {d[0].artist}</p>
			</div>
		</div>
	</div>

	<!-- ── Block 2: Row of 3 standard signal cards (w-40 each) ───── -->
	<div class="flex gap-3 mb-8">

		{#each [d[1], d[2], d[3]] as item (item.id)}
			<div class="group shrink-0 w-40 rounded-lg overflow-hidden cursor-pointer border border-white/8 hover:border-white/22 transition-all duration-250 os-card-glow">
				<div class="relative aspect-square w-full">
					<img
						src={item.image}
						alt={item.title}
						class="w-full h-full object-cover opacity-68 group-hover:opacity-85 transition-opacity duration-300"
					/>
					<div class="absolute inset-0 bg-linear-to-t from-black/82 via-black/25 to-transparent"></div>
					<div
						class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-250 pointer-events-none"
						style="background: radial-gradient(circle at 50% 50%, oklch(0.68 0.20 265 / 0.10) 0%, transparent 65%);"
						aria-hidden="true"
					></div>
					<div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
						<div class="w-8 h-8 rounded-full bg-white/20 border border-white/35 text-white flex items-center justify-center backdrop-blur-sm scale-90 group-hover:scale-100 transition-transform duration-200">
							<svg class="w-3.5 h-3.5 translate-x-px" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
								<path d="M3 2l8 4-8 4V2z" />
							</svg>
						</div>
					</div>
					<div class="absolute bottom-0 left-0 right-0 p-2.5">
						<p class="text-[13px] font-bold text-white truncate leading-snug">{item.title}</p>
						<p class="text-[11px] text-white/75 truncate mt-0.5">{item.genre}</p>
					</div>
				</div>
				<div class="px-2.5 py-2 bg-base-200/70">
					<p class="text-[11px] text-base-content/68 truncate">{item.artist}</p>
				</div>
			</div>
		{/each}

	</div>

	<!-- ── Block 3: Separator ─────────────────────────────────────── -->
	<div class="flex items-center gap-3 mb-5" aria-hidden="true">
		<span class="text-[10px] text-base-content/30 font-medium tracking-wide">Because you explore ambient</span>
		<div class="flex-1 h-px bg-white/5"></div>
	</div>

	<!-- ── Block 4: Scout standalone (w-56, left-anchored) ────────── -->
	<div class="mb-3">
		<ScoutCard scout={scoutItems[0]} />
	</div>

	<!-- ── Block 5: Story (w-80, left-anchored, below scout) ─────── -->
	<div class="w-80 mb-12">
		<StoryCard item={originItems[2]} />
	</div>

	<!-- ── Block 7: Row of 4 cards — standard + breaking-out mix ─── -->
	<!--
		Standard drift cards at w-40, breaking-out at w-44.
		Natural widths, no stretching — fills ~664px of the container.
	-->
	<div class="flex gap-3 mb-6">

		<!-- d[4] Soft Border — standard w-40 -->
		<div class="group shrink-0 w-40 rounded-lg overflow-hidden cursor-pointer border border-white/8 hover:border-white/22 transition-all duration-250 os-card-glow">
			<div class="relative aspect-square w-full">
				<img
					src={d[4].image}
					alt={d[4].title}
					class="w-full h-full object-cover opacity-68 group-hover:opacity-85 transition-opacity duration-300"
				/>
				<div class="absolute inset-0 bg-linear-to-t from-black/82 via-black/25 to-transparent"></div>
				<div
					class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-250 pointer-events-none"
					style="background: radial-gradient(circle at 50% 50%, oklch(0.68 0.20 265 / 0.10) 0%, transparent 65%);"
					aria-hidden="true"
				></div>
				<div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
					<div class="w-8 h-8 rounded-full bg-white/20 border border-white/35 text-white flex items-center justify-center backdrop-blur-sm scale-90 group-hover:scale-100 transition-transform duration-200">
						<svg class="w-3.5 h-3.5 translate-x-px" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
							<path d="M3 2l8 4-8 4V2z" />
						</svg>
					</div>
				</div>
				<div class="absolute bottom-0 left-0 right-0 p-2.5">
					<p class="text-[13px] font-bold text-white truncate leading-snug">{d[4].title}</p>
					<p class="text-[11px] text-white/75 truncate mt-0.5">{d[4].genre}</p>
				</div>
			</div>
			<div class="px-2.5 py-2 bg-base-200/70">
				<p class="text-[11px] text-base-content/68 truncate">{d[4].artist}</p>
			</div>
		</div>

		<!-- d[5] Cold Dispatch — standard w-40 -->
		<div class="group shrink-0 w-40 rounded-lg overflow-hidden cursor-pointer border border-white/8 hover:border-white/22 transition-all duration-250 os-card-glow">
			<div class="relative aspect-square w-full">
				<img
					src={d[5].image}
					alt={d[5].title}
					class="w-full h-full object-cover opacity-68 group-hover:opacity-85 transition-opacity duration-300"
				/>
				<div class="absolute inset-0 bg-linear-to-t from-black/82 via-black/25 to-transparent"></div>
				<div
					class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-250 pointer-events-none"
					style="background: radial-gradient(circle at 50% 50%, oklch(0.68 0.20 265 / 0.10) 0%, transparent 65%);"
					aria-hidden="true"
				></div>
				<div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
					<div class="w-8 h-8 rounded-full bg-white/20 border border-white/35 text-white flex items-center justify-center backdrop-blur-sm scale-90 group-hover:scale-100 transition-transform duration-200">
						<svg class="w-3.5 h-3.5 translate-x-px" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
							<path d="M3 2l8 4-8 4V2z" />
						</svg>
					</div>
				</div>
				<div class="absolute bottom-0 left-0 right-0 p-2.5">
					<p class="text-[13px] font-bold text-white truncate leading-snug">{d[5].title}</p>
					<p class="text-[11px] text-white/75 truncate mt-0.5">{d[5].genre}</p>
				</div>
			</div>
			<div class="px-2.5 py-2 bg-base-200/70">
				<p class="text-[11px] text-base-content/68 truncate">{d[5].artist}</p>
			</div>
		</div>

		<!-- b[1] Low Orbit — breaking-out w-44, carries its lane identity -->
		<div class="group shrink-0 w-44 rounded-lg overflow-hidden cursor-pointer border border-white/8 hover:border-success/30 transition-all duration-200 os-card-breaking">
			<div class="relative aspect-square w-full">
				<img
					src={b[1].image}
					alt={b[1].title}
					class="w-full h-full object-cover opacity-72 group-hover:opacity-88 transition-opacity duration-300"
				/>
				<div class="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent"></div>
				<div class="absolute inset-0 bg-linear-to-br from-success/8 to-transparent mix-blend-color"></div>
				<div
					class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-250 pointer-events-none"
					style="background: radial-gradient(circle at 50% 50%, oklch(0.74 0.17 158 / 0.12) 0%, transparent 65%);"
					aria-hidden="true"
				></div>
				<div class="absolute top-2 left-2">
					<span
						class="inline-flex items-center gap-0.5 text-[10px] font-bold rounded-full px-1.5 py-0.5 border backdrop-blur-sm bg-black/55"
						style="color: var(--color-success); border-color: oklch(0.74 0.17 158 / 0.45); box-shadow: var(--glow-l3-success);"
					>
						<ArrowUpRight size={8} />
						Surging
					</span>
				</div>
				<div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
					<div class="w-8 h-8 rounded-full bg-white/22 border border-white/38 text-white flex items-center justify-center backdrop-blur-sm scale-90 group-hover:scale-100 transition-transform duration-200">
						<svg class="w-3.5 h-3.5 translate-x-px" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
							<path d="M3 2l8 4-8 4V2z" />
						</svg>
					</div>
				</div>
			</div>
			<div class="p-2.5 bg-base-200/70">
				<p class="text-[13px] font-bold text-base-content/95 truncate leading-snug">{b[1].title}</p>
				<p class="text-[11px] text-base-content/68 truncate mt-0.5">{b[1].artist} · {b[1].genre}</p>
				{#if b[1].weeklyScouts !== undefined}
					<p class="text-[11px] font-medium mt-1.5 truncate" style="color: oklch(0.74 0.17 158 / 0.80);">
						+{b[1].weeklyScouts} scouts this week
					</p>
				{/if}
				{#if b[1].resonance !== undefined}
					<div class="mt-2 h-0.5 rounded-full bg-white/10 overflow-hidden">
						<div
							class="relative h-full rounded-full bg-linear-to-r from-success/65 to-accent/50 overflow-hidden"
							style="width: {b[1].resonance}%;"
						>
							<div
								class="os-bar-shimmer absolute inset-y-0 left-0 w-1/2 bg-linear-to-r from-transparent via-white/30 to-transparent"
								aria-hidden="true"
							></div>
						</div>
					</div>
				{/if}
			</div>
		</div>

		<!-- b[2] Pale Cathedral — breaking-out w-44 -->
		<div class="group shrink-0 w-44 rounded-lg overflow-hidden cursor-pointer border border-white/8 hover:border-success/30 transition-all duration-200 os-card-breaking">
			<div class="relative aspect-square w-full">
				<img
					src={b[2].image}
					alt={b[2].title}
					class="w-full h-full object-cover opacity-72 group-hover:opacity-88 transition-opacity duration-300"
				/>
				<div class="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent"></div>
				<div class="absolute inset-0 bg-linear-to-br from-success/8 to-transparent mix-blend-color"></div>
				<div
					class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-250 pointer-events-none"
					style="background: radial-gradient(circle at 50% 50%, oklch(0.74 0.17 158 / 0.12) 0%, transparent 65%);"
					aria-hidden="true"
				></div>
				<div class="absolute top-2 left-2">
					<span
						class="inline-flex items-center gap-0.5 text-[10px] font-bold rounded-full px-1.5 py-0.5 border backdrop-blur-sm bg-black/55"
						style="color: var(--color-success); border-color: oklch(0.74 0.17 158 / 0.45); box-shadow: var(--glow-l3-success);"
					>
						<ArrowUpRight size={8} />
						{b[2].trend === 'surging' ? 'Surging' : 'Rising'}
					</span>
				</div>
				<div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
					<div class="w-8 h-8 rounded-full bg-white/22 border border-white/38 text-white flex items-center justify-center backdrop-blur-sm scale-90 group-hover:scale-100 transition-transform duration-200">
						<svg class="w-3.5 h-3.5 translate-x-px" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
							<path d="M3 2l8 4-8 4V2z" />
						</svg>
					</div>
				</div>
			</div>
			<div class="p-2.5 bg-base-200/70">
				<p class="text-[13px] font-bold text-base-content/95 truncate leading-snug">{b[2].title}</p>
				<p class="text-[11px] text-base-content/68 truncate mt-0.5">{b[2].artist} · {b[2].genre}</p>
				{#if b[2].weeklyScouts !== undefined}
					<p class="text-[11px] font-medium mt-1.5 truncate" style="color: oklch(0.74 0.17 158 / 0.80);">
						+{b[2].weeklyScouts} scouts this week
					</p>
				{/if}
				{#if b[2].resonance !== undefined}
					<div class="mt-2 h-0.5 rounded-full bg-white/10 overflow-hidden">
						<div
							class="relative h-full rounded-full bg-linear-to-r from-success/65 to-accent/50 overflow-hidden"
							style="width: {b[2].resonance}%;"
						>
							<div
								class="os-bar-shimmer absolute inset-y-0 left-0 w-1/2 bg-linear-to-r from-transparent via-white/30 to-transparent"
								aria-hidden="true"
							></div>
						</div>
					</div>
				{/if}
			</div>
		</div>

	</div>

	<!-- ── Block 8: Single offset card (w-44, left-aligned) ──────── -->
	<div class="shrink-0 w-44">
		<div class="group rounded-lg overflow-hidden cursor-pointer border border-white/8 hover:border-success/28 transition-all duration-200 os-card-breaking">
			<div class="relative aspect-square w-full">
				<img
					src={b[0].image}
					alt={b[0].title}
					class="w-full h-full object-cover opacity-72 group-hover:opacity-88 transition-opacity duration-300"
				/>
				<div class="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent"></div>
				<div class="absolute inset-0 bg-linear-to-br from-success/8 to-transparent mix-blend-color"></div>
				<div
					class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-250 pointer-events-none"
					style="background: radial-gradient(circle at 50% 50%, oklch(0.74 0.17 158 / 0.12) 0%, transparent 65%);"
					aria-hidden="true"
				></div>
				<div class="absolute top-2 left-2">
					<span
						class="inline-flex items-center gap-0.5 text-[10px] font-bold rounded-full px-1.5 py-0.5 border backdrop-blur-sm bg-black/55"
						style="color: var(--color-accent); border-color: oklch(0.72 0.16 220 / 0.40); box-shadow: var(--glow-l3-accent);"
					>
						<ArrowUpRight size={8} />
						Rising
					</span>
				</div>
				<div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
					<div class="w-8 h-8 rounded-full bg-white/22 border border-white/38 text-white flex items-center justify-center backdrop-blur-sm scale-90 group-hover:scale-100 transition-transform duration-200">
						<svg class="w-3.5 h-3.5 translate-x-px" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
							<path d="M3 2l8 4-8 4V2z" />
						</svg>
					</div>
				</div>
			</div>
			<div class="p-2.5 bg-base-200/70">
				<p class="text-[13px] font-bold text-base-content/95 truncate leading-snug">{b[0].title}</p>
				<p class="text-[11px] text-base-content/68 truncate mt-0.5">{b[0].artist} · {b[0].genre}</p>
			</div>
		</div>
	</div>

	</div>
</section>
