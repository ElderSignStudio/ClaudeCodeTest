/*
	Outer Signal — centralized mock data.
	Structured as a multi-lane discovery system.
	All arrays are shaped like real API responses so load() functions
	can replace these imports directly when a backend is added.

	── Discovery-route IA (current rule) ────────────────────────────
	Every visible item card on the homepage resolves to ONE specific
	source scout (`sourceScoutId`) and ONE editorial route phrasing
	(`routeNarrative`). Internally the recommendation engine may use
	multi-origin / propagation overlap / adjacency scoring, but the
	feed surface always presents a singular discovery context.

	The SAME item may legitimately appear in multiple lanes through
	different routes — that's a feature, not a bug. Each represents a
	different cultural pathway into the same signal.

	Origin Stories is the ONE exception: it documents how a signal
	spread historically through the network, so multi-origin framing
	remains valid there (see `OriginItem.multiOrigin`).

	Images: Spotify artwork from data/home-seed.spotify.json.
*/

import spotifyData from '../../../data/home-seed.spotify.json';

export type Item = {
	id: string;
	title: string;
	artist: string;
	scouts: number;
	genre: string;
	type?: 'Song' | 'Album';
	image: string;
	featured?: boolean;
	lifeLabel?: 'Early' | 'Emerging' | 'Quiet' | 'Spreading'; // signal momentum label for One Step Away lane
	whisperHint?: string;      // editorial hint for Deep Underground lane — one of a fixed allowed set
	crossingPath?: string;     // scene-crossing data for Outside the Bubble, e.g. "ambient → spiritual jazz"
	orbitState?: string;       // taste-proximity pill for Best Picks lane, e.g. "Closely Orbiting"
	sourceScoutId: string;     // single discovery route — scoutItems.id of the route's source scout
	routeNarrative: string;    // editorial one-line route phrasing rendered on the card
	coverDim?: boolean;        // Deep Underground only: cover artwork is naturally dim/low-contrast. Triggers a small readability boost so the card doesn't cross from "barely surfaced" into "visually broken."
};

export type GainingItem = {
	id: string;
	title: string;
	artist: string;
	scouts: number;
	genre: string;
	image: string;
	weeklyScouts?: number;       // new scouts added this week — rendered inside the heat pill
	tag?: 'Rising' | 'Surging' | 'Breakthrough';
	spreadReason?: string;       // momentum language — how the signal is propagating (kept alongside the route narrative)
	emitsAmbientGlow?: boolean;  // marks the card as an "ambient emitter" — gets the image-derived halo/bloom treatment in BreakingOutLane
	sourceScoutId: string;       // single discovery route — scoutItems.id of the source branch
	routeNarrative: string;      // editorial one-line route phrasing rendered on the card
};

/*
	Origin Stories propagation story types.

	Outer Signal's propagation model is a FOREST of independent trees: signals
	do not merge, branches never converge, each user has exactly one origin
	for an item. These 5 story types describe the editorially interesting
	shapes that emerge in that forest — they are about how propagation
	UNFOLDS, not how paths "reach" a signal.
*/
export type StoryType =
	| 'independent-origins'   // multiple isolated roots discovered the signal in parallel
	| 'cross-scene-spread'    // one origin diverged into distinct cultural ecosystems
	| 'dormant-breakout'      // sparse early chain, then sudden network ignition
	| 'quiet-persistence'     // a small branch quietly kept the signal alive over time
	| 'bridge-scout-event';   // a single scout connected two otherwise distant scenes

export type OriginItem = {
	id: string;
	title: string;
	artist: string;
	genre: string;
	image: string;
	reachedScouts: number;
	discoveries: number;
	branch: string;         // sub-headline, e.g. "Branch growing from Łódź"
	headline: string;       // narrative sentence for the Story Card
	seedLocation: string;   // where the signal originated
	storyType: StoryType;   // determines the symbolic diagram grammar
	multiOrigin?: boolean;  // Origin Stories remains historically multi-origin — surfaces the topology marker
};

// Build a lookup of Spotify cover URLs keyed by item id
const _spotifyCovers = new Map<string, string>(
	[
		spotifyData.bestPicksForYou.featured,
		...spotifyData.bestPicksForYou.items,
		...spotifyData.oneStepAway.items,
		...spotifyData.deepUnderground.items,
		...spotifyData.breakingOut.items,
		spotifyData.outsideTheBubble.featured,
		...spotifyData.outsideTheBubble.sideItems,
		...spotifyData.drift.stream,
		...spotifyData.humanSignals.tracks,
		...spotifyData.originStories.items,
	]
		.filter((item): item is NonNullable<typeof item> & { cover: string } =>
			item !== null && typeof item.cover === 'string'
		)
		.map(item => [item.id, item.cover])
);

function coverOf(id: string): string {
	return _spotifyCovers.get(id) ?? '';
}

// 1. For You — strongest discovery routes converging around your taste.
export const forYouItems: Item[] = [
	{ id: 'frozen-sun',         title: 'Frozen Sun',         artist: 'Obscure Slovenian Band', scouts: 1,  genre: 'Ambient',      type: 'Song',  image: coverOf('frozen-sun'),         featured: true, orbitState: 'Closely Orbiting', sourceScoutId: 'marco', routeNarrative: "Through Marco's ambient orbit" },
	{ id: 'night-forest',       title: 'Night Forest',       artist: 'Pale Atelier',           scouts: 53, genre: 'Drone',        type: 'Album', image: coverOf('night-forest'),                        orbitState: 'Strong Resonance',  sourceScoutId: 'alice', routeNarrative: "via Alice"                     },
	{ id: 'wolves-under-glass', title: 'Wolves Under Glass', artist: 'Aesthian Ritual',        scouts: 7,  genre: 'Experimental', type: 'Song',  image: coverOf('wolves-under-glass'),                  orbitState: 'Near Your Branch',  sourceScoutId: 'yuki',  routeNarrative: "Yuki orbit"                    },
	{ id: 'ashes-in-snow',      title: 'Ashes in Snow',      artist: 'Meridian Depth',         scouts: 12, genre: 'Folk',         type: 'Song',  image: coverOf('ashes-in-snow'),                       orbitState: 'Quiet Match',       sourceScoutId: 'dan',   routeNarrative: "Dan folk listening"            },
	{ id: 'pale-static',        title: 'Pale Static',        artist: 'Meridian Line',          scouts: 4,  genre: 'Electronic',   type: 'Song',  image: coverOf('pale-static'),                         orbitState: 'Drifting Closer',   sourceScoutId: 'marco', routeNarrative: "Marco branch"                  },
];

// 2. One Step Away — signals entering your orbit through adjacent scouts.
export const oneStepAwayItems: Item[] = [
	{ id: 'edge-of-field',  title: 'Edge of Field',  artist: 'Dusk Bureau',  scouts: 6,  genre: 'Ambient',      image: coverOf('edge-of-field'),  lifeLabel: 'Emerging',  sourceScoutId: 'marco', routeNarrative: "Marco branch"      },
	{ id: 'iron-weather',   title: 'Iron Weather',   artist: 'Pale Motion',  scouts: 9,  genre: 'Drone',        image: coverOf('iron-weather'),   lifeLabel: 'Spreading', sourceScoutId: 'alice', routeNarrative: "via Alice"         },
	{ id: 'soft-collapse',  title: 'Soft Collapse',  artist: 'Terrain',      scouts: 3,  genre: 'Electronic',   image: coverOf('soft-collapse'),  lifeLabel: 'Early',     sourceScoutId: 'dan',   routeNarrative: "Dan orbit"         },
	{ id: 'slow-satellite', title: 'Slow Satellite', artist: 'White Canvas', scouts: 11, genre: 'Experimental', image: coverOf('slow-satellite'), lifeLabel: 'Spreading', sourceScoutId: 'yuki',  routeNarrative: "via Yuki"          },
	{ id: 'minor-current',  title: 'Minor Current',  artist: 'Field Notes',  scouts: 2,  genre: 'Folk',         image: coverOf('minor-current'),  lifeLabel: 'Quiet',     sourceScoutId: 'dan',   routeNarrative: "via Dan"           },
	{ id: 'glass-signal',   title: 'Glass Signal',   artist: 'Pale Archive', scouts: 5,  genre: 'Post-Rock',    image: coverOf('glass-signal'),   lifeLabel: 'Emerging',  sourceScoutId: 'marco', routeNarrative: "Through Marco"     },
];

// 3. Deep Underground — signals barely propagated through the network yet.
export const deepUndergroundItems: Item[] = [
	{ id: 'dust-choir',    title: 'Dust Choir',    artist: 'Mare Internum',   scouts: 1, genre: 'Ambient',      image: coverOf('dust-choir'),    whisperHint: 'Barely surfaced',                      sourceScoutId: 'marco', routeNarrative: "Marco archive"            },
	{ id: 'neon-veda',     title: 'Neon Veda',     artist: '3 Scouts',        scouts: 3, genre: 'Electronic',   image: coverOf('neon-veda'),     whisperHint: 'Circulating quietly in small circles', sourceScoutId: 'alice', routeNarrative: "Alice archive"            },
	{ id: 'orbital-form',  title: 'Orbital Form',  artist: 'Ultra Obscure',   scouts: 0, genre: 'Experimental', image: coverOf('orbital-form'),  whisperHint: 'No clear origin yet',                  sourceScoutId: 'yuki',  routeNarrative: "First carried by Yuki"    },
	{ id: 'silver-coast',  title: 'Silver Coast',  artist: 'Unnamed Project', scouts: 1, genre: 'Folk',         image: coverOf('silver-coast'),  whisperHint: 'Found in isolation, off the grid',     sourceScoutId: 'dan',   routeNarrative: "Dan transmission",        coverDim: true },
	{ id: 'hollow-ritual', title: 'Hollow Ritual', artist: 'Cave Press',      scouts: 2, genre: 'Drone',        image: coverOf('hollow-ritual'), whisperHint: 'One scout found it before anyone else', sourceScoutId: 'marco', routeNarrative: "Marco transmission"       },
	{ id: 'static-bloom',  title: 'Static Bloom',  artist: 'Margin Signal',   scouts: 1, genre: 'Ambient',      image: coverOf('static-bloom'),  whisperHint: 'Found at the edge of the map',         sourceScoutId: 'alice', routeNarrative: "First carried by Alice",  coverDim: true },
	{ id: 'zero-archive',  title: 'Zero Archive',  artist: 'Unknown',         scouts: 0, genre: 'Experimental', image: coverOf('zero-archive'),  whisperHint: 'Untracked signal',                     sourceScoutId: 'yuki',  routeNarrative: "Yuki archive",            coverDim: true },
];

// 4. Breaking Out — signals accelerating through the network from specific branches.
export const breakingOutItems: GainingItem[] = [
	{ id: 'ember-field',    title: 'Ember Field',    artist: 'Pale Iris',     scouts: 8,  genre: 'Electronic',   image: coverOf('ember-field'),    weeklyScouts: 6,  tag: 'Surging',      spreadReason: 'Spreading from ambient circles', emitsAmbientGlow: true, sourceScoutId: 'alice', routeNarrative: "Alice's ambient branch"      },
	{ id: 'low-orbit',      title: 'Low Orbit',      artist: 'Contour',       scouts: 14, genre: 'Ambient',      image: coverOf('low-orbit'),      weeklyScouts: 9,  tag: 'Breakthrough', spreadReason: 'Moving beyond its first cluster',                         sourceScoutId: 'marco', routeNarrative: "Marco's drone orbit"         },
	{ id: 'mirror-static',  title: 'Mirror Static',  artist: 'Pale Signal',   scouts: 5,  genre: 'Drone',        image: coverOf('mirror-static'),  weeklyScouts: 3,  tag: 'Rising',       spreadReason: 'Crossing into adjacent scenes',                           sourceScoutId: 'dan',   routeNarrative: "Dan's drone archive"         },
	{ id: 'pale-cathedral', title: 'Pale Cathedral', artist: 'Herd of Birds', scouts: 11, genre: 'Experimental', image: coverOf('pale-cathedral'), weeklyScouts: 7,  tag: 'Surging',      spreadReason: 'Picked up by high-trust scouts',                          sourceScoutId: 'yuki',  routeNarrative: "Yuki's experimental branch"  },
	{ id: 'ground-hum',     title: 'Ground Hum',     artist: 'Vessel',        scouts: 3,  genre: 'Electronic',   image: coverOf('ground-hum'),     weeklyScouts: 2,  tag: 'Rising',       spreadReason: 'Reaching new listening circles',                          sourceScoutId: 'marco', routeNarrative: "Marco branch"                },
];

// Scout: a person-card type for the Human Signals lane.
// Completely separate from Item — this represents a curator, not content.
export type Scout = {
	id: string;
	name: string;
	avatar: string;         // DiceBear URL
	tasteProfile: string;   // e.g. "Obscure prog · dark folk · lost tapes"
	contextLine?: string;   // how this scout relates to the listener or network
	sparks: number;         // total signals they've sparked
	reach: number;          // total scouts reached by their signals
	hitRate: number;        // percentage of early picks that later gained traction
	activityLabel?: string; // short editorial phrase describing scout behavior
	following: boolean;     // whether the current user follows this scout
	recentSignals: string[]; // Spotify cover URLs for the thumbnail strip
};

function avatar(seed: string): string {
	return `https://api.dicebear.com/9.x/thumbs/svg?seed=${seed}&backgroundColor=1e1b4b`;
}

export const scoutItems: Scout[] = [
	{
		id:            'dan',
		name:          'Dan',
		avatar:        avatar('DanOuter'),
		tasteProfile:  'Obscure prog · dark folk · lost tapes',
		contextLine:   'Closely aligned with your late-night listening',
		sparks:        8,
		reach:         41,
		hitRate:       72,
		activityLabel: 'Early signal hunter',
		following:     true,
		recentSignals: [coverOf('dust-choir'), coverOf('forest-mouth'), coverOf('pale-static')],
	},
	{
		id:            'alice',
		name:          'Alice',
		avatar:        avatar('AliceSignal'),
		tasteProfile:  'Brazilian psych · strange collage · obscure finds',
		contextLine:   'Found through your ambient overlap',
		sparks:        14,
		reach:         88,
		hitRate:       68,
		activityLabel: 'Deep scene explorer',
		following:     true,
		recentSignals: [coverOf('ember-field'), coverOf('open-window'), coverOf('iron-coast')],
	},
	{
		id:           'marco',
		name:         'Marco',
		avatar:       avatar('MarcoAmb'),
		tasteProfile: 'Ambient · ritual · sonic geography',
		contextLine:  'Bridges ritual music and field recordings',
		sparks:       22,
		reach:        134,
		hitRate:      70,
		activityLabel: 'Underground connector',
		following:    false,
		recentSignals: [coverOf('low-orbit'), coverOf('cinder-plain'), coverOf('weight-of-cloud')],
	},
	{
		id:            'yuki',
		name:          'Yuki',
		avatar:        avatar('YukiDeep'),
		tasteProfile:  'Early experimental · field recordings · micro-scenes',
		contextLine:   'Often surfaces signals before breakout',
		sparks:        6,
		reach:         29,
		hitRate:       58,
		activityLabel: 'Quiet but precise',
		following:     false,
		recentSignals: [coverOf('burial-light'), coverOf('orbital-form'), coverOf('zero-archive')],
	},
];

// 6. Outside the Bubble — signals crossing into your orbit from distant scenes through a specific bridge scout.
export const outsideBubbleItems: Item[] = [
	{ id: 'brass-weather', title: 'Brass Weather', artist: 'South Facing',    scouts: 22, genre: 'Jazz',       type: 'Album', image: coverOf('brass-weather'), featured: true, crossingPath: 'ambient → spiritual jazz',  sourceScoutId: 'alice', routeNarrative: "Through Alice"          },
	{ id: 'loud-harbour',  title: 'Loud Harbour',  artist: 'Dock Street',     scouts: 18, genre: 'Post-Punk',  image: coverOf('loud-harbour'),                  crossingPath: 'drone → post-punk',          sourceScoutId: 'marco', routeNarrative: "Marco's drone branch"   },
	{ id: 'red-satellite', title: 'Red Satellite', artist: 'Power Station',   scouts: 31, genre: 'Industrial', image: coverOf('red-satellite'),                 crossingPath: 'noise → industrial',         sourceScoutId: 'yuki',  routeNarrative: "Yuki orbit"             },
	{ id: 'paper-engine',  title: 'Paper Engine',  artist: 'The Office Club', scouts: 9,  genre: 'R&B',        image: coverOf('paper-engine'),                  crossingPath: 'electronic → soul',          sourceScoutId: 'dan',   routeNarrative: "via Dan"                },
	{ id: 'signal-green',  title: 'Signal Green',  artist: 'Grasslands',      scouts: 14, genre: 'Country',    image: coverOf('signal-green'),                  crossingPath: 'folk → alt-country',         sourceScoutId: 'alice', routeNarrative: "Alice's folk orbit"     },
];

// 7. Origin Stories — global historical propagation, NOT personal discovery routes.
// This lane intentionally documents how signals evolved through the network.
// `multiOrigin` remains valid here only for stories where the data literally is
// multi-origin (independent-origins). Other story types have a single origin
// but diverge / breakout / persist / bridge from there.
export const originItems: OriginItem[] = [
	{
		id: 'forest-mouth',    title: 'Forest Mouth',    artist: 'Haul',            genre: 'Experimental',
		image: coverOf('forest-mouth'), reachedScouts: 18, discoveries: 3,
		branch:       'Independent origins across separate scenes',
		headline:     'Three scouts surfaced this independently before it spread',
		seedLocation: 'Łódź',
		storyType:    'independent-origins',
		multiOrigin:  true,
	},
	{
		id: 'iron-coast',      title: 'Iron Coast',      artist: 'The Meridian',    genre: 'Drone',
		image: coverOf('iron-coast'), reachedScouts: 12, discoveries: 1,
		branch:       'Cross-scene divergence from Halifax',
		headline:     'Ambient and industrial branches carried this signal in different directions',
		seedLocation: 'Halifax',
		storyType:    'cross-scene-spread',
	},
	{
		id: 'weight-of-cloud', title: 'Weight of Cloud', artist: 'Six Months',      genre: 'Ambient',
		image: coverOf('weight-of-cloud'), reachedScouts: 31, discoveries: 1,
		branch:       'Dormant for weeks before the network noticed',
		headline:     'Months underground, then rapid propagation',
		seedLocation: 'Copenhagen',
		storyType:    'dormant-breakout',
	},
	{
		id: 'radio-silt',      title: 'Radio Silt',      artist: 'Current Source',  genre: 'Electronic',
		image: coverOf('radio-silt'), reachedScouts: 4, discoveries: 1,
		branch:       'Persistent low-volume circulation',
		headline:     'A small branch quietly kept this signal alive for years',
		seedLocation: 'Reykjavík',
		storyType:    'quiet-persistence',
	},
	{
		id: 'still-margin',    title: 'Still Margin',    artist: 'Null Point',      genre: 'Experimental',
		image: coverOf('still-margin'), reachedScouts: 14, discoveries: 1,
		branch:       'Single bridge connection across scenes',
		headline:     'One scout bridged two distant listening circles',
		seedLocation: 'Vienna',
		storyType:    'bridge-scout-event',
	},
];
