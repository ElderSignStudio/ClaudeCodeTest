/*
	Mock propagation forest for the Item Detail page v1.

	Topology rule: a user has exactly one origin for a given item — the FIRST
	meaningful discovery defines lineage permanently, and branches NEVER merge.
	This means every item's propagation is a FOREST (multiple independent
	roots), not a graph. Implementation reflects that: roots[] is an array,
	each root is a recursive `PropagationUser` tree, no cross-links.

	For v1 we ship one hand-crafted forest applied to any item. The hero stats
	are partially derived from the item so each detail page feels specific, but
	the shape itself stays constant — we're validating layout / interaction /
	tone, not generating accurate per-item topology.
*/

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
	/** Visible children. */
	children: PropagationUser[];
	/** Collapsed-tail count: "+N more" indicator after the visible children. */
	hiddenChildren?: number;
	/** Editorial label for the collapsed tail, e.g. "Ambient listeners cluster". */
	hiddenChildrenLabel?: string;
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
	/** Roots beyond the visible ones (quieter origins not shown by default). */
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
};

const dicebear = (seed: string) =>
	`https://api.dicebear.com/9.x/thumbs/svg?seed=${seed}&backgroundColor=1e1b4b`;

/*
	Base forest — three visible roots + two hidden, modest depth. Sized to fit
	on screen without scrolling on a desktop pane while still demonstrating:
	- multiple roots (Marco, Alice, Dan)
	- nested branches (Julia → Sofia under Marco)
	- a "+N more" collapsed tail (under Renan and under Alice)
	- a "+N more independent origins" root-level collapse
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
				children: [],
				hiddenChildren: 4,
				hiddenChildrenLabel: 'Drone-leaning listeners',
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
				children: [],
				hiddenChildren: 3,
				hiddenChildrenLabel: 'Post-rock-adjacent listeners',
			},
		],
		hiddenChildren: 6,
		hiddenChildrenLabel: 'Ambient listeners cluster',
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
				children: [],
			},
		],
	},
];

/**
 * Returns a propagation forest for the given item. The shape is constant for
 * v1; the hero numbers (total reach, weighted impact, amplifications) are
 * lightly derived from `scouts` so each detail page reads differently in the
 * inspector without needing per-item hand-authored topology.
 */
export function propagationForestFor(itemId: string, scouts: number): PropagationForest {
	// Scale total reach off scouts with a soft floor so even barely-surfaced
	// signals show a sensible forest. The visible forest has 12 users; we
	// scale up to feel item-specific.
	const visibleCount = 12;
	const totalReach = Math.max(visibleCount + 2, scouts * 2 + visibleCount);
	const hiddenRoots = 2;
	const independentOrigins = baseRoots.length + hiddenRoots;
	const totalAmplifications = Math.max(scouts + 12, 17);
	// Editorial impact 0-100: low scouts = quiet propagation, high scouts = stronger.
	const weightedImpact = Math.max(38, Math.min(86, 38 + scouts * 3));

	return {
		itemId,
		roots: baseRoots,
		hiddenRoots,
		totalReach,
		independentOrigins,
		weightedImpact,
		totalAmplifications,
		summary:
			'Spreading through three distinct circles before reaching adjacent listening scenes. Multiple independent origins suggest cultural pull rather than algorithmic push.',
		branchSummaries: [
			{ rootId: 'marco', label: "Marco's branch — ambient + drone explorers", count: 9 },
			{ rootId: 'alice', label: "Alice's branch — deep ambient + post-rock crossover", count: 14 },
			{ rootId: 'dan',   label: "Dan's branch — earliest, quietest origin",          count: 1 },
		],
	};
}

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
