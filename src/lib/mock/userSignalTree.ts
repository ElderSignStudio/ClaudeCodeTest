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
import { avatarFor } from './scoutAvatars';

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
		avatar: avatarFor(id, `${id}-scout`),
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
	avatar: avatarFor('dan', 'DanOuter'),
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
	avatar: avatarFor('alice', 'AliceSignal'),
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
	avatar: avatarFor('gisli', 'GisliReverb'),
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

/* ─── Riku — 25-signal power-scout fixture ─────────────────────
   Exists to stress-test scrolling, inspector switching, expand /
   collapse controls, and visual density. Signal mix:
     • 6 hero impacts (80–96, mostly accelerating / branch-forming)
     • 11 mid-tier (50–78, still moving)
     • 8 long-tail (20–44, quiet / dormant)
   Item ids deliberately mix REAL items (whose procedural scout
   subtrees we've measured to be deep / branch-heavy — iron-weather
   d10, night-forest d12, tape-weather d11, low-orbit d7, glass-
   signal d10, etc.) with synthetic ids whose subtrees come from
   `propagationForestFor`'s hash-seeded archetype rotation, so the
   tree gets variety automatically.
   Children left as empty arrays — the unified-forest builder
   ignores SignalTreeSignalNode.children and uses
   `propagationForestFor(itemId, listeners, rootScout)` for the
   actual rendered subtree (see inspectorData.ts:buildUnifiedForest). */
const rikuTree: DraftRoot = {
	type: 'user',
	id: 'riku',
	name: 'Riku',
	avatar: avatarFor('riku', 'RikuArchive'),
	role: 'Archive cartographer · score 89',
	children: [
		// ── Hero impacts ──────────────────────────────────────────
		{ type: 'signal', id: 'tree-riku-iron-weather', itemId: 'iron-weather',
		  title: 'Iron Weather', artist: 'Pale Motion',
		  impact: 96, listeners: 96, generations: 8,
		  status: 'Accelerating',
		  badges: ['Cascade Starter', 'Deep Branch'],
		  tags: ['drone', 'cassette ambient'],
		  children: [] },
		{ type: 'signal', id: 'tree-riku-low-orbit', itemId: 'low-orbit',
		  title: 'Low Orbit', artist: 'Hollow Field',
		  impact: 92, listeners: 84, generations: 7,
		  status: 'Accelerating',
		  badges: ['Cascade Starter'],
		  tags: ['post-rock drone'],
		  children: [] },
		{ type: 'signal', id: 'tree-riku-tape-weather', itemId: 'tape-weather',
		  title: 'Tape Weather', artist: 'Archive Unit',
		  impact: 90, listeners: 71, generations: 11,
		  status: 'Branch forming',
		  badges: ['Long Tail', 'Trailblazer'],
		  tags: ['cassette ambient'],
		  children: [] },
		{ type: 'signal', id: 'tree-riku-night-forest', itemId: 'night-forest',
		  title: 'Night Forest', artist: 'Pale Atelier',
		  impact: 88, listeners: 62, generations: 12,
		  status: 'Still moving',
		  badges: ['Long Tail'],
		  tags: ['long-form drone'],
		  children: [] },
		{ type: 'signal', id: 'tree-riku-glass-signal', itemId: 'glass-signal',
		  title: 'Glass Signal', artist: 'Pale Archive',
		  impact: 84, listeners: 49, generations: 6,
		  status: 'Still moving',
		  badges: ['Cross-Scene Bridge'],
		  tags: ['reverb drift'],
		  children: [] },
		{ type: 'signal', id: 'tree-riku-cold-dispatch', itemId: 'cold-dispatch',
		  title: 'Cold Dispatch', artist: 'Wire Theory',
		  impact: 80, listeners: 42, generations: 5,
		  status: 'Still moving',
		  badges: ['Early Seed'],
		  tags: ['post-rock crossover'],
		  children: [] },

		// ── Mid-tier ──────────────────────────────────────────────
		{ type: 'signal', id: 'tree-riku-frozen-sun', itemId: 'frozen-sun',
		  title: 'Frozen Sun', artist: 'Obscure Slovenian Band',
		  impact: 78, listeners: 34, generations: 4,
		  status: 'Still moving',
		  badges: ['Niche Spark'],
		  tags: ['ambient'],
		  children: [] },
		{ type: 'signal', id: 'tree-riku-mirror-static', itemId: 'mirror-static',
		  title: 'Mirror Static', artist: 'Pale Signal',
		  impact: 75, listeners: 28, generations: 5,
		  status: 'Branch forming',
		  badges: ['Trailblazer'],
		  tags: ['drone'],
		  children: [] },
		{ type: 'signal', id: 'tree-riku-soft-border', itemId: 'soft-border',
		  title: 'Soft Border', artist: 'Liminal State',
		  impact: 72, listeners: 26, generations: 4,
		  status: 'Still moving',
		  badges: ['Cross-Scene Bridge'],
		  tags: ['folk-leaning ambient'],
		  children: [] },
		{ type: 'signal', id: 'tree-riku-hollow-coast', itemId: 'hollow-coast',
		  title: 'Hollow Coast', artist: 'Shore Signal',
		  impact: 68, listeners: 22, generations: 4,
		  status: 'Still moving',
		  badges: ['Early Seed'],
		  tags: ['drone'],
		  children: [] },
		{ type: 'signal', id: 'tree-riku-ember-field', itemId: 'ember-field',
		  title: 'Ember Field', artist: 'Pale Iris',
		  impact: 64, listeners: 18, generations: 3,
		  status: 'Still moving',
		  badges: ['Niche Spark'],
		  tags: ['ambient orbit'],
		  children: [] },
		{ type: 'signal', id: 'tree-riku-neon-veda', itemId: 'neon-veda',
		  title: 'Neon Veda', artist: 'Slow Cathode',
		  impact: 60, listeners: 16, generations: 3,
		  status: 'Still moving',
		  badges: ['Niche Spark'],
		  tags: ['drone synth'],
		  children: [] },
		{ type: 'signal', id: 'tree-riku-minor-current', itemId: 'minor-current',
		  title: 'Minor Current', artist: 'Field Notes',
		  impact: 58, listeners: 15, generations: 3,
		  status: 'Still moving',
		  badges: ['Underground Seed'],
		  tags: ['ambient folk'],
		  children: [] },
		{ type: 'signal', id: 'tree-riku-pale-verge', itemId: 'pale-verge',
		  title: 'Pale Verge', artist: 'The Outline',
		  impact: 54, listeners: 12, generations: 3,
		  status: 'Branch forming',
		  badges: ['Cross-Scene Bridge'],
		  tags: ['ambient'],
		  children: [] },
		{ type: 'signal', id: 'tree-riku-rust-channel', itemId: 'rust-channel',
		  title: 'Rust Channel', artist: 'Bottom Field',
		  impact: 50, listeners: 11, generations: 2,
		  status: 'Still moving',
		  badges: ['Trailblazer'],
		  tags: ['drone'],
		  children: [] },
		{ type: 'signal', id: 'tree-riku-paper-radio', itemId: 'paper-radio',
		  title: 'Paper Radio', artist: 'Half-Tape',
		  impact: 47, listeners: 9, generations: 2,
		  status: 'Still moving',
		  badges: ['Niche Spark'],
		  tags: ['cassette ambient'],
		  children: [] },
		{ type: 'signal', id: 'tree-riku-signal-mirror', itemId: 'signal-mirror',
		  title: 'Signal Mirror', artist: 'Reverb Twin',
		  impact: 44, listeners: 8, generations: 2,
		  status: 'Still moving',
		  badges: ['Trailblazer'],
		  tags: ['reverb drift'],
		  children: [] },

		// ── Long-tail / quiet ─────────────────────────────────────
		{ type: 'signal', id: 'tree-riku-archive-twin', itemId: 'archive-twin',
		  title: 'Archive Twin', artist: 'Lost Mass',
		  impact: 38, listeners: 7, generations: 2,
		  status: 'Quiet',
		  badges: ['Early Seed'],
		  tags: ['cassette orbit'],
		  children: [] },
		{ type: 'signal', id: 'tree-riku-ghost-archive', itemId: 'ghost-archive',
		  title: 'Ghost Archive', artist: 'Vault Signal',
		  impact: 35, listeners: 6, generations: 2,
		  status: 'Quiet',
		  badges: ['Underground Seed'],
		  tags: ['long-form drone'],
		  children: [] },
		{ type: 'signal', id: 'tree-riku-hollow-tape', itemId: 'hollow-tape',
		  title: 'Hollow Tape', artist: 'Edge Field',
		  impact: 32, listeners: 5, generations: 2,
		  status: 'Quiet',
		  badges: ['Niche Spark'],
		  tags: ['cassette ambient'],
		  children: [] },
		{ type: 'signal', id: 'tree-riku-wireframe-dawn', itemId: 'wireframe-dawn',
		  title: 'Wireframe Dawn', artist: 'Pale Border',
		  impact: 30, listeners: 5, generations: 1,
		  status: 'Quiet',
		  badges: ['Trailblazer'],
		  tags: ['drone'],
		  children: [] },
		{ type: 'signal', id: 'tree-riku-mute-cathedral', itemId: 'mute-cathedral',
		  title: 'Mute Cathedral', artist: 'Slow Brass',
		  impact: 26, listeners: 4, generations: 1,
		  status: 'Quiet',
		  badges: ['Niche Spark'],
		  tags: ['drone'],
		  children: [] },
		{ type: 'signal', id: 'tree-riku-fragment-orbit', itemId: 'fragment-orbit',
		  title: 'Fragment Orbit', artist: 'Margin Static',
		  impact: 22, listeners: 3, generations: 1,
		  status: 'Dormant',
		  badges: ['Underground Seed'],
		  tags: ['cassette orbit'],
		  children: [] },
		{ type: 'signal', id: 'tree-riku-slow-mass', itemId: 'slow-mass',
		  title: 'Slow Mass', artist: 'Hidden Coast',
		  impact: 18, listeners: 2, generations: 1,
		  status: 'Dormant',
		  badges: ['Early Seed'],
		  tags: ['drone'],
		  children: [] },
		{ type: 'signal', id: 'tree-riku-cold-archive', itemId: 'cold-archive',
		  title: 'Cold Archive', artist: 'Drift Tape',
		  impact: 12, listeners: 1, generations: 1,
		  status: 'Dormant',
		  badges: ['Underground Seed'],
		  tags: ['cassette ambient'],
		  children: [] },
	],
};

const trees: Record<string, DraftRoot> = {
	dan: danTree,
	alice: aliceTree,
	gisli: gisliTree,
	riku: rikuTree,
};

/** Lookup by user id. Returns null when the user has no signal-tree
 *  data — the page renders a quiet empty state. */
export function getUserSignalTree(userId: string): UserSignalTree | null {
	const raw = trees[userId];
	if (!raw) return null;
	return { root: attachCovers(raw) };
}
