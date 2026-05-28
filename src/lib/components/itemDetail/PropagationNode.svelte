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
		isLast = false,
		onParticleArrival = undefined,
		branchRootActivity = undefined,
		whiteAnchorId = undefined,
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
		/** The activity classification of the BRANCH ROOT (origin). Each
		 *  origin (depth=0) computes its own; descendants inherit it via
		 *  this prop so the whole subtree of e.g. a peak-accelerating
		 *  origin renders with peak parameters — 5 slots, 18% white roll,
		 *  etc. Without this, only the origin itself would be peak and
		 *  the rest of the subtree would render as lower tiers. */
		branchRootActivity?: BranchActivityState | undefined;
		/** Deterministic safety net for peak-origin subtrees: the origin
		 *  hash-picks ONE descendant id from its visible subtree. That
		 *  descendant's first particle slot is forced white. Other slots
		 *  in the subtree roll whites at the normal 18% rate, so most
		 *  branches show several whites; this guarantees the rare case
		 *  of all slots rolling non-white still yields at least one
		 *  visible ignition somewhere in the subtree. */
		whiteAnchorId?: string | undefined;
	} = $props();

	/* Branch activity is computed ONCE at the origin (depth 0) and
	   inherited by all descendants via `branchRootActivity`. This means
	   the whole subtree of a peak-accelerating origin renders with
	   peak parameters (5 slots, 18% white roll, etc.), so white-hot
	   ignition events can appear distributed anywhere in the subtree
	   rather than only on the origin's own conduit (which doesn't
	   exist — depth 0 doesn't draw a conduit). Different origins still
	   classify independently, so a tree with a peak origin alongside an
	   alive origin alongside a dead origin still reads as five distinct
	   propagation temperatures. */
	const effectiveActivity = $derived<BranchActivityState | undefined>(
		depth === 0 ? computeBranchActivity(user) : branchRootActivity,
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
	   Conduit stroke color per state. The conduit itself stays cool
	   (cyan-indigo) for the calmer half of the spectrum and warms only
	   at the higher tiers — alive/accelerating still read as cool-blue
	   cultural circulation; warmth emerges into the conduit only as
	   the branch heats up.

	     dead         → desaturated white remnant, very dim
	     alive        → cool indigo at ~8% alpha
	     accelerating → cool indigo slightly brighter (~10%) — particles
	                    bring the first hint of amber, not the line
	     strong       → amber tint enters the conduit itself (~13%)
	     peak         → saturated amber tint (~18%)
	*/
	const railColorClass = $derived(
		effectiveActivity === 'peak-accelerating'
			? 'text-[oklch(0.76_0.16_60)]/18'
			: effectiveActivity === 'strong-accelerating'
				? 'text-[oklch(0.73_0.13_55)]/13'
				: effectiveActivity === 'accelerating'
					? 'text-primary/10'
					: effectiveActivity === 'alive'
						? 'text-primary/8'
						: 'text-white/5',
	);

	/*
	   Atmosphere class per state — breath modulates conduit opacity slowly,
	   aura adds a faint warm drop-shadow halo. Both scale with intensity.
	   Aura variants are NOT additive (they set the same filter property);
	   pick one based on state.
	*/
	const atmosphereClasses = $derived(
		effectiveActivity === 'peak-accelerating'
			? 'conduit-breath conduit-aura-peak'
			: effectiveActivity === 'strong-accelerating'
				? 'conduit-breath conduit-aura-strong'
				: effectiveActivity === 'accelerating'
					? 'conduit-breath conduit-aura'
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
			/* Patient drift, the tree's resting metabolic state. Now
			   2 particle slots per branch so alive reads as persistent
			   quiet circulation rather than occasional inactivity. The
			   two particles are STRONGLY DESYNCED: second particle
			   launches ~half a cycle after the first, so at any moment
			   typically only ONE of them is visible. Cycle widened to
			   5.0-7.0s for slightly more breath. */
			count = 2;
			cycleMin = 5.0;
			cycleMax = 7.0;
			cyanShare = 1.0; amberShare = 0.0; whiteShare = 0.0;
			baseDelays = [
				r(7) * 0.5,           /* particle A: 0.0–0.5s */
				2.8 + r(8) * 1.2,     /* particle B: 2.8–4.0s (≈ half-cycle later) */
			];
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
			cyanShare = 0.80; amberShare = 0.20; whiteShare = 0.0;
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
			/* 3 particles (down from 4) — strong now caps at the same
			   slot budget as accelerating so an inherited strong subtree
			   doesn't oversaturate the DOM. Amber still clearly
			   dominates (75%), cyan up slightly (25%) to keep the
			   cultural substrate readable underneath. The cycle base
			   stays the same; the amber speed multiplier below pushes
			   the effective amber cycle to 2.0-3.6s so the branch feels
			   powerful but not frantic. */
			count = 3;
			cycleMin = 1.17;
			cycleMax = 1.50;
			cyanShare = 0.25; amberShare = 0.75; whiteShare = 0.0;
			baseDelays =
				cadencePattern === 0 ? [0.00, 0.18, 1.10] :
				cadencePattern === 1 ? [0.00, 0.80, 1.18] :
				cadencePattern === 2 ? [0.00, 0.55, 1.30] :
				                       [0.00, 0.40, 0.85];
		} else {
			/* peak-accelerating: 3 particles (down from 5) so a whole
			   inherited peak subtree doesn't blanket the page in particle
			   DOM. Whites are rare visible ignition events: 6% per slot
			   ≈ 0.18 expected per branch, plus the anchored guarantee.
			   Cyan bumped from 15% to 22% so the cultural substrate
			   stays visible underneath the amber — peak should not read
			   as "orange mode". */
			count = 3;
			cycleMin = 1.00;
			cycleMax = 1.40;
			cyanShare = 0.22; amberShare = 0.72; whiteShare = 0.06;
			baseDelays =
				cadencePattern === 0 ? [0.00, 0.18, 1.05] :
				cadencePattern === 1 ? [0.00, 0.70, 1.05] :
				cadencePattern === 2 ? [0.00, 0.40, 0.95] :
				                       [0.00, 0.16, 1.05]; /* twin-launch variant — softened from 0.08 to 0.16 so the doubled feel is less machine-gun */
		}

		/* ─── Build particles ──────────────────────────────────── */
		const particles = Array.from({ length: count }, (_, i): ConduitParticle => {
			/* Per-particle colour roll. Whites are checked first
			   (smallest share), then amber, then cyan as the default.
			   Slot 0 is forced white when THIS node is the
			   hash-picked anchor descendant of a peak-accelerating
			   origin — see computedWhiteAnchorId above. Other slots
			   still roll normally; whites can also appear naturally on
			   any peak-subtree branch via the 18% per-slot probability. */
			let colorTag: ParticleColorTag;
			if (computedWhiteAnchorId === user.id && i === 0) {
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

			const ampSign = r(i * 7 + 3) > 0.5 ? 1 : -1;
			const helixAmp = effectiveActivity === 'alive'
				? ampSign * (1.5 + r(i * 17 + 1) * 1.3)   /* ±1.5–2.8px */
				: ampSign * (2.3 + r(i * 17 + 1) * 2.2);   /* ±2.3–4.5px */
			const helixDur = effectiveActivity === 'alive'
				? 0.55 + r(i * 23 + 1) * 0.30              /* 0.55–0.85s */
				: 0.36 + r(i * 23 + 1) * 0.22;             /* 0.36–0.58s */

			return {
				id: i,
				color,
				colorTag,
				flowDelay: baseDelays[i] + r(i * 11 + 1) * 0.12,
				flowDur:   (cycleMin + r(i * 13 + 1) * (cycleMax - cycleMin)) * speedMultiplier,
				helixAmp,
				helixDelay: -r(i * 19 + 1) * 0.35,
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

	/* Microscopic ignition flare — fires once each time a white-hot
	   particle crosses the elbow/intersection in this branch's conduit.
	   The {#key flareKey} block in the template remounts a tiny .elbow-
	   flare span, replaying a sub-150ms one-shot animation. Visible only
	   on conduits that can carry whites (peak branches and the forced-
	   white first child of a peak origin). */
	let flareKey = $state(0);

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
		   each animation's offset→cycle progression:
		     conduit-flow-slow (alive):       cycle 0-48% ⇒ offset 0-100% linear
		     conduit-flow-fast (warm-tier):   cycle 0-58% ⇒ offset 0-100% linear
		     conduit-flow-fast-white (peak):  cycle 0-12% ⇒ offset 0-12%
		                                       cycle 12-78% ⇒ offset 12-100%
		   so the elbow-slowdown is honoured for whites too. */
		const PATH_TOTAL_PX     = 584;
		const PATH_TO_RAIL_TOP  = 84;  /* bezier_len (70) + rail-top y (14) */
		const CLIP_MARGIN_PX    = 10;

		particleEls.forEach((el, i) => {
			const p = conduitParticles[i];
			if (!el || !p) return;
			const isWhite = p.colorTag === 'white';
			/* White particles cross the elbow exit at ~12% of cycle
			   under the white-only keyframe; fire the ignition flare
			   when they're roughly mid-elbow (cycle 10%). */
			const flareMs = isWhite ? p.flowDur * 1000 * 0.10 : 0;

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
					if (clipOffsetPct <= 12) {
						arrivalCycleFraction = clipOffsetPct / 100;
					} else {
						arrivalCycleFraction = (12 + (clipOffsetPct - 12) * 66 / 88) / 100;
					}
				} else {
					const visibleCycleFraction = effectiveActivity === 'alive' ? 0.48 : 0.58;
					arrivalCycleFraction = clipOffsetFraction * visibleCycleFraction;
				}

				const arrivalMs = p.flowDur * 1000 * arrivalCycleFraction;

				/* Parent halo resonance fires at the arrival moment. */
				timers.push(
					setTimeout(() => {
						onParticleArrival?.();
					}, arrivalMs),
				);
				/* White-only: microscopic ignition flare at the elbow. */
				if (isWhite) {
					timers.push(
						setTimeout(() => {
							flareKey++;
						}, flareMs),
					);
				}
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

		     Accelerating branches add `conduit-breath` (slow opacity
		     drift — barely perceptible) and `conduit-aura` (faint warm
		     drop-shadow around the painted strokes). Alive/dead conduits
		     stay visually static. -->
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
					atmosphereClasses,
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
			Microscopic ignition flare — fires when a white-hot particle
			crosses the elbow corner. Positioned at the rail-top junction
			(wrapper coords -19.5, 14), 12px diameter, screen-blended.
			Each increment of flareKey remounts via the {#key} block,
			restarting the ~120ms one-shot animation. No-op when the
			branch has no whites (flareKey stays 0). -->
		{#key flareKey}
			{#if flareKey > 0}
				<span class="elbow-flare" aria-hidden="true"></span>
			{/if}
		{/key}

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
					<span class="text-[10px] uppercase tracking-widest text-accent/82 shrink-0">origin</span>
				{/if}
				{#if DEBUG_BRANCH_LABELS && depth === 0 && !user.isPreviewNode && effectiveActivity}
					<!-- Calibration-only label showing the branch's current
					     activity state. Toggle DEBUG_BRANCH_LABELS in script. -->
					<span
						class={[
							'text-[10px] uppercase tracking-widest font-mono shrink-0',
							effectiveActivity === 'peak-accelerating'    && 'text-[oklch(0.92_0.10_70)]',
							effectiveActivity === 'strong-accelerating'  && 'text-[oklch(0.80_0.18_55)]',
							effectiveActivity === 'accelerating'         && 'text-warning',
							effectiveActivity === 'alive'                && 'text-primary',
							effectiveActivity === 'dead'                 && 'text-base-content/40',
						]}
					>
						{effectiveActivity.replace('-', ' ')}
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
					branchRootActivity={effectiveActivity}
					whiteAnchorId={computedWhiteAnchorId}
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
							branchRootActivity={effectiveActivity}
							whiteAnchorId={computedWhiteAnchorId}
						/>
					{/each}
				{/if}
			{/if}
		</div>
	{/if}
</div>
