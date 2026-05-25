<script lang="ts">
	import { ChevronDown, ChevronRight } from 'lucide-svelte';
	import type { PropagationUser, PreviewTarget, BranchActivityState } from '$lib/mock/propagation';
	import { sortNodesByPropagation, computeBranchActivity } from '$lib/mock/propagation';
	import Self from './PropagationNode.svelte';

	/*
		One row of the propagation tree. Renders this user plus, recursively,
		its children.

		Visual language scope (post-cleanup):
		  - Node types: passive / deep / amplifier / successful-amplifier
		    via `nk-*` classes on the avatar wrapper (kind halos + motion).
		  - Origin overlay: row-attached `.origin-glyph` + ORIGIN inline label.
		  - Current-user overlay: `.cu-row` rail + primary avatar border.

		Tree connectors are intentionally NEUTRAL — a single soft border on
		each children container, no per-edge semantics. Edge-types, branch /
		subtree variables, and special-structure styling were all removed in
		the visual-language cleanup pass; node types are the only layer.
	*/

	let {
		user,
		selectedUserId,
		onSelect,
		onPreview,
		depth = 0,
		branchActivity = undefined,
		isLast = false,
		onParticleArrival = undefined,
	}: {
		user: PropagationUser;
		selectedUserId: string | null;
		onSelect: (user: PropagationUser) => void;
		onPreview: (target: PreviewTarget | null) => void;
		depth?: number;
		branchActivity?: BranchActivityState | undefined;
		/** True when this node is the LAST item rendered in its parent's
		 *  children container — including any "+N more" tail. Drives the
		 *  rail segment height: last children draw a short stub that
		 *  terminates at the elbow midline so the rail never extends past
		 *  the bottommost child into empty space. */
		isLast?: boolean;
		/** Fired by THIS node's own conduit particles when each particle
		 *  visually reaches the parent's avatar (i.e. crosses the spatial
		 *  clip boundary). Used by the parent to briefly resonate its
		 *  halo. Wired in the recursive <Self> render below — every
		 *  parent passes its own resonance handler down. */
		onParticleArrival?: () => void;
	} = $props();

	/* Branch activity for the subtree this node lives in. Root nodes
	   compute it from their own subtree; descendants inherit it via
	   the `branchActivity` prop so every node in the same branch
	   uses the same state for colouring edges and debug labels. */
	const effectiveActivity = $derived<BranchActivityState | undefined>(
		depth === 0 ? computeBranchActivity(user) : branchActivity,
	);

	/* Debug switch — shows DEAD / ALIVE / ACCELERATING labels next to
	   each root. Flip to false to hide. */
	const DEBUG_BRANCH_LABELS = true;

	let expanded = $state(true);
	let tailExpanded = $state(false);

	const hasVisibleChildren = $derived(user.children.length > 0);
	const isSelected = $derived(selectedUserId === user.id);

	// Sort children by propagation strength so the strongest sibling reads
	// first. Preview nodes go to the END of the sibling group so Dan's
	// inserted preview stays positionally stable.
	const sortedChildren = $derived(sortNodesByPropagation(user.children));

	const hasHiddenTail = $derived(!!(user.hiddenChildren && user.hiddenChildren > 0));
	const tailStubs = $derived(
		hasHiddenTail ? stubsFor(user.hiddenChildren ?? 0) : [],
	);

	/* Reactive illumination direction.

	   Two separate `text-*` classes — one for the dormant conduit,
	   one for the bright particle — so dimming the conduit doesn't
	   also dim the particle (they previously shared one class via
	   currentColor).

	   railColorClass → drives the SVG rail/elbow strokes. Held at
	   3–4% alpha so the conduit is nearly invisible against the
	   dark card; it exists only as a structural trace.

	   particleColorClass → drives the particle's currentColor for
	   its head fill and box-shadow halos. Held at near-full alpha so
	   the halo is bright; combined with mix-blend-mode: screen, the
	   particle's halo additively illuminates the dim conduit (and
	   surrounding dark background) wherever it passes. */
	/*
	   Temperature distinction per state:
	     dead          → desaturated remnant (cool neutral white)
	     alive         → cool indigo (steady cold transmission)
	     accelerating  → WARM amber/ember (intensified resonance,
	                     synaptic firing, heated filament — NOT a
	                     warning yellow, NOT the whole conduit on fire) */
	const railColorClass = $derived(
		effectiveActivity === 'accelerating'
			? 'text-[oklch(0.72_0.14_60)]/10'
			: effectiveActivity === 'alive'
				? 'text-primary/8'
				: 'text-white/5',
	);

	const particleColorClass = $derived(
		effectiveActivity === 'accelerating'
			? 'text-[oklch(0.78_0.16_60)]/95'
			: effectiveActivity === 'alive'
				? 'text-primary/82'
				: '',
	);

	/* Conduit glow disabled — the conduit is dormant; particles
	   provide the moving illumination via their box-shadow halos +
	   mix-blend-mode. This keeps the conduit reading as a dark fibre
	   rather than a glowing UI rail. */
	const conduitGlowClass = '';

	/*
		Conduit particle schedule. Each non-root child emits signal
		pulses flowing UPWARD along the edge path. The path extends
		well past the wrapper top so pulses continue rendering up the
		long sections of rail that pass through siblings' wrappers,
		eliminating the dead zone between distant child/parent pairs.

		Every parameter is varied per particle AND per branch via a
		deterministic hash of `user.id`, so branches never look cloned:

		  flowDelay   — when in the cycle this particle fires
		  flowDur     — slight cycle-duration variation (drifts phases)
		  helixAmp    — signed perpendicular amplitude (some above, some below)
		  helixDelay  — orbit phase offset
		  helixDur    — orbit cycle length
		  maxOpacity  — peak brightness
		  trailScale  — trail length / softness

		Branch-level intensity stays unified: all alive particles draw
		from "slow/sparse" ranges, all accelerating from "fast/dense".
	*/
	type ConduitParticle = {
		id: number;
		flowDelay: number;
		flowDur: number;
		helixAmp: number;
		helixDelay: number;
		helixDur: number;
		maxOpacity: number;
		trailScale: number;
		particleSize: number;
		headGlow: number;
		/* NEW per-particle shape/halo variability — adds the organic
		   feel without breaking the cohesion of the system. */
		headRadius: string;   /* irregular border-radius e.g. "52% 48% 50% 50%" */
		haloSpread: number;   /* halo radius multiplier 0.8–1.25 (tight vs diffuse) */
	};

	function hash32(s: string): number {
		let h = 2166136261 >>> 0;
		for (let i = 0; i < s.length; i++) {
			h = Math.imul(h ^ s.charCodeAt(i), 16777619);
		}
		return h >>> 0;
	}

	function rand01(seed: number, salt: number): number {
		const x = Math.imul((seed ^ (salt * 2654435761)) >>> 0, 1597334677);
		return ((x >>> 0) % 1_000_000) / 1_000_000;
	}

	const conduitParticles = $derived.by((): ConduitParticle[] => {
		if (effectiveActivity !== 'alive' && effectiveActivity !== 'accelerating') return [];
		const seed = hash32(user.id);
		const r = (i: number) => rand01(seed, i);

		/* Generate an irregular border-radius string — 4 percentage
		   values that keep the shape ROUNDISH but slightly asymmetric
		   so the silhouette looks organic, not stamped from a circle.
		   Each corner percentage drifts from 40–60 (= centered on 50%
		   = perfect circle). */
		const makeRadius = (salt: number) => {
			const c1 = (40 + r(salt + 0) * 20).toFixed(0);
			const c2 = (40 + r(salt + 1) * 20).toFixed(0);
			const c3 = (40 + r(salt + 2) * 20).toFixed(0);
			const c4 = (40 + r(salt + 3) * 20).toFixed(0);
			return `${c1}% ${c2}% ${c3}% ${c4}%`;
		};

		if (effectiveActivity === 'accelerating') {
			/* Cadence patterns — each accelerating branch picks one of
			   several stagger shapes via hash so the 3-particle group
			   reads as emergent rather than evenly metronomic.

			     0 = "clustered front"  → 2 close, 1 lonely-late
			     1 = "clustered back"   → 1 early, 2 close-late
			     2 = "lonely middle"    → early, big gap, late (sparse)
			     3 = "even drift"       → loose stagger, no clustering

			   Tiny per-particle jitter on top keeps even the same
			   pattern from feeling like a fixed sequence. */
			const cadencePattern = Math.floor(r(2) * 4);
			const baseDelays =
				cadencePattern === 0 ? [0.00, 0.18, 1.25] :
				cadencePattern === 1 ? [0.00, 0.95, 1.18] :
				cadencePattern === 2 ? [0.00, 0.70, 1.55] :
				                       [0.00, 0.55, 1.10];
			return [0, 1, 2].map((i) => {
				const ampSign = r(i * 7 + 3) > 0.5 ? 1 : -1;
				return {
					id: i,
					/* Pattern-driven base delay + small jitter (≤120ms)
					   so identical patterns still vary between branches. */
					flowDelay: baseDelays[i] + r(i * 11 + 1) * 0.12,
					flowDur:   1.85 + r(i * 13 + 1) * 0.45,   /* 1.85–2.30s cycle */
					helixAmp:  ampSign * (2.5 + r(i * 17 + 1) * 2.0),  /* ±2.5–4.5px */
					helixDelay: -r(i * 19 + 1) * 0.35,         /* phase shift */
					helixDur:   0.36 + r(i * 23 + 1) * 0.20,   /* 0.36–0.56s */
					maxOpacity: 0.82 + r(i * 29 + 1) * 0.18,   /* 0.82–1.00 (broader) */
					trailScale: 0.85 + r(i * 31 + 1) * 0.35,   /* 0.85–1.20 */
					/* Wider size/glow range — keep large at the same ceiling
					   but allow much smaller minimums so some particles read
					   as faint sparks while others are full headlights. */
					particleSize: 2.4 + r(i * 37 + 1) * 3.8,   /* 2.4–6.2px */
					headGlow:     4.0 + r(i * 41 + 1) * 9.0,   /* 4.0–13.0px */
					headRadius:   makeRadius(i * 45 + 1),
					haloSpread:   0.80 + r(i * 49 + 1) * 0.50, /* 0.80–1.30 (tight vs diffuse) */
				};
			});
		}

		/* alive — single pulse, every parameter still varies per branch
		   so different alive branches look different from each other. */
		const ampSign = r(3) > 0.5 ? 1 : -1;
		return [{
			id: 0,
			flowDelay: r(7) * 1.8,                       /* 0–1.8s phase */
			flowDur:   4.0  + r(11) * 1.0,               /* 4.0–5.0s cycle */
			helixAmp:  ampSign * (1.5 + r(17) * 1.3),    /* ±1.5–2.8px */
			helixDelay: -r(19) * 0.4,
			helixDur:   0.55 + r(23) * 0.30,             /* 0.55–0.85s */
			maxOpacity: 0.70 + r(29) * 0.22,             /* 0.70–0.92 (broader) */
			trailScale: 0.75 + r(31) * 0.35,             /* 0.75–1.10 */
			/* Wider size/glow range — alive branches now span faint
			   sparks (1.7px) up to the previous maximum (4.8px). */
			particleSize: 1.7 + r(37) * 3.1,             /* 1.7–4.8px */
			headGlow:     2.8 + r(41) * 5.7,             /* 2.8–8.5px */
			headRadius:   makeRadius(80),
			haloSpread:   0.82 + r(85) * 0.48,           /* 0.82–1.30 */
		}];
	});

	/* Per-branch desynchronisation for the atmospheric trunk breath.
	   Negative animation-delay starts each conduit at a different phase
	   of the 14s breath cycle so neighbouring branches never pulse in
	   unison — the effect reads as ambient drift rather than a UI loop.
	   Only used when this node is accelerating; alive/dead conduits stay
	   visually static (the user reserved breath for accelerating only). */
	const breathDelay = $derived(
		effectiveActivity === 'accelerating'
			? -(rand01(hash32(user.id), 5) * 14)
			: 0,
	);

	/* Node-arrival resonance.

	   When a child's conduit particle reaches the spatial-clip boundary
	   (i.e. visually arrives at THIS node's avatar), the child calls
	   `onChildParticleArrival`, which increments `resonanceKey`. The
	   {#key} block in the avatar template remounts the .resonance-flash
	   element, restarting its 400ms one-shot CSS animation — a soft
	   warm halo bloom that fades back to baseline.

	   The 350ms debounce keeps closely-spaced arrivals from re-triggering
	   the flash mid-animation; the halo can re-fire as soon as the
	   previous one is mostly complete. Without this the warm node would
	   look like a continuous pulse instead of discrete reception events. */
	let resonanceKey = $state(0);
	let lastResonanceTime = 0;
	function onChildParticleArrival() {
		const now =
			typeof performance !== 'undefined' ? performance.now() : Date.now();
		if (now - lastResonanceTime < 350) return;
		lastResonanceTime = now;
		resonanceKey++;
	}

	/* Particle element refs — populated by bind:this on the conduit
	   particle divs. The arrival-scheduling effect below reads these
	   to attach animation listeners and schedule per-cycle timers. */
	let particleEls: HTMLDivElement[] = $state([]);

	/* Schedule arrival pings for THIS node's particles.

	   The CSS particle animation is an infinite loop; native events
	   fire only at iteration boundaries (`animationstart` at the very
	   first iteration after `animation-delay`, `animationiteration` at
	   every subsequent loop). The visible "arrival" (particle crosses
	   the spatial clip) happens partway INTO each iteration — roughly
	   12–28% of the cycle depending on sibling depth.

	   So on each iteration boundary we schedule a setTimeout at ~18%
	   of the cycle to call onParticleArrival. 18% is a midpoint of
	   the depth-dependent range — close enough that the parent's halo
	   bloom overlaps the visible arrival rather than firing after the
	   particle has already been clipped for most of a second. */
	$effect(() => {
		if (depth === 0) return;
		if (effectiveActivity !== 'alive' && effectiveActivity !== 'accelerating') return;
		if (!onParticleArrival) return;

		const timers: ReturnType<typeof setTimeout>[] = [];
		const cleanups: Array<() => void> = [];

		particleEls.forEach((el, i) => {
			const p = conduitParticles[i];
			if (!el || !p) return;
			const arrivalMs = p.flowDur * 1000 * 0.18;

			function scheduleNext() {
				timers.push(
					setTimeout(() => {
						onParticleArrival?.();
					}, arrivalMs),
				);
			}

			el.addEventListener('animationstart', scheduleNext);
			el.addEventListener('animationiteration', scheduleNext);
			cleanups.push(() => {
				el.removeEventListener('animationstart', scheduleNext);
				el.removeEventListener('animationiteration', scheduleNext);
			});
		});

		return () => {
			timers.forEach((t) => clearTimeout(t));
			cleanups.forEach((c) => c());
		};
	});

	function nodeKindClass(u: PropagationUser): string {
		if (u.isPreviewNode) return '';
		switch (u.nodeKind) {
			case 'successful-amplifier': return 'nk-success';
			case 'amplifier':            return 'nk-amp';
			case 'deep-listener':        return 'nk-deep';
			case 'passive-listener':     return 'nk-passive';
			default:                     return '';
		}
	}

	// Anonymous placeholder rows for the hidden tail when expanded. They are
	// real PropagationUser shapes so the inspector can pick them up; flagged
	// as passive so they read as background presence in the tree.
	function stubsFor(count: number): PropagationUser[] {
		return Array.from({ length: count }, (_, i) => ({
			id: `${user.id}-stub-${i}`,
			name: 'Anonymous listener',
			avatar: '',
			character: 'Quieter onward reach',
			amplifications: 0,
			branchSize: 0,
			discoveredAgo: 'Recently',
			behaviorNote: 'Editorial topology hint — no individual reach data attached at this depth.',
			children: [],
			nodeKind: 'passive-listener' as const,
		}));
	}
</script>

<div class="relative">
	<!--
		Parent → child connector. Two segments drawn INSIDE this node's
		wrapper at x = -20px (the parent children container's pl-5):

		  • Vertical rail: top of the wrapper → either elbow midline
		    (when this is the last child — terminates the rail on a
		    node) or the bottom of the wrapper (when there are siblings
		    below — the next sibling's rail continues immediately under
		    this one to form a continuous line).
		  • Horizontal elbow: rail → just past the caret at the avatar's
		    vertical centre (y = 22px).

		Drawing rails PER CHILD (rather than as a single border-l on the
		parent container) lets the rail terminate cleanly on the last
		child instead of overshooting into empty space.
	-->
	{#if depth > 0}
		<!--
			Vertical rail — drawn as SVG so the stroke can curve subtly
			and read as an organic stalk rather than a perfectly straight
			CSS span. The path's centerline sits at wrapper x = -19.5
			(matching the elbow SVG below) and stretches to fill the
			wrapper height via preserveAspectRatio="none".

			Two path variants:
			  - Non-last (rail extends through full wrapper): a subtle
			    S-curve (±0.5px perpendicular wave) so the stalk feels
			    slightly hand-drawn instead of pixel-straight.
			  - Last (short stub up to elbow start): straight line —
			    a 14px segment is too short to wave meaningfully.
		-->
		<!--
			Rail is drawn in TWO segments to avoid junction thickening
			where strokes used to stack on each other:

			  • Top stub (y=0→14): from wrapper top down to the elbow's
			    start. Drawn for every child.
			  • Bottom extension (y=20→wrapper bottom): only rendered
			    for non-last children, so the rail continues down to
			    meet the next sibling's top stub. Starts at y=20 so it
			    sits BELOW the elbow's curve zone (the elbow has fully
			    drifted off the rail centerline by then). Avoiding the
			    elbow-zone overlap removes the bright "junction bump"
			    that the previous single-rail render produced.

			Both segments use BUTT linecaps (the default). The previous
			"round" caps created a half-circle dome at every endpoint —
			at the elbow's top this pinched the stalk; at the rail's
			bottom this overlapped the elbow start. Butt caps end the
			stroke flat exactly at the endpoint, so adjacent segments
			meet edge-to-edge without compounding alpha.
		-->
		<!-- Top stub: y=0 → 14, fixed size (no aspect-ratio stretching
		     needed at this height). Straight line; the S-curve is only
		     visually meaningful on long rails.

		     Accelerating branches add `conduit-breath` (slow opacity
		     drift — barely perceptible) and `conduit-aura` (faint warm
		     drop-shadow around the painted strokes). Alive/dead conduits
		     stay visually static. -->
		<svg
			class={[
				'absolute pointer-events-none overflow-visible',
				railColorClass,
				conduitGlowClass,
				effectiveActivity === 'accelerating' && 'conduit-breath conduit-aura',
			]}
			style="left: -21.5px; top: 0; width: 4px; height: 14px; --breath-delay: {breathDelay.toFixed(3)}s;"
			viewBox="0 0 4 14"
			aria-hidden="true"
		>
			<path d="M 2 0 L 2 14" stroke="currentColor" stroke-width="3.5" stroke-opacity="0.12" fill="none" vector-effect="non-scaling-stroke" />
			<path d="M 2 0 L 2 14" stroke="currentColor" stroke-width="2"   stroke-opacity="0.32" fill="none" vector-effect="non-scaling-stroke" />
			<path d="M 2 0 L 2 14" stroke="currentColor" stroke-width="1"   fill="none"                                vector-effect="non-scaling-stroke" />
		</svg>

		{#if !isLast}
			<!-- Bottom extension: y=20 → wrapper bottom. Stretches with
			     wrapper height via preserveAspectRatio="none" and keeps
			     the gentle S-curve for organic drift. Meets the next
			     sibling's top stub flat-to-flat at the wrapper boundary
			     (no +2px overlap, no double-stack). -->
			<svg
				class={[
					'absolute pointer-events-none overflow-visible',
					railColorClass,
					conduitGlowClass,
					effectiveActivity === 'accelerating' && 'conduit-breath conduit-aura',
				]}
				style="left: -21.5px; top: 20px; width: 4px; height: calc(100% - 20px); --breath-delay: {breathDelay.toFixed(3)}s;"
				viewBox="0 0 4 100"
				preserveAspectRatio="none"
				aria-hidden="true"
			>
				<path d="M 2 0 C 3.2 33 0.8 67 2 100" stroke="currentColor" stroke-width="3.5" stroke-opacity="0.12" fill="none" vector-effect="non-scaling-stroke" />
				<path d="M 2 0 C 2.6 33 1.4 67 2 100" stroke="currentColor" stroke-width="2"   stroke-opacity="0.32" fill="none" vector-effect="non-scaling-stroke" />
				<path d="M 2 0 C 2.3 33 1.7 67 2 100" stroke="currentColor" stroke-width="1"   fill="none"                                vector-effect="non-scaling-stroke" />
			</svg>
		{/if}
		<!--
			Organic elbow — same 3-layer stroke profile as the rail so
			the glow and thickness match across straight and curved
			sections. Butt linecaps: the start (rail side) meets the
			top stub edge-to-edge; the end (avatar side) is hidden
			behind the avatar circle so flat vs round is invisible.

			Geometry: the elbow extends to wrapper x=35 (viewBox x=55)
			so the conduit reaches nearly to the avatar's left edge
			(avatar starts at wrapper x=36). The empty gap between
			conduit and node has been removed; the conduit now reads
			as structurally connected to each child's node rather than
			terminating in mid-air several pixels away. The collapse
			caret (smaller + items-start) sits visually ABOVE this
			horizontal stretch so the conduit passes beneath it.
		-->
		<svg
			class={[
				'absolute -left-5 top-3.5 pointer-events-none overflow-visible',
				railColorClass,
				conduitGlowClass,
				effectiveActivity === 'accelerating' && 'conduit-breath conduit-aura',
			]}
			width="55"
			height="8"
			viewBox="0 0 55 8"
			style="--breath-delay: {breathDelay.toFixed(3)}s;"
			aria-hidden="true"
		>
			<path d="M 0.5 0 C 0.5 8 32.5 8 55 8" stroke="currentColor" stroke-width="3.5" stroke-opacity="0.12" fill="none" />
			<path d="M 0.5 0 C 0.5 8 32.5 8 55 8" stroke="currentColor" stroke-width="2"   stroke-opacity="0.32" fill="none" />
			<path d="M 0.5 0 C 0.5 8 32.5 8 55 8" stroke="currentColor" stroke-width="1"   fill="none" />
		</svg>

		<!--
			Conduit signal traffic — small pulses flowing UPWARD through
			the edge (child → parent). The wrapper follows the rail+elbow
			path via `offset-path`; an inner streak adds subtle helical
			oscillation perpendicular to the path direction.
		-->
		{#each conduitParticles as p, i (p.id)}
			<div
				bind:this={particleEls[i]}
				class={[
					'conduit-particle',
					particleColorClass,
					effectiveActivity === 'accelerating' ? 'conduit-fast' : 'conduit-slow',
				]}
				style="--flow-delay: {p.flowDelay.toFixed(3)}s; --flow-dur: {p.flowDur.toFixed(3)}s; --helix-amp: {p.helixAmp.toFixed(2)}px; --helix-delay: {p.helixDelay.toFixed(3)}s; --helix-dur: {p.helixDur.toFixed(3)}s; --max-opacity: {p.maxOpacity.toFixed(2)}; --trail-scale: {p.trailScale.toFixed(2)}; --particle-size: {p.particleSize.toFixed(2)}px; --head-glow: {p.headGlow.toFixed(2)}px; --head-radius: {p.headRadius}; --halo-spread: {p.haloSpread.toFixed(2)};"
				aria-hidden="true"
			>
				<span class="conduit-head"></span>
			</div>
		{/each}
	{/if}

	<!--
		Row: caret + avatar + name + character. The row uses `role="button"`
		(not a real <button>) so the inner caret can remain a real button
		without nesting. Keyboard activation (Enter / Space) is wired manually.
		Hover / focus preview the user in the inspector without committing the
		selection. The tree-level mouseleave clears the preview when the
		pointer exits the lineage area entirely.
	-->
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<div
		class={[
			'group/row relative w-full flex items-start gap-4 py-1.5 pl-1 pr-2 rounded-md text-left transition-colors duration-150 overflow-visible',
			user.isPreviewNode
				? 'cursor-default opacity-50'
				: 'cursor-pointer',
			!user.isPreviewNode && (isSelected
				? 'bg-accent/12 ring-1 ring-accent/35'
				: user.isCurrentUser
					? 'bg-primary/14 ring-1 ring-primary/35 hover:bg-primary/18 cu-row'
					: 'hover:bg-white/4'),
		]}
		onclick={() => onSelect(user)}
		onkeydown={(e) => { if (!user.isPreviewNode && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onSelect(user); } }}
		onmouseenter={() => onPreview({ kind: 'user', user })}
		onfocusin={() => onPreview({ kind: 'user', user })}
		role={user.isPreviewNode ? 'presentation' : 'button'}
		tabindex={user.isPreviewNode ? undefined : 0}
		aria-disabled={user.isPreviewNode ? 'true' : undefined}
	>
		<!-- Expand/collapse caret. Sized to keep the same flex slot
		     (w-4 h-4) so the row layout is unchanged, but the visible
		     chevron is smaller (size 9 not 12), top-aligned within the
		     slot, and rendered in a more muted tone. This reads as a
		     subtle overlay control floating above the conduit rather
		     than a feature that interrupts it — the horizontal elbow
		     beneath now passes cleanly without colliding with the
		     chevron's bounding glyph. -->
		{#if hasVisibleChildren}
			<button
				class="shrink-0 mt-1 w-4 h-4 flex items-start justify-center text-base-content/32 hover:text-base-content/75 transition-colors"
				onclick={(e) => { e.stopPropagation(); expanded = !expanded; }}
				aria-label={expanded ? 'Collapse branch' : 'Expand branch'}
			>
				{#if expanded}
					<ChevronDown size={9} />
				{:else}
					<ChevronRight size={9} />
				{/if}
			</button>
		{:else}
			<span class="shrink-0 mt-1 w-4 h-4" aria-hidden="true"></span>
		{/if}

		<!--
			Avatar wrapper composes base node kind silhouette with overlay states.

			  Layer 1 — BASE silhouette (from nodeKind):
			    passive    → small, dim, desaturated, no decoration
			    deep       → quiet listener, no glow, no ring
			    amplifier  → ring + outward ripple
			    success    → double ring + outward ripple + orbit comet

			  Layer 2 — Origin overlay (stackable, static):
			    .origin-glyph (sibling of avatar) + ORIGIN text label

			  Layer 3 — Current-user overlay (stackable, static):
			    primary border on inner avatar + cu-row left rail + bg
		-->
		<div
			class={[
				'shrink-0 mt-0.5 relative overflow-visible node-avatar',
				!user.isPreviewNode && nodeKindClass(user),
			]}
		>
			{#if user.nodeKind === 'successful-amplifier' && !user.isPreviewNode}
				<!-- Outward broadcast ripple for successful amplifiers,
				     composing with the orbit comet and double-ring halo. -->
				<span class="sa-ripple" aria-hidden="true"></span>
			{/if}

			<!-- Arrival resonance: a soft warm bloom that fires once per
			     child-particle arrival via the {#key} remount trick. Only
			     accelerating and alive branches resonate; dead branches
			     stay inert. Alive uses the cool variant (the existing
			     primary tone) with a much subtler bloom. -->
			{#if !user.isPreviewNode && (effectiveActivity === 'accelerating' || effectiveActivity === 'alive')}
				{#key resonanceKey}
					{#if resonanceKey > 0}
						<span
							class={[
								'resonance-flash',
								effectiveActivity === 'accelerating'
									? 'resonance-warm'
									: 'resonance-cool',
							]}
							aria-hidden="true"
						></span>
					{/if}
				{/key}
			{/if}
			<div
				class={[
					'w-7 h-7 rounded-full overflow-hidden border transition-transform duration-200',
					user.isPreviewNode
						? 'border-white/15 border-dashed'
						: isSelected
							? 'border-accent/65'
							: user.isCurrentUser
								? 'border-primary/65'
								: user.nodeKind === 'passive-listener'
									? 'border-white/10'
									: 'border-white/18',
					user.nodeKind === 'passive-listener' && !user.isPreviewNode && !user.isCurrentUser && 'scale-[0.74]',
					user.nodeKind === 'deep-listener'    && !user.isPreviewNode && !user.isCurrentUser && 'scale-[0.84]',
				]}
			>
				{#if user.avatar}
					<img
						src={user.avatar}
						alt=""
						class={[
							'w-full h-full object-cover',
							user.isPreviewNode && 'grayscale opacity-60',
							user.nodeKind === 'passive-listener' && !user.isCurrentUser && 'opacity-65 saturate-50',
							user.nodeKind === 'deep-listener' && !user.isCurrentUser && 'opacity-78 saturate-70',
						]}
					/>
				{:else}
					<!-- Anonymous stub: solid neutral fill, no image -->
					<div class="w-full h-full bg-base-content/12"></div>
				{/if}
			</div>
			{#if user.isOrigin && !user.isPreviewNode}
				<!-- Origin marker — small horizontal accent beam ending in a
				     dot, hugging the avatar's left edge. Non-ring shape so it
				     doesn't compete with transmission rings. -->
				<span class="origin-glyph" aria-hidden="true"></span>
			{/if}
		</div>

		<!-- Name + character. Preview nodes italicize the character. -->
		<div class="min-w-0 flex-1">
			<div class="flex items-baseline gap-2">
				<p class={[
					'text-[13px] font-semibold leading-snug truncate',
					user.isPreviewNode
						? 'text-base-content/45 italic'
						: isSelected
							? 'text-accent/95'
							: user.isCurrentUser
								? 'text-primary'
								: user.nodeKind === 'passive-listener'
									? 'text-base-content/58'
									: 'text-base-content/95',
				]}>
					{user.name}
				</p>
				{#if user.isOrigin && !user.isPreviewNode}
					<span class="text-[10px] uppercase tracking-widest text-accent/82 shrink-0">origin</span>
				{/if}
				{#if DEBUG_BRANCH_LABELS && depth === 0 && !user.isPreviewNode && effectiveActivity}
					<!-- Calibration-only label showing the branch's current
					     activity state. Toggle DEBUG_BRANCH_LABELS in script. -->
					<span
						class={[
							'text-[10px] uppercase tracking-widest font-mono shrink-0',
							effectiveActivity === 'accelerating' && 'text-warning',
							effectiveActivity === 'alive' && 'text-primary',
							effectiveActivity === 'dead' && 'text-base-content/40',
						]}
					>
						{effectiveActivity}
					</span>
				{/if}
			</div>
			<p class={[
				'text-[11px] leading-snug truncate',
				user.isPreviewNode
					? 'text-base-content/40 italic'
					: user.nodeKind === 'passive-listener'
						? 'text-base-content/35'
						: 'text-base-content/60',
			]}>
				{user.character}
			</p>
		</div>

		<!-- Branch-size hint on the right edge. Neutral readout — no
		     branch-mass / hub visual weighting (those systems were
		     removed in the cleanup pass). -->
		{#if user.branchSize > 0}
			<span class="shrink-0 mt-1.5 text-[10px] font-mono tabular-nums text-base-content/45">
				+{user.branchSize}
			</span>
		{/if}
	</div>

	<!--
		Empty-downstream placeholder. When the current user is a real node in
		the tree with no visible children (and no hidden ones), render a quiet
		"signal searching for scouts" continuation so the user reads "my branch
		exists but hasn't propagated yet" instead of a dead end. Decorative —
		not selectable, not announced by screen readers as interactive.
	-->
	{#if user.isCurrentUser && !user.isPreviewNode && user.children.length === 0 && !user.hiddenChildren}
		<!-- Dashed placeholder line uses ml/pl values chosen so the
		     border-l sits at the same parent_x as a real rail (≈42.5,
		     under the parent's avatar) and the inner row content aligns
		     with where real-child rows would start (parent_x=62). -->
		<div
			class="relative pl-[19.5px] ml-[42.5px] border-l border-dashed border-primary/32"
			aria-hidden="true"
		>
			<div class="flex items-center gap-2 py-1.5 pl-1 pr-2">
				<span class="shrink-0 w-4 h-4" aria-hidden="true"></span>
				<span class="shrink-0 w-7 h-7 flex items-center justify-center">
					<span class="signal-ember w-2 h-2 rounded-full bg-primary"></span>
				</span>
				<p class="text-[11px] italic leading-snug text-primary/55">
					Signal searching for scouts
				</p>
			</div>
		</div>
	{/if}

	<!--
		Children — recursive — only when expanded. A single neutral border on
		the children container acts as the tree connector rail. No per-edge
		semantics; this keeps the tree's structural lines while letting node
		types do all the visual communication.
	-->
	{#if hasVisibleChildren && expanded}
		<!--
			Children container — no border-l here. Each child draws its
			own rail segment in its wrapper (see top of this component),
			so the rail terminates cleanly on the last child instead of
			extending past it.

			overflow: clip + a small clip-margin contains the conduit
			particles. Particles travel up a long offset-path (extending
			well past the wrapper top so deep children populate the long
			rail above them), but everything outside the children
			container is clipped — particles stop at the top of this
			container, which is right below the parent's row.

			The clip-margin sets the SPATIAL death boundary: particles
			die because they reach the boundary, NOT because time
			elapsed. The boundary is tuned so death happens right at
			the parent avatar's circumference (where the rail meets
			the bottom of the circle), so particles dissolve at the
			node's edge and never appear INSIDE it.

			Geometry:
			  • row height ≈ 45px (text block of 33 + py-1.5 of 12)
			  • children container's padding-box top sits at parent_y≈45
			  • parent avatar = 28px circle centered at (parent_x=50,
			    parent_y=22); at the rail's x (parent_x≈42.5) the
			    bottom curve of the circle is at parent_y ≈ 33.8.
			  • clip-margin 10px ⇒ death plane at parent_y ≈ 35,
			    ~1px BELOW the avatar's circumference at the rail's x.
			    Particles approach, kiss the node's edge, and vanish.

			Padding-left (pl-12 = 48px) is sized so the rail centerline
			(at child_x=-19.5 in each child wrapper) ends up under the
			PARENT's avatar instead of under its expand caret. The
			parent's avatar spans parent_x=36-64; with `pl-12 ml-3.5`
			the rail lands at parent_x ≈ 42.5 — between the avatar's
			left edge and its center — so particles visually arrive at
			the node rather than at the chevron.
		-->
		<div class="relative pl-12 ml-3.5 overflow-clip [overflow-clip-margin:10px]">
			{#each sortedChildren as child, i (child.id)}
				<Self
					user={child}
					{selectedUserId}
					{onSelect}
					{onPreview}
					depth={depth + 1}
					branchActivity={effectiveActivity}
					isLast={i === sortedChildren.length - 1 && !hasHiddenTail}
					onParticleArrival={onChildParticleArrival}
				/>
			{/each}

			<!-- Hidden tail: "+N more" indicator (collapsed) or anonymized stubs (expanded) -->
			{#if hasHiddenTail}
				{#if !tailExpanded}
					<div class="relative">
						<!-- Rail + elbow for the "+N more" placeholder (always
						     LAST in container). Same butt-capped top-stub
						     pattern as a normal child — no bottom extension,
						     no junction overlap with the previous sibling
						     above. Picks up the same accelerating-only
						     breath / aura treatment so the placeholder
						     reads as part of the same conduit family. -->
						<svg
							class={[
								'absolute pointer-events-none overflow-visible',
								railColorClass,
								conduitGlowClass,
								effectiveActivity === 'accelerating' && 'conduit-breath conduit-aura',
							]}
							style="left: -21.5px; top: 0; width: 4px; height: 14px; --breath-delay: {breathDelay.toFixed(3)}s;"
							viewBox="0 0 4 14"
							aria-hidden="true"
						>
							<path d="M 2 0 L 2 14" stroke="currentColor" stroke-width="3.5" stroke-opacity="0.12" fill="none" vector-effect="non-scaling-stroke" />
							<path d="M 2 0 L 2 14" stroke="currentColor" stroke-width="2"   stroke-opacity="0.32" fill="none" vector-effect="non-scaling-stroke" />
							<path d="M 2 0 L 2 14" stroke="currentColor" stroke-width="1"   fill="none"                                vector-effect="non-scaling-stroke" />
						</svg>
						<svg
							class={[
								'absolute -left-5 top-3.5 pointer-events-none overflow-visible',
								railColorClass,
								conduitGlowClass,
								effectiveActivity === 'accelerating' && 'conduit-breath conduit-aura',
							]}
							width="55"
							height="8"
							viewBox="0 0 55 8"
							style="--breath-delay: {breathDelay.toFixed(3)}s;"
							aria-hidden="true"
						>
							<path d="M 0.5 0 C 0.5 8 32.5 8 55 8" stroke="currentColor" stroke-width="3.5" stroke-opacity="0.12" fill="none" />
							<path d="M 0.5 0 C 0.5 8 32.5 8 55 8" stroke="currentColor" stroke-width="2"   stroke-opacity="0.32" fill="none" />
							<path d="M 0.5 0 C 0.5 8 32.5 8 55 8" stroke="currentColor" stroke-width="1"   fill="none" />
						</svg>
					<button
						class="w-full flex items-center gap-2 py-1.5 pl-1 pr-2 rounded-md text-left text-base-content/52 hover:text-base-content/85 hover:bg-white/3 transition-colors"
						onclick={() => { tailExpanded = true; }}
						onmouseenter={() => onPreview({
							kind: 'cluster',
							parent: user,
							count: user.hiddenChildren ?? 0,
							label: user.hiddenChildrenLabel ?? 'Quieter listeners',
							description: user.hiddenChildrenDescription,
						})}
						onfocus={() => onPreview({
							kind: 'cluster',
							parent: user,
							count: user.hiddenChildren ?? 0,
							label: user.hiddenChildrenLabel ?? 'Quieter listeners',
							description: user.hiddenChildrenDescription,
						})}
					>
						<span class="shrink-0 w-4 h-4"></span>
						<span class="shrink-0 w-7 h-7 rounded-full border border-dashed border-white/14 flex items-center justify-center text-[10px] font-mono text-base-content/45">
							+{user.hiddenChildren}
						</span>
						<div class="min-w-0 flex-1">
							<p class="text-[12px] leading-snug truncate text-base-content/68">
								+{user.hiddenChildren} more
							</p>
							{#if user.hiddenChildrenLabel}
								<p class="text-[11px] leading-snug truncate text-base-content/45 italic">
									{user.hiddenChildrenLabel}
								</p>
							{/if}
						</div>
					</button>
					</div>
				{:else}
					{#each tailStubs as stub, i (stub.id)}
						<Self
							user={stub}
							{selectedUserId}
							{onSelect}
							{onPreview}
							depth={depth + 1}
							branchActivity={effectiveActivity}
							isLast={i === tailStubs.length - 1}
							onParticleArrival={onChildParticleArrival}
						/>
					{/each}
				{/if}
			{/if}
		</div>
	{/if}
</div>
