<script lang="ts">
	import { driftItems } from '$lib/mock/data';

	const cardTints = [
		'from-primary/20 to-transparent',
		'from-accent/18 to-transparent',
		'from-secondary/18 to-transparent',
		'from-primary/15 via-accent/10 to-transparent',
	];
</script>

<section class="pb-4">
	<div class="flex items-center justify-between mb-4">
		<div class="flex items-center gap-2">
			<div class="w-0.75 h-3.5 rounded-full bg-primary/55" aria-hidden="true"></div>
			<p class="text-sm font-bold uppercase tracking-widest text-base-content/88">Explore / Drift</p>
		</div>
		<span class="text-[13px] text-base-content/72">Let the signal find you</span>
	</div>

	<div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
		{#each driftItems as item, i (item.id)}
			<div class="group relative rounded-lg overflow-hidden cursor-pointer border border-white/8 hover:border-white/22 transition-all duration-250 os-card-glow">
				<div class="relative aspect-square w-full">
					<img
						src={item.image}
						alt={item.title}
						class="w-full h-full object-cover opacity-73 group-hover:opacity-88 transition-opacity duration-300"
					/>
					<div class={`absolute inset-0 bg-linear-to-br ${cardTints[i % cardTints.length]} mix-blend-color`}></div>
					<div class="absolute inset-0 bg-linear-to-t from-black/74 via-black/20 to-transparent"></div>
					<div
						class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-250 pointer-events-none"
						style="background: radial-gradient(circle at 50% 50%, oklch(0.68 0.20 265 / 0.10) 0%, transparent 65%);"
						aria-hidden="true"
					></div>
					<div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
						<div class="w-8 h-8 rounded-full bg-white/20 border border-white/35 text-white flex items-center justify-center backdrop-blur-sm scale-90 group-hover:scale-100 transition-transform duration-200">
							<svg class="w-3.5 h-3.5 translate-x-px" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
								<path d="M3 2l8 4-8 4V2z" />
							</svg>
						</div>
					</div>
					<div class="absolute bottom-0 left-0 right-0 p-2.5">
						<p class="text-[13px] font-bold text-white truncate leading-snug">{item.title}</p>
						<p class="text-[12px] text-white/85 truncate mt-0.5">{item.genre}</p>
					</div>
				</div>
			</div>
		{/each}
	</div>
</section>
