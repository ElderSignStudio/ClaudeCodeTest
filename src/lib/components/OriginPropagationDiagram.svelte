<script lang="ts">
	import type { OriginItem } from '$lib/mock/data';

	let { item, cinematic = false }: { item: OriginItem; cinematic?: boolean } = $props();

	let reducedMotion = $state(false);
	$effect(() => {
		reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	});

	const id = $derived(item.id);

	// Cinematic mode: taller viewBox + a translate so the inner coordinates
	// (designed against 180×44) sit vertically centered in 180×80.
	const viewBox = $derived(cinematic ? '0 0 180 80' : '0 0 180 44');
	const innerTransform = $derived(cinematic ? 'translate(0, 18)' : '');

	// Shared palette — kept identical across all story types so the lane reads
	// as one atmospheric language. NODE = inner branch, ACCENT = roots/bridges.
	const NODE = 'oklch(0.65 0.18 290)';
	const ACCENT = 'oklch(0.68 0.20 265)';
</script>

<!--
	Editorial propagation visuals for Origin Stories. Every story type renders
	a FOREST or DIVERGENT topology — never a convergence. Outer Signal's
	propagation rule (each user has exactly one origin per item; branches
	never merge) is the foundational constraint.

	Five story types:
	  - independent-origins  : three asymmetric trees, parallel discoveries
	  - cross-scene-spread   : one origin diverges into two distinct clusters
	  - dormant-breakout     : sparse early chain, then dense network ignition
	  - quiet-persistence    : a thin delicate chain stretching through time
	  - bridge-scout-event   : two distant clusters joined by a single bridge

	All five share the same palette + soft glow + node pulse language so the
	lane reads as one atmospheric system. Only the topology changes.
-->

{#if item.storyType === 'independent-origins'}
	<!--
		Three independent rooted trees, each carrying its own early downstream
		propagation. Each root was discovered separately; each began spreading
		quietly before broader cultural visibility. The trees never touch —
		they share only the signal identity, never structure.

		Asymmetry is intentional: each tree has a different shape, rhythm, and
		downstream density so the forest reads as organic emergence rather than
		three identical stamped icons.
	-->
	<svg {viewBox} width="100%" class="overflow-visible">
		<defs>
			<filter id="f-{id}" x="-150%" y="-150%" width="400%" height="400%">
				<feGaussianBlur stdDeviation="1.2"/>
			</filter>
			{#if !reducedMotion}
				<!-- One traversal path per tree, root → representative leaf. -->
				<path id="mp-tA-{id}" d="M15,4 L24,18 L32,32 L40,42"/>
				<path id="mp-tB-{id}" d="M82,8 L95,18 L102,30 L108,42"/>
				<path id="mp-tC-{id}" d="M150,4 L145,18 L155,32 L165,42"/>
			{/if}
		</defs>

		<g transform={innerTransform}>
			<!-- ── Tree A (left) — broad early branching with one extended limb ── -->
			<line x1="15" y1="4"  x2="8"  y2="18" stroke={NODE} stroke-opacity="0.20" stroke-width="1" stroke-dasharray="2 3"/>
			<line x1="15" y1="4"  x2="24" y2="18" stroke={NODE} stroke-opacity="0.20" stroke-width="1" stroke-dasharray="2 3"/>
			<line x1="8"  y1="18" x2="5"  y2="30" stroke={NODE} stroke-opacity="0.16" stroke-width="1" stroke-dasharray="2 3"/>
			<line x1="24" y1="18" x2="18" y2="32" stroke={NODE} stroke-opacity="0.16" stroke-width="1" stroke-dasharray="2 3"/>
			<line x1="24" y1="18" x2="32" y2="32" stroke={NODE} stroke-opacity="0.18" stroke-width="1" stroke-dasharray="2 3"/>
			<line x1="32" y1="32" x2="40" y2="42" stroke={NODE} stroke-opacity="0.14" stroke-width="1" stroke-dasharray="1 4"/>
			<!-- Independent-origin root halo: outer soft glow + inner ring + bright core pulse.
			     Geometry mirrors the cross-scene origin at ~70% intensity so the three
			     roots clearly read as genesis points without becoming dominant suns. -->
			<circle cx="15" cy="4" r="7"   fill="oklch(0.68 0.20 265 / 0.030)"/>
			<circle cx="15" cy="4" r="4.5" fill="oklch(0.68 0.20 265 / 0.10)" stroke={ACCENT} stroke-opacity="0.30" stroke-width="0.8"/>
			<circle class="os-pulse-node" style="--os-base:0.62; --os-peak:0.92; animation-duration:14.2s; animation-delay:-2.4s;"  cx="15" cy="4"  r="2.8" fill={ACCENT} opacity="0.62"/>
			<circle class="os-pulse-node" style="--os-base:0.38; --os-peak:0.66; animation-duration:13.1s; animation-delay:-7.6s;"  cx="8"  cy="18" r="2.5" fill={NODE}   opacity="0.38"/>
			<circle class="os-pulse-node" style="--os-base:0.40; --os-peak:0.68; animation-duration:15.6s; animation-delay:-4.0s;"  cx="24" cy="18" r="2.5" fill={NODE}   opacity="0.40"/>
			<circle class="os-pulse-node" style="--os-base:0.30; --os-peak:0.56; animation-duration:17.3s; animation-delay:-10.5s;" cx="5"  cy="30" r="2"   fill={NODE}   opacity="0.30"/>
			<circle class="os-pulse-node" style="--os-base:0.28; --os-peak:0.52; animation-duration:18.9s; animation-delay:-3.7s;"  cx="18" cy="32" r="2"   fill={NODE}   opacity="0.28"/>
			<circle class="os-pulse-node" style="--os-base:0.32; --os-peak:0.58; animation-duration:16.4s; animation-delay:-8.1s;"  cx="32" cy="32" r="2.2" fill={NODE}   opacity="0.32"/>
			<circle class="os-pulse-node" style="--os-base:0.24; --os-peak:0.44; animation-duration:20.1s; animation-delay:-12.8s;" cx="40" cy="42" r="1.8" fill={NODE}   opacity="0.24"/>

			<!-- ── Tree B (center) — deeper trailing chain ── -->
			<line x1="82" y1="8"  x2="72" y2="20" stroke={NODE} stroke-opacity="0.20" stroke-width="1" stroke-dasharray="2 3"/>
			<line x1="82" y1="8"  x2="95" y2="18" stroke={NODE} stroke-opacity="0.20" stroke-width="1" stroke-dasharray="2 3"/>
			<line x1="72" y1="20" x2="68" y2="34" stroke={NODE} stroke-opacity="0.16" stroke-width="1" stroke-dasharray="2 3"/>
			<line x1="72" y1="20" x2="78" y2="36" stroke={NODE} stroke-opacity="0.16" stroke-width="1" stroke-dasharray="2 3"/>
			<line x1="95" y1="18" x2="102" y2="30" stroke={NODE} stroke-opacity="0.18" stroke-width="1" stroke-dasharray="2 3"/>
			<line x1="102" y1="30" x2="108" y2="42" stroke={NODE} stroke-opacity="0.14" stroke-width="1" stroke-dasharray="1 4"/>
			<circle cx="82" cy="8" r="7"   fill="oklch(0.68 0.20 265 / 0.030)"/>
			<circle cx="82" cy="8" r="4.5" fill="oklch(0.68 0.20 265 / 0.10)" stroke={ACCENT} stroke-opacity="0.30" stroke-width="0.8"/>
			<circle class="os-pulse-node" style="--os-base:0.62; --os-peak:0.92; animation-duration:16.8s; animation-delay:-9.1s;" cx="82"  cy="8"  r="2.8" fill={ACCENT} opacity="0.62"/>
			<circle class="os-pulse-node" style="--os-base:0.40; --os-peak:0.68; animation-duration:14.7s; animation-delay:-3.2s;" cx="72"  cy="20" r="2.5" fill={NODE}   opacity="0.40"/>
			<circle class="os-pulse-node" style="--os-base:0.38; --os-peak:0.66; animation-duration:12.9s; animation-delay:-11.4s;" cx="95"  cy="18" r="2.5" fill={NODE}   opacity="0.38"/>
			<circle class="os-pulse-node" style="--os-base:0.30; --os-peak:0.56; animation-duration:18.6s; animation-delay:-5.8s;"  cx="68"  cy="34" r="2"   fill={NODE}   opacity="0.30"/>
			<circle class="os-pulse-node" style="--os-base:0.28; --os-peak:0.52; animation-duration:17.5s; animation-delay:-2.7s;"  cx="78"  cy="36" r="2"   fill={NODE}   opacity="0.28"/>
			<circle class="os-pulse-node" style="--os-base:0.32; --os-peak:0.58; animation-duration:15.3s; animation-delay:-8.9s;"  cx="102" cy="30" r="2.2" fill={NODE}   opacity="0.32"/>
			<circle class="os-pulse-node" style="--os-base:0.24; --os-peak:0.44; animation-duration:19.7s; animation-delay:-13.6s;" cx="108" cy="42" r="1.8" fill={NODE}   opacity="0.24"/>

			<!-- ── Tree C (right) — single-stem cascade fanning at the bottom ── -->
			<line x1="150" y1="4"  x2="145" y2="18" stroke={NODE} stroke-opacity="0.20" stroke-width="1" stroke-dasharray="2 3"/>
			<line x1="145" y1="18" x2="138" y2="30" stroke={NODE} stroke-opacity="0.18" stroke-width="1" stroke-dasharray="2 3"/>
			<line x1="145" y1="18" x2="155" y2="32" stroke={NODE} stroke-opacity="0.18" stroke-width="1" stroke-dasharray="2 3"/>
			<line x1="138" y1="30" x2="135" y2="42" stroke={NODE} stroke-opacity="0.14" stroke-width="1" stroke-dasharray="1 4"/>
			<line x1="155" y1="32" x2="148" y2="42" stroke={NODE} stroke-opacity="0.14" stroke-width="1" stroke-dasharray="1 4"/>
			<line x1="155" y1="32" x2="165" y2="42" stroke={NODE} stroke-opacity="0.14" stroke-width="1" stroke-dasharray="1 4"/>
			<circle cx="150" cy="4" r="7"   fill="oklch(0.68 0.20 265 / 0.030)"/>
			<circle cx="150" cy="4" r="4.5" fill="oklch(0.68 0.20 265 / 0.10)" stroke={ACCENT} stroke-opacity="0.30" stroke-width="0.8"/>
			<circle class="os-pulse-node" style="--os-base:0.62; --os-peak:0.92; animation-duration:15.4s; animation-delay:-6.3s;"  cx="150" cy="4"  r="2.8" fill={ACCENT} opacity="0.62"/>
			<circle class="os-pulse-node" style="--os-base:0.40; --os-peak:0.68; animation-duration:13.8s; animation-delay:-1.9s;"  cx="145" cy="18" r="2.5" fill={NODE}   opacity="0.40"/>
			<circle class="os-pulse-node" style="--os-base:0.32; --os-peak:0.58; animation-duration:16.1s; animation-delay:-8.7s;"  cx="138" cy="30" r="2.2" fill={NODE}   opacity="0.32"/>
			<circle class="os-pulse-node" style="--os-base:0.32; --os-peak:0.58; animation-duration:17.8s; animation-delay:-12.6s;" cx="155" cy="32" r="2.2" fill={NODE}   opacity="0.32"/>
			<circle class="os-pulse-node" style="--os-base:0.24; --os-peak:0.44; animation-duration:19.4s; animation-delay:-4.5s;"  cx="135" cy="42" r="1.8" fill={NODE}   opacity="0.24"/>
			<circle class="os-pulse-node" style="--os-base:0.26; --os-peak:0.46; animation-duration:18.1s; animation-delay:-10.2s;" cx="148" cy="42" r="1.8" fill={NODE}   opacity="0.26"/>
			<circle class="os-pulse-node" style="--os-base:0.24; --os-peak:0.44; animation-duration:20.8s; animation-delay:-14.1s;" cx="165" cy="42" r="1.8" fill={NODE}   opacity="0.24"/>

			{#if !reducedMotion}
				<!--
					Three slow root-to-leaf pulses, one per tree. Staggered begin
					times so the traversals never all run together — propagation
					rhythm without synchronization.
				-->
				<circle r="1.4" fill={NODE} filter="url(#f-{id})" opacity="0">
					<animate id="pia-{id}" begin="4s; pia-{id}.end+22s" dur="9s" attributeName="opacity" values="0;0.50;0.50;0" keyTimes="0;0.10;0.90;1"/>
					<animateMotion begin="4s; pia-{id}.end+22s" dur="9s"><mpath href="#mp-tA-{id}"/></animateMotion>
				</circle>
				<circle r="1.4" fill={NODE} filter="url(#f-{id})" opacity="0">
					<animate id="pib-{id}" begin="13s; pib-{id}.end+18s" dur="10s" attributeName="opacity" values="0;0.50;0.50;0" keyTimes="0;0.10;0.90;1"/>
					<animateMotion begin="13s; pib-{id}.end+18s" dur="10s"><mpath href="#mp-tB-{id}"/></animateMotion>
				</circle>
				<circle r="1.4" fill={NODE} filter="url(#f-{id})" opacity="0">
					<animate id="pic-{id}" begin="24s; pic-{id}.end+16s" dur="9s" attributeName="opacity" values="0;0.50;0.50;0" keyTimes="0;0.10;0.90;1"/>
					<animateMotion begin="24s; pic-{id}.end+16s" dur="9s"><mpath href="#mp-tC-{id}"/></animateMotion>
				</circle>
			{/if}
		</g>
	</svg>

{:else if item.storyType === 'cross-scene-spread'}
	<!--
		Single origin diverging into two distinct propagation clusters. The
		clusters share ONLY the origin node — they are different cultural
		ecosystems carrying the same signal in different directions. No
		reconvergence anywhere.
	-->
	<svg {viewBox} width="100%" class="overflow-visible">
		<defs>
			<filter id="f-{id}" x="-150%" y="-150%" width="400%" height="400%">
				<feGaussianBlur stdDeviation="1.2"/>
			</filter>
			{#if !reducedMotion}
				<path id="mp-up-{id}"   d="M12,22 L50,12 L90,8 L130,6 L165,8"/>
				<path id="mp-down-{id}" d="M12,22 L55,32 L90,35 L130,38 L165,34"/>
			{/if}
		</defs>

		<g transform={innerTransform}>
			<!-- Upper branch — divergent cluster A -->
			<line x1="12" y1="22" x2="50"  y2="12" stroke={NODE} stroke-opacity="0.20" stroke-width="1.2" stroke-dasharray="2 3"/>
			<line x1="50" y1="12" x2="90"  y2="8"  stroke={NODE} stroke-opacity="0.18" stroke-width="1"   stroke-dasharray="2 3"/>
			<line x1="90" y1="8"  x2="130" y2="6"  stroke={NODE} stroke-opacity="0.16" stroke-width="1"   stroke-dasharray="2 3">
				{#if !reducedMotion}
					<animate begin="10s; 0s+30s" dur="2s" attributeName="stroke-opacity" values="0.16;0.34;0.16"/>
				{/if}
			</line>
			<line x1="130" y1="6"  x2="165" y2="8"  stroke={NODE} stroke-opacity="0.14" stroke-width="1"   stroke-dasharray="2 3"/>

			<!-- Lower branch — divergent cluster B (different rhythm/spread) -->
			<line x1="12"  y1="22" x2="55"  y2="32" stroke={NODE} stroke-opacity="0.20" stroke-width="1.2" stroke-dasharray="2 3"/>
			<line x1="55"  y1="32" x2="90"  y2="35" stroke={NODE} stroke-opacity="0.18" stroke-width="1"   stroke-dasharray="2 3"/>
			<line x1="90"  y1="35" x2="130" y2="38" stroke={NODE} stroke-opacity="0.16" stroke-width="1"   stroke-dasharray="2 3">
				{#if !reducedMotion}
					<animate begin="18s; 0s+30s" dur="2s" attributeName="stroke-opacity" values="0.16;0.34;0.16"/>
				{/if}
			</line>
			<line x1="130" y1="38" x2="165" y2="34" stroke={NODE} stroke-opacity="0.14" stroke-width="1"   stroke-dasharray="2 3"/>

			<!-- Origin -->
			<circle cx="12" cy="22" r="10" fill="oklch(0.68 0.20 265 / 0.06)"/>
			<circle cx="12" cy="22" r="6"  fill="oklch(0.68 0.20 265 / 0.12)" stroke={ACCENT} stroke-opacity="0.42" stroke-width="1"/>
			<circle class="os-pulse-node" style="--os-base:0.78; --os-peak:1.00; animation-duration:18.4s; animation-delay:-3.6s;" cx="12" cy="22" r="3" fill={ACCENT} opacity="0.78"/>

			<!-- Upper cluster nodes -->
			<circle class="os-pulse-node" style="--os-base:0.34; --os-peak:0.60; animation-duration:14.6s; animation-delay:-7.3s;"  cx="50"  cy="12" r="2.5" fill={NODE} opacity="0.34"/>
			<circle class="os-pulse-node" style="--os-base:0.32; --os-peak:0.58; animation-duration:13.2s; animation-delay:-2.1s;"  cx="90"  cy="8"  r="2.5" fill={NODE} opacity="0.32"/>
			<circle class="os-pulse-node" style="--os-base:0.30; --os-peak:0.54; animation-duration:15.8s; animation-delay:-10.8s;" cx="130" cy="6"  r="2.5" fill={NODE} opacity="0.30"/>
			<circle class="os-pulse-node" style="--os-base:0.28; --os-peak:0.50; animation-duration:16.9s; animation-delay:-5.4s;"  cx="165" cy="8"  r="2.5" fill={NODE} opacity="0.28"/>

			<!-- Lower cluster nodes (slightly different cadence so the two scenes feel distinct) -->
			<circle class="os-pulse-node" style="--os-base:0.34; --os-peak:0.60; animation-duration:12.7s; animation-delay:-4.5s;"  cx="55"  cy="32" r="2.5" fill={NODE} opacity="0.34"/>
			<circle class="os-pulse-node" style="--os-base:0.32; --os-peak:0.58; animation-duration:17.4s; animation-delay:-11.6s;" cx="90"  cy="35" r="2.5" fill={NODE} opacity="0.32"/>
			<circle class="os-pulse-node" style="--os-base:0.30; --os-peak:0.54; animation-duration:13.9s; animation-delay:-8.2s;"  cx="130" cy="38" r="2.5" fill={NODE} opacity="0.30"/>
			<circle class="os-pulse-node" style="--os-base:0.28; --os-peak:0.50; animation-duration:15.1s; animation-delay:-1.7s;"  cx="165" cy="34" r="2.5" fill={NODE} opacity="0.28"/>

			{#if !reducedMotion}
				<!-- Two motion-path pulses traveling outward from the origin into the two scenes. -->
				<circle r="1.5" fill={NODE} filter="url(#f-{id})" opacity="0">
					<animate id="pu-{id}" begin="5s; pu-{id}.end+18s" dur="11s" attributeName="opacity" values="0;0.52;0.52;0" keyTimes="0;0.10;0.90;1"/>
					<animateMotion begin="5s; pu-{id}.end+18s" dur="11s"><mpath href="#mp-up-{id}"/></animateMotion>
				</circle>
				<circle r="1.5" fill={NODE} filter="url(#f-{id})" opacity="0">
					<animate id="pd-{id}" begin="14s; pd-{id}.end+15s" dur="12s" attributeName="opacity" values="0;0.52;0.52;0" keyTimes="0;0.10;0.90;1"/>
					<animateMotion begin="14s; pd-{id}.end+15s" dur="12s"><mpath href="#mp-down-{id}"/></animateMotion>
				</circle>
			{/if}
		</g>
	</svg>

{:else if item.storyType === 'dormant-breakout'}
	<!--
		Sparse left half (dormant single chain) + dense right half (network
		ignition). The single bright node at the boundary is the moment the
		signal accelerated. Same propagation tree, different rates.
	-->
	<svg {viewBox} width="100%" class="overflow-visible">
		<defs>
			<filter id="f-{id}" x="-150%" y="-150%" width="400%" height="400%">
				<feGaussianBlur stdDeviation="1.2"/>
			</filter>
			{#if !reducedMotion}
				<path id="mp-dormant-{id}" d="M8,22 L30,22 L52,22 L72,22"/>
				<path id="mp-burst-{id}"   d="M72,22 L100,22 L130,22 L160,22"/>
			{/if}
		</defs>

		<g transform={innerTransform}>
			<!-- Dormant thin chain — sparse, dim, drawn-out -->
			<line x1="8"  y1="22" x2="30" y2="22" stroke={NODE} stroke-opacity="0.14" stroke-width="0.8" stroke-dasharray="1 4"/>
			<line x1="30" y1="22" x2="52" y2="22" stroke={NODE} stroke-opacity="0.14" stroke-width="0.8" stroke-dasharray="1 4"/>
			<line x1="52" y1="22" x2="72" y2="22" stroke={NODE} stroke-opacity="0.18" stroke-width="0.8" stroke-dasharray="1 4"/>

			<circle class="os-pulse-node" style="--os-base:0.40; --os-peak:0.66; animation-duration:21.4s; animation-delay:-3.8s;" cx="8"  cy="22" r="2.5" fill={NODE} opacity="0.40"/>
			<circle class="os-pulse-node" style="--os-base:0.22; --os-peak:0.40; animation-duration:23.6s; animation-delay:-10.2s;" cx="30" cy="22" r="1.8" fill={NODE} opacity="0.22"/>
			<circle class="os-pulse-node" style="--os-base:0.22; --os-peak:0.40; animation-duration:22.1s; animation-delay:-5.7s;"  cx="52" cy="22" r="1.8" fill={NODE} opacity="0.22"/>

			<!-- Ignition node — bright, prominent moment of breakout -->
			<circle cx="72" cy="22" r="10" fill="oklch(0.68 0.20 265 / 0.05)"/>
			<circle cx="72" cy="22" r="6"  fill="oklch(0.68 0.20 265 / 0.12)" stroke={ACCENT} stroke-opacity="0.45" stroke-width="1"/>
			<circle class="os-pulse-node" style="--os-base:0.78; --os-peak:1.00; animation-duration:14.2s; animation-delay:-1.5s;" cx="72" cy="22" r="3" fill={ACCENT} opacity="0.78"/>
			{#if !reducedMotion}
				<circle cx="72" cy="22" r="6" fill="none" stroke={ACCENT} stroke-opacity="0" stroke-width="0.8">
					<animate id="ring-ig-{id}" begin="9s; ring-ig-{id}.end+18s" dur="5s" attributeName="r" from="6" to="22"/>
					<animate begin="9s; ring-ig-{id}.end+18s" dur="5s" attributeName="stroke-opacity" values="0;0.30;0"/>
				</circle>
			{/if}

			<!-- Breakout cluster — dense web of branches from the ignition -->
			<line x1="72" y1="22" x2="95"  y2="10" stroke={NODE} stroke-opacity="0.22" stroke-width="1" stroke-dasharray="2 3"/>
			<line x1="72" y1="22" x2="100" y2="22" stroke={NODE} stroke-opacity="0.24" stroke-width="1" stroke-dasharray="2 3"/>
			<line x1="72" y1="22" x2="95"  y2="34" stroke={NODE} stroke-opacity="0.22" stroke-width="1" stroke-dasharray="2 3"/>
			<line x1="95"  y1="10" x2="125" y2="8"  stroke={NODE} stroke-opacity="0.18" stroke-width="1" stroke-dasharray="2 3"/>
			<line x1="95"  y1="10" x2="120" y2="16" stroke={NODE} stroke-opacity="0.18" stroke-width="1" stroke-dasharray="2 3"/>
			<line x1="100" y1="22" x2="130" y2="22" stroke={NODE} stroke-opacity="0.20" stroke-width="1" stroke-dasharray="2 3"/>
			<line x1="100" y1="22" x2="128" y2="28" stroke={NODE} stroke-opacity="0.18" stroke-width="1" stroke-dasharray="2 3"/>
			<line x1="95"  y1="34" x2="120" y2="32" stroke={NODE} stroke-opacity="0.18" stroke-width="1" stroke-dasharray="2 3"/>
			<line x1="95"  y1="34" x2="125" y2="38" stroke={NODE} stroke-opacity="0.18" stroke-width="1" stroke-dasharray="2 3"/>
			<line x1="125" y1="8"  x2="155" y2="10" stroke={NODE} stroke-opacity="0.14" stroke-width="1" stroke-dasharray="1 4"/>
			<line x1="130" y1="22" x2="160" y2="22" stroke={NODE} stroke-opacity="0.16" stroke-width="1" stroke-dasharray="1 4"/>
			<line x1="125" y1="38" x2="158" y2="36" stroke={NODE} stroke-opacity="0.14" stroke-width="1" stroke-dasharray="1 4"/>

			<circle class="os-pulse-node" style="--os-base:0.36; --os-peak:0.62; animation-duration:11.8s; animation-delay:-2.6s;"  cx="95"  cy="10" r="2.2" fill={NODE} opacity="0.36"/>
			<circle class="os-pulse-node" style="--os-base:0.38; --os-peak:0.64; animation-duration:13.4s; animation-delay:-7.1s;"  cx="100" cy="22" r="2.4" fill={NODE} opacity="0.38"/>
			<circle class="os-pulse-node" style="--os-base:0.36; --os-peak:0.62; animation-duration:12.7s; animation-delay:-9.8s;"  cx="95"  cy="34" r="2.2" fill={NODE} opacity="0.36"/>
			<circle class="os-pulse-node" style="--os-base:0.30; --os-peak:0.54; animation-duration:14.5s; animation-delay:-4.3s;"  cx="120" cy="16" r="2"   fill={NODE} opacity="0.30"/>
			<circle class="os-pulse-node" style="--os-base:0.30; --os-peak:0.54; animation-duration:15.9s; animation-delay:-11.2s;" cx="125" cy="8"  r="2"   fill={NODE} opacity="0.30"/>
			<circle class="os-pulse-node" style="--os-base:0.32; --os-peak:0.58; animation-duration:13.1s; animation-delay:-6.5s;"  cx="130" cy="22" r="2.2" fill={NODE} opacity="0.32"/>
			<circle class="os-pulse-node" style="--os-base:0.30; --os-peak:0.54; animation-duration:14.8s; animation-delay:-8.4s;"  cx="128" cy="28" r="2"   fill={NODE} opacity="0.30"/>
			<circle class="os-pulse-node" style="--os-base:0.30; --os-peak:0.54; animation-duration:16.3s; animation-delay:-3.1s;"  cx="120" cy="32" r="2"   fill={NODE} opacity="0.30"/>
			<circle class="os-pulse-node" style="--os-base:0.30; --os-peak:0.54; animation-duration:13.7s; animation-delay:-12.6s;" cx="125" cy="38" r="2"   fill={NODE} opacity="0.30"/>
			<circle class="os-pulse-node" style="--os-base:0.26; --os-peak:0.46; animation-duration:17.5s; animation-delay:-1.8s;"  cx="155" cy="10" r="1.8" fill={NODE} opacity="0.26"/>
			<circle class="os-pulse-node" style="--os-base:0.28; --os-peak:0.50; animation-duration:16.1s; animation-delay:-13.4s;" cx="160" cy="22" r="2"   fill={NODE} opacity="0.28"/>
			<circle class="os-pulse-node" style="--os-base:0.26; --os-peak:0.46; animation-duration:18.2s; animation-delay:-5.9s;"  cx="158" cy="36" r="1.8" fill={NODE} opacity="0.26"/>

			{#if !reducedMotion}
				<!-- Slow pulse along the dormant chain, then a faster one through the burst -->
				<circle r="1.2" fill={NODE} filter="url(#f-{id})" opacity="0">
					<animate id="pdrm-{id}" begin="6s; pdrm-{id}.end+22s" dur="14s" attributeName="opacity" values="0;0.34;0.34;0" keyTimes="0;0.10;0.90;1"/>
					<animateMotion begin="6s; pdrm-{id}.end+22s" dur="14s"><mpath href="#mp-dormant-{id}"/></animateMotion>
				</circle>
				<circle r="1.5" fill={ACCENT} filter="url(#f-{id})" opacity="0">
					<animate id="pbst-{id}" begin="22s; pbst-{id}.end+19s" dur="5s" attributeName="opacity" values="0;0.62;0.62;0" keyTimes="0;0.10;0.90;1"/>
					<animateMotion begin="22s; pbst-{id}.end+19s" dur="5s"><mpath href="#mp-burst-{id}"/></animateMotion>
				</circle>
			{/if}
		</g>
	</svg>

{:else if item.storyType === 'quiet-persistence'}
	<!--
		A delicate thin chain stretching across the canvas. Few nodes, evenly
		spaced, all small and quiet. The signal kept moving — barely — over
		a long stretch. Almost no motion.
	-->
	<svg {viewBox} width="100%" class="overflow-visible">
		<defs>
			<filter id="f-{id}" x="-150%" y="-150%" width="400%" height="400%">
				<feGaussianBlur stdDeviation="1"/>
			</filter>
			{#if !reducedMotion}
				<path id="mp-persist-{id}" d="M15,22 L53,22 L90,22 L128,22 L165,22"/>
			{/if}
		</defs>

		<g transform={innerTransform}>
			<!-- The long thin chain. Dashed thinly, dim. -->
			<line x1="15"  y1="22" x2="53"  y2="22" stroke={NODE} stroke-opacity="0.16" stroke-width="0.8" stroke-dasharray="1 4"/>
			<line x1="53"  y1="22" x2="90"  y2="22" stroke={NODE} stroke-opacity="0.16" stroke-width="0.8" stroke-dasharray="1 4"/>
			<line x1="90"  y1="22" x2="128" y2="22" stroke={NODE} stroke-opacity="0.16" stroke-width="0.8" stroke-dasharray="1 4"/>
			<line x1="128" y1="22" x2="165" y2="22" stroke={NODE} stroke-opacity="0.16" stroke-width="0.8" stroke-dasharray="1 4"/>

			<circle class="os-pulse-node" style="--os-base:0.34; --os-peak:0.52; animation-duration:24.6s; animation-delay:-2.8s;"  cx="15"  cy="22" r="2" fill={NODE} opacity="0.34"/>
			<circle class="os-pulse-node" style="--os-base:0.30; --os-peak:0.48; animation-duration:26.3s; animation-delay:-9.4s;"  cx="53"  cy="22" r="2" fill={NODE} opacity="0.30"/>
			<circle class="os-pulse-node" style="--os-base:0.32; --os-peak:0.50; animation-duration:25.1s; animation-delay:-15.7s;" cx="90"  cy="22" r="2" fill={NODE} opacity="0.32"/>
			<circle class="os-pulse-node" style="--os-base:0.30; --os-peak:0.48; animation-duration:27.4s; animation-delay:-6.2s;"  cx="128" cy="22" r="2" fill={NODE} opacity="0.30"/>
			<circle class="os-pulse-node" style="--os-base:0.34; --os-peak:0.52; animation-duration:23.9s; animation-delay:-12.5s;" cx="165" cy="22" r="2" fill={NODE} opacity="0.34"/>

			{#if !reducedMotion}
				<!-- A single very slow pulse moving along the chain, then a long quiet gap. -->
				<circle r="1.2" fill={NODE} filter="url(#f-{id})" opacity="0">
					<animate id="pq-{id}" begin="8s; pq-{id}.end+32s" dur="22s" attributeName="opacity" values="0;0.40;0.40;0" keyTimes="0;0.08;0.92;1"/>
					<animateMotion begin="8s; pq-{id}.end+32s" dur="22s"><mpath href="#mp-persist-{id}"/></animateMotion>
				</circle>
			{/if}
		</g>
	</svg>

{:else if item.storyType === 'bridge-scout-event'}
	<!--
		Two distant clusters connected only by a single bridge node. The
		bridge scout is the prominent center figure — a single propagation
		event that joined two otherwise separate scenes.
	-->
	<svg {viewBox} width="100%" class="overflow-visible">
		<defs>
			<filter id="f-{id}" x="-150%" y="-150%" width="400%" height="400%">
				<feGaussianBlur stdDeviation="1.2"/>
			</filter>
			{#if !reducedMotion}
				<path id="mp-bridge-{id}" d="M38,16 L90,22 L142,28"/>
			{/if}
		</defs>

		<g transform={innerTransform}>
			<!-- Cluster A (upper-left) — interconnected nodes -->
			<line x1="12" y1="8"  x2="28" y2="12" stroke={NODE} stroke-opacity="0.18" stroke-width="1" stroke-dasharray="2 3"/>
			<line x1="28" y1="12" x2="42" y2="8"  stroke={NODE} stroke-opacity="0.18" stroke-width="1" stroke-dasharray="2 3"/>
			<line x1="12" y1="8"  x2="16" y2="22" stroke={NODE} stroke-opacity="0.16" stroke-width="1" stroke-dasharray="2 3"/>
			<line x1="28" y1="12" x2="38" y2="16" stroke={NODE} stroke-opacity="0.18" stroke-width="1" stroke-dasharray="2 3"/>
			<line x1="42" y1="8"  x2="38" y2="16" stroke={NODE} stroke-opacity="0.16" stroke-width="1" stroke-dasharray="2 3"/>

			<circle class="os-pulse-node" style="--os-base:0.36; --os-peak:0.60; animation-duration:14.7s; animation-delay:-2.3s;"  cx="12" cy="8"  r="2.4" fill={NODE} opacity="0.36"/>
			<circle class="os-pulse-node" style="--os-base:0.34; --os-peak:0.58; animation-duration:13.2s; animation-delay:-6.8s;"  cx="28" cy="12" r="2.4" fill={NODE} opacity="0.34"/>
			<circle class="os-pulse-node" style="--os-base:0.36; --os-peak:0.60; animation-duration:15.5s; animation-delay:-10.1s;" cx="42" cy="8"  r="2.4" fill={NODE} opacity="0.36"/>
			<circle class="os-pulse-node" style="--os-base:0.30; --os-peak:0.54; animation-duration:16.8s; animation-delay:-4.6s;"  cx="16" cy="22" r="2"   fill={NODE} opacity="0.30"/>
			<circle class="os-pulse-node" style="--os-base:0.34; --os-peak:0.58; animation-duration:12.9s; animation-delay:-8.5s;"  cx="38" cy="16" r="2.4" fill={NODE} opacity="0.34"/>

			<!-- Bridge edges — the only connection between the two scenes -->
			<line x1="38"  y1="16" x2="90" y2="22" stroke={ACCENT} stroke-opacity="0.28" stroke-width="1.2" stroke-dasharray="2 3">
				{#if !reducedMotion}
					<animate begin="12s; 0s+30s" dur="2.2s" attributeName="stroke-opacity" values="0.28;0.48;0.28"/>
				{/if}
			</line>
			<line x1="90"  y1="22" x2="142" y2="28" stroke={ACCENT} stroke-opacity="0.28" stroke-width="1.2" stroke-dasharray="2 3">
				{#if !reducedMotion}
					<animate begin="14s; 0s+30s" dur="2.2s" attributeName="stroke-opacity" values="0.28;0.48;0.28"/>
				{/if}
			</line>

			<!-- Bridge scout — the prominent connecting figure -->
			<circle cx="90" cy="22" r="11" fill="oklch(0.68 0.20 265 / 0.05)"/>
			<circle cx="90" cy="22" r="7"  fill="oklch(0.68 0.20 265 / 0.12)" stroke={ACCENT} stroke-opacity="0.45" stroke-width="1"/>
			<circle class="os-pulse-node" style="--os-base:0.80; --os-peak:1.00; animation-duration:17.8s; animation-delay:-5.2s;" cx="90" cy="22" r="3" fill={ACCENT} opacity="0.80"/>
			{#if !reducedMotion}
				<circle cx="90" cy="22" r="7" fill="none" stroke={ACCENT} stroke-opacity="0" stroke-width="0.8">
					<animate id="ring-br-{id}" begin="7s; ring-br-{id}.end+24s" dur="5s" attributeName="r" from="7" to="22"/>
					<animate begin="7s; ring-br-{id}.end+24s" dur="5s" attributeName="stroke-opacity" values="0;0.28;0"/>
				</circle>
			{/if}

			<!-- Cluster B (lower-right) — different cluster shape than A -->
			<line x1="142" y1="28" x2="155" y2="26" stroke={NODE} stroke-opacity="0.18" stroke-width="1" stroke-dasharray="2 3"/>
			<line x1="155" y1="26" x2="170" y2="32" stroke={NODE} stroke-opacity="0.18" stroke-width="1" stroke-dasharray="2 3"/>
			<line x1="142" y1="28" x2="142" y2="38" stroke={NODE} stroke-opacity="0.16" stroke-width="1" stroke-dasharray="2 3"/>
			<line x1="142" y1="38" x2="165" y2="38" stroke={NODE} stroke-opacity="0.16" stroke-width="1" stroke-dasharray="2 3"/>

			<circle class="os-pulse-node" style="--os-base:0.36; --os-peak:0.60; animation-duration:14.1s; animation-delay:-7.4s;"  cx="142" cy="28" r="2.4" fill={NODE} opacity="0.36"/>
			<circle class="os-pulse-node" style="--os-base:0.34; --os-peak:0.58; animation-duration:15.6s; animation-delay:-3.5s;"  cx="155" cy="26" r="2.4" fill={NODE} opacity="0.34"/>
			<circle class="os-pulse-node" style="--os-base:0.30; --os-peak:0.54; animation-duration:13.8s; animation-delay:-11.7s;" cx="170" cy="32" r="2"   fill={NODE} opacity="0.30"/>
			<circle class="os-pulse-node" style="--os-base:0.32; --os-peak:0.56; animation-duration:16.4s; animation-delay:-9.2s;"  cx="142" cy="38" r="2.2" fill={NODE} opacity="0.32"/>
			<circle class="os-pulse-node" style="--os-base:0.30; --os-peak:0.54; animation-duration:17.1s; animation-delay:-1.4s;"  cx="165" cy="38" r="2"   fill={NODE} opacity="0.30"/>

			{#if !reducedMotion}
				<!-- A single pulse traveling across the bridge from cluster A to cluster B. -->
				<circle r="1.5" fill={ACCENT} filter="url(#f-{id})" opacity="0">
					<animate id="pbr-{id}" begin="10s; pbr-{id}.end+18s" dur="8s" attributeName="opacity" values="0;0.62;0.62;0" keyTimes="0;0.10;0.90;1"/>
					<animateMotion begin="10s; pbr-{id}.end+18s" dur="8s"><mpath href="#mp-bridge-{id}"/></animateMotion>
				</circle>
			{/if}
		</g>
	</svg>
{/if}
