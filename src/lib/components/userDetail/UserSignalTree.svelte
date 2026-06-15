<script lang="ts">
	import PropagationTree from '$lib/components/itemDetail/PropagationTree.svelte';
	import {
		propagationForestFor,
		findUserInForest,
		type PropagationForest,
		type PropagationUser,
		type PreviewTarget,
	} from '$lib/mock/propagation';
	import type { UserSignalTree as UserSignalTreeData } from '$lib/mock/userSignalTree';

	/*
		User Detail Signal Tree — unified architecture.

		ONE propagation graph drives the whole tree:

		  Dan (root scout)
		  └── Cold Dispatch (item node)
		      ├── Daria
		      │   └── Renan
		      │       └── …
		      ├── Liv
		      │   └── …
		      └── Gisli
		          └── …

		Particles flow naturally from the leaves upward through every
		node — including the item nodes and Dan — because every
		participant is a real node in the graph. No decorative
		bridge particles, no synthetic relay dots, no fake trunk
		animations.

		The graph is constructed here and handed to the existing
		`PropagationTree` from the Item Detail page. PropagationTree
		and PropagationNode are completely unchanged.

		Construction:
		  1. For each signal, call `propagationForestFor(itemId,
		     listeners, rootUserId)` — the same generator the Item
		     Detail page uses.
		  2. Splice the rebranded root (Dan, Alice, …) out of each
		     per-signal forest; that scout's children become the
		     item node's children.
		  3. Wrap each signal as a `PropagationUser` with the item's
		     cover as the avatar and the artist as the character
		     line — same node-kind language as a successful
		     amplifier so the visual halo + ripple read clearly.
		  4. Wrap the page owner as a `PropagationUser` whose
		     children are the signal item nodes; tag him as origin
		     + current user so he renders with the origin glyph and
		     the cu-row treatment.

		The Inspector, locator pill, and lineage reveal are
		disabled here by not passing inspector hooks and by
		leaving `lineageOrderedIds`/`lineageIds` at their defaults.
		Selection styling DOES flow because `onSelect` is wired —
		clicking a node lights it up; no inspector pops up.
	*/

	let {
		tree,
	}: {
		tree: UserSignalTreeData;
	} = $props();

	const forest: PropagationForest = $derived.by(() => {
		const rootUserId = tree.root.id;

		/* Per-signal child trees. The propagation generator
		   rebrands the largest root as the named scout
		   (rootUserId), so after the call the scout owns a real
		   subtree — we take that subtree's CHILDREN as the
		   children of the item node and discard the scout itself
		   (it's about to be re-attached one level up, beneath the
		   item node, beneath Dan). */
		const itemChildren: PropagationUser[] = [...tree.root.children]
			.sort((a, b) => b.impact - a.impact)
			.map((signal): PropagationUser => {
				const signalForest = propagationForestFor(signal.itemId, signal.listeners, rootUserId);
				const rebranded = findUserInForest(signalForest, rootUserId);
				const downstream = rebranded ? rebranded.children : signalForest.roots;
				return {
					id: signal.itemId,
					name: signal.title,
					avatar: signal.coverArt,
					character: signal.artist,
					amplifications: signal.generations,
					branchSize: 0, // recomputed below
					discoveredAgo: '',
					behaviorNote: '',
					scenes: signal.tags,
					children: downstream,
					nodeKind: 'successful-amplifier',
				};
			});

		const danNode: PropagationUser = {
			id: rootUserId,
			name: tree.root.name,
			avatar: tree.root.avatar,
			character: tree.root.role,
			amplifications: itemChildren.length,
			branchSize: 0, // recomputed below
			discoveredAgo: '',
			behaviorNote: '',
			scenes: [],
			children: itemChildren,
			isOrigin: true,
			isCurrentUser: true,
			nodeKind: 'successful-amplifier',
		};

		/* Recompute branchSize bottom-up. The propagation engine's
		   internal layout (children-by-branchSize sort) reads this
		   value, so synthetic nodes need correct counts to
		   render in a reasonable order. */
		function annotate(u: PropagationUser): number {
			let n = 0;
			for (const c of u.children) n += 1 + annotate(c);
			u.branchSize = n;
			return n;
		}
		annotate(danNode);

		return {
			itemId: `user-tree-${rootUserId}`,
			roots: [danNode],
			hiddenRootUsers: [],
			hiddenRoots: 0,
			totalReach: danNode.branchSize,
			independentOrigins: 1,
			weightedImpact: 0,
			totalAmplifications: itemChildren.length,
			summary: '',
			branchSummaries: [],
			scenes: [],
			crossingNote: '',
			originNote: '',
		};
	});

	let selectedUserId = $state<string | null>(null);

	function handleSelect(user: PropagationUser) {
		/* Toggle on repeat click — mirrors the Item Detail tree's
		   behaviour. No inspector is mounted; selection is purely
		   for visual feedback at this stage. */
		selectedUserId = selectedUserId === user.id ? null : user.id;
	}
	function handlePreview(_target: PreviewTarget | null) {
		/* No inspector. */
	}
</script>

<div class="user-signal-tree">
	<PropagationTree
		forest={forest}
		selectedUserId={selectedUserId}
		onSelect={handleSelect}
		onPreview={handlePreview}
		currentUserId={tree.root.id}
	/>
</div>

<style>
	/* Hide PropagationTree's section eyebrow ("Propagation lineage ·
	   N origins · M reached") when mounted inside the User Tree —
	   the surrounding page already carries the section context.
	   Targets the eyebrow without touching PropagationTree.svelte
	   itself (the eyebrow is the first `<div>` child of
	   PropagationTree's outermost `<div class="flex flex-col gap-1">`,
	   a stable structure inherited from the Item Detail page mount). */
	:global(.user-signal-tree > div > div:first-child) {
		display: none;
	}
</style>
