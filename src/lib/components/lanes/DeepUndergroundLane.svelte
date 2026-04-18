<script lang="ts">
	import { deepUndergroundItems } from '$lib/mock/data';
</script>

<section>
	<div class="flex items-center mb-1">
		<div class="flex items-center gap-2">
			<div class="w-0.75 h-3.5 rounded-full bg-secondary/60" aria-hidden="true"></div>
			<p class="text-sm font-bold uppercase tracking-widest text-base-content/85">Deep Underground</p>
		</div>
	</div>
	<p class="text-[12px] text-base-content/45 mb-4 ml-3.5">Signals barely discovered anywhere — find them first</p>

	<div class="flex gap-2 overflow-x-auto -mx-5 px-5 pb-2 scrollbar-none">
		{#each deepUndergroundItems as item (item.id)}
			<div class="group shrink-0 w-32 rounded-lg overflow-hidden border border-white/6 hover:border-white/14 cursor-pointer transition-colors duration-300">
				<div class="relative w-full aspect-square">
					<img
						src={item.image}
						alt={item.title}
						class="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity duration-500"
					/>
					<div class="absolute inset-0 bg-linear-to-t from-black/88 via-black/25 to-black/20"></div>
					<div
						class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
						style="background: radial-gradient(circle at 50% 50%, oklch(0.75 0.04 265 / 0.07) 0%, transparent 60%);"
						aria-hidden="true"
					></div>
					<div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
						<div class="w-6 h-6 rounded-full bg-white/15 border border-white/28 text-white flex items-center justify-center scale-90 group-hover:scale-100 transition-transform duration-200">
							<svg class="w-2.5 h-2.5 translate-x-px" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
								<path d="M3 2l8 4-8 4V2z" />
							</svg>
						</div>
					</div>
				</div>
				<div class="p-2 bg-base-300/70">
					<p class="text-[11px] font-semibold text-base-content/88 truncate leading-snug">{item.title}</p>
					<p class="text-[10px] text-base-content/60 truncate mt-0.5">{item.artist}</p>
					<p class="text-[9px] text-base-content/48 mt-1.5">{item.scouts} scout{item.scouts === 1 ? '' : 's'}</p>
					{#if item.tags && item.tags.length > 0}
						<span class="inline-block text-[8px] font-medium px-1 py-0.5 rounded border border-white/10 text-base-content/45 leading-none mt-1.5">{item.tags[0]}</span>
					{/if}
				</div>
			</div>
		{/each}
	</div>
</section>
