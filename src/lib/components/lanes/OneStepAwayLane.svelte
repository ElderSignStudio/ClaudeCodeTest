<script lang="ts">
	import { Radio, RefreshCw } from 'lucide-svelte';
	import { oneStepAwayItems } from '$lib/mock/data';

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
	<!-- One Step Away (TERTIARY) — quiet, restrained. Pulled down to create scrolling rhythm
	     between the loud primary lanes (BP, BO, OS) and the dense card row here. -->
	<div class="absolute inset-0 pointer-events-none" aria-hidden="true" style="background:radial-gradient(ellipse 85% 50% at 50% 55%,rgba(40,130,175,0.13) 0%,rgba(40,130,175,0.06) 40%,rgba(40,130,175,0.02) 65%,transparent 85%);"></div>

	<div class="flex items-start justify-between w-full">
		<div class="flex items-start gap-3">
			<div class="mt-0.5 w-0.5 h-5 rounded-full bg-accent shrink-0" aria-hidden="true"></div>
			<div>
				<p class="text-sm font-bold uppercase tracking-widest leading-tight text-base-content/90">One Step Away</p>
				<p class="mt-0.5 text-[13px] leading-normal text-base-content/72 max-w-105">Signals discovered by scouts just outside your taste orbit</p>
			</div>
		</div>
		<a href="/discover" class="group flex items-center gap-1.5 text-[13px] text-base-content/75 hover:text-base-content/90 transition-colors shrink-0" style="margin-right: clamp(0px, 6vw - 48px, 120px);">
			Refresh
			<RefreshCw size={11} class="opacity-90 transition-transform duration-500 group-hover:rotate-180 group-hover:opacity-100" />
		</a>
	</div>

	<div class="mt-5 grid gap-4 pb-2 w-full" style="grid-template-columns: repeat(6, minmax(150px, 1fr));">
		{#each oneStepAwayItems as item (item.id)}
			<div class="group relative rounded-lg overflow-hidden border border-white/10 hover:border-accent/40 cursor-pointer transition-all duration-200 os-card-glow">
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
					<div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
						<div class="w-7 h-7 rounded-full bg-white/20 border border-white/35 text-white flex items-center justify-center backdrop-blur-sm scale-90 group-hover:scale-100 transition-transform duration-200">
							<svg class="w-3 h-3 translate-x-px" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
								<path d="M3 2l8 4-8 4V2z" />
							</svg>
						</div>
					</div>
				</div>
				<div class="pt-2.5 pr-2.5 pb-2 pl-3.5 bg-base-200/70">
					<!-- 1. Title -->
					<p class="text-[13px] font-bold text-base-content/95 truncate leading-snug">{item.title}</p>
					<!-- 2. Artist · Genre -->
					<p class="text-[12px] text-base-content/68 truncate mt-1">{item.artist} · {item.genre}</p>
					<!-- 3+4. Origin + Network — grouped, origin primary, network secondary -->
					<div class="mt-2 space-y-1">
						{#if item.adjacencyReason}
							<p class="text-[11px] font-medium leading-snug truncate text-cyan-300/92">
								<span style="font-size: 8px; opacity: 0.40; margin-right: 2px;">↗</span>{item.adjacencyReason}
							</p>
						{/if}
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
