<script lang="ts">
	/*
		Tiny topology fragment for signals that emerged from multiple unrelated
		scout circles. Not a badge — embedded into a metadata line and rendered
		at a near-invisible opacity so it reads as residue, not as a feature
		icon. Three motif variants picked deterministically from the item's id
		so cards don't all show the same shape; the variation prevents the
		marker from feeling "designed."

		Color comes from the parent's text color (`currentColor`) and an opacity
		Tailwind class — each lane controls tint via `colorClass`, so the marker
		blends with that lane's local palette.

		Sizing: total 16×12px, 2.4px nodes, 0.8px lines — within the spec's
		"barely noticeable" envelope.
	*/

	let { seed, colorClass = 'text-base-content/30' }: { seed: string; colorClass?: string } = $props();

	function pickVariant(s: string): 'a' | 'b' | 'c' {
		let h = 0;
		for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
		const variants = ['a', 'b', 'c'] as const;
		return variants[Math.abs(h) % variants.length];
	}

	const variant = $derived(pickVariant(seed));
</script>

<span class={['inline-block align-middle shrink-0 mr-1.5', colorClass]} aria-hidden="true">
	{#if variant === 'a'}
		<!-- Short connected pair + a floating disconnected node offset down-right.
		     Reads as a broken fragment of a larger graph, not a complete shape. -->
		<svg width="12" height="10" viewBox="0 0 12 10" fill="none">
			<line x1="2" y1="3" x2="5.5" y2="3" stroke="currentColor" stroke-width="0.6" stroke-opacity="0.65" />
			<circle cx="2" cy="3" r="1" fill="currentColor" />
			<circle cx="5.5" cy="3" r="1" fill="currentColor" />
			<circle cx="10" cy="7" r="1" fill="currentColor" />
		</svg>
	{:else if variant === 'b'}
		<!-- L-bend whose second segment stops ~1.5px short of the third node —
		     an incomplete branch trailing off. -->
		<svg width="12" height="10" viewBox="0 0 12 10" fill="none">
			<line x1="1.5" y1="2.5" x2="5.5" y2="5.5" stroke="currentColor" stroke-width="0.6" stroke-opacity="0.65" />
			<line x1="5.5" y1="5.5" x2="8.5" y2="6.5" stroke="currentColor" stroke-width="0.6" stroke-opacity="0.65" />
			<circle cx="1.5" cy="2.5" r="1" fill="currentColor" />
			<circle cx="5.5" cy="5.5" r="1" fill="currentColor" />
			<circle cx="10.5" cy="7" r="1" fill="currentColor" />
		</svg>
	{:else}
		<!-- Single diagonal thread + a scattered, unconnected node up to the
		     right. Sparsest of the three variants. -->
		<svg width="12" height="10" viewBox="0 0 12 10" fill="none">
			<line x1="2" y1="2" x2="7.5" y2="6.5" stroke="currentColor" stroke-width="0.6" stroke-opacity="0.65" />
			<circle cx="2" cy="2" r="1" fill="currentColor" />
			<circle cx="7.5" cy="6.5" r="1" fill="currentColor" />
			<circle cx="11" cy="2" r="1" fill="currentColor" />
		</svg>
	{/if}
</span>
