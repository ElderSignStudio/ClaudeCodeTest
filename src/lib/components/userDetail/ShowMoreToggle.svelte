<script lang="ts">
	/*
		ShowMoreToggle — the centered italic text-link used in
		Signature Signals, Emerging Signals, Growth Opportunities,
		and the Signal Tree visibility controls. Standardises the
		font, italic style, alpha, and hover treatment in one place.

		Children render the actual label string so callers can
		compose phrasing (e.g. "Show 3 more", "Show fewer",
		"Show one more opportunity"). Keeps the button stateless
		— the parent owns the toggle logic.
	*/

	import type { Snippet } from 'svelte';

	let {
		onclick,
		children,
	}: {
		onclick: () => void;
		children: Snippet;
	} = $props();
</script>

<div class="mt-3 flex justify-center">
	<button
		type="button"
		{onclick}
		class="text-[12.5px] italic text-base-content/62 hover:text-base-content/92 transition-colors"
	>
		{@render children()}
	</button>
</div>
