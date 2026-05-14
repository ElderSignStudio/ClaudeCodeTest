<script lang="ts">
	import { Radio } from 'lucide-svelte';
	import { oneStepAwayItems } from '$lib/mock/data';
	import LaneHeader from '$lib/components/LaneHeader.svelte';
	import PlayOverlay from '$lib/components/PlayOverlay.svelte';
	import { navigateToItem, navigateToItemKey } from '$lib/navigation';

	// Badge opacity varies by life state — more momentum = more visible
	const badgeOpacity: Record<string, number> = {
		Early:     0.60,
		Quiet:     0.60,
		Emerging:  0.80,
		Spreading: 0.90,
	};

	// Network line phrasing varies by scout count — adds time nuance
	function networkLabel(scouts: number): string {
		if (scouts >= 8) return `+${scouts} scouts this week`;
		if (scouts >= 3) return `+${scouts} scouts recently`;
		return 'Picked up recently';
	}
</script>

<section class="relative">
	<LaneHeader
		title="One Step Away"
		subtitle="Signals discovered by scouts just outside your taste orbit"
		accentClass="bg-accent"
		variant="refresh"
		href="/discover"
	/>

	<div class="mt-5 grid gap-4 pb-2 w-full" style="grid-template-columns: repeat(6, minmax(150px, 1fr));">
		{#each oneStepAwayItems as item (item.id)}
			<div
				class="group relative rounded-lg overflow-hidden border border-white/10 hover:border-accent/40 cursor-pointer transition-all duration-200 os-card-glow"
				onclick={(e) => navigateToItem(item.id, e)}
				onkeydown={(e) => navigateToItemKey(item.id, e)}
				role="button"
				tabindex="0"
				aria-label={`View ${item.title}`}
			>
				<div
					class="absolute left-0 top-0 bottom-0 w-0.75 bg-accent/30 group-hover:bg-accent/55 transition-colors duration-200 z-10"
					aria-hidden="true"
				></div>
				<div class="relative w-full aspect-square">
					<img
						src={item.image}
						alt={item.title}
						class="w-full h-full object-cover opacity-68 group-hover:opacity-84 transition-opacity duration-300"
						style="filter: brightness(1.03) contrast(1.04) saturate(1.02);"
					/>
					<div class="absolute inset-0 bg-linear-to-t from-black/73 via-black/14 to-transparent"></div>
					<div class="absolute inset-0 bg-linear-to-br from-accent/10 to-transparent mix-blend-color"></div>
					<div
						class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-250 pointer-events-none"
						style="background: radial-gradient(circle at 50% 50%, oklch(0.72 0.16 220 / 0.09) 0%, transparent 65%);"
						aria-hidden="true"
					></div>
					<!-- Life badge — opacity reflects momentum state -->
					<div class="absolute top-2 right-2 z-10">
						<span
							class="text-[10px] font-semibold px-1.5 py-0.5 rounded border border-accent/28 text-accent/78 leading-none backdrop-blur-sm"
							style="background: rgba(0,0,0,0.38); opacity: {badgeOpacity[item.lifeLabel ?? 'Emerging'] ?? 0.80};"
						>
							{item.lifeLabel ?? 'Emerging'}
						</span>
					</div>
					<PlayOverlay size="sm" />
				</div>
				<div class="pt-2.5 pr-2.5 pb-2 pl-3.5 bg-base-200/70">
					<!-- 1. Title -->
					<p class="text-[13px] font-bold text-base-content/95 truncate leading-snug">{item.title}</p>
					<!-- 2. Artist · Genre -->
					<p class="text-[12px] text-base-content/68 truncate mt-1">{item.artist} · {item.genre}</p>
					<!--
						Line 1: singular discovery route — scout-anchored.
						Line 2: propagation velocity (the lane's quantitative signal).
						The arrow glyph leads the route line as a tiny directional
						hint that this signal is coming from a specific scout.
					-->
					<div class="mt-2 space-y-1">
						<p class="text-[11px] font-medium leading-snug truncate text-cyan-300/92">
							<span style="font-size: 8px; opacity: 0.40; margin-right: 2px;">↗</span>{item.routeNarrative}
						</p>
						<p class="text-[11px] font-normal truncate text-cyan-300/78">
							{networkLabel(item.scouts)}
						</p>
					</div>
					<!-- 5. Amplify -->
					<div class="flex justify-end mt-2">
						<button
							class="flex items-center gap-1 h-5 px-2 rounded-full text-[11px] font-semibold text-accent/90 border border-accent/40 hover:bg-accent/16 hover:border-accent/62 hover:text-accent transition-all"
							aria-label="Amplify this signal"
						>
							<Radio size={8} />
							Amplify
						</button>
					</div>
				</div>
			</div>
		{/each}
	</div>
</section>
