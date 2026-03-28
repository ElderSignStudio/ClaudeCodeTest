<script lang="ts">
	let isPlaying = $state(false);
</script>

<div class="fixed bottom-0 left-0 right-0 z-50">

	<!--
		Progress bar: slightly taller than before (3px) so it reads
		as a real track indicator, not just a separator.
		The primary-colored fill animates on transition.
	-->
	<div class="h-0.75 bg-white/3">
		<div class="h-full w-0 bg-primary/65 rounded-r-full transition-all duration-300"></div>
	</div>

	<!--
		os-surface-raised provides the elevation:
		- 92% opaque background (slightly lower than header for hierarchy)
		- strong underside shadow
		- inset rim highlight
		- faint primary bloom

		No border-radius here — it sits flush to the viewport edge.
		The shadow creates separation instead.
	-->
	<div class="os-surface-raised rounded-none border-0 h-17">
		<div class="max-w-5xl mx-auto h-full flex items-center gap-4 px-5">

			<!-- Album art placeholder -->
			<div class="w-10 h-10 rounded-lg bg-base-300/60 border border-white/8 shrink-0 flex items-center justify-center">
				<!--
					Music note icon — placeholder until real art is wired.
					Very faint so it doesn't draw attention away from the controls.
				-->
				<svg class="w-4 h-4 text-base-content/25" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
					<path d="M6 3.5v7a2 2 0 1 1-1-1.73V5.5l5-1.5V10a2 2 0 1 1-1-1.73V4L6 3.5z" />
				</svg>
			</div>

			<!-- Track info -->
			<div class="flex-1 min-w-0">
				<p class="text-[13px] font-medium truncate text-base-content/80 leading-snug tracking-tight">
					Nothing playing
				</p>
				<p class="text-[11px] text-base-content/42 truncate mt-px leading-snug">
					Select a signal to begin
				</p>
			</div>

			<!-- Playback controls -->
			<div class="flex items-center gap-1 shrink-0">

				<button
					class="w-8 h-8 flex items-center justify-center rounded-lg text-base-content/42 hover:text-base-content/80 hover:bg-white/5 transition-all"
					aria-label="Previous"
				>
					<svg class="w-3.75 h-3.75" viewBox="0 0 15 15" fill="currentColor" aria-hidden="true">
						<rect x="2.5" y="2.5" width="1.5" height="10" rx="0.75" />
						<path d="M5.5 7.5L12 3.5v8l-6.5-4z" />
					</svg>
				</button>

				<!--
					Play/pause: combines os-play-glow with bg-primary/12 + border.
					The glow is *off by default*, applied on hover + when playing.
					This keeps the idle state calm but makes it feel alive when active.
				-->
				<!--
					Play button is larger (w-10) than prev/next (w-8) — a deliberate
					size hierarchy. It is the most important single target in the player.
					Resting state uses more saturated fill (/15 → /20) so it's clearly
					identifiable even without interaction.
					Playing state gets a stronger glow — the UI "pulses" when active.
				-->
				<button
					class={[
						'w-10 h-10 flex items-center justify-center rounded-full border text-primary transition-all duration-200',
						isPlaying
							? 'bg-primary/22 border-primary/50 os-play-glow'
							: 'bg-primary/15 border-primary/32 hover:bg-primary/22 hover:border-primary/48 hover:os-play-glow',
					]}
					aria-label={isPlaying ? 'Pause' : 'Play'}
					onclick={() => (isPlaying = !isPlaying)}
				>
					{#if isPlaying}
						<svg class="w-3.25 h-3.25" viewBox="0 0 13 13" fill="currentColor" aria-hidden="true">
							<rect x="2" y="1.5" width="3" height="10" rx="1" />
							<rect x="8" y="1.5" width="3" height="10" rx="1" />
						</svg>
					{:else}
						<svg class="w-3.25 h-3.25 translate-x-px" viewBox="0 0 13 13" fill="currentColor" aria-hidden="true">
							<path d="M2.5 2l9 4.5-9 4.5V2z" />
						</svg>
					{/if}
				</button>

				<button
					class="w-8 h-8 flex items-center justify-center rounded-lg text-base-content/42 hover:text-base-content/80 hover:bg-white/5 transition-all"
					aria-label="Next"
				>
					<svg class="w-3.75 h-3.75" viewBox="0 0 15 15" fill="currentColor" aria-hidden="true">
						<rect x="11" y="2.5" width="1.5" height="10" rx="0.75" />
						<path d="M9.5 7.5L3 3.5v8l6.5-4z" />
					</svg>
				</button>

			</div>

			<!-- Right: Amplify + Volume — hidden on mobile -->
			<div class="hidden sm:flex items-center gap-2 shrink-0 pl-3 border-l border-white/6">

				<button
					class="flex items-center gap-1.5 h-7 px-3 rounded-full text-[11px] font-medium text-primary/70 border border-primary/28 hover:text-primary hover:border-primary/55 hover:bg-primary/8 transition-all"
					aria-label="Amplify this signal"
				>
					<svg class="w-3 h-3 shrink-0" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
						<circle cx="6" cy="6" r="1.5" fill="currentColor" />
						<path d="M3.5 8.5a3.5 3.5 0 0 1 0-5" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" />
						<path d="M8.5 3.5a3.5 3.5 0 0 1 0 5" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" />
					</svg>
					Amplify
				</button>

				<button
					class="w-8 h-8 flex items-center justify-center rounded-lg text-base-content/42 hover:text-base-content/80 hover:bg-white/5 transition-all"
					aria-label="Volume"
				>
					<svg class="w-3.5 h-3.5" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
						<path d="M1.5 5v4h2L7 11V3L3.5 5H1.5z" />
						<path d="M9.5 4.5c1 .75 1.5 1.5 1.5 2.5s-.5 1.75-1.5 2.5" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" fill="none" />
					</svg>
				</button>

			</div>

		</div>
	</div>
</div>
