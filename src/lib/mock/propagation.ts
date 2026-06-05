/*
	Mock propagation forest for the Item Detail page.

	Topology rule: a user has exactly one origin for a given item — the FIRST
	meaningful discovery defines lineage permanently, and branches NEVER merge.
	Implementation reflects that: roots[] is an array, each root is a recursive
	`PropagationUser` tree, no cross-links.

	Forests are now PROCEDURALLY GENERATED per item id. A small set of
	archetype builders (hub-dominant, fragmented, late-bloomer, deep-chain,
	bursty, sparse) drive overall shape; a seeded RNG and editorial pools
	(names, characters, behavior notes, scenes) drive the details. The same
	item id always produces the same forest. Different item ids feel
	visibly distinct — different depths, different densities, different
	rhythms.

	This file does NOT introduce edge/branch/special-structure visual
	semantics. Only `nodeKind` drives rendering. The richer forests exist
	so the next visual-language layer can be designed against realistic
	tree structures.
*/

/** Editorial novelty tier — how famous the signal felt at a given moment. */
export type FameTier = 'Underground' | 'Niche' | 'Emerging' | 'Hot';

/*
	Tree Node Type taxonomy.

	`nodeKind` captures *how this scout received and treated the signal*.
	The visual language renders these four kinds plus two stackable
	overlays (origin, current-user).
*/

/** What kind of listening / amplifying behavior this scout demonstrates. */
export type PropagationNodeKind =
	| 'passive-listener'      // signal arrived but didn't strongly propagate
	| 'deep-listener'         // signal resonated deeply; quiet but engaged
	| 'amplifier'             // intentionally transmitted onward
	| 'successful-amplifier'; // their transmission carried the signal far

/** Editorial role used by the hover card's "Role in signal" section.
 *  Derived from PropagationNodeKind plus deterministic per-node jitter:
 *  passive-listener splits into "Passive Listener" vs "Listener" based on
 *  whether the user returned to the signal; the other three map 1:1 to
 *  their node-kind equivalent. Decoupled from PropagationNodeKind so the
 *  underlying visual / classification model stays unchanged. */
export type SignalRole =
	| 'Passive Listener'      // discovered once, didn't return or engage
	| 'Listener'              // returned to the signal more than once
	| 'Deep Listener'         // sustained engagement, no forward share
	| 'Amplifier'             // passed the signal forward
	| 'Successful Amplifier'; // forward share produced downstream propagation

/* Branch-level activity — a five-tier spectrum from dormant to runaway
   ignition. Each node computes its own tier from ITS OWN subtree (not
   inherited from the root), so a single tree can contain multiple
   states simultaneously: a quiet alive parent with an accelerating
   sub-branch, a strong-accelerating subtree cooling into alive side
   branches, etc.

     dead                → archaeological silence, no propagation
     alive               → calm circulation, amps but no successful chains
     accelerating        → momentum emerging, 1 successful amplifier
     strong-accelerating → cultural pull intensifying, 2-3 successes
     peak-accelerating   → runaway ignition, 4+ successes downstream
*/
export type BranchActivityState =
	| 'dead'
	| 'alive'
	| 'accelerating'
	| 'strong-accelerating'
	| 'peak-accelerating';

/** Return a node's branch state.
 *
 *  Branch state is conceptually driven by an acceleration model
 *  (recent activity vs. baseline, growth ratio, momentum) — see
 *  `branchState` on PropagationUser. When a node sets that field
 *  explicitly the value is returned directly, which lets a tree
 *  contain non-monotonic patterns: a deep descendant can legitimately
 *  classify hotter than its ancestor, branches can re-ignite after
 *  cooling, etc.
 *
 *  When no `branchState` is set, we fall back to a cumulative-subtree
 *  heuristic (count successful-amplifier descendants and total amps).
 *  That fallback preserves the original behaviour for archetypes that
 *  never opted into the explicit model. The walk skips into subtrees
 *  whose root has its own `branchState` — those are independently
 *  classified, so they shouldn't contribute to an ancestor's count. */
export function computeBranchActivity(root: PropagationUser): BranchActivityState {
	if (root.branchState !== undefined) return root.branchState;
	let totalAmps = 0;
	let successCount = 0;
	const walk = (n: PropagationUser) => {
		totalAmps += n.amplifications;
		if (n.nodeKind === 'successful-amplifier') successCount++;
		for (const c of n.children) {
			if (c.branchState !== undefined) continue; // explicit subtree — independent
			walk(c);
		}
	};
	walk(root);
	if (successCount >= 4) return 'peak-accelerating';
	if (successCount >= 2) return 'strong-accelerating';
	if (successCount > 0) return 'accelerating';
	if (totalAmps > 0) return 'alive';
	return 'dead';
}

export type PropagationUser = {
	id: string;
	name: string;
	avatar: string;
	/** Editorial character descriptor — e.g. "Underground connector". */
	character: string;
	/** Times this user amplified the signal forward. */
	amplifications: number;
	/** Total reach in this user's subtree (their downstream count). */
	branchSize: number;
	/** When they discovered the signal, human phrasing. */
	discoveredAgo: string;
	/** One-line behavior summary used by the inspector. */
	behaviorNote?: string;
	/** Scenes / orbits / listening circles this user belongs to.
	 *  Used as small chips in the inspector to give cultural context. */
	scenes?: string[];
	/** Visible children. */
	children: PropagationUser[];
	/** Collapsed-tail count: "+N more" indicator after the visible children. */
	hiddenChildren?: number;
	/** Editorial label for the collapsed tail, e.g. "Drone-leaning listeners". */
	hiddenChildrenLabel?: string;
	/** Cluster description shown in the inspector when the "+N more" tail
	 *  is hovered or selected. Anthropological / observational tone. */
	hiddenChildrenDescription?: string;

	/** True if this user is an independent origin — i.e. they brought the
	 *  signal into Outer Signal from outside, not from another scout. */
	isOrigin?: boolean;
	/** Novelty tier of the signal at the moment this user discovered it. */
	noveltyTierAtDiscovery?: FameTier;
	/** FameIndex (0-100) of the signal at the moment this user discovered it. */
	fameIndexAtDiscovery?: number;
	/** Marks users whose branch reached many people — kept for editorial /
	 *  inspector copy (not visual). */
	highImpact?: boolean;
	/** Editorial 0-5 score reflecting how impactful this user's discovery
	 *  was relative to the signal's then-novelty. */
	discoveryScore?: number;
	/** Cached depth of this user's subtree, levels below them. */
	depthLevels?: number;
	/** Name of the downstream scout whose subcascade is largest. */
	biggestSubcascadeName?: string;
	/** Size of the largest downstream subcascade rooted at this user. */
	biggestSubcascadeReach?: number;

	/** Marks the current viewer's own node — triggers the row's cu-row rail
	 *  and primary avatar border. */
	isCurrentUser?: boolean;
	/** Faint placeholder for the current user's pending amplification.
	 *  Renders dimmed + italic + non-selectable; the row only invites the
	 *  user to press the Amplify button. */
	isPreviewNode?: boolean;

	/** Behavioral category — passive / deep / amplifier / successful-amplifier.
	 *  Only visual-language field on PropagationUser. */
	nodeKind?: PropagationNodeKind;

	/** Editorial role used by the inspector's "Role in signal" section.
	 *  Derived deterministically from nodeKind + per-node hash so the same
	 *  user always reads the same role. Decoupled from `nodeKind` so the
	 *  underlying classification logic and visual language stay unchanged. */
	signalRole?: SignalRole;
	/** Days after origin when this scout first encountered the signal. */
	firstSignalEventAt?: number;
	/** Days after origin when this scout passed the signal forward.
	 *  Only set for Amplifier / Successful Amplifier. ≥ firstSignalEventAt. */
	amplifiedAt?: number;
	/** Percentile (1-99) within this scout's role cohort — "earlier than N%
	 *  of {role}s". Tracks how early this person showed up relative to
	 *  others playing the same role. */
	earlierThanPercent?: number;
	/** Times this scout passed the signal forward as a discrete event.
	 *  Distinct from `amplifications` (a numerical reach proxy) — this
	 *  counts share events. Only meaningful for Amplifier/SA. */
	forwardAmplifications?: number;
	/** Ordered role progression. When present and length > 1, the inspector
	 *  renders a compact arrow journey ("Listener → Deep Listener →
	 *  Amplifier → Successful Amplifier"). Single-stage journeys are
	 *  omitted from the UI. */
	signalJourney?: SignalRole[];

	/** Explicit branch-state override (acceleration-model classification).
	 *  When set, `computeBranchActivity` returns this directly without
	 *  walking the subtree. Conceptually represents the node's local
	 *  momentum (recent activity vs. baseline, growth ratio, etc.) —
	 *  decoupled from topology so a deep descendant can legitimately
	 *  classify hotter than its ancestor, a chain can cool and re-ignite,
	 *  etc. Mock archetypes that want to express specific transition
	 *  patterns set this field on relevant nodes; archetypes that don't
	 *  set it fall through to the cumulative-subtree heuristic for
	 *  backward compatibility. */
	branchState?: BranchActivityState;
};

export type RootBranchSummary = {
	rootId: string;
	label: string;
	count: number;
};

export type PropagationForest = {
	itemId: string;
	roots: PropagationUser[];
	hiddenRootUsers: PropagationUser[];
	hiddenRoots: number;
	totalReach: number;
	independentOrigins: number;
	weightedImpact: number;
	totalAmplifications: number;
	summary: string;
	branchSummaries: RootBranchSummary[];
	scenes: string[];
	crossingNote: string;
	originNote: string;
};

const dicebear = (seed: string) =>
	`https://api.dicebear.com/9.x/thumbs/svg?seed=${seed}&backgroundColor=1e1b4b`;

/* ─────────────── Editorial pools (used by the generator) ─────────────── */

/* First-name pool. The four "known" scouts (dan / alice / marco / yuki)
   are intentionally NOT in this list — they're injected by id when the
   route source needs them. */
const NAME_POOL = [
	'Sofia', 'Daria', 'Pieter', 'Mara', 'Julia', 'Renan', 'Tomas', 'Inga',
	'Leo', 'Anya', 'Saul', 'Eva', 'Wren', 'Iris', 'Owen', 'Nadia',
	'Bram', 'Lia', 'Kai', 'Maja', 'Otto', 'Saskia', 'Janek', 'Stine',
	'Lukas', 'Mira', 'Tobias', 'Yana', 'Adrian', 'Lena', 'Mikko', 'Sanna',
	'Hilde', 'Joris', 'Petra', 'Vesa', 'Kira', 'Aleks', 'Suvi', 'Erik',
	'Tor', 'Liv', 'Niko', 'Aris', 'Hana', 'Iliana', 'Olek',
	'Selma', 'Vera', 'Magnus', 'Anita', 'Bo', 'Cilla', 'Dag', 'Emil',
	'Fia', 'Gunnar', 'Hilma', 'Ida', 'Jaakko', 'Karin', 'Lassi',
	/* Extended pool — kept distinct enough culturally that 70+ node
	   trees (the stress archetypes) don't fall back to "Name42". */
	'Reidar', 'Solveig', 'Asbjorn', 'Hedda', 'Frida', 'Aksel', 'Brit',
	'Caspar', 'Doro', 'Ebbe', 'Frode', 'Greta', 'Halla', 'Imre',
	'Janus', 'Kalla', 'Lior', 'Mira-Lin', 'Nika', 'Ola', 'Pirjo',
	'Quintin', 'Rune', 'Signe', 'Tilda', 'Ulrik', 'Vidar', 'Wilma',
	'Xenia', 'Yrsa', 'Zora', 'Aki', 'Bao', 'Cato', 'Dela', 'Eero',
	'Filip', 'Gita', 'Henrik', 'Ines', 'Jonas', 'Klara', 'Linnea',
	'Milja', 'Norah', 'Osku', 'Pauli', 'Reeta', 'Saga', 'Toivo',
	'Una', 'Veera', 'Werner', 'Yara', 'Zane', 'Aino', 'Bjarte',
	'Cosima', 'Dario', 'Edda', 'Folke', 'Gisli', 'Halvar', 'Idun',
];

const CHARACTERS_PASSIVE = [
	'Cassette archivist', 'Quiet listener', 'Low-key listener',
	'Late-night drifter', 'Late commuter', 'Headphone observer',
	'Background absorber', 'Lurker by habit', 'Soft completionist',
	'Catalogue grazer', 'Sleeve reader', 'Shelf cataloguer',
	'Half-attention listener', 'Background fixture',
];

const CHARACTERS_DEEP = [
	'Deep ambient seeker', 'Field-recording listener', 'Drone immersion student',
	'Late-night dweller', 'Ritual listener', 'Devotional ambient ear',
	'Long-form contemplative', 'Slow listener', 'Tape-loop devotee',
	'Reverb cartographer', 'Resonance follower', 'Texture archivist',
	'Headphone ritualist', 'Patient listener',
];

const CHARACTERS_AMP = [
	'Ambient cartographer', 'Drone obsessive', 'Post-rock crossover',
	'Late-night signal hunter', 'Cassette scout', 'Scene connector',
	'Edge-of-scene listener', 'Crossover taste-maker', 'Mixtape sharer',
	'Note-passing curator', 'Whisper network amplifier', 'Sleeve photographer',
	'Show-up-late witness', 'Quiet broadcaster',
];

const CHARACTERS_SUCCESS = [
	'Underground connector', 'Deep scene explorer', 'Cross-scene bridge',
	'Cultural propagator', 'Trusted signal carrier', 'Quietly central node',
	'Branch-defining scout', 'Long-arc amplifier', 'Cassette underground hub',
];

const SCENES = [
	'ambient/drone crossover', 'cassette ambient orbit', 'post-rock crossover',
	'late-night headphone scene', 'drone microculture', 'ritual ambient',
	'field recordings', 'cassette ambient', 'experimental crossover',
	'folk-leaning ambient', 'long-form drone', 'tape ambient',
	'liminal listening cluster', 'dawn-walk ambient', 'underground cassette',
	'whisper network', 'quiet early-listener cluster', 'patient ambient orbit',
];

const BEHAVIOR_NOTES_PASSIVE = [
	'Signal stopped here.', 'Listened once, never amplified.',
	'Quiet endpoint of the branch.', 'No onward transmission.',
	'Catalogued silently.', 'Filed away without sharing.',
	'Picked it up; let it rest.',
];

const BEHAVIOR_NOTES_DEEP = [
	'Resonated deeply, did not amplify.', 'Sat with the signal for weeks.',
	'Returned to it repeatedly, alone.', 'Quiet but engaged.',
	'Internal listener; the signal mattered here.', 'Held it without sharing.',
	'Listened in full, in silence.',
];

const BEHAVIOR_NOTES_AMP = [
	'Picked up the signal and carried it forward.', 'Shared with a tight circle.',
	'Quietly pushed it into adjacent listeners.', 'Transmitted onward, intentionally.',
	'Whisper-network amplification.', 'Sent it to a small group with context.',
];

const BEHAVIOR_NOTES_SUCCESS = [
	'High-impact propagator; the branch reached far.',
	'Carried the signal across scenes.', 'Trusted broadcaster within their circle.',
	'Their transmission opened a wide downstream branch.',
	'Bridge-style scout — the branch reached unexpected listeners.',
];

const CLUSTER_LABELS = [
	'Quieter listeners', 'Drone-leaning listeners', 'Ambient cluster',
	'Late-night cluster', 'Cassette-adjacent listeners',
	'Post-rock-adjacent listeners', 'Field-recording cluster',
	'Quiet downstream branch', 'Patient ambient cluster',
	'Edge-of-scene listeners',
];

const CLUSTER_DESCRIPTIONS = [
	'Quiet listeners who tend to amplify within their orbit but rarely cross-pollinate.',
	'Crossover ears that drift between adjacent scenes; signals tend to slow but persist here.',
	'Late-night listeners — minimal onward movement, but the signal lingers.',
	'Scene-adjacent listeners who absorb without re-broadcasting.',
	'Quiet downstream branch where the signal settles without further amplification.',
];

const DISCOVERED_PHRASES = [
	'2 days ago', '4 days ago', '6 days ago', '9 days ago', '11 days ago',
	'2 weeks ago', '3 weeks ago', '4 weeks ago', '5 weeks ago', '6 weeks ago',
	'8 weeks ago', '3 months ago',
];

/* ─────────────── Seeded RNG ─────────────── */

function hashString(s: string): number {
	let h = 2166136261 >>> 0;
	for (let i = 0; i < s.length; i++) {
		h ^= s.charCodeAt(i);
		h = Math.imul(h, 16777619) >>> 0;
	}
	return h >>> 0;
}

function makeRng(seed: number) {
	// xorshift32 — small, deterministic, good enough for mock variation.
	let x = seed | 0;
	if (x === 0) x = 1;
	return () => {
		x ^= x << 13; x |= 0;
		x ^= x >>> 17;
		x ^= x << 5;  x |= 0;
		return ((x >>> 0) % 1_000_000) / 1_000_000;
	};
}

function pick<T>(rand: () => number, arr: readonly T[]): T {
	return arr[Math.floor(rand() * arr.length) % arr.length];
}

function pickN<T>(rand: () => number, arr: readonly T[], n: number): T[] {
	const copy = arr.slice();
	const out: T[] = [];
	for (let i = 0; i < n && copy.length > 0; i++) {
		const idx = Math.floor(rand() * copy.length) % copy.length;
		out.push(copy.splice(idx, 1)[0]);
	}
	return out;
}

function randInt(rand: () => number, min: number, max: number): number {
	return Math.floor(rand() * (max - min + 1)) + min;
}

function chance(rand: () => number, p: number): boolean {
	return rand() < p;
}

/* ─────────────── Node builder ─────────────── */

type BuilderCtx = {
	rand: () => number;
	usedIds: Set<string>;
	usedNames: Set<string>;
};

function uniqueName(ctx: BuilderCtx): string {
	for (let i = 0; i < 30; i++) {
		const candidate = pick(ctx.rand, NAME_POOL);
		if (!ctx.usedNames.has(candidate)) {
			ctx.usedNames.add(candidate);
			return candidate;
		}
	}
	// Fallback when pool exhausted.
	const fallback = pick(ctx.rand, NAME_POOL) + String(randInt(ctx.rand, 2, 99));
	ctx.usedNames.add(fallback);
	return fallback;
}

function uniqueId(ctx: BuilderCtx, basis: string): string {
	const base = basis.toLowerCase().replace(/[^a-z0-9]+/g, '-');
	let candidate = base;
	let i = 1;
	while (ctx.usedIds.has(candidate)) {
		candidate = `${base}-${i++}`;
	}
	ctx.usedIds.add(candidate);
	return candidate;
}

function charactersFor(kind: PropagationNodeKind): readonly string[] {
	switch (kind) {
		case 'passive-listener':     return CHARACTERS_PASSIVE;
		case 'deep-listener':        return CHARACTERS_DEEP;
		case 'amplifier':            return CHARACTERS_AMP;
		case 'successful-amplifier': return CHARACTERS_SUCCESS;
	}
}

function behaviorFor(kind: PropagationNodeKind): readonly string[] {
	switch (kind) {
		case 'passive-listener':     return BEHAVIOR_NOTES_PASSIVE;
		case 'deep-listener':        return BEHAVIOR_NOTES_DEEP;
		case 'amplifier':            return BEHAVIOR_NOTES_AMP;
		case 'successful-amplifier': return BEHAVIOR_NOTES_SUCCESS;
	}
}

/* Deterministic per-node role + timing fields used by the inspector's
   "Role in signal" section. Pulled out of makeNode so the logic is in
   one place and origins / current-user nodes get the same treatment.

   Determinism: every output is computed from the node's id hash so the
   same scout always reads the same role/timing on every refresh.
   `nodeKind` chooses the base role; for passive-listener we split the
   cohort ~50/50 between "Passive Listener" and "Listener" (returned
   more than once) so the UI demonstrates both. */
function deriveSignalRole(kind: PropagationNodeKind, hashSeed: number): SignalRole {
	switch (kind) {
		case 'passive-listener':
			return (hashSeed % 100) < 55 ? 'Passive Listener' : 'Listener';
		case 'deep-listener':       return 'Deep Listener';
		case 'amplifier':           return 'Amplifier';
		case 'successful-amplifier': return 'Successful Amplifier';
	}
}

/* All shifts below use `>>>` (unsigned right shift) so the result is
   non-negative even when hashSeed has the high bit set — JS `>>` would
   sign-extend and `%` would propagate the sign, producing negative
   percentile / day values. */
function deriveSignalJourney(role: SignalRole, hashSeed: number): SignalRole[] {
	switch (role) {
		case 'Passive Listener': return ['Passive Listener'];
		case 'Listener':         return ['Passive Listener', 'Listener'];
		case 'Deep Listener': {
			const showProgression = ((hashSeed >>> 4) % 100) < 70;
			return showProgression ? ['Listener', 'Deep Listener'] : ['Deep Listener'];
		}
		case 'Amplifier': {
			const len = ((hashSeed >>> 6) % 100) < 60
				? 3
				: ((hashSeed >>> 8) % 100) < 50
					? 2
					: 1;
			if (len === 3) return ['Listener', 'Deep Listener', 'Amplifier'];
			if (len === 2) return ['Deep Listener', 'Amplifier'];
			return ['Amplifier'];
		}
		case 'Successful Amplifier': {
			const len = ((hashSeed >>> 6) % 100) < 65
				? 4
				: ((hashSeed >>> 8) % 100) < 55
					? 3
					: 2;
			if (len === 4) return ['Listener', 'Deep Listener', 'Amplifier', 'Successful Amplifier'];
			if (len === 3) return ['Deep Listener', 'Amplifier', 'Successful Amplifier'];
			return ['Amplifier', 'Successful Amplifier'];
		}
	}
}

function deriveSignalTiming(
	role: SignalRole,
	hashSeed: number,
): { firstSignalEventAt: number; amplifiedAt?: number; earlierThanPercent: number } {
	const dayBase = ((hashSeed >>> 2) % 80) + 1;
	const earlyBias =
		role === 'Successful Amplifier' ? 0.55 :
		role === 'Amplifier'             ? 0.70 :
		role === 'Deep Listener'         ? 0.85 :
		1.00;
	const firstSignalEventAt = Math.max(1, Math.round(dayBase * earlyBias));

	let amplifiedAt: number | undefined;
	if (role === 'Amplifier' || role === 'Successful Amplifier') {
		const lag = (hashSeed >>> 10) % 13;
		amplifiedAt = firstSignalEventAt + lag;
	}

	const earlierThanPercent = ((hashSeed >>> 14) % 99) + 1;

	return { firstSignalEventAt, amplifiedAt, earlierThanPercent };
}

function makeNode(
	ctx: BuilderCtx,
	kind: PropagationNodeKind,
	opts: Partial<PropagationUser> = {},
): PropagationUser {
	const name = opts.name ?? uniqueName(ctx);
	const id = opts.id ?? uniqueId(ctx, name);
	const avatar = opts.avatar ?? dicebear(id + Math.floor(ctx.rand() * 1000));
	const hashSeed = hashString(id);
	const signalRole = opts.signalRole ?? deriveSignalRole(kind, hashSeed);
	const timing = deriveSignalTiming(signalRole, hashSeed);
	const forwardAmplifications = opts.forwardAmplifications ?? (
		signalRole === 'Successful Amplifier' ? ((hashSeed >>> 18) % 5) + 3 :
		signalRole === 'Amplifier'             ? ((hashSeed >>> 18) % 3) + 1 :
		undefined
	);
	return {
		id,
		name,
		avatar,
		character: opts.character ?? pick(ctx.rand, charactersFor(kind)),
		amplifications: opts.amplifications ?? (
			kind === 'successful-amplifier' ? randInt(ctx.rand, 4, 9)
				: kind === 'amplifier'        ? randInt(ctx.rand, 2, 5)
				: kind === 'deep-listener'    ? randInt(ctx.rand, 0, 2)
				: 0
		),
		branchSize: opts.branchSize ?? 0,
		discoveredAgo: opts.discoveredAgo ?? pick(ctx.rand, DISCOVERED_PHRASES),
		behaviorNote: opts.behaviorNote ?? pick(ctx.rand, behaviorFor(kind)),
		scenes: opts.scenes ?? pickN(ctx.rand, SCENES, randInt(ctx.rand, 1, 2)),
		children: opts.children ?? [],
		hiddenChildren: opts.hiddenChildren,
		hiddenChildrenLabel: opts.hiddenChildrenLabel,
		hiddenChildrenDescription: opts.hiddenChildrenDescription,
		isOrigin: opts.isOrigin,
		highImpact: opts.highImpact,
		noveltyTierAtDiscovery: opts.noveltyTierAtDiscovery,
		fameIndexAtDiscovery: opts.fameIndexAtDiscovery,
		discoveryScore: opts.discoveryScore,
		depthLevels: opts.depthLevels,
		biggestSubcascadeName: opts.biggestSubcascadeName,
		biggestSubcascadeReach: opts.biggestSubcascadeReach,
		branchState: opts.branchState,
		nodeKind: kind,
		signalRole,
		firstSignalEventAt: opts.firstSignalEventAt ?? timing.firstSignalEventAt,
		amplifiedAt: opts.amplifiedAt ?? timing.amplifiedAt,
		earlierThanPercent: opts.earlierThanPercent ?? timing.earlierThanPercent,
		forwardAmplifications,
		signalJourney: opts.signalJourney ?? deriveSignalJourney(signalRole, hashSeed),
	};
}

/* ─────────────── Shape builders ─────────────── */

/* Pick a downstream-kind distribution for children of a given parent.
   Mostly passive/deep, with occasional amps and rare successful amps. */
function pickDownstreamKind(rand: () => number, allowSuccess = false): PropagationNodeKind {
	const r = rand();
	if (allowSuccess && r < 0.04) return 'successful-amplifier';
	if (r < 0.18) return 'amplifier';
	if (r < 0.50) return 'deep-listener';
	return 'passive-listener';
}

/* A deep narrow chain — used for "deep-chain" archetypes and for
   tucked-away quiet branches. Length is randomised within a range. */
function buildChain(
	ctx: BuilderCtx,
	minLen: number,
	maxLen: number,
	{ allowAmpAt = -1, allowSuccessAt = -1 }: { allowAmpAt?: number; allowSuccessAt?: number } = {},
): PropagationUser {
	const len = randInt(ctx.rand, minLen, maxLen);
	let kind: PropagationNodeKind =
		chance(ctx.rand, 0.4) ? 'deep-listener' : 'passive-listener';
	// Build leaf upward.
	let cursor: PropagationUser = makeNode(ctx, kind);
	for (let d = 1; d < len; d++) {
		const fromTop = len - 1 - d;
		if (allowSuccessAt >= 0 && fromTop === allowSuccessAt) {
			kind = 'successful-amplifier';
		} else if (allowAmpAt >= 0 && fromTop === allowAmpAt) {
			kind = 'amplifier';
		} else {
			kind = chance(ctx.rand, 0.55) ? 'deep-listener' : 'passive-listener';
		}
		cursor = makeNode(ctx, kind, { children: [cursor] });
	}
	return cursor;
}

/* A wide cluster of siblings under one parent. */
function buildCluster(
	ctx: BuilderCtx,
	count: number,
	options: { withGrandchildren?: boolean; allowSuccess?: boolean } = {},
): PropagationUser[] {
	const { withGrandchildren = true, allowSuccess = false } = options;
	const out: PropagationUser[] = [];
	for (let i = 0; i < count; i++) {
		const kind = pickDownstreamKind(ctx.rand, allowSuccess && i === 0);
		const grandkids: PropagationUser[] = [];
		if (withGrandchildren && (kind === 'amplifier' || kind === 'successful-amplifier')) {
			const gcCount = kind === 'successful-amplifier'
				? randInt(ctx.rand, 2, 4)
				: randInt(ctx.rand, 0, 2);
			for (let j = 0; j < gcCount; j++) {
				const gkKind = pickDownstreamKind(ctx.rand);
				grandkids.push(makeNode(ctx, gkKind));
			}
		}
		out.push(makeNode(ctx, kind, { children: grandkids }));
	}
	return out;
}

/* A burst — one node with many direct children, optionally with a hidden tail. */
function buildBurst(
	ctx: BuilderCtx,
	parentKind: PropagationNodeKind,
	visibleCount: number,
	hiddenCount: number,
): PropagationUser {
	const children: PropagationUser[] = [];
	for (let i = 0; i < visibleCount; i++) {
		const kind = pickDownstreamKind(ctx.rand, i === 0 && chance(ctx.rand, 0.4));
		const subkidsCount =
			kind === 'successful-amplifier' ? randInt(ctx.rand, 1, 3)
				: kind === 'amplifier' ? randInt(ctx.rand, 0, 2)
				: 0;
		const subkids: PropagationUser[] = [];
		for (let j = 0; j < subkidsCount; j++) {
			subkids.push(makeNode(ctx, pickDownstreamKind(ctx.rand)));
		}
		children.push(makeNode(ctx, kind, { children: subkids }));
	}
	return makeNode(ctx, parentKind, {
		isOrigin: true,
		children,
		hiddenChildren: hiddenCount,
		hiddenChildrenLabel: hiddenCount > 0 ? pick(ctx.rand, CLUSTER_LABELS) : undefined,
		hiddenChildrenDescription: hiddenCount > 0 ? pick(ctx.rand, CLUSTER_DESCRIPTIONS) : undefined,
	});
}

/* A small, often dead-end root — most common shape across the forest. */
function buildSmallRoot(ctx: BuilderCtx): PropagationUser {
	const kind: PropagationNodeKind = chance(ctx.rand, 0.5) ? 'passive-listener' : 'deep-listener';
	const kidCount = randInt(ctx.rand, 0, 2);
	const kids: PropagationUser[] = [];
	for (let i = 0; i < kidCount; i++) {
		kids.push(makeNode(ctx, pickDownstreamKind(ctx.rand)));
	}
	return makeNode(ctx, kind, { isOrigin: true, children: kids });
}

/* ─────────────── Archetypes ─────────────── */

/* Each archetype returns a (roots, hiddenRoots) tuple. */
type ArchetypeResult = { roots: PropagationUser[]; hiddenRootUsers: PropagationUser[] };

/* 1. Hub-dominant — one big successful-amplifier root + a few quiet origins. */
function buildHubDominant(ctx: BuilderCtx): ArchetypeResult {
	const hub = buildBurst(ctx, 'successful-amplifier', randInt(ctx.rand, 3, 5), randInt(ctx.rand, 4, 8));
	// Add a deeper sub-branch under one of the hub's children for variety.
	if (hub.children.length > 1 && chance(ctx.rand, 0.7)) {
		const target = hub.children[0];
		target.children = [...target.children, buildChain(ctx, 3, 5)];
	}
	const small1 = buildSmallRoot(ctx);
	const small2 = buildSmallRoot(ctx);
	const hidden: PropagationUser[] = [];
	const hiddenCount = randInt(ctx.rand, 1, 3);
	for (let i = 0; i < hiddenCount; i++) hidden.push(buildSmallRoot(ctx));
	return { roots: [hub, small1, small2], hiddenRootUsers: hidden };
}

/* 2. Fragmented — many small origins, mostly shallow. */
function buildFragmented(ctx: BuilderCtx): ArchetypeResult {
	const visible: PropagationUser[] = [];
	const visibleCount = randInt(ctx.rand, 4, 6);
	for (let i = 0; i < visibleCount; i++) visible.push(buildSmallRoot(ctx));
	// Promote one to a small amplifier for variety.
	if (visible.length > 0 && chance(ctx.rand, 0.8)) {
		const target = visible[0];
		target.nodeKind = 'amplifier';
		target.character = pick(ctx.rand, CHARACTERS_AMP);
		target.children = [
			...target.children,
			makeNode(ctx, pickDownstreamKind(ctx.rand)),
			makeNode(ctx, pickDownstreamKind(ctx.rand)),
		];
	}
	const hidden: PropagationUser[] = [];
	for (let i = 0; i < randInt(ctx.rand, 3, 5); i++) hidden.push(buildSmallRoot(ctx));
	return { roots: visible, hiddenRootUsers: hidden };
}

/* 3. Late-bloomer — quiet chain that explodes deep down. */
function buildLateBloomer(ctx: BuilderCtx): ArchetypeResult {
	// Build the "blooming" sub-burst first, then wrap it in a quiet chain.
	const sub = buildBurst(ctx, 'successful-amplifier', randInt(ctx.rand, 3, 5), randInt(ctx.rand, 2, 5));
	sub.isOrigin = false; // it's mid-chain, not a true origin
	// Wrap it in 3–5 quiet listener nodes above it.
	const chainLen = randInt(ctx.rand, 3, 5);
	let cursor: PropagationUser = sub;
	for (let d = 0; d < chainLen; d++) {
		const k: PropagationNodeKind =
			d === 0 ? 'amplifier' :
			chance(ctx.rand, 0.55) ? 'deep-listener' : 'passive-listener';
		cursor = makeNode(ctx, k, { children: [cursor] });
	}
	cursor.isOrigin = true;
	return {
		roots: [cursor, buildSmallRoot(ctx), buildSmallRoot(ctx)],
		hiddenRootUsers: [buildSmallRoot(ctx), buildSmallRoot(ctx)],
	};
}

/* 4. Deep-chain — narrow, long, mostly listener chain. */
function buildDeepChain(ctx: BuilderCtx): ArchetypeResult {
	const len = randInt(ctx.rand, 7, 10);
	const main = buildChain(ctx, len, len, {
		allowAmpAt: Math.floor(len / 2),
	});
	main.isOrigin = true;
	// Occasional sibling at a mid-depth — tiny dead-end shoot.
	if (chance(ctx.rand, 0.7) && main.children.length > 0) {
		const mid = main.children[0];
		mid.children = [...mid.children, makeNode(ctx, 'passive-listener')];
	}
	const sideRoot1 = buildSmallRoot(ctx);
	const sideRoot2 = buildSmallRoot(ctx);
	return {
		roots: [main, sideRoot1, sideRoot2],
		hiddenRootUsers: [buildSmallRoot(ctx)],
	};
}

/* 5. Bursty — origin → one successful amplifier → dense sibling cluster. */
function buildBursty(ctx: BuilderCtx): ArchetypeResult {
	const cluster = buildCluster(ctx, randInt(ctx.rand, 4, 6), { allowSuccess: true });
	const sub = makeNode(ctx, 'successful-amplifier', {
		children: cluster,
		hiddenChildren: randInt(ctx.rand, 2, 5),
		hiddenChildrenLabel: pick(ctx.rand, CLUSTER_LABELS),
		hiddenChildrenDescription: pick(ctx.rand, CLUSTER_DESCRIPTIONS),
	});
	const root = makeNode(ctx, 'amplifier', { isOrigin: true, children: [sub] });
	const small1 = buildSmallRoot(ctx);
	const small2 = buildSmallRoot(ctx);
	return {
		roots: [root, small1, small2],
		hiddenRootUsers: [buildSmallRoot(ctx), buildSmallRoot(ctx)],
	};
}

/* 6. Sparse — a few quiet origins, almost no spread. */
function buildSparse(ctx: BuilderCtx): ArchetypeResult {
	const visible: PropagationUser[] = [];
	for (let i = 0; i < randInt(ctx.rand, 3, 4); i++) visible.push(buildSmallRoot(ctx));
	// Give one of them a slightly deeper tail.
	if (visible.length > 0 && chance(ctx.rand, 0.6)) {
		const target = visible[Math.floor(ctx.rand() * visible.length)];
		target.children = [...target.children, buildChain(ctx, 2, 4)];
	}
	return {
		roots: visible,
		hiddenRootUsers: [buildSmallRoot(ctx), buildSmallRoot(ctx)],
	};
}

/* 7. Showcase — hand-tuned forest that exhibits ALL FIVE branch states
   side by side, plus several mixed-state scenarios. Used as a fixed
   override for the `frozen-sun` demo item so the visual differentiation
   between dead/alive/accelerating/strong/peak is always inspectable in
   one screenshot. Heuristic (in computeBranchActivity):
     dead         → 0 amps anywhere
     alive        → some amps, 0 successful-amplifiers
     accelerating → 1 successful-amplifier
     strong       → 2-3 successful-amplifiers
     peak         → 4+ successful-amplifiers */
function buildShowcase(ctx: BuilderCtx): ArchetypeResult {
	const successKid = (children: PropagationUser[] = []) =>
		makeNode(ctx, 'successful-amplifier', { children });

	// ── PEAK origin: 5 successful-amplifiers downstream, dense traffic ──
	// Internally contains strong + accelerating sub-branches as you descend.
	const peakRoot = makeNode(ctx, 'successful-amplifier', {
		isOrigin: true,
		children: [
			successKid([
				successKid([
					makeNode(ctx, 'amplifier'),
					makeNode(ctx, 'deep-listener'),
				]),
				makeNode(ctx, 'amplifier', { children: [
					makeNode(ctx, 'deep-listener'),
				] }),
			]),
			successKid([
				makeNode(ctx, 'amplifier'),
				makeNode(ctx, 'passive-listener'),
			]),
			successKid([
				makeNode(ctx, 'deep-listener'),
			]),
			makeNode(ctx, 'amplifier', { children: [
				makeNode(ctx, 'passive-listener'),
			] }),
			makeNode(ctx, 'deep-listener'),
		],
	});

	// ── STRONG origin: exactly 2 successful-amplifiers downstream ──
	// One of its sub-branches is accelerating (1 success), the other is alive.
	const strongRoot = makeNode(ctx, 'amplifier', {
		isOrigin: true,
		children: [
			successKid([
				makeNode(ctx, 'amplifier'),
				makeNode(ctx, 'deep-listener'),
				makeNode(ctx, 'passive-listener'),
			]),
			successKid([
				makeNode(ctx, 'deep-listener'),
				makeNode(ctx, 'amplifier'),
			]),
			makeNode(ctx, 'amplifier', { children: [
				makeNode(ctx, 'deep-listener'),
				makeNode(ctx, 'passive-listener'),
			] }),
		],
	});

	// ── ACCELERATING origin: 1 successful-amplifier ──
	// Sub-branches under that success are alive.
	const acceleratingRoot = makeNode(ctx, 'amplifier', {
		isOrigin: true,
		children: [
			successKid([
				makeNode(ctx, 'amplifier'),
				makeNode(ctx, 'deep-listener'),
				makeNode(ctx, 'passive-listener'),
			]),
			makeNode(ctx, 'deep-listener'),
			makeNode(ctx, 'passive-listener'),
		],
	});

	// ── ALIVE origin: amps but no successful-amplifier ──
	// Cool, calm, steady. One dead leaf child for mixed-state illustration.
	const aliveRoot = makeNode(ctx, 'amplifier', {
		isOrigin: true,
		children: [
			makeNode(ctx, 'deep-listener'),
			makeNode(ctx, 'amplifier', { children: [
				makeNode(ctx, 'deep-listener'),
			] }),
			makeNode(ctx, 'passive-listener', { amplifications: 0 }),
		],
	});

	// ── DEAD origin: 0 amps, only passive listeners ──
	const deadRoot = makeNode(ctx, 'passive-listener', {
		isOrigin: true,
		amplifications: 0,
		children: [
			makeNode(ctx, 'passive-listener', { amplifications: 0 }),
		],
	});

	return {
		roots: [peakRoot, strongRoot, acceleratingRoot, aliveRoot, deadRoot],
		hiddenRootUsers: [],
	};
}

/* 8. Strong-spotlight — a single main origin pinned to the strong-
   accelerating classification (exactly 2 successful-amplifiers in its
   subtree), surrounded by one calm alive origin and one dead origin for
   contrast. Used by a couple of specific item ids (see below) so the
   strong tier can be inspected outside the frozen-sun showcase. */
function buildStrongSpotlight(ctx: BuilderCtx): ArchetypeResult {
	const successKid = (children: PropagationUser[] = []) =>
		makeNode(ctx, 'successful-amplifier', { children });

	const strongRoot = makeNode(ctx, 'amplifier', {
		isOrigin: true,
		children: [
			successKid([
				makeNode(ctx, 'amplifier'),
				makeNode(ctx, 'deep-listener'),
				makeNode(ctx, 'passive-listener'),
			]),
			successKid([
				makeNode(ctx, 'deep-listener'),
				makeNode(ctx, 'amplifier'),
				makeNode(ctx, 'passive-listener'),
			]),
			makeNode(ctx, 'amplifier', { children: [
				makeNode(ctx, 'deep-listener'),
				makeNode(ctx, 'passive-listener'),
			] }),
			makeNode(ctx, 'deep-listener'),
		],
	});

	const aliveOrigin = makeNode(ctx, 'amplifier', {
		isOrigin: true,
		children: [
			makeNode(ctx, 'deep-listener'),
			makeNode(ctx, 'amplifier', { children: [makeNode(ctx, 'deep-listener')] }),
			makeNode(ctx, 'passive-listener', { amplifications: 0 }),
		],
	});

	const deadOrigin = makeNode(ctx, 'passive-listener', {
		isOrigin: true,
		amplifications: 0,
		children: [makeNode(ctx, 'passive-listener', { amplifications: 0 })],
	});

	return {
		roots: [strongRoot, aliveOrigin, deadOrigin],
		hiddenRootUsers: [],
	};
}

/* ─────────────── Stress-test archetypes ───────────────

   The archetypes below are designed to stress-test specific
   weaknesses of the visualization once it matured beyond the
   original showcase. Each one targets:

     viral-explosion      → deep scrolling, single-trunk continuity
     slow-burn            → state evolution through depth
     fragmented-community → side-by-side state diversity at level 0
     false-start          → strong→quiet descending state transitions
     resurrection         → quiet→strong descending transitions, deep cluster
     multi-core-spread    → parallel trunks at different intensities

   They're built bottom-up using small inline shorthands inside each
   builder so the tree shape stays visually scannable in the source.
   Each builder caps at 12–13 levels by hand; we don't try to
   parameterise depth because trees of this scale are easier to read
   as concrete shapes than as recursive plans. */

/* 9. Viral Explosion — one dominant 12-level trunk with successes
   distributed at depth, plus mid-tree side branches that stay quiet
   so state diversity is visible at every depth level the user
   scrolls through. The two siblings under the origin are tiny so
   the dominant trunk visually owns the screen.

   Successes (counting from origin): origin itself, dominant L1,
   L2, L4, L6, L9 = 6 successful-amplifiers in the dominant trunk.
   Origin classifies as PEAK; descending the trunk hits PEAK→PEAK
   →STRONG→STRONG→ACCELERATING→ACCELERATING→ALIVE→DEAD as the
   success count below each node drops. */
function buildViralExplosion(ctx: BuilderCtx): ArchetypeResult {
	const sa = (children?: PropagationUser[]) =>
		makeNode(ctx, 'successful-amplifier', children ? { children } : {});
	const amp = (children?: PropagationUser[]) =>
		makeNode(ctx, 'amplifier', children ? { children } : {});
	const dl = (children?: PropagationUser[]) =>
		makeNode(ctx, 'deep-listener', children ? { children } : {});
	const pl = (children?: PropagationUser[]) =>
		makeNode(ctx, 'passive-listener', children ? { children } : {});
	const dead = () =>
		makeNode(ctx, 'passive-listener', { amplifications: 0 });

	// Build dominant trunk bottom-up, depth 12 (origin = level 0).
	const L12 = dead();                                              // deepest leaf
	const L11 = dl([L12]);                                           // alive→dead
	const L10 = amp([L11, pl()]);                                    // alive
	const L9 = sa([L10, dl(), pl()]);                                // accelerating (1 success: self)
	const L8 = amp([L9, dl([pl()])]);                                // accelerating
	const L7 = dl([L8]);                                             // accelerating
	const L6 = sa([                                                  // strong (1 self + 1 below)
		L7,
		amp([dl(), pl()]),                                            //   side branch — alive
		dl(),                                                         //   side branch — alive
	]);
	const L5 = amp([L6]);                                            // strong
	const L4 = sa([                                                  // strong (1 self + 2 below) → eventually peak when added with L2
		L5,
		amp([dl([pl()])]),                                            //   side branch — alive
		pl(),
	]);
	const L3 = amp([L4, dl()]);                                      // strong/peak
	const L2 = sa([                                                  // peak (1 self + 3 below = 4)
		L3,
		dl([pl()]),                                                   //   side branch — alive
	]);
	const dominant = sa([L2]);                                       // peak (5 successes in subtree)

	// Tiny sibling branches under origin — alive / dead-ish so the
	// origin's child level shows mixed states.
	const siblingA = amp([dl(), pl()]);                              // alive
	const siblingB = dl([pl()]);                                     // alive (deep-listener has amps)

	const origin = makeNode(ctx, 'successful-amplifier', {
		isOrigin: true,
		children: [dominant, siblingA, siblingB],
	});

	// A couple of small unrelated origins for scrolling padding.
	return {
		roots: [origin, buildSmallRoot(ctx), buildSmallRoot(ctx)],
		hiddenRootUsers: [buildSmallRoot(ctx)],
	};
}

/* 10. Slow Burn — 11-level tree with sustained branching at every
   level and successful-amplifiers spaced ~every 2-3 levels so the
   subtree classifications EVOLVE smoothly as you descend.

   Successes are placed at depths 1, 3, 5, 7, 9. Walking from origin
   you see: origin PEAK → L1 STRONG → L3 STRONG → L5 ACCELERATING →
   L7 ACCELERATING → L9 ACCELERATING → L10 ALIVE → DEAD. */
function buildSlowBurn(ctx: BuilderCtx): ArchetypeResult {
	const sa = (children?: PropagationUser[]) =>
		makeNode(ctx, 'successful-amplifier', children ? { children } : {});
	const amp = (children?: PropagationUser[]) =>
		makeNode(ctx, 'amplifier', children ? { children } : {});
	const dl = (children?: PropagationUser[]) =>
		makeNode(ctx, 'deep-listener', children ? { children } : {});
	const pl = (children?: PropagationUser[]) =>
		makeNode(ctx, 'passive-listener', children ? { children } : {});
	const dead = () =>
		makeNode(ctx, 'passive-listener', { amplifications: 0 });

	// Bottom-up. Each level fans out 2-3 children.
	const L11 = dead();
	const L10a = dl([L11, dead()]);                                  // alive
	const L10b = pl();                                                // alive
	const L9 = sa([L10a, L10b, pl()]);                                // accelerating
	const L8 = amp([L9, dl([pl()]), pl()]);                           // accelerating
	const L7 = sa([                                                   // strong (1 self + 1 below)
		L8,
		amp([dl(), pl()]),
		dl(),
	]);
	const L6 = amp([L7, dl([pl()]), pl()]);                           // strong
	const L5 = sa([                                                   // strong (1 self + 2 below)
		L6,
		dl([amp([pl()])]),
		pl(),
	]);
	const L4 = dl([L5, amp([dl(), pl()])]);                           // strong (3 successes below)
	const L3 = sa([                                                   // peak (1 self + 3 below = 4)
		L4,
		amp([dl([pl()]), dl()]),
		dl(),
	]);
	const L2 = amp([L3, dl([pl()]), pl()]);                           // peak
	const L1 = sa([                                                   // peak (1 self + 4 below = 5)
		L2,
		amp([dl(), dl([pl()])]),
		dl([pl()]),
	]);

	const origin = makeNode(ctx, 'successful-amplifier', {
		isOrigin: true,
		children: [L1, amp([dl(), pl()]), dl([pl()])],
	});

	return {
		roots: [origin, buildSmallRoot(ctx)],
		hiddenRootUsers: [buildSmallRoot(ctx)],
	};
}

/* 11. Fragmented Community — five visible origins each in a
   DIFFERENT branch state, each deep enough (5-8 levels) to test
   intermediate branching and state diversity within itself. The
   roots-row scrolling demands all five be visible enough to scan
   side-by-side. */
function buildFragmentedCommunity(ctx: BuilderCtx): ArchetypeResult {
	const sa = (children?: PropagationUser[]) =>
		makeNode(ctx, 'successful-amplifier', children ? { children } : {});
	const amp = (children?: PropagationUser[]) =>
		makeNode(ctx, 'amplifier', children ? { children } : {});
	const dl = (children?: PropagationUser[]) =>
		makeNode(ctx, 'deep-listener', children ? { children } : {});
	const pl = (children?: PropagationUser[]) =>
		makeNode(ctx, 'passive-listener', children ? { children } : {});
	const dead = () =>
		makeNode(ctx, 'passive-listener', { amplifications: 0 });

	// Origin 1: PEAK — 4 successes spread across 6 levels, branching.
	const peakOrigin = makeNode(ctx, 'successful-amplifier', {
		isOrigin: true,
		children: [
			sa([
				sa([
					amp([dl([pl()]), pl()]),
					dl([pl()]),
				]),
				dl([amp([pl()])]),
			]),
			sa([
				amp([dl(), dl([pl()])]),
				pl(),
			]),
			amp([dl(), pl()]),
		],
	});

	// Origin 2: STRONG — 2 successes, 6 levels.
	const strongOrigin = makeNode(ctx, 'amplifier', {
		isOrigin: true,
		children: [
			sa([
				amp([dl([pl()]), dl()]),
				dl([pl()]),
			]),
			sa([
				dl([amp([pl()])]),
				pl(),
			]),
			amp([dl(), pl()]),
		],
	});

	// Origin 3: ACCELERATING — 1 success deep, 7 levels.
	const accelOrigin = makeNode(ctx, 'amplifier', {
		isOrigin: true,
		children: [
			amp([
				dl([
					amp([
						sa([
							dl([pl()]),
							pl(),
						]),
						pl(),
					]),
					dl(),
				]),
			]),
			dl([pl()]),
		],
	});

	// Origin 4: ALIVE — amps but no successes, 5 levels.
	const aliveOrigin = makeNode(ctx, 'amplifier', {
		isOrigin: true,
		children: [
			amp([
				dl([
					amp([dl([pl()]), pl()]),
					pl(),
				]),
				dl(),
			]),
			dl([pl()]),
			pl(),
		],
	});

	// Origin 5: DEAD — pure passive chain.
	const deadOrigin = makeNode(ctx, 'passive-listener', {
		isOrigin: true,
		amplifications: 0,
		children: [
			dead(),
			dead(),
		],
	});

	return {
		roots: [peakOrigin, strongOrigin, accelOrigin, aliveOrigin, deadOrigin],
		hiddenRootUsers: [buildSmallRoot(ctx)],
	};
}

/* 12. False Start — top-heavy burst of successful amplifiers near
   the origin, then a long quiet tail. Tests state transitions
   DESCENDING: the origin reads as peak/strong, but the descendants
   beyond the initial burst all classify as alive or dead.

   Visual: bright top, dim trunk for ~8 levels. */
function buildFalseStart(ctx: BuilderCtx): ArchetypeResult {
	const sa = (children?: PropagationUser[]) =>
		makeNode(ctx, 'successful-amplifier', children ? { children } : {});
	const amp = (children?: PropagationUser[]) =>
		makeNode(ctx, 'amplifier', children ? { children } : {});
	const dl = (children?: PropagationUser[]) =>
		makeNode(ctx, 'deep-listener', children ? { children } : {});
	const pl = (children?: PropagationUser[]) =>
		makeNode(ctx, 'passive-listener', children ? { children } : {});
	const dead = () =>
		makeNode(ctx, 'passive-listener', { amplifications: 0 });

	// Quiet 7-level tail used multiple times. Each instance gets its
	// own freshly generated names from the pool.
	const quietTail = (): PropagationUser =>
		dl([                                                            // L1
			amp([                                                         // L2
				dl([                                                        // L3
					amp([                                                     // L4
						dl([                                                    // L5
							pl([                                                  // L6
								dead(),                                             // L7
							]),
						]),
					]),
				]),
			]),
		]);

	// Origin: PEAK (4 immediate successes), then each success leads
	// into a long quiet chain.
	const origin = makeNode(ctx, 'successful-amplifier', {
		isOrigin: true,
		children: [
			sa([quietTail()]),
			sa([quietTail()]),
			sa([quietTail()]),
			sa([quietTail(), dl([pl()])]),
			amp([dl([pl()]), pl()]),
		],
	});

	return {
		roots: [origin, buildSmallRoot(ctx)],
		hiddenRootUsers: [buildSmallRoot(ctx)],
	};
}

/* 13. Resurrection — long quiet trunk from the origin, then a deep
   cluster of successes near the bottom. Tests deep-scrolling
   discovery: the visual story starts quiet and only the deepest
   strata reveal that the signal eventually ignited.

   Successes are concentrated at depth 8-10, with branching at the
   ignition zone. */
function buildResurrection(ctx: BuilderCtx): ArchetypeResult {
	const sa = (children?: PropagationUser[]) =>
		makeNode(ctx, 'successful-amplifier', children ? { children } : {});
	const amp = (children?: PropagationUser[]) =>
		makeNode(ctx, 'amplifier', children ? { children } : {});
	const dl = (children?: PropagationUser[]) =>
		makeNode(ctx, 'deep-listener', children ? { children } : {});
	const pl = (children?: PropagationUser[]) =>
		makeNode(ctx, 'passive-listener', children ? { children } : {});
	const dead = () =>
		makeNode(ctx, 'passive-listener', { amplifications: 0 });

	// The deep ignition cluster (depths 8-12) — multiple successes
	// branching out.
	const ignitionCluster = sa([
		sa([
			amp([dl([pl()]), dl()]),
			dl([amp([pl()])]),
		]),
		sa([
			dl([dl([dead()])]),
			pl(),
		]),
		amp([
			dl([pl()]),
		]),
	]);

	// Quiet trunk from level 1 to 7 wrapping the ignition cluster.
	// All deep-listeners so the trunk feels patient before the
	// bloom. Branching is intentionally sparse — each level usually
	// has 1 main child + an occasional dead leaf.
	let trunk: PropagationUser = ignitionCluster;
	const trunkKinds: PropagationNodeKind[] = [
		'deep-listener',   // L7
		'deep-listener',   // L6
		'amplifier',       // L5 — slight movement
		'deep-listener',   // L4
		'deep-listener',   // L3
		'amplifier',       // L2 — a hint of momentum
		'deep-listener',   // L1
	];
	for (let i = 0; i < trunkKinds.length; i++) {
		const kind = trunkKinds[i];
		// Every other level gets a small dead-end sibling to break
		// the monotone single-child chain.
		const sibling = i % 2 === 1 ? dl([pl()]) : pl();
		trunk = makeNode(ctx, kind, { children: [trunk, sibling] });
	}

	const origin = makeNode(ctx, 'amplifier', {
		isOrigin: true,
		children: [trunk, dl([pl()])],
	});

	return {
		roots: [origin, buildSmallRoot(ctx)],
		hiddenRootUsers: [buildSmallRoot(ctx)],
	};
}

/* 14. Multi-Core Spread — origin with THREE successful-amplifier
   children at level 1, each leading into a deep subtree of
   DIFFERENT intensity (peak / strong / accelerating). Tests parallel
   reading of multiple competing trunks side-by-side. */
function buildMultiCoreSpread(ctx: BuilderCtx): ArchetypeResult {
	const sa = (children?: PropagationUser[]) =>
		makeNode(ctx, 'successful-amplifier', children ? { children } : {});
	const amp = (children?: PropagationUser[]) =>
		makeNode(ctx, 'amplifier', children ? { children } : {});
	const dl = (children?: PropagationUser[]) =>
		makeNode(ctx, 'deep-listener', children ? { children } : {});
	const pl = (children?: PropagationUser[]) =>
		makeNode(ctx, 'passive-listener', children ? { children } : {});
	const dead = () =>
		makeNode(ctx, 'passive-listener', { amplifications: 0 });

	// Core A: PEAK — 4 additional successes downstream, 7 levels.
	const coreA = sa([
		sa([
			amp([
				sa([
					dl([pl()]),
					amp([dl(), pl()]),
				]),
				dl([pl()]),
			]),
			dl([dead()]),
		]),
		sa([
			amp([dl([pl()]), dl()]),
			pl(),
		]),
		amp([dl(), dead()]),
	]);

	// Core B: STRONG — 2 additional successes, 7 levels.
	const coreB = sa([
		sa([
			amp([
				dl([
					amp([dl([pl()]), pl()]),
					pl(),
				]),
			]),
			dl([pl()]),
		]),
		amp([
			dl([amp([pl()]), pl()]),
			dl(),
		]),
		pl(),
	]);

	// Core C: ACCELERATING — 0 additional successes (just itself), 8 levels.
	const coreC = sa([
		amp([
			dl([
				amp([
					dl([
						amp([dl([pl()]), pl()]),
						pl(),
					]),
				]),
				dl(),
			]),
		]),
		dl([pl()]),
	]);

	const origin = makeNode(ctx, 'successful-amplifier', {
		isOrigin: true,
		children: [coreA, coreB, coreC],
	});

	return {
		roots: [origin, buildSmallRoot(ctx)],
		hiddenRootUsers: [buildSmallRoot(ctx)],
	};
}

/* ─────────────── Visual-language validation archetypes ───────────────

   The three archetypes below were added to validate the conduit
   colour gradient (cool→warm) and the trunk-accumulation rule.
   They guarantee non-origin Peak subtrees, mixed-state sibling
   fans, and a sprawling tree with all five states distributed
   throughout. See archetype notes below for the per-tree story. */

/* 15. Branch Spectrum — one origin with five immediate children,
   each engineered to classify as a different branch state
   (Peak / Strong / Accelerating / Alive / Dead) simultaneously.
   The trunk above each child therefore accumulates the max of
   all siblings below it: the rail above the leftmost (Peak)
   child should already read warm-amber at full intensity. */
function buildBranchSpectrum(ctx: BuilderCtx): ArchetypeResult {
	const sa  = (children?: PropagationUser[]) =>
		makeNode(ctx, 'successful-amplifier', children ? { children } : {});
	const amp = (children?: PropagationUser[]) =>
		makeNode(ctx, 'amplifier', children ? { children } : {});
	const dl  = (children?: PropagationUser[]) =>
		makeNode(ctx, 'deep-listener', children ? { children } : {});
	const pl  = (children?: PropagationUser[]) =>
		makeNode(ctx, 'passive-listener', children ? { children } : {});
	const dead = () =>
		makeNode(ctx, 'passive-listener', { amplifications: 0 });

	const origin = makeNode(ctx, 'successful-amplifier', {
		isOrigin: true,
		children: [
			/* PEAK child — subtree holds 4 successful amplifiers
			   spread across two parallel sub-branches. */
			amp([
				sa([
					sa([dl(), pl()]),
					sa([dl([pl()])]),
				]),
				sa([dl([amp([pl()])]), pl()]),
			]),
			/* STRONG child — 2 successes scattered through a
			   modestly branching subtree. */
			amp([
				sa([dl([pl()]), pl()]),
				sa([dl(), amp([pl()])]),
				dl([pl()]),
			]),
			/* ACCELERATING child — 1 success deeper down. */
			amp([
				dl([
					amp([
						sa([dl([pl()]), pl()]),
					]),
					dl([pl()]),
				]),
				dl([pl()]),
			]),
			/* ALIVE child — amps + listeners but zero successes. */
			amp([
				dl([
					amp([dl(), pl()]),
					dl([pl()]),
				]),
				dl([pl()]),
				pl(),
			]),
			/* DEAD child — passive endpoint. */
			pl([dead(), dead()]),
		],
	});

	return {
		roots: [origin, buildSmallRoot(ctx)],
		hiddenRootUsers: [buildSmallRoot(ctx)],
	};
}

/* 16. Nested Peaks — designed to guarantee NON-ORIGIN Peak
   subtrees at multiple depths. The origin is Peak (cumulative);
   AND several immediate children's own subtrees independently
   hold 4+ successes each, so they each render with Peak rail
   colour + Peak particle character even though they're not the
   origin. Demonstrates that Peak can show up at depth, not only
   as the root classification. */
function buildNestedPeaks(ctx: BuilderCtx): ArchetypeResult {
	const sa  = (children?: PropagationUser[]) =>
		makeNode(ctx, 'successful-amplifier', children ? { children } : {});
	const amp = (children?: PropagationUser[]) =>
		makeNode(ctx, 'amplifier', children ? { children } : {});
	const dl  = (children?: PropagationUser[]) =>
		makeNode(ctx, 'deep-listener', children ? { children } : {});
	const pl  = (children?: PropagationUser[]) =>
		makeNode(ctx, 'passive-listener', children ? { children } : {});
	const dead = () =>
		makeNode(ctx, 'passive-listener', { amplifications: 0 });

	/* A "peak pocket" — a node whose own subtree contains 4
	   successes, so it classifies as Peak regardless of context. */
	const peakPocket = (): PropagationUser =>
		sa([                                  // self = 1 success
			sa([dl([pl()])]),                  // +1
			sa([dl()]),                        // +1
			sa([dl([amp([pl()])])]),           // +1
		]);

	/* A peak pocket nested deeper inside an amplifier shell so
	   the visible "Peak" sits at depth ≥ 2. */
	const deepPeakPocket = (extraDepth: number): PropagationUser => {
		let core: PropagationUser = peakPocket();
		for (let i = 0; i < extraDepth; i++) {
			core = (i % 2 === 0) ? amp([core, pl()]) : dl([core]);
		}
		return core;
	};

	const origin = makeNode(ctx, 'successful-amplifier', {
		isOrigin: true,
		children: [
			/* Two immediate children whose OWN subtrees are Peak. */
			amp([peakPocket()]),                   // depth-1 Peak
			amp([peakPocket()]),                   // depth-1 Peak
			/* A child whose Peak pocket sits deeper inside. */
			amp([
				dl([
					deepPeakPocket(2),               // Peak appears at depth ~4
				]),
				dl([pl()]),
			]),
			/* An alive sibling for contrast — quiet pocket among
			   the hot ones. */
			amp([
				dl([dl([pl()])]),
				dl([pl()]),
			]),
			/* A dead leaf for full-spectrum context. */
			pl([dead()]),
		],
	});

	return {
		roots: [origin, buildSmallRoot(ctx)],
		hiddenRootUsers: [buildSmallRoot(ctx)],
	};
}

/* 17. Monster Tree — a single sprawling lineage of 100+ visible
   nodes, 10+ levels deep, with multiple internal Peak / Strong /
   Accelerating / Alive / Dead pockets distributed throughout. The
   intent is a deep-scroll surface to evaluate whether the conduit
   visual language alone (rail colour, particle character, trunk
   accumulation) can communicate branch state without relying on
   labels. */
function buildMonsterTree(ctx: BuilderCtx): ArchetypeResult {
	/* The monster uses the acceleration-model `branchState` field on
	   every node to express non-monotonic state patterns: branches
	   that heat up as you descend, cool tails that re-ignite, peak
	   pockets nested inside alive ancestors, dead leaves embedded
	   in surging clusters, etc. Topology (the `kind` field — passive
	   / deep / amplifier / successful-amplifier) is untouched and
	   still drives node-role rendering exactly as before. */
	const node = (
		kind: PropagationNodeKind,
		state: BranchActivityState,
		children: PropagationUser[] = [],
	): PropagationUser =>
		makeNode(ctx, kind, { branchState: state, children });

	/* Short reusable subtree builders, each producing a leaf or small
	   chain with explicit per-node state. */
	const deadLeaf  = (): PropagationUser => node('passive-listener', 'dead');
	const aliveLeaf = (): PropagationUser => node('passive-listener', 'alive');
	const accelLeaf = (): PropagationUser => node('amplifier', 'accelerating');
	const strongLeaf = (): PropagationUser => node('amplifier', 'strong-accelerating');
	const peakLeaf   = (): PropagationUser => node('successful-amplifier', 'peak-accelerating');

	/* ── Five branches with deliberately varied state trajectories ── */

	/* BRANCH A — ASCENDING HOTNESS down a single lineage:
	   Alive → Accel → Strong → Peak → Strong → Alive → Dead.
	   The trunk WARMS as you descend through several layers, then
	   cools back down — the inverse of the cumulative model. */
	const branchA = node('amplifier', 'alive', [
		node('amplifier', 'accelerating', [
			node('successful-amplifier', 'strong-accelerating', [
				node('amplifier', 'peak-accelerating', [
					node('successful-amplifier', 'peak-accelerating', [
						node('amplifier', 'strong-accelerating', [
							node('deep-listener', 'accelerating', [
								node('deep-listener', 'alive', [
									node('passive-listener', 'alive', [
										deadLeaf(),
									]),
								]),
							]),
						]),
					]),
					node('deep-listener', 'alive', [aliveLeaf()]),
				]),
				node('amplifier', 'accelerating', [aliveLeaf(), deadLeaf()]),
			]),
			node('deep-listener', 'alive', [aliveLeaf()]),
		]),
		node('deep-listener', 'dead', [deadLeaf()]),
	]);

	/* BRANCH B — PHOENIX: Peak → Alive → Peak.
	   A peak parent with an alive intermediate, then a deep peak
	   pocket again. Re-ignition pattern. */
	const branchB = node('successful-amplifier', 'peak-accelerating', [
		node('amplifier', 'alive', [
			node('deep-listener', 'alive', [
				node('amplifier', 'peak-accelerating', [
					node('successful-amplifier', 'peak-accelerating', [
						strongLeaf(),
						node('deep-listener', 'alive', [aliveLeaf()]),
					]),
					strongLeaf(),
				]),
				aliveLeaf(),
			]),
			deadLeaf(),
		]),
		node('amplifier', 'strong-accelerating', [
			peakLeaf(),
			node('deep-listener', 'accelerating', [aliveLeaf()]),
		]),
	]);

	/* BRANCH C — RE-IGNITION through dormancy: Alive → Dead → Accel.
	   A live branch goes archaeologically silent, then a single
	   descendant re-ignites cleanly. */
	const branchC = node('amplifier', 'alive', [
		node('deep-listener', 'alive', [
			node('passive-listener', 'dead', [
				node('passive-listener', 'dead', [
					node('amplifier', 'accelerating', [
						node('successful-amplifier', 'strong-accelerating', [
							peakLeaf(),
							aliveLeaf(),
						]),
						accelLeaf(),
					]),
				]),
			]),
		]),
		node('deep-listener', 'alive', [aliveLeaf(), deadLeaf()]),
		deadLeaf(),
	]);

	/* BRANCH D — wide alive sprawl with a single deep peak surprise.
	   Tests Peak appearing inside an otherwise-quiet sub-cascade. */
	const branchD = node('amplifier', 'alive', [
		node('deep-listener', 'alive', [
			node('amplifier', 'alive', [
				node('deep-listener', 'alive', [
					node('amplifier', 'peak-accelerating', [
						node('successful-amplifier', 'peak-accelerating', [
							strongLeaf(),
							aliveLeaf(),
						]),
						peakLeaf(),
					]),
					aliveLeaf(),
				]),
				aliveLeaf(),
				deadLeaf(),
			]),
			node('deep-listener', 'alive', [aliveLeaf()]),
		]),
		node('amplifier', 'alive', [aliveLeaf(), aliveLeaf()]),
		deadLeaf(),
	]);

	/* BRANCH E — cooling chain Peak → Strong → Accel → Alive → Dead
	   (the cumulative-style descent), kept as a reference. */
	const branchE = node('successful-amplifier', 'peak-accelerating', [
		node('amplifier', 'strong-accelerating', [
			node('amplifier', 'accelerating', [
				node('deep-listener', 'alive', [
					node('passive-listener', 'dead', [deadLeaf()]),
					aliveLeaf(),
				]),
				aliveLeaf(),
			]),
			node('deep-listener', 'alive', [aliveLeaf()]),
		]),
		node('amplifier', 'strong-accelerating', [
			peakLeaf(),
			accelLeaf(),
		]),
		deadLeaf(),
	]);

	/* Origin: PEAK with all five branches as children. */
	const origin = makeNode(ctx, 'successful-amplifier', {
		isOrigin: true,
		branchState: 'peak-accelerating',
		children: [branchA, branchB, branchC, branchD, branchE],
		hiddenChildren: randInt(ctx.rand, 6, 10),
		hiddenChildrenLabel: 'Quieter onward listeners',
		hiddenChildrenDescription:
			'A long tail of quieter scouts that received the signal but produced no further detectable amplification.',
	});

	return {
		roots: [origin, buildSmallRoot(ctx)],
		hiddenRootUsers: [buildSmallRoot(ctx), buildSmallRoot(ctx)],
	};
}

/* 18. Rising Tide — single descending lineage with EVERY transition
   stepping HOTTER: Alive → Accel → Strong → Peak. Demonstrates the
   acceleration model's key property: state need not cool with depth. */
function buildRisingTide(ctx: BuilderCtx): ArchetypeResult {
	const node = (
		kind: PropagationNodeKind,
		state: BranchActivityState,
		children: PropagationUser[] = [],
	): PropagationUser => makeNode(ctx, kind, { branchState: state, children });

	const origin = makeNode(ctx, 'amplifier', {
		isOrigin: true,
		branchState: 'alive',
		children: [
			node('amplifier', 'accelerating', [
				node('successful-amplifier', 'strong-accelerating', [
					node('amplifier', 'peak-accelerating', [
						node('successful-amplifier', 'peak-accelerating', [
							node('deep-listener', 'strong-accelerating', [
								node('passive-listener', 'alive'),
							]),
							node('amplifier', 'accelerating', [
								node('passive-listener', 'alive'),
							]),
						]),
					]),
					node('deep-listener', 'alive', [
						node('passive-listener', 'alive'),
					]),
				]),
				node('deep-listener', 'alive', [
					node('passive-listener', 'dead'),
				]),
			]),
			node('deep-listener', 'alive', [
				node('passive-listener', 'dead'),
			]),
		],
	});

	return {
		roots: [origin, buildSmallRoot(ctx)],
		hiddenRootUsers: [buildSmallRoot(ctx)],
	};
}

/* 19. Phoenix — Peak origin cools to Alive, then re-ignites to Peak
   deeper in the lineage. Demonstrates the model's return-transition
   capability within a single line. */
function buildPhoenix(ctx: BuilderCtx): ArchetypeResult {
	const node = (
		kind: PropagationNodeKind,
		state: BranchActivityState,
		children: PropagationUser[] = [],
	): PropagationUser => makeNode(ctx, kind, { branchState: state, children });

	const origin = makeNode(ctx, 'successful-amplifier', {
		isOrigin: true,
		branchState: 'peak-accelerating',
		children: [
			node('amplifier', 'alive', [
				node('deep-listener', 'alive', [
					node('amplifier', 'alive', [
						node('successful-amplifier', 'peak-accelerating', [
							node('amplifier', 'strong-accelerating', [
								node('successful-amplifier', 'peak-accelerating', [
									node('deep-listener', 'alive'),
									node('amplifier', 'accelerating'),
								]),
								node('deep-listener', 'alive'),
							]),
							node('deep-listener', 'strong-accelerating', [
								node('passive-listener', 'alive'),
							]),
						]),
						node('passive-listener', 'dead'),
					]),
					node('passive-listener', 'alive'),
				]),
			]),
			node('amplifier', 'strong-accelerating', [
				node('deep-listener', 'alive'),
				node('passive-listener', 'dead'),
			]),
		],
	});

	return {
		roots: [origin, buildSmallRoot(ctx)],
		hiddenRootUsers: [buildSmallRoot(ctx)],
	};
}

/* 20. Re-ignition — Alive → Dead → Accelerating chain. A live
   branch goes archaeologically silent then a single descendant
   re-opens fresh momentum, demonstrating the system's ability to
   express discontinuous re-entry. */
function buildReignition(ctx: BuilderCtx): ArchetypeResult {
	const node = (
		kind: PropagationNodeKind,
		state: BranchActivityState,
		children: PropagationUser[] = [],
	): PropagationUser => makeNode(ctx, kind, { branchState: state, children });

	const origin = makeNode(ctx, 'amplifier', {
		isOrigin: true,
		branchState: 'alive',
		children: [
			node('deep-listener', 'alive', [
				node('passive-listener', 'dead', [
					node('passive-listener', 'dead', [
						node('amplifier', 'accelerating', [
							node('successful-amplifier', 'strong-accelerating', [
								node('amplifier', 'accelerating', [
									node('deep-listener', 'alive'),
								]),
								node('deep-listener', 'alive'),
							]),
							node('deep-listener', 'alive'),
						]),
					]),
				]),
			]),
			node('deep-listener', 'alive', [
				node('passive-listener', 'dead'),
				node('passive-listener', 'alive'),
			]),
		],
	});

	return {
		roots: [origin, buildSmallRoot(ctx)],
		hiddenRootUsers: [buildSmallRoot(ctx)],
	};
}

/* 21. Conduit-compare — DEBUG SURFACE.

   Three "comparison sections" stacked vertically: Peak at the top,
   Strong in the middle, Accelerating at the bottom. Inside each
   section, a TALL alive dummy chain sits above a state-specific
   TARGET sibling. Because siblings sort by branchSize (descending)
   within the same kind-rank, the dummy ends up above the target —
   and the target's top-rail therefore extends as a LONG vertical
   conduit instead of a short elbow.

   Layout under the origin:

     PeakSection   (container, alive, 13 nodes total — sorts 1st)
       ├─ tallDummy  (alive chain, 8 deep)
       └─ peakTarget (long peak rail above, 17 peak particles + white)

     StrongSection (container, alive, 11 nodes — sorts 2nd)
       ├─ tallDummy  (alive chain, 6 deep)
       └─ strongTarget (long strong rail above, 13 amber particles)

     AccSection    (container, alive, 9 nodes — sorts 3rd)
       ├─ tallDummy  (alive chain, 4 deep)
       └─ accTarget  (long accel rail above, 3-4 amber particles)

   All targets and dummies share the `successful-amplifier` node-kind
   (rank 0) so sort tiebreaks by branchSize — the dummy's deeper
   chain always sorts ABOVE the target. Section containers use
   the same kind so they sort in descending order of total
   subtree size: peak(13) > strong(11) > acc(9).

   No `buildSmallRoot` clutter — this is purely a calibration view. */
function buildConduitCompare(ctx: BuilderCtx): ArchetypeResult {
	const node = (
		kind: PropagationNodeKind,
		state: BranchActivityState,
		children: PropagationUser[] = [],
	): PropagationUser => makeNode(ctx, kind, { branchState: state, children });

	/* tallDummy — a successful-amplifier whose subtree is a chain of
	   N alive deep-listeners ending in a passive-listener. The chain
	   length governs the wrapper height, which governs how long the
	   target sibling's rail becomes. The top must be sa (rank 0) so
	   sort tiebreaks against the target by branchSize. */
	const tallDummy = (chainDepth: number): PropagationUser => {
		let chain: PropagationUser = node('passive-listener', 'alive');
		for (let i = 0; i < chainDepth - 1; i++) {
			chain = node('deep-listener', 'alive', [chain]);
		}
		return node('successful-amplifier', 'alive', [chain]);
	};

	const peakTarget = (): PropagationUser =>
		node('successful-amplifier', 'peak-accelerating', [
			node('amplifier', 'peak-accelerating', [
				node('passive-listener', 'alive'),
			]),
		]);

	const strongTarget = (): PropagationUser =>
		node('successful-amplifier', 'strong-accelerating', [
			node('amplifier', 'strong-accelerating', [
				node('passive-listener', 'alive'),
			]),
		]);

	const accTarget = (): PropagationUser =>
		node('successful-amplifier', 'accelerating', [
			node('amplifier', 'accelerating', [
				node('passive-listener', 'alive'),
			]),
		]);

	/* section — alive container holding the [tallDummy, target] pair.
	   The container itself is successful-amplifier so sections sort
	   by branchSize under the origin. */
	const section = (chainDepth: number, target: PropagationUser): PropagationUser =>
		node('successful-amplifier', 'alive', [
			tallDummy(chainDepth),
			target,
		]);

	const peakSection   = section(8, peakTarget());
	const strongSection = section(6, strongTarget());
	const accSection    = section(4, accTarget());

	const origin = makeNode(ctx, 'successful-amplifier', {
		isOrigin: true,
		branchState: 'alive',
		children: [peakSection, strongSection, accSection],
	});

	return {
		roots: [origin],
		hiddenRootUsers: [],
	};
}

/* 22. Dan-deep-lineage — DEBUG SURFACE.

   Places MARCO at depth 5 in the forest. When the user amplifies on
   an item with `sourceScoutId: 'marco'` (e.g. /items/edge-of-field),
   the route insertion logic adds Dan as Marco's child — putting Dan
   at depth 6 and producing a 7-node ancestor chain:

     ORIGIN → ancestor1 → ancestor2 → ancestor3 → ancestor4 → MARCO → DAN

   Useful for testing the personal-lineage-reveal overlay on a chain
   longer than the typical 2-node case (sourceScout → Dan).

   Marco is created with id='marco' + name/avatar/character matching
   KNOWN_SCOUTS['marco'] so `rebrandRootAs` finds him via `findInNode`
   and skips the root rebrand. */
function buildDanDeepLineage(ctx: BuilderCtx): ArchetypeResult {
	const node = (
		kind: PropagationNodeKind,
		state: BranchActivityState,
		children: PropagationUser[] = [],
	): PropagationUser => makeNode(ctx, kind, { branchState: state, children });

	/* Marco at depth 5 with explicit identity matching KNOWN_SCOUTS. */
	const marcoDeep = makeNode(ctx, 'amplifier', {
		id: 'marco',
		name: 'Marco',
		avatar: dicebear('MarcoAmb'),
		character: 'Underground connector',
		branchState: 'accelerating',
		children: [
			node('deep-listener', 'alive', [node('passive-listener', 'alive')]),
			node('passive-listener', 'alive'),
		],
	});

	/* Five ancestor layers above Marco, alternating kind so the chain
	   has visible variation. Each layer also gets a sibling so the
	   conduit accumulation rule has something to render. */
	const ancestor4 = node('amplifier', 'accelerating', [
		marcoDeep,
		node('deep-listener', 'alive', [node('passive-listener', 'alive')]),
	]);
	const ancestor3 = node('deep-listener', 'alive', [
		ancestor4,
		node('passive-listener', 'alive'),
	]);
	const ancestor2 = node('amplifier', 'accelerating', [
		ancestor3,
		node('deep-listener', 'alive'),
	]);
	const ancestor1 = node('deep-listener', 'alive', [
		ancestor2,
		node('passive-listener', 'alive'),
	]);

	const origin = makeNode(ctx, 'amplifier', {
		isOrigin: true,
		branchState: 'alive',
		children: [
			ancestor1,
			node('deep-listener', 'alive', [node('passive-listener', 'alive')]),
			node('amplifier', 'alive'),
		],
	});

	return {
		roots: [origin],
		hiddenRootUsers: [],
	};
}

const ARCHETYPES = [
	{ name: 'hub-dominant',         build: buildHubDominant         },
	{ name: 'fragmented',           build: buildFragmented          },
	{ name: 'late-bloomer',         build: buildLateBloomer         },
	{ name: 'deep-chain',           build: buildDeepChain           },
	{ name: 'bursty',               build: buildBursty              },
	{ name: 'sparse',               build: buildSparse              },
	{ name: 'showcase',             build: buildShowcase            },
	{ name: 'strong-spotlight',     build: buildStrongSpotlight     },
	{ name: 'viral-explosion',      build: buildViralExplosion      },
	{ name: 'slow-burn',            build: buildSlowBurn            },
	{ name: 'fragmented-community', build: buildFragmentedCommunity },
	{ name: 'false-start',          build: buildFalseStart          },
	{ name: 'resurrection',         build: buildResurrection        },
	{ name: 'multi-core-spread',    build: buildMultiCoreSpread     },
	{ name: 'branch-spectrum',      build: buildBranchSpectrum      },
	{ name: 'nested-peaks',         build: buildNestedPeaks         },
	{ name: 'monster-tree',         build: buildMonsterTree         },
	{ name: 'rising-tide',          build: buildRisingTide          },
	{ name: 'phoenix',              build: buildPhoenix             },
	{ name: 'reignition',           build: buildReignition          },
	{ name: 'conduit-compare',      build: buildConduitCompare      },
	{ name: 'dan-deep-lineage',     build: buildDanDeepLineage      },
] as const;

/* Items whose forest is pinned to a specific archetype for design-system
   testing. All other items rotate through the procedural archetypes
   below via their id's hash. */
const PINNED_ARCHETYPES: Record<string, string> = {
	'frozen-sun':         'showcase',             /* all five branch states side by side */
	'iron-coast':         'strong-spotlight',     /* dedicated strong-accelerating test */
	'pale-verge':         'strong-spotlight',     /* second strong test (different forest) */
	/* Stress-test pins. Each pinned id navigates to a tree designed
	   to expose a specific weakness; visit them when evaluating
	   deep-scrolling, state-transition rendering, or parallel trunks. */
	'night-forest':       'viral-explosion',      /* 12-level dominant trunk */
	'tape-weather':       'slow-burn',            /* 11-level smooth state evolution */
	'cold-dispatch':      'fragmented-community', /* 5 origins, one per state */
	'burial-light':       'false-start',          /* peak top, dead/alive tail */
	'cinder-plain':       'resurrection',         /* quiet trunk, deep ignition */
	'wolves-under-glass': 'multi-core-spread',    /* 3 competing trunks */
	/* Visual-language validation pins. */
	'slow-satellite':     'branch-spectrum',      /* 5-sibling all-states fan */
	'glass-signal':       'nested-peaks',         /* non-origin Peak subtrees */
	'iron-weather':       'monster-tree',         /* 100+ node sprawling stress tree */
	/* Acceleration-model patterns — explicit branchState on each
	   node so the trees express non-monotonic transitions that the
	   cumulative model can't produce. */
	'minor-current':      'rising-tide',          /* Alive → Accel → Strong → Peak descending */
	'hollow-ritual':      'phoenix',              /* Peak → Alive → Peak re-ignition */
	'static-bloom':       'reignition',           /* Alive → Dead → Accel after dormancy */
	/* Particle-traffic calibration surface — three long vertical
	   conduits, one each for Peak / Strong / Accel, stacked top-to-
	   bottom. Visit /items/soft-collapse to compare densities. */
	'soft-collapse':      'conduit-compare',
	/* Long-lineage calibration — Marco placed at depth 5, so
	   amplifying inserts Dan at depth 6. Visit /items/edge-of-field
	   (sourceScoutId = 'marco') to test the personal-lineage overlay
	   on a 7-node ORIGIN → … → MARCO → DAN chain. */
	'edge-of-field':      'dan-deep-lineage',
};

/* Archetype names that should NEVER appear via random rotation —
   they're reserved for explicit pinning above. Keeps procedural items
   feeling natural and prevents the showcase/test surfaces from
   accidentally appearing under arbitrary item ids. */
const NON_ROTATING_ARCHETYPES = new Set(Object.values(PINNED_ARCHETYPES));
const ROTATION_ARCHETYPES = ARCHETYPES.filter(
	(a) => !NON_ROTATING_ARCHETYPES.has(a.name),
);

/* ─────────────── Source-scout injection ─────────────── */

/* Known scouts that may appear as the route source. The forest must
   include the one matching `sourceScoutId` so the route insertion
   (Dan's preview / amp node) can find them. */
const KNOWN_SCOUTS: Record<string, { name: string; avatar: string; character: string }> = {
	marco: { name: 'Marco', avatar: dicebear('MarcoAmb'), character: 'Underground connector' },
	alice: { name: 'Alice', avatar: dicebear('AliceSignal'), character: 'Deep scene explorer' },
	yuki:  { name: 'Yuki',  avatar: dicebear('YukiQuiet'),   character: 'Cross-scene bridge'   },
	dan:   { name: 'Dan',   avatar: dicebear('DanOuter'),    character: 'Early signal hunter'  },
};

/* Find a "promotable" origin in the forest and rebrand it as the known
   scout `id`. We prefer the most prominent root (largest visible branch)
   so the route's source scout reads as an important node, but fall back
   to the first root if no clear winner. */
function rebrandRootAs(roots: PropagationUser[], id: string): PropagationUser[] {
	const known = KNOWN_SCOUTS[id];
	if (!known) return roots;
	if (roots.length === 0) return roots;
	// Already present anywhere? Then no rebrand needed.
	for (const r of roots) {
		if (findInNode(r, id)) return roots;
	}
	// Prefer a root with the largest visible subtree (or first by default).
	let target = roots[0];
	let bestCount = countNodes(target);
	for (const r of roots.slice(1)) {
		const c = countNodes(r);
		if (c > bestCount) { target = r; bestCount = c; }
	}
	target.id = id;
	target.name = known.name;
	target.avatar = known.avatar;
	target.character = known.character;
	return roots;
}

function findInNode(node: PropagationUser, id: string): PropagationUser | null {
	if (node.id === id) return node;
	for (const c of node.children) {
		const hit = findInNode(c, id);
		if (hit) return hit;
	}
	return null;
}

function countNodes(node: PropagationUser): number {
	let n = 1;
	for (const c of node.children) n += countNodes(c);
	return n;
}

/* Compute branchSize for every node — used by sortNodesByPropagation. */
function annotateBranchSizes(node: PropagationUser): number {
	let total = 0;
	for (const c of node.children) total += 1 + annotateBranchSizes(c);
	node.branchSize = total;
	return total;
}

/* ─────────────── Forest assembly ─────────────── */

const ARCHETYPE_NOTES: Record<string, { summary: string; crossingNote: string; originNote: string }> = {
	'hub-dominant': {
		summary: 'A dominant hub propagator carrying the signal across adjacent listening circles, with quieter origins persisting at the edges.',
		crossingNote: 'One central scout pulled the signal forward; smaller origins surface independently.',
		originNote: 'First surfaced through a dominant ambient connector.',
	},
	'fragmented': {
		summary: 'Many independent origins, each spreading quietly — no single propagation center has emerged.',
		crossingNote: 'Fragmented surfacing across multiple small listening circles.',
		originNote: 'Multiple unrelated origins surfaced the signal in parallel.',
	},
	'late-bloomer': {
		summary: 'A long quiet chain that finally opened into broader propagation — the signal sat with listeners before it moved.',
		crossingNote: 'Patient resonance gave way to sudden spread several levels downstream.',
		originNote: 'Surfaced quietly at first; bloomed later through a hub deep in the chain.',
	},
	'deep-chain': {
		summary: 'A narrow, deep chain of resonant listeners — the signal traveled slowly through patient ears.',
		crossingNote: 'Mostly internal resonance; little outward broadcast.',
		originNote: 'Surfaced through a single quiet origin and walked deep into adjacent listeners.',
	},
	'bursty': {
		summary: 'An amplifier turned a quiet origin into a wide cluster of onward listeners — bursty propagation through a single scene.',
		crossingNote: 'Tight cluster spread under a single propagator.',
		originNote: 'Surfaced quietly, then opened into a dense local cluster.',
	},
	'showcase': {
		summary: 'A diagnostic forest spanning the full energy spectrum — runaway propagation, intensifying pull, emerging momentum, calm circulation, and an archaeological remnant — for side-by-side visual comparison.',
		crossingNote: 'Five origins, five distinct propagation temperatures within one ecosystem.',
		originNote: 'Hand-tuned diagnostic forest showcasing every branch-activity tier.',
	},
	'strong-spotlight': {
		summary: 'A strong-accelerating propagator dominating a single scene, with a quieter circulating side branch and one archaeological remnant for visual contrast.',
		crossingNote: 'Two successful amplifiers in the main subtree create sustained pressure without runaway ignition.',
		originNote: 'Surfaced through a single intensifying connector whose downstream amplifies into a heated cluster.',
	},
	'sparse': {
		summary: 'Quiet across the board — a few origins surfaced the signal but it has not yet propagated.',
		crossingNote: 'Sparse — almost no onward movement.',
		originNote: 'A handful of quiet origins surfaced the signal independently.',
	},
	'viral-explosion': {
		summary: 'One scout opened a runaway chain that propagated through twelve listening layers — most of the signal lives inside a single dominant tributary.',
		crossingNote: 'Dominant trunk overshadows every adjacent origin; the signal moved through one long lineage.',
		originNote: 'Surfaced through a hub propagator whose immediate forward share kept igniting downstream.',
	},
	'slow-burn': {
		summary: 'Steady eleven-level propagation — each generation of scouts passed the signal to two or three more, with successful amplifications sprinkled across every other layer.',
		crossingNote: 'Consistent forward motion at every depth; the heat tapers gently rather than collapsing.',
		originNote: 'Surfaced through a patient connector whose forward sharing kept compounding generation after generation.',
	},
	'fragmented-community': {
		summary: 'Five independent origins surfaced the signal in parallel, each carrying their own local subculture forward at a different intensity — from runaway pull to archaeological silence.',
		crossingNote: 'Five separate listening pockets reached the signal independently; their downstream temperatures span the full spectrum.',
		originNote: 'Multiple unrelated origins surfaced the signal in parallel through unrelated scenes.',
	},
	'false-start': {
		summary: 'A loud opening that didn\'t hold — the origin opened with four immediate successful amplifications, then every downstream branch quietly settled without further movement.',
		crossingNote: 'Early ignition gave way to long quiet tails; momentum was front-loaded, not sustained.',
		originNote: 'Surfaced through a hub that initially propagated widely before adjacent scenes absorbed it without further amplification.',
	},
	'resurrection': {
		summary: 'A long quiet trunk that finally bloomed eight layers in — for most of its lineage the signal was held privately, before opening into a cluster of forward-sharers at depth.',
		crossingNote: 'The signal was passed silently across several quiet generations before a late ignition reopened it.',
		originNote: 'Surfaced through a patient origin whose downstream remained internal for many generations before suddenly catching.',
	},
	'multi-core-spread': {
		summary: 'Three competing onward-paths under a single origin — each branch propagates at a different intensity, producing parallel trunks of distinctly different heat side by side.',
		crossingNote: 'Three concurrent successful amplifiers split the signal into parallel trunks with markedly different downstream pull.',
		originNote: 'Surfaced through a hub whose immediate forward share split into three competing lineages.',
	},
	'branch-spectrum': {
		summary: 'A single origin opening into five immediate sub-branches, each propagating at a distinctly different intensity — runaway pull next to quiet circulation next to archaeological silence — for side-by-side comparison of the full state spectrum.',
		crossingNote: 'Five sibling sub-branches simultaneously occupying every branch-activity tier under a single propagator.',
		originNote: 'Surfaced through a hub whose immediate forward share fanned out across the full energy spectrum.',
	},
	'nested-peaks': {
		summary: 'Several immediate downstream amplifiers each opened their own independently runaway sub-cascade — multiple Peak-tier pockets distributed at depth, not only at the origin.',
		crossingNote: 'Multiple non-origin successful-amplifier pockets, each carrying enough downstream amplification to register as Peak in its own right.',
		originNote: 'Surfaced through a hub whose forward share repeatedly opened into further runaway pockets several layers down.',
	},
	'monster-tree': {
		summary: 'A sprawling hundred-plus-node propagation network spanning ten generations, with multiple internal ignition pockets, quiet alive regions, and archaeological dead-ends distributed throughout — the full visual language under load.',
		crossingNote: 'Sustained downstream amplification across many generations and many parallel sub-branches; the signal reached deeply varied listening pockets.',
		originNote: 'Surfaced through a hub whose forward share opened into a long, branching, internally varied propagation network.',
	},
	'rising-tide': {
		summary: 'A quiet origin whose lineage accelerates as it descends — each generation more energised than the last, momentum compounding through several layers before tapering.',
		crossingNote: 'Each successive generation amplified more strongly than the last, producing a rare ascending heat profile down a single lineage.',
		originNote: 'Surfaced quietly through a single scout whose onward chain unexpectedly gathered momentum at every step.',
	},
	'phoenix': {
		summary: 'A peak propagator whose immediate downstream cooled into quiet circulation, then re-ignited several generations later into a second peak — the signal caught fire twice, once at the origin and once deep inside.',
		crossingNote: 'Strong opening surge cooled into a quiet middle, then a deep descendant cluster re-opened with renewed pull.',
		originNote: 'Surfaced through a high-pull hub whose downstream went quiet before catching fire again several layers deeper.',
	},
	'reignition': {
		summary: 'A live branch that fell into archaeological silence for several generations before a single descendant re-opened the signal with fresh momentum — a discontinuous re-entry pattern.',
		crossingNote: 'Quiet circulation collapsed into dormancy before a deep descendant re-opened the propagation cleanly.',
		originNote: 'Surfaced quietly, lost to dormancy in the middle, then re-emerged through an unexpected late scout.',
	},
	'conduit-compare': {
		summary: 'Debug surface — three long vertical conduits stacked top-to-bottom (Peak, Strong, Accelerating) for side-by-side particle-traffic calibration.',
		crossingNote: 'Calibration tree — three target sub-branches, each preceded by a tall alive dummy sibling to stretch the rail.',
		originNote: 'A calibration surface for visually comparing particle density across Peak, Strong, and Accelerating long conduits.',
	},
	'dan-deep-lineage': {
		summary: 'Debug surface — Marco is placed at depth 5, so amplifying inserts Dan at depth 6 and produces a 7-node ORIGIN → … → MARCO → DAN ancestor chain for testing the lineage-reveal overlay on a long path.',
		crossingNote: 'Calibration tree — a deliberately deep ancestor chain ending in Marco, with route insertion placing Dan a further level below.',
		originNote: 'A calibration surface for visually verifying the personal-lineage overlay on a chain longer than the typical 2-node sourceScout → Dan case.',
	},
};

/**
 * Returns a propagation forest for the given item. Forest shape is
 * procedurally generated from the item id so each item page feels
 * distinct, but always deterministic — the same id returns the same
 * forest.
 *
 * `sourceScoutId` (when provided) names a known scout that the item's
 * route flows through; the generator rebrands one of the produced
 * origins to that scout so the route insertion (Dan's preview / amp
 * node) can find them. For items where Dan is genuinely the route
 * source, Dan is included as an origin.
 */
export function propagationForestFor(
	itemId: string,
	scouts: number,
	sourceScoutId?: string,
): PropagationForest {
	const seed = hashString(itemId);
	const rand = makeRng(seed);
	const ctx: BuilderCtx = { rand, usedIds: new Set(), usedNames: new Set() };

	/* A handful of item ids are pinned to design-system test surfaces
	   (see PINNED_ARCHETYPES above). All other items continue to rotate
	   through the procedural archetypes via their id's hash. */
	const pinnedName = PINNED_ARCHETYPES[itemId];
	const archetype = pinnedName
		? ARCHETYPES.find((a) => a.name === pinnedName)!
		: ROTATION_ARCHETYPES[seed % ROTATION_ARCHETYPES.length];
	const built = archetype.build(ctx);

	// Inject the route source scout into the forest if specified.
	if (sourceScoutId && KNOWN_SCOUTS[sourceScoutId]) {
		rebrandRootAs(built.roots, sourceScoutId);
	}

	// Compute branchSize across the whole forest.
	for (const r of built.roots) annotateBranchSizes(r);
	for (const r of built.hiddenRootUsers) annotateBranchSizes(r);

	const visibleNodeCount = built.roots.reduce((sum, r) => sum + countNodes(r), 0);
	const hiddenNodeCount = built.hiddenRootUsers.reduce((sum, r) => sum + countNodes(r), 0);
	const totalReach = visibleNodeCount + hiddenNodeCount;
	const independentOrigins = built.roots.length + built.hiddenRootUsers.length;
	const totalAmplifications = Math.max(
		Math.round(totalReach * 0.6) + scouts,
		8,
	);
	const weightedImpact = Math.max(28, Math.min(92, 28 + Math.round(totalReach * 1.4)));

	// Branch summaries — one entry per visible root.
	const branchSummaries: RootBranchSummary[] = built.roots.map((r) => ({
		rootId: r.id,
		label: `${r.name}'s branch — ${r.character.toLowerCase()}`,
		count: countNodes(r),
	}));

	const notes = ARCHETYPE_NOTES[archetype.name];
	const sceneList = pickN(rand, SCENES, randInt(rand, 3, 5));

	return {
		itemId,
		roots: built.roots,
		hiddenRootUsers: built.hiddenRootUsers,
		hiddenRoots: built.hiddenRootUsers.length,
		totalReach,
		independentOrigins,
		weightedImpact,
		totalAmplifications,
		summary: notes.summary,
		branchSummaries,
		scenes: sceneList,
		crossingNote: notes.crossingNote,
		originNote: notes.originNote,
	};
}

/**
 * Inspector preview target — what the right pane is currently describing.
 * Two surfaces a card can describe contextually: a specific user or a
 * collapsed cluster ("+N more") hanging off a parent user.
 */
export type PreviewTarget =
	| { kind: 'user'; user: PropagationUser }
	| { kind: 'cluster'; parent: PropagationUser; count: number; label: string; description?: string };

/**
 * Flat helper to find a user anywhere in a forest by id. Used by the inspector
 * when a user is selected from the tree.
 */
export function findUserInForest(forest: PropagationForest, userId: string): PropagationUser | null {
	function walk(user: PropagationUser): PropagationUser | null {
		if (user.id === userId) return user;
		for (const child of user.children) {
			const hit = walk(child);
			if (hit) return hit;
		}
		return null;
	}
	for (const root of forest.roots) {
		const hit = walk(root);
		if (hit) return hit;
	}
	return null;
}

/**
 * Returns the parent of a given user within the forest, or null if the user
 * is a root (or not found). The inspector uses this to display the "discovered
 * through X" line for downstream scouts.
 */
export function findParentInForest(forest: PropagationForest, userId: string): PropagationUser | null {
	function walk(user: PropagationUser): PropagationUser | null {
		for (const child of user.children) {
			if (child.id === userId) return user;
			const hit = walk(child);
			if (hit) return hit;
		}
		return null;
	}
	for (const root of forest.roots) {
		if (root.id === userId) return null;
		const hit = walk(root);
		if (hit) return hit;
	}
	return null;
}

/* ─────────────── Immutable forest transformers ─────────────── */

/** Returns a new forest with the given user removed wherever they appear. */
export function removeUserFromForest(forest: PropagationForest, userId: string): PropagationForest {
	function pruneChildren(user: PropagationUser): PropagationUser {
		return {
			...user,
			children: user.children
				.filter(c => c.id !== userId)
				.map(pruneChildren),
		};
	}
	return {
		...forest,
		roots: forest.roots
			.filter(r => r.id !== userId)
			.map(pruneChildren),
	};
}

/** Returns a new forest with the given decoration merged onto the user whose
 *  id matches. Useful for tagging the existing Dan node as `isCurrentUser`
 *  without changing his data. */
export function markUserInForest(
	forest: PropagationForest,
	userId: string,
	decoration: Partial<PropagationUser>,
): PropagationForest {
	function decorate(user: PropagationUser): PropagationUser {
		if (user.id === userId) {
			return { ...user, ...decoration };
		}
		return { ...user, children: user.children.map(decorate) };
	}
	return { ...forest, roots: forest.roots.map(decorate) };
}

/*
	Sibling ordering — propagation-strength order so strong nodes lead each
	sibling group. Preview nodes go to the END of the group so Dan's
	preview/amplify position stays stable visually.
*/
export function nodeKindRank(u: PropagationUser): number {
	if (u.isPreviewNode) return 999;
	switch (u.nodeKind) {
		case 'successful-amplifier': return 0;
		case 'amplifier':            return 1;
		case 'deep-listener':        return 2;
		case 'passive-listener':     return 3;
		default:                     return 4;
	}
}

export function sortNodesByPropagation(nodes: PropagationUser[]): PropagationUser[] {
	return [...nodes].sort((a, b) => {
		const r = nodeKindRank(a) - nodeKindRank(b);
		if (r !== 0) return r;
		return (b.branchSize ?? 0) - (a.branchSize ?? 0);
	});
}

/** Returns a new forest with `child` appended to the children of `parentId`. */
export function addChildToUserInForest(
	forest: PropagationForest,
	parentId: string,
	child: PropagationUser,
): PropagationForest {
	function walk(user: PropagationUser): PropagationUser {
		if (user.id === parentId) {
			return { ...user, children: [...user.children, child] };
		}
		return { ...user, children: user.children.map(walk) };
	}
	return { ...forest, roots: forest.roots.map(walk) };
}
