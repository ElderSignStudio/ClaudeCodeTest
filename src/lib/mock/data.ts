/*
	Outer Signal — centralized mock data.
	Structured as a multi-lane discovery system.
	All arrays are shaped like real API responses so load() functions
	can replace these imports directly when a backend is added.

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
	badge?: string;
	adjacencyReason?: string;
	lifeLabel?: 'Early' | 'Emerging' | 'Quiet' | 'Spreading'; // signal momentum label for One Step Away lane
	whisperHint?: string; // editorial hint for Deep Underground lane — one of a fixed allowed set
	sparks?: number;
	tags?: string[];
	locality?: string;
	whyHere?: string;          // network-distance explanation for Outside the Bubble lane
	crossingPath?: string;     // scene-crossing metadata, e.g. "ambient → spiritual jazz"
	orbitState?: string;       // proximity-based pill label for Best Picks lane, e.g. "Closely Orbiting"
	resonanceContext?: string; // network resonance context line for Best Picks lane
	multiOrigin?: boolean;     // signal emerged independently from multiple scout circles — surfaces a tiny topology marker in the metadata region
};

export type GainingItem = {
	id: string;
	title: string;
	artist: string;
	scouts: number;
	genre: string;
	image: string;
	growth: number;
	trend: 'rising' | 'surging';
	weeklyScouts?: number;  // new scouts added this week
	sparksToday?: number;   // amplifications today
	resonance?: number;     // 0–100, drives the resonance bar fill
	tag?: 'Rising' | 'Surging' | 'Breakthrough';
	spreadReason?: string;  // how this signal is propagating — editorial phrase from a fixed allowed set
	emitsAmbientGlow?: boolean;  // marks the card as an "ambient emitter" — gets the image-derived halo/bloom treatment in BreakingOutLane. Editorial decision, decoupled from item identity.
	multiOrigin?: boolean;  // signal emerged independently from multiple scout circles — surfaces a tiny topology marker in the metadata region
};

export type HumanSignalItem = {
	id: string;
	title: string;
	artist: string;
	scouts: number;
	genre: string;
	image: string;
	userContext: string; // e.g. "Dan amplified this"
};

export type StoryType =
	| 'independent-discovery'
	| 'bridge-crossing'
	| 'slow-burn'
	| 'sudden-bloom'
	| 'convergent-paths'
	| 'isolated-artifact'
	| 'origin-hub';

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
	multiOrigin?: boolean;  // signal emerged independently from multiple scout circles — surfaces a tiny topology marker in the metadata region
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

// 1. For You — personalized signals based on user taste
export const forYouItems: Item[] = [
	{ id: 'frozen-sun',         title: 'Frozen Sun',         artist: 'Obscure Slovenian Band', scouts: 1,  genre: 'Ambient',      type: 'Song',  image: coverOf('frozen-sun'),         featured: true, orbitState: 'Closely Orbiting', resonanceContext: 'Resonating across your late-night ambient branch'      },
	{ id: 'night-forest',       title: 'Night Forest',       artist: 'Pale Atelier',           scouts: 53, genre: 'Drone',        type: 'Album', image: coverOf('night-forest'),                        orbitState: 'Strong Resonance',  resonanceContext: 'Reappearing among scouts you follow'                    },
	{ id: 'wolves-under-glass', title: 'Wolves Under Glass', artist: 'Aesthian Ritual',        scouts: 7,  genre: 'Experimental', type: 'Song',  image: coverOf('wolves-under-glass'),                  orbitState: 'Near Your Branch',  resonanceContext: 'Quiet overlap with your drone listening patterns'       },
	{ id: 'ashes-in-snow',      title: 'Ashes in Snow',      artist: 'Meridian Depth',         scouts: 12, genre: 'Folk',         type: 'Song',  image: coverOf('ashes-in-snow'),                       orbitState: 'Quiet Match',       resonanceContext: 'Surfacing near your experimental folk orbit'            },
	{ id: 'pale-static',        title: 'Pale Static',        artist: 'Meridian Line',          scouts: 4,  genre: 'Electronic',   type: 'Song',  image: coverOf('pale-static'),                         orbitState: 'Drifting Closer',   resonanceContext: 'Frequently amplified by adjacent ambient scouts'        },
];

// 2. One Step Away — adjacent discovery, related but not obvious
export const oneStepAwayItems: Item[] = [
	{ id: 'edge-of-field',  title: 'Edge of Field',  artist: 'Dusk Bureau',  scouts: 6,  genre: 'Ambient',      image: coverOf('edge-of-field'),  badge: 'Adjacent', adjacencyReason: 'From scouts who explore ambient',              lifeLabel: 'Emerging'  },
	{ id: 'iron-weather',   title: 'Iron Weather',   artist: 'Pale Motion',  scouts: 9,  genre: 'Drone',        image: coverOf('iron-weather'),   badge: 'Adjacent', adjacencyReason: 'From scouts exploring adjacent genres',         lifeLabel: 'Spreading', multiOrigin: true },
	{ id: 'soft-collapse',  title: 'Soft Collapse',  artist: 'Terrain',      scouts: 3,  genre: 'Electronic',   image: coverOf('soft-collapse'),  badge: 'Adjacent', adjacencyReason: 'From scouts with similar taste',                lifeLabel: 'Early'     },
	{ id: 'slow-satellite', title: 'Slow Satellite', artist: 'White Canvas', scouts: 11, genre: 'Experimental', image: coverOf('slow-satellite'), badge: 'Adjacent', adjacencyReason: 'From listeners close to your orbit',            lifeLabel: 'Spreading', multiOrigin: true },
	{ id: 'minor-current',  title: 'Minor Current',  artist: 'Field Notes',  scouts: 2,  genre: 'Folk',         image: coverOf('minor-current'),  badge: 'Adjacent', adjacencyReason: 'From nearby listening circles',                 lifeLabel: 'Quiet'     },
	{ id: 'glass-signal',   title: 'Glass Signal',   artist: 'Pale Archive', scouts: 5,  genre: 'Post-Rock',    image: coverOf('glass-signal'),   badge: 'Adjacent', adjacencyReason: 'From scouts exploring outside your usual taste', lifeLabel: 'Emerging'  },
];

// 3. Deep Underground — very obscure, barely discovered
export const deepUndergroundItems: Item[] = [
	{ id: 'dust-choir',    title: 'Dust Choir',    artist: 'Mare Internum',   scouts: 1, sparks: 0, genre: 'Ambient',      image: coverOf('dust-choir'),    badge: 'Deep', tags: ['Field recording', 'Self-released'], locality: 'Slovenia', whisperHint: 'Barely surfaced'                      },
	{ id: 'neon-veda',     title: 'Neon Veda',     artist: '3 Scouts',        scouts: 3, sparks: 1, genre: 'Electronic',   image: coverOf('neon-veda'),     badge: 'Deep', tags: ['Cassette'],                         locality: 'Poland',   whisperHint: 'Circulating quietly in small circles' },
	{ id: 'orbital-form',  title: 'Orbital Form',  artist: 'Ultra Obscure',   scouts: 0, sparks: 0, genre: 'Experimental', image: coverOf('orbital-form'),  badge: 'Deep', tags: ['Ultra obscure', 'No label'],        locality: 'Unknown',  whisperHint: 'No clear origin yet'                  },
	{ id: 'silver-coast',  title: 'Silver Coast',  artist: 'Unnamed Project', scouts: 1, sparks: 0, genre: 'Folk',         image: coverOf('silver-coast'),  badge: 'Deep', tags: ['Demo'],                             locality: 'Halifax',  whisperHint: 'Found in isolation, off the grid'     },
	{ id: 'hollow-ritual', title: 'Hollow Ritual', artist: 'Cave Press',      scouts: 2, sparks: 1, genre: 'Drone',        image: coverOf('hollow-ritual'), badge: 'Deep', tags: ['Cassette rip'],                     locality: 'Romania',  whisperHint: 'One scout found it before anyone else' },
	{ id: 'static-bloom',  title: 'Static Bloom',  artist: 'Margin Signal',   scouts: 1, sparks: 0, genre: 'Ambient',      image: coverOf('static-bloom'),  badge: 'Deep', tags: ['No label', 'Self-released'],        locality: 'Estonia',  whisperHint: 'Found at the edge of the map'         },
	{ id: 'zero-archive',  title: 'Zero Archive',  artist: 'Unknown',         scouts: 0, sparks: 0, genre: 'Experimental', image: coverOf('zero-archive'),  badge: 'Deep', tags: ['Ultra obscure'],                    locality: 'Unknown',  whisperHint: 'Untracked signal'                     },
];

// 4. Breaking Out — signals gaining traction fast
export const breakingOutItems: GainingItem[] = [
	{ id: 'ember-field',    title: 'Ember Field',    artist: 'Pale Iris',     scouts: 8,  genre: 'Electronic',   image: coverOf('ember-field'),    growth: 6, trend: 'surging', weeklyScouts: 6,  sparksToday: 2, resonance: 65, tag: 'Surging',      spreadReason: 'Spreading from ambient circles',      emitsAmbientGlow: true, multiOrigin: true },
	{ id: 'low-orbit',      title: 'Low Orbit',      artist: 'Contour',       scouts: 14, genre: 'Ambient',      image: coverOf('low-orbit'),      growth: 9, trend: 'surging', weeklyScouts: 9,  sparksToday: 3, resonance: 82, tag: 'Breakthrough', spreadReason: 'Moving beyond its first cluster',     multiOrigin: true      },
	{ id: 'mirror-static',  title: 'Mirror Static',  artist: 'Pale Signal',   scouts: 5,  genre: 'Drone',        image: coverOf('mirror-static'),  growth: 3, trend: 'rising',  weeklyScouts: 3,  sparksToday: 1, resonance: 38, tag: 'Rising',       spreadReason: 'Crossing into adjacent scenes'        },
	{ id: 'pale-cathedral', title: 'Pale Cathedral', artist: 'Herd of Birds', scouts: 11, genre: 'Experimental', image: coverOf('pale-cathedral'), growth: 7, trend: 'surging', weeklyScouts: 7,  sparksToday: 2, resonance: 72, tag: 'Surging',      spreadReason: 'Picked up by high-trust scouts',      multiOrigin: true      },
	{ id: 'ground-hum',     title: 'Ground Hum',     artist: 'Vessel',        scouts: 3,  genre: 'Electronic',   image: coverOf('ground-hum'),     growth: 2, trend: 'rising',  weeklyScouts: 2,  sparksToday: 1, resonance: 28, tag: 'Rising',       spreadReason: 'Reaching new listening circles'       },
];

// 5. Human Signals — discovery driven by real people
export const humanSignalItems: HumanSignalItem[] = [
	{ id: 'cinder-plain', title: 'Cinder Plain', artist: 'Hoarfrost',      scouts: 4, genre: 'Ambient',      image: coverOf('cinder-plain'), userContext: 'Dan amplified this'           },
	{ id: 'open-window',  title: 'Open Window',  artist: 'Still Life',     scouts: 2, genre: 'Folk',         image: coverOf('open-window'),  userContext: 'Alice discovered this'        },
	{ id: 'radio-silt',   title: 'Radio Silt',   artist: 'Current Source', scouts: 7, genre: 'Electronic',   image: coverOf('radio-silt'),   userContext: 'Marco is early on this scene' },
	{ id: 'burial-light', title: 'Burial Light', artist: 'Three Thousand', scouts: 1, genre: 'Experimental', image: coverOf('burial-light'), userContext: 'Yuki found this last week'    },
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

// 6. Outside the Bubble — intentionally different from user taste
export const outsideBubbleItems: Item[] = [
	{ id: 'brass-weather', title: 'Brass Weather', artist: 'South Facing',    scouts: 22, genre: 'Jazz',       type: 'Album', image: coverOf('brass-weather'), badge: 'Unexpected', featured: true, crossingPath: 'ambient → spiritual jazz',  whyHere: 'Reached your branch through low-overlap scouts from adjacent jazz circles',  multiOrigin: true },
	{ id: 'loud-harbour',  title: 'Loud Harbour',  artist: 'Dock Street',     scouts: 18, genre: 'Post-Punk',  image: coverOf('loud-harbour'),  badge: 'Unexpected',                crossingPath: 'drone → post-punk',          whyHere: 'Crossing from drone listeners into neighboring post-punk territory'           },
	{ id: 'red-satellite', title: 'Red Satellite', artist: 'Power Station',   scouts: 31, genre: 'Industrial', image: coverOf('red-satellite'), badge: 'Unexpected',                crossingPath: 'noise → industrial',         whyHere: 'Arrived through weak ties in experimental noise networks',                    multiOrigin: true },
	{ id: 'paper-engine',  title: 'Paper Engine',  artist: 'The Office Club', scouts: 9,  genre: 'R&B',        image: coverOf('paper-engine'),  badge: 'Unexpected',                crossingPath: 'electronic → soul',          whyHere: 'Shared by scouts sitting at the far edge of your cluster'                    },
	{ id: 'signal-green',  title: 'Signal Green',  artist: 'Grasslands',      scouts: 14, genre: 'Country',    image: coverOf('signal-green'),  badge: 'Unexpected',                crossingPath: 'folk → alt-country',         whyHere: 'Emerged from neighboring folk scenes through bridge scouts',                  multiOrigin: true },
];

// 7. Origin Stories — how signals spread and propagate
export const originItems: OriginItem[] = [
	{
		id: 'forest-mouth',    title: 'Forest Mouth',    artist: 'Haul',            genre: 'Experimental',
		image: coverOf('forest-mouth'), reachedScouts: 18, discoveries: 3,
		branch:       'Branch growing from Łódź',
		headline:     'Three scouts found this independently before it spread',
		seedLocation: 'Łódź',
		storyType:    'independent-discovery',
		multiOrigin:  true,
	},
	{
		id: 'iron-coast',      title: 'Iron Coast',      artist: 'The Meridian',    genre: 'Drone',
		image: coverOf('iron-coast'), reachedScouts: 12, discoveries: 2,
		branch:       'Spreading from Halifax',
		headline:     'Two separate paths reached the same signal from different scenes',
		seedLocation: 'Halifax',
		storyType:    'convergent-paths',
		multiOrigin:  true,
	},
	{
		id: 'weight-of-cloud', title: 'Weight of Cloud', artist: 'Six Months',      genre: 'Ambient',
		image: coverOf('weight-of-cloud'), reachedScouts: 31, discoveries: 6,
		branch:       'Started in Copenhagen',
		headline:     'From one spark in Copenhagen to 31 scouts across six branches',
		seedLocation: 'Copenhagen',
		storyType:    'origin-hub',
	},
];

// 8. Explore / Drift — mixed discovery, no algorithm, let it wander
export const driftItems: Item[] = [
	{ id: 'pale-verge',    title: 'Pale Verge',    artist: 'The Outline',   scouts: 5,  genre: 'Ambient',      image: coverOf('pale-verge')    },
	{ id: 'hollow-coast',  title: 'Hollow Coast',  artist: 'Shore Signal',  scouts: 3,  genre: 'Drone',        image: coverOf('hollow-coast')  },
	{ id: 'tape-weather',  title: 'Tape Weather',  artist: 'Archive Unit',  scouts: 8,  genre: 'Electronic',   image: coverOf('tape-weather')  },
	{ id: 'still-margin',  title: 'Still Margin',  artist: 'Null Point',    scouts: 2,  genre: 'Experimental', image: coverOf('still-margin')  },
	{ id: 'soft-border',   title: 'Soft Border',   artist: 'Liminal State', scouts: 11, genre: 'Folk',         image: coverOf('soft-border')   },
	{ id: 'cold-dispatch', title: 'Cold Dispatch', artist: 'Wire Theory',   scouts: 6,  genre: 'Post-Punk',    image: coverOf('cold-dispatch') },
];
