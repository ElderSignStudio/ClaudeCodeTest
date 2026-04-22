<script lang="ts">
	import { Radio, RefreshCw } from 'lucide-svelte';
	import { oneStepAwayItems } from '$lib/mock/data';
</script>

<section>
	<div class="flex items-start justify-between w-full">
		<div class="flex items-start gap-3">
			<div class="mt-0.5 w-0.5 h-5 rounded-full bg-accent shrink-0" aria-hidden="true"></div>
			<div>
				<p class="text-sm font-bold uppercase tracking-widest leading-tight text-base-content/90">One Step Away</p>
				<p class="mt-0.5 text-[12px] leading-normal text-base-content/65 max-w-105">Signals discovered by scouts just outside your taste orbit</p>
			</div>
		</div>
		<a href="/discover" class="group flex items-center gap-1.5 text-[12px] text-base-content/55 hover:text-base-content/75 transition-colors shrink-0" style="margin-right: clamp(0px, 6vw - 48px, 120px);">
			Refresh
			<RefreshCw size={11} class="opacity-80 transition-transform duration-500 group-hover:rotate-180 group-hover:opacity-100" />
		</a>
	</div>

	<div class="mt-5 grid gap-4 pb-2 w-full" style="grid-template-columns: repeat(6, minmax(150px, 1fr));">
		{#each oneStepAwayItems as item (item.id)}
			<div class="group relative rounded-lg overflow-hidden border border-white/8 hover:border-accent/28 cursor-pointer transition-all duration-200 os-card-glow">
				<div
					class="absolute left-0 top-0 bottom-0 w-0.75 bg-accent/30 group-hover:bg-accent/55 transition-colors duration-200 z-10"
					aria-hidden="true"
				></div>
				<div class="relative w-full aspect-square">
					<img
						src={item.image}
						alt={item.title}
						class="w-full h-full object-cover opacity-65 group-hover:opacity-82 transition-opacity duration-300"
					/>
					<div class="absolute inset-0 bg-linear-to-t from-black/78 via-black/18 to-transparent"></div>
					<div class="absolute inset-0 bg-linear-to-br from-accent/10 to-transparent mix-blend-color"></div>
					<div
						class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-250 pointer-events-none"
						style="background: radial-gradient(circle at 50% 50%, oklch(0.72 0.16 220 / 0.09) 0%, transparent 65%);"
						aria-hidden="true"
					></div>
					<div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
						<div class="w-7 h-7 rounded-full bg-white/20 border border-white/35 text-white flex items-center justify-center backdrop-blur-sm scale-90 group-hover:scale-100 transition-transform duration-200">
							<svg class="w-3 h-3 translate-x-px" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
								<path d="M3 2l8 4-8 4V2z" />
							</svg>
						</div>
					</div>
				</div>
				<div class="pt-2.5 pr-2.5 pb-2 pl-3.5 bg-base-200/70">
					<p class="text-[13px] font-bold text-base-content/95 truncate leading-snug">{item.title}</p>
					<p class="text-[11px] text-base-content/68 truncate mt-1">{item.artist}</p>
					{#if item.adjacencyReason}
						<div class="h-9 mt-1.5 overflow-hidden">
							<div class="rounded py-1 px-1.5" style="background: oklch(0.72 0.16 220 / 0.09);">
								<p class="text-[10px] font-semibold line-clamp-2 leading-snug" style="color: oklch(0.72 0.16 220 / 0.92);"><span style="font-size: 8px; opacity: 0.40; margin-right: 2px;">↗</span>{item.adjacencyReason}</p>
							</div>
						</div>
					{/if}
					<p class="text-[10px] text-base-content/45 truncate mt-2.5">{item.genre}</p>
					<div class="flex justify-end mt-2">
						<button
							class="flex items-center gap-1 h-5 px-2 rounded-full text-[10px] font-semibold text-accent/75 border border-accent/28 hover:bg-accent/12 hover:border-accent/50 hover:text-accent transition-all"
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
