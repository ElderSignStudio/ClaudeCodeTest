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
		Atmospheric bloom at bottom-left — same radial-gradient language
		as the body background. Sidebar feels inside the same space as the page.
	-->
	<div
		class="absolute bottom-0 left-0 w-full h-48 pointer-events-none"
		aria-hidden="true"
		style="background: radial-gradient(ellipse 120% 80% at 0% 100%, oklch(0.45 0.15 265 / 0.07) 0%, transparent 65%);"
	></div>

	<!--
		User identity block: avatar + name + level.
		Makes the sidebar feel like it knows who the user is — essential for
		any product that rewards personal discovery and tracks contribution.
		shrink-0: never gets compressed when nav overflows.
	-->
	<div class="shrink-0 px-4 pt-5 pb-3.5">
		<div class="flex items-center gap-2.5">
			<div class="w-8 h-8 rounded-full bg-primary/15 border border-primary/28 flex items-center justify-center text-[12px] font-semibold text-primary/75 shrink-0">
				D
			</div>
			<div class="min-w-0">
				<p class="text-[13px] font-medium text-base-content/88 truncate leading-snug">Dan</p>
				<p class="text-[10px] text-base-content/38 leading-snug">Scout · Level 4</p>
			</div>
		</div>
	</div>

	<div class="shrink-0 h-px bg-white/5 mx-3 mb-1" aria-hidden="true"></div>

	<!-- Nav: flex-1 so it fills remaining space between user block and stats -->
	<nav class="flex flex-col px-3 pt-3 flex-1 relative overflow-y-auto" aria-label="Main navigation">
		{#each navItems as item (item.href)}
			{@const isActive = page.url.pathname === item.href}

			{#if item.dividerBefore}
				<div class="h-px bg-white/5 mx-1 my-2" aria-hidden="true"></div>
			{/if}

			{#if item.primary}
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
					<!-- Signal mark icon: the brand motif as the action icon -->
					<svg class="w-3.5 h-3.5 shrink-0" viewBox="0 0 14 14" fill="none" aria-hidden="true">
						<circle cx="7" cy="7" r="2" fill="currentColor" opacity="0.9" />
						<circle cx="7" cy="7" r="4.5" stroke="currentColor" stroke-width="1" opacity="0.55" />
						<circle cx="7" cy="7" r="6.5" stroke="currentColor" stroke-width="0.75" opacity="0.28" />
					</svg>
					{item.label}
				</a>
			{:else}
				<!--
					relative wrapper: required so the absolute active bar
					anchors to this element, not an ancestor.
				-->
				<div class="relative">
					{#if isActive}
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
								isActive ? 'text-primary/65' : 'text-base-content/35',
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

	<!--
		Activity stats: bottom of sidebar, above the bottom player gap.
		Shows the user's contribution — essential for a product that
		rewards early discovery. pb-20 clears the fixed bottom player.
		shrink-0: never compressed even if nav grows.
	-->
	<div class="shrink-0 px-3 pb-20 relative">
		<div class="h-px bg-white/5 mx-0 mb-3" aria-hidden="true"></div>
		<div class="rounded-lg bg-white/3 border border-white/6 p-3.5">
			<p class="text-[10px] font-semibold uppercase tracking-widest text-base-content/25 mb-3">Your Activity</p>
			<div class="flex items-center gap-0">
				<div class="flex-1">
					<p class="text-lg font-bold text-base-content/70 leading-none">3</p>
					<p class="text-[10px] text-base-content/35 mt-1">Amplified</p>
				</div>
				<div class="w-px h-8 bg-white/8 shrink-0"></div>
				<div class="flex-1 pl-4">
					<p class="text-lg font-bold text-base-content/70 leading-none">12</p>
					<p class="text-[10px] text-base-content/35 mt-1">Discovered</p>
				</div>
			</div>
		</div>
	</div>

</aside>
