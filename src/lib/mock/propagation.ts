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
	'Mira', 'Tor', 'Liv', 'Niko', 'Aris', 'Hana', 'Iliana', 'Olek',
	'Selma', 'Vera', 'Magnus', 'Anita', 'Bo', 'Cilla', 'Dag', 'Emil',
	'Fia', 'Gunnar', 'Hilma', 'Ida', 'Jaakko', 'Karin', 'Lassi',
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

function makeNode(
	ctx: BuilderCtx,
	kind: PropagationNodeKind,
	opts: Partial<PropagationUser> = {},
): PropagationUser {
	const name = opts.name ?? uniqueName(ctx);
	const id = opts.id ?? uniqueId(ctx, name);
	const avatar = opts.avatar ?? dicebear(id + Math.floor(ctx.rand() * 1000));
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
		nodeKind: kind,
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

const ARCHETYPES = [
	{ name: 'hub-dominant',  build: buildHubDominant  },
	{ name: 'fragmented',    build: buildFragmented   },
	{ name: 'late-bloomer',  build: buildLateBloomer  },
	{ name: 'deep-chain',    build: buildDeepChain    },
	{ name: 'bursty',        build: buildBursty       },
	{ name: 'sparse',        build: buildSparse       },
] as const;

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
	'sparse': {
		summary: 'Quiet across the board — a few origins surfaced the signal but it has not yet propagated.',
		crossingNote: 'Sparse — almost no onward movement.',
		originNote: 'A handful of quiet origins surfaced the signal independently.',
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

	const archetypeIdx = seed % ARCHETYPES.length;
	const archetype = ARCHETYPES[archetypeIdx];
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
