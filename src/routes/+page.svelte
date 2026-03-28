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
		{ id: 'dust-choir',  title: 'Dust Choir',  artist: 'Mare Internum',   scouts: 1 },
		{ id: 'neon-veda',   title: 'Neon Veda',   artist: '3 Scouts',        scouts: 3 },
		{ id: 'orbital-form', title: 'Orbital Form', artist: 'Ultra Obscure', scouts: 0 },
	];
</script>

<div class="max-w-5xl mx-auto px-5 py-10 space-y-8">

	<!-- ── Page heading ─────────────────────────────────────────── -->
	<!--
		Larger than before (text-2xl vs text-xl) — the heading must
		clearly anchor the view and tell the user where they are.
		The subtitle is copy that belongs to Outer Signal's voice.
	-->
	<div class="space-y-1">
		<h1 class="text-2xl font-semibold tracking-tight text-base-content/92">Home</h1>
		<p class="text-[13px] text-base-content/48">Find what's still faint — signals just starting to resonate.</p>
	</div>

	<!-- ── For You lane ─────────────────────────────────────────── -->
	<div class="os-surface p-5">
		<!--
			Section header row: label left, "See all" right.
			This pattern immediately communicates the section is
			navigable — a discovery product cue, not a dashboard cue.
			Label is weight-600 and slightly larger (text-[12px] vs [11px]).
		-->
		<div class="flex items-center justify-between mb-5">
			<p class="text-[12px] font-semibold uppercase tracking-widest text-base-content/55">For You</p>
			<a
				href="/discover"
				class="text-[11px] text-base-content/35 hover:text-base-content/65 transition-colors"
			>
				See all →
			</a>
		</div>

		<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
			{#each forYouItems as item (item.id)}
				<!--
					group: enables group-hover: children to respond to card hover.
					Featured card (i=0): primary-tinted border instead of white.
					  This is the ONLY card that uses accent color — it signals
					  "this is the recommended starting point."
					Non-featured cards: neutral white border.
					All cards: brighten border + subtle fill on hover.
					cursor-pointer: communicates interactivity clearly.
				-->
				<div
					class={[
						'group relative rounded-lg p-3 space-y-2.5 cursor-pointer transition-all duration-200',
						item.featured
							? 'bg-primary/6 border border-primary/22 hover:border-primary/38 hover:bg-primary/10'
							: 'bg-base-300/50 border border-white/6 hover:border-white/14 hover:bg-white/3',
					]}
				>
					<!--
						Art placeholder with play overlay.
						The overlay is invisible at rest, appears on group-hover.
						This is the core "alive" signal for cards.
					-->
					<div class="relative aspect-square w-full rounded-md bg-white/4 border border-white/5 overflow-hidden">
						{#if item.featured}
							<!--
								Featured art gets a faint primary tint in the background —
								a very subtle signal that this item has more presence.
							-->
							<div class="absolute inset-0 bg-primary/5"></div>
						{/if}
						<!--
							Play button overlay — appears on hover only.
							This transitions the card from "static info" to "playable object."
						-->
						<div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150">
							<div class={[
								'w-7 h-7 rounded-full border flex items-center justify-center',
								item.featured
									? 'bg-primary/25 border-primary/45 text-primary'
									: 'bg-white/12 border-white/20 text-base-content/80',
							]}>
								<svg class="w-3 h-3 translate-x-px" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
									<path d="M3 2l8 4-8 4V2z" />
								</svg>
							</div>
						</div>
					</div>

					<!--
						Featured card: title at /95 (primary text level).
						Non-featured: title at /78 (secondary level).
						This single opacity shift is enough to establish priority
						without using color or size difference.
					-->
					<div>
						<p class={[
							'text-[12px] font-medium truncate leading-snug',
							item.featured ? 'text-base-content/92' : 'text-base-content/78',
						]}>
							{item.title}
						</p>
						<p class="text-[11px] text-base-content/38 truncate mt-0.5">
							{item.artist} · {item.scouts} Scout{item.scouts === 1 ? '' : 's'}
						</p>
					</div>
				</div>
			{/each}
		</div>
	</div>

	<!-- ── Weak Signals lane ─────────────────────────────────────── -->
	<div class="os-surface p-5">
		<div class="flex items-center justify-between mb-5">
			<p class="text-[12px] font-semibold uppercase tracking-widest text-base-content/55">Weak Signals</p>
			<span class="text-[11px] text-base-content/28">What almost nobody is hearing yet</span>
		</div>

		<!--
			Horizontal list layout instead of a grid — different from the
			card grid above, creating visual rhythm between sections.
			Each row is a simpler, more stripped-down item.
		-->
		<div class="space-y-px">
			{#each weakSignals as item (item.id)}
				<div class="group flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-white/4 transition-colors duration-150 cursor-pointer">
					<!-- Art thumbnail — even smaller for this "faint signal" aesthetic -->
					<div class="w-8 h-8 rounded-md bg-white/4 border border-white/5 shrink-0 flex items-center justify-center">
						<div class="w-2 h-2 rounded-full bg-white/15 group-hover:bg-primary/40 transition-colors duration-200"></div>
					</div>

					<div class="flex-1 min-w-0">
						<p class="text-[12px] font-medium text-base-content/75 truncate">{item.title}</p>
						<p class="text-[11px] text-base-content/35 truncate">{item.artist}</p>
					</div>

					<!-- Scout count — tertiary metadata, right-aligned -->
					<p class="text-[11px] text-base-content/28 shrink-0">
						{item.scouts === 0 ? 'No scouts yet' : `${item.scouts} Scout${item.scouts === 1 ? '' : 's'}`}
					</p>
				</div>
			{/each}
		</div>
	</div>

</div>
