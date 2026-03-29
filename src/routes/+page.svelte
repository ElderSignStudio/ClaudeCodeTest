<script lang="ts">
	import { forYouItems, gainingItems, weakSignals, deepFieldItems } from '$lib/mock/data';

	/*
		Time-based greeting: pure client-side Date, no backend needed.
		Called once at module evaluation time — stable for the session.
	*/
	function getGreeting(): string {
		const hour = new Date().getHours();
		if (hour < 12) return 'Good morning.';
		if (hour < 17) return 'Good afternoon.';
		return 'Good evening.';
	}

	/*
		Filter chips: $state so clicking updates the UI reactively.
		No actual filtering in prototype — the active state is visual only.
		Replacing with real filtering later only requires wiring activeFilter
		to a $derived array.
	*/
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
				<span class="text-[11px] font-medium uppercase tracking-widest text-primary/55">Your Signal</span>
			</div>
			<h1 class="text-3xl font-bold tracking-tight text-base-content/95">{getGreeting()}</h1>
			<p class="text-sm text-base-content/50 max-w-sm">
				Signals curated to your frequency. What's faint today may resonate tomorrow.
			</p>
		</div>

		<!--
			Filter chips: rounded-full pill style, active chip gets primary tint.
			No logic yet — visual prototype only. Clicking sets activeFilter but
			doesn't change the displayed data. That's intentional and correct for
			this phase.
		-->
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
	<!--
		Wrapped in os-surface so the whole section reads as a unified module.
		Layout: hero card (left, ~50%) + 2×2 grid of regular cards (right, ~50%).
		items-stretch on the grid makes hero card fill the height of the right column.
	-->
	<section>
		<div class="flex items-center justify-between mb-4">
			<div class="flex items-center gap-2">
				<div class="w-0.75 h-3.5 rounded-full bg-primary/60" aria-hidden="true"></div>
				<p class="text-xs font-semibold uppercase tracking-widest text-base-content/68">For You</p>
			</div>
			<a href="/discover" class="text-[11px] text-base-content/35 hover:text-base-content/65 transition-colors">
				See all →
			</a>
		</div>

		<div class="os-surface p-4">
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 items-stretch">

				<!-- Hero card: left column, stretches full height of right grid -->
				<div
					class="group relative rounded-xl overflow-hidden cursor-pointer os-hero-card border border-primary/20 hover:border-primary/38 transition-colors duration-300 flex flex-col"
					style="background-color: oklch(0.112 0.028 265 / 0.97); min-height: 280px;"
				>
					<!-- Art area: grows to fill available height -->
					<div class="relative flex-1 overflow-hidden min-h-36">
						<div class="absolute inset-0 bg-linear-to-br from-primary/28 via-primary/10 to-secondary/20"></div>
						<div class="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-black/45"></div>

						<!-- Signal rings: offset right, propagating outward -->
						<div class="absolute top-1/2 -translate-y-1/2 -right-8 pointer-events-none" aria-hidden="true">
							<svg class="w-56 h-56 text-primary" viewBox="0 0 224 224" fill="none">
								<circle cx="112" cy="112" r="16" fill="currentColor" opacity="0.20" />
								<circle cx="112" cy="112" r="44" stroke="currentColor" stroke-width="1.25" opacity="0.14" />
								<circle cx="112" cy="112" r="76" stroke="currentColor" stroke-width="1" opacity="0.09" />
								<circle cx="112" cy="112" r="108" stroke="currentColor" stroke-width="0.75" opacity="0.05" />
							</svg>
						</div>

						<!-- Faint primary bloom: illuminated depth at top-left -->
						<div
							class="absolute -top-4 -left-4 w-28 h-28 pointer-events-none"
							aria-hidden="true"
							style="background: radial-gradient(circle, oklch(0.55 0.18 265 / 0.18) 0%, transparent 70%);"
						></div>

						<!-- Pick badge -->
						<div class="absolute top-3 right-3">
							<span class="text-[10px] font-semibold tracking-wide text-primary/88 border border-primary/32 rounded-full px-2.5 py-1 bg-black/45 backdrop-blur-sm">
								Pick
							</span>
						</div>

						<!-- Genre chip: bottom-left, always visible -->
						<div class="absolute bottom-3 left-3">
							<span class="text-[10px] font-medium text-base-content/55 border border-white/10 rounded-full px-2 py-0.5 bg-black/35 backdrop-blur-sm">
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
					<div class="px-4 py-3.5 shrink-0 flex items-center justify-between gap-3">
						<div class="min-w-0">
							<p class="text-base font-semibold text-base-content/95 truncate tracking-tight">{featuredItem.title}</p>
							<p class="text-[11px] text-base-content/45 truncate mt-0.5">
								{featuredItem.artist} · {featuredItem.scouts} Scout{featuredItem.scouts === 1 ? '' : 's'}
							</p>
						</div>
						<button
							class="shrink-0 flex items-center gap-1.5 h-7 px-3 rounded-full text-[11px] font-medium text-accent/72 border border-accent/25 hover:text-accent hover:border-accent/50 hover:bg-accent/8 transition-all"
							aria-label="Amplify this signal"
						>
							<svg class="w-3 h-3 shrink-0" viewBox="0 0 12 12" fill="none" aria-hidden="true">
								<circle cx="6" cy="6" r="1.5" fill="currentColor" />
								<path d="M3.5 8.5a3.5 3.5 0 0 1 0-5" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" />
								<path d="M8.5 3.5a3.5 3.5 0 0 1 0 5" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" />
							</svg>
							Amplify
						</button>
					</div>
				</div>

				<!-- Regular cards: 2×2 grid in right column -->
				<div class="grid grid-cols-2 gap-3 content-start">
					{#each regularItems as item (item.id)}
						<div class="group relative rounded-lg p-3 space-y-2.5 cursor-pointer transition-all duration-200 bg-base-300/50 border border-white/6 hover:border-white/14 hover:bg-white/3">
							<div class="relative aspect-square w-full rounded-md bg-white/4 border border-white/5 overflow-hidden">
								<div class="absolute inset-0 bg-linear-to-br from-white/5 to-transparent"></div>
								<div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150">
									<div class="w-7 h-7 rounded-full bg-white/12 border border-white/20 text-base-content/80 flex items-center justify-center">
										<svg class="w-3 h-3 translate-x-px" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
											<path d="M3 2l8 4-8 4V2z" />
										</svg>
									</div>
								</div>
							</div>
							<div>
								<p class="text-[13px] font-medium text-base-content/80 truncate leading-snug">{item.title}</p>
								<p class="text-[11px] text-base-content/38 truncate mt-0.5">
									{item.artist} · {item.genre}
								</p>
							</div>
						</div>
					{/each}
				</div>

			</div>
		</div>
	</section>

	<!-- ── Gaining Resonance ────────────────────────────────── -->
	<!--
		No os-surface wrapper — horizontal strip sits bare against the page.
		Intentional rhythm break from the paneled For You section above.
		Horizontal scroll with shrink-0 cards: scales to any number of items.
		-mx-5 px-5 makes the scroll extend to viewport edges while keeping
		the section header aligned with the page grid.
	-->
	<section>
		<div class="flex items-center justify-between mb-4">
			<div class="flex items-center gap-2">
				<div class="w-0.75 h-3.5 rounded-full bg-success/55" aria-hidden="true"></div>
				<p class="text-xs font-semibold uppercase tracking-widest text-base-content/68">Gaining Resonance</p>
			</div>
			<span class="text-[11px] text-base-content/28">Scouts are accumulating</span>
		</div>

		<div class="flex gap-3 overflow-x-auto -mx-5 px-5 pb-1">
			{#each gainingItems as item (item.id)}
				<div class="group shrink-0 w-40 rounded-lg bg-base-300/45 border border-white/6 hover:border-white/12 hover:bg-white/3 p-3 cursor-pointer transition-all duration-150">

					<!-- Art area: square, smaller than For You cards -->
					<div class="relative w-full aspect-square rounded-md bg-white/4 border border-white/5 overflow-hidden mb-2.5">
						<div class="absolute inset-0 bg-linear-to-br from-white/5 to-transparent"></div>
						<div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150">
							<div class="w-6 h-6 rounded-full bg-white/12 border border-white/18 text-base-content/75 flex items-center justify-center">
								<svg class="w-2.5 h-2.5 translate-x-px" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
									<path d="M3 2l8 4-8 4V2z" />
								</svg>
							</div>
						</div>
					</div>

					<p class="text-[12px] font-medium text-base-content/80 truncate leading-snug">{item.title}</p>
					<p class="text-[11px] text-base-content/38 truncate mt-0.5">{item.artist}</p>

					<!--
						Growth badge: surging (green/success) vs rising (teal/accent).
						The color communicates velocity — surging is faster, rising is steady.
						Small inline-flex pill so it doesn't overwhelm the card.
					-->
					<div class="mt-2">
						<span
							class={[
								'inline-flex items-center gap-1 text-[10px] font-semibold rounded-full px-2 py-0.5 border',
								item.trend === 'surging'
									? 'text-success/88 bg-success/8 border-success/22'
									: 'text-accent/85 bg-accent/8 border-accent/20',
							]}
						>
							<svg class="w-2 h-2 shrink-0" viewBox="0 0 8 8" fill="currentColor" aria-hidden="true">
								<path d="M4 1L7 5H1L4 1z" />
							</svg>
							{item.growth} this week
						</span>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- ── Weak Signals ─────────────────────────────────────── -->
	<!--
		os-surface wrapper groups the list as a unified panel.
		divide-y inside: row separators without explicit margins — the
		Tailwind divide-* utilities add borders between sibling elements.
	-->
	<section>
		<div class="flex items-center justify-between mb-4">
			<div class="flex items-center gap-2">
				<div class="w-0.75 h-3.5 rounded-full bg-base-content/22" aria-hidden="true"></div>
				<p class="text-xs font-semibold uppercase tracking-widest text-base-content/55">Weak Signals</p>
			</div>
			<span class="text-[11px] text-base-content/28">What almost nobody is hearing yet</span>
		</div>

		<div class="os-surface divide-y divide-white/4 overflow-hidden">
			{#each weakSignals as item (item.id)}
				<div class="group flex items-center gap-3 px-4 py-3 hover:bg-white/3 transition-colors duration-150 cursor-pointer">
					<div class="w-7 h-7 rounded-md bg-white/4 border border-white/5 shrink-0 flex items-center justify-center">
						<div class="w-1.5 h-1.5 rounded-full bg-white/15 group-hover:bg-primary/40 transition-colors duration-200"></div>
					</div>
					<div class="flex-1 min-w-0">
						<p class="text-[13px] font-medium text-base-content/75 truncate">{item.title}</p>
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
	<!--
		No surface wrapper — editorial cards float freely.
		Text-forward design: no art placeholder, just an accent bar + copy.
		These are "discovered artifacts" not playable items, so no play overlay.
		Italic editorial note is the distinguishing feature.
	-->
	<section>
		<div class="flex items-center justify-between mb-4">
			<div class="flex items-center gap-2">
				<div class="w-0.75 h-3.5 rounded-full bg-secondary/45" aria-hidden="true"></div>
				<p class="text-xs font-semibold uppercase tracking-widest text-base-content/55">Deep Field</p>
			</div>
			<span class="text-[11px] text-base-content/28">Origin stories. Almost undiscovered.</span>
		</div>

		<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
			{#each deepFieldItems as item (item.id)}
				<!--
					Left accent bar (self-stretch div inside flex) gives each card
					a secondary-tinted vertical line — distinct from primary used
					in For You, reinforcing section identity through color.
				-->
				<div class="group flex gap-3.5 rounded-lg p-4 cursor-pointer bg-base-300/38 border border-white/5 hover:border-white/10 hover:bg-white/3 transition-all duration-150">
					<div class="shrink-0 w-0.5 rounded-full bg-secondary/32 self-stretch group-hover:bg-secondary/55 transition-colors duration-200" aria-hidden="true"></div>
					<div class="flex-1 min-w-0">
						<p class="text-[13px] font-semibold text-base-content/85 truncate">{item.title}</p>
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
