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
</script>

<div class="max-w-5xl mx-auto px-5 py-8 space-y-10">

	<!-- ── Greeting + filter chips ──────────────────────────── -->
	<div class="space-y-5">
		<div class="space-y-2.5">
			<div class="h-px w-20 bg-linear-to-r from-primary/50 to-transparent rounded-full" aria-hidden="true"></div>
			<div class="flex items-center gap-1.5">
				<svg class="w-2.5 h-2.5 text-primary/55 shrink-0" viewBox="0 0 10 10" fill="none" aria-hidden="true">
					<circle cx="5" cy="5" r="1.5" fill="currentColor" />
					<circle cx="5" cy="5" r="3.75" stroke="currentColor" stroke-width="0.75" opacity="0.55" />
				</svg>
				<span class="text-[11px] font-semibold uppercase tracking-widest text-primary/55">Your Signal</span>
			</div>
			<h1 class="text-3xl font-extrabold tracking-tight text-base-content/95">{getGreeting()}</h1>
			<p class="text-sm text-base-content/50 max-w-sm">
				Signals curated to your frequency. What's faint today may resonate tomorrow.
			</p>
		</div>

		<div class="flex items-center gap-1.5 flex-wrap">
			{#each filters as filter (filter)}
				<button
					onclick={() => (activeFilter = filter)}
					class={[
						'px-3 py-1 rounded-full text-[12px] font-medium transition-all duration-150',
						activeFilter === filter
							? 'bg-primary/18 text-primary/90 border border-primary/35'
							: 'text-base-content/42 border border-white/8 hover:text-base-content/72 hover:border-white/16 hover:bg-white/4',
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
				<div class="w-0.75 h-3.5 rounded-full bg-primary/60" aria-hidden="true"></div>
				<p class="text-xs font-bold uppercase tracking-widest text-base-content/68">For You</p>
			</div>
			<a href="/discover" class="text-[11px] text-base-content/35 hover:text-base-content/65 transition-colors">
				See all →
			</a>
		</div>

		<div class="os-surface p-4">
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 items-stretch">

				<!-- Hero card -->
				<div
					class="group relative rounded-xl overflow-hidden cursor-pointer os-hero-card border border-primary/20 hover:border-primary/38 transition-colors duration-300 flex flex-col"
					style="min-height: 280px;"
				>
					<!-- Real image + gradient overlays -->
					<div class="relative flex-1 overflow-hidden min-h-36">
						<img
							src={featuredItem.image}
							alt={featuredItem.title}
							class="absolute inset-0 w-full h-full object-cover opacity-55 transition-transform duration-700 group-hover:scale-105"
						/>
						<!--
							Three overlay layers on top of real image:
							1. Primary tint (br) — pushes image into brand color space
							2. Bottom vignette — ensures info section text is readable
							3. Top darkening — prevents top-right from being too bright
						-->
						<div class="absolute inset-0 bg-linear-to-br from-primary/35 via-primary/10 to-secondary/22"></div>
						<div class="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-black/60"></div>
						<div class="absolute inset-0 bg-linear-to-t from-transparent to-black/25"></div>

						<!-- Signal rings -->
						<div class="absolute top-1/2 -translate-y-1/2 -right-8 pointer-events-none" aria-hidden="true">
							<svg class="w-56 h-56 text-primary" viewBox="0 0 224 224" fill="none">
								<circle cx="112" cy="112" r="16" fill="currentColor" opacity="0.15" />
								<circle cx="112" cy="112" r="44" stroke="currentColor" stroke-width="1.25" opacity="0.10" />
								<circle cx="112" cy="112" r="76" stroke="currentColor" stroke-width="1" opacity="0.06" />
								<circle cx="112" cy="112" r="108" stroke="currentColor" stroke-width="0.75" opacity="0.04" />
							</svg>
						</div>

						<!-- Pick badge -->
						<div class="absolute top-3 right-3">
							<span class="text-[10px] font-bold tracking-wide text-primary/90 border border-primary/35 rounded-full px-2.5 py-1 bg-black/50 backdrop-blur-sm">
								Pick
							</span>
						</div>

						<!-- Genre chip bottom-left -->
						<div class="absolute bottom-3 left-3">
							<span class="text-[10px] font-medium text-base-content/65 border border-white/12 rounded-full px-2 py-0.5 bg-black/45 backdrop-blur-sm">
								{featuredItem.genre}
							</span>
						</div>

						<!-- Play overlay on hover -->
						<div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
							<div class="w-11 h-11 rounded-full bg-primary/28 border border-primary/52 text-primary flex items-center justify-center os-play-glow">
								<svg class="w-4 h-4 translate-x-px" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
									<path d="M3 2l8 4-8 4V2z" />
								</svg>
							</div>
						</div>
					</div>

					<!-- Info section -->
					<div class="px-4 py-3.5 shrink-0 flex items-center justify-between gap-3" style="background-color: oklch(0.112 0.028 265 / 0.97);">
						<div class="min-w-0">
							<p class="text-base font-bold text-base-content/95 truncate tracking-tight">{featuredItem.title}</p>
							<p class="text-[11px] text-base-content/45 truncate mt-0.5">
								{featuredItem.artist} · {featuredItem.scouts} Scout{featuredItem.scouts === 1 ? '' : 's'}
							</p>
						</div>
						<button
							class="shrink-0 flex items-center gap-1.5 h-7 px-3 rounded-full text-[11px] font-semibold text-accent/75 border border-accent/28 hover:text-accent hover:border-accent/52 hover:bg-accent/8 transition-all"
							aria-label="Amplify this signal"
						>
							<Radio size={10} />
							Amplify
						</button>
					</div>
				</div>

				<!-- Regular 2×2 grid -->
				<div class="grid grid-cols-2 gap-3 content-start">
					{#each regularItems as item (item.id)}
						<div class="group relative rounded-lg overflow-hidden cursor-pointer transition-all duration-200 border border-white/6 hover:border-white/14">
							<!--
								Image fills the card. Info sits in an absolute overlay at the bottom,
								backed by a gradient so it's always readable regardless of image content.
							-->
							<div class="relative aspect-square w-full">
								<img
									src={item.image}
									alt={item.title}
									class="w-full h-full object-cover opacity-50 group-hover:opacity-65 transition-opacity duration-300"
								/>
								<!-- Bottom gradient: info overlay backing -->
								<div class="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent"></div>

								<!-- Play overlay -->
								<div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150">
									<div class="w-7 h-7 rounded-full bg-white/15 border border-white/22 text-white flex items-center justify-center">
										<svg class="w-3 h-3 translate-x-px" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
											<path d="M3 2l8 4-8 4V2z" />
										</svg>
									</div>
								</div>

								<!-- Info overlay at bottom -->
								<div class="absolute bottom-0 left-0 right-0 p-2.5">
									<p class="text-[12px] font-semibold text-white/90 truncate leading-snug">{item.title}</p>
									<p class="text-[10px] text-white/45 truncate mt-0.5">{item.genre}</p>
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
				<div class="w-0.75 h-3.5 rounded-full bg-success/55" aria-hidden="true"></div>
				<p class="text-xs font-bold uppercase tracking-widest text-base-content/68">Gaining Resonance</p>
			</div>
			<span class="text-[11px] text-base-content/28 flex items-center gap-1">
				<TrendingUp size={11} class="text-success/50" />
				Scouts are accumulating
			</span>
		</div>

		<div class="flex gap-3 overflow-x-auto -mx-5 px-5 pb-1 scrollbar-none">
			{#each gainingItems as item (item.id)}
				<div class="group shrink-0 w-40 rounded-lg overflow-hidden border border-white/6 hover:border-white/12 cursor-pointer transition-all duration-150">
					<!-- Square image area -->
					<div class="relative w-full aspect-square">
						<img
							src={item.image}
							alt={item.title}
							class="w-full h-full object-cover opacity-50 group-hover:opacity-65 transition-opacity duration-300"
						/>
						<div class="absolute inset-0 bg-linear-to-t from-black/75 via-black/15 to-transparent"></div>
						<div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150">
							<div class="w-6 h-6 rounded-full bg-white/15 border border-white/20 text-white flex items-center justify-center">
								<svg class="w-2.5 h-2.5 translate-x-px" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
									<path d="M3 2l8 4-8 4V2z" />
								</svg>
							</div>
						</div>
						<!-- Growth badge: absolute over image -->
						<div class="absolute top-2 left-2">
							<span
								class={[
									'inline-flex items-center gap-0.5 text-[9px] font-bold rounded-full px-1.5 py-0.5 border',
									item.trend === 'surging'
										? 'text-success/95 bg-black/50 border-success/30 backdrop-blur-sm'
										: 'text-accent/90 bg-black/50 border-accent/25 backdrop-blur-sm',
								]}
							>
								<ArrowUpRight size={8} />
								{item.growth}
							</span>
						</div>
					</div>
					<!-- Info row below image -->
					<div class="p-2.5 bg-base-200/60">
						<p class="text-[12px] font-semibold text-base-content/82 truncate leading-snug">{item.title}</p>
						<p class="text-[10px] text-base-content/38 truncate mt-0.5">{item.artist}</p>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- ── Weak Signals ─────────────────────────────────────── -->
	<section>
		<div class="flex items-center justify-between mb-4">
			<div class="flex items-center gap-2">
				<div class="w-0.75 h-3.5 rounded-full bg-base-content/22" aria-hidden="true"></div>
				<p class="text-xs font-bold uppercase tracking-widest text-base-content/55">Weak Signals</p>
			</div>
			<span class="text-[11px] text-base-content/28">What almost nobody is hearing yet</span>
		</div>

		<div class="os-surface divide-y divide-white/4 overflow-hidden">
			{#each weakSignals as item (item.id)}
				<div class="group flex items-center gap-3 px-4 py-3 hover:bg-white/3 transition-colors duration-150 cursor-pointer">
					<!--
						Small thumbnail: real image at low opacity + fallback dot.
						32×32px so the image request is tiny.
					-->
					<div class="w-7 h-7 rounded-md overflow-hidden border border-white/8 shrink-0">
						<img
							src={item.image}
							alt=""
							class="w-full h-full object-cover opacity-45 group-hover:opacity-65 transition-opacity"
						/>
					</div>
					<div class="flex-1 min-w-0">
						<p class="text-[13px] font-semibold text-base-content/75 truncate">{item.title}</p>
						<p class="text-[11px] text-base-content/35 truncate">{item.artist} · {item.genre}</p>
					</div>
					<p class="text-[11px] text-base-content/28 shrink-0">
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
				<div class="w-0.75 h-3.5 rounded-full bg-secondary/45" aria-hidden="true"></div>
				<p class="text-xs font-bold uppercase tracking-widest text-base-content/55">Deep Field</p>
			</div>
			<span class="text-[11px] text-base-content/28">Origin stories. Almost undiscovered.</span>
		</div>

		<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
			{#each deepFieldItems as item (item.id)}
				<div class="group flex gap-3.5 rounded-lg p-4 cursor-pointer bg-base-300/38 border border-white/5 hover:border-white/10 hover:bg-white/3 transition-all duration-150">
					<!-- Small square image thumbnail -->
					<div class="shrink-0 w-12 h-12 rounded-md overflow-hidden border border-white/8 self-start">
						<img
							src={item.image}
							alt=""
							class="w-full h-full object-cover opacity-50 group-hover:opacity-65 transition-opacity"
						/>
					</div>
					<div class="flex-1 min-w-0">
						<p class="text-[13px] font-bold text-base-content/88 truncate">{item.title}</p>
						<p class="text-[11px] text-base-content/45 truncate mt-0.5">{item.artist} · {item.genre}</p>
						<p class="text-[12px] text-base-content/40 italic mt-2 leading-relaxed line-clamp-2">{item.note}</p>
						<div class="flex items-center gap-2 mt-2.5">
							<span class="text-[10px] text-base-content/30">◈ {item.origin}</span>
							<span class="text-[10px] text-base-content/20">·</span>
							<span class="text-[10px] text-base-content/28">
								{item.scouts === 0 ? 'No scouts yet' : `${item.scouts} Scout${item.scouts === 1 ? '' : 's'}`}
							</span>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</section>

</div>
