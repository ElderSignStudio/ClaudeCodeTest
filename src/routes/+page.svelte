<script lang="ts">
	import { Radio, TrendingUp, ArrowUpRight } from 'lucide-svelte';
	import {
		forYouItems, oneStepAwayItems, deepUndergroundItems,
		breakingOutItems, humanSignalItems, outsideBubbleItems,
		originItems, driftItems,
	} from '$lib/mock/data';

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
			<div class="h-px w-28 bg-linear-to-r from-primary to-transparent rounded-full" aria-hidden="true"></div>
			<div class="flex items-center gap-1.5">
				<svg class="w-2.5 h-2.5 text-primary/70 shrink-0" viewBox="0 0 10 10" fill="none" aria-hidden="true">
					<circle cx="5" cy="5" r="1.5" fill="currentColor" />
					<circle cx="5" cy="5" r="3.75" stroke="currentColor" stroke-width="0.75" opacity="0.7" />
				</svg>
				<span class="text-[11px] font-semibold uppercase tracking-widest text-primary/70">Your Signal</span>
			</div>
			<h1 class="text-3xl font-extrabold tracking-tight text-base-content">{getGreeting()}</h1>
			<p class="text-sm text-base-content/68 max-w-sm">
				Signals curated to your frequency. What's faint today may resonate tomorrow.
			</p>
		</div>

		<div class="flex items-center gap-1.5 flex-wrap">
			{#each filters as filter (filter)}
				<button
					onclick={() => (activeFilter = filter)}
					class={[
						'px-3 py-1 rounded-full text-[12px] font-semibold transition-all duration-150',
						activeFilter === filter
							? 'bg-primary/22 text-primary border border-primary/45 os-glow-interactive'
							: 'text-base-content/62 border border-white/10 hover:text-base-content/85 hover:border-white/22 hover:bg-white/5',
					]}
				>
					{filter}
				</button>
			{/each}
		</div>
	</div>

	<!-- ── 1. For You ───────────────────────────────────────── -->
	<section>
		<div class="flex items-center justify-between mb-4">
			<div class="flex items-center gap-2">
				<div class="w-0.75 h-3.5 rounded-full bg-primary" aria-hidden="true"></div>
				<p class="text-sm font-bold uppercase tracking-widest text-base-content/90">For You</p>
			</div>
			<a href="/discover" class="text-[12px] text-base-content/55 hover:text-primary/80 transition-colors">
				See all →
			</a>
		</div>

		<div class="os-surface p-4">
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 items-stretch">

				<!-- Hero card -->
				<div
					class="group relative rounded-xl overflow-hidden cursor-pointer os-hero-card border border-primary/22 flex flex-col"
					style="min-height: 280px;"
				>
					<div class="relative flex-1 overflow-hidden min-h-36">
						<img
							src={featuredItem.image}
							alt={featuredItem.title}
							class="absolute inset-0 w-full h-full object-cover opacity-72 transition-transform duration-700 group-hover:scale-105"
						/>
						<div class="absolute inset-0 bg-linear-to-br from-primary/25 via-transparent to-secondary/15"></div>
						<div class="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-black/72"></div>

						<!-- Signal origin rings -->
						<div class="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
							<div class="absolute w-44 h-44 rounded-full" style="background: radial-gradient(circle, oklch(0.68 0.20 265 / 0.20) 0%, transparent 70%);"></div>
							<svg class="w-64 h-64 text-primary" viewBox="0 0 256 256" fill="none">
								<circle cx="128" cy="128" r="14" fill="currentColor" opacity="0.25" />
								<circle cx="128" cy="128" r="38" stroke="currentColor" stroke-width="1.25" opacity="0.18" />
								<circle cx="128" cy="128" r="68" stroke="currentColor" stroke-width="1" opacity="0.11" />
								<circle cx="128" cy="128" r="100" stroke="currentColor" stroke-width="0.75" opacity="0.06" />
								<circle cx="128" cy="128" r="125" stroke="currentColor" stroke-width="0.5" opacity="0.03" />
							</svg>
						</div>

						<!-- Pick badge -->
						<div class="absolute top-3 right-3">
							<span
								class="text-[10px] font-bold tracking-wide text-primary border border-primary/50 rounded-full px-2.5 py-1 bg-black/55 backdrop-blur-sm"
								style="box-shadow: var(--glow-l3-primary);"
							>
								Pick
							</span>
						</div>

						<!-- Genre chip -->
						<div class="absolute bottom-3 left-3">
							<span class="text-[10px] font-semibold text-white/72 border border-white/16 rounded-full px-2 py-0.5 bg-black/50 backdrop-blur-sm">
								{featuredItem.genre}
							</span>
						</div>

						<!-- Play button -->
						<div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
							<div class="w-14 h-14 rounded-full bg-primary/32 border border-primary/62 text-primary flex items-center justify-center os-glow-interactive scale-90 group-hover:scale-100 transition-transform duration-200">
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
							<p class="text-[12px] text-base-content/70 truncate mt-0.5">
								{featuredItem.artist} · {featuredItem.scouts} Scout{featuredItem.scouts === 1 ? '' : 's'}
							</p>
						</div>
						<button
							class="shrink-0 flex items-center gap-1.5 h-7 px-3 rounded-full text-[12px] font-semibold text-accent border border-accent/42 bg-accent/10 hover:bg-accent/18 hover:border-accent/62 transition-all os-glow-interactive-accent"
							aria-label="Amplify this signal"
						>
							<Radio size={10} />
							Amplify
						</button>
					</div>
				</div>

				<!-- Regular 2×2 grid -->
				<div class="grid grid-cols-2 gap-3 content-start">
					{#each regularItems as item, i (item.id)}
						<div class="group relative rounded-lg overflow-hidden cursor-pointer border border-white/8 hover:border-white/22 transition-all duration-250 os-card-glow">
							<div class="relative aspect-square w-full">
								<img
									src={item.image}
									alt={item.title}
									class="w-full h-full object-cover opacity-68 group-hover:opacity-85 transition-opacity duration-300"
								/>
								<div class={`absolute inset-0 bg-linear-to-br ${cardTints[i % cardTints.length]} mix-blend-color`}></div>
								<div class="absolute inset-0 bg-linear-to-t from-black/82 via-black/25 to-transparent"></div>

								<!-- Signal pulse -->
								<div
									class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-250 pointer-events-none"
									style="background: radial-gradient(circle at 50% 50%, oklch(0.68 0.20 265 / 0.10) 0%, transparent 65%);"
									aria-hidden="true"
								></div>

								<!-- Play overlay -->
								<div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
									<div class="w-8 h-8 rounded-full bg-white/20 border border-white/35 text-white flex items-center justify-center backdrop-blur-sm scale-90 group-hover:scale-100 transition-transform duration-200">
										<svg class="w-3.5 h-3.5 translate-x-px" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
											<path d="M3 2l8 4-8 4V2z" />
										</svg>
									</div>
								</div>

								<!-- Info overlay -->
								<div class="absolute bottom-0 left-0 right-0 p-2.5">
									<p class="text-[13px] font-bold text-white truncate leading-snug">{item.title}</p>
									<p class="text-[11px] text-white/75 truncate mt-0.5">{item.genre}</p>
								</div>
							</div>
						</div>
					{/each}
				</div>

			</div>
		</div>
	</section>

	<!-- ── 2. One Step Away ──────────────────────────────────── -->
	<section>
		<div class="flex items-center justify-between mb-4">
			<div class="flex items-center gap-2">
				<div class="w-0.75 h-3.5 rounded-full bg-accent" aria-hidden="true"></div>
				<p class="text-sm font-bold uppercase tracking-widest text-base-content/90">One Step Away</p>
			</div>
			<span class="text-[12px] text-base-content/65">Signals just outside your taste</span>
		</div>

		<div class="flex gap-3 overflow-x-auto -mx-5 px-5 pb-2 scrollbar-none">
			{#each oneStepAwayItems as item (item.id)}
				<div class="group shrink-0 w-40 rounded-lg overflow-hidden border border-white/8 hover:border-white/20 cursor-pointer transition-all duration-200 os-card-glow">
					<div class="relative w-full aspect-square">
						<img
							src={item.image}
							alt={item.title}
							class="w-full h-full object-cover opacity-70 group-hover:opacity-88 transition-opacity duration-300"
						/>
						<div class="absolute inset-0 bg-linear-to-t from-black/78 via-black/18 to-transparent"></div>

						<!-- Signal pulse -->
						<div
							class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-250 pointer-events-none"
							style="background: radial-gradient(circle at 50% 50%, oklch(0.68 0.20 265 / 0.10) 0%, transparent 65%);"
							aria-hidden="true"
						></div>

						<!-- Play overlay -->
						<div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
							<div class="w-7 h-7 rounded-full bg-white/20 border border-white/35 text-white flex items-center justify-center backdrop-blur-sm scale-90 group-hover:scale-100 transition-transform duration-200">
								<svg class="w-3 h-3 translate-x-px" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
									<path d="M3 2l8 4-8 4V2z" />
								</svg>
							</div>
						</div>

						<!-- Adjacent badge -->
						<div class="absolute top-2 left-2">
							<span
								class="text-[10px] font-bold rounded-full px-1.5 py-0.5 border backdrop-blur-sm bg-black/55"
								style="color: var(--color-accent); border-color: oklch(0.72 0.16 220 / 0.45);"
							>
								Adjacent
							</span>
						</div>
					</div>
					<div class="p-2.5 bg-base-200/70">
						<p class="text-[13px] font-bold text-base-content/95 truncate leading-snug">{item.title}</p>
						<p class="text-[11px] text-base-content/68 truncate mt-0.5">{item.artist}</p>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- ── 3. Deep Underground ──────────────────────────────── -->
	<section>
		<div class="flex items-center justify-between mb-4">
			<div class="flex items-center gap-2">
				<div class="w-0.75 h-3.5 rounded-full bg-secondary/60" aria-hidden="true"></div>
				<p class="text-sm font-bold uppercase tracking-widest text-base-content/88">Deep Underground</p>
			</div>
			<span class="text-[12px] text-base-content/65">Nobody has heard this yet</span>
		</div>

		<!--
			Images deliberately dimmer (opacity-40 vs 55) to feel hidden and buried.
			The "Deep" badge reinforces the obscurity.
		-->
		<div class="os-surface divide-y divide-white/5 overflow-hidden">
			{#each deepUndergroundItems as item (item.id)}
				<div class="group flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors duration-150 cursor-pointer">
					<div class="w-7 h-7 rounded-md overflow-hidden border border-white/8 shrink-0">
						<img
							src={item.image}
							alt=""
							class="w-full h-full object-cover opacity-40 group-hover:opacity-68 transition-opacity"
						/>
					</div>
					<div class="flex-1 min-w-0">
						<p class="text-[14px] font-semibold text-base-content/95 truncate">{item.title}</p>
						<p class="text-[12px] text-base-content/68 truncate">{item.artist} · {item.genre}</p>
					</div>
					<span
						class="text-[10px] font-semibold shrink-0 rounded-full px-2 py-0.5 border"
						style="color: oklch(0.65 0.18 290 / 0.85); border-color: oklch(0.65 0.18 290 / 0.25);"
					>
						Deep
					</span>
				</div>
			{/each}
		</div>
	</section>

	<!-- ── 4. Breaking Out ──────────────────────────────────── -->
	<section>
		<div class="flex items-center justify-between mb-4">
			<div class="flex items-center gap-2">
				<div class="w-0.75 h-3.5 rounded-full bg-success" aria-hidden="true"></div>
				<p class="text-sm font-bold uppercase tracking-widest text-base-content/90">Breaking Out</p>
			</div>
			<span class="text-[12px] text-base-content/65 flex items-center gap-1">
				<TrendingUp size={11} class="text-success/80" />
				Scouts are accumulating
			</span>
		</div>

		<div class="flex gap-3 overflow-x-auto -mx-5 px-5 pb-2 scrollbar-none">
			{#each breakingOutItems as item (item.id)}
				<div class="group shrink-0 w-40 rounded-lg overflow-hidden border border-white/8 hover:border-white/20 cursor-pointer transition-all duration-200 os-card-glow">
					<div class="relative w-full aspect-square">
						<img
							src={item.image}
							alt={item.title}
							class="w-full h-full object-cover opacity-70 group-hover:opacity-88 transition-opacity duration-300"
						/>
						<div class="absolute inset-0 bg-linear-to-t from-black/78 via-black/18 to-transparent"></div>

						<!-- Signal pulse -->
						<div
							class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-250 pointer-events-none"
							style="background: radial-gradient(circle at 50% 50%, oklch(0.68 0.20 265 / 0.10) 0%, transparent 65%);"
							aria-hidden="true"
						></div>

						<!-- Play overlay -->
						<div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
							<div class="w-7 h-7 rounded-full bg-white/20 border border-white/35 text-white flex items-center justify-center backdrop-blur-sm scale-90 group-hover:scale-100 transition-transform duration-200">
								<svg class="w-3 h-3 translate-x-px" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
									<path d="M3 2l8 4-8 4V2z" />
								</svg>
							</div>
						</div>

						<!-- Growth badge -->
						<div class="absolute top-2 left-2">
							<span
								class="inline-flex items-center gap-0.5 text-[10px] font-bold rounded-full px-1.5 py-0.5 border backdrop-blur-sm bg-black/55"
								style={item.trend === 'surging'
									? `color: var(--color-success); border-color: oklch(0.74 0.17 158 / 0.45); box-shadow: var(--glow-l3-success);`
									: `color: var(--color-accent); border-color: oklch(0.72 0.16 220 / 0.40); box-shadow: var(--glow-l3-accent);`}
							>
								<ArrowUpRight size={8} />
								+{item.growth}
							</span>
						</div>
					</div>
					<div class="p-2.5 bg-base-200/70">
						<p class="text-[13px] font-bold text-base-content/95 truncate leading-snug">{item.title}</p>
						<p class="text-[11px] text-base-content/68 truncate mt-0.5">{item.artist}</p>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- ── 5. Human Signals ─────────────────────────────────── -->
	<section>
		<div class="flex items-center justify-between mb-4">
			<div class="flex items-center gap-2">
				<div class="w-0.75 h-3.5 rounded-full bg-accent/65" aria-hidden="true"></div>
				<p class="text-sm font-bold uppercase tracking-widest text-base-content/88">Human Signals</p>
			</div>
			<span class="text-[12px] text-base-content/65">Discovered by people like you</span>
		</div>

		<!--
			Right column shows userContext ("Dan amplified this") instead of scout count.
			Same row structure as Deep Underground — the metadata content changes, not the shape.
		-->
		<div class="os-surface divide-y divide-white/5 overflow-hidden">
			{#each humanSignalItems as item (item.id)}
				<div class="group flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors duration-150 cursor-pointer">
					<div class="w-7 h-7 rounded-md overflow-hidden border border-white/10 shrink-0">
						<img
							src={item.image}
							alt=""
							class="w-full h-full object-cover opacity-55 group-hover:opacity-80 transition-opacity"
						/>
					</div>
					<div class="flex-1 min-w-0">
						<p class="text-[14px] font-semibold text-base-content/95 truncate">{item.title}</p>
						<p class="text-[12px] text-base-content/68 truncate">{item.artist} · {item.genre}</p>
					</div>
					<p class="text-[12px] text-base-content/58 shrink-0 group-hover:text-base-content/80 transition-colors italic max-w-36 text-right truncate">
						{item.userContext}
					</p>
				</div>
			{/each}
		</div>
	</section>

	<!-- ── 6. Outside the Bubble ────────────────────────────── -->
	<section>
		<div class="flex items-center justify-between mb-4">
			<div class="flex items-center gap-2">
				<div class="w-0.75 h-3.5 rounded-full bg-warning/70" aria-hidden="true"></div>
				<p class="text-sm font-bold uppercase tracking-widest text-base-content/88">Outside the Bubble</p>
			</div>
			<span class="text-[12px] text-base-content/65">Intentionally different</span>
		</div>

		<div class="flex gap-3 overflow-x-auto -mx-5 px-5 pb-2 scrollbar-none">
			{#each outsideBubbleItems as item (item.id)}
				<div class="group shrink-0 w-40 rounded-lg overflow-hidden border border-white/8 hover:border-white/20 cursor-pointer transition-all duration-200 os-card-glow">
					<div class="relative w-full aspect-square">
						<img
							src={item.image}
							alt={item.title}
							class="w-full h-full object-cover opacity-70 group-hover:opacity-88 transition-opacity duration-300"
						/>
						<div class="absolute inset-0 bg-linear-to-t from-black/78 via-black/18 to-transparent"></div>

						<!-- Signal pulse -->
						<div
							class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-250 pointer-events-none"
							style="background: radial-gradient(circle at 50% 50%, oklch(0.68 0.20 265 / 0.10) 0%, transparent 65%);"
							aria-hidden="true"
						></div>

						<!-- Play overlay -->
						<div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
							<div class="w-7 h-7 rounded-full bg-white/20 border border-white/35 text-white flex items-center justify-center backdrop-blur-sm scale-90 group-hover:scale-100 transition-transform duration-200">
								<svg class="w-3 h-3 translate-x-px" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
									<path d="M3 2l8 4-8 4V2z" />
								</svg>
							</div>
						</div>

						<!-- Unexpected badge -->
						<div class="absolute top-2 left-2">
							<span
								class="text-[10px] font-bold rounded-full px-1.5 py-0.5 border backdrop-blur-sm bg-black/55"
								style="color: var(--color-warning); border-color: oklch(0.78 0.17 78 / 0.40);"
							>
								Unexpected
							</span>
						</div>
					</div>
					<div class="p-2.5 bg-base-200/70">
						<p class="text-[13px] font-bold text-base-content/95 truncate leading-snug">{item.title}</p>
						<p class="text-[11px] text-base-content/68 truncate mt-0.5">{item.artist}</p>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- ── 7. Origin Stories ─────────────────────────────────── -->
	<section>
		<div class="flex items-center justify-between mb-4">
			<div class="flex items-center gap-2">
				<div class="w-0.75 h-3.5 rounded-full bg-secondary" aria-hidden="true"></div>
				<p class="text-sm font-bold uppercase tracking-widest text-base-content/88">Origin Stories</p>
			</div>
			<span class="text-[12px] text-base-content/65">How signals spread</span>
		</div>

		<!--
			Reuses the Deep Field editorial card shape.
			Metadata replaced: reachedScouts, discoveries, branch
			instead of note/origin text.
		-->
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
			{#each originItems as item (item.id)}
				<div class="group flex gap-3.5 rounded-lg p-4 cursor-pointer bg-base-300/42 border border-white/6 hover:border-white/14 hover:bg-white/4 transition-all duration-200">
					<div class="shrink-0 w-12 h-12 rounded-md overflow-hidden border border-white/10 self-start">
						<img
							src={item.image}
							alt=""
							class="w-full h-full object-cover opacity-62 group-hover:opacity-80 transition-opacity"
						/>
					</div>
					<div class="flex-1 min-w-0">
						<p class="text-[13px] font-bold text-base-content/95 truncate">{item.title}</p>
						<p class="text-[12px] text-base-content/70 truncate mt-0.5">{item.artist} · {item.genre}</p>
						<p class="text-[12px] text-base-content/62 italic mt-2 leading-relaxed">{item.branch}</p>
						<div class="flex items-center gap-2 mt-2.5">
							<span class="text-[11px] text-base-content/55">Reached {item.reachedScouts} scouts</span>
							<span class="text-[11px] text-base-content/28">·</span>
							<span class="text-[11px] text-base-content/52">{item.discoveries} independent {item.discoveries === 1 ? 'discovery' : 'discoveries'}</span>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- ── 8. Explore / Drift ────────────────────────────────── -->
	<section class="pb-4">
		<div class="flex items-center justify-between mb-4">
			<div class="flex items-center gap-2">
				<div class="w-0.75 h-3.5 rounded-full bg-primary/55" aria-hidden="true"></div>
				<p class="text-sm font-bold uppercase tracking-widest text-base-content/88">Explore / Drift</p>
			</div>
			<span class="text-[12px] text-base-content/65">Let the signal find you</span>
		</div>

		<!--
			3-col grid at sm+ to give a wider, more exploratory feel.
			Reuses the same aspect-square card pattern as the For You grid.
			No algorithm — just drift.
		-->
		<div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
			{#each driftItems as item, i (item.id)}
				<div class="group relative rounded-lg overflow-hidden cursor-pointer border border-white/8 hover:border-white/22 transition-all duration-250 os-card-glow">
					<div class="relative aspect-square w-full">
						<img
							src={item.image}
							alt={item.title}
							class="w-full h-full object-cover opacity-68 group-hover:opacity-85 transition-opacity duration-300"
						/>
						<div class={`absolute inset-0 bg-linear-to-br ${cardTints[i % cardTints.length]} mix-blend-color`}></div>
						<div class="absolute inset-0 bg-linear-to-t from-black/82 via-black/25 to-transparent"></div>

						<!-- Signal pulse -->
						<div
							class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-250 pointer-events-none"
							style="background: radial-gradient(circle at 50% 50%, oklch(0.68 0.20 265 / 0.10) 0%, transparent 65%);"
							aria-hidden="true"
						></div>

						<!-- Play overlay -->
						<div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
							<div class="w-8 h-8 rounded-full bg-white/20 border border-white/35 text-white flex items-center justify-center backdrop-blur-sm scale-90 group-hover:scale-100 transition-transform duration-200">
								<svg class="w-3.5 h-3.5 translate-x-px" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
									<path d="M3 2l8 4-8 4V2z" />
								</svg>
							</div>
						</div>

						<!-- Info overlay -->
						<div class="absolute bottom-0 left-0 right-0 p-2.5">
							<p class="text-[13px] font-bold text-white truncate leading-snug">{item.title}</p>
							<p class="text-[11px] text-white/75 truncate mt-0.5">{item.genre}</p>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</section>

</div>
