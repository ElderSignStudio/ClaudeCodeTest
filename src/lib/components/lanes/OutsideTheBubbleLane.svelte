<script lang="ts">
	import { Radio } from 'lucide-svelte';
	import { outsideBubbleItems } from '$lib/mock/data';

	const bubbleFeatured = outsideBubbleItems.find(i => i.featured)!;
	const bubbleSupporting = outsideBubbleItems.filter(i => !i.featured);
</script>

<section>
	<div class="flex items-center justify-between mb-2">
		<div class="flex items-center gap-2">
			<div class="w-0.75 h-3.5 rounded-full bg-warning/70" aria-hidden="true"></div>
			<p class="text-sm font-bold uppercase tracking-widest leading-relaxed text-base-content/88">Outside the Bubble</p>
		</div>
	</div>
	<p class="text-[12px] leading-relaxed text-base-content/50 mb-6 ml-3.5">This is intentionally not your usual thing — you might find a new world</p>

	<div class="grid gap-4 items-stretch" style="grid-template-columns: 6fr 5fr;">

		<!-- Featured card (left) -->
		<div
			class="group relative rounded-xl overflow-hidden cursor-pointer border border-warning/18 min-h-44 h-full transition-transform duration-400 hover:-translate-y-0.5"
			style="box-shadow: 0 0 0 1px oklch(0.78 0.17 78 / 0.10), 0 6px 32px -6px oklch(0 0 0 / 0.55);"
		>
			<img
				src={bubbleFeatured.image}
				alt={bubbleFeatured.title}
				class="absolute inset-0 w-full h-full object-cover opacity-68 group-hover:opacity-80 transition-opacity duration-500"
			/>
			<div class="absolute inset-0 bg-linear-to-br from-warning/14 to-transparent mix-blend-color"></div>
			<div class="absolute inset-0 bg-linear-to-b from-black/30 via-transparent to-black/90"></div>
			<div
				class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
				style="background: radial-gradient(ellipse at 50% 60%, oklch(0.78 0.17 78 / 0.09) 0%, transparent 65%);"
				aria-hidden="true"
			></div>

			<div class="absolute top-3.5 left-3.5">
				<span class="text-[10px] font-semibold text-white/70 border border-white/15 rounded-full px-2 py-0.5 bg-black/48 backdrop-blur-sm">
					{bubbleFeatured.genre}
				</span>
			</div>

			<div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
				<div class="w-12 h-12 rounded-full bg-white/18 border border-white/32 text-white flex items-center justify-center backdrop-blur-sm scale-90 group-hover:scale-100 transition-transform duration-200">
					<svg class="w-4 h-4 translate-x-px" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
						<path d="M3 2l8 4-8 4V2z" />
					</svg>
				</div>
			</div>

			<div class="absolute bottom-0 left-0 right-0 px-4 pb-3.5 pt-10">
				<p class="text-[22px] font-extrabold text-white leading-tight tracking-tight mb-0.5">{bubbleFeatured.title}</p>
				<p class="text-[12px] text-white/58 mb-4">{bubbleFeatured.artist} · {bubbleFeatured.genre}{bubbleFeatured.type ? ` — ${bubbleFeatured.type}` : ''}</p>
				{#if bubbleFeatured.whyHere}
					<div class="mb-4">
						<p class="text-[9px] font-bold uppercase tracking-widest mb-1.5" style="color: oklch(0.78 0.17 78 / 0.55);">Why this is here</p>
						<p class="text-[13px] leading-relaxed" style="color: oklch(0.78 0.17 78 / 0.88);">{bubbleFeatured.whyHere}</p>
					</div>
				{/if}
				<button
					class="flex items-center gap-1.5 h-7 px-3 rounded-full text-[11px] font-semibold text-accent border border-accent/42 bg-black/40 hover:bg-accent/18 hover:border-accent/62 transition-all os-glow-interactive-accent backdrop-blur-sm"
					aria-label="Amplify this signal"
				>
					<Radio size={10} />
					Amplify
				</button>
			</div>
		</div>

		<!-- Editorial right column — horizontal rows -->
		<div class="flex flex-col gap-5 pt-1 pl-3" style="border-left: 1px solid oklch(0.78 0.17 78 / 0.11);">

			{#each bubbleSupporting.slice(0, 2) as item (item.id)}
				<div class="group flex gap-3 cursor-pointer">

					<!-- Square thumbnail -->
					<div class="relative w-20 h-14 rounded-md overflow-hidden shrink-0">
						<img
							src={item.image}
							alt={item.title}
							class="absolute inset-0 w-full h-full object-cover opacity-58 group-hover:opacity-75 transition-opacity duration-300"
						/>
						<div class="absolute inset-0 bg-linear-to-br from-warning/8 to-transparent mix-blend-color"></div>
						<div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
							<div class="w-5 h-5 rounded-full bg-white/20 border border-white/32 text-white flex items-center justify-center backdrop-blur-sm">
								<svg class="w-2 h-2 translate-x-px" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
									<path d="M3 2l8 4-8 4V2z" />
								</svg>
							</div>
						</div>
					</div>

					<!-- Text block -->
					<div class="flex-1 min-w-0 flex flex-col">
						<p class="text-[13px] font-semibold text-base-content/88 leading-snug truncate">{item.title}</p>
						<p class="text-[11px] text-base-content/40 mt-0.5 mb-2">{item.artist}</p>
						{#if item.whyHere}
							<p class="text-[10px] text-base-content/34 mb-0.5">Why this</p>
							<p class="text-[11px] leading-normal text-base-content/64 mb-2.5">{item.whyHere}</p>
						{/if}
						<button
							class="self-start flex items-center gap-1 h-5 px-2 rounded-full text-[10px] font-semibold text-accent/60 border border-accent/18 hover:bg-accent/10 hover:border-accent/35 hover:text-accent transition-all"
							aria-label="Amplify this signal"
						>
							<Radio size={7} />
							Amplify
						</button>
					</div>

				</div>
			{/each}
		</div>

	</div>
</section>
