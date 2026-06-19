import type { UserDetail } from '$lib/mock/users';

/*
	Scout analysis — reusable profile-interpretation layer.

	Given a `UserDetail`, returns distribution-aware metrics and
	editorial commentary against the (implicit) Outer Signal scout
	population. The actual hand-authored user-mock set is small (4
	scouts), so percentile is computed against a STATIC population
	model — a set of anchor points that describe the broader scout
	population the named scouts are samples of. The anchors are
	expressed as `[value, percentile]` pairs and linearly
	interpolated.

	Three public surfaces:

	  - `scoutPercentiles(user)`      — per-metric percentile (0–100)
	  - `formatTopPercentile(p)`      — "Top 8%" formatter, low-precision
	  - `growthOpportunities(user)`   — up to 3 distribution-aware
	                                    recommendations identifying
	                                    the scout's biggest relative
	                                    opportunities

	This module deliberately has no Svelte / DOM dependencies and is
	pure functions on `UserDetail`. Designed to be reused by future
	features: Why Follow This Scout, Trust Signals, Scout comparison
	pages, archetype explanations, recommendation systems, etc.
*/

/* ── Population model ────────────────────────────────────────
   Each anchor is `[metric value, percentile of population at-or-
   below this value]`. Linear interpolation between anchors gives a
   smooth percentile for any input value. Values below the lowest
   anchor or above the highest are clamped. The curves are tuned so
   that the four hand-authored scouts land in roughly the right
   relative position: Alice ≈ Top 3-5%, Riku ≈ Top 5-7%, Dan ≈
   Top 8-15%, Gisli ≈ Top 30%.

   If the editorial scout population shifts later (new mocks added,
   or a real backend replaces these), the anchors can be re-tuned
   here without touching the page templates or the recommendation
   templates — that's the point of pinning this in one module. */
type Anchor = readonly [value: number, percentile: number];

const ANCHORS = {
	discoveryScore: [
		[25, 10], [45, 30], [60, 50], [70, 65], [78, 80],
		[84, 92], [89, 95], [91, 97], [96, 99],
	] as Anchor[],
	hitRate: [
		[5, 15], [12, 30], [20, 48], [28, 62], [36, 77],
		[44, 88], [52, 95], [60, 98],
	] as Anchor[],
	originSeeds: [
		[1, 10], [5, 25], [10, 45], [16, 62], [24, 76],
		[36, 88], [55, 95], [80, 98],
	] as Anchor[],
	averageReachPerSeed: [
		[1, 15], [4, 35], [8, 55], [13, 72], [18, 85],
		[25, 93], [35, 98],
	] as Anchor[],
	reshareBranches: [
		[3, 15], [10, 35], [20, 55], [35, 75], [55, 88],
		[80, 95], [130, 98],
	] as Anchor[],
	uniqueListenersReached: [
		[20, 20], [60, 40], [120, 60], [200, 75], [350, 88],
		[600, 95], [1000, 98], [1500, 99.4],
	] as Anchor[],
} satisfies Record<string, Anchor[]>;

export type MetricKey = keyof typeof ANCHORS;

function interpolate(anchors: Anchor[], value: number): number {
	if (value <= anchors[0][0]) return anchors[0][1];
	if (value >= anchors[anchors.length - 1][0]) return anchors[anchors.length - 1][1];
	for (let i = 0; i < anchors.length - 1; i++) {
		const [v0, p0] = anchors[i];
		const [v1, p1] = anchors[i + 1];
		if (value >= v0 && value <= v1) {
			const t = (value - v0) / (v1 - v0);
			return p0 + t * (p1 - p0);
		}
	}
	return anchors[anchors.length - 1][1];
}

/** Per-metric percentile against the population model. Returns
 *  values in [0, 100] — higher = stronger relative position. */
export function scoutPercentiles(user: UserDetail): Record<MetricKey, number> {
	return {
		discoveryScore:         interpolate(ANCHORS.discoveryScore, user.discoveryScore),
		hitRate:                interpolate(ANCHORS.hitRate, user.hitRate),
		originSeeds:            interpolate(ANCHORS.originSeeds, user.originSeeds),
		averageReachPerSeed:    interpolate(ANCHORS.averageReachPerSeed, user.averageReachPerSeed),
		reshareBranches:        interpolate(ANCHORS.reshareBranches, user.reshareBranches),
		uniqueListenersReached: interpolate(ANCHORS.uniqueListenersReached, user.uniqueListenersReached),
	};
}

/** Convenience: the headline "How strong is this scout overall?"
 *  percentile — derived from the discoveryScore distribution. */
export function overallPercentile(user: UserDetail): number {
	return interpolate(ANCHORS.discoveryScore, user.discoveryScore);
}

/** Format a percentile rank as a low-precision "Top N%" string.
 *  Examples: 99.2 → "Top 1%", 96.5 → "Top 3%", 92 → "Top 8%",
 *  82 → "Top 18%" (rounded to nearest 1% under 25), 70 → "Top 30%"
 *  (rounded to nearest 5% when >25%). Avoids fake precision. */
export function formatTopPercentile(percentile: number): string {
	const inv = Math.max(0, 100 - percentile);
	if (inv < 1)  return 'Top 1%';
	if (inv < 25) return `Top ${Math.round(inv)}%`;
	// Snap larger inverses to the nearest 5 — "Top 33%" looks
	// falsely precise when "Top 35%" is just as informative and
	// less noisy.
	return `Top ${Math.round(inv / 5) * 5}%`;
}

/* ── Relative strengths + weaknesses ─────────────────────────
   The five "actionable" metrics — discoveryScore is excluded
   because it's a downstream output of the others, not an input the
   scout can practice. Sorted by percentile descending (strongest
   first) or ascending (weakest first) — the page picks whichever
   surface fits. */
/** The metrics a scout can actually move through behaviour, as
 *  distinct from `discoveryScore` which is the editorial summary
 *  of those underlying dimensions. Growth opportunities only fire
 *  on actionable metrics; the percentile API still surfaces
 *  `discoveryScore` for the headline rank line. */
export type ActionableMetric =
	| 'hitRate'
	| 'originSeeds'
	| 'averageReachPerSeed'
	| 'reshareBranches'
	| 'uniqueListenersReached';

const ACTIONABLE_METRICS: ActionableMetric[] = [
	'hitRate',
	'originSeeds',
	'averageReachPerSeed',
	'reshareBranches',
	'uniqueListenersReached',
];

export type MetricRanking = { metric: ActionableMetric; percentile: number };

export function relativeStrengths(user: UserDetail, limit = 3): MetricRanking[] {
	const p = scoutPercentiles(user);
	return ACTIONABLE_METRICS
		.map((m) => ({ metric: m, percentile: p[m] }))
		.sort((a, b) => b.percentile - a.percentile)
		.slice(0, limit);
}

export function relativeWeaknesses(user: UserDetail, limit = 3): MetricRanking[] {
	const p = scoutPercentiles(user);
	return ACTIONABLE_METRICS
		.map((m) => ({ metric: m, percentile: p[m] }))
		.sort((a, b) => a.percentile - b.percentile)
		.slice(0, limit);
}

/* ── Growth opportunities ────────────────────────────────────
   For each actionable metric, a template that takes the user's real
   numbers and produces a diagnosis + focus list. The page renders
   the user's three lowest-percentile metrics (i.e. the dimensions
   that most constrain their next-tier progression). Each template
   is observationally grounded in the user's actual values — no
   thresholded language, no motivational filler. */

export type GrowthOpportunity = {
	/** The metric that drove this recommendation — useful for keying. */
	metric: ActionableMetric;
	/** Computed percentile band the user sits in for this metric. */
	percentile: number;
	/** Short label (≤ ~30 chars) — readable at a glance. */
	title: string;
	/** One-sentence observation about the user's standing, grounded
	 *  in their real numbers. */
	diagnosis: string;
	/** Single suggested focus — one actionable direction, not a
	 *  bulleted list. Keep editorial and concrete. */
	focus: string;
};

/* Editorial band labels for the diagnosis copy — phrased as
   observational positions ("elite tier") rather than judgements
   ("excellent"). The band is determined by the user's OVERALL
   percentile so the recommendation feels grounded in their level
   rather than reading absolute weakness. */
function overallBand(percentile: number): string {
	const inv = 100 - percentile;
	if (inv < 5)  return 'elite tier';
	if (inv < 12) return 'top tier';
	if (inv < 25) return 'upper-middle band';
	if (inv < 50) return 'middle band';
	return 'lower band';
}

function pct(n: number): string {
	return `${Math.round(n)}%`;
}

type RecommendationTemplate = (user: UserDetail, allP: Record<MetricKey, number>) => Omit<GrowthOpportunity, 'percentile'>;

const TEMPLATES: Record<ActionableMetric, RecommendationTemplate> = {
	hitRate: (user, p) => ({
		metric: 'hitRate',
		title: 'Raise seed conversion',
		diagnosis: `Only ${pct(user.hitRate)} of your seeds propagate — below what's expected for your tier.`,
		focus: 'Focus on finding signals earlier, before scene-wide attention.',
	}),

	originSeeds: (user, _p) => ({
		metric: 'originSeeds',
		title: 'Broaden signal consistency',
		diagnosis: `${user.originSeeds} origin seed${user.originSeeds === 1 ? '' : 's'} — most of your influence is concentrated in a small portfolio.`,
		focus: 'Focus on increasing seed cadence across more scenes.',
	}),

	averageReachPerSeed: (user, _p) => ({
		metric: 'averageReachPerSeed',
		title: 'Improve amplification depth',
		diagnosis: `Each seed reaches ${user.averageReachPerSeed} listener${user.averageReachPerSeed === 1 ? '' : 's'} on average — your reach leans on a few breakouts.`,
		focus: 'Focus on strengthening mid-tier signals that stall after one wave.',
	}),

	reshareBranches: (user, _p) => ({
		metric: 'reshareBranches',
		title: 'Strengthen branch durability',
		diagnosis: `${user.reshareBranches} branch${user.reshareBranches === 1 ? '' : 'es'} across ${user.originSeeds} seed${user.originSeeds === 1 ? '' : 's'} — propagation often stops after one or two generations.`,
		focus: 'Focus on bridge scouts who carry signal past the second generation.',
	}),

	uniqueListenersReached: (user, _p) => ({
		metric: 'uniqueListenersReached',
		title: 'Increase downstream reach',
		diagnosis: `Total reach (${user.uniqueListenersReached} listener${user.uniqueListenersReached === 1 ? '' : 's'}) trails your other actionable dimensions.`,
		focus: 'Focus on bridge scouts who connect adjacent scenes — depth over spread.',
	}),
};

/** Up to N distribution-aware growth opportunities. Picks the user's
 *  bottom-percentile actionable metrics — these are the dimensions
 *  where they have the most room relative to scouts at their tier.
 *  Each opportunity carries the diagnosis (real numbers + their
 *  band) and a focus list (concrete actions). */
export function growthOpportunities(user: UserDetail, limit = 3): GrowthOpportunity[] {
	const p = scoutPercentiles(user);
	const ranked = ACTIONABLE_METRICS
		.map((m) => ({ metric: m, percentile: p[m] }))
		.sort((a, b) => a.percentile - b.percentile)
		.slice(0, limit);
	return ranked.map(({ metric, percentile }) => {
		const tmpl = TEMPLATES[metric](user, p);
		return { ...tmpl, percentile };
	});
}
