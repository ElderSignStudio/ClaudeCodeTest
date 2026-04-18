<script lang="ts">
	import { Radio } from 'lucide-svelte';
	import { outsideBubbleItems } from '$lib/mock/data';

	const bubbleFeatured = outsideBubbleItems.find(i => i.featured)!;
	const bubbleSupporting = outsideBubbleItems.filter(i => !i.featured);
</script>

<section>
	<div class="flex items-center justify-between mb-1">
		<div class="flex items-center gap-2">
			<div class="w-0.75 h-3.5 rounded-full bg-warning/70" aria-hidden="true"></div>
			<p class="text-sm font-bold uppercase tracking-widest text-base-content/88">Outside the Bubble</p>
		</div>
		<a href="/discover" class="text-[12px] text-base-content/45 hover:text-base-content/70 transition-colors">
			Refresh picks →
		</a>
	</div>
	<p class="text-[12px] text-base-content/50 mb-5 ml-3.5">This is intentionally not your usual thing — you might find a new world</p>

	<div class="grid gap-4 items-stretch" style="grid-template-columns: 3fr 2fr;">

		<!-- Feature card (left, ~60% width) -->
		<div
			class="group relative rounded-xl overflow-hidden cursor-pointer border border-warning/18 min-h-56 transition-transform duration-400 hover:-translate-y-0.5"
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
			<div class="absolute top-3.5 right-3.5">
				<span class="text-[10px] font-bold rounded-full px-2.5 py-1 border bg-black/55 backdrop-blur-sm" style="color: var(--color-warning); border-color: oklch(0.78 0.17 78 / 0.45);">
					Unexpected
				</span>
			</div>

			<div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
				<div class="w-12 h-12 rounded-full bg-white/18 border border-white/32 text-white flex items-center justify-center backdrop-blur-sm scale-90 group-hover:scale-100 transition-transform duration-200">
					<svg class="w-4 h-4 translate-x-px" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
						<path d="M3 2l8 4-8 4V2z" />
					</svg>
				</div>
			</div>

			<div class="absolute bottom-0 left-0 right-0 px-5 pb-5 pt-14">
				<p class="text-[22px] font-extrabold text-white leading-tight tracking-tight mb-0.5">{bubbleFeatured.title}</p>
				<p class="text-[12px] text-white/58 mb-4">{bubbleFeatured.artist} · {bubbleFeatured.genre} · {bubbleFeatured.scouts} scouts</p>
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

		<!-- Supporting cards (right, stacked) -->
		<div class="flex flex-col gap-4 h-full">
			{#each bubbleSupporting.slice(0, 2) as item (item.id)}
				<div class="group relative flex-1 rounded-xl overflow-hidden cursor-pointer border border-white/8 hover:border-warning/22 transition-all duration-250 os-card-glow">
					<img
						src={item.image}
						alt={item.title}
						class="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-78 transition-opacity duration-400"
					/>
					<div class="absolute inset-0 bg-linear-to-br from-warning/10 to-transparent mix-blend-color"></div>
					<div class="absolute inset-0 bg-linear-to-t from-black/88 via-black/30 to-transparent"></div>
					<div
						class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-250 pointer-events-none"
						style="background: radial-gradient(circle at 50% 50%, oklch(0.78 0.17 78 / 0.07) 0%, transparent 65%);"
						aria-hidden="true"
					></div>
					<div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
						<div class="w-8 h-8 rounded-full bg-white/18 border border-white/30 text-white flex items-center justify-center backdrop-blur-sm scale-90 group-hover:scale-100 transition-transform duration-200">
							<svg class="w-3.5 h-3.5 translate-x-px" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
								<path d="M3 2l8 4-8 4V2z" />
							</svg>
						</div>
					</div>
					<div class="absolute bottom-0 left-0 right-0 px-3.5 pb-3.5 pt-8">
						<p class="text-[14px] font-bold text-white leading-snug truncate">{item.title}</p>
						<p class="text-[11px] text-white/55 truncate mt-0.5 mb-2">{item.artist} · {item.genre}</p>
						{#if item.whyHere}
							<p class="text-[11px] leading-snug" style="color: oklch(0.78 0.17 78 / 0.80);">{item.whyHere}</p>
						{/if}
					</div>
				</div>
			{/each}
		</div>

	</div>
</section>
