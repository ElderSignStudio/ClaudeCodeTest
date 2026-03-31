<script lang="ts">
	import { TrendingUp, ArrowUpRight } from 'lucide-svelte';
	import { breakingOutItems } from '$lib/mock/data';
</script>

<section>
	<div class="flex items-center justify-between mb-1">
		<div class="flex items-center gap-2">
			<div class="w-0.75 h-3.5 rounded-full bg-success" aria-hidden="true"></div>
			<p class="text-sm font-bold uppercase tracking-widest text-base-content/90">Breaking Out</p>
			<span class="w-1.5 h-1.5 rounded-full bg-success/75 animate-pulse" aria-hidden="true"></span>
		</div>
		<span class="text-[12px] text-base-content/52 flex items-center gap-1">
			<TrendingUp size={11} class="text-success/65" />
			Still early
		</span>
	</div>
	<p class="text-[12px] text-base-content/50 mb-4 ml-3.5">Signals gaining momentum</p>

	<div class="flex gap-3 overflow-x-auto -mx-5 px-5 pb-2 scrollbar-none items-start">
		{#each breakingOutItems as item (item.id)}
			<div class="group shrink-0 w-44 rounded-lg overflow-hidden border border-white/8 hover:border-success/30 cursor-pointer transition-all duration-200 os-card-breaking">
				<div class="relative w-full aspect-square">
					<img
						src={item.image}
						alt={item.title}
						class="w-full h-full object-cover opacity-[72%] group-hover:opacity-[88%] transition-opacity duration-300"
					/>
					<div class="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent"></div>
					<div class="absolute inset-0 bg-linear-to-br from-success/8 to-transparent mix-blend-color"></div>
					<div
						class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-250 pointer-events-none"
						style="background: radial-gradient(circle at 50% 50%, oklch(0.74 0.17 158 / 0.12) 0%, transparent 65%);"
						aria-hidden="true"
					></div>
					<div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
						<div class="w-8 h-8 rounded-full bg-white/22 border border-white/38 text-white flex items-center justify-center backdrop-blur-sm scale-90 group-hover:scale-100 transition-transform duration-200">
							<svg class="w-3.5 h-3.5 translate-x-px" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
								<path d="M3 2l8 4-8 4V2z" />
							</svg>
						</div>
					</div>
					<div class="absolute top-2 left-2">
						<span
							class="inline-flex items-center gap-0.5 text-[10px] font-bold rounded-full px-1.5 py-0.5 border backdrop-blur-sm bg-black/55"
							style={item.trend === 'surging'
								? `color: var(--color-success); border-color: oklch(0.74 0.17 158 / 0.45); box-shadow: var(--glow-l3-success);`
								: `color: var(--color-accent); border-color: oklch(0.72 0.16 220 / 0.40); box-shadow: var(--glow-l3-accent);`}
						>
							<ArrowUpRight size={8} />
							{item.trend === 'surging' ? 'Surging' : 'Rising'}
						</span>
					</div>
				</div>
				<div class="p-2.5 bg-base-200/70">
					<p class="text-[13px] font-bold text-base-content/95 truncate leading-snug">{item.title}</p>
					<p class="text-[11px] text-base-content/68 truncate mt-0.5">{item.artist} · {item.genre}</p>
					{#if item.weeklyScouts !== undefined}
						<p class="text-[11px] font-medium mt-1.5 truncate" style="color: oklch(0.74 0.17 158 / 0.80);">
							+{item.weeklyScouts} scouts this week
						</p>
					{/if}
					{#if item.resonance !== undefined}
						<div class="mt-2 h-0.5 rounded-full bg-white/10 overflow-hidden">
							<div
								class="relative h-full rounded-full bg-linear-to-r from-success/65 to-accent/50 overflow-hidden"
								style="width: {item.resonance}%;"
							>
								<div
									class="os-bar-shimmer absolute inset-y-0 left-0 w-1/2 bg-linear-to-r from-transparent via-white/30 to-transparent"
									aria-hidden="true"
								></div>
							</div>
						</div>
					{/if}
				</div>
			</div>
		{/each}
	</div>
</section>
