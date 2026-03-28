<script lang="ts">
	import { page } from '$app/state';

	const navItems = [
		{ href: '/', label: 'Home' },
		{ href: '/discover', label: 'Discover' },
		{ href: '/feed', label: 'Feed' },
	];
</script>

<!--
	os-surface-raised handles all the elevation:
	- deep backdrop blur
	- inset top highlight (the "rim light")
	- drop shadow + primary bloom beneath

	The border-b is removed — the box-shadow provides enough
	visual separation and feels more premium than a hard line.
-->
<header class="os-surface-raised fixed top-0 left-0 right-0 z-50 h-16">
	<div class="max-w-5xl mx-auto h-full flex items-center justify-between px-5">

		<!-- Logo: signal mark + wordmark -->
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

		<!-- Desktop nav -->
		<nav class="hidden md:flex items-center gap-0.5" aria-label="Main navigation">
			{#each navItems as item (item.href)}
				{@const isActive = page.url.pathname === item.href}
				<a
					href={item.href}
					class={[
						'relative px-3.5 py-1.5 text-[13px] rounded-lg transition-all duration-150',
						isActive
							? 'text-base-content/95 font-medium bg-white/6'
							: 'text-base-content/55 hover:text-base-content/82 hover:bg-white/5',
					]}
				>
					{item.label}
					{#if isActive}
						<!--
							Active dot: a faint primary signal beneath the label.
							Kept very small — a whisper, not a highlight.
						-->
						<span
							class="absolute bottom-1.25 left-1/2 -translate-x-1/2 w-0.75 h-0.75 rounded-full bg-primary/70"
							aria-hidden="true"
						></span>
					{/if}
				</a>
			{/each}
		</nav>

		<!-- Right: search + avatar -->
		<div class="flex items-center gap-1">
			<button
				class="w-8 h-8 flex items-center justify-center rounded-lg text-base-content/42 hover:text-base-content/80 hover:bg-white/5 transition-all"
				aria-label="Search"
			>
				<svg class="w-3.75 h-3.75" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
					<circle cx="6.5" cy="6.5" r="4" stroke="currentColor" stroke-width="1.25" />
					<path d="M10 10L13 13" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" />
				</svg>
			</button>

			<!--
				Avatar: uses primary at very low opacity for a faint signal-indigo tint.
				The border at primary/25 gives it a subtle "selected" feel.
			-->
			<div
				class="w-7 h-7 rounded-full bg-primary/10 border border-primary/25 flex items-center justify-center text-[11px] font-semibold text-primary/75 select-none"
				role="img"
				aria-label="User profile"
			>
				D
			</div>
		</div>

	</div>
</header>
