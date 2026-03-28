<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import BottomPlayer from '$lib/components/BottomPlayer.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<Header />

<main class="pt-16 pb-20 min-h-screen">
	{@render children()}
</main>

<BottomPlayer />
