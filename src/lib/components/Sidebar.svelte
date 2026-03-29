<script lang="ts">
	import { page } from '$app/state';

	/*
		Nav items typed explicitly so adding items later is just adding
		an object to the array — no other changes needed.
		icon: inline SVG path data, keeps the component self-contained.
		primary: true → "Spark a Signal" gets special visual treatment.
	*/
	type NavItem = {
		href: string;
		label: string;
		icon: string;
		viewBox?: string;
		primary?: boolean;
	};

	const navItems: NavItem[] = [
		{
			href: '/',
			label: 'Home',
			viewBox: '0 0 16 16',
			icon: 'M8 2L2 7v7h4v-4h4v4h4V7L8 2z',
		},
		{
			href: '/search',
			label: 'Search',
			viewBox: '0 0 16 16',
			icon: 'M10.5 10.5L14 14M6.5 11a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9z',
		},
		{
			href: '/spark',
			label: 'Spark a Signal',
			viewBox: '0 0 16 16',
			icon: 'M8 2v12M2 8h12',
			primary: true,
		},
		{
			href: '/saved',
			label: 'Saved Signals',
			viewBox: '0 0 16 16',
			icon: 'M4 2h8a1 1 0 0 1 1 1v11l-5-3-5 3V3a1 1 0 0 1 1-1z',
		},
		{
			href: '/scouts',
			label: 'Scouts',
			viewBox: '0 0 16 16',
			icon: 'M8 2a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 13c0-2.76 2.24-4 5-4s5 1.24 5 4',
		},
		{
			href: '/profile',
			label: 'Profile',
			viewBox: '0 0 16 16',
			icon: 'M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-5 7a5 5 0 0 1 10 0',
		},
	];
</script>

<!--
	Sidebar: fixed, sits below the top bar (top-14 matches header h-14).
	Width w-56 — wide enough to read labels comfortably, narrow enough
	to not eat into content space.
	hidden md:flex — collapses on mobile. Simple, no JS toggle needed for prototype.
	border-r instead of box-shadow — cleaner separation against the content area.
	bg matches os-surface-raised but without backdrop-filter, which would
	be redundant here since sidebar content doesn't scroll beneath it.
-->
<aside
	class="fixed top-14 left-0 bottom-0 w-56 z-40 hidden md:flex flex-col
	       border-r border-white/6 pb-20"
	style="background-color: oklch(0.11 0.026 265 / 0.97);"
>
	<nav class="flex flex-col gap-0.5 px-3 pt-5 flex-1" aria-label="Main navigation">
		{#each navItems as item (item.href)}
			{@const isActive = page.url.pathname === item.href}

			{#if item.primary}
				<!--
					"Spark a Signal" — primary action, visually distinguished.
					Uses primary color fill + glow instead of hover state.
					Placed between discovery items and personal items — a natural
					pause point that draws the eye to the core product action.
					mt-1 / mb-1 gives it breathing room from its neighbors.
				-->
				<a
					href={item.href}
					class={[
						'group flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-semibold transition-all duration-150 mt-1 mb-1',
						isActive
							? 'bg-primary/25 text-primary border border-primary/45 os-play-glow'
							: 'bg-primary/12 text-primary/85 border border-primary/30 hover:bg-primary/20 hover:text-primary hover:border-primary/48',
					]}
					aria-current={isActive ? 'page' : undefined}
				>
					<svg class="w-3.5 h-3.5 shrink-0" viewBox={item.viewBox ?? '0 0 16 16'} fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
						<path d={item.icon} />
					</svg>
					{item.label}
				</a>
			{:else}
				<a
					href={item.href}
					class={[
						'group flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-all duration-150',
						isActive
							? 'bg-white/7 text-base-content/95 font-medium'
							: 'text-base-content/52 hover:text-base-content/82 hover:bg-white/5',
					]}
					aria-current={isActive ? 'page' : undefined}
				>
					<!--
						Icon rendering: Search uses stroke (open path), others use fill.
						We handle this by checking fill vs stroke on the path type.
						For simplicity all sidebar icons use stroke — consistent style.
					-->
					<svg class="w-3.5 h-3.5 shrink-0" viewBox={item.viewBox ?? '0 0 16 16'} fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<path d={item.icon} />
					</svg>
					{item.label}

					{#if isActive}
						<!--
							Active indicator: left edge accent line rather than a dot.
							Works better in a sidebar than the bottom-dot used in the old top nav.
							Positioned with -left-3 to sit at the sidebar's left edge.
						-->
						<span
							class="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r-full bg-primary/70"
							aria-hidden="true"
						></span>
					{/if}
				</a>
			{/if}
		{/each}
	</nav>
</aside>
