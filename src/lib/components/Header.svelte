<script lang="ts">
	import { page } from '$app/state';

	const navItems = [
		{ href: '/', label: 'Home' },
		{ href: '/discover', label: 'Discover' },
		{ href: '/feed', label: 'Feed' },
	];
</script>

<header class="fixed top-0 left-0 right-0 z-50 h-16 bg-base-100/90 backdrop-blur-sm border-b border-base-200">
	<div class="max-w-5xl mx-auto h-full flex items-center justify-between px-4">

		<!-- Logo -->
		<a href="/" class="text-base font-semibold tracking-tight text-base-content">
			Outer Signal
		</a>

		<!-- Desktop nav -->
		<nav class="hidden md:flex items-center gap-6">
			{#each navItems as item (item.href)}
				<a
					href={item.href}
					class={[
						'text-sm transition-colors',
						page.url.pathname === item.href
							? 'text-base-content font-medium'
							: 'text-base-content/50 hover:text-base-content',
					]}
				>
					{item.label}
				</a>
			{/each}
		</nav>

		<!-- Right side: avatar placeholder -->
		<div class="flex items-center gap-3">
			<div class="w-8 h-8 rounded-full bg-base-300 flex items-center justify-center text-xs text-base-content/40 select-none">
				U
			</div>
		</div>

	</div>
</header>
