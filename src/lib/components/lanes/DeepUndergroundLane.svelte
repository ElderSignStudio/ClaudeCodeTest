<script lang="ts">
	import { Radio } from 'lucide-svelte';
	import { deepUndergroundItems } from '$lib/mock/data';

	// Capped scout count: minimum 1 (never show 0), maximum 3
	function capped(scouts: number): number {
		return Math.min(Math.max(scouts, 1), 3);
	}

	function presenceLabel(scouts: number): string {
		const n = capped(scouts);
		return `${n} scout${n === 1 ? '' : 's'}`;
	}
</script>

<section>
	<div class="flex items-start justify-between w-full">
		<div class="flex items-start gap-3">
			<div class="mt-0.5 w-0.5 h-5 rounded-full bg-secondary/60 shrink-0" aria-hidden="true"></div>
			<div>
				<p class="text-sm font-bold uppercase tracking-widest leading-tight text-base-content/85">Deep Underground</p>
				<p class="mt-0.5 text-[12px] leading-normal text-base-content/65 max-w-105">Signals barely discovered anywhere — find them first</p>
			</div>
		</div>
		<a href="/discover" class="text-[12px] text-base-content/55 hover:text-base-content/70 transition-colors shrink-0" style="margin-right: clamp(0px, 6vw - 48px, 120px);">
			See all →
		</a>
	</div>

	<div class="mt-5 grid gap-3 pb-2 w-full" style="grid-template-columns: repeat(7, minmax(130px, 1fr));">
		{#each deepUndergroundItems as item (item.id)}
			<div class="group relative rounded-lg overflow-hidden border border-white/5 hover:border-white/10 cursor-pointer transition-colors duration-300">

				<div class="relative w-full aspect-square">
					<img
						src={item.image}
						alt={item.title}
						class="w-full h-full object-cover opacity-40 group-hover:opacity-58 transition-opacity duration-500"
					/>
					<div class="absolute inset-0 bg-linear-to-t from-black/88 via-black/25 to-black/20"></div>
					<div class="absolute inset-0 bg-black/15"></div>
					<div
						class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
						style="background: radial-gradient(circle at 50% 50%, oklch(0.75 0.04 265 / 0.07) 0%, transparent 60%);"
						aria-hidden="true"
					></div>
					<div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
						<div class="w-6 h-6 rounded-full bg-white/15 border border-white/28 text-white flex items-center justify-center scale-90 group-hover:scale-100 transition-transform duration-200">
							<svg class="w-2.5 h-2.5 translate-x-px" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
								<path d="M3 2l8 4-8 4V2z" />
							</svg>
						</div>
					</div>
					<!--
						Presence pulse — last child inside the image section so DOM order
						places it above all overlays without needing z-index.
						Animation is driven by CSS class (not inline style) to avoid the
						SvelteKit + Tailwind v4 issue where dynamic animation: values in
						inline style attributes fail silently.
					-->
					<div
						class="deep-pulse deep-pulse-scout-{capped(item.scouts)} absolute inset-0 pointer-events-none"
						aria-hidden="true"
					></div>
				</div>

				<div class="p-2 bg-base-300/70">
					<p class="text-[11px] font-semibold text-base-content/75 truncate leading-snug">{item.title}</p>
					<p class="text-[10px] text-base-content/50 truncate mt-0.5">{item.artist}</p>
					<!-- Presence first (factual anchor), origin second (flavor) -->
					<div class="mt-2 space-y-0.5">
						<p class="text-sm font-medium text-zinc-400/80 truncate">{presenceLabel(item.scouts)}</p>
						<p class="text-xs text-zinc-500/70 truncate">{item.whisperHint ?? 'Barely surfaced'}</p>
					</div>
					<!-- Amplify — quiet but clearly available: opacity-75 at rest, 90 on hover -->
					<div class="flex justify-end mt-2">
						<button
							class="flex items-center gap-1 h-5 px-2 rounded-full text-[10px] font-medium text-zinc-300 border border-white/20 hover:border-white/35 hover:text-white transition-all opacity-75 hover:opacity-90"
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
