/*
	Outer Signal — centralized mock data.
	All arrays are shaped like real API responses so load() functions
	can replace these imports directly when a backend is added.
*/

export type Item = {
	id: string;
	title: string;
	artist: string;
	scouts: number;
	genre: string;
	featured?: boolean;
};

export type GainingItem = {
	id: string;
	title: string;
	artist: string;
	scouts: number;
	genre: string;
	growth: number;           // scout count increase this week
	trend: 'rising' | 'surging';
};

export type DeepItem = {
	id: string;
	title: string;
	artist: string;
	scouts: number;
	genre: string;
	note: string;             // editorial note — the "origin story"
	origin: string;           // geographic/contextual origin
};

export const forYouItems: Item[] = [
	{ id: 'frozen-sun',         title: 'Frozen Sun',         artist: 'Obscure Slovenian Band', scouts: 1,  genre: 'Ambient',      featured: true },
	{ id: 'night-forest',       title: 'Night Forest',       artist: 'Album',                  scouts: 53, genre: 'Drone' },
	{ id: 'wolves-under-glass', title: 'Wolves Under Glass', artist: 'Aesthian Ritual',        scouts: 7,  genre: 'Experimental' },
	{ id: 'ashes-in-snow',      title: 'Ashes in Snow',      artist: 'Demo',                   scouts: 12, genre: 'Folk' },
	{ id: 'pale-static',        title: 'Pale Static',        artist: 'Meridian Line',          scouts: 4,  genre: 'Electronic' },
];

export const gainingItems: GainingItem[] = [
	{ id: 'ember-field',    title: 'Ember Field',    artist: 'Pale Iris',    scouts: 8,  genre: 'Electronic',  growth: 6, trend: 'surging' },
	{ id: 'low-orbit',      title: 'Low Orbit',      artist: 'Contour',      scouts: 14, genre: 'Ambient',     growth: 9, trend: 'surging' },
	{ id: 'mirror-static',  title: 'Mirror Static',  artist: 'Pale Signal',  scouts: 5,  genre: 'Drone',       growth: 3, trend: 'rising'  },
	{ id: 'pale-cathedral', title: 'Pale Cathedral', artist: 'Herd of Birds',scouts: 11, genre: 'Experimental',growth: 7, trend: 'surging' },
	{ id: 'ground-hum',     title: 'Ground Hum',     artist: 'Vessel',       scouts: 3,  genre: 'Electronic',  growth: 2, trend: 'rising'  },
];

export const weakSignals: Item[] = [
	{ id: 'dust-choir',   title: 'Dust Choir',   artist: 'Mare Internum',   scouts: 1, genre: 'Ambient'      },
	{ id: 'neon-veda',    title: 'Neon Veda',    artist: '3 Scouts',        scouts: 3, genre: 'Electronic'   },
	{ id: 'orbital-form', title: 'Orbital Form', artist: 'Ultra Obscure',   scouts: 0, genre: 'Experimental' },
	{ id: 'silver-coast', title: 'Silver Coast', artist: 'Unnamed Project', scouts: 1, genre: 'Folk'         },
];

export const deepFieldItems: DeepItem[] = [
	{
		id: 'forest-mouth',
		title: 'Forest Mouth',
		artist: 'Haul',
		scouts: 2,
		genre: 'Experimental',
		note: 'Recorded in a decommissioned warehouse in Łódź. No label, no press.',
		origin: 'Poland',
	},
	{
		id: 'iron-coast',
		title: 'Iron Coast',
		artist: 'The Meridian',
		scouts: 1,
		genre: 'Drone',
		note: 'Self-released on a run of 50 cassettes. No second release found.',
		origin: 'Halifax, NS',
	},
	{
		id: 'weight-of-cloud',
		title: 'Weight of Cloud',
		artist: 'Six Months',
		scouts: 4,
		genre: 'Ambient',
		note: 'A solo project from a former jazz drummer. One album, 2019.',
		origin: 'Copenhagen',
	},
	{
		id: 'slow-burn-atlas',
		title: 'Slow Burn Atlas',
		artist: 'No Name Project',
		scouts: 0,
		genre: 'Folk',
		note: 'Uploaded once, no artist profile, no other releases found.',
		origin: 'Unknown',
	},
];
