import { error } from '@sveltejs/kit';
import {
	fromYourScoutsItems,
	trustedScoutsItems,
	forYouItems,
	oneStepAwayItems,
	deepUndergroundItems,
	breakingOutItems,
	outsideBubbleItems,
	originItems,
} from '$lib/mock/data';
import { propagationForestFor } from '$lib/mock/propagation';

/*
	Item Detail load function.

	Items live in six separate arrays with three different TypeScript types
	(Item, GainingItem, OriginItem). We coalesce into a unified `DetailItem`
	shape so the page never has to branch on lane source — it just reads
	whatever fields are present.

	We also resolve which "lane source" the item came from. This is purely so
	the detail page can show contextual breadcrumb-style copy without lying
	about where the user navigated from.
*/

export type DetailItem = {
	id: string;
	title: string;
	artist: string;
	genre: string;
	image: string;
	scouts: number;
	source: 'from-your-scouts' | 'trusted-scouts' | 'best-picks' | 'one-step-away' | 'deep-underground' | 'breaking-out' | 'outside-bubble' | 'origin-stories';
	type?: string;           // 'Song' / 'Album' when Item.type is set
	spreadReason?: string;   // from GainingItem (momentum language)
	crossingPath?: string;   // from OTB items (scene-crossing data)
	whisperHint?: string;    // from DU items (editorial whisper)
	routeNarrative?: string; // from Item / GainingItem (singular discovery route)
	sourceScoutId?: string;  // from Item / GainingItem (source scout id)
	headline?: string;       // from OriginItem (multi-origin historical narrative)
	seedLocation?: string;   // from OriginItem
	tag?: string;            // from GainingItem
};

export const load = ({ params }) => {
	const id = params.id;

	// For Origin Stories items, narrative headline + seedLocation are richer
	// than generic spread/why-here copy, so we surface them.
	const origin = originItems.find(i => i.id === id);
	if (origin) {
		const detail: DetailItem = {
			id: origin.id,
			title: origin.title,
			artist: origin.artist,
			genre: origin.genre,
			image: origin.image,
			scouts: origin.reachedScouts,
			source: 'origin-stories',
			headline: origin.headline,
			seedLocation: origin.seedLocation,
		};
		return { item: detail, forest: propagationForestFor(id, detail.scouts) };
	}

	const gaining = breakingOutItems.find(i => i.id === id);
	if (gaining) {
		const detail: DetailItem = {
			id: gaining.id,
			title: gaining.title,
			artist: gaining.artist,
			genre: gaining.genre,
			image: gaining.image,
			scouts: gaining.scouts,
			source: 'breaking-out',
			spreadReason: gaining.spreadReason,
			tag: gaining.tag,
			routeNarrative: gaining.routeNarrative,
			sourceScoutId: gaining.sourceScoutId,
		};
		return { item: detail, forest: propagationForestFor(id, detail.scouts) };
	}

	// Item-typed lanes: From Your Scouts / High-Quality Scouts / For You / OSA / DU / OTB.
	const lookups: Array<{ items: typeof forYouItems; source: DetailItem['source'] }> = [
		{ items: fromYourScoutsItems,   source: 'from-your-scouts' },
		{ items: trustedScoutsItems, source: 'trusted-scouts' },
		{ items: forYouItems,           source: 'best-picks' },
		{ items: oneStepAwayItems,      source: 'one-step-away' },
		{ items: deepUndergroundItems,  source: 'deep-underground' },
		{ items: outsideBubbleItems,    source: 'outside-bubble' },
	];

	for (const { items, source } of lookups) {
		const found = items.find(i => i.id === id);
		if (found) {
			const detail: DetailItem = {
				id: found.id,
				title: found.title,
				artist: found.artist,
				genre: found.genre,
				image: found.image,
				scouts: found.scouts,
				source,
				type: found.type,
				crossingPath: found.crossingPath,
				whisperHint: found.whisperHint,
				routeNarrative: found.routeNarrative,
				sourceScoutId: found.sourceScoutId,
			};
			return { item: detail, forest: propagationForestFor(id, detail.scouts) };
		}
	}

	throw error(404, `Item "${id}" not found in the prototype data set.`);
};
