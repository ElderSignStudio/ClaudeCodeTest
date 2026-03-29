<script lang="ts">
	import { page } from '$app/state';

	type NavItem = {
		href: string;
		label: string;
		icon: string;
		viewBox?: string;
		primary?: boolean;
		dividerBefore?: boolean;
	};

	/*
		dividerBefore: adds a hairline separator above the item —
		used to group (discovery / action / personal) without labels.
		Grouping through whitespace/dividers is less noisy than section headers.
	*/
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
			dividerBefore: true,
		},
		{
			href: '/saved',
			label: 'Saved Signals',
			viewBox: '0 0 16 16',
			icon: 'M4 2h8a1 1 0 0 1 1 1v11l-5-3-5 3V3a1 1 0 0 1 1-1z',
			dividerBefore: true,
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

<aside
	class="fixed top-14 left-0 bottom-0 w-56 z-40 hidden md:flex flex-col border-r border-white/6 overflow-hidden"
	style="background-color: oklch(0.105 0.026 265 / 0.98);"
>
	<!--
		Atmospheric signal bloom at the bottom of the sidebar.
		Mirrors the body's background language — both use radial-gradient blooms.
		pointer-events-none so it never interferes with clicks.
		This grounds the sidebar in the same visual atmosphere as the page.
	-->
	<div
		class="absolute bottom-0 left-0 w-full h-48 pointer-events-none"
		aria-hidden="true"
		style="background: radial-gradient(ellipse 120% 80% at 0% 100%, oklch(0.45 0.15 265 / 0.07) 0%, transparent 65%);"
	></div>

	<nav class="flex flex-col px-3 pt-5 flex-1 pb-20 relative" aria-label="Main navigation">
		{#each navItems as item (item.href)}
			{@const isActive = page.url.pathname === item.href}

			{#if item.dividerBefore}
				<!--
					Hairline divider: mx-3 so it doesn't span the full sidebar width —
					a touch more elegant than edge-to-edge. Used to group nav sections.
				-->
				<div class="h-px bg-white/5 mx-1 my-2" aria-hidden="true"></div>
			{/if}

			{#if item.primary}
				<!--
					Spark a Signal: uses the brand's signal mark SVG instead of a + cross.
					The concentric circle motif IS the product identity — using it here
					makes this button feel like it belongs to Outer Signal specifically,
					not just any app with a primary action.
				-->
				<a
					href={item.href}
					class={[
						'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-semibold transition-all duration-200',
						isActive
							? 'bg-primary/22 text-primary border border-primary/42 os-play-glow'
							: 'bg-primary/10 text-primary/80 border border-primary/28 hover:bg-primary/18 hover:text-primary hover:border-primary/45',
					]}
					aria-current={isActive ? 'page' : undefined}
				>
					<!-- Signal mark: the brand motif as the action icon -->
					<svg class="w-3.5 h-3.5 shrink-0 text-primary" viewBox="0 0 14 14" fill="none" aria-hidden="true">
						<circle cx="7" cy="7" r="2" fill="currentColor" opacity="0.9" />
						<circle cx="7" cy="7" r="4.5" stroke="currentColor" stroke-width="1" opacity="0.55" />
						<circle cx="7" cy="7" r="6.5" stroke="currentColor" stroke-width="0.75" opacity="0.28" />
					</svg>
					{item.label}
				</a>
			{:else}
				<!--
					Regular nav item wrapped in relative so the active bar
					anchors correctly. The bar uses absolute positioning relative
					to this wrapper, not the sidebar.
				-->
				<div class="relative">
					{#if isActive}
						<!--
							Left edge active bar: 2px wide, positioned at the very left
							of the sidebar (not the nav item padding).
							-left-3 reaches back to the sidebar edge (px-3 on the nav).
						-->
						<span
							class="absolute -left-3 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-primary/65"
							aria-hidden="true"
						></span>
					{/if}

					<a
						href={item.href}
						class={[
							'flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all duration-150 w-full',
							isActive
								? 'bg-primary/8 text-base-content/92 font-medium'
								: 'text-base-content/48 hover:text-base-content/80 hover:bg-white/5',
						]}
						aria-current={isActive ? 'page' : undefined}
					>
						<svg
							class={[
								'w-3.5 h-3.5 shrink-0 transition-colors',
								isActive ? 'text-primary/65' : 'text-base-content/38',
							]}
							viewBox={item.viewBox ?? '0 0 16 16'}
							fill="none"
							stroke="currentColor"
							stroke-width="1.5"
							stroke-linecap="round"
							stroke-linejoin="round"
							aria-hidden="true"
						>
							<path d={item.icon} />
						</svg>
						{item.label}
					</a>
				</div>
			{/if}
		{/each}
	</nav>
</aside>
