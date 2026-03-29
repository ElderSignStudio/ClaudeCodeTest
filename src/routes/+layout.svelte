<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import BottomPlayer from '$lib/components/BottomPlayer.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<!--
	App shell structure:
	  ┌─────────────────────────────┐
	  │         Header (h-14)       │  ← fixed, full width, z-50
	  ├──────────┬──────────────────┤
	  │          │                  │
	  │ Sidebar  │   Main content   │  ← sidebar fixed, main scrolls
	  │  (w-56)  │                  │
	  │          │                  │
	  └──────────┴──────────────────┘
	  │         BottomPlayer        │  ← fixed, full width, z-50

	Header and BottomPlayer remain full-width fixed.
	Sidebar is fixed, starts at top-14 (below header), ends above player.
	Main shifts right with md:pl-56 to avoid overlap with sidebar.
	pt-14 clears the header, pb-18 clears the bottom player.
-->

<Header />
<Sidebar />

<main class="pt-14 pb-18 min-h-screen md:pl-56">
	{@render children()}
</main>

<BottomPlayer />
