<script lang="ts">
	// Top bar: logo + wordmark on left, notifications + avatar on right.
	// Nav items moved to Sidebar — this component is now purely chrome.
</script>

<!--
	os-surface-raised handles backdrop blur, rim highlight, and shadow.
	border-b replaces the underside shadow separation — cleaner against
	the sidebar which also has a right border.
-->
<header class="os-surface-raised fixed top-0 left-0 right-0 z-50 h-14 border-b border-white/6">
	<div class="h-full flex items-center justify-between px-5">

		<!-- Logo + wordmark -->
		<a href="/" class="flex items-center gap-2.5 group">
			<svg
				class="w-4.5 h-4.5 text-primary shrink-0"
				viewBox="0 0 18 18"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
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
			<!--
				Notification bell with an unread dot.
				The dot uses accent color — distinct from primary, draws the eye
				without competing with the logo or nav.
			-->
			<button
				class="relative w-8 h-8 flex items-center justify-center rounded-lg text-base-content/42 hover:text-base-content/80 hover:bg-white/5 transition-all"
				aria-label="Notifications"
			>
				<svg class="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
					<path d="M8 2a4.5 4.5 0 0 0-4.5 4.5v2.25L2 10.5h12l-1.5-1.75V6.5A4.5 4.5 0 0 0 8 2z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round" />
					<path d="M6.5 11.5a1.5 1.5 0 0 0 3 0" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
				</svg>
				<!-- Unread indicator dot -->
				<span
					class="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-accent"
					aria-hidden="true"
				></span>
			</button>

			<div
				class="w-7 h-7 rounded-full bg-primary/10 border border-primary/25 flex items-center justify-center text-[11px] font-semibold text-primary/75 select-none cursor-pointer hover:border-primary/45 transition-colors"
				role="button"
				tabindex="0"
				aria-label="User profile"
			>
				D
			</div>
		</div>

	</div>
</header>
