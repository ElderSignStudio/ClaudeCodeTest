<script lang="ts">
	import type { OriginItem } from '$lib/mock/data';

	let { item }: { item: OriginItem } = $props();

	/*
		Node diagram: a horizontal chain of `discoveries` seed nodes connected
		by lines, leading to a final "reached" node whose radius scales with
		reachedScouts. Built entirely from data — no images, no decoration.

		Layout math (all in SVG units):
		  - Canvas: 180 wide × 36 tall
		  - Seed nodes: r=3, evenly spaced across the left 60% of the canvas
		  - Connector lines between each node
		  - Final node: r scales from 5 (min) up to 11 (max at 30+ scouts)
		  - Secondary nodes sit at y=18 (vertical center)
	*/
	const canvasW = 180;
	const canvasH = 36;
	const cy = canvasH / 2;

	// Clamp reachedScouts to a radius between 5 and 11
	const finalR = $derived(Math.min(11, Math.max(5, Math.round(item.reachedScouts / 3))));

	// Space seed nodes across the left 70% of the canvas, leaving room for the final node
	const seedCount = $derived(item.discoveries);
	const rightEdge = $derived(canvasW - finalR - 4); // final node center x
	const leftEdge = 10;
	const seedSpacing = $derived(seedCount > 1 ? (rightEdge - 32 - leftEdge) / (seedCount - 1) : 0);
	const seedNodes: number[] = $derived(
		Array.from({ length: seedCount }, (_, i) =>
			seedCount === 1 ? leftEdge : leftEdge + i * seedSpacing
		)
	);
</script>

<!--
	Story Card: text-first, image-secondary.
	The card communicates a network narrative — headline is the primary element,
	the SVG path diagram is secondary context, not decoration.

	Compared to Signal Cards:
	  - No large artwork fill; image is a small inset square
	  - More vertical padding; text has breathing room
	  - Hover: gentle lift + border brightens, no color glow
	  - Width: w-72 (288px) — wider than any signal card, fewer visible per row
-->
<div
	class="group shrink-0 w-80 rounded-xl border border-white/8 hover:border-white/18 cursor-pointer bg-base-200/45 hover:bg-base-200/62 transition-all duration-250 hover:-translate-y-0.5 flex flex-col"
>
	<div class="p-4 flex-1 flex flex-col">

		<!-- Top row: small image inset + location tag -->
		<div class="flex items-start justify-between gap-3 mb-3">
			<div class="w-10 h-10 rounded-md overflow-hidden border border-white/10 shrink-0">
				<img
					src={item.image}
					alt=""
					class="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity duration-300"
				/>
			</div>
			<div class="flex-1 min-w-0 pt-0.5">
				<p class="text-[11px] font-semibold text-base-content/62 truncate">{item.title} · {item.artist}</p>
				<p class="text-[10px] text-base-content/40 truncate mt-0.5">{item.genre} · {item.seedLocation}</p>
			</div>
		</div>

		<!-- Headline: the narrative statement — primary element -->
		<p class="text-[15px] font-bold text-base-content/92 leading-snug mb-3 flex-1">
			{item.headline}
		</p>

		<!--
			Path diagram: SVG node chain.
			Seed nodes (discoveries) → connector lines → final reached node.
			The final node radius encodes reachedScouts visually.
			secondary color for seeds, primary for the destination.
		-->
		<div class="mb-3" aria-hidden="true">
			<svg
				viewBox="0 0 {canvasW} {canvasH}"
				width={canvasW}
				height={canvasH}
				class="overflow-visible"
			>
				<!-- Connector lines between seed nodes and toward final node -->
				{#each seedNodes as x, i (i)}
					{@const nextX = i < seedNodes.length - 1 ? seedNodes[i + 1] : rightEdge}
					<line
						x1={x} y1={cy}
						x2={nextX} y2={cy}
						stroke="oklch(0.88 0.018 272 / 0.12)"
						stroke-width="1"
						stroke-dasharray="2 3"
					/>
				{/each}

				<!-- Seed nodes -->
				{#each seedNodes as x, i (i)}
					<circle
						cx={x} cy={cy} r="3"
						fill="oklch(0.65 0.18 290 / 0.55)"
					/>
				{/each}

				<!-- Final "reached" node — radius encodes reachedScouts -->
				<circle
					cx={rightEdge} cy={cy} r={finalR}
					fill="oklch(0.68 0.20 265 / 0.20)"
					stroke="oklch(0.68 0.20 265 / 0.50)"
					stroke-width="1"
				/>
				<!-- Inner dot -->
				<circle
					cx={rightEdge} cy={cy} r="2.5"
					fill="oklch(0.68 0.20 265 / 0.80)"
				/>
			</svg>
		</div>

		<!--
			Stats row: three equal columns via grid-cols-3.
			Each cell: large value on top, small label below (wraps to two lines if needed).
			grid guarantees equal width regardless of content length.
			Dividers are absolutely positioned between columns.
		-->
		<div class="grid grid-cols-3 gap-0 mb-3.5 relative">
			<!-- Divider 1 -->
			<div class="absolute left-1/3 top-0 bottom-0 w-px bg-white/8" aria-hidden="true"></div>
			<!-- Divider 2 -->
			<div class="absolute left-2/3 top-0 bottom-0 w-px bg-white/8" aria-hidden="true"></div>

			<div class="pr-3">
				<p class="text-[16px] font-extrabold text-base-content/80 leading-none">{item.reachedScouts}</p>
				<p class="text-[9px] text-base-content/40 mt-0.5 leading-tight">scouts reached</p>
			</div>
			<div class="px-3">
				<p class="text-[16px] font-extrabold text-base-content/80 leading-none">{item.discoveries}</p>
				<p class="text-[9px] text-base-content/40 mt-0.5 leading-tight">independent<br />{item.discoveries === 1 ? 'discovery' : 'discoveries'}</p>
			</div>
			<div class="pl-3">
				<p class="text-[13px] font-bold text-base-content/75 leading-tight truncate">{item.seedLocation}</p>
				<p class="text-[9px] text-base-content/40 mt-0.5 leading-tight">seed origin</p>
			</div>
		</div>

		<!-- View Path CTA -->
		<button
			class="w-full flex items-center justify-center h-7 rounded-full text-[11px] font-semibold border border-white/12 text-base-content/55 hover:text-base-content/80 hover:border-white/24 hover:bg-white/5 transition-all duration-150"
		>
			View Path →
		</button>

	</div>
</div>
