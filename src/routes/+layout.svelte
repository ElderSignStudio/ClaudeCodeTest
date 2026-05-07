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

	Background: space.png fixed behind all content (-z-10).
	App chrome + content render above it at their own z-index levels.
-->

<!--
	Root wrapper: establishes the stacking context for all background layers.
	min-h-screen ensures it always covers the full viewport even on short pages.
-->
<div class="relative min-h-screen">

	<!-- Background — space image, fixed to viewport, behind all content -->
	<div
		class="fixed inset-0 -z-10 bg-[url('/backgrounds/space.png')] bg-cover bg-center bg-no-repeat"
		aria-hidden="true"
	></div>

	<!-- Atmospheric depth — very subtle vertical density increase toward page bottom.
	     Creates the impression of atmosphere thickening with depth, never consciously
	     noticed but gives the eye a foreground/background anchor. -->
	<div
		class="fixed inset-0 pointer-events-none"
		style="z-index: -9; background: linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.06) 55%, rgba(0,0,0,0.12) 100%);"
		aria-hidden="true"
	></div>

	<!-- App chrome + content — z-index is auto (above -z-10 layers) -->
	<Header />
	<Sidebar />

	<main class="pt-14 pb-18 min-h-screen md:pl-56">
		{@render children()}
	</main>

	<BottomPlayer />

</div>
