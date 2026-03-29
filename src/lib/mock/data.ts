/*
	Outer Signal — centralized mock data.
	All arrays are shaped like real API responses so load() functions
	can replace these imports directly when a backend is added.

	Images: picsum.photos seed-based URLs — deterministic per item id.
	Each seed always returns the same image, so IDs double as stable image keys.
	Dimensions are generous (600×600) so they look sharp at any card size.
*/

export type Item = {
	id: string;
	title: string;
	artist: string;
	scouts: number;
	genre: string;
	image: string;
	featured?: boolean;
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

export type DeepItem = {
	id: string;
	title: string;
	artist: string;
	scouts: number;
	genre: string;
	image: string;
	note: string;
	origin: string;
};

// Helper: consistent picsum URL from an id string
function img(seed: string, w = 600, h = 600): string {
	return `https://picsum.photos/seed/${seed}/${w}/${h}`;
}

export const forYouItems: Item[] = [
	{ id: 'frozen-sun',         title: 'Frozen Sun',         artist: 'Obscure Slovenian Band', scouts: 1,  genre: 'Ambient',      image: img('frozen-sun', 800, 500),  featured: true },
	{ id: 'night-forest',       title: 'Night Forest',       artist: 'Album',                  scouts: 53, genre: 'Drone',        image: img('night-forest')     },
	{ id: 'wolves-under-glass', title: 'Wolves Under Glass', artist: 'Aesthian Ritual',        scouts: 7,  genre: 'Experimental', image: img('wolves-glass')     },
	{ id: 'ashes-in-snow',      title: 'Ashes in Snow',      artist: 'Demo',                   scouts: 12, genre: 'Folk',         image: img('ashes-snow')       },
	{ id: 'pale-static',        title: 'Pale Static',        artist: 'Meridian Line',          scouts: 4,  genre: 'Electronic',   image: img('pale-static')      },
];

export const gainingItems: GainingItem[] = [
	{ id: 'ember-field',    title: 'Ember Field',    artist: 'Pale Iris',     scouts: 8,  genre: 'Electronic',  image: img('ember-field'),    growth: 6, trend: 'surging' },
	{ id: 'low-orbit',      title: 'Low Orbit',      artist: 'Contour',       scouts: 14, genre: 'Ambient',     image: img('low-orbit'),      growth: 9, trend: 'surging' },
	{ id: 'mirror-static',  title: 'Mirror Static',  artist: 'Pale Signal',   scouts: 5,  genre: 'Drone',       image: img('mirror-static'),  growth: 3, trend: 'rising'  },
	{ id: 'pale-cathedral', title: 'Pale Cathedral', artist: 'Herd of Birds', scouts: 11, genre: 'Experimental',image: img('pale-cathedral'), growth: 7, trend: 'surging' },
	{ id: 'ground-hum',     title: 'Ground Hum',     artist: 'Vessel',        scouts: 3,  genre: 'Electronic',  image: img('ground-hum'),     growth: 2, trend: 'rising'  },
];

export const weakSignals: Item[] = [
	{ id: 'dust-choir',   title: 'Dust Choir',   artist: 'Mare Internum',   scouts: 1, genre: 'Ambient',      image: img('dust-choir',  80, 80) },
	{ id: 'neon-veda',    title: 'Neon Veda',    artist: '3 Scouts',        scouts: 3, genre: 'Electronic',   image: img('neon-veda',   80, 80) },
	{ id: 'orbital-form', title: 'Orbital Form', artist: 'Ultra Obscure',   scouts: 0, genre: 'Experimental', image: img('orbital-form',80, 80) },
	{ id: 'silver-coast', title: 'Silver Coast', artist: 'Unnamed Project', scouts: 1, genre: 'Folk',         image: img('silver-coast',80, 80) },
];

export const deepFieldItems: DeepItem[] = [
	{
		id: 'forest-mouth',
		title: 'Forest Mouth',
		artist: 'Haul',
		scouts: 2,
		genre: 'Experimental',
		image: img('forest-mouth', 120, 120),
		note: 'Recorded in a decommissioned warehouse in Łódź. No label, no press.',
		origin: 'Poland',
	},
	{
		id: 'iron-coast',
		title: 'Iron Coast',
		artist: 'The Meridian',
		scouts: 1,
		genre: 'Drone',
		image: img('iron-coast', 120, 120),
		note: 'Self-released on a run of 50 cassettes. No second release found.',
		origin: 'Halifax, NS',
	},
	{
		id: 'weight-of-cloud',
		title: 'Weight of Cloud',
		artist: 'Six Months',
		scouts: 4,
		genre: 'Ambient',
		image: img('weight-cloud', 120, 120),
		note: 'A solo project from a former jazz drummer. One album, 2019.',
		origin: 'Copenhagen',
	},
	{
		id: 'slow-burn-atlas',
		title: 'Slow Burn Atlas',
		artist: 'No Name Project',
		scouts: 0,
		genre: 'Folk',
		image: img('slow-burn', 120, 120),
		note: 'Uploaded once, no artist profile, no other releases found.',
		origin: 'Unknown',
	},
];
