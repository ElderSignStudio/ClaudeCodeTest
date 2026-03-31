/*
	Outer Signal — centralized mock data.
	Structured as a multi-lane discovery system.
	All arrays are shaped like real API responses so load() functions
	can replace these imports directly when a backend is added.

	Images: picsum.photos seed-based URLs — deterministic per item id.
*/

export type Item = {
	id: string;
	title: string;
	artist: string;
	scouts: number;
	genre: string;
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
};

// Helper: consistent picsum URL from an id string
function img(seed: string, w = 600, h = 600): string {
	return `https://picsum.photos/seed/${seed}/${w}/${h}`;
}

// 1. For You — personalized signals based on user taste
export const forYouItems: Item[] = [
	{ id: 'frozen-sun',         title: 'Frozen Sun',         artist: 'Obscure Slovenian Band', scouts: 1,  genre: 'Ambient',      image: img('frozen-sun', 800, 500), featured: true },
	{ id: 'night-forest',       title: 'Night Forest',       artist: 'Album',                  scouts: 53, genre: 'Drone',        image: img('night-forest')    },
	{ id: 'wolves-under-glass', title: 'Wolves Under Glass', artist: 'Aesthian Ritual',        scouts: 7,  genre: 'Experimental', image: img('wolves-glass')    },
	{ id: 'ashes-in-snow',      title: 'Ashes in Snow',      artist: 'Demo',                   scouts: 12, genre: 'Folk',         image: img('ashes-snow')      },
	{ id: 'pale-static',        title: 'Pale Static',        artist: 'Meridian Line',          scouts: 4,  genre: 'Electronic',   image: img('pale-static')     },
];

// 2. One Step Away — adjacent discovery, related but not obvious
export const oneStepAwayItems: Item[] = [
	{ id: 'edge-of-field',  title: 'Edge of Field',  artist: 'Dusk Bureau',  scouts: 6,  genre: 'Ambient',      image: img('edge-field'),     badge: 'Adjacent', adjacencyReason: 'Because you explore ambient'     },
	{ id: 'iron-weather',   title: 'Iron Weather',   artist: 'Pale Motion',  scouts: 9,  genre: 'Drone',        image: img('iron-weather'),   badge: 'Adjacent', adjacencyReason: 'Adjacent to drone field'         },
	{ id: 'soft-collapse',  title: 'Soft Collapse',  artist: 'Terrain',      scouts: 3,  genre: 'Electronic',   image: img('soft-collapse'),  badge: 'Adjacent', adjacencyReason: 'Shared listeners'                },
	{ id: 'slow-satellite', title: 'Slow Satellite', artist: 'White Canvas', scouts: 11, genre: 'Experimental', image: img('slow-satellite'), badge: 'Adjacent', adjacencyReason: 'Nearby signal'                   },
	{ id: 'minor-current',  title: 'Minor Current',  artist: 'Field Notes',  scouts: 2,  genre: 'Folk',         image: img('minor-current'),  badge: 'Adjacent', adjacencyReason: 'From similar scouts'             },
	{ id: 'glass-signal',   title: 'Glass Signal',   artist: 'Pale Archive', scouts: 5,  genre: 'Post-Rock',    image: img('glass-signal'),   badge: 'Adjacent', adjacencyReason: 'Adjacent to ambient black metal' },
];

// 3. Deep Underground — very obscure, barely discovered
export const deepUndergroundItems: Item[] = [
	{ id: 'dust-choir',    title: 'Dust Choir',    artist: 'Mare Internum',   scouts: 1, sparks: 0, genre: 'Ambient',      image: img('dust-choir'),    badge: 'Deep', tags: ['Field recording', 'Self-released'], locality: 'Slovenia'  },
	{ id: 'neon-veda',     title: 'Neon Veda',     artist: '3 Scouts',        scouts: 3, sparks: 1, genre: 'Electronic',   image: img('neon-veda'),     badge: 'Deep', tags: ['Cassette'],                         locality: 'Poland'    },
	{ id: 'orbital-form',  title: 'Orbital Form',  artist: 'Ultra Obscure',   scouts: 0, sparks: 0, genre: 'Experimental', image: img('orbital-form'),  badge: 'Deep', tags: ['Ultra obscure', 'No label'],        locality: 'Unknown'   },
	{ id: 'silver-coast',  title: 'Silver Coast',  artist: 'Unnamed Project', scouts: 1, sparks: 0, genre: 'Folk',         image: img('silver-coast'),  badge: 'Deep', tags: ['Demo'],                              locality: 'Halifax'   },
	{ id: 'hollow-ritual', title: 'Hollow Ritual', artist: 'Cave Press',      scouts: 2, sparks: 1, genre: 'Drone',        image: img('hollow-ritual'), badge: 'Deep', tags: ['Cassette rip'],                     locality: 'Romania'   },
	{ id: 'static-bloom',  title: 'Static Bloom',  artist: 'Margin Signal',   scouts: 1, sparks: 0, genre: 'Ambient',      image: img('static-bloom'),  badge: 'Deep', tags: ['No label', 'Self-released'],        locality: 'Estonia'   },
	{ id: 'zero-archive',  title: 'Zero Archive',  artist: 'Unknown',         scouts: 0, sparks: 0, genre: 'Experimental', image: img('zero-archive'),  badge: 'Deep', tags: ['Ultra obscure'],                    locality: 'Unknown'   },
];

// 4. Breaking Out — signals gaining traction fast
export const breakingOutItems: GainingItem[] = [
	{ id: 'ember-field',    title: 'Ember Field',    artist: 'Pale Iris',     scouts: 8,  genre: 'Electronic',   image: img('ember-field'),    growth: 6, trend: 'surging', weeklyScouts: 6,  sparksToday: 2, resonance: 65 },
	{ id: 'low-orbit',      title: 'Low Orbit',      artist: 'Contour',       scouts: 14, genre: 'Ambient',      image: img('low-orbit'),      growth: 9, trend: 'surging', weeklyScouts: 9,  sparksToday: 3, resonance: 82 },
	{ id: 'mirror-static',  title: 'Mirror Static',  artist: 'Pale Signal',   scouts: 5,  genre: 'Drone',        image: img('mirror-static'),  growth: 3, trend: 'rising',  weeklyScouts: 3,  sparksToday: 1, resonance: 38 },
	{ id: 'pale-cathedral', title: 'Pale Cathedral', artist: 'Herd of Birds', scouts: 11, genre: 'Experimental', image: img('pale-cathedral'), growth: 7, trend: 'surging', weeklyScouts: 7,  sparksToday: 2, resonance: 72 },
	{ id: 'ground-hum',     title: 'Ground Hum',     artist: 'Vessel',        scouts: 3,  genre: 'Electronic',   image: img('ground-hum'),     growth: 2, trend: 'rising',  weeklyScouts: 2,  sparksToday: 1, resonance: 28 },
];

// 5. Human Signals — discovery driven by real people
export const humanSignalItems: HumanSignalItem[] = [
	{ id: 'cinder-plain', title: 'Cinder Plain', artist: 'Hoarfrost',      scouts: 4, genre: 'Ambient',      image: img('cinder-plain', 80, 80), userContext: 'Dan amplified this'           },
	{ id: 'open-window',  title: 'Open Window',  artist: 'Still Life',     scouts: 2, genre: 'Folk',         image: img('open-window',  80, 80), userContext: 'Alice discovered this'        },
	{ id: 'radio-silt',   title: 'Radio Silt',   artist: 'Current Source', scouts: 7, genre: 'Electronic',   image: img('radio-silt',   80, 80), userContext: 'Marco is early on this scene' },
	{ id: 'burial-light', title: 'Burial Light', artist: 'Three Thousand', scouts: 1, genre: 'Experimental', image: img('burial-light', 80, 80), userContext: 'Yuki found this last week'    },
];

// Scout: a person-card type for the Human Signals lane.
// Completely separate from Item — this represents a curator, not content.
export type Scout = {
	id: string;
	name: string;
	avatar: string;         // DiceBear URL
	tasteProfile: string;   // e.g. "Obscure prog · dark folk · lost tapes"
	earlySignals: number;   // total early sparks they've contributed
	resonance: 'High' | 'Medium' | 'Low';
	hitRate: number;        // percentage of early picks that later gained traction
	activityLabel?: string; // e.g. "New spark today" — shown as a badge when present
	following: boolean;     // whether the current user follows this scout
	recentSignals: string[]; // small picsum image URLs for the thumbnail strip
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
		earlySignals:  8,
		resonance:     'High',
		hitRate:       72,
		activityLabel: 'New spark today',
		following:     true,
		recentSignals: [img('dust-choir', 80, 80), img('forest-mouth', 80, 80), img('pale-static', 80, 80), img('neon-veda', 80, 80), img('iron-weather', 80, 80)],
	},
	{
		id:            'alice',
		name:          'Alice',
		avatar:        avatar('AliceSignal'),
		tasteProfile:  'Brazilian psych · strange collage · obscure finds',
		earlySignals:  14,
		resonance:     'High',
		hitRate:       68,
		activityLabel: 'Signal gaining resonance',
		following:     true,
		recentSignals: [img('ember-field', 80, 80), img('open-window', 80, 80), img('iron-coast', 80, 80), img('brass-weather', 80, 80), img('low-orbit', 80, 80)],
	},
	{
		id:           'marco',
		name:         'Marco',
		avatar:       avatar('MarcoAmb'),
		tasteProfile: 'Ambient · ritual · sonic geography',
		earlySignals: 22,
		resonance:    'High',
		hitRate:      70,
		following:    false,
		recentSignals: [img('low-orbit', 80, 80), img('cinder-plain', 80, 80), img('weight-cloud', 80, 80), img('slow-satellite', 80, 80), img('mirror-static', 80, 80)],
	},
	{
		id:            'yuki',
		name:          'Yuki',
		avatar:        avatar('YukiDeep'),
		tasteProfile:  'Early experimental · field recordings · micro-scenes',
		earlySignals:  6,
		resonance:     'Medium',
		hitRate:       58,
		activityLabel: 'New amplify',
		following:     false,
		recentSignals: [img('burial-light', 80, 80), img('orbital-form', 80, 80), img('zero-archive', 80, 80), img('silver-coast', 80, 80), img('hollow-ritual', 80, 80)],
	},
];

// 6. Outside the Bubble — intentionally different from user taste
export const outsideBubbleItems: Item[] = [
	{ id: 'brass-weather', title: 'Brass Weather', artist: 'South Facing',    scouts: 22, genre: 'Jazz',       image: img('brass-weather'), badge: 'Unexpected', featured: true, whyHere: 'Scouts you trust in dark ambient and neofolk have been amplifying this — even though it lives far outside those scenes. Something crosses over here.'          },
	{ id: 'loud-harbour',  title: 'Loud Harbour',  artist: 'Dock Street',     scouts: 18, genre: 'Post-Punk',  image: img('loud-harbour'),  badge: 'Unexpected',                whyHere: 'Breaking through via listeners who usually live in drone and minimalism.'  },
	{ id: 'red-satellite', title: 'Red Satellite', artist: 'Power Station',   scouts: 31, genre: 'Industrial', image: img('red-satellite'), badge: 'Unexpected',                whyHere: 'Found by a trusted curator far outside your usual orbit.'                },
	{ id: 'paper-engine',  title: 'Paper Engine',  artist: 'The Office Club', scouts: 9,  genre: 'R&B',        image: img('paper-engine'),  badge: 'Unexpected',                whyHere: 'Surfaced by curators with overlapping taste'                             },
	{ id: 'signal-green',  title: 'Signal Green',  artist: 'Grasslands',      scouts: 14, genre: 'Country',    image: img('signal-green'),  badge: 'Unexpected',                whyHere: 'Shared listeners found this across genre lines'                          },
];

// 7. Origin Stories — how signals spread and propagate
export const originItems: OriginItem[] = [
	{
		id: 'forest-mouth',    title: 'Forest Mouth',    artist: 'Haul',            genre: 'Experimental',
		image: img('forest-mouth',  120, 120), reachedScouts: 18, discoveries: 3,
		branch:       'Branch growing from Łódź',
		headline:     'Three scouts found this independently before it spread',
		seedLocation: 'Łódź, Poland',
	},
	{
		id: 'iron-coast',      title: 'Iron Coast',      artist: 'The Meridian',    genre: 'Drone',
		image: img('iron-coast',    120, 120), reachedScouts: 12, discoveries: 2,
		branch:       'Spreading from Halifax, NS',
		headline:     'Two separate paths reached the same signal from different scenes',
		seedLocation: 'Halifax, NS',
	},
	{
		id: 'weight-of-cloud', title: 'Weight of Cloud', artist: 'Six Months',      genre: 'Ambient',
		image: img('weight-cloud',  120, 120), reachedScouts: 31, discoveries: 6,
		branch:       'Started in Copenhagen',
		headline:     'From one spark in Copenhagen to 31 scouts across six branches',
		seedLocation: 'Copenhagen',
	},
];

// 8. Explore / Drift — mixed discovery, no algorithm, let it wander
export const driftItems: Item[] = [
	{ id: 'pale-verge',    title: 'Pale Verge',    artist: 'The Outline',   scouts: 5,  genre: 'Ambient',      image: img('pale-verge')    },
	{ id: 'hollow-coast',  title: 'Hollow Coast',  artist: 'Shore Signal',  scouts: 3,  genre: 'Drone',        image: img('hollow-coast')  },
	{ id: 'tape-weather',  title: 'Tape Weather',  artist: 'Archive Unit',  scouts: 8,  genre: 'Electronic',   image: img('tape-weather')  },
	{ id: 'still-margin',  title: 'Still Margin',  artist: 'Null Point',    scouts: 2,  genre: 'Experimental', image: img('still-margin')  },
	{ id: 'soft-border',   title: 'Soft Border',   artist: 'Liminal State', scouts: 11, genre: 'Folk',         image: img('soft-border')   },
	{ id: 'cold-dispatch', title: 'Cold Dispatch', artist: 'Wire Theory',   scouts: 6,  genre: 'Post-Punk',    image: img('cold-dispatch') },
];
