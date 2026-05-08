<script lang="ts">
	import { Radio, Activity, Zap } from 'lucide-svelte';
	import { breakingOutItems } from '$lib/mock/data';

	// Per-card shimmer variables — each card gets distinct width, skew, and delay.
	const cardVars = [
		{ delay: '-0.8s',  width: '42%', skew: '-8deg'  },
		{ delay: '-3.3s',  width: '56%', skew: '-14deg' },
		{ delay: '-5.7s',  width: '38%', skew: '-6deg'  },
		{ delay: '-1.9s',  width: '62%', skew: '-12deg' },
		{ delay: '-7.1s',  width: '48%', skew: '-10deg' },
	];

	// Lucide icon per tier.
	function tierIcon(tag: string | undefined) {
		if (tag === 'Breakthrough') return Zap;
		if (tag === 'Surging')      return Activity;
		return                             Radio;
	}

	// Pill text + border + background per tier.
	// Rising pulled back slightly; Breakthrough border stronger.
	function pillColorClass(tag: string | undefined): string {
		if (tag === 'Breakthrough') return 'text-amber-100/95 border-amber-200/42 bg-amber-300/14';
		if (tag === 'Surging')      return 'text-lime-300/92  border-lime-300/28  bg-lime-400/12';
		return                             'text-cyan-300/75  border-cyan-300/14  bg-cyan-400/6';
	}

	// Halo behind pill — Breakthrough raised, Rising quieter.
	function haloColorClass(tag: string | undefined): string {
		if (tag === 'Breakthrough') return 'bg-amber-200/30';
		if (tag === 'Surging')      return 'bg-lime-300/16';
		return                             'bg-cyan-300/7';
	}

	// Shimmer gradient via-color per tier.
	function shimmerColorClass(tag: string | undefined): string {
		if (tag === 'Breakthrough') return 'via-amber-100/70';
		if (tag === 'Surging')      return 'via-lime-100/55';
		return                             'via-cyan-100/30';
	}

	// Duration + peak class per tier.
	function shimmerDurClass(tag: string | undefined): string {
		if (tag === 'Breakthrough') return 'bo-heat-breakthrough';
		if (tag === 'Surging')      return 'bo-heat-surging';
		return                             'bo-heat-rising';
	}

	// Spike layer class — Rising gets none.
	function spikeClass(tag: string | undefined): string | null {
		if (tag === 'Breakthrough') return 'bo-spike-breakthrough';
		if (tag === 'Surging')      return 'bo-spike-surging';
		return null;
	}
</script>

<section class="relative">
	<div class="flex items-start justify-between w-full">
		<div class="flex items-start gap-3">
			<div class="mt-0.5 w-0.5 h-5 rounded-full bg-success shrink-0" aria-hidden="true"></div>
			<div>
				<p class="text-sm font-bold uppercase tracking-widest leading-tight text-base-content/90">Breaking Out</p>
				<p class="mt-0.5 text-[13px] leading-normal text-base-content/72 max-w-105">Signals gaining momentum — help them spread</p>
			</div>
		</div>
		<a href="/discover" class="text-[13px] text-base-content/75 hover:text-success/88 transition-colors shrink-0" style="margin-right: clamp(0px, 6vw - 48px, 120px);">
			See all →
		</a>
	</div>

	<div class="mt-5 grid gap-4 pb-2 w-full" style="grid-template-columns: repeat(5, minmax(180px, 1fr));">
		{#each breakingOutItems as item, i (item.id)}
			{@const Icon = tierIcon(item.tag)}
			{@const vars = cardVars[i] ?? cardVars[0]}
			{@const spike = spikeClass(item.tag)}
			<!-- Card: clean, dark, no tier-based halo -->
			<div class="group rounded-lg overflow-hidden border border-white/10 hover:border-success/40 cursor-pointer transition-all duration-200 os-card-breaking">
				<div class="relative w-full aspect-square">
					<img
						src={item.image}
						alt={item.title}
						class="w-full h-full object-cover opacity-76 group-hover:opacity-90 transition-opacity duration-300"
					style="filter: saturate(1.05);"
					/>
					<div class="absolute inset-0 bg-linear-to-t from-black/74 via-black/16 to-transparent"></div>
					<div class="absolute inset-0 bg-linear-to-br from-success/8 to-transparent mix-blend-color"></div>
					<div
						class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-250 pointer-events-none"
						style="background: radial-gradient(circle at 50% 50%, oklch(0.74 0.17 158 / 0.12) 0%, transparent 65%);"
						aria-hidden="true"
					></div>
					{#if item.tag}
						<div class="absolute top-2 right-2 z-10">
							<span
								class="text-[11px] font-bold px-2 py-1 rounded border border-success/25 text-success/70 leading-none"
								style="background: rgba(0,0,0,0.38); backdrop-filter: blur(4px);"
							>{item.tag}</span>
						</div>
					{/if}
					<div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
						<div class="w-8 h-8 rounded-full bg-white/22 border border-white/38 text-white flex items-center justify-center backdrop-blur-sm scale-90 group-hover:scale-100 transition-transform duration-200">
							<svg class="w-3.5 h-3.5 translate-x-px" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
								<path d="M3 2l8 4-8 4V2z" />
							</svg>
						</div>
					</div>
				</div>

				<div class="p-2.5 bg-base-200/70">
					<p class="text-[13px] font-bold text-base-content/95 truncate leading-snug">{item.title}</p>
					<p class="text-[12px] text-base-content/68 truncate mt-1">{item.artist} · {item.genre}</p>

					{#if item.weeklyScouts !== undefined}
						<div class="mt-2 space-y-1">
							<!--
								Pill wrapper: w-fit so the halo tracks the pill width.
								CSS variables cascade to shimmer + spike children.
							-->
							<div
								class="relative w-fit"
								style="--bo-shimmer-width:{vars.width}; --bo-shimmer-skew:{vars.skew};"
							>
								<!-- Halo: tier-colored blur behind pill -->
								<div
									class="absolute -inset-1 rounded-full blur-md pointer-events-none {haloColorClass(item.tag)}"
									aria-hidden="true"
								></div>
								<!--
									Heat pill. overflow-hidden clips shimmer + spike.
									Icon and text: z-10. Shimmer and spike: z-0.
								-->
								<span class="relative inline-flex w-fit items-center gap-1.5 overflow-hidden rounded-full border px-2 py-0.5 text-[13px] font-medium {pillColorClass(item.tag)}">
									<!-- Shimmer sweep -->
									<span
										class="bo-heat-shimmer {shimmerDurClass(item.tag)} absolute inset-y-0 bg-linear-to-r from-transparent {shimmerColorClass(item.tag)} to-transparent blur-[1px] pointer-events-none z-0"
										style="animation-delay: {vars.delay};"
										aria-hidden="true"
									></span>
									<!-- Spike: rare centered brightness lift (Surging + Breakthrough only) -->
									{#if spike}
										<span
											class="{spike} absolute inset-0 rounded-full pointer-events-none z-0"
											style="background: radial-gradient(ellipse at 50% 50%, currentColor 0%, transparent 70%); animation-delay: {vars.delay};"
											class:text-lime-300={item.tag === 'Surging'}
											class:text-amber-200={item.tag === 'Breakthrough'}
											aria-hidden="true"
										></span>
									{/if}
									<!--
										Icon: Surging gets a rare electric pulse animation on the icon only.
										Breakthrough and Rising: stable opacity-90.
									-->
									<Icon
										size={12}
										strokeWidth={2}
										class="relative z-10 shrink-0 {item.tag === 'Surging' ? 'bo-icon-pulse-surging' : 'opacity-90'}"
									/>
									<span class="relative z-10">+{item.weeklyScouts} scouts this week</span>
								</span>
							</div>
							<!--
								Spread reason: text-[13px], line-clamp-2 to wrap cleanly across two lines.
								No truncation — truncate class removed.
							-->
							{#if item.spreadReason}
								<p class="text-[13px] text-zinc-300/82 leading-normal line-clamp-2">{item.spreadReason}</p>
							{/if}
						</div>
					{/if}

					<!-- Amplify -->
					<div class="flex justify-end mt-2">
						<button
							class="flex items-center gap-1.5 h-6 px-3 rounded-full text-[11px] font-semibold text-emerald-300 border border-success/52 hover:bg-success/16 hover:border-success/68 hover:text-emerald-100 transition-all"
							title="Help it spread"
							aria-label="Amplify this signal"
						>
							<Radio size={9} />
							Amplify
						</button>
					</div>
				</div>
			</div>
		{/each}
	</div>
</section>
