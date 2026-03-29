<script lang="ts">
	/*
		Placeholder data shaped like real data.
		Each item has the fields a real backend would return —
		making it trivial to swap this array for a load() call later.
	*/
	const forYouItems = [
		{ id: 'frozen-sun',          title: 'Frozen Sun',          artist: 'Obscure Slovenian Band', scouts: 1,  featured: true },
		{ id: 'night-forest',        title: 'Night Forest',        artist: 'Album',                  scouts: 53, featured: false },
		{ id: 'wolves-under-glass',  title: 'Wolves Under Glass',  artist: 'Aesthian Ritual',        scouts: 7,  featured: false },
		{ id: 'ashes-in-snow',       title: 'Ashes in Snow',       artist: 'Demo',                   scouts: 12, featured: false },
	];

	const weakSignals = [
		{ id: 'dust-choir',   title: 'Dust Choir',   artist: 'Mare Internum',  scouts: 1 },
		{ id: 'neon-veda',    title: 'Neon Veda',    artist: '3 Scouts',       scouts: 3 },
		{ id: 'orbital-form', title: 'Orbital Form', artist: 'Ultra Obscure',  scouts: 0 },
	];
</script>

<div class="max-w-5xl mx-auto px-5 py-10 space-y-10">

	<!-- ── Page heading ─────────────────────────────────────────── -->
	<!--
		Signal horizon: a 1px gradient line before the eyebrow — creates
		an "entry moment" without any visible decoration element.
		It reads as light catching the edge of the page before content begins.
	-->
	<div class="space-y-3">
		<div class="h-px w-24 bg-linear-to-r from-primary/50 to-transparent rounded-full" aria-hidden="true"></div>
		<div class="space-y-2">
			<div class="flex items-center gap-1.5">
				<svg class="w-2.5 h-2.5 text-primary/55 shrink-0" viewBox="0 0 10 10" fill="none" aria-hidden="true">
					<circle cx="5" cy="5" r="1.5" fill="currentColor" />
					<circle cx="5" cy="5" r="3.75" stroke="currentColor" stroke-width="0.75" opacity="0.55" />
				</svg>
				<span class="text-[11px] font-medium uppercase tracking-widest text-primary/55">Your Signal</span>
			</div>
			<h1 class="text-3xl font-bold tracking-tight text-base-content/95">Home</h1>
			<p class="text-sm text-base-content/55 max-w-sm">Find what's still faint — signals just starting to resonate.</p>
		</div>
	</div>

	<!-- ── For You lane ─────────────────────────────────────────── -->
	<div class="os-surface p-5">
		<div class="flex items-center justify-between mb-5">
			<div class="flex items-center gap-2">
				<div class="w-0.75 h-3.5 rounded-full bg-primary/60" aria-hidden="true"></div>
				<p class="text-xs font-semibold uppercase tracking-widest text-base-content/68">For You</p>
			</div>
			<a
				href="/discover"
				class="text-[11px] text-base-content/35 hover:text-base-content/65 transition-colors"
			>
				See all →
			</a>
		</div>

		<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
			{#each forYouItems as item (item.id)}
				{#if item.featured}
					<!--
						Hero card: full restructure from prior approach.

						Key structural change: no padding on the card itself.
						The art area is full-bleed top/sides — fills edge to edge.
						Info section has its own padding below the art.
						This makes it read as a content object, not a padded container.

						os-hero-card: primary-tinted ambient shadow from app.css —
						lifts the card off the surface with a glow that intensifies on hover.

						Signal rings: now centered vertically in the art area (not clipped
						at corner) so they feel composed, not decorative overflow.
						Three rings at different opacities create the "signal propagating" effect.

						Pick badge: lives inside the art area, top-right, with backdrop-blur
						so it reads as an editorial stamp on the content.

						Amplify button: surfaces the core product action in the info row —
						gives the hero card a clear CTA without hover-gating it.

						Play overlay still appears on hover — the two don't conflict because
						Amplify is always visible while Play only appears on hover.
					-->
					<div
						class="col-span-2 group relative rounded-xl overflow-hidden cursor-pointer os-hero-card border border-primary/22 hover:border-primary/42 transition-colors duration-300 bg-oklch-surface"
						style="background-color: oklch(0.115 0.028 265 / 0.95);"
					>
						<!-- Art area: full-bleed, no side padding -->
						<div class="relative w-full h-40 overflow-hidden">
							<!-- Atmospheric gradient wash -->
							<div class="absolute inset-0 bg-linear-to-br from-primary/25 via-primary/8 to-secondary/18"></div>
							<!-- Subtle noise/texture illusion via layered gradients -->
							<div class="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent"></div>

							<!-- Signal rings — centered, composed, not clipped -->
							<div class="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
								<svg class="w-52 h-52 text-primary" viewBox="0 0 208 208" fill="none">
									<circle cx="104" cy="104" r="14" fill="currentColor" opacity="0.18" />
									<circle cx="104" cy="104" r="38" stroke="currentColor" stroke-width="1.25" opacity="0.13" />
									<circle cx="104" cy="104" r="66" stroke="currentColor" stroke-width="1" opacity="0.09" />
									<circle cx="104" cy="104" r="96" stroke="currentColor" stroke-width="0.75" opacity="0.06" />
								</svg>
							</div>

							<!-- Pick badge: inside art, top-right, editorial stamp -->
							<div class="absolute top-3 right-3">
								<span class="text-[10px] font-semibold text-primary/90 border border-primary/35 rounded-full px-2.5 py-1 bg-black/40 backdrop-blur-sm">
									Pick
								</span>
							</div>

							<!-- Play overlay on hover -->
							<div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
								<div class="w-11 h-11 rounded-full bg-primary/28 border border-primary/50 text-primary flex items-center justify-center os-play-glow">
									<svg class="w-4 h-4 translate-x-px" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
										<path d="M3 2l8 4-8 4V2z" />
									</svg>
								</div>
							</div>
						</div>

						<!-- Info section: padded, sits below full-bleed art -->
						<div class="px-4 py-3.5 flex items-center justify-between gap-3">
							<div class="min-w-0">
								<p class="text-[15px] font-semibold text-base-content/95 truncate tracking-tight">{item.title}</p>
								<p class="text-[11px] text-base-content/45 truncate mt-0.5">
									{item.artist} · {item.scouts} Scout{item.scouts === 1 ? '' : 's'}
								</p>
							</div>
							<!--
								Amplify: always visible in hero, not hover-gated.
								The hero card's CTA should be reachable without hovering.
								Uses accent color (teal-blue) instead of primary to avoid
								competing with the primary-tinted art area above.
							-->
							<button
								class="shrink-0 flex items-center gap-1.5 h-7 px-3 rounded-full text-[11px] font-medium text-accent/75 border border-accent/28 hover:text-accent hover:border-accent/52 hover:bg-accent/8 transition-all"
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
				{:else}
					<!--
						Regular cards: simpler, clearly subordinate to the hero.
						The contrast is achieved by what they DON'T have:
						no glow, no full-bleed art, no visible CTA.
						They recede to support the hero's dominance.
					-->
					<div
						class="group relative rounded-lg p-3 space-y-2.5 cursor-pointer transition-all duration-200 bg-base-300/50 border border-white/6 hover:border-white/14 hover:bg-white/3"
					>
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
							<p class="text-[13px] font-medium text-base-content/80 truncate leading-snug">
								{item.title}
							</p>
							<p class="text-[11px] text-base-content/38 truncate mt-0.5">
								{item.artist} · {item.scouts} Scout{item.scouts === 1 ? '' : 's'}
							</p>
						</div>
					</div>
				{/if}
			{/each}
		</div>
	</div>

	<!-- ── Weak Signals lane ─────────────────────────────────────── -->
	<!--
		Accent bar uses base-content/22 (muted) vs primary/60 above —
		the tonal contrast between bars reinforces the section hierarchy.
	-->
	<div class="os-surface p-5">
		<div class="flex items-center justify-between mb-5">
			<div class="flex items-center gap-2">
				<div class="w-0.75 h-3.5 rounded-full bg-base-content/22" aria-hidden="true"></div>
				<p class="text-xs font-semibold uppercase tracking-widest text-base-content/55">Weak Signals</p>
			</div>
			<span class="text-[11px] text-base-content/28">What almost nobody is hearing yet</span>
		</div>

		<div class="space-y-px">
			{#each weakSignals as item (item.id)}
				<div class="group flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-white/4 transition-colors duration-150 cursor-pointer">
					<div class="w-8 h-8 rounded-md bg-white/4 border border-white/5 shrink-0 flex items-center justify-center">
						<div class="w-2 h-2 rounded-full bg-white/15 group-hover:bg-primary/40 transition-colors duration-200"></div>
					</div>
					<div class="flex-1 min-w-0">
						<p class="text-[13px] font-medium text-base-content/75 truncate">{item.title}</p>
						<p class="text-[11px] text-base-content/35 truncate">{item.artist}</p>
					</div>
					<p class="text-[11px] text-base-content/28 shrink-0">
						{item.scouts === 0 ? 'No scouts yet' : `${item.scouts} Scout${item.scouts === 1 ? '' : 's'}`}
					</p>
				</div>
			{/each}
		</div>
	</div>

</div>
