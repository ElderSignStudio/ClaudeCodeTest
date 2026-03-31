<script lang="ts">
	import { Radio, TrendingUp, ArrowUpRight } from 'lucide-svelte';
	import {
		forYouItems, oneStepAwayItems, deepUndergroundItems,
		breakingOutItems, scoutItems, outsideBubbleItems,
		originItems, driftItems,
	} from '$lib/mock/data';
	import ScoutCard from '$lib/components/ScoutCard.svelte';

	function getGreeting(): string {
		const hour = new Date().getHours();
		if (hour < 12) return 'Good morning.';
		if (hour < 17) return 'Good afternoon.';
		return 'Good evening.';
	}

	const filters = ['All', 'Ambient', 'Drone', 'Experimental', 'Electronic', 'Folk'];
	let activeFilter = $state('All');

	const featuredItem = forYouItems.find(i => i.featured)!;
	const regularItems = forYouItems.filter(i => !i.featured);

	const bubbleFeatured = outsideBubbleItems.find(i => i.featured)!;
	const bubbleSupporting = outsideBubbleItems.filter(i => !i.featured);

	/*
		Each regular card gets a different color tint so they feel varied,
		not uniformly grey. Tint indices cycle through primary/accent/secondary.
		This is pure visual — no semantic meaning.
	*/
	const cardTints = [
		'from-primary/20 to-transparent',
		'from-accent/18 to-transparent',
		'from-secondary/18 to-transparent',
		'from-primary/15 via-accent/10 to-transparent',
	];
</script>

<div class="max-w-5xl mx-auto px-5 py-8 space-y-10">

	<!-- ── Greeting + filter chips ──────────────────────────── -->
	<div class="space-y-5">
		<div class="space-y-2.5">
			<div class="h-px w-28 bg-linear-to-r from-primary to-transparent rounded-full" aria-hidden="true"></div>
			<div class="flex items-center gap-1.5">
				<svg class="w-2.5 h-2.5 text-primary/70 shrink-0" viewBox="0 0 10 10" fill="none" aria-hidden="true">
					<circle cx="5" cy="5" r="1.5" fill="currentColor" />
					<circle cx="5" cy="5" r="3.75" stroke="currentColor" stroke-width="0.75" opacity="0.7" />
				</svg>
				<span class="text-[11px] font-semibold uppercase tracking-widest text-primary/70">Your Signal</span>
			</div>
			<h1 class="text-3xl font-extrabold tracking-tight text-base-content">{getGreeting()}</h1>
			<p class="text-sm text-base-content/68 max-w-sm">
				Signals curated to your frequency. What's faint today may resonate tomorrow.
			</p>
		</div>

		<div class="flex items-center gap-1.5 flex-wrap">
			{#each filters as filter (filter)}
				<button
					onclick={() => (activeFilter = filter)}
					class={[
						'px-3 py-1 rounded-full text-[12px] font-semibold transition-all duration-150',
						activeFilter === filter
							? 'bg-primary/22 text-primary border border-primary/45 os-glow-interactive'
							: 'text-base-content/62 border border-white/10 hover:text-base-content/85 hover:border-white/22 hover:bg-white/5',
					]}
				>
					{filter}
				</button>
			{/each}
		</div>
	</div>

	<!-- ── 1. For You ───────────────────────────────────────── -->
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

		<!--
			Horizontal scroll strip: featured card (wider) + standard cards (same height).
			-mx-5 px-5 bleeds to viewport edges; items-end aligns bottom of all cards.
			Featured: w-64 h-52 (256×208px) — ~1.6x wider than standard.
			Standard: w-40 aspect-square + text bar ≈ same total height.
		-->
		<div class="flex gap-3 overflow-x-auto -mx-5 px-5 pb-2 scrollbar-none items-start">

			<!-- Featured Signal Card -->
			<div
				class="group relative shrink-0 w-64 h-52 rounded-xl overflow-hidden cursor-pointer border border-primary/22 os-hero-card"
			>
				<!--
					Image at opacity-80 — less dimmed than standard cards (opacity-68).
					Featured card earns more visual presence through higher image fidelity.
				-->
				<img
					src={featuredItem.image}
					alt={featuredItem.title}
					class="absolute inset-0 w-full h-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-105"
				/>

				<!-- Color tint: directional push toward brand space -->
				<div class="absolute inset-0 bg-linear-to-br from-primary/22 via-transparent to-secondary/12"></div>
				<!-- Bottom vignette: strong enough to hold white text -->
				<div class="absolute inset-0 bg-linear-to-b from-transparent via-black/10 to-black/80"></div>

				<!--
					Signal rings: scaled down for the smaller card height.
					Same motif as before — brand identity mark, not decoration.
				-->
				<div class="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
					<div class="absolute w-28 h-28 rounded-full" style="background: radial-gradient(circle, oklch(0.68 0.20 265 / 0.15) 0%, transparent 70%);"></div>
					<svg class="w-44 h-44 text-primary" viewBox="0 0 256 256" fill="none">
						<circle cx="128" cy="128" r="14" fill="currentColor" opacity="0.20" />
						<circle cx="128" cy="128" r="38" stroke="currentColor" stroke-width="1.25" opacity="0.13" />
						<circle cx="128" cy="128" r="68" stroke="currentColor" stroke-width="1" opacity="0.08" />
						<circle cx="128" cy="128" r="100" stroke="currentColor" stroke-width="0.75" opacity="0.04" />
					</svg>
				</div>

				<!-- Pick badge -->
				<div class="absolute top-3 right-3">
					<span
						class="text-[10px] font-bold tracking-wide text-primary border border-primary/50 rounded-full px-2.5 py-1 bg-black/55 backdrop-blur-sm"
						style="box-shadow: var(--glow-l3-primary);"
					>
						Pick
					</span>
				</div>

				<!-- Genre chip -->
				<div class="absolute top-3 left-3">
					<span class="text-[10px] font-semibold text-white/72 border border-white/16 rounded-full px-2 py-0.5 bg-black/50 backdrop-blur-sm">
						{featuredItem.genre}
					</span>
				</div>

				<!-- Play button -->
				<div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
					<div class="w-12 h-12 rounded-full bg-primary/32 border border-primary/62 text-primary flex items-center justify-center os-glow-interactive scale-90 group-hover:scale-100 transition-transform duration-200">
						<svg class="w-4 h-4 translate-x-px" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
							<path d="M3 2l8 4-8 4V2z" />
						</svg>
					</div>
				</div>

				<!--
					Bottom overlay: title + artist left, Amplify right.
					All white text — sits on top of the black/80 vignette above.
				-->
				<div class="absolute bottom-0 left-0 right-0 px-3 pb-3 pt-6 flex items-end justify-between gap-2">
					<div class="min-w-0">
						<p class="text-[15px] font-bold text-white truncate leading-snug tracking-tight">{featuredItem.title}</p>
						<p class="text-[11px] text-white/70 truncate mt-0.5">
							{featuredItem.artist} · {featuredItem.scouts} Scout{featuredItem.scouts === 1 ? '' : 's'}
						</p>
					</div>
					<button
						class="shrink-0 flex items-center gap-1.5 h-7 px-3 rounded-full text-[11px] font-semibold text-accent border border-accent/42 bg-black/40 hover:bg-accent/18 hover:border-accent/62 transition-all os-glow-interactive-accent backdrop-blur-sm"
						aria-label="Amplify this signal"
					>
						<Radio size={10} />
						Amplify
					</button>
				</div>
			</div>

			<!-- Standard Signal Cards -->
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

						<!-- Signal pulse -->
						<div
							class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-250 pointer-events-none"
							style="background: radial-gradient(circle at 50% 50%, oklch(0.68 0.20 265 / 0.10) 0%, transparent 65%);"
							aria-hidden="true"
						></div>

						<!-- Play overlay -->
						<div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
							<div class="w-8 h-8 rounded-full bg-white/20 border border-white/35 text-white flex items-center justify-center backdrop-blur-sm scale-90 group-hover:scale-100 transition-transform duration-200">
								<svg class="w-3.5 h-3.5 translate-x-px" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
									<path d="M3 2l8 4-8 4V2z" />
								</svg>
							</div>
						</div>

						<!-- Info overlay -->
						<div class="absolute bottom-0 left-0 right-0 p-2.5">
							<p class="text-[13px] font-bold text-white truncate leading-snug">{item.title}</p>
							<p class="text-[11px] text-white/75 truncate mt-0.5">{item.genre}</p>
						</div>
					</div>
					<!-- Text bar below image — keeps standard card height consistent -->
					<div class="px-2.5 py-2 bg-base-200/70">
						<p class="text-[11px] text-base-content/68 truncate">{item.artist}</p>
					</div>
				</div>
			{/each}

		</div>
	</section>

	<!-- ── 2. One Step Away ──────────────────────────────────── -->
	<section>
		<!--
			Two-line header: title + subtitle.
			mb-1 on the flex row keeps the subtitle close to the title,
			then mb-4 after the subtitle creates the normal gap before cards.
		-->
		<div class="flex items-center justify-between mb-1">
			<div class="flex items-center gap-2">
				<div class="w-0.75 h-3.5 rounded-full bg-accent" aria-hidden="true"></div>
				<p class="text-sm font-bold uppercase tracking-widest text-base-content/90">One Step Away</p>
			</div>
			<a href="/discover" class="text-[12px] text-base-content/55 hover:text-accent/80 transition-colors">
				See all →
			</a>
		</div>
		<p class="text-[12px] text-base-content/50 mb-4 ml-3.5">Near your taste, but not obvious</p>

		<!--
			w-36 (144px) vs w-40 (160px) in For You — intentionally denser,
			creates the exploratory "browse more" feeling.
			items-start prevents stretch distortion between cards.
			gap-2.5 (tighter than gap-3) reinforces the denser rhythm.
		-->
		<div class="flex gap-2.5 overflow-x-auto -mx-5 px-5 pb-2 scrollbar-none items-start">
			{#each oneStepAwayItems as item (item.id)}
				<!--
					relative on the wrapper so the left edge strip can be absolutely positioned.
					hover:border-accent/28: border shifts toward accent on hover (subtle).
				-->
				<div class="group relative shrink-0 w-36 rounded-lg overflow-hidden border border-white/8 hover:border-accent/28 cursor-pointer transition-all duration-200 os-card-glow">

					<!--
						Left edge strip: visual "connection" hint (Option A).
						3px wide, accent color at 30% resting → 55% on hover.
						z-10 keeps it above the image but inside the card border-radius.
						This is the single design element that makes this lane feel "connected".
					-->
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

						<!--
							Faint accent tint: differentiates from For You (primary tint) and
							Breaking Out (neutral). mix-blend-color preserves image luminance.
							At 10% it's atmospheric, not heavy.
						-->
						<div class="absolute inset-0 bg-linear-to-br from-accent/10 to-transparent mix-blend-color"></div>

						<!--
							Signal pulse: accent-colored (not primary) to match lane identity.
							Slightly lower opacity (0.09 vs 0.10) — this lane is quieter.
						-->
						<div
							class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-250 pointer-events-none"
							style="background: radial-gradient(circle at 50% 50%, oklch(0.72 0.16 220 / 0.09) 0%, transparent 65%);"
							aria-hidden="true"
						></div>

						<!-- Play overlay -->
						<div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
							<div class="w-7 h-7 rounded-full bg-white/20 border border-white/35 text-white flex items-center justify-center backdrop-blur-sm scale-90 group-hover:scale-100 transition-transform duration-200">
								<svg class="w-3 h-3 translate-x-px" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
									<path d="M3 2l8 4-8 4V2z" />
								</svg>
							</div>
						</div>
					</div>

					<!--
						pl-3.5 instead of p-2.5: extra left padding to visually clear the 3px edge strip.
						adjacencyReason: accent-tinted, smaller than artist, acts as the "why this is here".
						It communicates intent without dominating the card.
					-->
					<div class="pt-2.5 pr-2.5 pb-2.5 pl-3.5 bg-base-200/70">
						<p class="text-[13px] font-bold text-base-content/95 truncate leading-snug">{item.title}</p>
						<p class="text-[11px] text-base-content/68 truncate mt-0.5">{item.artist} · {item.genre}</p>
						{#if item.adjacencyReason}
							<p
								class="text-[10px] mt-1.5 truncate font-medium"
								style="color: oklch(0.72 0.16 220 / 0.72);"
							>{item.adjacencyReason}</p>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- ── 3. Deep Underground ──────────────────────────────── -->
	<section>
		<!-- Two-line header matching One Step Away pattern -->
		<div class="flex items-center mb-1">
			<div class="flex items-center gap-2">
				<div class="w-0.75 h-3.5 rounded-full bg-secondary/60" aria-hidden="true"></div>
				<p class="text-sm font-bold uppercase tracking-widest text-base-content/85">Deep Underground</p>
			</div>
		</div>
		<p class="text-[12px] text-base-content/45 mb-4 ml-3.5">Almost no one knows these</p>

		<!--
			w-32 (128px) — the narrowest lane in the system. 6–7 cards visible at once.
			gap-2: tightest gap, reinforces archival density.
			No os-card-glow: that class adds scale + lift which feels too energetic here.
			Hover feedback is purely image-opacity-based — restrained, respectful.
		-->
		<div class="flex gap-2 overflow-x-auto -mx-5 px-5 pb-2 scrollbar-none">
			{#each deepUndergroundItems as item (item.id)}
				<div class="group shrink-0 w-32 rounded-lg overflow-hidden border border-white/6 hover:border-white/14 cursor-pointer transition-colors duration-300">
					<div class="relative w-full aspect-square">
						<!--
							opacity-40 at rest — dimmest of any lane.
							Rises to opacity-60 on hover: "emerging from darkness".
							duration-500 (slower than other lanes) reinforces the archival feeling.
						-->
						<img
							src={item.image}
							alt={item.title}
							class="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity duration-500"
						/>
						<!--
							Top also darkened (to-black/20) — the card feels enclosed, sealed.
							Not just a bottom vignette: darkness comes from everywhere.
						-->
						<div class="absolute inset-0 bg-linear-to-t from-black/88 via-black/25 to-black/20"></div>

						<!--
							Signal pulse: near-neutral, very low chroma (0.04 vs 0.16–0.20 elsewhere).
							Almost imperceptible — just a ghost hint of presence on hover.
							This lane avoids color accents entirely.
						-->
						<div
							class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
							style="background: radial-gradient(circle at 50% 50%, oklch(0.75 0.04 265 / 0.07) 0%, transparent 60%);"
							aria-hidden="true"
						></div>

						<!--
							Play button: w-6 (smallest in the system), bg-white/15 (dimmer than w-7 white/20 elsewhere).
							Same scale-in mechanic but the result is more subtle.
						-->
						<div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
							<div class="w-6 h-6 rounded-full bg-white/15 border border-white/28 text-white flex items-center justify-center scale-90 group-hover:scale-100 transition-transform duration-200">
								<svg class="w-2.5 h-2.5 translate-x-px" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
									<path d="M3 2l8 4-8 4V2z" />
								</svg>
							</div>
						</div>
					</div>

					<!--
						bg-base-300/70: darker than base-200/70 used in other lanes.
						Title at text-[11px] (vs [13px] elsewhere) — slightly reduced dominance.
						Metadata line: scouts + sparks + locality — more data per card than any other lane.
						Tags: [8px] chips — smallest text in the system, intentionally dense and raw.
					-->
					<div class="p-2 bg-base-300/70">
						<p class="text-[11px] font-semibold text-base-content/88 truncate leading-snug">{item.title}</p>
						<p class="text-[10px] text-base-content/60 truncate mt-0.5">{item.artist}</p>
						<div class="flex items-center gap-1 mt-1.5 flex-wrap">
							<span class="text-[9px] text-base-content/48">{item.scouts} scout{item.scouts === 1 ? '' : 's'}</span>
							{#if item.sparks !== undefined && item.sparks > 0}
								<span class="text-[9px] text-base-content/28">·</span>
								<span class="text-[9px] text-base-content/42">{item.sparks} spark</span>
							{/if}
							{#if item.locality}
								<span class="text-[9px] text-base-content/28">·</span>
								<span class="text-[9px] text-base-content/38 truncate">{item.locality}</span>
							{/if}
						</div>
						{#if item.tags && item.tags.length > 0}
							<div class="flex flex-wrap gap-1 mt-1.5">
								{#each item.tags.slice(0, 2) as tag (tag)}
									<span class="text-[8px] font-medium px-1 py-0.5 rounded border border-white/10 text-base-content/45 leading-none">
										{tag}
									</span>
								{/each}
							</div>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- ── 4. Breaking Out ──────────────────────────────────── -->
	<section>
		<!--
			Two-line header. Pulse dot beside the title communicates live activity —
			it's the only ambient motion in the header area.
		-->
		<div class="flex items-center justify-between mb-1">
			<div class="flex items-center gap-2">
				<div class="w-0.75 h-3.5 rounded-full bg-success" aria-hidden="true"></div>
				<p class="text-sm font-bold uppercase tracking-widest text-base-content/90">Breaking Out</p>
				<span class="w-1.5 h-1.5 rounded-full bg-success/75 animate-pulse" aria-hidden="true"></span>
			</div>
			<span class="text-[12px] text-base-content/52 flex items-center gap-1">
				<TrendingUp size={11} class="text-success/65" />
				Still early
			</span>
		</div>
		<p class="text-[12px] text-base-content/50 mb-4 ml-3.5">Signals gaining momentum</p>

		<!--
			w-44 (176px) — wider than For You standard cards (w-40).
			Extra width gives breathing room for the momentum line + resonance bar.
			os-card-breaking: has a resting success-tinted glow (unlike other lanes).
			That resting glow is the main energy cue — the card already feels "alive"
			before you interact with it.
		-->
		<div class="flex gap-3 overflow-x-auto -mx-5 px-5 pb-2 scrollbar-none items-start">
			{#each breakingOutItems as item (item.id)}
				<div class="group shrink-0 w-44 rounded-lg overflow-hidden border border-white/8 hover:border-success/30 cursor-pointer transition-all duration-200 os-card-breaking">
					<div class="relative w-full aspect-square">
						<!--
							Slightly brighter at rest (opacity-72) than standard lanes (opacity-70).
							The card already feels more present — it's not hidden, it's emerging.
						-->
						<img
							src={item.image}
							alt={item.title}
							class="w-full h-full object-cover opacity-[72%] group-hover:opacity-[88%] transition-opacity duration-300"
						/>
						<div class="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent"></div>

						<!--
							Success tint: faint green-teal wash.
							For You uses primary (indigo), One Step Away uses accent (blue),
							Breaking Out uses success (green-teal). Each lane has its own color identity.
						-->
						<div class="absolute inset-0 bg-linear-to-br from-success/8 to-transparent mix-blend-color"></div>

						<!--
							Signal pulse: success-colored, opacity 0.12 (vs 0.09–0.10 elsewhere).
							Slightly stronger — this lane is more energetic.
						-->
						<div
							class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-250 pointer-events-none"
							style="background: radial-gradient(circle at 50% 50%, oklch(0.74 0.17 158 / 0.12) 0%, transparent 65%);"
							aria-hidden="true"
						></div>

						<!-- Play overlay — w-8 (same as For You featured standard, larger than w-7) -->
						<div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
							<div class="w-8 h-8 rounded-full bg-white/22 border border-white/38 text-white flex items-center justify-center backdrop-blur-sm scale-90 group-hover:scale-100 transition-transform duration-200">
								<svg class="w-3.5 h-3.5 translate-x-px" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
									<path d="M3 2l8 4-8 4V2z" />
								</svg>
							</div>
						</div>

						<!--
							Trend badge: "Surging" / "Rising" instead of "+N".
							The numeric growth is now in the momentum line below — no duplication.
						-->
						<div class="absolute top-2 left-2">
							<span
								class="inline-flex items-center gap-0.5 text-[10px] font-bold rounded-full px-1.5 py-0.5 border backdrop-blur-sm bg-black/55"
								style={item.trend === 'surging'
									? `color: var(--color-success); border-color: oklch(0.74 0.17 158 / 0.45); box-shadow: var(--glow-l3-success);`
									: `color: var(--color-accent); border-color: oklch(0.72 0.16 220 / 0.40); box-shadow: var(--glow-l3-accent);`}
							>
								<ArrowUpRight size={8} />
								{item.trend === 'surging' ? 'Surging' : 'Rising'}
							</span>
						</div>
					</div>

					<div class="p-2.5 bg-base-200/70">
						<p class="text-[13px] font-bold text-base-content/95 truncate leading-snug">{item.title}</p>
						<p class="text-[11px] text-base-content/68 truncate mt-0.5">{item.artist} · {item.genre}</p>

						<!--
							Momentum line: the primary metadata addition for this lane.
							Success-tinted (0.80 opacity = readable but not dominant).
							More visible than artist text — it IS the important information here.
						-->
						{#if item.weeklyScouts !== undefined}
							<p class="text-[11px] font-medium mt-1.5 truncate" style="color: oklch(0.74 0.17 158 / 0.80);">
								+{item.weeklyScouts} scouts this week
							</p>
						{/if}

						<!--
							Resonance bar: thin 2px track, fill % driven by item.resonance.
							Fill: success→accent gradient (left to right = growth direction).
							Shimmer: os-bar-shimmer sweeps a white highlight across the fill —
							this is the ONE controlled motion element for this lane.
							The shimmer is contained to the fill div (overflow-hidden).
						-->
						{#if item.resonance !== undefined}
							<div class="mt-2 h-0.5 rounded-full bg-white/10 overflow-hidden">
								<div
									class="relative h-full rounded-full bg-linear-to-r from-success/65 to-accent/50 overflow-hidden"
									style="width: {item.resonance}%;"
								>
									<div
										class="os-bar-shimmer absolute inset-y-0 left-0 w-1/2 bg-linear-to-r from-transparent via-white/30 to-transparent"
										aria-hidden="true"
									></div>
								</div>
							</div>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- ── 5. Human Signals ─────────────────────────────────── -->
	<section>
		<!--
			Two-line header. No right-side action — this lane is about exploration,
			not filtering. The subtitle states the intent plainly.
		-->
		<div class="flex items-center mb-1">
			<div class="flex items-center gap-2">
				<div class="w-0.75 h-3.5 rounded-full bg-accent/65" aria-hidden="true"></div>
				<p class="text-sm font-bold uppercase tracking-widest text-base-content/88">Human Signals</p>
			</div>
		</div>
		<p class="text-[12px] text-base-content/50 mb-4 ml-3.5">Follow people, not just songs</p>

		<!--
			Scout Cards are wider than signal cards (w-56 vs w-40).
			3–4 visible at once. items-start prevents height stretching.
			These are not image-led cards — the avatar and stats are the content.
		-->
		<div class="flex gap-3 overflow-x-auto -mx-5 px-5 pb-2 scrollbar-none items-start">
			{#each scoutItems as scout (scout.id)}
				<ScoutCard {scout} />
			{/each}
		</div>
	</section>

	<!-- ── 6. Outside the Bubble ────────────────────────────── -->
	<!--
		Magazine asymmetric layout: left feature (3fr) + right stacked (2fr).
		This is the only lane that uses a two-column inline layout —
		the shape itself communicates "this has a different purpose".
		No horizontal scroll. No grid of equal tiles.
	-->
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
		<p class="text-[12px] text-base-content/50 mb-5 ml-3.5">This is intentionally not your usual thing</p>

		<!--
			grid-cols: 3fr left, 2fr right (≈ 60 / 40 split).
			items-stretch: right column stretches to match left card height.
			h-full on the right flex-col ensures the two cards fill that height.
		-->
		<div class="grid gap-4 items-stretch" style="grid-template-columns: 3fr 2fr;">

			<!--
				LEFT: Feature card.
				Full-bleed image as absolute fill. Content at bottom via absolute overlay.
				min-h set on the wrapper so the image has real estate even on narrow viewports.
				All text renders in the overlay — no separate text bar below.
			-->
			<div
				class="group relative rounded-xl overflow-hidden cursor-pointer border border-warning/18 min-h-56 transition-transform duration-400 hover:-translate-y-0.5"
				style="box-shadow: 0 0 0 1px oklch(0.78 0.17 78 / 0.10), 0 6px 32px -6px oklch(0 0 0 / 0.55);"
			>
				<img
					src={bubbleFeatured.image}
					alt={bubbleFeatured.title}
					class="absolute inset-0 w-full h-full object-cover opacity-68 group-hover:opacity-80 transition-opacity duration-500"
				/>
				<!-- Amber wash: lane color identity -->
				<div class="absolute inset-0 bg-linear-to-br from-warning/14 to-transparent mix-blend-color"></div>
				<!--
					Gradient: gentle top darkness + heavy bottom vignette.
					The top is only slightly darkened — the image breathes in the middle.
					Text sits entirely on the strong black/90 at the very bottom.
				-->
				<div class="absolute inset-0 bg-linear-to-b from-black/30 via-transparent to-black/90"></div>

				<!-- Signal pulse: amber, on hover -->
				<div
					class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
					style="background: radial-gradient(ellipse at 50% 60%, oklch(0.78 0.17 78 / 0.09) 0%, transparent 65%);"
					aria-hidden="true"
				></div>

				<!-- Genre chip top-left -->
				<div class="absolute top-3.5 left-3.5">
					<span class="text-[10px] font-semibold text-white/70 border border-white/15 rounded-full px-2 py-0.5 bg-black/48 backdrop-blur-sm">
						{bubbleFeatured.genre}
					</span>
				</div>
				<!-- Unexpected badge top-right -->
				<div class="absolute top-3.5 right-3.5">
					<span
						class="text-[10px] font-bold rounded-full px-2.5 py-1 border bg-black/55 backdrop-blur-sm"
						style="color: var(--color-warning); border-color: oklch(0.78 0.17 78 / 0.45);"
					>
						Unexpected
					</span>
				</div>

				<!-- Play button, centered, reveal on hover -->
				<div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
					<div class="w-12 h-12 rounded-full bg-white/18 border border-white/32 text-white flex items-center justify-center backdrop-blur-sm scale-90 group-hover:scale-100 transition-transform duration-200">
						<svg class="w-4 h-4 translate-x-px" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
							<path d="M3 2l8 4-8 4V2z" />
						</svg>
					</div>
				</div>

				<!--
					Editorial text block: the heart of this card.
					Title is large (text-[22px]) — more prominent than any other card in the system.
					whyHere is two lines, warning-tinted, given its own label "Why this is here".
					This is the only card in the app that explains itself with a label + paragraph.
				-->
				<div class="absolute bottom-0 left-0 right-0 px-5 pb-5 pt-14">
					<p class="text-[22px] font-extrabold text-white leading-tight tracking-tight mb-0.5">
						{bubbleFeatured.title}
					</p>
					<p class="text-[12px] text-white/58 mb-4">
						{bubbleFeatured.artist} · {bubbleFeatured.genre} · {bubbleFeatured.scouts} scouts
					</p>
					{#if bubbleFeatured.whyHere}
						<div class="mb-4">
							<p class="text-[9px] font-bold uppercase tracking-widest mb-1.5" style="color: oklch(0.78 0.17 78 / 0.55);">
								Why this is here
							</p>
							<p class="text-[13px] leading-relaxed" style="color: oklch(0.78 0.17 78 / 0.88);">
								{bubbleFeatured.whyHere}
							</p>
						</div>
					{/if}
					<div class="flex items-center gap-2">
						<button
							class="flex items-center gap-1.5 h-7 px-3 rounded-full text-[11px] font-semibold text-accent border border-accent/42 bg-black/40 hover:bg-accent/18 hover:border-accent/62 transition-all os-glow-interactive-accent backdrop-blur-sm"
							aria-label="Amplify this signal"
						>
							<Radio size={10} />
							Amplify
						</button>
					</div>
				</div>
			</div>

			<!--
				RIGHT: two stacked landscape cards, each flex-1.
				flex-1 means they split the left card's computed height equally.
				Landscape ratio because they're wider than tall at this column width —
				no explicit aspect ratio needed; the flex height determines their shape.
			-->
			<div class="flex flex-col gap-4 h-full">
				{#each bubbleSupporting.slice(0, 2) as item (item.id)}
					<!--
						Each card: image as absolute fill, content in bottom overlay.
						flex-1: stretches to fill half the right column height.
						overflow-hidden required for the absolute image to clip correctly.
					-->
					<div
						class="group relative flex-1 rounded-xl overflow-hidden cursor-pointer border border-white/8 hover:border-warning/22 transition-all duration-250 os-card-glow"
					>
						<img
							src={item.image}
							alt={item.title}
							class="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-78 transition-opacity duration-400"
						/>
						<!-- Amber tint: consistent lane identity -->
						<div class="absolute inset-0 bg-linear-to-br from-warning/10 to-transparent mix-blend-color"></div>
						<!-- Bottom vignette: strong enough to hold two lines of text -->
						<div class="absolute inset-0 bg-linear-to-t from-black/88 via-black/30 to-transparent"></div>

						<!-- Signal pulse -->
						<div
							class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-250 pointer-events-none"
							style="background: radial-gradient(circle at 50% 50%, oklch(0.78 0.17 78 / 0.07) 0%, transparent 65%);"
							aria-hidden="true"
						></div>

						<!-- Play overlay -->
						<div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
							<div class="w-8 h-8 rounded-full bg-white/18 border border-white/30 text-white flex items-center justify-center backdrop-blur-sm scale-90 group-hover:scale-100 transition-transform duration-200">
								<svg class="w-3.5 h-3.5 translate-x-px" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
									<path d="M3 2l8 4-8 4V2z" />
								</svg>
							</div>
						</div>

						<!--
							Bottom overlay: title + artist/genre + whyHere.
							whyHere is warning-tinted, smaller than on the feature card,
							but still readable — it's the key piece of information.
						-->
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

	<!-- ── 7. Origin Stories ─────────────────────────────────── -->
	<section>
		<div class="flex items-center justify-between mb-4">
			<div class="flex items-center gap-2">
				<div class="w-0.75 h-3.5 rounded-full bg-secondary" aria-hidden="true"></div>
				<p class="text-sm font-bold uppercase tracking-widest text-base-content/88">Origin Stories</p>
			</div>
			<span class="text-[12px] text-base-content/65">How signals spread</span>
		</div>

		<!--
			Reuses the Deep Field editorial card shape.
			Metadata replaced: reachedScouts, discoveries, branch
			instead of note/origin text.
		-->
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

	<!-- ── 8. Explore / Drift ────────────────────────────────── -->
	<section class="pb-4">
		<div class="flex items-center justify-between mb-4">
			<div class="flex items-center gap-2">
				<div class="w-0.75 h-3.5 rounded-full bg-primary/55" aria-hidden="true"></div>
				<p class="text-sm font-bold uppercase tracking-widest text-base-content/88">Explore / Drift</p>
			</div>
			<span class="text-[12px] text-base-content/65">Let the signal find you</span>
		</div>

		<!--
			3-col grid at sm+ to give a wider, more exploratory feel.
			Reuses the same aspect-square card pattern as the For You grid.
			No algorithm — just drift.
		-->
		<div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
			{#each driftItems as item, i (item.id)}
				<div class="group relative rounded-lg overflow-hidden cursor-pointer border border-white/8 hover:border-white/22 transition-all duration-250 os-card-glow">
					<div class="relative aspect-square w-full">
						<img
							src={item.image}
							alt={item.title}
							class="w-full h-full object-cover opacity-68 group-hover:opacity-85 transition-opacity duration-300"
						/>
						<div class={`absolute inset-0 bg-linear-to-br ${cardTints[i % cardTints.length]} mix-blend-color`}></div>
						<div class="absolute inset-0 bg-linear-to-t from-black/82 via-black/25 to-transparent"></div>

						<!-- Signal pulse -->
						<div
							class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-250 pointer-events-none"
							style="background: radial-gradient(circle at 50% 50%, oklch(0.68 0.20 265 / 0.10) 0%, transparent 65%);"
							aria-hidden="true"
						></div>

						<!-- Play overlay -->
						<div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
							<div class="w-8 h-8 rounded-full bg-white/20 border border-white/35 text-white flex items-center justify-center backdrop-blur-sm scale-90 group-hover:scale-100 transition-transform duration-200">
								<svg class="w-3.5 h-3.5 translate-x-px" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
									<path d="M3 2l8 4-8 4V2z" />
								</svg>
							</div>
						</div>

						<!-- Info overlay -->
						<div class="absolute bottom-0 left-0 right-0 p-2.5">
							<p class="text-[13px] font-bold text-white truncate leading-snug">{item.title}</p>
							<p class="text-[11px] text-white/75 truncate mt-0.5">{item.genre}</p>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</section>

</div>
