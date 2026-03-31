<script lang="ts">
	import { originItems } from '$lib/mock/data';
</script>

<section>
	<div class="flex items-center justify-between mb-4">
		<div class="flex items-center gap-2">
			<div class="w-0.75 h-3.5 rounded-full bg-secondary" aria-hidden="true"></div>
			<p class="text-sm font-bold uppercase tracking-widest text-base-content/88">Origin Stories</p>
		</div>
		<span class="text-[12px] text-base-content/65">How signals spread</span>
	</div>

	<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
		{#each originItems as item (item.id)}
			<div class="group flex gap-3.5 rounded-lg p-4 cursor-pointer bg-base-300/42 border border-white/6 hover:border-white/14 hover:bg-white/4 transition-all duration-200">
				<div class="shrink-0 w-12 h-12 rounded-md overflow-hidden border border-white/10 self-start">
					<img
						src={item.image}
						alt=""
						class="w-full h-full object-cover opacity-62 group-hover:opacity-80 transition-opacity"
					/>
				</div>
				<div class="flex-1 min-w-0">
					<p class="text-[13px] font-bold text-base-content/95 truncate">{item.title}</p>
					<p class="text-[12px] text-base-content/70 truncate mt-0.5">{item.artist} · {item.genre}</p>
					<p class="text-[12px] text-base-content/62 italic mt-2 leading-relaxed">{item.branch}</p>
					<div class="flex items-center gap-2 mt-2.5">
						<span class="text-[11px] text-base-content/55">Reached {item.reachedScouts} scouts</span>
						<span class="text-[11px] text-base-content/28">·</span>
						<span class="text-[11px] text-base-content/52">{item.discoveries} independent {item.discoveries === 1 ? 'discovery' : 'discoveries'}</span>
					</div>
				</div>
			</div>
		{/each}
	</div>
</section>
