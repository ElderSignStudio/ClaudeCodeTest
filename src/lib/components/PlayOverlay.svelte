<script lang="ts">
	/*
		Shared hover-revealed play button used by every card that wraps an image
		(7+ sites across the lanes). The size tiers map to four card scales:

		  xs — Deep Underground / OTB supporting echoes  (6px square button)
		  sm — One Step Away                              (7px square)
		  md — For You / Breaking Out / Drift             (8px square)
		  lg — OTB hero                                   (12px square)

		bg/border alphas are bound to size so the button stays perceptually
		consistent across card sizes. `blur` and `scaleOnHover` exist as escape
		hatches: Deep Underground intentionally drops the blur (minimal-UI
		aesthetic), OTB's smaller echoes intentionally drop the scale-pop.

		Wrap this in an image-relative container — the outer absolute layer
		below handles its own positioning and the hover-reveal opacity.
	*/

	type Size = 'xs' | 'sm' | 'md' | 'lg';

	let {
		size,
		blur = true,
		scaleOnHover = true,
	}: { size: Size; blur?: boolean; scaleOnHover?: boolean } = $props();

	const buttonClass: Record<Size, string> = {
		xs: 'w-6 h-6 bg-white/18 border-white/28',
		sm: 'w-7 h-7 bg-white/20 border-white/35',
		md: 'w-8 h-8 bg-white/20 border-white/35',
		lg: 'w-12 h-12 bg-white/14 border-white/28',
	};
	const svgClass: Record<Size, string> = {
		xs: 'w-2.5 h-2.5',
		sm: 'w-3 h-3',
		md: 'w-3.5 h-3.5',
		lg: 'w-4 h-4',
	};
</script>

<div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
	<div
		class={[
			'rounded-full border text-white flex items-center justify-center transition-transform duration-200',
			buttonClass[size],
			blur && 'backdrop-blur-sm',
			scaleOnHover && 'scale-90 group-hover:scale-100',
		]}
	>
		<svg class={['translate-x-px', svgClass[size]]} viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
			<path d="M3 2l8 4-8 4V2z" />
		</svg>
	</div>
</div>
