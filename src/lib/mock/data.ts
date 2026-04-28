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
	sparks?: number;
	tags?: string[];
	locality?: string;
	whyHere?: string; // explanation of why this item appears in Outside the Bubble
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

export type OriginItem = {
	id: string;
	title: string;
	artist: string;
	genre: string;
	image: string;
	reachedScouts: number;
	discoveries: number;
	branch: string;       // sub-headline, e.g. "Branch growing from Rome"
	headline: string;     // narrative sentence for the Story Card
	seedLocation: string; // where the signal originated
	graphType: 'converging' | 'parallel' | 'spreading';
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
	{ id: 'frozen-sun',         title: 'Frozen Sun',         artist: 'Obscure Slovenian Band', scouts: 1,  genre: 'Ambient',      type: 'Song',  image: coverOf('frozen-sun'),         featured: true },
	{ id: 'night-forest',       title: 'Night Forest',       artist: 'Pale Atelier',           scouts: 53, genre: 'Drone',        type: 'Album', image: coverOf('night-forest')       },
	{ id: 'wolves-under-glass', title: 'Wolves Under Glass', artist: 'Aesthian Ritual',        scouts: 7,  genre: 'Experimental', type: 'Song',  image: coverOf('wolves-under-glass') },
	{ id: 'ashes-in-snow',      title: 'Ashes in Snow',      artist: 'Meridian Depth',         scouts: 12, genre: 'Folk',         type: 'Song',  image: coverOf('ashes-in-snow')      },
	{ id: 'pale-static',        title: 'Pale Static',        artist: 'Meridian Line',          scouts: 4,  genre: 'Electronic',   type: 'Song',  image: coverOf('pale-static')        },
];

// 2. One Step Away — adjacent discovery, related but not obvious
export const oneStepAwayItems: Item[] = [
	{ id: 'edge-of-field',  title: 'Edge of Field',  artist: 'Dusk Bureau',  scouts: 6,  genre: 'Ambient',      image: coverOf('edge-of-field'),  badge: 'Adjacent', adjacencyReason: 'From scouts who explore ambient'     },
	{ id: 'iron-weather',   title: 'Iron Weather',   artist: 'Pale Motion',  scouts: 9,  genre: 'Drone',        image: coverOf('iron-weather'),   badge: 'Adjacent', adjacencyReason: 'Crossed over from drone listeners'         },
	{ id: 'soft-collapse',  title: 'Soft Collapse',  artist: 'Terrain',      scouts: 3,  genre: 'Electronic',   image: coverOf('soft-collapse'),  badge: 'Adjacent', adjacencyReason: 'From scouts with overlapping taste'                },
	{ id: 'slow-satellite', title: 'Slow Satellite', artist: 'White Canvas', scouts: 11, genre: 'Experimental', image: coverOf('slow-satellite'), badge: 'Adjacent', adjacencyReason: 'Close to your orbit'                   },
	{ id: 'minor-current',  title: 'Minor Current',  artist: 'Field Notes',  scouts: 2,  genre: 'Folk',         image: coverOf('minor-current'),  badge: 'Adjacent', adjacencyReason: 'From scouts with overlapping taste'             },
	{ id: 'glass-signal',   title: 'Glass Signal',   artist: 'Pale Archive', scouts: 5,  genre: 'Post-Rock',    image: coverOf('glass-signal'),   badge: 'Adjacent', adjacencyReason: 'Crossed over from ambient black metal' },
];

// 3. Deep Underground — very obscure, barely discovered
export const deepUndergroundItems: Item[] = [
	{ id: 'dust-choir',    title: 'Dust Choir',    artist: 'Mare Internum',   scouts: 1, sparks: 0, genre: 'Ambient',      image: coverOf('dust-choir'),    badge: 'Deep', tags: ['Field recording', 'Self-released'], locality: 'Slovenia'  },
	{ id: 'neon-veda',     title: 'Neon Veda',     artist: '3 Scouts',        scouts: 3, sparks: 1, genre: 'Electronic',   image: coverOf('neon-veda'),     badge: 'Deep', tags: ['Cassette'],                         locality: 'Poland'    },
	{ id: 'orbital-form',  title: 'Orbital Form',  artist: 'Ultra Obscure',   scouts: 0, sparks: 0, genre: 'Experimental', image: coverOf('orbital-form'),  badge: 'Deep', tags: ['Ultra obscure', 'No label'],        locality: 'Unknown'   },
	{ id: 'silver-coast',  title: 'Silver Coast',  artist: 'Unnamed Project', scouts: 1, sparks: 0, genre: 'Folk',         image: coverOf('silver-coast'),  badge: 'Deep', tags: ['Demo'],                              locality: 'Halifax'   },
	{ id: 'hollow-ritual', title: 'Hollow Ritual', artist: 'Cave Press',      scouts: 2, sparks: 1, genre: 'Drone',        image: coverOf('hollow-ritual'), badge: 'Deep', tags: ['Cassette rip'],                     locality: 'Romania'   },
	{ id: 'static-bloom',  title: 'Static Bloom',  artist: 'Margin Signal',   scouts: 1, sparks: 0, genre: 'Ambient',      image: coverOf('static-bloom'),  badge: 'Deep', tags: ['No label', 'Self-released'],        locality: 'Estonia'   },
	{ id: 'zero-archive',  title: 'Zero Archive',  artist: 'Unknown',         scouts: 0, sparks: 0, genre: 'Experimental', image: coverOf('zero-archive'),  badge: 'Deep', tags: ['Ultra obscure'],                    locality: 'Unknown'   },
];

// 4. Breaking Out — signals gaining traction fast
export const breakingOutItems: GainingItem[] = [
	{ id: 'ember-field',    title: 'Ember Field',    artist: 'Pale Iris',     scouts: 8,  genre: 'Electronic',   image: coverOf('ember-field'),    growth: 6, trend: 'surging', weeklyScouts: 6,  sparksToday: 2, resonance: 65, tag: 'Surging'      },
	{ id: 'low-orbit',      title: 'Low Orbit',      artist: 'Contour',       scouts: 14, genre: 'Ambient',      image: coverOf('low-orbit'),      growth: 9, trend: 'surging', weeklyScouts: 9,  sparksToday: 3, resonance: 82, tag: 'Breakthrough' },
	{ id: 'mirror-static',  title: 'Mirror Static',  artist: 'Pale Signal',   scouts: 5,  genre: 'Drone',        image: coverOf('mirror-static'),  growth: 3, trend: 'rising',  weeklyScouts: 3,  sparksToday: 1, resonance: 38                      },
	{ id: 'pale-cathedral', title: 'Pale Cathedral', artist: 'Herd of Birds', scouts: 11, genre: 'Experimental', image: coverOf('pale-cathedral'), growth: 7, trend: 'surging', weeklyScouts: 7,  sparksToday: 2, resonance: 72, tag: 'Surging'      },
	{ id: 'ground-hum',     title: 'Ground Hum',     artist: 'Vessel',        scouts: 3,  genre: 'Electronic',   image: coverOf('ground-hum'),     growth: 2, trend: 'rising',  weeklyScouts: 2,  sparksToday: 1, resonance: 28, tag: 'Rising'       },
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
	sparks: number;         // total signals they've sparked
	reach: number;          // total scouts reached by their signals
	hitRate: number;        // percentage of early picks that later gained traction
	activityLabel?: 'Similar Taste' | 'High Hit Rate' | 'Early Picks';
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
		sparks:        8,
		reach:         41,
		hitRate:       72,
		activityLabel: 'Early Picks',
		following:     true,
		recentSignals: [coverOf('dust-choir'), coverOf('forest-mouth'), coverOf('pale-static')],
	},
	{
		id:            'alice',
		name:          'Alice',
		avatar:        avatar('AliceSignal'),
		tasteProfile:  'Brazilian psych · strange collage · obscure finds',
		sparks:        14,
		reach:         88,
		hitRate:       68,
		activityLabel: 'Similar Taste',
		following:     true,
		recentSignals: [coverOf('ember-field'), coverOf('open-window'), coverOf('iron-coast')],
	},
	{
		id:           'marco',
		name:         'Marco',
		avatar:       avatar('MarcoAmb'),
		tasteProfile: 'Ambient · ritual · sonic geography',
		sparks:       22,
		reach:        134,
		hitRate:      70,
		following:    false,
		recentSignals: [coverOf('low-orbit'), coverOf('cinder-plain'), coverOf('weight-of-cloud')],
	},
	{
		id:            'yuki',
		name:          'Yuki',
		avatar:        avatar('YukiDeep'),
		tasteProfile:  'Early experimental · field recordings · micro-scenes',
		sparks:        6,
		reach:         29,
		hitRate:       58,
		activityLabel: 'High Hit Rate',
		following:     false,
		recentSignals: [coverOf('burial-light'), coverOf('orbital-form'), coverOf('zero-archive')],
	},
];

// 6. Outside the Bubble — intentionally different from user taste
export const outsideBubbleItems: Item[] = [
	{ id: 'brass-weather', title: 'Brass Weather', artist: 'South Facing',    scouts: 22, genre: 'Jazz',       type: 'Album', image: coverOf('brass-weather'), badge: 'Unexpected', featured: true, whyHere: 'Picked up by scouts you trust — far outside your usual taste' },
	{ id: 'loud-harbour',  title: 'Loud Harbour',  artist: 'Dock Street',     scouts: 18, genre: 'Post-Punk',  image: coverOf('loud-harbour'),  badge: 'Unexpected',                whyHere: 'Breaking through via listeners who usually live in drone and minimalism.'  },
	{ id: 'red-satellite', title: 'Red Satellite', artist: 'Power Station',   scouts: 31, genre: 'Industrial', image: coverOf('red-satellite'), badge: 'Unexpected',                whyHere: 'Found by a trusted curator far outside your usual orbit.'                },
	{ id: 'paper-engine',  title: 'Paper Engine',  artist: 'The Office Club', scouts: 9,  genre: 'R&B',        image: coverOf('paper-engine'),  badge: 'Unexpected',                whyHere: 'Surfaced by curators with overlapping taste'                             },
	{ id: 'signal-green',  title: 'Signal Green',  artist: 'Grasslands',      scouts: 14, genre: 'Country',    image: coverOf('signal-green'),  badge: 'Unexpected',                whyHere: 'Shared listeners found this across genre lines'                          },
];

// 7. Origin Stories — how signals spread and propagate
export const originItems: OriginItem[] = [
	{
		id: 'forest-mouth',    title: 'Forest Mouth',    artist: 'Haul',            genre: 'Experimental',
		image: coverOf('forest-mouth'), reachedScouts: 18, discoveries: 3,
		branch:       'Branch growing from Łódź',
		headline:     'Three scouts found this independently before it spread',
		seedLocation: 'Łódź, Poland',
		graphType:    'converging',
	},
	{
		id: 'iron-coast',      title: 'Iron Coast',      artist: 'The Meridian',    genre: 'Drone',
		image: coverOf('iron-coast'), reachedScouts: 12, discoveries: 2,
		branch:       'Spreading from Halifax, NS',
		headline:     'Two separate paths reached the same signal from different scenes',
		seedLocation: 'Halifax, NS',
		graphType:    'parallel',
	},
	{
		id: 'weight-of-cloud', title: 'Weight of Cloud', artist: 'Six Months',      genre: 'Ambient',
		image: coverOf('weight-of-cloud'), reachedScouts: 31, discoveries: 6,
		branch:       'Started in Copenhagen',
		headline:     'From one spark in Copenhagen to 31 scouts across six branches',
		seedLocation: 'Copenhagen',
		graphType:    'spreading',
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
