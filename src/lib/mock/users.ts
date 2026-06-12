/*
	Mock data for the User Detail page (/users/[id]).

	Shapes are organised around the page's narrative sections:
	  identity → Scout Profile metrics → Scene Footprint → Signature
	  Signals → Emerging Signals → Following / Followers. Each
	  section has a dedicated sub-type so editorial copy stays
	  readable at the call site.

	When a backend exists later, swap `mockUsers` for a fetch keyed
	on the route id; everything downstream (the page, the load
	function, the Branch Inspector links) reads from this same
	module by id.
*/

const dicebear = (seed: string) =>
	`https://api.dicebear.com/9.x/thumbs/svg?seed=${seed}&backgroundColor=1e1b4b`;

export type ScoutBadge =
	| 'Cascade Starter'
	| 'Early Seed'
	| 'Trailblazer'
	| 'Cross-Scene Bridge'
	| 'Underground Seed'
	| 'Long Tail'
	| 'Niche Spark'
	| 'Deep Branch';

export type EmergingStatus =
	| 'Watching'
	| 'Early movement'
	| 'Dormant seed'
	| 'Starting to move'
	| 'Fragile signal';

export type SceneShare = {
	name: string;
	/** 0–100; rendered as a thin horizontal bar. The full set need
	 *  not sum to 100 — the bar reads as relative footprint, not as
	 *  a pie. */
	percent: number;
};

export type SignatureSignal = {
	/** Item id — wired to the Item Detail route so the title links
	 *  through. Unknown ids degrade to a plain text title. */
	id: string;
	title: string;
	artist: string;
	listeners: number;
	generations: number;
	/** Editorial 0–100 "impact" score — kept opaque to the reader. */
	impact: number;
	badges: ScoutBadge[];
	tags: string[];
};

export type EmergingSignal = {
	id: string;
	title: string;
	artist: string;
	listeners: number;
	/** Undefined when the seed hasn't produced its first downstream
	 *  branch yet (rendered as "awaiting first branch"). */
	generations?: number;
	plantedAgo: string;
	status: EmergingStatus;
};

export type ScoutReference = {
	id: string;
	name: string;
	avatar: string;
};

export type UserDetail = {
	id: string;
	username: string;
	avatar: string;
	bio: string;
	/** Whether this profile belongs to the current viewer. Used to
	 *  swap the Follow button for a "Your scout profile" chip and to
	 *  reword Following/Followers labels in second person. */
	isCurrentUser: boolean;
	/** Initial follow state for the OTHER-user variant. Ignored for
	 *  current-user pages. */
	isFollowing: boolean;
	/** Editorial 0–100 score. */
	discoveryScore: number;
	scoutArchetype: string;
	originSeeds: number;
	reshareBranches: number;
	uniqueListenersReached: number;
	/** Stored as a percentage value (0–100). */
	hitRate: number;
	/** Reference to the scout's most-influential signal. Optional —
	 *  brand-new scouts may not have one yet. */
	strongestSignal: { id: string; title: string; artist: string } | null;
	averageReachPerSeed: number;
	sceneFootprint: SceneShare[];
	sceneInterpretation: {
		/** Third-person sentence for OTHER user variants. */
		thirdPerson: string;
		/** Second-person sentence for the current-user variant. */
		secondPerson: string;
	};
	signatureSignals: SignatureSignal[];
	emergingSignals: EmergingSignal[];
	following: ScoutReference[];
	followers: ScoutReference[];
	followingCount: number;
	followersCount: number;
};

/* ─── Concrete mocks ──────────────────────────────────────────────
   Dan is the current user; Alice and Gisli demonstrate the OTHER
   variant. Strongest-signal ids reference real item ids in
   `src/lib/mock/data.ts` so title links route cleanly through the
   existing Item Detail page. */

const dan: UserDetail = {
	id: 'dan',
	username: 'Dan',
	avatar: dicebear('DanOuter'),
	bio: 'Tracing overlooked signals across ambient, post-rock, and strange border scenes.',
	isCurrentUser: true,
	isFollowing: false,
	discoveryScore: 84,
	scoutArchetype: 'Cross-Scene Bridge',
	originSeeds: 23,
	reshareBranches: 41,
	uniqueListenersReached: 186,
	hitRate: 42,
	strongestSignal: { id: 'cold-dispatch', title: 'Cold Dispatch', artist: 'Wire Theory' },
	averageReachPerSeed: 14,
	sceneFootprint: [
		{ name: 'Post-Rock / Drone',       percent: 34 },
		{ name: 'Tape Ambient',            percent: 24 },
		{ name: 'Long-form Drone',         percent: 18 },
		{ name: 'Ritual Ambient',          percent: 13 },
		{ name: 'Experimental Crossover',  percent: 11 },
	],
	sceneInterpretation: {
		thirdPerson:
			'Most active around slow-building atmospheric scenes, with strongest results in post-rock / drone crossovers.',
		secondPerson:
			'Your strongest footprint is currently in post-rock / drone crossovers.',
	},
	signatureSignals: [
		{
			id: 'cold-dispatch', title: 'Cold Dispatch', artist: 'Wire Theory',
			listeners: 67, generations: 5, impact: 92,
			badges: ['Cascade Starter', 'Cross-Scene Bridge'],
			tags: ['post-rock crossover', 'tape ambient'],
		},
		{
			id: 'iron-weather', title: 'Iron Weather', artist: 'Pale Motion',
			listeners: 53, generations: 4, impact: 88,
			badges: ['Early Seed', 'Deep Branch'],
			tags: ['drone', 'cassette ambient'],
		},
		{
			id: 'frozen-sun', title: 'Frozen Sun', artist: 'Obscure Slovenian Band',
			listeners: 40, generations: 6, impact: 84,
			badges: ['Trailblazer', 'Underground Seed'],
			tags: ['ritual ambient', 'liminal listening cluster'],
		},
		{
			id: 'neon-veda', title: 'Neon Veda', artist: 'Contour',
			listeners: 16, generations: 3, impact: 50,
			badges: ['Niche Spark'],
			tags: ['dawn-walk ambient', 'cassette orbit'],
		},
		{
			id: 'low-orbit', title: 'Low Orbit', artist: 'Contour',
			listeners: 95, generations: 10, impact: 92,
			badges: ['Long Tail', 'Cascade Starter'],
			tags: ['folk-leaning ambient', 'late-night headphone scene'],
		},
	],
	emergingSignals: [
		{ id: 'glass-provinces',  title: 'Glass Provinces',  artist: 'Northern Static',
		  listeners: 3, generations: 1, plantedAgo: '2 days ago',  status: 'Watching' },
		{ id: 'hidden-shore',     title: 'Hidden Shore',     artist: 'Vale Archive',
		  listeners: 2, generations: 1, plantedAgo: 'this week', status: 'Early movement' },
		{ id: 'pale-orchard',     title: 'Pale Orchard',     artist: 'Soft Maps',
		  listeners: 1,                  plantedAgo: '5 days ago', status: 'Dormant seed' },
		{ id: 'field-lantern',    title: 'Field Lantern',    artist: 'Moss Circuit',
		  listeners: 4, generations: 2, plantedAgo: 'last week', status: 'Starting to move' },
		{ id: 'quiet-geometry',   title: 'Quiet Geometry',   artist: 'The Lanes',
		  listeners: 2, generations: 1, plantedAgo: '4 days ago', status: 'Fragile signal' },
	],
	following: [
		{ id: 'alice',  name: 'Alice',  avatar: dicebear('AliceSignal') },
		{ id: 'gisli',  name: 'Gisli',  avatar: dicebear('GisliReverb') },
		{ id: 'marco',  name: 'Marco',  avatar: dicebear('MarcoAmb')   },
		{ id: 'yuki',   name: 'Yuki',   avatar: dicebear('YukiQuiet')  },
		{ id: 'tobias', name: 'Tobias', avatar: dicebear('TobiasCart') },
		{ id: 'kalla',  name: 'Kalla',  avatar: dicebear('KallaCurate') },
	],
	followers: [
		{ id: 'pauli',  name: 'Pauli',  avatar: dicebear('PauliSeed')  },
		{ id: 'jaakko', name: 'Jaakko', avatar: dicebear('JaakkoLate') },
		{ id: 'sanna',  name: 'Sanna',  avatar: dicebear('SannaQuiet') },
		{ id: 'olek',   name: 'Olek',   avatar: dicebear('OlekDrift')  },
		{ id: 'doro',   name: 'Doro',   avatar: dicebear('DoroSleeve') },
		{ id: 'hilde',  name: 'Hilde',  avatar: dicebear('HildeAbs')   },
	],
	followingCount: 38,
	followersCount: 112,
};

const alice: UserDetail = {
	id: 'alice',
	username: 'Alice',
	avatar: dicebear('AliceSignal'),
	bio: 'Deep-scene explorer. Usually early to slow-moving signals before they surface.',
	isCurrentUser: false,
	isFollowing: false,
	discoveryScore: 91,
	scoutArchetype: 'Underground Seeder',
	originSeeds: 38,
	reshareBranches: 62,
	uniqueListenersReached: 412,
	hitRate: 56,
	strongestSignal: { id: 'iron-weather', title: 'Iron Weather', artist: 'Pale Motion' },
	averageReachPerSeed: 21,
	sceneFootprint: [
		{ name: 'Drone',                   percent: 41 },
		{ name: 'Cassette Ambient',        percent: 28 },
		{ name: 'Folk-leaning Ambient',    percent: 14 },
		{ name: 'Industrial / Noise',      percent: 10 },
		{ name: 'Liminal Listening',       percent: 7  },
	],
	sceneInterpretation: {
		thirdPerson:
			'Anchored in slow drone and cassette ambient circles, with steady pull into folk-adjacent listening clusters.',
		secondPerson:
			'Your strongest footprint is currently in slow drone and cassette ambient circles.',
	},
	signatureSignals: [
		{ id: 'iron-weather',  title: 'Iron Weather',  artist: 'Pale Motion',
		  listeners: 79, generations: 6, impact: 96,
		  badges: ['Cascade Starter', 'Deep Branch'],
		  tags: ['drone', 'cassette ambient'] },
		{ id: 'night-forest',  title: 'Night Forest',  artist: 'Pale Atelier',
		  listeners: 53, generations: 12, impact: 90,
		  badges: ['Long Tail', 'Underground Seed'],
		  tags: ['long-form drone', 'late-night listening'] },
		{ id: 'tape-weather',  title: 'Tape Weather',  artist: 'Archive Unit',
		  listeners: 38, generations: 11, impact: 86,
		  badges: ['Trailblazer'],
		  tags: ['cassette ambient', 'electronic crossover'] },
		{ id: 'hollow-coast',  title: 'Hollow Coast',  artist: 'Shore Signal',
		  listeners: 22, generations: 4, impact: 71,
		  badges: ['Early Seed'],
		  tags: ['drone', 'liminal listening cluster'] },
		{ id: 'ember-field',   title: 'Ember Field',   artist: 'Pale Iris',
		  listeners: 18, generations: 3, impact: 64,
		  badges: ['Niche Spark', 'Cross-Scene Bridge'],
		  tags: ['electronic', 'ambient orbit'] },
	],
	emergingSignals: [
		{ id: 'silver-arc',     title: 'Silver Arc',     artist: 'Field Recordings',
		  listeners: 5, generations: 2, plantedAgo: '3 days ago',  status: 'Early movement' },
		{ id: 'tide-mirror',    title: 'Tide Mirror',    artist: 'North Atelier',
		  listeners: 2, generations: 1, plantedAgo: 'this week',   status: 'Watching' },
		{ id: 'paper-station',  title: 'Paper Station',  artist: 'Quiet Atlas',
		  listeners: 1,                  plantedAgo: 'last week',  status: 'Dormant seed' },
		{ id: 'dim-corridor',   title: 'Dim Corridor',   artist: 'Slow Magnet',
		  listeners: 6, generations: 2, plantedAgo: '6 days ago',  status: 'Starting to move' },
		{ id: 'small-comet',    title: 'Small Comet',    artist: 'Pale Iris',
		  listeners: 3, generations: 1, plantedAgo: '2 days ago',  status: 'Fragile signal' },
	],
	following: [
		{ id: 'marco',  name: 'Marco',  avatar: dicebear('MarcoAmb')   },
		{ id: 'yuki',   name: 'Yuki',   avatar: dicebear('YukiQuiet')  },
		{ id: 'gisli',  name: 'Gisli',  avatar: dicebear('GisliReverb') },
		{ id: 'kalla',  name: 'Kalla',  avatar: dicebear('KallaCurate') },
		{ id: 'dan',    name: 'Dan',    avatar: dicebear('DanOuter')   },
		{ id: 'tobias', name: 'Tobias', avatar: dicebear('TobiasCart') },
	],
	followers: [
		{ id: 'dan',    name: 'Dan',    avatar: dicebear('DanOuter')   },
		{ id: 'pauli',  name: 'Pauli',  avatar: dicebear('PauliSeed')  },
		{ id: 'olek',   name: 'Olek',   avatar: dicebear('OlekDrift')  },
		{ id: 'doro',   name: 'Doro',   avatar: dicebear('DoroSleeve') },
		{ id: 'sanna',  name: 'Sanna',  avatar: dicebear('SannaQuiet') },
		{ id: 'leo',    name: 'Leo',    avatar: dicebear('LeoHalf')    },
	],
	followingCount: 54,
	followersCount: 261,
};

const gisli: UserDetail = {
	id: 'gisli',
	username: 'Gisli',
	avatar: dicebear('GisliReverb'),
	bio: 'Reverb cartographer. Maps the long tail of slow, atmospheric crossings.',
	isCurrentUser: false,
	isFollowing: true,
	discoveryScore: 72,
	scoutArchetype: 'Trailblazer',
	originSeeds: 14,
	reshareBranches: 28,
	uniqueListenersReached: 124,
	hitRate: 36,
	strongestSignal: { id: 'soft-border', title: 'Soft Border', artist: 'Liminal State' },
	averageReachPerSeed: 9,
	sceneFootprint: [
		{ name: 'Reverb / Drift',          percent: 38 },
		{ name: 'Ambient Folk',            percent: 26 },
		{ name: 'Cassette Orbit',          percent: 15 },
		{ name: 'Late-night Headphone',    percent: 12 },
		{ name: 'Liminal Listening',       percent: 9  },
	],
	sceneInterpretation: {
		thirdPerson:
			'Best results sit in reverb-heavy drift and ambient folk crossings, with a quiet following in late-night headphone scenes.',
		secondPerson:
			'Your strongest footprint is currently in reverb-heavy drift and ambient folk crossings.',
	},
	signatureSignals: [
		{ id: 'soft-border',     title: 'Soft Border',     artist: 'Liminal State',
		  listeners: 32, generations: 4, impact: 78,
		  badges: ['Cascade Starter'],
		  tags: ['folk-leaning ambient', 'reverb drift'] },
		{ id: 'pale-verge',      title: 'Pale Verge',      artist: 'The Outline',
		  listeners: 24, generations: 3, impact: 70,
		  badges: ['Niche Spark', 'Cross-Scene Bridge'],
		  tags: ['ambient', 'liminal listening cluster'] },
		{ id: 'mirror-static',   title: 'Mirror Static',   artist: 'Pale Signal',
		  listeners: 14, generations: 3, impact: 58,
		  badges: ['Early Seed'],
		  tags: ['drone', 'cassette orbit'] },
		{ id: 'glass-signal',    title: 'Glass Signal',    artist: 'Pale Archive',
		  listeners: 11, generations: 2, impact: 48,
		  badges: ['Trailblazer'],
		  tags: ['reverb drift', 'late-night headphone scene'] },
		{ id: 'minor-current',   title: 'Minor Current',   artist: 'Field Notes',
		  listeners: 9,  generations: 2, impact: 42,
		  badges: ['Underground Seed'],
		  tags: ['ambient folk', 'cassette orbit'] },
	],
	emergingSignals: [
		{ id: 'cedar-trace',  title: 'Cedar Trace',  artist: 'North Library',
		  listeners: 2, generations: 1, plantedAgo: '4 days ago', status: 'Watching' },
		{ id: 'still-quarry', title: 'Still Quarry', artist: 'Halflight Atlas',
		  listeners: 3, generations: 1, plantedAgo: '5 days ago', status: 'Early movement' },
		{ id: 'paper-radio',  title: 'Paper Radio',  artist: 'Soft Index',
		  listeners: 1,                  plantedAgo: 'last week',  status: 'Dormant seed' },
		{ id: 'low-river',    title: 'Low River',    artist: 'Quiet Sound Bureau',
		  listeners: 4, generations: 2, plantedAgo: 'this week',   status: 'Starting to move' },
		{ id: 'ash-marker',   title: 'Ash Marker',   artist: 'Iron Library',
		  listeners: 2, generations: 1, plantedAgo: '3 days ago',  status: 'Fragile signal' },
	],
	following: [
		{ id: 'dan',    name: 'Dan',    avatar: dicebear('DanOuter')   },
		{ id: 'alice',  name: 'Alice',  avatar: dicebear('AliceSignal') },
		{ id: 'marco',  name: 'Marco',  avatar: dicebear('MarcoAmb')   },
		{ id: 'kalla',  name: 'Kalla',  avatar: dicebear('KallaCurate') },
	],
	followers: [
		{ id: 'doro',   name: 'Doro',   avatar: dicebear('DoroSleeve') },
		{ id: 'pauli',  name: 'Pauli',  avatar: dicebear('PauliSeed')  },
		{ id: 'yuki',   name: 'Yuki',   avatar: dicebear('YukiQuiet')  },
		{ id: 'hilde',  name: 'Hilde',  avatar: dicebear('HildeAbs')   },
		{ id: 'tobias', name: 'Tobias', avatar: dicebear('TobiasCart') },
	],
	followingCount: 22,
	followersCount: 87,
};

const mockUsers: Record<string, UserDetail> = {
	dan,
	alice,
	gisli,
};

/* ─── Lookup + fallback ─────────────────────────────────────────
   The Branch Inspector links any propagation-user name to
   `/users/<id>`, but those ids (Vera, Tobias, Marco, …) far exceed
   our hand-authored mock set. Rather than 404-ing, we synthesise a
   minimal "scout in progress" page on the fly so the navigation
   never dead-ends. This lets the page reuse the same layout
   without a separate not-found surface. */

function makeFallbackUser(id: string): UserDetail {
	const name = id.charAt(0).toUpperCase() + id.slice(1);
	return {
		id,
		username: name,
		avatar: dicebear(`${id}-fallback`),
		bio: 'A scout in the propagation graph. Their full profile hasn’t been authored yet.',
		isCurrentUser: false,
		isFollowing: false,
		discoveryScore: 0,
		scoutArchetype: 'Scout',
		originSeeds: 0,
		reshareBranches: 0,
		uniqueListenersReached: 0,
		hitRate: 0,
		strongestSignal: null,
		averageReachPerSeed: 0,
		sceneFootprint: [],
		sceneInterpretation: {
			thirdPerson: 'Not enough data yet to describe this scout’s footprint.',
			secondPerson: 'Not enough data yet to describe your footprint.',
		},
		signatureSignals: [],
		emergingSignals: [],
		following: [],
		followers: [],
		followingCount: 0,
		followersCount: 0,
	};
}

/** Lookup by id. Unknown ids return a synthesised fallback so the
 *  page never 404s — see `makeFallbackUser` above. */
export function getUserDetail(id: string): UserDetail {
	return mockUsers[id] ?? makeFallbackUser(id);
}

/** Stable id for the current viewer; mirrors `CURRENT_USER_ID` on
 *  the Item Detail page. */
export const CURRENT_USER_ID = 'dan';
