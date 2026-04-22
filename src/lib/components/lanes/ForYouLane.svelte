<script lang="ts">
	import { Radio, RefreshCw } from 'lucide-svelte';
	import { forYouItems } from '$lib/mock/data';

	const featuredItem = forYouItems.find(i => i.featured)!;
	const regularItems = forYouItems.filter(i => !i.featured);

	const cardTints = [
		'from-primary/20 to-transparent',
		'from-accent/18 to-transparent',
		'from-secondary/18 to-transparent',
		'from-primary/15 via-accent/10 to-transparent',
	];
</script>

<section>
	<div class="flex items-center justify-between">
		<div class="w-0.75 h-3.5 rounded-full bg-primary" aria-hidden="true"></div>
		<a href="/discover" class="group flex items-center gap-1.5 text-[12px] text-base-content/55 hover:text-base-content/75 transition-colors">
			Refresh
			<RefreshCw size={11} class="opacity-80 transition-transform duration-500 group-hover:rotate-180 group-hover:opacity-100" />
		</a>
	</div>
	<p class="ml-3.5 mt-1.5 text-sm font-bold uppercase tracking-widest leading-tight text-base-content/90">Best picks for you</p>
	<p class="ml-3.5 mt-0.5 text-[12px] leading-normal text-base-content/65 max-w-105">Signals picked for your taste</p>

	<div class="mt-5 grid gap-4 pb-2 w-full items-start" style="grid-template-columns: minmax(320px, 1.55fr) repeat(4, minmax(170px, 1fr));">

		<!-- Featured card -->
		<div class="group relative h-72 rounded-xl overflow-hidden cursor-pointer border border-primary/22 os-hero-card">
			<img
				src={featuredItem.image}
				alt={featuredItem.title}
				class="absolute inset-0 w-full h-full object-cover opacity-85 transition-transform duration-700 group-hover:scale-105"
			/>
			<div class="absolute inset-0 bg-linear-to-br from-primary/22 via-transparent to-secondary/12"></div>
			<div class="absolute inset-0" style="background: linear-gradient(to bottom, transparent 65%, rgba(0,0,0,0.72) 100%);" aria-hidden="true"></div>
			<div class="absolute inset-0" style="background: radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.18) 100%);" aria-hidden="true"></div>

			<div class="absolute top-3 right-3">
				<span class="text-[10px] font-medium tracking-wide text-primary/48 border border-primary/15 rounded-full px-2.5 py-1 bg-black/22 backdrop-blur-sm">
					Pick
				</span>
			</div>
			<div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
				<div class="w-12 h-12 rounded-full bg-primary/32 border border-primary/62 text-primary flex items-center justify-center os-glow-interactive scale-90 group-hover:scale-100 transition-transform duration-200">
					<svg class="w-4 h-4 translate-x-px" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
						<path d="M3 2l8 4-8 4V2z" />
					</svg>
				</div>
			</div>

			<div class="absolute bottom-0 left-0 right-0 px-3 pb-1.5 pt-5">
				<p class="text-[22px] font-extrabold text-white truncate leading-snug tracking-tight">{featuredItem.title}</p>
				<p class="text-[12px] text-white/68 truncate mt-3">{featuredItem.artist}</p>
				<div class="flex justify-end mt-2">
					<button
						class="flex items-center gap-1.5 h-7 px-3 rounded-full text-[11px] font-semibold text-accent/58 border border-accent/22 bg-black/22 hover:bg-accent/12 hover:border-accent/45 hover:text-accent/85 transition-all backdrop-blur-sm"
						aria-label="Amplify this signal"
					>
						<Radio size={10} />
						Amplify
					</button>
				</div>
			</div>
		</div>

		<!-- Standard cards -->
		{#each regularItems as item, i (item.id)}
			<div class="group rounded-lg overflow-hidden cursor-pointer border border-white/8 hover:border-white/22 transition-all duration-250 os-card-glow">
				<div class="relative aspect-square w-full">
					<img
						src={item.image}
						alt={item.title}
						class="w-full h-full object-cover opacity-68 group-hover:opacity-85 transition-opacity duration-300"
					/>
					<div class={`absolute inset-0 bg-linear-to-br ${cardTints[i % cardTints.length]} mix-blend-color`}></div>
					<div class="absolute inset-0 bg-linear-to-t from-black/82 via-black/25 to-transparent"></div>
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
				</div>
				<div class="px-2.5 pt-2.5 pb-2 bg-base-200/70">
					<p class="text-[13px] font-bold text-base-content/95 truncate leading-snug">{item.title}</p>
					<p class="text-[11px] text-base-content/70 truncate mt-1">{item.artist}</p>
					<p class="text-[10px] text-base-content/45 truncate mt-2">{item.genre}{item.type ? ` — ${item.type}` : ''}</p>
					<div class="flex justify-end mt-3">
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
