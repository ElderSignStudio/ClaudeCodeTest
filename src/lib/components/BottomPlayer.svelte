<script lang="ts">
	let isPlaying = $state(false);
</script>

<div class="fixed bottom-0 left-0 right-0 z-50 h-20 bg-base-100 border-t border-base-200">
	<div class="max-w-5xl mx-auto h-full flex items-center gap-4 px-4">

		<!-- Album art placeholder -->
		<div class="w-11 h-11 rounded bg-base-300 shrink-0"></div>

		<!-- Track info -->
		<div class="flex-1 min-w-0">
			<p class="text-sm font-medium truncate text-base-content">Nothing playing</p>
			<p class="text-xs text-base-content/40 truncate">—</p>
		</div>

		<!-- Playback controls -->
		<div class="flex items-center gap-2 shrink-0">
			<!-- Previous -->
			<button class="btn btn-ghost btn-sm btn-circle" aria-label="Previous">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
					<path d="M6 6h2v12H6V6zm3.5 6 8.5 6V6L9.5 12z"/>
				</svg>
			</button>

			<!-- Play / Pause -->
			<button
				class="btn btn-primary btn-sm btn-circle"
				aria-label={isPlaying ? 'Pause' : 'Play'}
				onclick={() => (isPlaying = !isPlaying)}
			>
				{#if isPlaying}
					<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
						<rect x="6" y="4" width="4" height="16" rx="1"/>
						<rect x="14" y="4" width="4" height="16" rx="1"/>
					</svg>
				{:else}
					<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
						<path d="M8 5v14l11-7z"/>
					</svg>
				{/if}
			</button>

			<!-- Next -->
			<button class="btn btn-ghost btn-sm btn-circle" aria-label="Next">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
					<path d="M6 18l8.5-6L6 6v12zm2.5-6 5.5 3.9V8.1L8.5 12zM16 6h2v12h-2V6z"/>
				</svg>
			</button>
		</div>

	</div>
</div>
