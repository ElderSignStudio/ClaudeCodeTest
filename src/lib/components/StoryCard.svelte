<script lang="ts">
	import type { OriginItem } from '$lib/mock/data';

	let { item }: { item: OriginItem } = $props();

	// Detect reduced-motion preference after hydration.
	// SSR renders with reducedMotion=false (animations present); $effect corrects on client.
	let reducedMotion = $state(false);
	$effect(() => {
		reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	});

	// Namespace all SVG element IDs per card to prevent document-level SMIL reference collisions.
	const id = $derived(item.id);
</script>

<!--
	Visual grammar (shared across all diagram types):
	  Origin node    — large, bright blue-violet, 4-layer halo + slow pulse
	  Discovery node — small violet dot, slow asynchronous breathing
	  Branch node    — medium violet dot, staggered independent breathing
	  Convergence    — large blue-violet target, 4-layer halo + rare expanding ring
	  Lines          — dashed, very dim; stroke-opacity separated from color for shimmer

	Motion design:
	  Node breathing via CSS (.os-pulse-node) with per-node animation-duration (11–23s).
	  Propagation pulses via SVG <animateMotion> — tiny blurred particles, intermittent.
	  Pulse rings via SVG <animate> on r + stroke-opacity — rare, slow expanding rings.
	  Path shimmer via SVG <animate> on stroke-opacity — occasional localized brightening.
	  All SMIL elements gated by reducedMotion state ({#if !reducedMotion}).
-->

<div
	class="group h-full rounded-xl border border-white/8 bg-base-200/40 cursor-pointer transition-all duration-250 hover:border-secondary/20 hover:bg-base-200/55 flex flex-col"
	style="box-shadow: 0 0 0 1px rgba(255,255,255,0.03), 0 14px 40px rgba(0,0,0,0.32);"
>
	<div class="p-4 flex-1 flex flex-col">

		<!-- Top row: small image inset + title/genre -->
		<div class="flex items-start gap-3 mb-3">
			<div class="w-10 h-10 rounded-md overflow-hidden border border-white/10 shrink-0">
				<img
					src={item.image}
					alt=""
					class="w-full h-full object-cover opacity-48 group-hover:opacity-65 transition-opacity duration-300"
				/>
			</div>
			<div class="flex-1 min-w-0 pt-0.5">
				<p class="text-[12px] font-semibold text-base-content/72 truncate">{item.title} · {item.artist}</p>
				<p class="text-[11px] text-base-content/50 truncate mt-0.5">{item.genre}</p>
			</div>
		</div>

		<!-- Headline — primary narrative element -->
		<p class="text-[17px] font-bold text-base-content/90 leading-relaxed mt-1 mb-4 flex-1">
			{item.headline}
		</p>

		<!--
			Symbolic propagation diagram.
			viewBox "0 0 180 44" — consistent coordinate space across all types.
			overflow-visible allows halos and blur filters to render outside the SVG box.
		-->
		<div class="mb-4" aria-hidden="true">

			{#if item.storyType === 'independent-discovery'}
				<!--
					Three isolated origins converging late into one signal node.
					Emotion: quiet emergence — separate discoveries eventually finding each other.

					Motion:
					  - discovery nodes breathe independently (12–15s, heavy delay stagger)
					  - convergence node breathes slower (19s) — arrives last
					  - propagation pulse travels middle path, then final path to endpoint
					  - rare pulse ring on convergence node + signal endpoint
					  - shimmer on active middle + final lines
				-->
				<svg viewBox="0 0 180 44" width="100%" class="overflow-visible">
					<defs>
						<!-- Soft glow for propagation pulse particles -->
						<filter id="f-{id}" x="-150%" y="-150%" width="400%" height="400%">
							<feGaussianBlur stdDeviation="1.2"/>
						</filter>
						{#if !reducedMotion}
							<!-- Motion paths for propagation pulses — match the line coordinates exactly -->
							<path id="mp-b-{id}" d="M15,22 L118,22"/>
							<path id="mp-f-{id}" d="M118,22 L155,22"/>
						{/if}
					</defs>

					<!--
						Lines: stroke color and stroke-opacity are separate attributes so
						<animate attributeName="stroke-opacity"> can target each line individually.
					-->
					<line x1="15" y1="8"  x2="80" y2="8"  stroke="oklch(0.65 0.18 290)" stroke-opacity="0.14" stroke-width="1"   stroke-dasharray="2 3"/>
					<line x1="15" y1="22" x2="118" y2="22" stroke="oklch(0.65 0.18 290)" stroke-opacity="0.20" stroke-width="1.5" stroke-dasharray="2 3">
						{#if !reducedMotion}
							<animate id="shim-b-{id}" begin="15s; shim-b-{id}.end+22s" dur="2.5s" attributeName="stroke-opacity" values="0.20;0.38;0.20"/>
						{/if}
					</line>
					<line x1="15" y1="36" x2="80" y2="36" stroke="oklch(0.65 0.18 290)" stroke-opacity="0.14" stroke-width="1"   stroke-dasharray="2 3"/>
					<!-- Convergence diagonals — sparser dash signals "late joining" -->
					<line x1="80" y1="8"  x2="118" y2="22" stroke="oklch(0.65 0.18 290)" stroke-opacity="0.12" stroke-width="1"   stroke-dasharray="1 4"/>
					<line x1="80" y1="36" x2="118" y2="22" stroke="oklch(0.65 0.18 290)" stroke-opacity="0.12" stroke-width="1"   stroke-dasharray="1 4"/>
					<line x1="118" y1="22" x2="155" y2="22" stroke="oklch(0.68 0.20 265)" stroke-opacity="0.28" stroke-width="1.5" stroke-dasharray="2 3">
						{#if !reducedMotion}
							<animate id="shim-f-{id}" begin="7s; shim-f-{id}.end+18s" dur="2s" attributeName="stroke-opacity" values="0.28;0.49;0.28"/>
						{/if}
					</line>

					<!-- Intermediate branch nodes — very faint breathing (previously static) -->
					<circle class="os-pulse-node" style="--os-base:0.22; --os-peak:0.42; animation-duration:13.9s; animation-delay:-3.7s;"  cx="80" cy="8"  r="2.5" fill="oklch(0.65 0.18 290)" opacity="0.22"/>
					<circle class="os-pulse-node" style="--os-base:0.22; --os-peak:0.42; animation-duration:15.1s; animation-delay:-11.0s;" cx="80" cy="36" r="2.5" fill="oklch(0.65 0.18 290)" opacity="0.22"/>

					<!-- Three isolated discovery nodes — slow, independent, asynchronous -->
					<circle class="os-pulse-node" style="--os-base:0.36; --os-peak:0.72; animation-duration:12.4s; animation-delay:-1.8s;"  cx="15" cy="8"  r="3" fill="oklch(0.65 0.18 290)" opacity="0.36"/>
					<circle class="os-pulse-node" style="--os-base:0.40; --os-peak:0.76; animation-duration:14.7s; animation-delay:-6.3s;"  cx="15" cy="22" r="3" fill="oklch(0.65 0.18 290)" opacity="0.40"/>
					<circle class="os-pulse-node" style="--os-base:0.36; --os-peak:0.72; animation-duration:11.8s; animation-delay:-9.2s;"  cx="15" cy="36" r="3" fill="oklch(0.65 0.18 290)" opacity="0.36"/>

					<!-- Convergence node — slower breathing, more weighted presence -->
					<circle class="os-pulse-node" style="--os-base:0.52; --os-peak:0.85; animation-duration:19.3s; animation-delay:-7.6s;" cx="118" cy="22" r="3.5" fill="oklch(0.65 0.18 290)" opacity="0.52"/>
					{#if !reducedMotion}
						<!-- Rare expanding pulse ring — signal resonance, not radar ping -->
						<circle cx="118" cy="22" r="3.5" fill="none" stroke="oklch(0.65 0.18 290)" stroke-opacity="0" stroke-width="0.8">
							<animate id="ring-cv-{id}" begin="10s; ring-cv-{id}.end+20s" dur="4.5s" attributeName="r" from="3.5" to="14"/>
							<animate begin="10s; ring-cv-{id}.end+20s" dur="4.5s" attributeName="stroke-opacity" values="0;0.20;0"/>
						</circle>
					{/if}

					<!--
						Signal endpoint — 4-layer halo: outer ambient → soft inner glow → stroke ring → core.
						Layer 4: rare expanding pulse ring (fires once every ~30s).
					-->
					<circle cx="155" cy="22" r="14" fill="oklch(0.68 0.20 265 / 0.046)"/>
					<circle cx="155" cy="22" r="10" fill="oklch(0.68 0.20 265 / 0.08)"/>
					<circle cx="155" cy="22" r="5"  fill="oklch(0.68 0.20 265 / 0.16)" stroke="oklch(0.68 0.20 265)" stroke-opacity="0.48" stroke-width="1"/>
					<circle class="os-pulse-node" style="--os-base:0.82; --os-peak:1.00; animation-duration:16.8s; animation-delay:-3.9s;" cx="155" cy="22" r="2.5" fill="oklch(0.68 0.20 265)" opacity="0.82"/>
					{#if !reducedMotion}
						<circle cx="155" cy="22" r="5" fill="none" stroke="oklch(0.68 0.20 265)" stroke-opacity="0" stroke-width="0.8">
							<animate id="ring-ep-{id}" begin="5s; ring-ep-{id}.end+25s" dur="5s" attributeName="r" from="5" to="20"/>
							<animate begin="5s; ring-ep-{id}.end+25s" dur="5s" attributeName="stroke-opacity" values="0;0.28;0"/>
						</circle>
					{/if}

					<!--
						Propagation pulse particles — blurred, low opacity, non-continuous.
						Pulse A: along the middle horizontal path (most active path in this diagram).
						Pulse B: along the final convergence-to-signal path (rare, brighter).
						Each chains: plays once, idles, plays again — never simultaneous.
					-->
					{#if !reducedMotion}
						<circle r="1.5" fill="oklch(0.65 0.18 290)" filter="url(#f-{id})" opacity="0">
							<animate id="pa-{id}" begin="4s; pa-{id}.end+13s" dur="10s" attributeName="opacity" values="0;0.53;0.53;0" keyTimes="0;0.08;0.92;1"/>
							<animateMotion begin="4s; pa-{id}.end+13s" dur="10s">
								<mpath href="#mp-b-{id}"/>
							</animateMotion>
						</circle>
						<circle r="1.5" fill="oklch(0.68 0.20 265)" filter="url(#f-{id})" opacity="0">
							<animate id="pb-{id}" begin="11s; pb-{id}.end+19s" dur="7s" attributeName="opacity" values="0;0.60;0.60;0" keyTimes="0;0.10;0.90;1"/>
							<animateMotion begin="11s; pb-{id}.end+19s" dur="7s">
								<mpath href="#mp-f-{id}"/>
							</animateMotion>
						</circle>
					{/if}
				</svg>

			{:else if item.storyType === 'convergent-paths'}
				<!--
					Two completely independent paths arriving at one convergence node.
					Emotion: synchronization across distance — two scenes finding the same signal.

					Motion:
					  - two propagation pulses travel independently (6s apart in start, different durations)
					  - convergence node fires a strong delayed pulse ring ~22s in (after both pulses arrive)
					  - shimmer on the two approach segments
					  - 4-layer halo on convergence node with slow core breathing
				-->
				<svg viewBox="0 0 180 44" width="100%" class="overflow-visible">
					<defs>
						<filter id="f-{id}" x="-150%" y="-150%" width="400%" height="400%">
							<feGaussianBlur stdDeviation="1.2"/>
						</filter>
						{#if !reducedMotion}
							<!-- Full path 1 (upper) as a polyline for smooth particle motion -->
							<path id="mp-1-{id}" d="M15,12 L55,14 L100,10 L132,18 L150,22"/>
							<!-- Full path 2 (lower) -->
							<path id="mp-2-{id}" d="M15,32 L52,30 L98,34 L132,26 L150,22"/>
						{/if}
					</defs>

					<!-- Path 1 lines (upper) -->
					<line x1="15"  y1="12" x2="55"  y2="14" stroke="oklch(0.65 0.18 290)" stroke-opacity="0.16" stroke-width="1"   stroke-dasharray="2 3"/>
					<line x1="55"  y1="14" x2="100" y2="10" stroke="oklch(0.65 0.18 290)" stroke-opacity="0.16" stroke-width="1"   stroke-dasharray="2 3"/>
					<line x1="100" y1="10" x2="132" y2="18" stroke="oklch(0.65 0.18 290)" stroke-opacity="0.16" stroke-width="1"   stroke-dasharray="2 3">
						{#if !reducedMotion}
							<animate id="shim-1a-{id}" begin="12s; shim-1a-{id}.end+23s" dur="2s" attributeName="stroke-opacity" values="0.16;0.32;0.16"/>
						{/if}
					</line>
					<line x1="132" y1="18" x2="150" y2="22" stroke="oklch(0.68 0.20 265)" stroke-opacity="0.22" stroke-width="1.5" stroke-dasharray="1 4"/>

					<!-- Path 2 lines (lower) -->
					<line x1="15"  y1="32" x2="52"  y2="30" stroke="oklch(0.65 0.18 290)" stroke-opacity="0.16" stroke-width="1"   stroke-dasharray="2 3"/>
					<line x1="52"  y1="30" x2="98"  y2="34" stroke="oklch(0.65 0.18 290)" stroke-opacity="0.16" stroke-width="1"   stroke-dasharray="2 3"/>
					<line x1="98"  y1="34" x2="132" y2="26" stroke="oklch(0.65 0.18 290)" stroke-opacity="0.16" stroke-width="1"   stroke-dasharray="2 3">
						{#if !reducedMotion}
							<animate id="shim-2a-{id}" begin="19s; shim-2a-{id}.end+17s" dur="2s" attributeName="stroke-opacity" values="0.16;0.32;0.16"/>
						{/if}
					</line>
					<line x1="132" y1="26" x2="150" y2="22" stroke="oklch(0.68 0.20 265)" stroke-opacity="0.22" stroke-width="1.5" stroke-dasharray="1 4"/>

					<!-- Path 1 nodes — irregular independent breathing -->
					<circle class="os-pulse-node" style="--os-base:0.40; --os-peak:0.76; animation-duration:13.2s; animation-delay:-2.1s;"  cx="15"  cy="12" r="3"   fill="oklch(0.65 0.18 290)" opacity="0.40"/>
					<circle class="os-pulse-node" style="--os-base:0.30; --os-peak:0.60; animation-duration:14.8s; animation-delay:-5.4s;"  cx="55"  cy="14" r="2.5" fill="oklch(0.65 0.18 290)" opacity="0.30"/>
					<circle class="os-pulse-node" style="--os-base:0.30; --os-peak:0.60; animation-duration:12.6s; animation-delay:-8.9s;"  cx="100" cy="10" r="2.5" fill="oklch(0.65 0.18 290)" opacity="0.30"/>
					<circle class="os-pulse-node" style="--os-base:0.33; --os-peak:0.64; animation-duration:16.4s; animation-delay:-1.3s;"  cx="132" cy="18" r="2.5" fill="oklch(0.65 0.18 290)" opacity="0.33"/>

					<!-- Path 2 nodes — offset from path 1, no synchronization -->
					<circle class="os-pulse-node" style="--os-base:0.40; --os-peak:0.76; animation-duration:11.9s; animation-delay:-9.7s;"  cx="15"  cy="32" r="3"   fill="oklch(0.65 0.18 290)" opacity="0.40"/>
					<circle class="os-pulse-node" style="--os-base:0.30; --os-peak:0.60; animation-duration:15.3s; animation-delay:-4.8s;"  cx="52"  cy="30" r="2.5" fill="oklch(0.65 0.18 290)" opacity="0.30"/>
					<circle class="os-pulse-node" style="--os-base:0.30; --os-peak:0.60; animation-duration:13.7s; animation-delay:-12.2s;" cx="98"  cy="34" r="2.5" fill="oklch(0.65 0.18 290)" opacity="0.30"/>
					<circle class="os-pulse-node" style="--os-base:0.33; --os-peak:0.64; animation-duration:17.1s; animation-delay:-6.5s;"  cx="132" cy="26" r="2.5" fill="oklch(0.65 0.18 290)" opacity="0.33"/>

					<!--
						Convergence node — 4-layer halo (outer ambient → glow → stroke ring → core).
						Core breathes very slowly (21.5s). Pulse ring fires ~22s in (after both
						propagation pulses have had time to arrive), then every ~26s thereafter.
					-->
					<circle cx="150" cy="22" r="14" fill="oklch(0.68 0.20 265 / 0.058)"/>
					<circle cx="150" cy="22" r="11" fill="oklch(0.68 0.20 265 / 0.07)"/>
					<circle cx="150" cy="22" r="6"  fill="oklch(0.68 0.20 265 / 0.14)" stroke="oklch(0.68 0.20 265)" stroke-opacity="0.45" stroke-width="1"/>
					<circle class="os-pulse-node" style="--os-base:0.70; --os-peak:0.96; animation-duration:21.5s; animation-delay:-14.3s;" cx="150" cy="22" r="2.5" fill="oklch(0.68 0.20 265)" opacity="0.70"/>
					{#if !reducedMotion}
						<!-- Lingering pulse ring — resonance after both paths arrive -->
						<circle cx="150" cy="22" r="6" fill="none" stroke="oklch(0.68 0.20 265)" stroke-opacity="0" stroke-width="1">
							<animate id="ring-cv2-{id}" begin="22s; ring-cv2-{id}.end+21s" dur="5.5s" attributeName="r" from="6" to="22"/>
							<animate begin="22s; ring-cv2-{id}.end+21s" dur="5.5s" attributeName="stroke-opacity" values="0;0.32;0"/>
						</circle>
					{/if}

					<!--
						Two propagation pulses — independent timing so they travel simultaneously
						at different points and arrive at different moments. The 12s offset in start
						time means pulses are never in the same phase of their cycle.
					-->
					{#if !reducedMotion}
						<circle r="1.5" fill="oklch(0.65 0.18 290)" filter="url(#f-{id})" opacity="0">
							<animate id="pp1-{id}" begin="6s; pp1-{id}.end+15s" dur="14s" attributeName="opacity" values="0;0.51;0.51;0" keyTimes="0;0.07;0.93;1"/>
							<animateMotion begin="6s; pp1-{id}.end+15s" dur="14s">
								<mpath href="#mp-1-{id}"/>
							</animateMotion>
						</circle>
						<circle r="1.5" fill="oklch(0.65 0.18 290)" filter="url(#f-{id})" opacity="0">
							<animate id="pp2-{id}" begin="18s; pp2-{id}.end+12s" dur="13s" attributeName="opacity" values="0;0.51;0.51;0" keyTimes="0;0.07;0.93;1"/>
							<animateMotion begin="18s; pp2-{id}.end+12s" dur="13s">
								<mpath href="#mp-2-{id}"/>
							</animateMotion>
						</circle>
					{/if}
				</svg>

			{:else if item.storyType === 'origin-hub'}
				<!--
					One large origin node seeding 5 branches radiating outward.
					Emotion: cultural influence radiating — one source shaping many discoveries.

					Motion:
					  - origin node breathes very slowly (22.6s) — ancient, accumulating energy
					  - origin has 4-layer halo + rare outward expanding ring
					  - two propagation pulses travel outward along center + upper spokes
					  - branch nodes breathe independently (15–19s) — waking after influence
					  - terminal nodes breathe faintly (10–14s) — far echoes
					  - shimmer on center spoke + upper spoke
				-->
				<svg viewBox="0 0 180 44" width="100%" class="overflow-visible">
					<defs>
						<filter id="f-{id}" x="-150%" y="-150%" width="400%" height="400%">
							<feGaussianBlur stdDeviation="1.2"/>
						</filter>
						{#if !reducedMotion}
							<!-- Center spoke (most prominent) — origin → middle branch → middle terminal -->
							<path id="mp-c-{id}" d="M20,22 L72,22 L140,22"/>
							<!-- Upper spoke — origin → upper branch → upper terminal -->
							<path id="mp-u-{id}" d="M20,22 L68,14 L140,13"/>
						{/if}
					</defs>

					<!-- Radiating lines: origin → intermediate branch → terminal -->
					<line x1="20" y1="22" x2="65" y2="5"   stroke="oklch(0.65 0.18 290)" stroke-opacity="0.13" stroke-width="1"   stroke-dasharray="2 3"/>
					<line x1="65" y1="5"  x2="138" y2="3"  stroke="oklch(0.65 0.18 290)" stroke-opacity="0.10" stroke-width="1"   stroke-dasharray="2 3"/>
					<line x1="20" y1="22" x2="68" y2="14"  stroke="oklch(0.65 0.18 290)" stroke-opacity="0.15" stroke-width="1"   stroke-dasharray="2 3"/>
					<line x1="68" y1="14" x2="140" y2="13" stroke="oklch(0.65 0.18 290)" stroke-opacity="0.12" stroke-width="1"   stroke-dasharray="2 3">
						{#if !reducedMotion}
							<animate id="shim-u-{id}" begin="9s; shim-u-{id}.end+24s" dur="2s" attributeName="stroke-opacity" values="0.12;0.26;0.12"/>
						{/if}
					</line>
					<line x1="20" y1="22" x2="72" y2="22"  stroke="oklch(0.65 0.18 290)" stroke-opacity="0.18" stroke-width="1.5" stroke-dasharray="2 3"/>
					<line x1="72" y1="22" x2="140" y2="22" stroke="oklch(0.65 0.18 290)" stroke-opacity="0.15" stroke-width="1.5" stroke-dasharray="2 3">
						{#if !reducedMotion}
							<animate id="shim-c-{id}" begin="3s; shim-c-{id}.end+20s" dur="2.5s" attributeName="stroke-opacity" values="0.15;0.30;0.15"/>
						{/if}
					</line>
					<line x1="20" y1="22" x2="68" y2="30"  stroke="oklch(0.65 0.18 290)" stroke-opacity="0.15" stroke-width="1"   stroke-dasharray="2 3"/>
					<line x1="68" y1="30" x2="140" y2="31" stroke="oklch(0.65 0.18 290)" stroke-opacity="0.12" stroke-width="1"   stroke-dasharray="2 3"/>
					<line x1="20" y1="22" x2="65" y2="39"  stroke="oklch(0.65 0.18 290)" stroke-opacity="0.13" stroke-width="1"   stroke-dasharray="2 3"/>
					<line x1="65" y1="39" x2="138" y2="41" stroke="oklch(0.65 0.18 290)" stroke-opacity="0.10" stroke-width="1"   stroke-dasharray="2 3"/>

					<!-- Terminal (endpoint) nodes — faint, irregular breathing (far echoes) -->
					<circle class="os-pulse-node" style="--os-base:0.26; --os-peak:0.56; animation-duration:12.8s; animation-delay:-2.4s;"  cx="138" cy="3"  r="2.5" fill="oklch(0.65 0.18 290)" opacity="0.26"/>
					<circle class="os-pulse-node" style="--os-base:0.28; --os-peak:0.60; animation-duration:11.4s; animation-delay:-6.7s;"  cx="140" cy="13" r="2.5" fill="oklch(0.65 0.18 290)" opacity="0.28"/>
					<circle class="os-pulse-node" style="--os-base:0.30; --os-peak:0.64; animation-duration:13.6s; animation-delay:-9.8s;"  cx="140" cy="22" r="2.5" fill="oklch(0.65 0.18 290)" opacity="0.30"/>
					<circle class="os-pulse-node" style="--os-base:0.28; --os-peak:0.60; animation-duration:10.9s; animation-delay:-4.1s;"  cx="140" cy="31" r="2.5" fill="oklch(0.65 0.18 290)" opacity="0.28"/>
					<circle class="os-pulse-node" style="--os-base:0.26; --os-peak:0.56; animation-duration:14.2s; animation-delay:-11.6s;" cx="138" cy="41" r="2.5" fill="oklch(0.65 0.18 290)" opacity="0.26"/>

					<!-- Intermediate branch nodes — independent breathing (waking after influence) -->
					<circle class="os-pulse-node" style="--os-base:0.36; --os-peak:0.68; animation-duration:16.7s; animation-delay:-5.3s;"  cx="65" cy="5"  r="3" fill="oklch(0.65 0.18 290)" opacity="0.36"/>
					<circle class="os-pulse-node" style="--os-base:0.40; --os-peak:0.72; animation-duration:18.1s; animation-delay:-9.1s;"  cx="68" cy="14" r="3" fill="oklch(0.65 0.18 290)" opacity="0.40"/>
					<circle class="os-pulse-node" style="--os-base:0.43; --os-peak:0.74; animation-duration:17.4s; animation-delay:-13.5s;" cx="72" cy="22" r="3" fill="oklch(0.65 0.18 290)" opacity="0.43"/>
					<circle class="os-pulse-node" style="--os-base:0.40; --os-peak:0.72; animation-duration:15.8s; animation-delay:-7.2s;"  cx="68" cy="30" r="3" fill="oklch(0.65 0.18 290)" opacity="0.40"/>
					<circle class="os-pulse-node" style="--os-base:0.36; --os-peak:0.68; animation-duration:19.3s; animation-delay:-2.8s;"  cx="65" cy="39" r="3" fill="oklch(0.65 0.18 290)" opacity="0.36"/>

					<!--
						Origin node — 4-layer halo: very faint outer ambient → soft glow → stroke ring → core.
						Core breathes slowest of all nodes (22.6s) — ancient, deeply rooted energy.
						Pulse ring fires rarely (every ~30s) — slow outward resonance.
					-->
					<circle cx="20" cy="22" r="16" fill="oklch(0.68 0.20 265 / 0.046)"/>
					<circle cx="20" cy="22" r="13" fill="oklch(0.68 0.20 265 / 0.06)"/>
					<circle cx="20" cy="22" r="8"  fill="oklch(0.68 0.20 265 / 0.12)" stroke="oklch(0.68 0.20 265)" stroke-opacity="0.38" stroke-width="1"/>
					<circle class="os-pulse-node" style="--os-base:0.80; --os-peak:1.00; animation-duration:22.6s; animation-delay:-8.4s;" cx="20" cy="22" r="3.5" fill="oklch(0.68 0.20 265)" opacity="0.80"/>
					{#if !reducedMotion}
						<!-- Outward expanding ring — cultural energy radiating -->
						<circle cx="20" cy="22" r="8" fill="none" stroke="oklch(0.68 0.20 265)" stroke-opacity="0" stroke-width="0.8">
							<animate id="ring-or-{id}" begin="6s; ring-or-{id}.end+24s" dur="6s" attributeName="r" from="8" to="24"/>
							<animate begin="6s; ring-or-{id}.end+24s" dur="6s" attributeName="stroke-opacity" values="0;0.22;0"/>
						</circle>
					{/if}

					<!--
						Two outward propagation pulses — from origin toward branch nodes.
						Center spoke: primary, brighter, starts at 8s.
						Upper spoke: secondary, slightly dimmer, starts at 21s (long offset prevents sync).
					-->
					{#if !reducedMotion}
						<circle r="1.5" fill="oklch(0.68 0.20 265)" filter="url(#f-{id})" opacity="0">
							<animate id="poc-{id}" begin="8s; poc-{id}.end+17s" dur="12s" attributeName="opacity" values="0;0.58;0.58;0" keyTimes="0;0.08;0.92;1"/>
							<animateMotion begin="8s; poc-{id}.end+17s" dur="12s">
								<mpath href="#mp-c-{id}"/>
							</animateMotion>
						</circle>
						<circle r="1.5" fill="oklch(0.65 0.18 290)" filter="url(#f-{id})" opacity="0">
							<animate id="pou-{id}" begin="21s; pou-{id}.end+14s" dur="11s" attributeName="opacity" values="0;0.46;0.46;0" keyTimes="0;0.08;0.92;1"/>
							<animateMotion begin="21s; pou-{id}.end+14s" dur="11s">
								<mpath href="#mp-u-{id}"/>
							</animateMotion>
						</circle>
					{/if}
				</svg>
			{/if}

		</div>

		<!--
			Narrative metadata — 2 lines, no truncation, no dashboard layout.
			Location on line 1; discoveries + scouts on line 2.
		-->
		<div class="mb-3">
			<p class="text-[11px] text-base-content/52 leading-snug">First surfaced: {item.seedLocation}</p>
			<p class="text-[11px] text-base-content/45 leading-snug mt-0.5">{item.discoveries} {item.discoveries === 1 ? 'discovery' : 'discoveries'} · {item.reachedScouts} scouts reached</p>
		</div>

		<!-- Trace Signal CTA -->
		<button
			class="w-full flex items-center justify-center h-7 rounded-full text-[12px] font-semibold border border-white/20 text-base-content/72 hover:text-secondary hover:border-secondary/38 hover:bg-white/4 transition-all duration-150"
		>
			Trace Signal →
		</button>

	</div>
</div>
