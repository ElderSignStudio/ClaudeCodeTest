/*
	Mock data for the User Detail page's Signal Tree section.

	Layout:
	  User (root) → Signal (item) → User → User → User

	Distinct from the Item Detail Propagation Tree both in shape
	(this one mixes user + signal nodes) and intent (overview of
	"signals sparked by this scout" rather than a full propagation
	simulation). Node types are tagged with `type: 'signal' | 'user'`
	so the component can dispatch the right renderer.

	Cover art on signal nodes resolves to a real Spotify image via
	`coverOf()` against the same mock item registry the Item Detail
	page uses — no synthetic placeholders.
*/

import { coverOf } from './data';
import type { LiveStatus } from './users';

const dicebear = (seed: string) =>
	`https://api.dicebear.com/9.x/thumbs/svg?seed=${seed}&backgroundColor=1e1b4b`;

/* ─── Types ───────────────────────────────────────────────────── */

/** User descendant. May recurse via `children`. */
export type SignalTreeUserDescendant = {
	type: 'user';
	id: string;
	name: string;
	avatar: string;
	character?: string;
	score?: number;
	children?: SignalTreeUserDescendant[];
};

/** Signal / item node. Its `children` are the users who picked
 *  the signal up downstream. */
export type SignalTreeSignalNode = {
	type: 'signal';
	id: string;
	/** Item id — links through to `/items/<itemId>`. Same registry as
	 *  the Item Detail page. */
	itemId: string;
	title: string;
	artist: string;
	/** Cover URL — attached by `attachCovers()` at module load via
	 *  `coverOf()` so authors can leave the inline entries focused
	 *  on shape, not URLs. */
	coverArt: string;
	impact: number;
	listeners: number;
	generations: number;
	status: LiveStatus;
	tags: string[];
	badges: string[];
	children: SignalTreeUserDescendant[];
};

/** Root: the profile-owner user. Children are signals they sparked. */
export type SignalTreeRoot = {
	type: 'user';
	id: string;
	name: string;
	avatar: string;
	/** Headline subtitle ("Cross-scene bridge · score 84"). */
	role: string;
	children: SignalTreeSignalNode[];
};

export type UserSignalTree = {
	root: SignalTreeRoot;
};

/* ─── Authoring shape ────────────────────────────────────────────
   Inline mocks omit `coverArt` from each signal; `attachCovers()`
   fills them in at module load. Same pattern as `users.ts` so the
   editorial blocks stay readable. */

type DraftSignal = Omit<SignalTreeSignalNode, 'coverArt'>;
type DraftRoot = Omit<SignalTreeRoot, 'children'> & { children: DraftSignal[] };

function attachCovers(root: DraftRoot): SignalTreeRoot {
	return {
		...root,
		children: root.children.map(s => ({ ...s, coverArt: coverOf(s.itemId) })),
	};
}

/* ─── Descendant helpers ─────────────────────────────────────────
   Tiny helper to keep nested descendant entries compact and avoid
   re-stating `type: 'user'` everywhere. Avatars are deterministic
   from the name so a recurring scout (Marco appears under both Cold
   Dispatch and Frozen Sun for Dan) reads as the SAME person. */
function u(
	id: string,
	name: string,
	character: string,
	score: number,
	children: SignalTreeUserDescendant[] = [],
): SignalTreeUserDescendant {
	return {
		type: 'user',
		id,
		name,
		avatar: dicebear(`${id}-scout`),
		character,
		score,
		children: children.length > 0 ? children : undefined,
	};
}

/* ─── Trees ───────────────────────────────────────────────────── */

const danTree: DraftRoot = {
	type: 'user',
	id: 'dan',
	name: 'Dan',
	avatar: dicebear('DanOuter'),
	role: 'Cross-scene bridge · score 84',
	children: [
		{
			type: 'signal',
			id: 'tree-dan-cold-dispatch',
			itemId: 'cold-dispatch',
			title: 'Cold Dispatch',
			artist: 'Wire Theory',
			impact: 92, listeners: 67, generations: 5,
			status: 'Still moving',
			badges: ['Cascade Starter'],
			tags: ['post-rock crossover', 'tape ambient'],
			children: [
				u('alice', 'Alice', 'Deep-scene explorer', 91, [
					u('gisli', 'Gisli', 'Reverb cartographer', 72),
					u('kalla', 'Kalla', 'Note-passing curator', 60),
					u('doro', 'Doro', 'Sleeve photographer', 48),
				]),
				u('marco', 'Marco', 'Underground connector', 70, [
					u('pauli', 'Pauli', 'Scene connector', 58),
				]),
			],
		},
		{
			type: 'signal',
			id: 'tree-dan-iron-weather',
			itemId: 'iron-weather',
			title: 'Iron Weather',
			artist: 'Pale Motion',
			impact: 88, listeners: 53, generations: 4,
			status: 'Accelerating',
			badges: ['Early Seed', 'Deep Branch'],
			tags: ['drone', 'cassette ambient'],
			children: [
				u('ines', 'Ines', 'Quiet listener', 54, [
					u('sanne', 'Sanne', 'Field-trip companion', 42),
					u('olek', 'Olek', 'Drift broadcaster', 38),
				]),
				u('tobias', 'Tobias', 'Ambient cartographer', 64),
				u('hilde', 'Hilde', 'Background absorber', 32),
			],
		},
		{
			type: 'signal',
			id: 'tree-dan-frozen-sun',
			itemId: 'frozen-sun',
			title: 'Frozen Sun',
			artist: 'Obscure Slovenian Band',
			impact: 84, listeners: 40, generations: 6,
			status: 'Still moving',
			badges: ['Trailblazer'],
			tags: ['ritual ambient'],
			children: [
				u('marco', 'Marco', 'Underground connector', 70, [
					u('otto', 'Otto', 'Crate digger', 36),
				]),
				u('yana', 'Yana', 'Late commuter', 28),
			],
		},
		{
			type: 'signal',
			id: 'tree-dan-low-orbit',
			itemId: 'low-orbit',
			title: 'Low Orbit',
			artist: 'Contour',
			impact: 92, listeners: 95, generations: 10,
			status: 'Branch forming',
			badges: ['Long Tail', 'Cascade Starter'],
			tags: ['folk-leaning ambient'],
			children: [
				u('vera', 'Vera', 'Deep listener', 62, [
					u('lia', 'Lia', 'Surface skimmer', 30),
					u('niko', 'Niko', 'Background ear', 24),
				]),
				u('saga', 'Saga', 'Soft completionist', 44, [
					u('bo', 'Bo', 'Low-key listener', 22),
				]),
				u('jaakko', 'Jaakko', 'Late-night signal hunter', 56),
			],
		},
		{
			type: 'signal',
			id: 'tree-dan-neon-veda',
			itemId: 'neon-veda',
			title: 'Neon Veda',
			artist: '3 Scouts',
			impact: 50, listeners: 16, generations: 3,
			status: 'Quiet',
			badges: ['Niche Spark'],
			tags: ['dawn-walk ambient'],
			children: [
				u('tobias', 'Tobias', 'Ambient cartographer', 64),
				u('hana', 'Hana', 'Late-night signal hunter', 30),
			],
		},
	],
};

const aliceTree: DraftRoot = {
	type: 'user',
	id: 'alice',
	name: 'Alice',
	avatar: dicebear('AliceSignal'),
	role: 'Underground seeder · score 91',
	children: [
		{
			type: 'signal',
			id: 'tree-alice-iron-weather',
			itemId: 'iron-weather',
			title: 'Iron Weather',
			artist: 'Pale Motion',
			impact: 96, listeners: 79, generations: 6,
			status: 'Accelerating',
			badges: ['Cascade Starter', 'Deep Branch'],
			tags: ['drone'],
			children: [
				u('marco', 'Marco', 'Underground connector', 70, [
					u('pauli', 'Pauli', 'Scene connector', 58),
				]),
				u('jaakko', 'Jaakko', 'Late-night signal hunter', 56),
				u('dan', 'Dan', 'Cross-scene bridge', 84, [
					u('doro', 'Doro', 'Sleeve photographer', 48),
				]),
			],
		},
		{
			type: 'signal',
			id: 'tree-alice-night-forest',
			itemId: 'night-forest',
			title: 'Night Forest',
			artist: 'Pale Atelier',
			impact: 90, listeners: 53, generations: 12,
			status: 'Branch forming',
			badges: ['Long Tail'],
			tags: ['long-form drone'],
			children: [
				u('pauli', 'Pauli', 'Scene connector', 58),
				u('yuki', 'Yuki', 'Cross-scene bridge', 62),
			],
		},
		{
			type: 'signal',
			id: 'tree-alice-tape-weather',
			itemId: 'tape-weather',
			title: 'Tape Weather',
			artist: 'Archive Unit',
			impact: 86, listeners: 38, generations: 11,
			status: 'Still moving',
			badges: ['Trailblazer'],
			tags: ['cassette ambient'],
			children: [
				u('tobias', 'Tobias', 'Ambient cartographer', 64),
			],
		},
		{
			type: 'signal',
			id: 'tree-alice-hollow-coast',
			itemId: 'hollow-coast',
			title: 'Hollow Coast',
			artist: 'Shore Signal',
			impact: 71, listeners: 22, generations: 4,
			status: 'Still moving',
			badges: ['Early Seed'],
			tags: ['drone'],
			children: [
				u('hilde', 'Hilde', 'Background absorber', 32),
				u('magnus', 'Magnus', 'Soft completionist', 26),
			],
		},
		{
			type: 'signal',
			id: 'tree-alice-ember-field',
			itemId: 'ember-field',
			title: 'Ember Field',
			artist: 'Pale Iris',
			impact: 64, listeners: 18, generations: 3,
			status: 'Quiet',
			badges: ['Niche Spark'],
			tags: ['ambient orbit'],
			children: [
				u('sanne', 'Sanne', 'Field-trip companion', 42, [
					u('kai', 'Kai', 'Late-night dweller', 28),
				]),
				u('olek', 'Olek', 'Drift broadcaster', 38),
			],
		},
	],
};

const gisliTree: DraftRoot = {
	type: 'user',
	id: 'gisli',
	name: 'Gisli',
	avatar: dicebear('GisliReverb'),
	role: 'Trailblazer · score 72',
	children: [
		{
			type: 'signal',
			id: 'tree-gisli-soft-border',
			itemId: 'soft-border',
			title: 'Soft Border',
			artist: 'Liminal State',
			impact: 78, listeners: 32, generations: 4,
			status: 'Still moving',
			badges: ['Cascade Starter'],
			tags: ['folk-leaning ambient'],
			children: [
				u('kalla', 'Kalla', 'Note-passing curator', 60),
				u('hilde', 'Hilde', 'Background absorber', 32, [
					u('doro', 'Doro', 'Sleeve photographer', 48),
				]),
				u('magnus', 'Magnus', 'Soft completionist', 26),
			],
		},
		{
			type: 'signal',
			id: 'tree-gisli-pale-verge',
			itemId: 'pale-verge',
			title: 'Pale Verge',
			artist: 'The Outline',
			impact: 70, listeners: 24, generations: 3,
			status: 'Branch forming',
			badges: ['Cross-Scene Bridge'],
			tags: ['ambient'],
			children: [
				u('tobias', 'Tobias', 'Ambient cartographer', 64),
			],
		},
		{
			type: 'signal',
			id: 'tree-gisli-mirror-static',
			itemId: 'mirror-static',
			title: 'Mirror Static',
			artist: 'Pale Signal',
			impact: 58, listeners: 14, generations: 3,
			status: 'Accelerating',
			badges: ['Early Seed'],
			tags: ['cassette orbit'],
			children: [
				u('niko', 'Niko', 'Background ear', 24),
				u('otto', 'Otto', 'Crate digger', 36),
			],
		},
		{
			type: 'signal',
			id: 'tree-gisli-glass-signal',
			itemId: 'glass-signal',
			title: 'Glass Signal',
			artist: 'Pale Archive',
			impact: 48, listeners: 11, generations: 2,
			status: 'Quiet',
			badges: ['Trailblazer'],
			tags: ['reverb drift'],
			children: [
				u('saga', 'Saga', 'Soft completionist', 44),
			],
		},
		{
			type: 'signal',
			id: 'tree-gisli-minor-current',
			itemId: 'minor-current',
			title: 'Minor Current',
			artist: 'Field Notes',
			impact: 42, listeners: 9, generations: 2,
			status: 'Dormant',
			badges: ['Underground Seed'],
			tags: ['ambient folk'],
			children: [
				u('bo', 'Bo', 'Low-key listener', 22),
			],
		},
	],
};

const trees: Record<string, DraftRoot> = {
	dan: danTree,
	alice: aliceTree,
	gisli: gisliTree,
};

/** Lookup by user id. Returns null when the user has no signal-tree
 *  data — the page renders a quiet empty state. */
export function getUserSignalTree(userId: string): UserSignalTree | null {
	const raw = trees[userId];
	if (!raw) return null;
	return { root: attachCovers(raw) };
}
