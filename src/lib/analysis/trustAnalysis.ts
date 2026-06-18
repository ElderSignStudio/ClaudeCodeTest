import type { UserDetail } from '$lib/mock/users';
import { scoutPercentiles, type ActionableMetric } from './scoutAnalysis';

/*
	Trust analysis — reusable interpretation layer for "why should I
	trust this scout?".

	Mirrors the architecture of `scoutAnalysis.ts`: pure functions on
	`UserDetail`, no DOM / Svelte coupling, intended to be reused by
	future surfaces (scout comparison pages, archetype explanations,
	recommendation systems, etc.).

	The public surface is a single `trustSignals(user)` returning four
	short editorial rows — none of them duplicate the Scout Profile
	numbers, none of them gamify, none of them praise. Each row is
	derived from real profile data and varies naturally per scout.

	Returns null when there is no real track record to interpret
	(synthetic fallback profiles whose data is all zero) so the page
	can hide the section gracefully without an awkward "0 signature
	signals reached 0 downstream listeners" row.
*/

/** A single part of an editorial sentence. Plain strings render as
 *  body copy; objects with `hi` render with the page's "important
 *  data" emphasis treatment (brighter alpha + semibold). The page
 *  just iterates and applies styling — no parsing, no regex, no
 *  HTML injection. Concatenating every part's `value` yields the
 *  original sentence verbatim. */
export type TextPart = string | { hi: string };

export type TrustRow = {
	/** Small label — e.g. "Proven Reach". Title-case in source for
	 *  readability; the page applies uppercase + tracking. */
	label: string;
	/** One short editorial sentence broken into emphasis-aware parts.
	 *  Even-position plain strings + odd-position `{hi: ...}` chunks
	 *  let the page surface the key evidence inline without
	 *  introducing badges, chips, or colour. */
	parts: TextPart[];
	/** Optional ultra-compact summary — a 2–6 word noun phrase the
	 *  page uses inside the 3-column "supporting signals" strip
	 *  beneath the headline. Only emitted for the three supporting
	 *  dimensions (peers / distinctive / followers); the headline
	 *  row (evidence) uses `parts` directly. Designed to fit on a
	 *  single line on desktop; two lines maximum. */
	summary?: string;
};

/** Helper: stringify a parts array into the flat sentence — useful
 *  for accessibility (aria-label) or future surfaces that want the
 *  plain prose without the emphasis hints. */
export function textOf(parts: TextPart[]): string {
	return parts.map((p) => (typeof p === 'string' ? p : p.hi)).join('');
}

export type TrustSignals = {
	evidence: TrustRow;
	peers: TrustRow;
	distinctive: TrustRow;
	followers: TrustRow;
};

export function trustSignals(user: UserDetail): TrustSignals | null {
	const hasTrackRecord =
		user.originSeeds > 0 ||
		user.signatureSignals.length > 0 ||
		user.uniqueListenersReached > 0;
	if (!hasTrackRecord) return null;
	return {
		evidence:    evidenceOfSuccess(user),
		peers:       comparedWithPeers(user),
		distinctive: distinctiveStrength(user),
		followers:   followerNarrative(user),
	};
}

/* ── 1. Evidence of success ──────────────────────────────────
   Counts how many SIGNATURE signals reached the editorial
   "propagated past 3 generations" mark, and surfaces total reach.
   No raw "X seeds" or "Y reshare branches" duplication of the
   Output / Reach numbers shown above on the page — the framing is
   observational ("propagated past 3 generations") rather than
   statistical.

   Wording varies naturally by data shape:
     - All signatures hit 3+ gens → "All N …"
     - Some signatures hit 3+ gens → "M of N …"
     - No signatures qualify       → falls back to a quieter form
       that still credits real reach
     - No signatures at all        → uses origin-seed totals          */
function evidenceOfSuccess(user: UserDetail): TrustRow {
	const total = user.signatureSignals.length;
	const deep = user.signatureSignals.filter((s) => s.generations >= 3).length;
	const listeners = user.uniqueListenersReached;
	const listenersStr = `${listeners} downstream listener${listeners === 1 ? '' : 's'}`;

	let parts: TextPart[];
	if (total === 0) {
		parts = [
			{ hi: `${user.originSeeds} discovered seed${user.originSeeds === 1 ? '' : 's'}` },
			' reached ',
			{ hi: listenersStr },
			'.',
		];
	} else if (deep === total) {
		parts = [
			{ hi: `All ${total} signature signal${total === 1 ? '' : 's'}` },
			' propagated past 3 generations, reaching ',
			{ hi: listenersStr },
			'.',
		];
	} else if (deep > 0) {
		parts = [
			{ hi: `${deep} of ${total} signature signals` },
			' propagated past 3 generations, reaching ',
			{ hi: listenersStr },
			' in total.',
		];
	} else {
		parts = [
			{ hi: `${total} signature signal${total === 1 ? '' : 's'}` },
			' reached ',
			{ hi: listenersStr },
			' across their downstream branches.',
		];
	}
	return { label: 'Proven Reach', parts };
}

/* ── 2. Compared with peers ──────────────────────────────────
   Picks the scout's STRONGEST actionable metric (highest
   percentile against the population model) and frames it as a
   peer-relative statement. The label keys map to natural editorial
   phrases so the row reads as observation rather than measurement.

   We intentionally exclude `discoveryScore` itself — that's already
   the headline percentile in the Quality cluster above and would
   read as duplication. */
const PEER_METRIC_LABELS: Record<ActionableMetric, string> = {
	hitRate:                'hit rate',
	originSeeds:            'discovery volume',
	averageReachPerSeed:    'per-seed amplification',
	reshareBranches:        'reshare-branch count',
	uniqueListenersReached: 'downstream footprint',
};

/* Ultra-compact metric labels used by the summary strip — slightly
   shorter than the long-form labels above so each card fits on a
   single line at typical column widths. */
const PEER_METRIC_LABELS_SHORT: Record<ActionableMetric, string> = {
	hitRate:                'hit rate',
	originSeeds:            'discovery volume',
	averageReachPerSeed:    'amplification depth',
	reshareBranches:        'branch reach',
	uniqueListenersReached: 'downstream reach',
};

/** Ordinal suffix: 1 → 'st', 2 → 'nd', 3 → 'rd', 11/12/13 → 'th',
 *  otherwise 'th'. Percentile values land in the 50–99 range in
 *  practice so this almost always returns 'th', but handling the
 *  general case keeps the helper safe for future use elsewhere. */
function ordinalSuffix(n: number): string {
	const lastTwo = Math.abs(n) % 100;
	if (lastTwo >= 11 && lastTwo <= 13) return 'th';
	switch (Math.abs(n) % 10) {
		case 1: return 'st';
		case 2: return 'nd';
		case 3: return 'rd';
		default: return 'th';
	}
}

function comparedWithPeers(user: UserDetail): TrustRow {
	const p = scoutPercentiles(user);
	const candidates: Array<{ metric: ActionableMetric; percentile: number }> = [
		{ metric: 'hitRate',                percentile: p.hitRate },
		{ metric: 'uniqueListenersReached', percentile: p.uniqueListenersReached },
		{ metric: 'reshareBranches',        percentile: p.reshareBranches },
		{ metric: 'averageReachPerSeed',    percentile: p.averageReachPerSeed },
		{ metric: 'originSeeds',            percentile: p.originSeeds },
	];
	const ranked = candidates.sort((a, b) => b.percentile - a.percentile);

	const top = ranked[0];
	const label = PEER_METRIC_LABELS[top.metric];
	const shortLabel = PEER_METRIC_LABELS_SHORT[top.metric];
	const pct = Math.min(99, Math.round(top.percentile));
	const capitalised = label.charAt(0).toUpperCase() + label.slice(1);
	return {
		label: 'Peer Comparison',
		parts: [
			{ hi: capitalised },
			' sits above roughly ',
			{ hi: `${pct}% of scouts` },
			' at similar activity level.',
		],
		summary: `${pct}${ordinalSuffix(pct)} percentile ${shortLabel}`,
	};
}

/* ── 3. Distinctive strength ─────────────────────────────────
   The scout's scoutArchetype carries the qualitative angle; the
   top sceneFootprint entry anchors it to real data. Each archetype
   template is observational and concrete, naming what the scout
   actually does rather than handing out a compliment.

   Falls back to a neutral framing for archetypes we haven't
   authored copy for (e.g. the synthetic-fallback 'Scout'). */
/* Short noun-phrase per archetype for the supporting-signal
   strip. Sentence-case so the UPPERCASE label above it carries the
   tracking treatment and the summary reads as ordinary prose. */
const ARCHETYPE_SUMMARY: Record<string, string> = {
	'Cross-Scene Bridge':   'Cross-scene bridge',
	'Underground Seeder':   'Underground seeder',
	'Trailblazer':          'Trailblazer',
	'Archive Cartographer': 'Archive cartographer',
};

function distinctiveStrength(user: UserDetail): TrustRow {
	const topScene = user.sceneFootprint[0]?.name.toLowerCase();
	const archetype = user.scoutArchetype;
	const summary = ARCHETYPE_SUMMARY[archetype] ?? 'Long-tail discovery';

	let parts: TextPart[];
	switch (archetype) {
		case 'Cross-Scene Bridge':
			parts = [
				{ hi: 'Cross-scene discoveries' },
				' account for an unusually large share of successful branches — ',
				topScene ? 'most originate in ' : 'most originate in ',
				topScene ? ({ hi: topScene } as TextPart) : 'adjacent listening communities',
				topScene ? ' before spreading outward.' : '.',
			];
			break;
		case 'Underground Seeder':
			parts = [
				{ hi: 'Early underground discoveries' },
				' reliably propagate further than the scene they were planted in — ',
				topScene ? ({ hi: topScene } as TextPart) : 'long-tail scenes',
				topScene ? ' is the most frequent seedbed.' : ' are the most frequent seedbed.',
			];
			break;
		case 'Trailblazer':
			parts = [
				'Often surfaces ',
				{ hi: 'unfamiliar signals' },
				' before they enter wider rotation — ',
				topScene ? ({ hi: topScene } as TextPart) : 'cross-scene',
				' crossings are the most-cited path forward.',
			];
			break;
		case 'Archive Cartographer':
			parts = [
				'Maps ',
				{ hi: 'long-tail crossings' },
				' between deep-archive scenes — signals rooted in ',
				topScene ? ({ hi: topScene } as TextPart) : { hi: 'overlooked scenes' },
				' tend to travel further than their initial niche would suggest.',
			];
			break;
		default:
			parts = topScene
				? [
					'Discoveries from ',
					{ hi: topScene },
					' tend to travel further than their initial scene would suggest.',
				]
				: ['Discoveries tend to travel further than their initial scene would suggest.'];
	}
	return { label: 'Scouting Edge', parts, summary };
}

/* ── 4. Why people follow this scout ──────────────────────────
   Editorial summary of follower motivation. Picks framing by a
   small priority chain:

     - reliable conversion       (hit rate above the population
                                  middle band → followers value
                                  "early but accurate" reads)
     - long-tail propagation     (Archive / Underground archetypes
                                  where the followers are
                                  effectively tracking patient
                                  amplification)
     - broad spread              (very high total reach)
     - careful early scouting    (default — works for newer or
                                  smaller-scale profiles)

   Scene-list grammar adapts to the number of footprint entries:
   1 → bare scene name, 2 → "A and B", 3+ → "A, B, and adjacent C". */
function followerNarrative(user: UserDetail): TrustRow {
	const scenes = user.sceneFootprint.slice(0, 3).map((s) => s.name.toLowerCase());

	/* Split scene wording into a `phrase` (the scene names — get the
	   emphasis treatment) and a `suffix` (the trailing "scenes" /
	   "circles" word — stays plain so it doesn't read as data). */
	let scenesPhrase: string;
	let scenesSuffix: string;
	if (scenes.length === 0)      { scenesPhrase = 'their primary scenes'; scenesSuffix = ''; }
	else if (scenes.length === 1) { scenesPhrase = scenes[0]; scenesSuffix = ' circles'; }
	else if (scenes.length === 2) { scenesPhrase = `${scenes[0]} and ${scenes[1]}`; scenesSuffix = ' scenes'; }
	else                          { scenesPhrase = `${scenes[0]}, ${scenes[1]}, and adjacent ${scenes[2]}`; scenesSuffix = ' scenes'; }

	let valuePhrase: string;
	let connector = ' in ';
	/* Parallel summary phrasing — same priority chain, but each
	   branch emits a 2–6 word noun phrase suitable for the
	   supporting-signal strip. */
	let summaryStem: string;
	let summaryConnector = ' in ';
	if (user.hitRate >= 40) {
		valuePhrase = 'reliably early discoveries';
		summaryStem  = 'Early discoveries';
	} else if (user.scoutArchetype === 'Underground Seeder' || user.scoutArchetype === 'Archive Cartographer') {
		valuePhrase = 'long-tail propagation that grows out of overlooked signals';
		summaryStem  = 'Long-tail signals';
		summaryConnector = ' from ';
	} else if (user.uniqueListenersReached > 300) {
		valuePhrase = 'discoveries that spread broadly';
		connector = ' across ';
		summaryStem  = 'Broad cross-scene spread';
		summaryConnector = ' from ';
	} else {
		valuePhrase = 'careful early scouting';
		summaryStem  = 'Careful scouting';
	}

	const topSceneShort = scenes[0] ?? 'their primary scenes';
	const summary = `${summaryStem}${summaryConnector}${topSceneShort}`;

	return {
		label: 'Why Followers Stay',
		parts: [
			'Followers appear to value ',
			{ hi: valuePhrase },
			connector,
			{ hi: scenesPhrase },
			scenesSuffix + '.',
		],
		summary,
	};
}
