<script lang="ts">
	import type { OriginItem } from '$lib/mock/data';

	let { item }: { item: OriginItem } = $props();
</script>

<div
	class="group h-full rounded-xl border border-white/8 bg-base-200/45 cursor-pointer transition-all duration-250 hover:border-white/18 hover:bg-base-200/62 hover:-translate-y-0.5 flex flex-col"
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

		<!-- Headline — primary narrative element -->
		<p class="text-[17px] font-bold text-base-content/92 leading-relaxed mt-1 mb-4 flex-1">
			{item.headline}
		</p>

		<!-- Mini graph -->
		<div class="mb-4" aria-hidden="true">
			{#if item.graphType === 'converging'}
				<!--
					Three independent origins converging.
					Main path: center seed (y=22) straight to endpoint — brighter + heavier.
					Outer two branches are secondary — dimmed.
				-->
				<svg viewBox="0 0 180 44" width="100%" class="overflow-visible">
					<!-- Secondary outer branches -->
					<line x1="12" y1="8"  x2="68" y2="8"  stroke="oklch(0.88 0.018 272 / 0.09)" stroke-width="1" stroke-dasharray="2 3" />
					<line x1="68" y1="8"  x2="108" y2="22" stroke="oklch(0.88 0.018 272 / 0.09)" stroke-width="1" stroke-dasharray="2 3" />
					<line x1="12" y1="36" x2="68" y2="36" stroke="oklch(0.88 0.018 272 / 0.09)" stroke-width="1" stroke-dasharray="2 3" />
					<line x1="68" y1="36" x2="108" y2="22" stroke="oklch(0.88 0.018 272 / 0.09)" stroke-width="1" stroke-dasharray="2 3" />
					<!-- Main path: center through to endpoint -->
					<line x1="12"  y1="22" x2="108" y2="22" stroke="oklch(0.88 0.018 272 / 0.26)" stroke-width="1.5" stroke-dasharray="2 3" />
					<line x1="108" y1="22" x2="155" y2="22" stroke="oklch(0.88 0.018 272 / 0.26)" stroke-width="1.5" stroke-dasharray="2 3" />
					<!-- Secondary nodes -->
					<circle cx="68"  cy="8"  r="3" fill="oklch(0.65 0.18 290 / 0.30)" />
					<circle cx="68"  cy="36" r="3" fill="oklch(0.65 0.18 290 / 0.30)" />
					<circle cx="12"  cy="8"  r="3" fill="oklch(0.65 0.18 290 / 0.32)" />
					<circle cx="12"  cy="36" r="3" fill="oklch(0.65 0.18 290 / 0.32)" />
					<!-- Main path nodes -->
					<circle cx="108" cy="22" r="3" fill="oklch(0.65 0.18 290 / 0.68)" />
					<circle cx="12"  cy="22" r="3" fill="oklch(0.65 0.18 290 / 0.72)" />
					<!-- Endpoint glow -->
					<circle cx="155" cy="22" r="10" fill="oklch(0.68 0.20 265 / 0.10)" />
					<circle cx="155" cy="22" r="5"  fill="oklch(0.68 0.20 265 / 0.18)" stroke="oklch(0.68 0.20 265 / 0.52)" stroke-width="1" />
					<circle cx="155" cy="22" r="2.5" fill="oklch(0.68 0.20 265 / 0.88)" />
				</svg>

			{:else if item.graphType === 'parallel'}
				<!--
					Two branches reaching same endpoint.
					Semantically equal — no dominant path — kept neutral.
				-->
				<svg viewBox="0 0 180 44" width="100%" class="overflow-visible">
					<line x1="12" y1="14" x2="52"  y2="14" stroke="oklch(0.88 0.018 272 / 0.15)" stroke-width="1" stroke-dasharray="2 3" />
					<line x1="52" y1="14" x2="92"  y2="14" stroke="oklch(0.88 0.018 272 / 0.15)" stroke-width="1" stroke-dasharray="2 3" />
					<line x1="92" y1="14" x2="132" y2="14" stroke="oklch(0.88 0.018 272 / 0.15)" stroke-width="1" stroke-dasharray="2 3" />
					<line x1="132" y1="14" x2="155" y2="22" stroke="oklch(0.88 0.018 272 / 0.15)" stroke-width="1" stroke-dasharray="2 3" />
					<line x1="12"  y1="30" x2="55"  y2="30" stroke="oklch(0.88 0.018 272 / 0.15)" stroke-width="1" stroke-dasharray="2 3" />
					<line x1="55"  y1="30" x2="100" y2="30" stroke="oklch(0.88 0.018 272 / 0.15)" stroke-width="1" stroke-dasharray="2 3" />
					<line x1="100" y1="30" x2="155" y2="22" stroke="oklch(0.88 0.018 272 / 0.15)" stroke-width="1" stroke-dasharray="2 3" />
					<circle cx="12"  cy="14" r="3" fill="oklch(0.65 0.18 290 / 0.50)" />
					<circle cx="52"  cy="14" r="3" fill="oklch(0.65 0.18 290 / 0.45)" />
					<circle cx="92"  cy="14" r="3" fill="oklch(0.65 0.18 290 / 0.45)" />
					<circle cx="132" cy="14" r="3" fill="oklch(0.65 0.18 290 / 0.45)" />
					<circle cx="12"  cy="30" r="3" fill="oklch(0.65 0.18 290 / 0.50)" />
					<circle cx="55"  cy="30" r="3" fill="oklch(0.65 0.18 290 / 0.45)" />
					<circle cx="100" cy="30" r="3" fill="oklch(0.65 0.18 290 / 0.45)" />
					<!-- Endpoint glow -->
					<circle cx="155" cy="22" r="10" fill="oklch(0.68 0.20 265 / 0.10)" />
					<circle cx="155" cy="22" r="5"  fill="oklch(0.68 0.20 265 / 0.18)" stroke="oklch(0.68 0.20 265 / 0.52)" stroke-width="1" />
					<circle cx="155" cy="22" r="2.5" fill="oklch(0.68 0.20 265 / 0.88)" />
				</svg>

			{:else if item.graphType === 'spreading'}
				<!--
					Single origin spreading wide.
					Main path: center axis (y=22 through) — brighter + heavier.
					Fan branches are secondary — dimmed.
				-->
				<svg viewBox="0 0 180 44" width="100%" class="overflow-visible">
					<!-- Secondary fan branches -->
					<line x1="18" y1="22" x2="72" y2="6"  stroke="oklch(0.88 0.018 272 / 0.09)" stroke-width="1" stroke-dasharray="2 3" />
					<line x1="18" y1="22" x2="72" y2="38" stroke="oklch(0.88 0.018 272 / 0.09)" stroke-width="1" stroke-dasharray="2 3" />
					<line x1="72" y1="6"  x2="140" y2="4"  stroke="oklch(0.88 0.018 272 / 0.09)" stroke-width="1" stroke-dasharray="2 3" />
					<line x1="72" y1="6"  x2="140" y2="14" stroke="oklch(0.88 0.018 272 / 0.09)" stroke-width="1" stroke-dasharray="2 3" />
					<line x1="72" y1="38" x2="140" y2="30" stroke="oklch(0.88 0.018 272 / 0.09)" stroke-width="1" stroke-dasharray="2 3" />
					<line x1="72" y1="38" x2="140" y2="40" stroke="oklch(0.88 0.018 272 / 0.09)" stroke-width="1" stroke-dasharray="2 3" />
					<!-- Main axis: center through -->
					<line x1="18" y1="22" x2="72"  y2="22" stroke="oklch(0.88 0.018 272 / 0.26)" stroke-width="1.5" stroke-dasharray="2 3" />
					<line x1="72" y1="22" x2="140" y2="22" stroke="oklch(0.88 0.018 272 / 0.26)" stroke-width="1.5" stroke-dasharray="2 3" />
					<!-- Secondary nodes -->
					<circle cx="72"  cy="6"  r="3" fill="oklch(0.65 0.18 290 / 0.30)" />
					<circle cx="72"  cy="38" r="3" fill="oklch(0.65 0.18 290 / 0.30)" />
					<circle cx="140" cy="4"  r="3" fill="oklch(0.65 0.18 290 / 0.30)" />
					<circle cx="140" cy="14" r="3" fill="oklch(0.65 0.18 290 / 0.30)" />
					<circle cx="140" cy="30" r="3" fill="oklch(0.65 0.18 290 / 0.30)" />
					<circle cx="140" cy="40" r="3" fill="oklch(0.65 0.18 290 / 0.30)" />
					<!-- Main axis nodes -->
					<circle cx="72"  cy="22" r="3" fill="oklch(0.65 0.18 290 / 0.68)" />
					<circle cx="140" cy="22" r="3" fill="oklch(0.65 0.18 290 / 0.68)" />
					<!-- Origin glow -->
					<circle cx="18" cy="22" r="10" fill="oklch(0.68 0.20 265 / 0.10)" />
					<circle cx="18" cy="22" r="5"  fill="oklch(0.68 0.20 265 / 0.18)" stroke="oklch(0.68 0.20 265 / 0.52)" stroke-width="1" />
					<circle cx="18" cy="22" r="2.5" fill="oklch(0.68 0.20 265 / 0.88)" />
				</svg>
			{/if}
		</div>

		<!-- Stats — inline caption, not dashboard -->
		<div class="flex items-baseline flex-wrap gap-x-2 gap-y-0 mb-3">
			<span class="text-[13px] font-bold text-base-content/60 leading-none">{item.reachedScouts}</span>
			<span class="text-[10px] text-base-content/35 leading-none">scouts reached</span>
			<span class="text-base-content/18 text-[10px] mx-0.5">·</span>
			<span class="text-[13px] font-bold text-base-content/60 leading-none">{item.discoveries}</span>
			<span class="text-[10px] text-base-content/35 leading-none">{item.discoveries === 1 ? 'discovery' : 'discoveries'}</span>
			<span class="text-base-content/18 text-[10px] mx-0.5">·</span>
			<span class="text-[11px] text-base-content/42 leading-none">{item.seedLocation}</span>
		</div>

		<!-- View Path CTA -->
		<button
			class="w-full flex items-center justify-center h-7 rounded-full text-[11px] font-semibold border border-white/18 text-base-content/68 hover:text-secondary hover:border-secondary/35 hover:bg-white/4 transition-all duration-150"
		>
			View Path →
		</button>

	</div>
</div>
