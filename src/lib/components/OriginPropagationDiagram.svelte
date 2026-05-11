<script lang="ts">
	import type { OriginItem } from '$lib/mock/data';

	let { item, cinematic = false }: { item: OriginItem; cinematic?: boolean } = $props();

	// Detect reduced-motion preference after hydration.
	let reducedMotion = $state(false);
	$effect(() => {
		reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	});

	const id = $derived(item.id);

	// Cinematic mode: viewBox is taller (180×80 instead of 180×44), and the inner
	// content is wrapped in <g transform="translate(0, 18)"> so the diagram is
	// vertically centered in the taller viewBox. This gives the SVG ~82% more
	// rendered height at the same width, with the existing coordinate logic intact.
	// The translate composes correctly with animateMotion transforms because SVG
	// transform composition multiplies parent and child transforms.
	const viewBox = $derived(cinematic ? '0 0 180 80' : '0 0 180 44');
	const innerTransform = $derived(cinematic ? 'translate(0, 18)' : '');
</script>

<!--
	Symbolic propagation diagram. Same SVG content as the standard StoryCard
	diagram, but exposes a `cinematic` prop that gives the diagram significantly
	more vertical presence by enlarging the viewBox without changing any element
	coordinates. Used by OriginStoryCard for the editorial Origin Stories lane.
-->

{#if item.storyType === 'independent-discovery'}
	<svg {viewBox} width="100%" class="overflow-visible">
		<defs>
			<filter id="f-{id}" x="-150%" y="-150%" width="400%" height="400%">
				<feGaussianBlur stdDeviation="1.2"/>
			</filter>
			{#if !reducedMotion}
				<path id="mp-b-{id}" d="M15,22 L118,22"/>
				<path id="mp-f-{id}" d="M118,22 L155,22"/>
			{/if}
		</defs>

		<g transform={innerTransform}>
			<line x1="15" y1="8"  x2="80" y2="8"  stroke="oklch(0.65 0.18 290)" stroke-opacity="0.14" stroke-width="1"   stroke-dasharray="2 3"/>
			<line x1="15" y1="22" x2="118" y2="22" stroke="oklch(0.65 0.18 290)" stroke-opacity="0.20" stroke-width="1.5" stroke-dasharray="2 3">
				{#if !reducedMotion}
					<animate id="shim-b-{id}" begin="15s; shim-b-{id}.end+22s" dur="2.5s" attributeName="stroke-opacity" values="0.20;0.38;0.20"/>
				{/if}
			</line>
			<line x1="15" y1="36" x2="80" y2="36" stroke="oklch(0.65 0.18 290)" stroke-opacity="0.14" stroke-width="1"   stroke-dasharray="2 3"/>
			<line x1="80" y1="8"  x2="118" y2="22" stroke="oklch(0.65 0.18 290)" stroke-opacity="0.12" stroke-width="1"   stroke-dasharray="1 4"/>
			<line x1="80" y1="36" x2="118" y2="22" stroke="oklch(0.65 0.18 290)" stroke-opacity="0.12" stroke-width="1"   stroke-dasharray="1 4"/>
			<line x1="118" y1="22" x2="155" y2="22" stroke="oklch(0.68 0.20 265)" stroke-opacity="0.28" stroke-width="1.5" stroke-dasharray="2 3">
				{#if !reducedMotion}
					<animate id="shim-f-{id}" begin="7s; shim-f-{id}.end+18s" dur="2s" attributeName="stroke-opacity" values="0.28;0.49;0.28"/>
				{/if}
			</line>

			<circle class="os-pulse-node" style="--os-base:0.22; --os-peak:0.42; animation-duration:13.9s; animation-delay:-3.7s;"  cx="80" cy="8"  r="2.5" fill="oklch(0.65 0.18 290)" opacity="0.22"/>
			<circle class="os-pulse-node" style="--os-base:0.22; --os-peak:0.42; animation-duration:15.1s; animation-delay:-11.0s;" cx="80" cy="36" r="2.5" fill="oklch(0.65 0.18 290)" opacity="0.22"/>

			<circle class="os-pulse-node" style="--os-base:0.36; --os-peak:0.72; animation-duration:12.4s; animation-delay:-1.8s;"  cx="15" cy="8"  r="3" fill="oklch(0.65 0.18 290)" opacity="0.36"/>
			<circle class="os-pulse-node" style="--os-base:0.40; --os-peak:0.76; animation-duration:14.7s; animation-delay:-6.3s;"  cx="15" cy="22" r="3" fill="oklch(0.65 0.18 290)" opacity="0.40"/>
			<circle class="os-pulse-node" style="--os-base:0.36; --os-peak:0.72; animation-duration:11.8s; animation-delay:-9.2s;"  cx="15" cy="36" r="3" fill="oklch(0.65 0.18 290)" opacity="0.36"/>

			<circle class="os-pulse-node" style="--os-base:0.52; --os-peak:0.85; animation-duration:19.3s; animation-delay:-7.6s;" cx="118" cy="22" r="3.5" fill="oklch(0.65 0.18 290)" opacity="0.52"/>
			{#if !reducedMotion}
				<circle cx="118" cy="22" r="3.5" fill="none" stroke="oklch(0.65 0.18 290)" stroke-opacity="0" stroke-width="0.8">
					<animate id="ring-cv-{id}" begin="10s; ring-cv-{id}.end+20s" dur="4.5s" attributeName="r" from="3.5" to="14"/>
					<animate begin="10s; ring-cv-{id}.end+20s" dur="4.5s" attributeName="stroke-opacity" values="0;0.20;0"/>
				</circle>
			{/if}

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
		</g>
	</svg>

{:else if item.storyType === 'convergent-paths'}
	<svg {viewBox} width="100%" class="overflow-visible">
		<defs>
			<filter id="f-{id}" x="-150%" y="-150%" width="400%" height="400%">
				<feGaussianBlur stdDeviation="1.2"/>
			</filter>
			{#if !reducedMotion}
				<path id="mp-1-{id}" d="M15,12 L55,14 L100,10 L132,18 L150,22"/>
				<path id="mp-2-{id}" d="M15,32 L52,30 L98,34 L132,26 L150,22"/>
			{/if}
		</defs>

		<g transform={innerTransform}>
			<line x1="15"  y1="12" x2="55"  y2="14" stroke="oklch(0.65 0.18 290)" stroke-opacity="0.16" stroke-width="1"   stroke-dasharray="2 3"/>
			<line x1="55"  y1="14" x2="100" y2="10" stroke="oklch(0.65 0.18 290)" stroke-opacity="0.16" stroke-width="1"   stroke-dasharray="2 3"/>
			<line x1="100" y1="10" x2="132" y2="18" stroke="oklch(0.65 0.18 290)" stroke-opacity="0.16" stroke-width="1"   stroke-dasharray="2 3">
				{#if !reducedMotion}
					<animate id="shim-1a-{id}" begin="12s; shim-1a-{id}.end+23s" dur="2s" attributeName="stroke-opacity" values="0.16;0.32;0.16"/>
				{/if}
			</line>
			<line x1="132" y1="18" x2="150" y2="22" stroke="oklch(0.68 0.20 265)" stroke-opacity="0.22" stroke-width="1.5" stroke-dasharray="1 4"/>

			<line x1="15"  y1="32" x2="52"  y2="30" stroke="oklch(0.65 0.18 290)" stroke-opacity="0.16" stroke-width="1"   stroke-dasharray="2 3"/>
			<line x1="52"  y1="30" x2="98"  y2="34" stroke="oklch(0.65 0.18 290)" stroke-opacity="0.16" stroke-width="1"   stroke-dasharray="2 3"/>
			<line x1="98"  y1="34" x2="132" y2="26" stroke="oklch(0.65 0.18 290)" stroke-opacity="0.16" stroke-width="1"   stroke-dasharray="2 3">
				{#if !reducedMotion}
					<animate id="shim-2a-{id}" begin="19s; shim-2a-{id}.end+17s" dur="2s" attributeName="stroke-opacity" values="0.16;0.32;0.16"/>
				{/if}
			</line>
			<line x1="132" y1="26" x2="150" y2="22" stroke="oklch(0.68 0.20 265)" stroke-opacity="0.22" stroke-width="1.5" stroke-dasharray="1 4"/>

			<circle class="os-pulse-node" style="--os-base:0.40; --os-peak:0.76; animation-duration:13.2s; animation-delay:-2.1s;"  cx="15"  cy="12" r="3"   fill="oklch(0.65 0.18 290)" opacity="0.40"/>
			<circle class="os-pulse-node" style="--os-base:0.30; --os-peak:0.60; animation-duration:14.8s; animation-delay:-5.4s;"  cx="55"  cy="14" r="2.5" fill="oklch(0.65 0.18 290)" opacity="0.30"/>
			<circle class="os-pulse-node" style="--os-base:0.30; --os-peak:0.60; animation-duration:12.6s; animation-delay:-8.9s;"  cx="100" cy="10" r="2.5" fill="oklch(0.65 0.18 290)" opacity="0.30"/>
			<circle class="os-pulse-node" style="--os-base:0.33; --os-peak:0.64; animation-duration:16.4s; animation-delay:-1.3s;"  cx="132" cy="18" r="2.5" fill="oklch(0.65 0.18 290)" opacity="0.33"/>

			<circle class="os-pulse-node" style="--os-base:0.40; --os-peak:0.76; animation-duration:11.9s; animation-delay:-9.7s;"  cx="15"  cy="32" r="3"   fill="oklch(0.65 0.18 290)" opacity="0.40"/>
			<circle class="os-pulse-node" style="--os-base:0.30; --os-peak:0.60; animation-duration:15.3s; animation-delay:-4.8s;"  cx="52"  cy="30" r="2.5" fill="oklch(0.65 0.18 290)" opacity="0.30"/>
			<circle class="os-pulse-node" style="--os-base:0.30; --os-peak:0.60; animation-duration:13.7s; animation-delay:-12.2s;" cx="98"  cy="34" r="2.5" fill="oklch(0.65 0.18 290)" opacity="0.30"/>
			<circle class="os-pulse-node" style="--os-base:0.33; --os-peak:0.64; animation-duration:17.1s; animation-delay:-6.5s;"  cx="132" cy="26" r="2.5" fill="oklch(0.65 0.18 290)" opacity="0.33"/>

			<circle cx="150" cy="22" r="14" fill="oklch(0.68 0.20 265 / 0.058)"/>
			<circle cx="150" cy="22" r="11" fill="oklch(0.68 0.20 265 / 0.07)"/>
			<circle cx="150" cy="22" r="6"  fill="oklch(0.68 0.20 265 / 0.14)" stroke="oklch(0.68 0.20 265)" stroke-opacity="0.45" stroke-width="1"/>
			<circle class="os-pulse-node" style="--os-base:0.70; --os-peak:0.96; animation-duration:21.5s; animation-delay:-14.3s;" cx="150" cy="22" r="2.5" fill="oklch(0.68 0.20 265)" opacity="0.70"/>
			{#if !reducedMotion}
				<circle cx="150" cy="22" r="6" fill="none" stroke="oklch(0.68 0.20 265)" stroke-opacity="0" stroke-width="1">
					<animate id="ring-cv2-{id}" begin="22s; ring-cv2-{id}.end+21s" dur="5.5s" attributeName="r" from="6" to="22"/>
					<animate begin="22s; ring-cv2-{id}.end+21s" dur="5.5s" attributeName="stroke-opacity" values="0;0.32;0"/>
				</circle>
			{/if}

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
		</g>
	</svg>

{:else if item.storyType === 'origin-hub'}
	<svg {viewBox} width="100%" class="overflow-visible">
		<defs>
			<filter id="f-{id}" x="-150%" y="-150%" width="400%" height="400%">
				<feGaussianBlur stdDeviation="1.2"/>
			</filter>
			{#if !reducedMotion}
				<path id="mp-c-{id}" d="M20,22 L72,22 L140,22"/>
				<path id="mp-u-{id}" d="M20,22 L68,14 L140,13"/>
			{/if}
		</defs>

		<g transform={innerTransform}>
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

			<circle class="os-pulse-node" style="--os-base:0.26; --os-peak:0.56; animation-duration:12.8s; animation-delay:-2.4s;"  cx="138" cy="3"  r="2.5" fill="oklch(0.65 0.18 290)" opacity="0.26"/>
			<circle class="os-pulse-node" style="--os-base:0.28; --os-peak:0.60; animation-duration:11.4s; animation-delay:-6.7s;"  cx="140" cy="13" r="2.5" fill="oklch(0.65 0.18 290)" opacity="0.28"/>
			<circle class="os-pulse-node" style="--os-base:0.30; --os-peak:0.64; animation-duration:13.6s; animation-delay:-9.8s;"  cx="140" cy="22" r="2.5" fill="oklch(0.65 0.18 290)" opacity="0.30"/>
			<circle class="os-pulse-node" style="--os-base:0.28; --os-peak:0.60; animation-duration:10.9s; animation-delay:-4.1s;"  cx="140" cy="31" r="2.5" fill="oklch(0.65 0.18 290)" opacity="0.28"/>
			<circle class="os-pulse-node" style="--os-base:0.26; --os-peak:0.56; animation-duration:14.2s; animation-delay:-11.6s;" cx="138" cy="41" r="2.5" fill="oklch(0.65 0.18 290)" opacity="0.26"/>

			<circle class="os-pulse-node" style="--os-base:0.36; --os-peak:0.68; animation-duration:16.7s; animation-delay:-5.3s;"  cx="65" cy="5"  r="3" fill="oklch(0.65 0.18 290)" opacity="0.36"/>
			<circle class="os-pulse-node" style="--os-base:0.40; --os-peak:0.72; animation-duration:18.1s; animation-delay:-9.1s;"  cx="68" cy="14" r="3" fill="oklch(0.65 0.18 290)" opacity="0.40"/>
			<circle class="os-pulse-node" style="--os-base:0.43; --os-peak:0.74; animation-duration:17.4s; animation-delay:-13.5s;" cx="72" cy="22" r="3" fill="oklch(0.65 0.18 290)" opacity="0.43"/>
			<circle class="os-pulse-node" style="--os-base:0.40; --os-peak:0.72; animation-duration:15.8s; animation-delay:-7.2s;"  cx="68" cy="30" r="3" fill="oklch(0.65 0.18 290)" opacity="0.40"/>
			<circle class="os-pulse-node" style="--os-base:0.36; --os-peak:0.68; animation-duration:19.3s; animation-delay:-2.8s;"  cx="65" cy="39" r="3" fill="oklch(0.65 0.18 290)" opacity="0.36"/>

			<circle cx="20" cy="22" r="16" fill="oklch(0.68 0.20 265 / 0.046)"/>
			<circle cx="20" cy="22" r="13" fill="oklch(0.68 0.20 265 / 0.06)"/>
			<circle cx="20" cy="22" r="8"  fill="oklch(0.68 0.20 265 / 0.12)" stroke="oklch(0.68 0.20 265)" stroke-opacity="0.38" stroke-width="1"/>
			<circle class="os-pulse-node" style="--os-base:0.80; --os-peak:1.00; animation-duration:22.6s; animation-delay:-8.4s;" cx="20" cy="22" r="3.5" fill="oklch(0.68 0.20 265)" opacity="0.80"/>
			{#if !reducedMotion}
				<circle cx="20" cy="22" r="8" fill="none" stroke="oklch(0.68 0.20 265)" stroke-opacity="0" stroke-width="0.8">
					<animate id="ring-or-{id}" begin="6s; ring-or-{id}.end+24s" dur="6s" attributeName="r" from="8" to="24"/>
					<animate begin="6s; ring-or-{id}.end+24s" dur="6s" attributeName="stroke-opacity" values="0;0.22;0"/>
				</circle>
			{/if}

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
		</g>
	</svg>
{/if}
