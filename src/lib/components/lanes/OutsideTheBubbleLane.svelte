<script lang="ts">
	import { Radio, RefreshCw } from 'lucide-svelte';
	import { outsideBubbleItems } from '$lib/mock/data';

	const bubbleFeatured = outsideBubbleItems.find(i => i.featured)!;
	const bubbleSupporting = outsideBubbleItems.filter(i => !i.featured);
</script>

<section class="pt-6 pb-2">
	<div class="flex items-start justify-between w-full">
		<div class="flex items-start gap-3">
			<!-- Cyan section mark — this lane is cold, not warm like Breaking Out -->
			<div class="mt-0.5 w-0.5 h-5 rounded-full bg-cyan-400/55 shrink-0" aria-hidden="true"></div>
			<div>
				<p class="text-sm font-bold uppercase tracking-widest leading-tight text-base-content/95">Outside the Bubble</p>
				<p class="mt-0.5 text-[13px] leading-normal text-base-content/72 max-w-105">Signals that crossed into your branch from distant scenes</p>
			</div>
		</div>
		<a href="/discover" class="group flex items-center gap-1.5 text-[13px] text-base-content/75 hover:text-base-content/90 transition-colors shrink-0" style="margin-right: clamp(0px, 6vw - 48px, 120px);">
			Refresh
			<RefreshCw size={11} class="opacity-90 transition-transform duration-500 group-hover:rotate-180 group-hover:opacity-100" />
		</a>
	</div>

	<div class="mt-5 grid gap-6 items-stretch" style="grid-template-columns: 1.6fr 1fr;">

		<!-- ── Hero card (left) ── -->
		<div
			class="group relative rounded-xl overflow-hidden cursor-pointer border border-cyan-300/22 min-h-44 h-full transition-transform duration-400 hover:-translate-y-0.5"
			style="box-shadow: 0 0 0 1px oklch(0.72 0.16 220 / 0.10), 0 14px 40px rgba(0,0,0,0.32), 0 2px 8px rgba(0,0,0,0.22);"
		>
			<img
				src={bubbleFeatured.image}
				alt={bubbleFeatured.title}
				class="absolute inset-0 w-full h-full object-cover opacity-63 group-hover:opacity-75 transition-opacity duration-500"
			/>
			<!-- Cold tint overlay — cyan instead of warm yellow -->
			<div class="absolute inset-0 bg-linear-to-br from-cyan-400/6 to-transparent mix-blend-color"></div>
			<!-- Slightly darker bottom gradient for colder, more distant feel -->
			<div class="absolute inset-0 bg-linear-to-b from-black/32 via-transparent to-black/89"></div>
			<!-- Hover radial — cold cyan, not warm -->
			<div
				class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
				style="background: radial-gradient(ellipse at 50% 60%, oklch(0.72 0.16 220 / 0.07) 0%, transparent 65%);"
				aria-hidden="true"
			></div>

			<!-- Corner vignette — darkens card edges slightly, increases hero isolation -->
			<div
				class="absolute inset-0 pointer-events-none"
				style="background: radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(0,0,0,0.10) 100%);"
				aria-hidden="true"
			></div>

			<!-- Genre chip — muted, signal-metadata feel -->
			<div class="absolute top-3.5 left-3.5">
				<span class="text-[11px] font-medium text-white/64 border border-white/16 rounded-full px-2 py-0.5 bg-black/52 backdrop-blur-sm tracking-wide">
					{bubbleFeatured.genre}
				</span>
			</div>

			<!-- Play overlay -->
			<div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
				<div class="w-12 h-12 rounded-full bg-white/14 border border-white/28 text-white flex items-center justify-center backdrop-blur-sm scale-90 group-hover:scale-100 transition-transform duration-200">
					<svg class="w-4 h-4 translate-x-px" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
						<path d="M3 2l8 4-8 4V2z" />
					</svg>
				</div>
			</div>

			<!-- Bottom text block -->
			<div class="absolute bottom-0 left-0 right-0 px-4 pb-3.5 pt-10">
				<p class="text-[22px] font-extrabold text-white leading-tight tracking-tight mb-1">{bubbleFeatured.title}</p>
				<p class="text-[12px] text-white/58 mb-2">{bubbleFeatured.artist}</p>

				<!--
					Scene-crossing metadata — monospace so it reads like routing information
					rather than editorial copy. Very dim: a technical signal, not a headline.
				-->
				{#if bubbleFeatured.crossingPath}
					<p class="font-mono text-[11px] text-cyan-300/58 mb-3.5 tracking-wide">{bubbleFeatured.crossingPath}</p>
				{/if}

				<!--
					CROSSING PATHS: replaces "WHY THIS IS HERE".
					Label is tiny, uppercase, muted. Explanatory line is calm prose, not promotional.
				-->
				{#if bubbleFeatured.whyHere}
					<div class="mb-4">
						<p class="text-[10px] font-semibold uppercase tracking-widest mb-1.5 text-cyan-300/52">Crossing paths</p>
						<p class="text-xs leading-relaxed text-white/78">{bubbleFeatured.whyHere}</p>
					</div>
				{/if}

				<button
					class="flex items-center gap-1.5 h-7 px-3 rounded-full text-[11px] font-semibold text-accent border border-accent/46 bg-black/40 hover:bg-accent/22 hover:border-accent/65 transition-all backdrop-blur-sm"
					aria-label="Amplify this signal"
				>
					<Radio size={10} />
					Amplify
				</button>
			</div>
		</div>

		<!-- ── Right column — stacked mini cards ── -->
		<div class="flex flex-col gap-5 pt-1 pl-3" style="border-left: 1px solid oklch(0.72 0.16 220 / 0.10);">

			{#each bubbleSupporting.slice(0, 2) as item (item.id)}
				<!--
					Hover adds a faint cyan border ring — "nearby anomaly" feel.
					-mx-1.5 + px-1.5 so the ring extends slightly beyond the text column.
				-->
				<div class="group flex gap-3 cursor-pointer rounded-lg px-1.5 py-1.5 -mx-1.5 border border-transparent hover:bg-cyan-400/4 hover:border-cyan-300/8 transition-all duration-250">

					<!-- Thumbnail — slightly taller than before (h-16 vs h-14) -->
					<div class="relative w-20 h-16 rounded-md overflow-hidden shrink-0">
						<img
							src={item.image}
							alt={item.title}
							class="absolute inset-0 w-full h-full object-cover opacity-58 group-hover:opacity-80 transition-opacity duration-300"
						/>
						<div class="absolute inset-0 bg-linear-to-br from-cyan-400/6 to-transparent mix-blend-color"></div>
						<div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
							<div class="w-6 h-6 rounded-full bg-white/18 border border-white/30 text-white flex items-center justify-center backdrop-blur-sm">
								<svg class="w-2.5 h-2.5 translate-x-px" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
									<path d="M3 2l8 4-8 4V2z" />
								</svg>
							</div>
						</div>
					</div>

					<!-- Text block: title → crossing path → explanation → Amplify -->
					<div class="flex-1 min-w-0 flex flex-col justify-center">
						<p class="text-[13px] font-semibold text-base-content/88 leading-snug truncate">{item.title}</p>

						<!--
							Scene-crossing path — monospace, reads like routing metadata.
							More prominent than artist name; less prominent than title.
						-->
						{#if item.crossingPath}
							<p class="font-mono text-[11px] text-cyan-300/55 mt-0.5 tracking-wide">{item.crossingPath}</p>
						{/if}

						{#if item.whyHere}
							<p class="text-[12px] leading-normal text-base-content/68 mt-1.5 mb-2 line-clamp-2">{item.whyHere}</p>
						{/if}

						<button
							class="self-start flex items-center gap-1 h-5 px-2 rounded-full text-[11px] font-semibold text-accent/82 border border-accent/36 hover:bg-accent/16 hover:border-accent/54 hover:text-accent transition-all"
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
