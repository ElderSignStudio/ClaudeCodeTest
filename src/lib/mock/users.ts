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

import { coverOf } from './data';

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

/** Short recency note appended to the metadata line — e.g. "+3 this
 *  week", "amplified 2h ago", "quiet for 12 days". Free-form to keep
 *  editorial control over the wording. */
export type RecentActivity = string;

/** Live propagation status for the small chip beside the title +
 *  the ambient signal rail. Tone guidance:
 *    Still moving / Branch forming → cyan
 *    Accelerating                  → warm amber (slightly brighter)
 *    Quiet                          → muted
 *    Dormant                        → very muted, static rail */
export type LiveStatus = 'Still moving' | 'Accelerating' | 'Quiet' | 'Branch forming' | 'Dormant';

export type SignatureSignal = {
	/** Item id — wired to the Item Detail route so the title links
	 *  through. Unknown ids degrade to a plain text title. */
	id: string;
	title: string;
	artist: string;
	/** Cover artwork URL. Real items resolve via `coverOf(id)`;
	 *  fabricated ids fall back to a Dicebear "shapes" placeholder
	 *  in the project's deep-violet palette. */
	coverArt: string;
	listeners: number;
	generations: number;
	/** Editorial 0–100 "impact" score — kept opaque to the reader. */
	impact: number;
	badges: ScoutBadge[];
	tags: string[];
	recentActivity: RecentActivity;
	liveStatus: LiveStatus;
};

export type EmergingSignal = {
	id: string;
	title: string;
	artist: string;
	/** Cover artwork URL. Emerging-signal ids reference real items
	 *  in `src/lib/mock/data.ts` so `coverOf(id)` returns a real
	 *  Spotify cover — emerging entries read as actual undiscovered
	 *  music rather than synthetic placeholders. */
	coverArt: string;
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
	strongestSignal: { id: string; title: string; artist: string; coverArt: string } | null;
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
   existing Item Detail page. Cover artwork is attached by
   `withCovers()` at the end of the file so the inline entries
   stay focused on editorial content — every signal id
   (signature, emerging, and strongest) resolves to a real
   Spotify cover via `coverOf(id)`. Emerging-signal ids reference
   real items in the registry rather than fabricated ones so
   they read as actual undiscovered music. */

/* Cover-less draft shape for the inline mocks. The real
   UserDetail type (which requires `coverArt`) is reached by
   passing each draft through `withCovers()` at module load. */
type DraftUserDetail = Omit<UserDetail, 'signatureSignals' | 'emergingSignals' | 'strongestSignal'> & {
	signatureSignals: Omit<SignatureSignal, 'coverArt'>[];
	emergingSignals: Omit<EmergingSignal, 'coverArt'>[];
	strongestSignal: { id: string; title: string; artist: string } | null;
};

function withCovers(raw: DraftUserDetail): UserDetail {
	return {
		...raw,
		signatureSignals: raw.signatureSignals.map(s => ({ ...s, coverArt: coverOf(s.id) })),
		emergingSignals: raw.emergingSignals.map(s => ({ ...s, coverArt: coverOf(s.id) })),
		strongestSignal: raw.strongestSignal
			? { ...raw.strongestSignal, coverArt: coverOf(raw.strongestSignal.id) }
			: null,
	};
}

const dan: DraftUserDetail = {
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
			recentActivity: '+3 this week',
			liveStatus: 'Still moving',
		},
		{
			id: 'iron-weather', title: 'Iron Weather', artist: 'Pale Motion',
			listeners: 53, generations: 4, impact: 88,
			badges: ['Early Seed', 'Deep Branch'],
			tags: ['drone', 'cassette ambient'],
			recentActivity: 'amplified 2h ago',
			liveStatus: 'Accelerating',
		},
		{
			id: 'frozen-sun', title: 'Frozen Sun', artist: 'Obscure Slovenian Band',
			listeners: 40, generations: 6, impact: 84,
			badges: ['Trailblazer', 'Underground Seed'],
			tags: ['ritual ambient', 'liminal listening cluster'],
			recentActivity: 'new listener today',
			liveStatus: 'Still moving',
		},
		{
			id: 'neon-veda', title: 'Neon Veda', artist: 'Contour',
			listeners: 16, generations: 3, impact: 50,
			badges: ['Niche Spark'],
			tags: ['dawn-walk ambient', 'cassette orbit'],
			recentActivity: 'quiet for 12 days',
			liveStatus: 'Quiet',
		},
		{
			id: 'low-orbit', title: 'Low Orbit', artist: 'Contour',
			listeners: 95, generations: 10, impact: 92,
			badges: ['Long Tail', 'Cascade Starter'],
			tags: ['folk-leaning ambient', 'late-night headphone scene'],
			recentActivity: '+1 branch forming',
			liveStatus: 'Branch forming',
		},
	],
	emergingSignals: [
		{ id: 'silver-coast',     title: 'Silver Coast',     artist: 'Unnamed Project',
		  listeners: 3, generations: 1, plantedAgo: '2 days ago',  status: 'Watching' },
		{ id: 'still-margin',     title: 'Still Margin',     artist: 'Null Point',
		  listeners: 2, generations: 1, plantedAgo: 'this week', status: 'Early movement' },
		{ id: 'radio-silt',       title: 'Radio Silt',       artist: 'Current Source',
		  listeners: 1,                  plantedAgo: '5 days ago', status: 'Dormant seed' },
		{ id: 'weight-of-cloud',  title: 'Weight of Cloud',  artist: 'Six Months',
		  listeners: 4, generations: 2, plantedAgo: 'last week', status: 'Starting to move' },
		{ id: 'dust-choir',       title: 'Dust Choir',       artist: 'Mare Internum',
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

const alice: DraftUserDetail = {
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
		  tags: ['drone', 'cassette ambient'],
		  recentActivity: '+5 this week', liveStatus: 'Accelerating' },
		{ id: 'night-forest',  title: 'Night Forest',  artist: 'Pale Atelier',
		  listeners: 53, generations: 12, impact: 90,
		  badges: ['Long Tail', 'Underground Seed'],
		  tags: ['long-form drone', 'late-night listening'],
		  recentActivity: '+2 branches forming', liveStatus: 'Branch forming' },
		{ id: 'tape-weather',  title: 'Tape Weather',  artist: 'Archive Unit',
		  listeners: 38, generations: 11, impact: 86,
		  badges: ['Trailblazer'],
		  tags: ['cassette ambient', 'electronic crossover'],
		  recentActivity: 'amplified yesterday', liveStatus: 'Still moving' },
		{ id: 'hollow-coast',  title: 'Hollow Coast',  artist: 'Shore Signal',
		  listeners: 22, generations: 4, impact: 71,
		  badges: ['Early Seed'],
		  tags: ['drone', 'liminal listening cluster'],
		  recentActivity: 'new listener today', liveStatus: 'Still moving' },
		{ id: 'ember-field',   title: 'Ember Field',   artist: 'Pale Iris',
		  listeners: 18, generations: 3, impact: 64,
		  badges: ['Niche Spark', 'Cross-Scene Bridge'],
		  tags: ['electronic', 'ambient orbit'],
		  recentActivity: 'quiet for 9 days', liveStatus: 'Quiet' },
	],
	emergingSignals: [
		{ id: 'pale-static',      title: 'Pale Static',      artist: 'Meridian Line',
		  listeners: 5, generations: 2, plantedAgo: '3 days ago',  status: 'Early movement' },
		{ id: 'cinder-plain',     title: 'Cinder Plain',     artist: 'Hoarfrost',
		  listeners: 2, generations: 1, plantedAgo: 'this week',   status: 'Watching' },
		{ id: 'zero-archive',     title: 'Zero Archive',     artist: 'Unknown',
		  listeners: 1,                  plantedAgo: 'last week',  status: 'Dormant seed' },
		{ id: 'orbital-form',     title: 'Orbital Form',     artist: 'Ultra Obscure',
		  listeners: 6, generations: 2, plantedAgo: '6 days ago',  status: 'Starting to move' },
		{ id: 'static-bloom',     title: 'Static Bloom',     artist: 'Margin Signal',
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

const gisli: DraftUserDetail = {
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
		  tags: ['folk-leaning ambient', 'reverb drift'],
		  recentActivity: '+2 this week', liveStatus: 'Still moving' },
		{ id: 'pale-verge',      title: 'Pale Verge',      artist: 'The Outline',
		  listeners: 24, generations: 3, impact: 70,
		  badges: ['Niche Spark', 'Cross-Scene Bridge'],
		  tags: ['ambient', 'liminal listening cluster'],
		  recentActivity: 'new listener today', liveStatus: 'Branch forming' },
		{ id: 'mirror-static',   title: 'Mirror Static',   artist: 'Pale Signal',
		  listeners: 14, generations: 3, impact: 58,
		  badges: ['Early Seed'],
		  tags: ['drone', 'cassette orbit'],
		  recentActivity: 'amplified 4h ago', liveStatus: 'Accelerating' },
		{ id: 'glass-signal',    title: 'Glass Signal',    artist: 'Pale Archive',
		  listeners: 11, generations: 2, impact: 48,
		  badges: ['Trailblazer'],
		  tags: ['reverb drift', 'late-night headphone scene'],
		  recentActivity: 'quiet for 6 days', liveStatus: 'Quiet' },
		{ id: 'minor-current',   title: 'Minor Current',   artist: 'Field Notes',
		  listeners: 9,  generations: 2, impact: 42,
		  badges: ['Underground Seed'],
		  tags: ['ambient folk', 'cassette orbit'],
		  recentActivity: 'no movement in 3 weeks', liveStatus: 'Dormant' },
	],
	emergingSignals: [
		{ id: 'forest-mouth',  title: 'Forest Mouth',  artist: 'Haul',
		  listeners: 2, generations: 1, plantedAgo: '4 days ago', status: 'Watching' },
		{ id: 'loud-harbour',  title: 'Loud Harbour',  artist: 'Dock Street',
		  listeners: 3, generations: 1, plantedAgo: '5 days ago', status: 'Early movement' },
		{ id: 'open-window',   title: 'Open Window',   artist: 'Still Life',
		  listeners: 1,                  plantedAgo: 'last week',  status: 'Dormant seed' },
		{ id: 'ground-hum',    title: 'Ground Hum',    artist: 'Vessel',
		  listeners: 4, generations: 2, plantedAgo: 'this week',   status: 'Starting to move' },
		{ id: 'ashes-in-snow', title: 'Ashes in Snow', artist: 'Meridian Depth',
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
	dan:   withCovers(dan),
	alice: withCovers(alice),
	gisli: withCovers(gisli),
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
