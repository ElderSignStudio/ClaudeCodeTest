<script lang="ts">
	import { Bell } from 'lucide-svelte';
	import { currentUser } from '$lib/mock/currentUser';
</script>

<header class="os-surface-raised fixed top-0 left-0 right-0 z-50 h-14 border-b border-white/6" style="background-color: transparent; backdrop-filter: none; -webkit-backdrop-filter: none; box-shadow: none;">
	<div class="h-full flex items-center justify-between pl-4 pr-5">

		<!-- Logo -->
		<!-- -ml-8: compensates for the PNG's built-in transparent left padding -->
		<a href="/" class="shrink-0 -ml-13">
			<img
				src="/logo/Outer Signal Logo 2.png"
				alt="Outer Signal"
				class="h-45 w-auto mt-3"
			/>
		</a>

		<!-- Right: notification bell + avatar -->
		<div class="flex items-center gap-2">
			<button
				class="relative w-8 h-8 flex items-center justify-center rounded-lg text-base-content/55 hover:text-base-content/85 hover:bg-white/5 transition-all"
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
					src={currentUser.avatarUrl}
					alt={currentUser.name}
					class="w-full h-full object-cover"
				/>
			</div>
		</div>

	</div>
</header>
