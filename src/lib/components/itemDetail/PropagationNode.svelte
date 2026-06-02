<script lang="ts">
	import { getContext, setContext } from 'svelte';
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
		isLast = false,
		onParticleArrival = undefined,
		whiteAnchorId = undefined,
		inheritedLabeledState = undefined,
		incomingTrunkActivity = undefined,
		outgoingTrunkActivity = undefined,
	}: {
		user: PropagationUser;
		selectedUserId: string | null;
		onSelect: (user: PropagationUser) => void;
		onPreview: (target: PreviewTarget | null) => void;
		depth?: number;
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
		/** Deterministic safety net for peak-origin subtrees: the origin
		 *  hash-picks ONE descendant id from its visible subtree. That
		 *  descendant's first particle slot is forced white. Other slots
		 *  in the subtree roll whites at the normal 18% rate, so most
		 *  branches show several whites; this guarantees the rare case
		 *  of all slots rolling non-white still yields at least one
		 *  visible ignition somewhere in the subtree. */
		whiteAnchorId?: string | undefined;
		/** The branch state most recently *labeled* up this lineage —
		 *  i.e. either the origin's state, or the state of the most
		 *  recent transition-labeled ancestor. Used to decide whether
		 *  THIS node should render its own transition label: if this
		 *  node's local subtree classifies differently from what was
		 *  last labeled above, it's a transition point and gets a
		 *  label. */
		inheritedLabeledState?: BranchActivityState | undefined;
		/** State of the vertical trunk segment ABOVE this child's elbow
		 *  (i.e. the segment that this child's "top stub" renders).
		 *  Per the trunk-accumulation rule, this is the MAX state of
		 *  (this child + every visible sibling BELOW it), since all
		 *  those branches' traffic flows up through this trunk
		 *  segment toward the parent. Undefined for origins (no
		 *  incoming trunk) and falls back to this child's own state. */
		incomingTrunkActivity?: BranchActivityState | undefined;
		/** State of the vertical trunk segment BELOW this child's
		 *  elbow (i.e. the segment that this child's "bottom
		 *  extension" renders, leading down to the next sibling).
		 *  Per the rule, this is the MAX state of all siblings BELOW
		 *  this child — NOT just the immediate next sibling, since a
		 *  hotter branch further down still flows through this
		 *  section on its way up. Undefined for the last child
		 *  (no bottom extension is rendered). */
		outgoingTrunkActivity?: BranchActivityState | undefined;
	} = $props();

	/* ── Tree-scoped conduit-path config ────────────────────────
	   The offset-path's length must reach every conduit's
	   destination (parent's clip plane) in the tree. Instead of
	   hardcoding a length that "happens to work" for the trees we
	   know about, the root PropagationNode (depth 0) measures the
	   deepest descendant's offsetTop after mount, computes the
	   required path length, and exposes it via context so every
	   descendant's scheduler uses the same value.

	   `pathTotalPx` is the path's total length in pixels (bezier
	   70 px + straight segment). `cycleScale` is the ratio between
	   the measured path and the BASELINE_PATH_PX floor — applied
	   to per-particle `flowDur` and base delays so velocity stays
	   constant per state when the path extends beyond the floor.
	   Trees that fit within the floor get cycleScale = 1 (no
	   change to current visual character). */
	type TreeConfig = { pathTotalPx: number; cycleScale: number };
	const BASELINE_PATH_PX = 800;
	const PATH_TO_RAIL_TOP = 84;
	const CLIP_MARGIN_PX = 10;
	const PATH_BUFFER_PX = 30;

	/* `depth` is stable per instance — set once when the parent
	   template instantiates this <Self> and never re-bound. Svelte 5
	   flags reading it at script top-level as a reactivity hygiene
	   warning even when the value can't actually change; the
	   svelte-ignore below suppresses it for this specific read. */
	let treeConfig: TreeConfig;
	// svelte-ignore state_referenced_locally
	if (depth === 0) {
		const config = $state({ pathTotalPx: BASELINE_PATH_PX, cycleScale: 1 });
		setContext('propagation:tree-config', config);
		treeConfig = config;
	} else {
		treeConfig = getContext<TreeConfig>('propagation:tree-config');
	}

	/* Branch activity is computed PER NODE from this node's own
	   subtree — not inherited from the origin. Earlier the origin's
	   state was propagated to every descendant via a
	   `branchRootActivity` prop so the whole subtree of a peak
	   origin would paint with peak parameters; but that meant the
	   conduit/particles/illumination of an internal node that had
	   cooled to ALIVE still rendered as PEAK, contradicting the
	   transition labels and the actual local subtree classification.
	   Now every layer (rail color, atmosphere, particle shares,
	   helix amplitude, illumination keyframe, heat bump) reads the
	   same `effectiveActivity` that the transition-label system
	   uses, so labels and visuals always agree. */
	const effectiveActivity = $derived<BranchActivityState | undefined>(
		computeBranchActivity(user),
	);

	/* ─── Branch-state transition labels ─────────────────────────
	   `effectiveActivity` (above) IS this node's local subtree state
	   now; we re-export it as `localActivity` to keep the label
	   template's intent explicit. The label fires only when the
	   local state differs from the most recently labeled ancestor's
	   state (`inheritedLabeledState` from props). Otherwise the
	   inherited value passes through unchanged, so a long quiet
	   trunk shows the label only once at its top, not on every node.
	   Return transitions (PEAK → ALIVE → PEAK) work naturally
	   because the second PEAK still differs from the intervening
	   ALIVE. */
	const localActivity = $derived<BranchActivityState>(effectiveActivity!);
	const labeledStateAbove = $derived<BranchActivityState | undefined>(
		depth === 0 ? localActivity : inheritedLabeledState,
	);
	const showTransitionLabel = $derived(
		depth > 0 &&
		!user.isPreviewNode &&
		labeledStateAbove !== undefined &&
		localActivity !== labeledStateAbove,
	);
	const labeledStateForChildren = $derived<BranchActivityState | undefined>(
		showTransitionLabel ? localActivity : labeledStateAbove,
	);

	/* White-hot ignition safety anchor.

	   When THIS node is a peak-accelerating ORIGIN (depth 0), pick one
	   descendant id from its visible subtree using a stable hash of the
	   origin's id. That descendant's first particle slot is forced to
	   white in conduitParticles below. The other slots in the subtree
	   roll whites normally (18% per slot), so most peak branches show
	   several whites — the anchor is just a SAFETY NET guaranteeing
	   that even the unluckiest random distribution still contains at
	   least one visible ignition somewhere in the subtree.

	   Descendants receive the anchor id via the `whiteAnchorId` prop
	   and pass it further down recursively. Only the matched descendant
	   acts on it. Different peak origins place the anchor in different
	   locations (the hash is salted with the origin's id), so the
	   guaranteed ignition isn't always on the same conduit. */
	const computedWhiteAnchorId = $derived.by((): string | undefined => {
		if (depth !== 0) return whiteAnchorId;
		if (effectiveActivity !== 'peak-accelerating') return undefined;
		const ids: string[] = [];
		const walk = (node: PropagationUser) => {
			for (const c of node.children) {
				ids.push(c.id);
				walk(c);
			}
		};
		walk(user);
		if (ids.length === 0) return undefined;
		return ids[hash32(user.id + '|white-anchor') % ids.length];
	});

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

	/* Pre-compute each child's branch activity once, then accumulate
	   the trunk-state max bottom-up across the combined visible
	   siblings (sortedChildren + tailStubs when expanded). This gives
	   each child two derived values to pass into its <Self>:

	     incomingTrunkActivity = hottestAtAndBelow[i]
	         = max(child[i], child[i+1], ..., child[last])
	         drives THIS child's top stub.

	     outgoingTrunkActivity = hottestAtAndBelow[i+1] or undefined
	         = max(child[i+1], ..., child[last])
	         drives THIS child's bottom extension.

	   Per the conduit-state spec: a trunk segment paints with the
	   hottest branch that has JOINED the trunk at or below that
	   segment. Walking bottom-up yields exactly that accumulation —
	   the lowest section carries only the lowest sibling, each
	   higher section adds any hotter sibling joining at its
	   junction. */
	const sortedChildrenActivities = $derived(
		sortedChildren.map(computeBranchActivity),
	);
	const tailStubsActivities = $derived(
		tailStubs.map(computeBranchActivity),
	);
	const combinedChildrenActivities = $derived([
		...sortedChildrenActivities,
		...tailStubsActivities,
	]);
	const STATE_RANK: Record<BranchActivityState, number> = {
		'dead': 0,
		'alive': 1,
		'accelerating': 2,
		'strong-accelerating': 3,
		'peak-accelerating': 4,
	};
	function maxState(
		a: BranchActivityState | undefined,
		b: BranchActivityState | undefined,
	): BranchActivityState | undefined {
		if (a === undefined) return b;
		if (b === undefined) return a;
		return STATE_RANK[a] >= STATE_RANK[b] ? a : b;
	}
	/* hottestAtAndBelow[i] = max(activities[i], activities[i+1], …, last).
	   Computed bottom-up so each entry inherits the running max from
	   below. */
	const hottestAtAndBelow = $derived.by((): (BranchActivityState | undefined)[] => {
		const out: (BranchActivityState | undefined)[] =
			new Array(combinedChildrenActivities.length);
		let acc: BranchActivityState | undefined = undefined;
		for (let i = combinedChildrenActivities.length - 1; i >= 0; i--) {
			acc = maxState(combinedChildrenActivities[i], acc);
			out[i] = acc;
		}
		return out;
	});

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
	   Conduit stroke colour per state. Designed for the visual-
	   identity refinement where branch state must be readable from
	   the conduit alone (labels are being removed). Two principles:

	     1. COLOUR communicates CATEGORY:
	          dead         → dark blue-grey (barely there)
	          alive        → vivid electric blue (calm but active)
	          accel/strong/peak → UNIFIED amber family

	   The conduit communicates CATEGORY only: blue family vs amber
	   family. Intensity within the amber family (accel → strong →
	   peak) is carried by particle traffic, not by paint.

	   Accel/Strong/Peak share the exact same oklch hue and chroma
	   (55°, 0.11). Lightness is identical for accel and strong
	   (0.62); peak nudges to 0.63 — a hair's-difference bump that
	   keeps it firmly inside the family. Alpha steps 15 → 16 → 17
	   are deliberately tiny (≤7% each) so the warm tiers read as
	   "the same kind of conduit" from any distance.

	   Alive stays in its own family with the muted moonlight blue
	   (chroma 0.05, hue 230) — clearly NOT amber, but equally
	   ghostly so it doesn't dominate either.

	   The eye should find: 1) nodes, 2) moving particles,
	   3) branch structure, 4) conduit hue (last). */
	function railColorClassFor(state: BranchActivityState | undefined): string {
		return state === 'peak-accelerating'
			? 'text-[oklch(0.63_0.11_55)]/17'
			: state === 'strong-accelerating'
				? 'text-[oklch(0.62_0.11_55)]/16'
				: state === 'accelerating'
					? 'text-[oklch(0.62_0.11_55)]/15'
					: state === 'alive'
						? 'text-[oklch(0.62_0.05_230)]/14'
						/* Dead — pushed toward "trace of an old path".
						   Chroma halved (0.04→0.02) so hue barely
						   registers as blue; hue nudged 245→250 so
						   what little colour remains reads as steel/
						   slate rather than ocean. Alpha cut 7%→5%
						   (~30% reduction) to make Dead clearly more
						   absent than Alive without disappearing. */
						: 'text-[oklch(0.55_0.02_250)]/5';
	}
	const railColorClass = $derived(railColorClassFor(effectiveActivity));
	/* Trunk-section colour rules (per the conduit-state spec):
	     elbow              → child's own state          (railColorClass)
	     top stub  (above)  → MAX(this child + every sibling below)
	     bottom ext (below) → MAX(every sibling below this child)
	   `incomingTrunkActivity` / `outgoingTrunkActivity` carry those
	   maxes from the parent's combined-siblings computation; we fall
	   back to the child's own state when the parent didn't pass them
	   (origin context, single child, etc.). */
	const topRailColorClass = $derived(
		incomingTrunkActivity !== undefined
			? railColorClassFor(incomingTrunkActivity)
			: railColorClass,
	);
	const bottomRailColorClass = $derived(
		outgoingTrunkActivity !== undefined
			? railColorClassFor(outgoingTrunkActivity)
			: railColorClass,
	);

	/*
	   Atmosphere class per state.

	   `conduit-breath` modulates conduit opacity slowly (14s cycle,
	   per-branch phase). Aura adds a faint static drop-shadow halo
	   that tracks the warm-tier ladder at compressed intensity:

	     accelerating → conduit-aura        (20%/10% alpha)
	     strong       → conduit-aura-strong (25%/13% alpha)
	     peak         → conduit-aura-peak   (30%/15% alpha)

	   These are deliberately close together — strong and peak should
	   look like family members of accelerating, not like a different
	   class of element. The intensity hierarchy across the warm tiers
	   lives in particle traffic, not in conduit glow.

	   Aura variants are NOT additive (they all set `filter:`); pick
	   exactly one per state.
	*/
	function atmosphereClassesFor(state: BranchActivityState | undefined): string {
		return state === 'peak-accelerating'
			? 'conduit-breath conduit-aura-peak'
			: state === 'strong-accelerating'
				? 'conduit-breath conduit-aura-strong'
				: state === 'accelerating'
					? 'conduit-breath conduit-aura'
					: state === 'alive'
						? 'conduit-breath conduit-aura-alive'
						: '';
	}
	const atmosphereClasses = $derived(atmosphereClassesFor(effectiveActivity));
	const topAtmosphereClasses = $derived(
		incomingTrunkActivity !== undefined
			? atmosphereClassesFor(incomingTrunkActivity)
			: atmosphereClasses,
	);
	const bottomAtmosphereClasses = $derived(
		outgoingTrunkActivity !== undefined
			? atmosphereClassesFor(outgoingTrunkActivity)
			: atmosphereClasses,
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
	type ParticleColorTag = 'cyan' | 'amber' | 'white';
	type ConduitParticle = {
		id: number;
		/* CSS color string (oklch) applied inline to the particle wrapper.
		   The .conduit-head element reads currentColor for its fill and
		   box-shadow halos, so each particle in the same branch can carry
		   its own colour — cyan for cultural circulation, amber for
		   acceleration energy, near-white for rare peak ignitions. */
		color: string;
		colorTag: ParticleColorTag;
		flowDelay: number;
		flowDur: number;
		helixAmp: number;
		helixDelay: number;
		helixDur: number;
		maxOpacity: number;
		trailScale: number;
		particleSize: number;
		headGlow: number;
		/* Per-particle shape/halo variability — adds the organic feel
		   without breaking the cohesion of the system. */
		headRadius: string;   /* irregular border-radius e.g. "52% 48% 50% 50%" */
		haloSpread: number;   /* halo radius multiplier 0.6–1.3 (tight vs diffuse) */
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
		if (
			effectiveActivity === undefined ||
			effectiveActivity === 'dead'
		) return [];

		const seed = hash32(user.id);
		const r = (i: number) => rand01(seed, i);

		/* Generate an irregular border-radius string — 4 percentage
		   values that keep the shape ROUNDISH but slightly asymmetric
		   so the silhouette looks organic, not stamped from a circle. */
		const makeRadius = (salt: number) => {
			const c1 = (40 + r(salt + 0) * 20).toFixed(0);
			const c2 = (40 + r(salt + 1) * 20).toFixed(0);
			const c3 = (40 + r(salt + 2) * 20).toFixed(0);
			const c4 = (40 + r(salt + 3) * 20).toFixed(0);
			return `${c1}% ${c2}% ${c3}% ${c4}%`;
		};

		/* ─── Per-state config ─────────────────────────────────── */
		/* Density (particle count), cycle range, colour distribution,
		   and per-state cadence patterns. The cadence patterns are the
		   only thing branched at runtime — everything else falls out of
		   a single shared loop below. Cyan/amber/white shares must sum
		   to 1 and are used as cumulative thresholds against a uniform
		   roll per particle. */
		let count: number;
		let cycleMin: number;
		let cycleMax: number;
		let cyanShare: number;
		let amberShare: number;
		let whiteShare: number;
		let baseDelays: number[];
		const cadencePattern = Math.floor(r(2) * 4);

		if (effectiveActivity === 'alive') {
			/* Patient drift, the tree's resting metabolic state. 2
			   particle slots; cycle 5.0-7.0s so the apparent rate stays
			   sparse no matter which cadence we pick.

			   Per-branch cadence personality (chosen by hash) gives
			   alive branches different rhythmic fingerprints rather
			   than all sharing the half-cycle desync rhythm:
			     0 deep-desync       — A early, B near half-cycle later
			                            (the previous behaviour)
			     1 paired-then-gap   — A & B fire close, then a long
			                            quiet gap until next cycle
			     2 lonely-very-late  — A early, B near end of cycle —
			                            "occasional second transmission"
			     3 deeply-offset     — A mid-early, B mid-late, neither
			                            at the boundaries
			   The branch keeps its personality forever (hash is
			   stable), so different alive branches feel rhythmically
			   distinct without being individually loud. */
			count = 2;
			cycleMin = 5.0;
			cycleMax = 7.0;
			cyanShare = 1.0; amberShare = 0.0; whiteShare = 0.0;
			baseDelays =
				cadencePattern === 0 ? [r(7) * 0.4,        2.8 + r(8) * 1.2] :  /* deep-desync */
				cadencePattern === 1 ? [r(7) * 0.3,        0.5 + r(8) * 0.5] :  /* paired-then-gap */
				cadencePattern === 2 ? [r(7) * 0.2,        4.0 + r(8) * 1.5] :  /* lonely-very-late */
				                       [0.6 + r(7) * 0.5,  3.5 + r(8) * 1.0];   /* deeply-offset */
		} else if (effectiveActivity === 'accelerating') {
			/* Cadence patterns — each accelerating branch picks one of
			   several stagger shapes via hash so the group reads as
			   emergent rather than evenly metronomic.
			     0 = clustered front (two close, one lonely-late)
			     1 = clustered back  (one early, two close-late)
			     2 = lonely middle   (early, big gap, late — sparse)
			     3 = even drift      (loose stagger, no clustering)

			   Dynamic slot count — 80% of accelerating branches keep the
			   3-slot baseline; 20% bump to 4 slots so the cohort varies
			   subtly across the tree without changing the overall feel.
			   Amber share also nudges from 15% to 20% so amber feels a
			   touch more present without dominating cyan. */
			const fourSlotBranch = r(95) < 0.20;
			count = fourSlotBranch ? 4 : 3;
			cycleMin = 1.55;
			cycleMax = 1.92;
			/* Accelerating particles are AMBER-DOMINANT — the colour
			   shift from cool (alive) to warm (accel/strong/peak)
			   happens HERE. Cyan was previously 80% (matching alive's
			   look) which made accel particles read the same as alive
			   particles to the eye. */
			cyanShare = 0.30; amberShare = 0.70; whiteShare = 0.0;
			baseDelays = fourSlotBranch
				? (cadencePattern === 0 ? [0.00, 0.18, 0.85, 1.25] :
				   cadencePattern === 1 ? [0.00, 0.55, 0.95, 1.18] :
				   cadencePattern === 2 ? [0.00, 0.45, 0.95, 1.55] :
				                          [0.00, 0.40, 0.80, 1.30])
				: (cadencePattern === 0 ? [0.00, 0.18, 1.25] :
				   cadencePattern === 1 ? [0.00, 0.95, 1.18] :
				   cadencePattern === 2 ? [0.00, 0.70, 1.55] :
				                          [0.00, 0.55, 1.10]);
		} else if (effectiveActivity === 'strong-accelerating') {
			/* 13 particles — strong should sit CLOSER TO PEAK than to
			   accelerating, while remaining distinguishable from peak
			   by density and the absence of white-hot ignition events.
			   Bumped from 10 so the conduit reads as continuous
			   pressure with only the smallest gaps. With amber
			   effective cycles ~2.0-3.6 s and 13 starts per 1.17-1.50 s
			   cycle, the conduit holds ~24-28 simultaneously-visible
			   particles — directly inside the target band.

			   100% amber — no whites (whites stay exclusive to peak).
			   Cycle unchanged (1.17-1.50 s) so strong is not faster
			   than peak; density carries the strong-vs-peak gap.

			   Cadence: SUSTAINED PRESSURE with a faint burst character.
			   Average slot spacing ~0.08 s; no gap exceeds ~0.12 s.
			   Each pattern keeps its personality but the bursts are
			   embedded inside the sustained flow rather than punctuating
			   quiet stretches.
			     0 sustained forward wave + late group
			     1 even spread + tight late group
			     2 triplet burst + sustained flow
			     3 near-even breathing */
			count = 13;
			cycleMin = 1.17;
			cycleMax = 1.50;
			cyanShare = 0.0; amberShare = 1.0; whiteShare = 0.0;
			baseDelays =
				cadencePattern === 0 ? [0.00, 0.05, 0.11, 0.18, 0.25, 0.34, 0.43, 0.52, 0.60, 0.68, 0.76, 0.84, 0.92] :  /* sustained forward wave */
				cadencePattern === 1 ? [0.00, 0.08, 0.16, 0.24, 0.32, 0.40, 0.48, 0.56, 0.66, 0.74, 0.82, 0.90, 0.96] :  /* even spread + tight late */
				cadencePattern === 2 ? [0.00, 0.05, 0.11, 0.22, 0.30, 0.38, 0.46, 0.54, 0.62, 0.70, 0.78, 0.86, 0.94] :  /* triplet + sustained flow */
				                       [0.00, 0.07, 0.15, 0.23, 0.31, 0.39, 0.47, 0.54, 0.62, 0.70, 0.78, 0.86, 0.93];   /* near-even breathing */
		} else {
			/* 17 particles per peak branch — NEAR-SATURATION. Peak
			   should be instantly recognisable in peripheral vision
			   as the hottest state. With amber effective cycles ~2.1-
			   3.3s and 17 starts per 1.15-1.40s cycle, the conduit
			   holds ~31-36 simultaneously-visible particles — traffic
			   everywhere, no quiet stretches.

			   Cycle 1.15-1.40s overlaps Strong's (1.17-1.50) — Peak
			   is NOT faster than Strong. Density carries the entire
			   strong-vs-peak distinction.

			   White share restored to 11% (within the 10-12% range).
			   Whites are rare relative to amber (~1/8) but a peak
			   branch should reliably show one occasionally — see the
			   forceWhiteSlot guarantee below the particle loop, which
			   ensures every peak branch fires at least one white per
			   cycle even if the random roll misses (~14% of branches
			   at 11% × 17 slots would naturally roll zero).

			   Cadence: SATURATED FLOW. Each pattern's original burst
			   personality is preserved as the front-shape; additional
			   slots fill the cycle to eliminate gaps entirely.
			     0 tight-pair front + sustained tail
			     1 twin-launch + cascading flow
			     2 triplet front + sustained tail
			     3 near-even peak breathing */
			count = 17;
			cycleMin = 1.15;
			cycleMax = 1.40;
			cyanShare = 0.0; amberShare = 0.89; whiteShare = 0.11;
			baseDelays =
				cadencePattern === 0 ? [0.00, 0.05, 0.10, 0.17, 0.24, 0.32, 0.40, 0.48, 0.55, 0.62, 0.69, 0.75, 0.80, 0.85, 0.90, 0.94, 0.98] :
				cadencePattern === 1 ? [0.00, 0.03, 0.10, 0.15, 0.22, 0.28, 0.36, 0.42, 0.50, 0.56, 0.64, 0.70, 0.78, 0.84, 0.90, 0.94, 0.98] :
				cadencePattern === 2 ? [0.00, 0.04, 0.09, 0.16, 0.24, 0.30, 0.37, 0.44, 0.51, 0.58, 0.65, 0.72, 0.79, 0.85, 0.90, 0.94, 0.98] :
				                       [0.00, 0.06, 0.12, 0.18, 0.24, 0.30, 0.36, 0.42, 0.48, 0.54, 0.60, 0.66, 0.72, 0.78, 0.84, 0.90, 0.96];
		}

		/* Per-peak guarantee: ~14% of peak branches would naturally
		   roll zero whites at 11% × 17 slots. Pre-roll the per-slot
		   white outcomes deterministically; if NONE land white, pick
		   one deterministic slot to force. This way every peak
		   branch reliably shows at least one ignition per cycle,
		   without uniformly forcing slot 0 (which would create a
		   visible "every peak starts with a white" rhythm). */
		let forceWhiteSlot = -1;
		if (effectiveActivity === 'peak-accelerating' && count > 0) {
			let anyNaturalWhite = false;
			for (let i = 0; i < count; i++) {
				if (r(i * 7 + 100) < whiteShare) { anyNaturalWhite = true; break; }
			}
			if (!anyNaturalWhite) {
				forceWhiteSlot = Math.floor(r(7777) * count);
			}
		}

		/* ─── Build particles ──────────────────────────────────── */
		const particles = Array.from({ length: count }, (_, i): ConduitParticle => {
			/* Per-particle colour roll. Whites are checked first
			   (smallest share), then amber, then cyan as the default.
			   Two forcing paths short-circuit the roll:
			     1. anchor — slot 0 of the hash-picked peak descendant
			     2. guarantee — forceWhiteSlot if this branch would
			        otherwise roll zero whites (see pre-pass above). */
			let colorTag: ParticleColorTag;
			if (
				computedWhiteAnchorId === user.id &&
				i === 0 &&
				effectiveActivity === 'peak-accelerating'
			) {
				colorTag = 'white';
			} else if (i === forceWhiteSlot) {
				colorTag = 'white';
			} else {
				const roll = r(i * 7 + 100);
				if (roll < whiteShare) colorTag = 'white';
				else if (roll < whiteShare + amberShare) colorTag = 'amber';
				else colorTag = 'cyan';
			}

			const color =
				/* White hue 80° and chroma 0.015 — reads near-white first,
				   warm second. The earlier 0.04 chroma at hue 70° tipped
				   the centre toward amber rather than holding white. */
				colorTag === 'white' ? 'oklch(0.985 0.015 80 / 1.00)' :
				colorTag === 'amber' ? 'oklch(0.78 0.16 60 / 0.95)' :
				                      'oklch(0.68 0.20 265 / 0.85)';

			/* Size, glow and halo spread per colour.
			   Whites read as compressed bright sparks (tight halo, larger
			     and slower in peak — see speedMultiplier below).
			   Ambers are fuller headlights (mid halo).
			   Cyans use a 3-TIER WEIGHTED distribution so the full size
			   range — from tiny to large "carrier" — is always present
			   across the cohort. Carriers are the largest tier but appear
			   only in the rare 15% slot; the other 85% of cyans split
			   between tiny (55%) and medium (30%). This replaces the
			   earlier binary carrier-or-normal split, which made too
			   many alive particles read as the same medium size. */
			let particleSize: number, headGlow: number, haloSpread: number;
			if (colorTag === 'white') {
				/* Slightly larger and brighter than before: 4.0–6.0 px
				   diameter and 10–18 px head glow lifts core luminance
				   without changing the overall density. Halo spread
				   stays relatively tight (0.75–1.10) so the warmth
				   doesn't outshine the white centre. */
				particleSize = 4.0 + r(i * 37 + 1) * 2.0;  /* 4.0–6.0px */
				headGlow     = 10.0 + r(i * 41 + 1) * 8.0; /* 10–18px */
				haloSpread   = 0.75 + r(i * 49 + 1) * 0.35;/* 0.75–1.10 */
			} else if (colorTag === 'amber') {
				particleSize = 2.4 + r(i * 37 + 1) * 3.8;  /* 2.4–6.2px */
				headGlow     = 4.0 + r(i * 41 + 1) * 9.0;  /* 4–13px */
				haloSpread   = 0.80 + r(i * 49 + 1) * 0.50;/* 0.80–1.30 */
			} else {
				/* cyan — 3-tier weighted size distribution.
				   Rebalanced to reduce the previous overproduction of
				   tiny pinprick particles: tiny share trimmed from 55%
				   to 40%, medium widened from 30% to 40%, large carrier
				   bumped from 15% to 20%. Tier RANGES also widened so
				   each tier sits at a more confident, luminous size. */
				const sizeTier = r(i * 53 + 1);
				if (sizeTier < 0.40) {
					/* tiny (40%) — small sparks, still present in every cohort */
					particleSize = 1.8 + r(i * 37 + 1) * 1.6;  /* 1.8–3.4px */
					headGlow     = 2.5 + r(i * 41 + 1) * 3.0;  /* 2.5–5.5px */
					haloSpread   = 0.75 + r(i * 49 + 1) * 0.30;
				} else if (sizeTier < 0.80) {
					/* medium (40%) */
					particleSize = 3.8 + r(i * 37 + 1) * 2.0;  /* 3.8–5.8px */
					headGlow     = 3.5 + r(i * 41 + 1) * 4.5;  /* 3.5–8.0px */
					haloSpread   = 0.85 + r(i * 49 + 1) * 0.40;
				} else {
					/* large carrier (20%) — luminous "signal packets" */
					particleSize = 6.0 + r(i * 37 + 1) * 2.5;  /* 6.0–8.5px */
					headGlow     = 5.5 + r(i * 41 + 1) * 4.5;  /* 5.5–10.0px */
					haloSpread   = 0.95 + r(i * 49 + 1) * 0.40;
				}
			}

			/* Colour-driven cycle multiplier. The cyan/amber speed split is
			   the system's emotional spine:

			     CYAN = cultural substrate. Drifts at ALIVE SPEED regardless
			     of branch state. Multipliers below put cyan cycles into
			     the ~4.5-6.3s range even in fast warm-tier branches, so
			     cyan reads as slow background drift no matter how energised
			     the branch is.

			     AMBER = momentum. Speed varies by state:
			       - accelerating → uniform 1.25× slower than the base
			         cycle, so amber feels like measured pulses rather
			         than hyperactive bursts.
			       - strong → per-particle 1.24×–2.13× variability:
			         effective amber cycle 1.45–3.20s. Slower than before
			         so the branch reads as pressure/density rather than
			         frantic motion.
			       - peak → 1.20×–1.25× (effective 1.20–1.75s): slightly
			         slower than the raw base so peak doesn't feel
			         machine-gun fast.

			     WHITE = overloaded plasma in peak only. 1.70× slower
			     (effective 1.70–2.40s) extends visible time so the rare
			     ignition reads as dense, dangerous and unstable rather
			     than fast spark.
			*/
			let speedMultiplier: number;
			if (colorTag === 'white') {
				/* Peak white-hot: 2.80 + small jitter over 1.0-1.4s base
				   yields effective 2.80-4.20s. Much slower than before so
				   the rare ignition feels dense, unstable, and overcharged
				   rather than a darting spark. */
				speedMultiplier = 2.80 + r(i * 79 + 1) * 0.20;
			} else if (colorTag === 'cyan') {
				speedMultiplier =
					effectiveActivity === 'peak-accelerating'   ? 4.5 :
					effectiveActivity === 'strong-accelerating' ? 3.7 :
					effectiveActivity === 'accelerating'        ? 3.2 :
					1.0; /* alive cyan uses its native 5.0-7.0s cycle */
			} else {
				/* amber */
				if (effectiveActivity === 'strong-accelerating') {
					/* Per-particle variability 1.71×–2.40× over base
					   1.17–1.50s → effective 2.00–3.60s. Slower than
					   before so strong feels powerful and accumulating
					   rather than frantic; the variability still gives
					   per-particle bursts of slightly faster amber. */
					speedMultiplier = 1.71 + r(i * 71 + 1) * 0.69;
				} else if (effectiveActivity === 'accelerating') {
					speedMultiplier = 1.25;
				} else if (effectiveActivity === 'peak-accelerating') {
					/* 1.85-2.35 over base 1.0-1.4s → effective 1.85-3.29s.
					   Velocity ~305-540 px/s. Slower than the previous
					   1.65-2.10 pass — peak now reads as sustained
					   pressure rather than rapid-fire amber, even as the
					   subtree inherits across many conduits. */
					speedMultiplier = 1.85 + r(i * 71 + 1) * 0.50;
				} else {
					speedMultiplier = 1.0;
				}
			}

			/* Orbit amplitude expresses branch-state personality without
			   any new visual layer: tighter on alive (calm hugging the
			   conduit), progressively wider as energy climbs, widest on
			   peak. Per-particle random magnitude within each band gives
			   the swarm slight variation; signed sign-bit randomises
			   orbit handedness particle-by-particle. White-hots in peak
			   get a slightly higher ceiling than the surrounding amber
			   so they read as the most overloaded. */
			const ampSign = r(i * 7 + 3) > 0.5 ? 1 : -1;
			const ampRand = r(i * 17 + 1);
			const ampMagnitude =
				colorTag === 'white'                          ? 3.2 + ampRand * 0.6  /* ±3.2–3.8 px */ :
				effectiveActivity === 'peak-accelerating'     ? 3.0 + ampRand * 0.6  /* ±3.0–3.6 px */ :
				effectiveActivity === 'strong-accelerating'   ? 2.6 + ampRand * 0.4  /* ±2.6–3.0 px */ :
				effectiveActivity === 'accelerating'          ? 2.0 + ampRand * 0.4  /* ±2.0–2.4 px */ :
				effectiveActivity === 'alive'                 ? 1.4 + ampRand * 0.4  /* ±1.4–1.8 px */ :
				                                                 0;                  /* dead — no orbit */
			const helixAmp = ampSign * ampMagnitude;
			const helixDur = effectiveActivity === 'alive'
				? 0.55 + r(i * 23 + 1) * 0.30              /* 0.55–0.85s */
				: 0.36 + r(i * 23 + 1) * 0.22;             /* 0.36–0.58s */

			/* Per-particle delay jitter — scales DOWN as branch energy
			   climbs so strong/peak burst patterns stay tight. Without
			   this, the fixed 0.12s jitter previously smeared
			   strong/peak triplet-bursts into even spacing. */
			const jitterScale =
				effectiveActivity === 'peak-accelerating'   ? 0.04 :
				effectiveActivity === 'strong-accelerating' ? 0.06 :
				effectiveActivity === 'accelerating'        ? 0.12 :
				effectiveActivity === 'alive'               ? 0.15 :
				                                              0;
			/* Cycle scale matches the runtime-measured path length to
			   the BASELINE_PATH_PX (800). When the tree is deeper
			   than baseline, both path AND cycle scale up together
			   so velocity = path / (cycle × VF) stays constant. The
			   cadence PATTERN (the relative position of each delay
			   within its cycle) is preserved — only absolute time
			   stretches. For trees within the baseline, cycleScale
			   is 1 so nothing changes. */
			const cycleScale = treeConfig.cycleScale;
			const flowDur = (cycleMin + r(i * 13 + 1) * (cycleMax - cycleMin)) * speedMultiplier * cycleScale;

			/* Steady-state initialisation: pick a deterministic phase
			   in [0, flowDur) per particle and apply it as a NEGATIVE
			   offset to flowDelay. CSS treats negative animation-delay
			   as "the animation has already been running for N seconds",
			   so on first paint each particle is somewhere mid-journey
			   rather than at the starting line.

			   Without this, every branch's first iteration starts
			   together at t=0 → a synchronised burst across the page
			   that settles after one full flowDur (~2-3 s) as the
			   per-particle baseDelays + jitter spread the iterations
			   apart. The offset spans the FULL flowDur (not just one
			   cycle) so the spread also covers the multi-iteration
			   overlap that exists in steady state.

			   The hash seed (i * 91 + 13) is independent of the seeds
			   that drive baseDelays, jitter, helixDelay, etc., so the
			   phase doesn't collapse onto any of those rhythms. Same
			   user + same slot → same phase, so refresh is stable.

			   Cadence relationships (baseDelays) survive: each particle's
			   loop period is still flowDur, so the inter-iteration
			   relative timing between particles is unchanged after the
			   first iteration. Only the WHERE-EACH-PARTICLE-IS-AT-MOUNT
			   is randomised. */
			const phaseOffset = r(i * 91 + 13) * flowDur;
			const flowDelay = (baseDelays[i] + r(i * 11 + 1) * jitterScale) * cycleScale - phaseOffset;

			/* Helix phase: extend the existing per-particle randomisation
			   to span the FULL helix cycle (was hard-capped at 0.35 s
			   regardless of helixDur 0.36-0.85 s, which left some
			   particles entering at the same orbit phase as their
			   siblings at mount). Negative for "already in progress". */
			const helixDelay = -r(i * 19 + 1) * helixDur;

			return {
				id: i,
				color,
				colorTag,
				flowDelay,
				flowDur,
				helixAmp,
				helixDelay,
				helixDur,
				maxOpacity: 0.78 + r(i * 29 + 1) * 0.22,
				trailScale: 0.85 + r(i * 31 + 1) * 0.35,
				particleSize,
				headGlow,
				headRadius: makeRadius(i * 45 + 1),
				haloSpread,
			};
		});

		/* ─── Peak tandem launch ────────────────────────────────
		   ~35% of peak branches that have BOTH a white slot and an
		   amber slot get their amber companion's launch realigned
		   to fire 0.06-0.18 s after the white. The two particles
		   keep their own velocities, colours and rendering — only
		   the amber's INITIAL animation-delay is shifted so the
		   first visible white launch reads as "ignition emerging
		   from amber turbulence". Subsequent cycles drift naturally
		   because the two particles run on different cycle lengths
		   (white ~3 s, amber ~1.5 s); the tandem reappears every
		   time the cycles coincidentally re-align. */
		if (effectiveActivity === 'peak-accelerating' && r(99) < 0.35) {
			const whiteIdx = particles.findIndex((p) => p.colorTag === 'white');
			if (whiteIdx >= 0) {
				const amberIdx = particles.findIndex(
					(p, idx) => p.colorTag === 'amber' && idx !== whiteIdx,
				);
				if (amberIdx >= 0) {
					const tandemOffset = 0.06 + r(101) * 0.12; /* 0.06–0.18 s */
					particles[amberIdx].flowDelay =
						particles[whiteIdx].flowDelay + tandemOffset;
				}
			}
		}

		return particles;
	});

	/* Per-branch desynchronisation for the atmospheric trunk breath.
	   Negative animation-delay starts each conduit at a different phase
	   of the 14s breath cycle so neighbouring branches never pulse in
	   unison — the effect reads as ambient drift rather than a UI loop.
	   Used by any of the three accelerating tiers (accelerating /
	   strong / peak); alive and dead conduits stay visually static. */
	const isWarmTier = $derived(
		effectiveActivity === 'accelerating' ||
		effectiveActivity === 'strong-accelerating' ||
		effectiveActivity === 'peak-accelerating',
	);
	const breathDelay = $derived(
		isWarmTier ? -(rand01(hash32(user.id), 5) * 14) : 0,
	);

	/* Node-arrival resonance.

	   When a child's conduit particle reaches the spatial-clip boundary
	   (i.e. visually arrives at THIS node's avatar), the child calls
	   `onChildParticleArrival`, which pushes a new flash entry onto a
	   queue. Each entry renders its OWN .resonance-flash <span> via the
	   {#each} block in the avatar template, so multiple closely-spaced
	   arrivals each play their own 400-ms one-shot animation and
	   overlap visually.

	   This replaces the earlier debounced single-flash model — that
	   approach dropped most arrivals when a peak parent received ~7-8
	   per second from its subtree, which made the halo look like it
	   was blinking unrelated to particles. With the queue, every
	   arrival becomes a flash; the user's expectation of "one particle
	   = one blink" holds at every density. */
	type FlashEntry = { id: number };
	let resonanceFlashes: FlashEntry[] = $state([]);
	let nextFlashId = 0;
	const FLASH_TTL_MS = 600;
	const MAX_CONCURRENT_FLASHES = 4;
	function onChildParticleArrival() {
		const id = nextFlashId++;
		/* Cap concurrent flashes per node — keeps the DOM cheap even
		   if a peak parent receives a burst of simultaneous arrivals.
		   Older entries get evicted so the newest arrivals are always
		   represented. */
		let next = [...resonanceFlashes, { id }];
		if (next.length > MAX_CONCURRENT_FLASHES) {
			next = next.slice(-MAX_CONCURRENT_FLASHES);
		}
		resonanceFlashes = next;
		setTimeout(() => {
			resonanceFlashes = resonanceFlashes.filter((f) => f.id !== id);
		}, FLASH_TTL_MS);
	}

	/* Particle element refs — populated by bind:this on the conduit
	   particle divs. The arrival-scheduling effect below reads these
	   to attach animation listeners and schedule per-cycle timers. */
	let particleEls: HTMLDivElement[] = $state([]);

	/* Ref to THIS node's outer <div class="relative">. Used by the
	   arrival-timing math below to read offsetTop within the parent's
	   children container — that's how deep this sibling sits in its
	   parent's vertical stack, which determines the offset-distance
	   along the path at which the particle gets clipped (its visual
	   arrival at the parent). */
	let wrapperEl: HTMLDivElement | null = $state(null);

	/* ── Root-only: measure the deepest descendant and size the
	     offset-path to fit it. ResizeObserver re-measures when the
	     tree expands/collapses so the path adapts to layout changes
	     instead of relying on a static guess. */
	$effect(() => {
		if (depth !== 0 || !wrapperEl) return;
		const rootEl = wrapperEl;

		function measure() {
			const particles = rootEl.querySelectorAll('.conduit-particle');
			let maxOffsetTop = 0;
			for (const p of particles) {
				const w = (p as HTMLElement).parentElement as HTMLElement | null;
				if (w) maxOffsetTop = Math.max(maxOffsetTop, w.offsetTop);
			}
			const neededPathPx = PATH_TO_RAIL_TOP + maxOffsetTop + CLIP_MARGIN_PX + PATH_BUFFER_PX;
			const pathTotalPx = Math.max(BASELINE_PATH_PX, neededPathPx);
			const endY = 14 - (pathTotalPx - 70);
			const cycleScale = pathTotalPx / BASELINE_PATH_PX;
			// Only update context if values actually changed — avoids
			// re-triggering descendants' effects for no-op measurements.
			if (
				treeConfig.pathTotalPx !== pathTotalPx ||
				treeConfig.cycleScale !== cycleScale
			) {
				treeConfig.pathTotalPx = pathTotalPx;
				treeConfig.cycleScale = cycleScale;
			}
			rootEl.style.setProperty(
				'--conduit-path',
				`path('M 35 22 C 12.5 22 -19.5 22 -19.5 14 L -19.5 ${endY}')`,
			);
		}

		const observer = new ResizeObserver(measure);
		observer.observe(rootEl);
		return () => observer.disconnect();
	});

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
		if (
			effectiveActivity === undefined ||
			effectiveActivity === 'dead'
		) return;
		if (!onParticleArrival) return;

		const timers: ReturnType<typeof setTimeout>[] = [];
		const cleanups: Array<() => void> = [];

		/* ── Arrival-timing geometry ─────────────────────────────
		   The particle clips (visually arrives at the parent) at a
		   path offset that depends on how far this sibling sits below
		   its parent's row. We compute the clip-offset fraction here
		   so resonance fires when the particle ACTUALLY arrives, not
		   at a fixed-ratio approximation.

		   The offset-path is:
		     M 35 22 C 12.5 22 -19.5 22 -19.5 14   (Bezier, ~70 px arc)
		     L -19.5 -500                            (rail, 514 px)
		   Total ≈ 584 px.

		   In this child's wrapper coords, the clip plane is at
		     child_y = -(wrapper.offsetTop + clipMargin)
		   where wrapper.offsetTop is this child's vertical position
		   within its parent's children container (= 0 for the first
		   sibling, ~one row-height for the second, etc.) and
		   clipMargin = 10 px (set on the children container).

		   The distance along the path from start (35, 22) to that
		   clip point lies entirely on the straight portion:
		     offsetPx = bezier_len + (14 - clip_y)
		              = 70 + 14 + offsetTop + 10
		              = 94 + offsetTop
		   ...so the clip-offset fraction is (94 + offsetTop) / 584.

		   Then we map that offset fraction to a CYCLE fraction using
		   each animation's offset→cycle progression (path length
		   measured at runtime; baseline 800 px, with cycleScale
		   adjusting per-tree if the measured tree needs more):
		     conduit-flow-slow (alive):       cycle 0-66% ⇒ offset 0-100% linear
		     conduit-flow-fast (warm-tier):   cycle 0-80% ⇒ offset 0-100% linear
		     conduit-flow-fast-white (peak):  cycle 0-12%  ⇒ offset 0-(70/path×100)%
		                                       cycle 12-98% ⇒ offset (70/path×100)-100%
		   The elbow boundary is `70 / pathTotalPx × 100` % of path
		   (the bezier is fixed at 70 px regardless of path length).
		   Reading from the reactive `treeConfig` makes this effect
		   re-run if the root re-measures (e.g. tree expanded). */
		const PATH_TOTAL_PX           = treeConfig.pathTotalPx;
		const WHITE_ELBOW_OFFSET_PCT  = (70 / PATH_TOTAL_PX) * 100;

		particleEls.forEach((el, i) => {
			const p = conduitParticles[i];
			if (!el || !p) return;
			const isWhite = p.colorTag === 'white';

			function scheduleNext(e: AnimationEvent) {
				/* Filter to the particle's FLOW animation only.
				   animationstart and animationiteration BUBBLE per the
				   CSS Animations spec, so without this guard the inner
				   .conduit-head's `conduit-orbit` (helix wobble at
				   0.36-0.85 s cycle) would also fire scheduleNext —
				   causing the parent halo to resonate on every helix
				   oscillation rather than on actual particle arrivals. */
				const name = e.animationName;
				if (
					name !== 'conduit-flow-slow' &&
					name !== 'conduit-flow-fast' &&
					name !== 'conduit-flow-fast-white'
				) return;

				/* Read offsetTop fresh on every iteration — if a sibling
				   above us got collapsed/expanded, our position in the
				   container will have changed. */
				const offsetTop = wrapperEl?.offsetTop ?? 0;
				const clipOffsetPx = PATH_TO_RAIL_TOP + offsetTop + CLIP_MARGIN_PX;
				const clipOffsetFraction = Math.min(1, clipOffsetPx / PATH_TOTAL_PX);
				const clipOffsetPct = clipOffsetFraction * 100;

				let arrivalCycleFraction: number;
				if (isWhite) {
					/* White elbow: cycle 0-12% covers offset 0-8.75%.
					   White rail:  cycle 12-98% covers offset 8.75-100%. */
					if (clipOffsetPct <= WHITE_ELBOW_OFFSET_PCT) {
						arrivalCycleFraction = (clipOffsetPct / WHITE_ELBOW_OFFSET_PCT) * 0.12;
					} else {
						const railOffsetRange = 100 - WHITE_ELBOW_OFFSET_PCT;
						arrivalCycleFraction =
							0.12 + ((clipOffsetPct - WHITE_ELBOW_OFFSET_PCT) / railOffsetRange) * 0.86;
					}
				} else {
					/* Visible cycle fraction matches the flow keyframe's
					   offset-distance 100% phase: 66% for alive, 80% for
					   warm-tier. */
					const visibleCycleFraction = effectiveActivity === 'alive' ? 0.66 : 0.80;
					arrivalCycleFraction = clipOffsetFraction * visibleCycleFraction;
				}

				const arrivalMs = p.flowDur * 1000 * arrivalCycleFraction;

				/* Parent halo resonance fires at the arrival moment. */
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

	/* Short, terse forms of the branch-state names used by the
	   transition chip. Origins keep the existing
	   "peak accelerating" / "strong accelerating" full form via a
	   separate code path; transitions use the abbreviated form so
	   they read as quieter section markers, not full classifications. */
	function shortStateLabel(state: BranchActivityState): string {
		switch (state) {
			case 'peak-accelerating':   return 'peak';
			case 'strong-accelerating': return 'strong';
			case 'accelerating':        return 'accelerating';
			case 'alive':               return 'alive';
			case 'dead':                return 'dead';
		}
	}

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

<div class="relative" bind:this={wrapperEl}>
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

		     COLOUR: uses `topRailColorClass` / `topAtmosphereClasses`
		     derived from `incomingTrunkActivity` — the MAX state of
		     (this child + every visible sibling below it). All those
		     branches' traffic flows up through this trunk segment
		     toward the parent, so the segment paints with the hottest
		     branch that has joined the trunk at-or-below this child.
		     A first child whose own branch is alive will still paint
		     this segment as STRONG/PEAK if a hotter sibling sits
		     below it. -->
		<svg
			class={[
				'absolute pointer-events-none overflow-visible',
				topRailColorClass,
				conduitGlowClass,
				topAtmosphereClasses,
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
			     (no +2px overlap, no double-stack).

			     COLOUR: uses `bottomRailColorClass` /
			     `bottomAtmosphereClasses` derived from
			     `outgoingTrunkActivity` — the MAX state of all siblings
			     BELOW this child (NOT just the immediate next sibling).
			     A hot branch two siblings down still flows through this
			     section on its way up, so the segment paints with the
			     hottest branch that joins the trunk at or below the
			     next junction. -->
			<svg
				class={[
					'absolute pointer-events-none overflow-visible',
					bottomRailColorClass,
					conduitGlowClass,
					bottomAtmosphereClasses,
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
				atmosphereClasses,
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
					/* Faster cycle class for warm tiers (cycle ≤ 2.3s); alive
					   uses the slower variant. The class only flips animation
					   timing — duration/delay are still driven by --flow-* vars. */
					isWarmTier ? 'conduit-fast' : 'conduit-slow',
					p.colorTag === 'white' && 'conduit-particle-white',
				]}
				style="color: {p.color}; --flow-delay: {p.flowDelay.toFixed(3)}s; --flow-dur: {p.flowDur.toFixed(3)}s; --helix-amp: {p.helixAmp.toFixed(2)}px; --helix-delay: {p.helixDelay.toFixed(3)}s; --helix-dur: {p.helixDur.toFixed(3)}s; --max-opacity: {p.maxOpacity.toFixed(2)}; --trail-scale: {p.trailScale.toFixed(2)}; --particle-size: {p.particleSize.toFixed(2)}px; --head-glow: {p.headGlow.toFixed(2)}px; --head-radius: {p.headRadius}; --halo-spread: {p.haloSpread.toFixed(2)};"
				aria-hidden="true"
			>
				<!-- Conduit bloom: a soft radial glow centered on the
				     wrapper origin (= the path point). Stays anchored on
				     the conduit centerline even when the head orbits off
				     to ±helix-amp, so it reads as the conduit ITSELF
				     briefly blooming where the current is — not as a
				     halo attached to the moving head. Depth-synced via
				     the same animation the trail uses. -->
				<span class="conduit-bloom"></span>
				<!-- Thermal trail: extends BEHIND the head in the wrapper's
				     local -X direction. Because the wrapper has
				     `offset-rotate: auto`, the trail's local "behind"
				     resolves to "behind in path direction" at every point
				     along the rail+elbow — so the wake correctly bends
				     through the elbow with the particle. Pure CSS;
				     position is driven entirely by the particle's
				     existing `offset-path` animation. -->
				<span class="conduit-trail"></span>
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
			{#if DEBUG_BRANCH_LABELS && showTransitionLabel}
				<!-- Incoming-segment annotation — anchored to the LEFT
				     of the avatar where the incoming conduit elbow
				     arrives, so it visually labels the SEGMENT, not the
				     node. Absolute-positioned (no layout impact), tiny
				     italic typography, leading line glyph trailing back
				     along the conduit. pointer-events-none so clicks
				     pass through to the row underneath. -->
				<span
					class={[
						'absolute right-full top-1/2 -translate-y-1/2 mr-1 pointer-events-none',
						'whitespace-nowrap text-[10px] uppercase tracking-widest font-mono italic opacity-70',
						localActivity === 'peak-accelerating'    && 'text-[oklch(0.92_0.10_70)]',
						localActivity === 'strong-accelerating'  && 'text-[oklch(0.80_0.18_55)]',
						localActivity === 'accelerating'         && 'text-warning',
						localActivity === 'alive'                && 'text-primary',
						localActivity === 'dead'                 && 'text-base-content/40',
					]}
					aria-label={`incoming branch segment: ${shortStateLabel(localActivity)}`}
				><span class="opacity-55 not-italic" aria-hidden="true">─</span> {shortStateLabel(localActivity)}</span>
			{/if}
			{#if user.nodeKind === 'successful-amplifier' && !user.isPreviewNode}
				<!-- Outward broadcast ripple for successful amplifiers,
				     composing with the orbit comet and double-ring halo. -->
				<span class="sa-ripple" aria-hidden="true"></span>
			{/if}

			<!-- Arrival resonance — one .resonance-flash span per queued
			     entry, so each child-particle arrival plays its own
			     400-ms bloom independently. Dead branches stay inert.
			     Variants scale with branch state:
			       alive   → quiet cool bloom (cyan, very subtle)
			       accel   → warm amber bloom
			       strong  → brighter warm amber bloom
			       peak    → near-white warm bloom, occasional ignition feel -->
			{#if !user.isPreviewNode && effectiveActivity && effectiveActivity !== 'dead'}
				{#each resonanceFlashes as flash (flash.id)}
					<span
						class={[
							'resonance-flash',
							effectiveActivity === 'peak-accelerating'
								? 'resonance-peak'
								: effectiveActivity === 'strong-accelerating'
									? 'resonance-strong'
									: effectiveActivity === 'accelerating'
										? 'resonance-warm'
										: 'resonance-cool',
						]}
						aria-hidden="true"
					></span>
				{/each}
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
					<!-- ORIGIN chip only — origins have no incoming segment,
					     so they don't get a state annotation. The branch
					     state of an origin can be read from the visual
					     character of its outgoing conduits + the row-state
					     chips that appear on its first internal transitions. -->
					<span class="text-[10px] uppercase tracking-widest text-accent/82 shrink-0">origin</span>
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
		Conduit-entry flashes + inner conductive filaments. Same queue
		as the avatar resonance — one of each per arrival — rendered as
		a vertical strip on the trunk just below this node's row.

		The flash gives the wider, softer presence of energised conduit
		material. The filament — a sibling (not nested) so the flash's
		blur doesn't compound onto it — reads as the sharper conductive
		core, anchored at the top of the strip where the conduit meets
		the node. Together they read as "compressed pressure feeding
		into a relay", not "light projected behind an avatar". -->
	{#if hasVisibleChildren && expanded && effectiveActivity && effectiveActivity !== 'dead'}
		{#each resonanceFlashes as flash (flash.id)}
			<span
				class={[
					'conduit-entry-flash',
					effectiveActivity === 'peak-accelerating'
						? 'conduit-entry-peak'
						: effectiveActivity === 'strong-accelerating'
							? 'conduit-entry-strong'
							: effectiveActivity === 'accelerating'
								? 'conduit-entry-warm'
								: 'conduit-entry-cool',
				]}
				aria-hidden="true"
			></span>
			<span
				class={[
					'conduit-entry-filament',
					effectiveActivity === 'peak-accelerating'
						? 'conduit-entry-filament-peak'
						: effectiveActivity === 'strong-accelerating'
							? 'conduit-entry-filament-strong'
							: effectiveActivity === 'accelerating'
								? 'conduit-entry-filament-warm'
								: 'conduit-entry-filament-cool',
				]}
				aria-hidden="true"
			></span>
		{/each}
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
					isLast={i === sortedChildren.length - 1 && !hasHiddenTail}
					onParticleArrival={onChildParticleArrival}
					whiteAnchorId={computedWhiteAnchorId}
					inheritedLabeledState={labeledStateForChildren}
					incomingTrunkActivity={hottestAtAndBelow[i]}
					outgoingTrunkActivity={
						i < combinedChildrenActivities.length - 1
							? hottestAtAndBelow[i + 1]
							: undefined
					}
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
								atmosphereClasses,
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
								atmosphereClasses,
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
							isLast={i === tailStubs.length - 1}
							onParticleArrival={onChildParticleArrival}
							whiteAnchorId={computedWhiteAnchorId}
							inheritedLabeledState={labeledStateForChildren}
							incomingTrunkActivity={
								hottestAtAndBelow[sortedChildren.length + i]
							}
							outgoingTrunkActivity={
								sortedChildren.length + i < combinedChildrenActivities.length - 1
									? hottestAtAndBelow[sortedChildren.length + i + 1]
									: undefined
							}
						/>
					{/each}
				{/if}
			{/if}
		</div>
	{/if}
</div>
