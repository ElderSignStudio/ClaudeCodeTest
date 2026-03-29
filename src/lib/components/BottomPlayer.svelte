<script lang="ts">
	import { SkipBack, SkipForward, Play, Pause, Volume2, Radio } from 'lucide-svelte';

	let isPlaying = $state(false);
</script>

<div class="fixed bottom-0 left-0 right-0 z-50">

	<!-- Progress bar -->
	<div class="h-0.75 bg-white/3">
		<div class="h-full w-0 bg-primary/65 rounded-r-full transition-all duration-300"></div>
	</div>

	<div class="os-surface-raised rounded-none border-0 h-17">
		<div class="max-w-5xl mx-auto h-full flex items-center gap-4 px-5 md:pl-61">

			<!-- Album art: real image when playing, placeholder when idle -->
			<div class="w-10 h-10 rounded-lg border border-white/8 shrink-0 overflow-hidden">
				<img
					src="https://picsum.photos/seed/bottom-player/80/80"
					alt=""
					class="w-full h-full object-cover opacity-40"
				/>
			</div>

			<!-- Track info -->
			<div class="flex-1 min-w-0">
				<p class="text-[13px] font-semibold truncate text-base-content/80 leading-snug tracking-tight">
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
					<SkipBack size={14} />
				</button>

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
						<Pause size={13} fill="currentColor" />
					{:else}
						<Play size={13} fill="currentColor" class="translate-x-px" />
					{/if}
				</button>

				<button
					class="w-8 h-8 flex items-center justify-center rounded-lg text-base-content/42 hover:text-base-content/80 hover:bg-white/5 transition-all"
					aria-label="Next"
				>
					<SkipForward size={14} />
				</button>

			</div>

			<!-- Right: Amplify + Volume — hidden on mobile -->
			<div class="hidden sm:flex items-center gap-2 shrink-0 pl-3 border-l border-white/6">

				<button
					class="flex items-center gap-1.5 h-7 px-3 rounded-full text-[11px] font-medium text-primary/70 border border-primary/28 hover:text-primary hover:border-primary/55 hover:bg-primary/8 transition-all"
					aria-label="Amplify this signal"
				>
					<!--
						Amplify uses the custom signal/radio icon — it's a product action,
						not a generic UI action, so it keeps its bespoke icon.
						Radio from Lucide is close enough for the player context.
					-->
					<Radio size={11} />
					Amplify
				</button>

				<button
					class="w-8 h-8 flex items-center justify-center rounded-lg text-base-content/42 hover:text-base-content/80 hover:bg-white/5 transition-all"
					aria-label="Volume"
				>
					<Volume2 size={14} />
				</button>

			</div>

		</div>
	</div>
</div>
