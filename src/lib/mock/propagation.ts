/*
	Mock propagation forest for the Item Detail page.

	Topology rule: a user has exactly one origin for a given item — the FIRST
	meaningful discovery defines lineage permanently, and branches NEVER merge.
	Implementation reflects that: roots[] is an array, each root is a recursive
	`PropagationUser` tree, no cross-links.

	Cultural framing: nodes carry editorial fields beyond identity — scenes
	the user belongs to, behavior notes, optional cluster descriptions. The
	page uses these to talk about propagation in anthropological terms (scenes,
	orbits, listening circles) rather than as a social graph.
*/

/** Editorial novelty tier — how famous the signal felt at a given moment. */
export type FameTier = 'Underground' | 'Niche' | 'Emerging' | 'Hot';

/*
	Tree Visual Language v1.

	`nodeKind` captures *how this scout received and treated the signal* —
	independent of identity (current user, origin) and branch volume. The
	visual language pairs these kinds with edge kinds (carried on the
	incoming connector) so the tree can answer "how did the signal move
	through these people" rather than "who got points".

	Layering: identity decorations (isOrigin, isCurrentUser, isPreviewNode)
	sit ON TOP of nodeKind. A user can be both an origin and a successful
	amplifier — the rendering composes both treatments.
*/

/** What kind of listening / amplifying behavior this scout demonstrates. */
export type PropagationNodeKind =
	| 'passive-listener'      // signal arrived but didn't strongly propagate
	| 'deep-listener'         // signal resonated deeply; quiet but engaged
	| 'amplifier'             // intentionally transmitted onward
	| 'successful-amplifier'  // their transmission carried the signal far
	| 'bridge-scout';         // bridged distinct scenes / listening worlds

/** Character of the incoming edge from this user's parent. */
export type PropagationEdgeKind =
	| 'passive'        // signal reached but barely traveled — thin, dim
	| 'active'         // intentional transmission — brighter
	| 'strong'         // strong propagation — thicker, glowing
	| 'quiet'          // very thin, fading
	| 'cross-scene'    // bridged scenes — dual-tone shimmer
	| 'fresh'          // recent transmission — subtle motion
	| 'archival';      // older / settled — cooler, dimmer

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
	/** Marks users whose branch reached many people — earns the high-impact
	 *  tree treatment (brighter branch-size badge + accent halo on avatar). */
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

	/** Marks the current viewer's own node — triggers the "you" label,
	 *  brighter avatar ring, and selection deference in the tree. */
	isCurrentUser?: boolean;
	/** Faint placeholder for the current user's pending amplification.
	 *  Renders dimmed + italic + non-selectable; the row only invites the
	 *  user to press the Amplify button. */
	isPreviewNode?: boolean;

	/* ── Tree Visual Language v1 ──────────────────────────────────
	   Semantic decorations that drive the node + edge rendering. None of
	   these change the topology — only how the tree visually reads. */

	/** Behavioral category — passive / deep / amplifier / etc. */
	nodeKind?: PropagationNodeKind;
	/** Character of the connector line bringing the signal into this node. */
	incomingEdgeKind?: PropagationEdgeKind;
	/** This scout is a bridge between distinct scenes/orbits. Composes on
	 *  top of nodeKind (a bridge scout is also typically an amplifier). */
	isBridgeScout?: boolean;
	/** This scout demonstrably carried the signal forward — composes with
	 *  amplifier nodeKind to upgrade visual treatment. */
	isSuccessfulAmplifier?: boolean;
	/** Recent activity hint — used by fresh-edge rendering. */
	isFresh?: boolean;
	/** Dormant — used by archival-edge rendering. */
	isDormant?: boolean;
	/** Editorial scene-flavor tag (used for cross-scene edge tinting). */
	sceneFlavor?: 'ambient' | 'drone' | 'folk' | 'industrial' | 'experimental' | 'unknown';
};

export type RootBranchSummary = {
	rootId: string;
	label: string;     // e.g. "Marco's branch — ambient + drone explorers"
	count: number;     // total downstream including the root
};

export type PropagationForest = {
	itemId: string;
	/** Visible independent origins. */
	roots: PropagationUser[];
	/** Roots beyond the visible ones (quieter origins, hidden behind the
	 *  "+N more independent origins" expander in the tree). */
	hiddenRootUsers: PropagationUser[];
	/** Roots count beyond the visible ones — kept as a derived/explicit
	 *  number for places that only need the count (global inspector). */
	hiddenRoots: number;
	/** Total user count across the whole forest (visible + hidden). */
	totalReach: number;
	/** Independent origin count (visible + hidden). */
	independentOrigins: number;
	/** Editorial 0-100 score reflecting cultural transmission strength. */
	weightedImpact: number;
	/** Total amplification actions across the forest. */
	totalAmplifications: number;
	/** Narrative one-liner — appears in the global inspector state. */
	summary: string;
	/** Per-root branch summaries — appear in the global inspector. */
	branchSummaries: RootBranchSummary[];
	/** Scenes / orbits the signal has crossed into. Used in the hero
	 *  propagation summary and in the global inspector. */
	scenes: string[];
	/** Short editorial phrase summarizing scene/orbit crossover for the hero. */
	crossingNote: string;
	/** Earliest origin context one-liner, e.g. "First surfaced through Marco's
	 *  ambient orbit". Surfaced in the hero. */
	originNote: string;
};

const dicebear = (seed: string) =>
	`https://api.dicebear.com/9.x/thumbs/svg?seed=${seed}&backgroundColor=1e1b4b`;

/*
	Base forest — three visible roots + two hidden, modest depth. Each user
	carries scenes/orbit chips so the inspector can talk about culture rather
	than identity alone.
*/
const baseRoots: PropagationUser[] = [
	{
		id: 'marco',
		name: 'Marco',
		avatar: dicebear('MarcoAmb'),
		character: 'Underground connector',
		amplifications: 5,
		branchSize: 9,
		discoveredAgo: '2 weeks ago',
		behaviorNote: 'Bridges ritual + ambient scenes; tends to surface signals before broader adoption.',
		scenes: ['ritual ambient', 'cassette ambient orbit', 'deep listening cluster'],
		isOrigin: true,
		noveltyTierAtDiscovery: 'Underground',
		fameIndexAtDiscovery: 8,
		highImpact: true,
		discoveryScore: 4.4,
		depthLevels: 3,
		biggestSubcascadeName: 'Renan',
		biggestSubcascadeReach: 5,
		nodeKind: 'successful-amplifier',
		isSuccessfulAmplifier: true,
		isBridgeScout: true,
		sceneFlavor: 'ambient',
		children: [
			{
				id: 'julia',
				name: 'Julia',
				avatar: dicebear('JuliaForest'),
				character: 'Ambient cartographer',
				amplifications: 3,
				branchSize: 2,
				discoveredAgo: '11 days ago',
				behaviorNote: 'Maps quiet ambient scenes; modest reach but high resonance with adjacent listeners.',
				scenes: ['ambient cartographers', 'late-night headphone scene'],
				noveltyTierAtDiscovery: 'Underground',
				fameIndexAtDiscovery: 11,
				discoveryScore: 2.6,
				depthLevels: 1,
				nodeKind: 'amplifier',
				incomingEdgeKind: 'active',
				sceneFlavor: 'ambient',
				children: [
					{
						id: 'sofia',
						name: 'Sofia',
						avatar: dicebear('SofiaQuiet'),
						character: 'Quiet listener',
						amplifications: 1,
						branchSize: 0,
						discoveredAgo: '6 days ago',
						behaviorNote: 'Rare amplifier — when she does, signal tends to stop with her.',
						scenes: ['late-night headphone scene'],
						noveltyTierAtDiscovery: 'Niche',
						fameIndexAtDiscovery: 18,
						discoveryScore: 1.2,
						depthLevels: 0,
						nodeKind: 'deep-listener',
						incomingEdgeKind: 'quiet',
						sceneFlavor: 'ambient',
						children: [],
					},
				],
			},
			{
				id: 'renan',
				name: 'Renan',
				avatar: dicebear('RenanDrone'),
				character: 'Drone obsessive',
				amplifications: 4,
				branchSize: 5,
				discoveredAgo: '10 days ago',
				behaviorNote: 'High amplification rate within drone circles, low crossover outside.',
				scenes: ['drone microculture', 'ritual ambient'],
				noveltyTierAtDiscovery: 'Underground',
				fameIndexAtDiscovery: 12,
				highImpact: true,
				discoveryScore: 3.6,
				depthLevels: 1,
				biggestSubcascadeName: 'Drone-leaning cluster',
				biggestSubcascadeReach: 4,
				nodeKind: 'amplifier',
				incomingEdgeKind: 'strong',
				isFresh: true,
				sceneFlavor: 'drone',
				children: [],
				hiddenChildren: 4,
				hiddenChildrenLabel: 'Drone-leaning listeners',
				hiddenChildrenDescription:
					'Quiet listeners who tend to amplify within their orbit but rarely cross-pollinate.',
			},
		],
	},
	{
		id: 'alice',
		name: 'Alice',
		avatar: dicebear('AliceSignal'),
		character: 'Deep scene explorer',
		amplifications: 8,
		branchSize: 14,
		discoveredAgo: '3 weeks ago',
		behaviorNote: 'Largest single branch; consistently surfaces signals through her ambient overlap.',
		scenes: ['deep listening cluster', 'ambient/drone crossover listeners', 'post-rock crossover branch'],
		isOrigin: true,
		noveltyTierAtDiscovery: 'Underground',
		fameIndexAtDiscovery: 5,
		highImpact: true,
		discoveryScore: 4.8,
		depthLevels: 3,
		biggestSubcascadeName: 'Pieter',
		biggestSubcascadeReach: 4,
		nodeKind: 'successful-amplifier',
		isSuccessfulAmplifier: true,
		sceneFlavor: 'ambient',
		children: [
			{
				id: 'daria',
				name: 'Daria',
				avatar: dicebear('DariaScout'),
				character: 'Cassette archivist',
				amplifications: 2,
				branchSize: 0,
				discoveredAgo: '12 days ago',
				behaviorNote: 'Documents quiet releases; minimal further amplification.',
				scenes: ['cassette ambient orbit'],
				noveltyTierAtDiscovery: 'Niche',
				fameIndexAtDiscovery: 16,
				discoveryScore: 2.1,
				depthLevels: 0,
				nodeKind: 'passive-listener',
				incomingEdgeKind: 'archival',
				isDormant: true,
				sceneFlavor: 'ambient',
				children: [],
			},
			{
				id: 'pieter',
				name: 'Pieter',
				avatar: dicebear('PieterPost'),
				character: 'Post-rock crossover',
				amplifications: 3,
				branchSize: 4,
				discoveredAgo: '9 days ago',
				behaviorNote: 'Picks up signals from ambient circles and carries them into post-rock-adjacent listeners.',
				scenes: ['post-rock crossover branch', 'ambient/drone crossover listeners'],
				noveltyTierAtDiscovery: 'Niche',
				fameIndexAtDiscovery: 19,
				highImpact: true,
				discoveryScore: 3.2,
				depthLevels: 1,
				biggestSubcascadeName: 'Post-rock crossover',
				biggestSubcascadeReach: 3,
				nodeKind: 'bridge-scout',
				incomingEdgeKind: 'cross-scene',
				isBridgeScout: true,
				sceneFlavor: 'experimental',
				children: [],
				hiddenChildren: 3,
				hiddenChildrenLabel: 'Post-rock-adjacent listeners',
				hiddenChildrenDescription:
					'Crossover ears that drift between drone and post-rock; signals tend to slow but persist here.',
			},
		],
		hiddenChildren: 6,
		hiddenChildrenLabel: 'Ambient listeners cluster',
		hiddenChildrenDescription:
			'Low-visibility ambient cluster — signals often surface here before broader adoption.',
	},
	{
		id: 'dan',
		name: 'Dan',
		avatar: dicebear('DanOuter'),
		character: 'Early signal hunter',
		amplifications: 2,
		branchSize: 1,
		discoveredAgo: '5 weeks ago',
		behaviorNote: 'Earliest scout in this forest. Smaller branch but very early origin.',
		scenes: ['quiet early listener cluster', 'late-night headphone scene'],
		isOrigin: true,
		noveltyTierAtDiscovery: 'Underground',
		fameIndexAtDiscovery: 3,
		discoveryScore: 3.8,
		depthLevels: 1,
		nodeKind: 'deep-listener',
		sceneFlavor: 'ambient',
		children: [
			{
				id: 'mara',
				name: 'Mara',
				avatar: dicebear('MaraLowKey'),
				character: 'Low-key listener',
				amplifications: 1,
				branchSize: 0,
				discoveredAgo: '4 weeks ago',
				behaviorNote: 'Single onward amplification.',
				scenes: ['late-night headphone scene'],
				noveltyTierAtDiscovery: 'Underground',
				fameIndexAtDiscovery: 6,
				discoveryScore: 1.8,
				depthLevels: 0,
				nodeKind: 'passive-listener',
				incomingEdgeKind: 'passive',
				sceneFlavor: 'ambient',
				children: [],
			},
		],
	},
];

/*
	Hidden root origins — real independent root nodes that sit behind the
	"+N more independent origins" expander in the tree. These are NOT
	downstream of marco/alice/dan: each brought the signal in from outside
	the network on their own. Minimal subtrees by design — they exist to
	demonstrate quieter origins that still need to be reachable.
*/
const hiddenRootUsers: PropagationUser[] = [
	{
		id: 'tomas',
		name: 'Tomas',
		avatar: dicebear('TomasCassette'),
		character: 'Late-night cassette collector',
		amplifications: 1,
		branchSize: 0,
		discoveredAgo: '6 weeks ago',
		behaviorNote: 'Quiet origin — surfaced the signal alone and rarely amplifies forward.',
		scenes: ['cassette ambient orbit', 'late-night headphone scene'],
		isOrigin: true,
		noveltyTierAtDiscovery: 'Underground',
		fameIndexAtDiscovery: 2,
		discoveryScore: 4.0,
		depthLevels: 0,
		nodeKind: 'deep-listener',
		isDormant: true,
		sceneFlavor: 'ambient',
		children: [],
	},
	{
		id: 'inga',
		name: 'Inga',
		avatar: dicebear('IngaField'),
		character: 'Field-recording listener',
		amplifications: 0,
		branchSize: 0,
		discoveredAgo: '4 weeks ago',
		behaviorNote: 'Quieter origin — discovery sat with her without onward amplification.',
		scenes: ['field recordings', 'quiet early listener cluster'],
		isOrigin: true,
		noveltyTierAtDiscovery: 'Underground',
		fameIndexAtDiscovery: 4,
		discoveryScore: 3.4,
		depthLevels: 0,
		nodeKind: 'passive-listener',
		isDormant: true,
		sceneFlavor: 'experimental',
		children: [],
	},
];

/**
 * Returns a propagation forest for the given item. Shape is constant for v1;
 * hero numerics scale lightly off `scouts` so each detail page reads
 * differently in the inspector without per-item hand authoring.
 */
export function propagationForestFor(itemId: string, scouts: number): PropagationForest {
	const visibleCount = 12;
	const totalReach = Math.max(visibleCount + 2, scouts * 2 + visibleCount);
	const hiddenRoots = hiddenRootUsers.length;
	const independentOrigins = baseRoots.length + hiddenRoots;
	const totalAmplifications = Math.max(scouts + 12, 17);
	const weightedImpact = Math.max(38, Math.min(86, 38 + scouts * 3));

	return {
		itemId,
		roots: baseRoots,
		hiddenRootUsers,
		hiddenRoots,
		totalReach,
		independentOrigins,
		weightedImpact,
		totalAmplifications,
		summary:
			'Spreading through three distinct circles before reaching adjacent listening scenes. Multiple independent origins suggest cultural pull rather than algorithmic push.',
		branchSummaries: [
			{ rootId: 'marco', label: "Marco's branch — ambient + drone explorers",         count: 9  },
			{ rootId: 'alice', label: "Alice's branch — deep ambient + post-rock crossover", count: 14 },
			{ rootId: 'dan',   label: "Dan's branch — earliest, quietest origin",            count: 1  },
		],
		scenes: [
			'ambient/drone crossover',
			'cassette ambient orbit',
			'post-rock crossover',
			'late-night headphone scene',
		],
		crossingNote: 'Crossing ambient + drone listening circles, drifting into post-rock-adjacent listeners.',
		originNote: "First surfaced through Marco's ambient orbit.",
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

/* ─────────────── Immutable forest transformers ───────────────
   These helpers return a new forest with the requested change applied.
   Used by the Item Detail page to derive the "displayed" forest from the
   loaded forest + the current user's amplification state. */

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
