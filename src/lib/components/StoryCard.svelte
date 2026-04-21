<script lang="ts">
	import type { OriginItem } from '$lib/mock/data';

	let { item }: { item: OriginItem } = $props();
</script>

<div
	class="group rounded-xl border border-white/8 hover:border-white/18 cursor-pointer bg-base-200/45 hover:bg-base-200/62 transition-all duration-250 hover:-translate-y-0.5 flex flex-col"
>
	<div class="p-4 flex-1 flex flex-col">

		<!-- Top row: small image inset + title/genre -->
		<div class="flex items-start justify-between gap-3 mb-3">
			<div class="w-10 h-10 rounded-md overflow-hidden border border-white/10 shrink-0">
				<img
					src={item.image}
					alt=""
					class="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity duration-300"
				/>
			</div>
			<div class="flex-1 min-w-0 pt-0.5">
				<p class="text-[11px] font-semibold text-base-content/62 truncate">{item.title} · {item.artist}</p>
				<p class="text-[10px] text-base-content/40 truncate mt-0.5">{item.genre}</p>
			</div>
		</div>

		<!-- Headline -->
		<p class="text-[17px] font-bold text-base-content/92 leading-snug mb-3 flex-1">
			{item.headline}
		</p>

		<!-- Mini graph -->
		<div class="mb-3" aria-hidden="true">
			{#if item.graphType === 'converging'}
				<!-- Three independent origins converging to one endpoint -->
				<svg viewBox="0 0 180 44" width="100%" class="overflow-visible">
					<line x1="12" y1="8"  x2="68" y2="8"  stroke="oklch(0.88 0.018 272 / 0.15)" stroke-width="1" stroke-dasharray="2 3" />
					<line x1="68" y1="8"  x2="108" y2="22" stroke="oklch(0.88 0.018 272 / 0.15)" stroke-width="1" stroke-dasharray="2 3" />
					<line x1="12" y1="22" x2="108" y2="22" stroke="oklch(0.88 0.018 272 / 0.15)" stroke-width="1" stroke-dasharray="2 3" />
					<line x1="12" y1="36" x2="68" y2="36" stroke="oklch(0.88 0.018 272 / 0.15)" stroke-width="1" stroke-dasharray="2 3" />
					<line x1="68" y1="36" x2="108" y2="22" stroke="oklch(0.88 0.018 272 / 0.15)" stroke-width="1" stroke-dasharray="2 3" />
					<line x1="108" y1="22" x2="155" y2="22" stroke="oklch(0.88 0.018 272 / 0.15)" stroke-width="1" stroke-dasharray="2 3" />
					<circle cx="68"  cy="8"  r="3" fill="oklch(0.65 0.18 290 / 0.50)" />
					<circle cx="68"  cy="36" r="3" fill="oklch(0.65 0.18 290 / 0.50)" />
					<circle cx="108" cy="22" r="3" fill="oklch(0.65 0.18 290 / 0.50)" />
					<circle cx="12"  cy="8"  r="3" fill="oklch(0.65 0.18 290 / 0.55)" />
					<circle cx="12"  cy="22" r="3" fill="oklch(0.65 0.18 290 / 0.55)" />
					<circle cx="12"  cy="36" r="3" fill="oklch(0.65 0.18 290 / 0.55)" />
					<!-- Endpoint glow -->
					<circle cx="155" cy="22" r="10" fill="oklch(0.68 0.20 265 / 0.10)" />
					<circle cx="155" cy="22" r="5"  fill="oklch(0.68 0.20 265 / 0.18)" stroke="oklch(0.68 0.20 265 / 0.52)" stroke-width="1" />
					<circle cx="155" cy="22" r="2.5" fill="oklch(0.68 0.20 265 / 0.88)" />
				</svg>

			{:else if item.graphType === 'parallel'}
				<!-- Two separate branches reaching the same endpoint -->
				<svg viewBox="0 0 180 44" width="100%" class="overflow-visible">
					<line x1="12" y1="14" x2="52"  y2="14" stroke="oklch(0.88 0.018 272 / 0.15)" stroke-width="1" stroke-dasharray="2 3" />
					<line x1="52" y1="14" x2="92"  y2="14" stroke="oklch(0.88 0.018 272 / 0.15)" stroke-width="1" stroke-dasharray="2 3" />
					<line x1="92" y1="14" x2="132" y2="14" stroke="oklch(0.88 0.018 272 / 0.15)" stroke-width="1" stroke-dasharray="2 3" />
					<line x1="132" y1="14" x2="155" y2="22" stroke="oklch(0.88 0.018 272 / 0.15)" stroke-width="1" stroke-dasharray="2 3" />
					<line x1="12"  y1="30" x2="55"  y2="30" stroke="oklch(0.88 0.018 272 / 0.15)" stroke-width="1" stroke-dasharray="2 3" />
					<line x1="55"  y1="30" x2="100" y2="30" stroke="oklch(0.88 0.018 272 / 0.15)" stroke-width="1" stroke-dasharray="2 3" />
					<line x1="100" y1="30" x2="155" y2="22" stroke="oklch(0.88 0.018 272 / 0.15)" stroke-width="1" stroke-dasharray="2 3" />
					<circle cx="12"  cy="14" r="3" fill="oklch(0.65 0.18 290 / 0.55)" />
					<circle cx="52"  cy="14" r="3" fill="oklch(0.65 0.18 290 / 0.50)" />
					<circle cx="92"  cy="14" r="3" fill="oklch(0.65 0.18 290 / 0.50)" />
					<circle cx="132" cy="14" r="3" fill="oklch(0.65 0.18 290 / 0.50)" />
					<circle cx="12"  cy="30" r="3" fill="oklch(0.65 0.18 290 / 0.55)" />
					<circle cx="55"  cy="30" r="3" fill="oklch(0.65 0.18 290 / 0.50)" />
					<circle cx="100" cy="30" r="3" fill="oklch(0.65 0.18 290 / 0.50)" />
					<!-- Endpoint glow -->
					<circle cx="155" cy="22" r="10" fill="oklch(0.68 0.20 265 / 0.10)" />
					<circle cx="155" cy="22" r="5"  fill="oklch(0.68 0.20 265 / 0.18)" stroke="oklch(0.68 0.20 265 / 0.52)" stroke-width="1" />
					<circle cx="155" cy="22" r="2.5" fill="oklch(0.68 0.20 265 / 0.88)" />
				</svg>

			{:else if item.graphType === 'spreading'}
				<!-- Single origin spreading wide -->
				<svg viewBox="0 0 180 44" width="100%" class="overflow-visible">
					<line x1="18" y1="22" x2="72" y2="6"  stroke="oklch(0.88 0.018 272 / 0.15)" stroke-width="1" stroke-dasharray="2 3" />
					<line x1="18" y1="22" x2="72" y2="22" stroke="oklch(0.88 0.018 272 / 0.15)" stroke-width="1" stroke-dasharray="2 3" />
					<line x1="18" y1="22" x2="72" y2="38" stroke="oklch(0.88 0.018 272 / 0.15)" stroke-width="1" stroke-dasharray="2 3" />
					<line x1="72" y1="6"  x2="140" y2="4"  stroke="oklch(0.88 0.018 272 / 0.15)" stroke-width="1" stroke-dasharray="2 3" />
					<line x1="72" y1="6"  x2="140" y2="14" stroke="oklch(0.88 0.018 272 / 0.15)" stroke-width="1" stroke-dasharray="2 3" />
					<line x1="72" y1="22" x2="140" y2="22" stroke="oklch(0.88 0.018 272 / 0.15)" stroke-width="1" stroke-dasharray="2 3" />
					<line x1="72" y1="38" x2="140" y2="30" stroke="oklch(0.88 0.018 272 / 0.15)" stroke-width="1" stroke-dasharray="2 3" />
					<line x1="72" y1="38" x2="140" y2="40" stroke="oklch(0.88 0.018 272 / 0.15)" stroke-width="1" stroke-dasharray="2 3" />
					<circle cx="72"  cy="6"  r="3" fill="oklch(0.65 0.18 290 / 0.50)" />
					<circle cx="72"  cy="22" r="3" fill="oklch(0.65 0.18 290 / 0.50)" />
					<circle cx="72"  cy="38" r="3" fill="oklch(0.65 0.18 290 / 0.50)" />
					<circle cx="140" cy="4"  r="3" fill="oklch(0.65 0.18 290 / 0.50)" />
					<circle cx="140" cy="14" r="3" fill="oklch(0.65 0.18 290 / 0.50)" />
					<circle cx="140" cy="22" r="3" fill="oklch(0.65 0.18 290 / 0.50)" />
					<circle cx="140" cy="30" r="3" fill="oklch(0.65 0.18 290 / 0.50)" />
					<circle cx="140" cy="40" r="3" fill="oklch(0.65 0.18 290 / 0.50)" />
					<!-- Origin glow -->
					<circle cx="18" cy="22" r="10" fill="oklch(0.68 0.20 265 / 0.10)" />
					<circle cx="18" cy="22" r="5"  fill="oklch(0.68 0.20 265 / 0.18)" stroke="oklch(0.68 0.20 265 / 0.52)" stroke-width="1" />
					<circle cx="18" cy="22" r="2.5" fill="oklch(0.68 0.20 265 / 0.88)" />
				</svg>
			{/if}
		</div>

		<!-- Stats row -->
		<div class="grid grid-cols-3 gap-0 mb-3.5 relative">
			<div class="absolute left-1/3 top-0 bottom-0 w-px bg-white/8" aria-hidden="true"></div>
			<div class="absolute left-2/3 top-0 bottom-0 w-px bg-white/8" aria-hidden="true"></div>
			<div class="pr-3">
				<p class="text-[16px] font-extrabold text-base-content/80 leading-none">{item.reachedScouts}</p>
				<p class="text-[9px] text-base-content/40 mt-0.5 leading-tight">scouts reached</p>
			</div>
			<div class="px-3">
				<p class="text-[16px] font-extrabold text-base-content/80 leading-none">{item.discoveries}</p>
				<p class="text-[9px] text-base-content/40 mt-0.5 leading-tight">independent<br />{item.discoveries === 1 ? 'discovery' : 'discoveries'}</p>
			</div>
			<div class="pl-3">
				<p class="text-[13px] font-bold text-base-content/75 leading-tight truncate">{item.seedLocation}</p>
				<p class="text-[9px] text-base-content/40 mt-0.5 leading-tight">origin</p>
			</div>
		</div>

		<!-- View Path CTA -->
		<button
			class="w-full flex items-center justify-center h-7 rounded-full text-[11px] font-semibold border border-white/12 text-base-content/55 hover:text-base-content/80 hover:border-white/24 hover:bg-white/5 transition-all duration-150"
		>
			View Path →
		</button>

	</div>
</div>
