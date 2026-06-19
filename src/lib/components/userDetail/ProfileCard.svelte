<script lang="ts">
	import type { Snippet } from 'svelte';

	/*
		ProfileCard — the editorial section-card recipe used 9 times
		across the User Detail page (Header, Scout Profile, Scene
		Footprint, Trust Signals, Growth Opportunities, Signature
		Signals, Emerging Signals, Following/Followers, Signal Tree).
		Centralises the rounded-xl + border + bg-base-200/35 + the
		3-segment box-shadow so future visual-language tweaks land
		in one place.

		Defaults to `p-5 lg:p-6` padding (the most common variant).
		Sections that need tighter chrome (e.g. the disclosure
		sections at `px-5 py-4`) override via `padding`.

		Stays a plain `<section>` so heading order / landmark
		semantics keep working. The shadow string is pinned in this
		file so a single edit retunes all 9 surfaces.
	*/

	let {
		padding = 'p-5 lg:p-6',
		extraClass = '',
		tag = 'section',
		children,
	}: {
		padding?: string;
		extraClass?: string;
		/** Tag override for cases where a `<section>` would be
		 *  semantically wrong (e.g. when this card sits inside a
		 *  parent landmark `<section>`, like the Following /
		 *  Followers grid cells). Defaults to `<section>`. */
		tag?: 'section' | 'div';
		children?: Snippet;
	} = $props();
</script>

{#if tag === 'div'}
	<div
		class={['rounded-xl border border-white/6 bg-base-200/35', padding, extraClass].filter(Boolean).join(' ')}
		style="box-shadow: 0 0 0 1px rgba(255,255,255,0.04), 0 4px 18px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.025);"
	>
		{@render children?.()}
	</div>
{:else}
	<section
		class={['rounded-xl border border-white/6 bg-base-200/35', padding, extraClass].filter(Boolean).join(' ')}
		style="box-shadow: 0 0 0 1px rgba(255,255,255,0.04), 0 4px 18px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.025);"
	>
		{@render children?.()}
	</section>
{/if}
