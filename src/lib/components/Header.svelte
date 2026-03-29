<script lang="ts">
	import { Bell } from 'lucide-svelte';
</script>

<header class="os-surface-raised fixed top-0 left-0 right-0 z-50 h-14 border-b border-white/6">
	<div class="h-full flex items-center justify-between px-5">

		<!-- Logo + wordmark -->
		<a href="/" class="flex items-center gap-2.5 group">
			<svg
				class="w-4.5 h-4.5 text-primary shrink-0"
				viewBox="0 0 18 18"
				fill="none"
				aria-hidden="true"
			>
				<circle cx="9" cy="9" r="2.5" fill="currentColor" />
				<circle cx="9" cy="9" r="5.5" stroke="currentColor" stroke-width="1" opacity="0.45" />
				<circle cx="9" cy="9" r="8.5" stroke="currentColor" stroke-width="0.75" opacity="0.18" />
			</svg>
			<span class="text-[13px] font-semibold tracking-[0.14em] uppercase text-base-content/82 group-hover:text-base-content transition-colors">
				Outer Signal
			</span>
		</a>

		<!-- Right: notification bell + avatar -->
		<div class="flex items-center gap-2">
			<button
				class="relative w-8 h-8 flex items-center justify-center rounded-lg text-base-content/42 hover:text-base-content/80 hover:bg-white/5 transition-all"
				aria-label="Notifications"
			>
				<Bell size={15} />
				<span class="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-accent" aria-hidden="true"></span>
			</button>

			<!--
				DiceBear avatar: deterministic SVG based on seed.
				Renders as <img> so it degrades gracefully if the CDN is unavailable.
				The border + bg remain visible either way.
			-->
			<div
				class="w-7 h-7 rounded-full border border-primary/30 overflow-hidden cursor-pointer hover:border-primary/52 transition-colors shrink-0"
				role="button"
				tabindex="0"
				aria-label="User profile"
			>
				<img
					src="https://api.dicebear.com/9.x/thumbs/svg?seed=DanOuter&backgroundColor=1e1b4b"
					alt="Dan"
					class="w-full h-full object-cover"
				/>
			</div>
		</div>

	</div>
</header>
