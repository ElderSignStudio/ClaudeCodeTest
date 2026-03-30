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
	branch: string; // e.g. "Branch growing from Rome"
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
	{ id: 'edge-of-field',  title: 'Edge of Field',  artist: 'Dusk Bureau',  scouts: 6,  genre: 'Ambient',      image: img('edge-field'),     badge: 'Adjacent' },
	{ id: 'iron-weather',   title: 'Iron Weather',   artist: 'Pale Motion',  scouts: 9,  genre: 'Drone',        image: img('iron-weather'),   badge: 'Adjacent' },
	{ id: 'soft-collapse',  title: 'Soft Collapse',  artist: 'Terrain',      scouts: 3,  genre: 'Electronic',   image: img('soft-collapse'),  badge: 'Adjacent' },
	{ id: 'slow-satellite', title: 'Slow Satellite', artist: 'White Canvas', scouts: 11, genre: 'Experimental', image: img('slow-satellite'), badge: 'Adjacent' },
	{ id: 'minor-current',  title: 'Minor Current',  artist: 'Field Notes',  scouts: 2,  genre: 'Folk',         image: img('minor-current'),  badge: 'Adjacent' },
];

// 3. Deep Underground — very obscure, barely discovered
export const deepUndergroundItems: Item[] = [
	{ id: 'dust-choir',   title: 'Dust Choir',   artist: 'Mare Internum',   scouts: 1, genre: 'Ambient',      image: img('dust-choir',   80, 80), badge: 'Deep' },
	{ id: 'neon-veda',    title: 'Neon Veda',    artist: '3 Scouts',        scouts: 3, genre: 'Electronic',   image: img('neon-veda',    80, 80), badge: 'Deep' },
	{ id: 'orbital-form', title: 'Orbital Form', artist: 'Ultra Obscure',   scouts: 0, genre: 'Experimental', image: img('orbital-form', 80, 80), badge: 'Deep' },
	{ id: 'silver-coast', title: 'Silver Coast', artist: 'Unnamed Project', scouts: 1, genre: 'Folk',         image: img('silver-coast', 80, 80), badge: 'Deep' },
];

// 4. Breaking Out — signals gaining traction fast
export const breakingOutItems: GainingItem[] = [
	{ id: 'ember-field',    title: 'Ember Field',    artist: 'Pale Iris',     scouts: 8,  genre: 'Electronic',   image: img('ember-field'),    growth: 6, trend: 'surging' },
	{ id: 'low-orbit',      title: 'Low Orbit',      artist: 'Contour',       scouts: 14, genre: 'Ambient',      image: img('low-orbit'),      growth: 9, trend: 'surging' },
	{ id: 'mirror-static',  title: 'Mirror Static',  artist: 'Pale Signal',   scouts: 5,  genre: 'Drone',        image: img('mirror-static'),  growth: 3, trend: 'rising'  },
	{ id: 'pale-cathedral', title: 'Pale Cathedral', artist: 'Herd of Birds', scouts: 11, genre: 'Experimental', image: img('pale-cathedral'), growth: 7, trend: 'surging' },
	{ id: 'ground-hum',     title: 'Ground Hum',     artist: 'Vessel',        scouts: 3,  genre: 'Electronic',   image: img('ground-hum'),     growth: 2, trend: 'rising'  },
];

// 5. Human Signals — discovery driven by real people
export const humanSignalItems: HumanSignalItem[] = [
	{ id: 'cinder-plain', title: 'Cinder Plain', artist: 'Hoarfrost',      scouts: 4, genre: 'Ambient',      image: img('cinder-plain', 80, 80), userContext: 'Dan amplified this'           },
	{ id: 'open-window',  title: 'Open Window',  artist: 'Still Life',     scouts: 2, genre: 'Folk',         image: img('open-window',  80, 80), userContext: 'Alice discovered this'        },
	{ id: 'radio-silt',   title: 'Radio Silt',   artist: 'Current Source', scouts: 7, genre: 'Electronic',   image: img('radio-silt',   80, 80), userContext: 'Marco is early on this scene' },
	{ id: 'burial-light', title: 'Burial Light', artist: 'Three Thousand', scouts: 1, genre: 'Experimental', image: img('burial-light', 80, 80), userContext: 'Yuki found this last week'    },
];

// 6. Outside the Bubble — intentionally different from user taste
export const outsideBubbleItems: Item[] = [
	{ id: 'brass-weather', title: 'Brass Weather', artist: 'South Facing',    scouts: 22, genre: 'Jazz',       image: img('brass-weather'), badge: 'Unexpected' },
	{ id: 'loud-harbour',  title: 'Loud Harbour',  artist: 'Dock Street',     scouts: 18, genre: 'Post-Punk',  image: img('loud-harbour'),  badge: 'Unexpected' },
	{ id: 'red-satellite', title: 'Red Satellite', artist: 'Power Station',   scouts: 31, genre: 'Industrial', image: img('red-satellite'), badge: 'Unexpected' },
	{ id: 'paper-engine',  title: 'Paper Engine',  artist: 'The Office Club', scouts: 9,  genre: 'R&B',        image: img('paper-engine'),  badge: 'Unexpected' },
	{ id: 'signal-green',  title: 'Signal Green',  artist: 'Grasslands',      scouts: 14, genre: 'Country',    image: img('signal-green'),  badge: 'Unexpected' },
];

// 7. Origin Stories — how signals spread and propagate
export const originItems: OriginItem[] = [
	{ id: 'forest-mouth',    title: 'Forest Mouth',    artist: 'Haul',            genre: 'Experimental', image: img('forest-mouth',  120, 120), reachedScouts: 18, discoveries: 3, branch: 'Branch growing from Łódź'   },
	{ id: 'iron-coast',      title: 'Iron Coast',      artist: 'The Meridian',    genre: 'Drone',        image: img('iron-coast',    120, 120), reachedScouts: 12, discoveries: 2, branch: 'Spreading from Halifax, NS' },
	{ id: 'weight-of-cloud', title: 'Weight of Cloud', artist: 'Six Months',      genre: 'Ambient',      image: img('weight-cloud',  120, 120), reachedScouts: 31, discoveries: 6, branch: 'Started in Copenhagen'      },
	{ id: 'slow-burn-atlas', title: 'Slow Burn Atlas', artist: 'No Name Project', genre: 'Folk',         image: img('slow-burn',     120, 120), reachedScouts: 7,  discoveries: 1, branch: 'Origin unknown'             },
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
