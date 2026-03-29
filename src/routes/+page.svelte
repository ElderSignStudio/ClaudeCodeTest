<script lang="ts">
	import { Radio, TrendingUp, ArrowUpRight } from 'lucide-svelte';
	import { forYouItems, gainingItems, weakSignals, deepFieldItems } from '$lib/mock/data';

	function getGreeting(): string {
		const hour = new Date().getHours();
		if (hour < 12) return 'Good morning.';
		if (hour < 17) return 'Good afternoon.';
		return 'Good evening.';
	}

	const filters = ['All', 'Ambient', 'Drone', 'Experimental', 'Electronic', 'Folk'];
	let activeFilter = $state('All');

	const featuredItem = forYouItems.find(i => i.featured)!;
	const regularItems = forYouItems.filter(i => !i.featured);

	/*
		Each regular card gets a different color tint so they feel varied,
		not uniformly grey. Tint indices cycle through primary/accent/secondary.
		This is pure visual — no semantic meaning.
	*/
	const cardTints = [
		'from-primary/20 to-transparent',
		'from-accent/18 to-transparent',
		'from-secondary/18 to-transparent',
		'from-primary/15 via-accent/10 to-transparent',
	];
</script>

<div class="max-w-5xl mx-auto px-5 py-8 space-y-10">

	<!-- ── Greeting + filter chips ──────────────────────────── -->
	<div class="space-y-5">
		<div class="space-y-2.5">
			<!--
				Horizon line: was /50, now primary full + longer.
				More presence at page top = stronger entry moment.
			-->
			<div class="h-px w-28 bg-linear-to-r from-primary to-transparent rounded-full" aria-hidden="true"></div>
			<div class="flex items-center gap-1.5">
				<svg class="w-2.5 h-2.5 text-primary/70 shrink-0" viewBox="0 0 10 10" fill="none" aria-hidden="true">
					<circle cx="5" cy="5" r="1.5" fill="currentColor" />
					<circle cx="5" cy="5" r="3.75" stroke="currentColor" stroke-width="0.75" opacity="0.7" />
				</svg>
				<span class="text-[11px] font-semibold uppercase tracking-widest text-primary/70">Your Signal</span>
			</div>
			<h1 class="text-3xl font-extrabold tracking-tight text-base-content">{getGreeting()}</h1>
			<p class="text-sm text-base-content/55 max-w-sm">
				Signals curated to your frequency. What's faint today may resonate tomorrow.
			</p>
		</div>

		<!--
			Active filter chip: was primary/18. Now primary/25 with stronger border.
			Inactive: slightly brighter text so chips don't disappear into the background.
		-->
		<div class="flex items-center gap-1.5 flex-wrap">
			{#each filters as filter (filter)}
				<button
					onclick={() => (activeFilter = filter)}
					class={[
						'px-3 py-1 rounded-full text-[12px] font-semibold transition-all duration-150',
						activeFilter === filter
							? 'bg-primary/25 text-primary border border-primary/50 shadow-[0_0_12px_-4px_var(--color-primary)]'
							: 'text-base-content/48 border border-white/10 hover:text-base-content/80 hover:border-white/22 hover:bg-white/5',
					]}
				>
					{filter}
				</button>
			{/each}
		</div>
	</div>

	<!-- ── For You ──────────────────────────────────────────── -->
	<section>
		<div class="flex items-center justify-between mb-4">
			<div class="flex items-center gap-2">
				<!--
					Section bars: was primary/60, now full primary opacity.
					Section labels are navigation anchors — they should be clear.
				-->
				<div class="w-0.75 h-3.5 rounded-full bg-primary" aria-hidden="true"></div>
				<p class="text-xs font-bold uppercase tracking-widest text-base-content/75">For You</p>
			</div>
			<a href="/discover" class="text-[11px] text-base-content/42 hover:text-primary/80 transition-colors">
				See all →
			</a>
		</div>

		<div class="os-surface p-4">
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 items-stretch">

				<!-- Hero card -->
				<div
					class="group relative rounded-xl overflow-hidden cursor-pointer os-hero-card border border-primary/28 hover:border-primary/52 transition-colors duration-300 flex flex-col"
					style="min-height: 280px;"
				>
					<div class="relative flex-1 overflow-hidden min-h-36">
						<!--
							Image opacity raised: 55% → 72%.
							The image IS the visual content — muting it more than 30%
							loses the vibrancy we want. Overlays handle readability.
						-->
						<img
							src={featuredItem.image}
							alt={featuredItem.title}
							class="absolute inset-0 w-full h-full object-cover opacity-72 transition-transform duration-700 group-hover:scale-105"
						/>

						<!--
							Overlay strategy: one directional tint + one vignette.
							Removed the flat darkening layer — it was killing image color.
							Primary tint reduced: from/35 → from/28 so less color override.
							Vignette stays strong at bottom — that's where text lives.
						-->
						<div class="absolute inset-0 bg-linear-to-br from-primary/28 via-transparent to-secondary/18"></div>
						<div class="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-black/70"></div>

						<!--
							Radial "light source" bloom at top-left — makes the hero feel
							like it's emitting energy rather than displaying content.
							This is the "signal source" effect: a concentrated light point
							that bleeds outward into the image.
						-->
						<div
							class="absolute -top-8 -left-8 w-48 h-48 pointer-events-none"
							aria-hidden="true"
							style="background: radial-gradient(circle, oklch(0.68 0.20 265 / 0.28) 0%, transparent 65%);"
						></div>

						<!-- Signal rings: slightly more visible -->
						<div class="absolute top-1/2 -translate-y-1/2 -right-8 pointer-events-none" aria-hidden="true">
							<svg class="w-56 h-56 text-primary" viewBox="0 0 224 224" fill="none">
								<circle cx="112" cy="112" r="16" fill="currentColor" opacity="0.22" />
								<circle cx="112" cy="112" r="44" stroke="currentColor" stroke-width="1.25" opacity="0.16" />
								<circle cx="112" cy="112" r="76" stroke="currentColor" stroke-width="1" opacity="0.10" />
								<circle cx="112" cy="112" r="108" stroke="currentColor" stroke-width="0.75" opacity="0.06" />
							</svg>
						</div>

						<!-- Pick badge: primary/90 → full primary text, brighter border -->
						<div class="absolute top-3 right-3">
							<span class="text-[10px] font-bold tracking-wide text-primary border border-primary/55 rounded-full px-2.5 py-1 bg-black/55 backdrop-blur-sm shadow-[0_0_8px_-2px_var(--color-primary)]">
								Pick
							</span>
						</div>

						<!-- Genre chip -->
						<div class="absolute bottom-3 left-3">
							<span class="text-[10px] font-semibold text-white/75 border border-white/18 rounded-full px-2 py-0.5 bg-black/50 backdrop-blur-sm">
								{featuredItem.genre}
							</span>
						</div>

						<!-- Play overlay on hover: larger, brighter -->
						<div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
							<div class="w-14 h-14 rounded-full bg-primary/35 border border-primary/65 text-primary flex items-center justify-center os-play-glow">
								<svg class="w-5 h-5 translate-x-px" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
									<path d="M3 2l8 4-8 4V2z" />
								</svg>
							</div>
						</div>
					</div>

					<!-- Info section -->
					<div class="px-4 py-3.5 shrink-0 flex items-center justify-between gap-3" style="background-color: oklch(0.112 0.030 265 / 0.97);">
						<div class="min-w-0">
							<p class="text-base font-bold text-base-content truncate tracking-tight">{featuredItem.title}</p>
							<p class="text-[11px] text-base-content/50 truncate mt-0.5">
								{featuredItem.artist} · {featuredItem.scouts} Scout{featuredItem.scouts === 1 ? '' : 's'}
							</p>
						</div>
						<!--
							Amplify button: was accent/75. Now full accent with glow.
							The core product CTA should feel alive, not muted.
						-->
						<button
							class="shrink-0 flex items-center gap-1.5 h-7 px-3 rounded-full text-[11px] font-semibold text-accent border border-accent/45 bg-accent/10 hover:bg-accent/18 hover:border-accent/65 transition-all shadow-[0_0_10px_-4px_var(--color-accent)]"
							aria-label="Amplify this signal"
						>
							<Radio size={10} />
							Amplify
						</button>
					</div>
				</div>

				<!-- Regular 2×2 grid: per-card tint for visual variation -->
				<div class="grid grid-cols-2 gap-3 content-start">
					{#each regularItems as item, i (item.id)}
						<div class="group relative rounded-lg overflow-hidden cursor-pointer border border-white/8 hover:border-white/22 transition-all duration-250 os-card-glow">
							<div class="relative aspect-square w-full">
								<!--
									Image opacity: 50% → 68%. Let the photo breathe.
									Hover: 68% → 85% — a clear, satisfying reveal.
								-->
								<img
									src={item.image}
									alt={item.title}
									class="w-full h-full object-cover opacity-68 group-hover:opacity-85 transition-opacity duration-300"
								/>
								<!--
									Per-card color tint: each card gets a different hue overlay
									(primary/accent/secondary cycle) so the grid has visual
									variation rather than being uniformly dark.
									The tint sits above the image but below the vignette.
								-->
								<div class={`absolute inset-0 bg-linear-to-br ${cardTints[i % cardTints.length]} mix-blend-color`}></div>
								<!-- Bottom vignette for text -->
								<div class="absolute inset-0 bg-linear-to-t from-black/82 via-black/25 to-transparent"></div>

								<!-- Play overlay -->
								<div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150">
									<div class="w-8 h-8 rounded-full bg-white/20 border border-white/35 text-white flex items-center justify-center backdrop-blur-sm">
										<svg class="w-3.5 h-3.5 translate-x-px" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
											<path d="M3 2l8 4-8 4V2z" />
										</svg>
									</div>
								</div>

								<!-- Info overlay -->
								<div class="absolute bottom-0 left-0 right-0 p-2.5">
									<p class="text-[12px] font-bold text-white truncate leading-snug">{item.title}</p>
									<p class="text-[10px] text-white/55 truncate mt-0.5">{item.genre}</p>
								</div>
							</div>
						</div>
					{/each}
				</div>

			</div>
		</div>
	</section>

	<!-- ── Gaining Resonance ────────────────────────────────── -->
	<section>
		<div class="flex items-center justify-between mb-4">
			<div class="flex items-center gap-2">
				<div class="w-0.75 h-3.5 rounded-full bg-success" aria-hidden="true"></div>
				<p class="text-xs font-bold uppercase tracking-widest text-base-content/75">Gaining Resonance</p>
			</div>
			<span class="text-[11px] text-base-content/40 flex items-center gap-1">
				<TrendingUp size={11} class="text-success/75" />
				Scouts are accumulating
			</span>
		</div>

		<div class="flex gap-3 overflow-x-auto -mx-5 px-5 pb-2 scrollbar-none">
			{#each gainingItems as item (item.id)}
				<div class="group shrink-0 w-40 rounded-lg overflow-hidden border border-white/8 hover:border-white/20 cursor-pointer transition-all duration-200 os-card-glow">
					<div class="relative w-full aspect-square">
						<!--
							Image opacity: 50% → 70%. Gaining Resonance cards are
							the "rising" items — they should feel vivid, energetic.
						-->
						<img
							src={item.image}
							alt={item.title}
							class="w-full h-full object-cover opacity-70 group-hover:opacity-88 transition-opacity duration-300"
						/>
						<div class="absolute inset-0 bg-linear-to-t from-black/78 via-black/18 to-transparent"></div>
						<div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150">
							<div class="w-7 h-7 rounded-full bg-white/20 border border-white/35 text-white flex items-center justify-center backdrop-blur-sm">
								<svg class="w-3 h-3 translate-x-px" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
									<path d="M3 2l8 4-8 4V2z" />
								</svg>
							</div>
						</div>
						<!--
							Growth badge: more vivid colors, stronger border.
							These are the stat readouts — they should be legible and energetic.
						-->
						<div class="absolute top-2 left-2">
							<span
								class={[
									'inline-flex items-center gap-0.5 text-[9px] font-bold rounded-full px-1.5 py-0.5 border backdrop-blur-sm',
									item.trend === 'surging'
										? 'text-success bg-black/55 border-success/50 shadow-[0_0_6px_-1px_var(--color-success)]'
										: 'text-accent bg-black/55 border-accent/45 shadow-[0_0_6px_-1px_var(--color-accent)]',
								]}
							>
								<ArrowUpRight size={8} />
								+{item.growth}
							</span>
						</div>
					</div>
					<div class="p-2.5 bg-base-200/70">
						<p class="text-[12px] font-bold text-base-content/88 truncate leading-snug">{item.title}</p>
						<p class="text-[10px] text-base-content/45 truncate mt-0.5">{item.artist}</p>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- ── Weak Signals ─────────────────────────────────────── -->
	<section>
		<div class="flex items-center justify-between mb-4">
			<div class="flex items-center gap-2">
				<div class="w-0.75 h-3.5 rounded-full bg-base-content/35" aria-hidden="true"></div>
				<p class="text-xs font-bold uppercase tracking-widest text-base-content/62">Weak Signals</p>
			</div>
			<span class="text-[11px] text-base-content/35">What almost nobody is hearing yet</span>
		</div>

		<div class="os-surface divide-y divide-white/5 overflow-hidden">
			{#each weakSignals as item (item.id)}
				<div class="group flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors duration-150 cursor-pointer">
					<div class="w-7 h-7 rounded-md overflow-hidden border border-white/10 shrink-0">
						<img
							src={item.image}
							alt=""
							class="w-full h-full object-cover opacity-55 group-hover:opacity-80 transition-opacity"
						/>
					</div>
					<div class="flex-1 min-w-0">
						<p class="text-[13px] font-semibold text-base-content/82 truncate">{item.title}</p>
						<p class="text-[11px] text-base-content/42 truncate">{item.artist} · {item.genre}</p>
					</div>
					<p class="text-[11px] text-base-content/35 shrink-0 group-hover:text-base-content/55 transition-colors">
						{item.scouts === 0 ? 'No scouts yet' : `${item.scouts} Scout${item.scouts === 1 ? '' : 's'}`}
					</p>
				</div>
			{/each}
		</div>
	</section>

	<!-- ── Deep Field ───────────────────────────────────────── -->
	<section class="pb-4">
		<div class="flex items-center justify-between mb-4">
			<div class="flex items-center gap-2">
				<div class="w-0.75 h-3.5 rounded-full bg-secondary/70" aria-hidden="true"></div>
				<p class="text-xs font-bold uppercase tracking-widest text-base-content/62">Deep Field</p>
			</div>
			<span class="text-[11px] text-base-content/35">Origin stories. Almost undiscovered.</span>
		</div>

		<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
			{#each deepFieldItems as item (item.id)}
				<div class="group flex gap-3.5 rounded-lg p-4 cursor-pointer bg-base-300/42 border border-white/6 hover:border-white/14 hover:bg-white/4 transition-all duration-200">
					<div class="shrink-0 w-12 h-12 rounded-md overflow-hidden border border-white/10 self-start">
						<img
							src={item.image}
							alt=""
							class="w-full h-full object-cover opacity-62 group-hover:opacity-80 transition-opacity"
						/>
					</div>
					<div class="flex-1 min-w-0">
						<p class="text-[13px] font-bold text-base-content/90 truncate">{item.title}</p>
						<p class="text-[11px] text-base-content/50 truncate mt-0.5">{item.artist} · {item.genre}</p>
						<p class="text-[12px] text-base-content/45 italic mt-2 leading-relaxed line-clamp-2">{item.note}</p>
						<div class="flex items-center gap-2 mt-2.5">
							<span class="text-[10px] text-base-content/38">◈ {item.origin}</span>
							<span class="text-[10px] text-base-content/22">·</span>
							<span class="text-[10px] text-base-content/35">
								{item.scouts === 0 ? 'No scouts yet' : `${item.scouts} Scout${item.scouts === 1 ? '' : 's'}`}
							</span>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</section>

</div>
