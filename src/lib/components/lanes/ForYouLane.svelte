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

<section class="relative">
	<!-- Dark substrate: full-section wash with asymmetric center; calms local starfield noise -->
	<div class="absolute inset-0 pointer-events-none" aria-hidden="true" style="background:radial-gradient(ellipse 90% 110% at 28% 55%,rgba(0,0,0,0.085) 0%,transparent 75%);"></div>
	<!-- Best Picks atmosphere: faint cool-blue resonance field, left-anchored behind hero -->
	<div class="absolute pointer-events-none" aria-hidden="true" style="width:860px;height:660px;left:-4%;top:-25%;background:radial-gradient(ellipse at center,rgba(56,118,255,0.100) 0%,transparent 65%);filter:blur(120px);"></div>
	<div class="absolute pointer-events-none" aria-hidden="true" style="width:560px;height:420px;right:2%;bottom:-18%;background:radial-gradient(ellipse at center,rgba(120,180,255,0.055) 0%,transparent 65%);filter:blur(105px);"></div>

	<div class="flex items-start justify-between w-full">
		<div class="flex items-start gap-3">
			<div class="mt-0.5 w-0.5 h-5 rounded-full bg-primary shrink-0" aria-hidden="true"></div>
			<div>
				<p class="text-sm font-bold uppercase tracking-widest leading-tight text-base-content/90">Best picks for you</p>
				<p class="mt-0.5 text-[13px] leading-normal text-base-content/72 max-w-105">Signals resonating closest to your orbit</p>
			</div>
		</div>
		<a href="/discover" class="group flex items-center gap-1.5 text-[13px] text-base-content/75 hover:text-base-content/90 transition-colors shrink-0" style="margin-right: clamp(0px, 6vw - 48px, 120px);">
			Refresh
			<RefreshCw size={11} class="opacity-90 transition-transform duration-500 group-hover:rotate-180 group-hover:opacity-100" />
		</a>
	</div>

	<div class="mt-5 grid gap-4 pb-2 w-full items-start" style="grid-template-columns: minmax(320px, 1.55fr) repeat(4, minmax(170px, 1fr));">

		<!--
			Hero card — the strongest current resonance near the user's orbit.

			Layout: flex-col, min-h-72, image absolute on card root (covers the full
			card including the text zone). The spacer div (flex-1 min-h-44) creates the
			visual "artwork only" zone and hosts the pill + play overlay. The text block
			sits in normal flow below the spacer with no background — the image and
			feathered gradient show through it, so the artwork bleeds seamlessly into the
			content area. No hard edge; no panel.
		-->
		<div class="group relative rounded-xl overflow-hidden cursor-pointer border border-primary/36 os-hero-card flex flex-col min-h-72">

			<!--
				Image covers the ENTIRE card (spacer + text zone) via absolute inset-0
				on the card root. This is what allows the artwork to bleed into the
				lower content area without any visible seam.
			-->
			<img
				src={featuredItem.image}
				alt={featuredItem.title}
				class="absolute inset-0 w-full h-full object-cover opacity-96 transition-transform duration-700 group-hover:scale-105"
				style="filter: brightness(1.03) contrast(1.04);"
			/>
			<!-- Tonal colour wash — full card -->
			<div class="absolute inset-0 bg-linear-to-br from-primary/28 via-transparent to-secondary/14"></div>
			<!--
				Feathered bottom gradient — three-stop fade across the full card height.
				Transparent near the top third, soft mid-transition at ~65%, settles at
				black/82 at the very bottom. Creates cinematic depth without segmentation.
			-->
			<div class="absolute inset-0" style="background: linear-gradient(to bottom, rgba(0,0,0,0) 38%, rgba(0,0,0,0.37) 66%, rgba(0,0,0,0.74) 100%);" aria-hidden="true"></div>
			<!-- Edge darkening -->
			<div class="absolute inset-0" style="background: radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.12) 100%);" aria-hidden="true"></div>
			<!-- Ambient glow breath (17s cycle, opacity-only) -->
			<div
				class="bp-hero-ambient absolute inset-0 pointer-events-none"
				style="background: radial-gradient(ellipse at 45% 78%, oklch(0.68 0.20 265 / 0.07) 0%, transparent 55%);"
				aria-hidden="true"
			></div>
			<!-- Rare shimmer sweep (~42s cycle) -->
			<div
				class="bp-hero-shimmer absolute inset-y-0 left-0 pointer-events-none"
				style="width: 38%; background: linear-gradient(to right, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%);"
				aria-hidden="true"
			></div>
			<!--
				Reading pocket — localized radial gradient centered on the bottom-left
				text cluster. Not a panel; not a rectangle. Soft elliptical shape with
				heavily feathered edges. Strongest directly behind the text (0.62 opacity),
				fades smoothly to transparent at 75% radius. The 85% horizontal extent
				covers the full title width; the 58% vertical extent reaches up into the
				image area above the text block.
			-->
			<div
				class="absolute inset-0 pointer-events-none"
				style="background: radial-gradient(ellipse 85% 58% at 18% 93%, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.28) 50%, transparent 75%);"
				aria-hidden="true"
			></div>
			<!--
				Left-side localized darkening — adds ~8–10% extra contrast only behind
				the text region. Fades to zero before reaching the right half of the card
				so the artwork is untouched on that side.
			-->
			<div
				class="absolute inset-0 pointer-events-none"
				style="background: linear-gradient(to right, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.08) 30%, transparent 60%);"
				aria-hidden="true"
			></div>

			<!--
				Spacer — establishes the image-viewing zone height.
				Pill and play overlay are positioned relative to this div.
			-->
			<div class="relative flex-1 min-h-44">
				<!-- Orbit state pill -->
				<div class="absolute top-3 right-3">
					<span class="text-[11px] font-medium tracking-wide text-primary/85 border border-primary/20 rounded-full px-2.5 py-1 bg-primary/7 backdrop-blur-sm">
						{featuredItem.orbitState ?? 'Closely Orbiting'}
					</span>
				</div>
				<!-- Play overlay -->
				<div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
					<div class="w-12 h-12 rounded-full bg-primary/32 border border-primary/62 text-primary flex items-center justify-center os-glow-interactive scale-90 group-hover:scale-100 transition-transform duration-200">
						<svg class="w-4 h-4 translate-x-px" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
							<path d="M3 2l8 4-8 4V2z" />
						</svg>
					</div>
				</div>
			</div>

			<!--
				Text block — no background. Image and feathered gradient show through.
				Artist line: lighter weight + reduced opacity + subtle tracking for
				softer secondary feel. Resonance line: lower opacity + more top space
				+ constrained width so it breathes rather than fills the block.
			-->
			<div class="relative px-3 pt-3.5 pb-3">
				<p
					class="text-[22px] font-extrabold text-white truncate leading-snug tracking-tight"
					style="text-shadow: 0 1px 12px rgba(0,0,0,0.80), 0 2px 4px rgba(0,0,0,0.50);"
				>{featuredItem.title}</p>
				<p
					class="text-[13px] font-normal text-white/90 truncate mt-2.5"
					style="text-shadow: 0 1px 8px rgba(0,0,0,0.75);"
				>{featuredItem.artist}</p>
				{#if featuredItem.resonanceContext}
					<p
						class="text-[12px] text-white/78 leading-loose mt-3.5 line-clamp-2 max-w-[88%]"
						style="text-shadow: 0 1px 8px rgba(0,0,0,0.70);"
					>{featuredItem.resonanceContext}</p>
				{/if}
				<div class="flex justify-end mt-4">
					<button
						class="flex items-center gap-1.5 h-7 px-3 rounded-full text-[11px] font-semibold text-accent/72 border border-accent/32 bg-black/22 hover:bg-accent/12 hover:border-accent/50 hover:text-accent/92 transition-all backdrop-blur-sm"
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
			<div class="group rounded-lg overflow-hidden cursor-pointer border border-white/8 hover:border-white/20 transition-all duration-250 os-card-refined">
				<div class="relative aspect-square w-full">
					<img
						src={item.image}
						alt={item.title}
						class="w-full h-full object-cover opacity-73 group-hover:opacity-88 transition-opacity duration-300"
						style="filter: brightness(1.025) contrast(1.03);"
					/>
					<div class={`absolute inset-0 bg-linear-to-br ${cardTints[i % cardTints.length]} mix-blend-color`}></div>
					<div class="absolute inset-0 bg-linear-to-t from-black/72 via-black/20 to-transparent"></div>
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
					<!--
						Artist · genre type on a single line — calmer than stacked metadata.
						Lowercase type ("album", "song") keeps the tone soft, not categorical.
					-->
					<p class="text-[13px] font-normal text-base-content/68 truncate mt-1">{item.artist}{item.type ? ` · ${item.genre} ${item.type.toLowerCase()}` : ` · ${item.genre}`}</p>
					<!--
						Resonance context — a whisper, not a reason.
						Reduced to /44 opacity and wider leading so it drifts rather than explains.
						line-clamp-2 preserves equal card heights.
					-->
					{#if item.resonanceContext}
						<p class="text-[12px] text-base-content/58 leading-relaxed mt-2.5 line-clamp-2">{item.resonanceContext}</p>
					{/if}
					<!--
						Amplify — present but not calling for attention.
						Dimmer than Breaking Out / One Step Away equivalents.
					-->
					<div class="flex justify-end mt-3">
						<button
							class="flex items-center gap-1 h-5 px-2 rounded-full text-[11px] font-semibold text-accent/68 border border-accent/25 hover:bg-accent/10 hover:border-accent/42 hover:text-accent/88 transition-all"
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
