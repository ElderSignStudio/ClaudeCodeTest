<script lang="ts">
import { breakingOutItems } from '$lib/mock/data';
</script>

<section>
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-1.5">
			<div class="w-0.75 h-3.5 rounded-full bg-success" aria-hidden="true"></div>
			<span class="w-1.5 h-1.5 rounded-full bg-success/75 animate-pulse" aria-hidden="true"></span>
		</div>
		<a href="/discover" class="text-[12px] text-base-content/55 hover:text-success/80 transition-colors">
			See all →
		</a>
	</div>
	<p class="ml-3.5 mt-1.5 text-sm font-bold uppercase tracking-widest leading-tight text-base-content/90">Breaking Out</p>
	<p class="ml-3.5 mt-0.5 text-[12px] leading-normal text-base-content/65 max-w-105">Signals gaining momentum — help them spread</p>

	<div class="mt-5 grid gap-4 pb-2 w-full" style="grid-template-columns: repeat(5, minmax(180px, 1fr));">
		{#each breakingOutItems as item (item.id)}
			<div class="group rounded-lg overflow-hidden border border-white/8 hover:border-success/30 cursor-pointer transition-all duration-200 os-card-breaking">
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
					{#if item.tag}
						<div class="absolute top-2 right-2 z-10">
							<span class="text-[9px] font-semibold px-1.5 py-0.5 rounded border border-success/25 text-success/70 leading-none" style="background: rgba(0,0,0,0.38); backdrop-filter: blur(4px);">{item.tag}</span>
						</div>
					{/if}
					<div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
						<div class="w-8 h-8 rounded-full bg-white/22 border border-white/38 text-white flex items-center justify-center backdrop-blur-sm scale-90 group-hover:scale-100 transition-transform duration-200">
							<svg class="w-3.5 h-3.5 translate-x-px" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
								<path d="M3 2l8 4-8 4V2z" />
							</svg>
						</div>
					</div>
				</div>
				<div class="p-2.5 bg-base-200/70">
					<p class="text-[13px] font-bold text-base-content/95 truncate leading-snug">{item.title}</p>
					<p class="text-[11px] text-base-content/68 truncate mt-1">{item.artist} · {item.genre}</p>
					{#if item.weeklyScouts !== undefined}
						<p class="text-[11px] font-medium mt-1.5 truncate" style="color: oklch(0.74 0.17 158 / 0.80);">
							+{item.weeklyScouts} scouts this week
						</p>
					{/if}
					{#if item.resonance !== undefined}
						<div class="mt-2 h-px rounded-full bg-white/8 overflow-hidden">
							<div
								class="h-full rounded-full bg-linear-to-r from-success/38 to-accent/28"
								style="width: {item.resonance}%;"
							></div>
						</div>
					{/if}
				</div>
			</div>
		{/each}
	</div>
</section>
