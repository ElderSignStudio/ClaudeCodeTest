<script lang="ts">
	import { page } from '$app/state';
	import { Home, Search, Radio, Users, User } from 'lucide-svelte';
	import { currentUser } from '$lib/mock/currentUser';

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
		{ href: '/saved',   label: 'Amplified Signals', icon: Radio, dividerBefore: true },
		{ href: '/scouts',  label: 'Scouts',         icon: Users    },
		{ href: '/profile', label: 'Profile',        icon: User     },
	];
</script>

<aside
	class="fixed top-14 left-0 bottom-0 w-56 z-40 hidden md:flex flex-col border-r border-white/8 overflow-hidden"
	style="background-color: transparent;"
>
	<!-- Atmospheric bloom at bottom-left -->
	<div
		class="absolute bottom-0 left-0 w-full h-48 pointer-events-none"
		aria-hidden="true"
		style="background: radial-gradient(ellipse 120% 80% at 0% 100%, oklch(0.45 0.15 265 / 0.07) 0%, transparent 65%);"
	></div>

	<!-- User identity block — links through to the current user's
	     scout profile so the entry point is discoverable from the
	     primary nav without inventing a new nav item. -->
	<div class="shrink-0 px-4 pt-5 pb-3.5">
		<a
			href="/users/dan"
			class="group flex items-center gap-2.5 -mx-1 px-1 py-0.5 rounded-md hover:bg-white/4 transition-colors"
			title="Open your scout profile"
		>
			<div class="w-9 h-9 rounded-full border border-primary/28 group-hover:border-primary/48 overflow-hidden shrink-0 transition-colors">
				<img
					src={currentUser.avatarUrl}
					alt={currentUser.name}
					class="w-full h-full object-cover"
				/>
			</div>
			<div class="min-w-0">
				<p class="text-[13px] font-semibold text-base-content/88 group-hover:text-base-content/95 truncate leading-snug transition-colors">{currentUser.name}</p>
				<p class="text-[11px] text-base-content/55 leading-snug">Scout Score: 4</p>
			</div>
		</a>
	</div>

	<div class="shrink-0 h-px bg-white/7 mx-3 mb-1" aria-hidden="true"></div>

	<nav class="flex flex-col px-3 pt-3 flex-1 relative overflow-y-auto" aria-label="Main navigation">
		{#each navItems as item (item.href)}
			{@const isActive = page.url.pathname === item.href}
			{@const Icon = item.icon}

			{#if item.dividerBefore}
				<div class="h-px bg-white/7 mx-1 my-2" aria-hidden="true"></div>
			{/if}

			{#if item.primary}
				<a
					href={item.href}
					class={[
						'flex items-center gap-2.5 px-3 py-3 rounded-lg text-base font-semibold transition-all duration-200',
						isActive
							? 'bg-primary/25 text-primary border border-primary/50 os-glow-interactive'
							: 'bg-primary/12 text-primary/82 border border-primary/30 hover:bg-primary/20 hover:text-primary hover:border-primary/48',
					]}
					aria-current={isActive ? 'page' : undefined}
				>
					<!-- Signal mark: brand motif as the CTA icon -->
					<svg class="w-4 h-4 shrink-0" viewBox="0 0 14 14" fill="none" aria-hidden="true">
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
							'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-base transition-all duration-150 w-full',
							isActive
								? 'bg-primary/12 text-base-content/95 font-semibold'
								: 'text-base-content/90 font-medium hover:text-base-content/95 hover:bg-white/6',
						]}
						aria-current={isActive ? 'page' : undefined}
					>
						<Icon
							size={16}
							class={isActive ? 'text-primary/80' : 'text-base-content/80'}
						/>
						{item.label}
					</a>
				</div>
			{/if}
		{/each}
	</nav>

</aside>
