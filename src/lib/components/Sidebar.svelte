<script lang="ts">
	import { page } from '$app/state';
	import { Home, Search, Bookmark, Users, User } from 'lucide-svelte';

	type NavItem = {
		href: string;
		label: string;
		icon: typeof Home;   // Lucide component type
		primary?: boolean;
		dividerBefore?: boolean;
	};

	const navItems: NavItem[] = [
		{ href: '/',        label: 'Home',           icon: Home     },
		{ href: '/search',  label: 'Search',         icon: Search   },
		{
			href: '/spark',
			label: 'Spark a Signal',
			icon: Home,        // icon unused for primary — uses signal mark SVG below
			primary: true,
			dividerBefore: true,
		},
		{ href: '/saved',   label: 'Saved Signals',  icon: Bookmark, dividerBefore: true },
		{ href: '/scouts',  label: 'Scouts',         icon: Users    },
		{ href: '/profile', label: 'Profile',        icon: User     },
	];
</script>

<aside
	class="fixed top-14 left-0 bottom-0 w-56 z-40 hidden md:flex flex-col border-r border-white/6 overflow-hidden"
	style="background-color: oklch(0.105 0.026 265 / 0.98);"
>
	<!-- Atmospheric bloom at bottom-left -->
	<div
		class="absolute bottom-0 left-0 w-full h-48 pointer-events-none"
		aria-hidden="true"
		style="background: radial-gradient(ellipse 120% 80% at 0% 100%, oklch(0.45 0.15 265 / 0.07) 0%, transparent 65%);"
	></div>

	<!-- User identity block -->
	<div class="shrink-0 px-4 pt-5 pb-3.5">
		<div class="flex items-center gap-2.5">
			<!--
				DiceBear avatar: same seed as header, consistent identity across components.
				w-8 h-8 with rounded-full + overflow-hidden clips the SVG correctly.
			-->
			<div class="w-9 h-9 rounded-full border border-primary/28 overflow-hidden shrink-0">
				<img
					src="https://api.dicebear.com/9.x/thumbs/svg?seed=DanOuter&backgroundColor=1e1b4b"
					alt="Dan"
					class="w-full h-full object-cover"
				/>
			</div>
			<div class="min-w-0">
				<p class="text-[13px] font-semibold text-base-content/88 truncate leading-snug">Dan</p>
				<p class="text-[10px] text-base-content/38 leading-snug">Scout · Level 4</p>
			</div>
		</div>
	</div>

	<div class="shrink-0 h-px bg-white/5 mx-3 mb-1" aria-hidden="true"></div>

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
							? 'bg-primary/25 text-primary border border-primary/50 os-glow-interactive'
							: 'bg-primary/12 text-primary/82 border border-primary/30 hover:bg-primary/20 hover:text-primary hover:border-primary/48',
					]}
					aria-current={isActive ? 'page' : undefined}
				>
					<!-- Signal mark: brand motif as the CTA icon -->
					<svg class="w-3.5 h-3.5 shrink-0" viewBox="0 0 14 14" fill="none" aria-hidden="true">
						<circle cx="7" cy="7" r="2" fill="currentColor" opacity="0.9" />
						<circle cx="7" cy="7" r="4.5" stroke="currentColor" stroke-width="1" opacity="0.55" />
						<circle cx="7" cy="7" r="6.5" stroke="currentColor" stroke-width="0.75" opacity="0.28" />
					</svg>
					{item.label}
				</a>
			{:else}
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
								? 'bg-primary/12 text-base-content/95 font-semibold'
								: 'text-base-content/52 hover:text-base-content/85 hover:bg-white/6',
						]}
						aria-current={isActive ? 'page' : undefined}
					>
						<!--
							Lucide components accept size (number) and class props.
							color is inherited via currentColor — Tailwind text-* classes
							on the parent <a> flow through to the SVG stroke.
						-->
						<svelte:component
							this={item.icon}
							size={14}
							class={isActive ? 'text-primary/80' : 'text-base-content/40'}
						/>
						{item.label}
					</a>
				</div>
			{/if}
		{/each}
	</nav>

	<!-- Activity stats -->
	<div class="shrink-0 px-3 pb-20 relative">
		<div class="h-px bg-white/5 mb-3" aria-hidden="true"></div>
		<div class="rounded-lg bg-white/3 border border-white/6 p-3.5">
			<p class="text-[10px] font-semibold uppercase tracking-widest text-base-content/25 mb-3">Your Activity</p>
			<div class="flex items-center">
				<div class="flex-1">
					<p class="text-lg font-extrabold text-base-content/75 leading-none">3</p>
					<p class="text-[10px] text-base-content/35 mt-1">Amplified</p>
				</div>
				<div class="w-px h-8 bg-white/8 shrink-0"></div>
				<div class="flex-1 pl-4">
					<p class="text-lg font-extrabold text-base-content/75 leading-none">12</p>
					<p class="text-[10px] text-base-content/35 mt-1">Discovered</p>
				</div>
			</div>
		</div>
	</div>
</aside>
