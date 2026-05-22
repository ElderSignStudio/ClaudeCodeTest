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
			return [0, 1, 2].map((i) => {
				const ampSign = r(i * 7 + 3) > 0.5 ? 1 : -1;
				return {
					id: i,
					/* base stagger at i*0.6s + up to 0.2s jitter so particles
					   don't fire on a metronome. */
					flowDelay: i * 0.60 + r(i * 11 + 1) * 0.2,
					flowDur:   1.85 + r(i * 13 + 1) * 0.45,   /* 1.85–2.30s cycle */
					helixAmp:  ampSign * (2.5 + r(i * 17 + 1) * 2.0),  /* ±2.5–4.5px */
					helixDelay: -r(i * 19 + 1) * 0.35,         /* phase shift */
					helixDur:   0.36 + r(i * 23 + 1) * 0.20,   /* 0.36–0.56s */
					maxOpacity: 0.82 + r(i * 29 + 1) * 0.18,   /* 0.82–1.00 (broader) */
					trailScale: 0.85 + r(i * 31 + 1) * 0.35,   /* 0.85–1.20 */
					particleSize: 4.0 + r(i * 37 + 1) * 2.2,   /* 4.0–6.2px (broader) */
					headGlow:     7.5 + r(i * 41 + 1) * 5.5,   /* 7.5–13.0px (broader) */
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
			particleSize: 3.2 + r(37) * 1.6,             /* 3.2–4.8px (broader) */
			headGlow:     5.0 + r(41) * 3.5,             /* 5.0–8.5px (broader) */
			headRadius:   makeRadius(80),
			haloSpread:   0.82 + r(85) * 0.48,           /* 0.82–1.30 */
		}];
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
			Vertical rail rendered as 3 layered SVG strokes — broad faded
			glow, mid translucent body, thin bright core. The 3-layer
			pattern is shared with the elbow below so the stalk reads as
			ONE continuous stroke at the junction (matching glow profile
			on both pieces).

			Path is a gentle S-Bezier for non-last (long) rails so the
			stalk drifts left/right by ~1–2px over its height — subtly
			hand-drawn rather than ruler-straight. Last/short rails
			(14px) use a straight path because the wave compresses too
			tightly at short heights and would jog where it meets the
			elbow.

			height is bumped 2px past the elbow start so the rail's
			bottom stroke overlaps the elbow's top, eliminating any
			sub-pixel seam at the junction.
		-->
		<svg
			class={[
				'absolute pointer-events-none overflow-visible',
				railColorClass,
				conduitGlowClass,
			]}
			style="left: -21.5px; top: 0; width: 4px; height: {isLast ? '16px' : 'calc(100% + 2px)'};"
			viewBox="0 0 4 100"
			preserveAspectRatio="none"
			aria-hidden="true"
		>
			<!-- L1: broad faded glow stroke (widest, lowest opacity) -->
			<path
				d={isLast ? 'M 2 0 L 2 100' : 'M 2 0 C 3.2 33 0.8 67 2 100'}
				stroke="currentColor"
				stroke-width="3.5"
				stroke-opacity="0.12"
				fill="none"
				stroke-linecap="round"
				vector-effect="non-scaling-stroke"
			/>
			<!-- L2: mid translucent body stroke -->
			<path
				d={isLast ? 'M 2 0 L 2 100' : 'M 2 0 C 2.6 33 1.4 67 2 100'}
				stroke="currentColor"
				stroke-width="2"
				stroke-opacity="0.32"
				fill="none"
				stroke-linecap="round"
				vector-effect="non-scaling-stroke"
			/>
			<!-- L3: thin bright core stroke -->
			<path
				d={isLast ? 'M 2 0 L 2 100' : 'M 2 0 C 2.3 33 1.7 67 2 100'}
				stroke="currentColor"
				stroke-width="1"
				fill="none"
				stroke-linecap="round"
				vector-effect="non-scaling-stroke"
			/>
		</svg>
		<!--
			Organic elbow — same 3-layer stroke as the rail so the glow,
			thickness and color profiles are identical across the stalk's
			straight and curved sections. The cubic Bezier from rail-top
			to row-end is continuous: tangent vertical at start (joins
			the rail seamlessly), tangent horizontal at end (lands flat
			at the row).
		-->
		<svg
			class={[
				'absolute -left-5 top-3.5 pointer-events-none overflow-visible',
				railColorClass,
				conduitGlowClass,
			]}
			width="24"
			height="8"
			viewBox="0 0 24 8"
			aria-hidden="true"
		>
			<!-- L1: broad faded glow -->
			<path
				d="M 0.5 0 C 0.5 8 8 8 24 8"
				stroke="currentColor"
				stroke-width="3.5"
				stroke-opacity="0.12"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
			<!-- L2: mid translucent body -->
			<path
				d="M 0.5 0 C 0.5 8 8 8 24 8"
				stroke="currentColor"
				stroke-width="2"
				stroke-opacity="0.32"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
			<!-- L3: thin bright core -->
			<path
				d="M 0.5 0 C 0.5 8 8 8 24 8"
				stroke="currentColor"
				stroke-width="1"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>

		<!--
			Conduit signal traffic — small pulses flowing UPWARD through
			the edge (child → parent). The wrapper follows the rail+elbow
			path via `offset-path`; an inner streak adds subtle helical
			oscillation perpendicular to the path direction.
		-->
		{#each conduitParticles as p (p.id)}
			<div
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
		<!-- Expand/collapse caret — only when there are visible children -->
		{#if hasVisibleChildren}
			<button
				class="shrink-0 mt-1 w-4 h-4 flex items-center justify-center text-base-content/45 hover:text-base-content/85 transition-colors"
				onclick={(e) => { e.stopPropagation(); expanded = !expanded; }}
				aria-label={expanded ? 'Collapse branch' : 'Expand branch'}
			>
				{#if expanded}
					<ChevronDown size={12} />
				{:else}
					<ChevronRight size={12} />
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
		<div
			class="relative pl-5 ml-3.5 border-l border-dashed border-primary/32"
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
			die because they reach the boundary (~28px above the
			container top, i.e. right at the parent's row), NOT because
			time elapsed. This makes every sibling — immediate or
			deepest — die at the same visual location (the parent's
			row), so distant children no longer fade mid-rail.
		-->
		<div class="relative pl-5 ml-3.5 overflow-clip [overflow-clip-margin:28px]">
			{#each sortedChildren as child, i (child.id)}
				<Self
					user={child}
					{selectedUserId}
					{onSelect}
					{onPreview}
					depth={depth + 1}
					branchActivity={effectiveActivity}
					isLast={i === sortedChildren.length - 1 && !hasHiddenTail}
				/>
			{/each}

			<!-- Hidden tail: "+N more" indicator (collapsed) or anonymized stubs (expanded) -->
			{#if hasHiddenTail}
				{#if !tailExpanded}
					<div class="relative">
						<!-- Rail + elbow for the "+N more" placeholder (always
						     LAST in container). 3-layer stroke matches the
						     main conduit so the stalk reads consistently. -->
						<svg
							class={['absolute pointer-events-none overflow-visible', railColorClass, conduitGlowClass]}
							style="left: -21.5px; top: 0; width: 4px; height: 16px;"
							viewBox="0 0 4 100"
							preserveAspectRatio="none"
							aria-hidden="true"
						>
							<path d="M 2 0 L 2 100" stroke="currentColor" stroke-width="3.5" stroke-opacity="0.12" fill="none" stroke-linecap="round" vector-effect="non-scaling-stroke" />
							<path d="M 2 0 L 2 100" stroke="currentColor" stroke-width="2" stroke-opacity="0.32" fill="none" stroke-linecap="round" vector-effect="non-scaling-stroke" />
							<path d="M 2 0 L 2 100" stroke="currentColor" stroke-width="1" fill="none" stroke-linecap="round" vector-effect="non-scaling-stroke" />
						</svg>
						<svg
							class={['absolute -left-5 top-3.5 pointer-events-none overflow-visible', railColorClass, conduitGlowClass]}
							width="24"
							height="8"
							viewBox="0 0 24 8"
							aria-hidden="true"
						>
							<path d="M 0.5 0 C 0.5 8 8 8 24 8" stroke="currentColor" stroke-width="3.5" stroke-opacity="0.12" fill="none" stroke-linecap="round" stroke-linejoin="round" />
							<path d="M 0.5 0 C 0.5 8 8 8 24 8" stroke="currentColor" stroke-width="2" stroke-opacity="0.32" fill="none" stroke-linecap="round" stroke-linejoin="round" />
							<path d="M 0.5 0 C 0.5 8 8 8 24 8" stroke="currentColor" stroke-width="1" fill="none" stroke-linecap="round" stroke-linejoin="round" />
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
						/>
					{/each}
				{/if}
			{/if}
		</div>
	{/if}
</div>
