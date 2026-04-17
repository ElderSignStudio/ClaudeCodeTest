<script lang="ts">
	import { Radio } from 'lucide-svelte';
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
	<div class="flex items-center justify-between mb-4">
		<div class="flex items-center gap-2">
			<div class="w-0.75 h-3.5 rounded-full bg-primary" aria-hidden="true"></div>
			<p class="text-sm font-bold uppercase tracking-widest text-base-content/90">For You</p>
		</div>
		<a href="/discover" class="text-[12px] text-base-content/55 hover:text-primary/80 transition-colors">
			See all →
		</a>
	</div>

	<div class="flex gap-3 overflow-x-auto -mx-5 px-5 pb-2 scrollbar-none items-start">

		<!-- Featured card -->
		<div class="group relative shrink-0 w-64 h-72 rounded-xl overflow-hidden cursor-pointer border border-primary/22 os-hero-card">
			<img
				src={featuredItem.image}
				alt={featuredItem.title}
				class="absolute inset-0 w-full h-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-105"
			/>
			<div class="absolute inset-0 bg-linear-to-br from-primary/22 via-transparent to-secondary/12"></div>
			<div class="absolute inset-0 bg-linear-to-b from-transparent via-black/10 to-black/80"></div>

			<div class="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
				<div class="absolute w-28 h-28 rounded-full" style="background: radial-gradient(circle, oklch(0.68 0.20 265 / 0.15) 0%, transparent 70%);"></div>
				<svg class="w-44 h-44 text-primary" viewBox="0 0 256 256" fill="none">
					<circle cx="128" cy="128" r="14" fill="currentColor" opacity="0.20" />
					<circle cx="128" cy="128" r="38" stroke="currentColor" stroke-width="1.25" opacity="0.13" />
					<circle cx="128" cy="128" r="68" stroke="currentColor" stroke-width="1" opacity="0.08" />
					<circle cx="128" cy="128" r="100" stroke="currentColor" stroke-width="0.75" opacity="0.04" />
				</svg>
			</div>

			<div class="absolute top-3 right-3">
				<span class="text-[10px] font-bold tracking-wide text-primary border border-primary/50 rounded-full px-2.5 py-1 bg-black/55 backdrop-blur-sm" style="box-shadow: var(--glow-l3-primary);">
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

			<div class="absolute bottom-0 left-0 right-0 px-3 pb-3 pt-12">
				<p class="text-[16px] font-extrabold text-white truncate leading-snug tracking-tight">{featuredItem.title}</p>
				<p class="text-[12px] text-white/72 truncate mt-1">{featuredItem.artist}</p>
				<p class="text-[10px] text-white/40 truncate mt-0.5">{featuredItem.genre}</p>
				<div class="flex justify-end mt-2">
					<button
						class="flex items-center gap-1.5 h-7 px-3 rounded-full text-[11px] font-semibold text-accent border border-accent/55 bg-black/50 hover:bg-accent/22 hover:border-accent/72 transition-all os-glow-interactive-accent backdrop-blur-sm"
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
			<div class="group shrink-0 w-40 rounded-lg overflow-hidden cursor-pointer border border-white/8 hover:border-white/22 transition-all duration-250 os-card-glow">
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
					<p class="text-[11px] text-base-content/70 truncate mt-0.5">{item.artist}</p>
					<p class="text-[10px] text-base-content/45 truncate mt-0.5">{item.genre}{item.type ? ` · ${item.type}` : ''}</p>
					<div class="flex justify-end mt-1.5">
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
