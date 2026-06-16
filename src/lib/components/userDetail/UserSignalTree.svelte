<script lang="ts">
	import PropagationTree from '$lib/components/itemDetail/PropagationTree.svelte';
	import {
		type PropagationForest,
		type PropagationUser,
		type PreviewTarget,
	} from '$lib/mock/propagation';
	import type { UserSignalTree as UserSignalTreeData } from '$lib/mock/userSignalTree';
	import { buildUnifiedForest } from './inspectorData';

	/*
		User Detail Signal Tree — unified architecture.

		ONE propagation graph drives the whole tree:

		  Dan (root scout)
		  └── Cold Dispatch (item node)
		      ├── Daria
		      │   └── Renan
		      └── Liv
		          └── …

		Particles flow naturally from leaves through item nodes up
		to Dan because every node is a real graph participant — no
		decorative bridges, no relay particles.

		Visual differentiation between user nodes and item nodes is
		layered on TOP of the propagation render (it has to be —
		PropagationTree / PropagationNode are unmodified). After
		mount, the marker effect adds `.item-node` to each item's
		wrapper; the style block at the bottom of this file gives
		those wrappers a rounded-square cover, larger size, and no
		kind-halo.

		The "Your signal" locator inside PropagationTree is
		disabled by passing `currentUserId={null}`. A new tree-
		level locator above tracks which item subtree is currently
		visible and reads "Signal · <title>" instead.
	*/

	let {
		tree,
		selectedNodeId = $bindable(null),
		onPreview: onPreviewCallback,
		visibleSignalCount = null,
		expandCommand = 0,
		collapseCommand = 0,
	}: {
		tree: UserSignalTreeData;
		/** Two-way bound — the parent page reads this to drive the
		 *  right-side inspector, and writes to it to programmatically
		 *  clear/select. Null means "no node selected" (default). */
		selectedNodeId?: string | null;
		/** Forwarded from PropagationTree. Fires on node hover / focus
		 *  with a `PreviewTarget`, and on tree-level mouseleave with
		 *  `null`. The page combines this with `selectedNodeId` to
		 *  drive a "hover wins, click locks" inspector — same model as
		 *  the Item Detail page. */
		onPreview?: (target: PreviewTarget | null) => void;
		/** Cap on the number of signal roots rendered (top-N by impact).
		 *  `null` = show all. Driven by the page's "Show more signals"
		 *  control so the tree never becomes an infinite vertical sink. */
		visibleSignalCount?: number | null;
		/** Tick counter the page increments to request "expand every
		 *  currently visible signal". The effect runs DOM clicks on the
		 *  visible signal chevrons — PropagationNode keeps owning the
		 *  per-node `expanded` state. Initial 0 is a no-op. */
		expandCommand?: number;
		/** Tick counter for the symmetric "collapse all currently visible
		 *  signal subtrees" command. */
		collapseCommand?: number;
	} = $props();

	/* Sliced tree — the rendered forest only includes the top-N
	   signals by impact so the page stays under control. The full
	   `tree` is still passed to the inspector so it can summarise the
	   WHOLE tree (Strongest branch / totals / etc) regardless of
	   what's currently visible. */
	const visibleTree = $derived.by(() => {
		const total = tree.root.children.length;
		if (visibleSignalCount == null || visibleSignalCount >= total) return tree;
		const sorted = [...tree.root.children].sort((a, b) => b.impact - a.impact);
		return {
			...tree,
			root: { ...tree.root, children: sorted.slice(0, Math.max(0, visibleSignalCount)) },
		};
	});

	/* Set of item ids surfaced in this user's tree. Used by the
	   item-node class marker and by the locator's
	   IntersectionObserver to know which wrappers to watch. */
	const itemIds = $derived(new Set(visibleTree.root.children.map(s => s.itemId)));

	/* Look-up from item id → display title + artist so the locator
	   can read "Cold Dispatch — Wire Theory" without re-walking
	   the tree. */
	const itemMeta = $derived(
		new Map(visibleTree.root.children.map(s => [s.itemId, { title: s.title, artist: s.artist }])),
	);

	/* Hoisted so the marker $effect below can locate Dan's wrapper
	   and tag its children-container without re-deriving the id. */
	const rootUserId = $derived(visibleTree.root.id);

	/* Forest is built by the shared helper in `inspectorData.ts` so the
	   page-level inspector can resolve selection against the SAME
	   forest (same scout ids, same structure). `propagationForestFor`
	   is hash-seeded on item id, so this is deterministic and stable. */
	const forest: PropagationForest = $derived(buildUnifiedForest(visibleTree));

	/* Click-toggle behaviour: re-selecting the active node clears
	   the selection so the inspector falls back to its default
	   Scout Summary state. Writing back through the $bindable
	   propagates to the parent page. */
	function handleSelect(user: PropagationUser) {
		selectedNodeId = selectedNodeId === user.id ? null : user.id;
	}
	function handlePreview(target: PreviewTarget | null) {
		/* Forward to the page so it can drive the right-side panel.
		   PropagationTree fires this for every hover/focus and clears
		   to `null` on tree-level mouseleave — same contract used by
		   the Item Detail page's `hoveredTarget ?? selectedTarget`
		   composition. */
		onPreviewCallback?.(target);
	}

	/* ── Item-node DOM marker ─────────────────────────────────
	   PropagationNode renders the same wrapper / avatar markup
	   regardless of nodeKind, so visual differentiation has to be
	   applied externally. After each render pass we walk the
	   freshly mounted tree and, for every wrapper whose
	   data-user-id is an item id, tag its OWN `.node-avatar`
	   element with `.item-node-avatar`. Marking the avatar (not
	   the wrapper) is important — a descendant-style selector on
	   the wrapper would also match nested user avatars under the
	   item, restyling scouts inside the item subtree by accident.
	   `wrapper.querySelector('.node-avatar')` returns the first
	   match in DOM order, which is always the wrapper's own
	   avatar (descendants come later). */
	let treeContainer: HTMLDivElement | null = $state(null);
	$effect(() => {
		void forest;          // re-run when the forest rebuilds
		void itemIds;         // re-run when the set of item ids changes
		void rootUserId;      // re-run if the root user changes
		if (!treeContainer) return;

		/* CRITICAL: PropagationNode renders .row-selection-zone (and
		   .node-avatar) with a REACTIVE class array binding that
		   includes the `isSelected` branch. When isSelected toggles,
		   Svelte re-writes the class attribute on those elements,
		   which WIPES any classes we previously added via
		   classList.add. That leaves the signal card without its
		   `.item-node-row` marker → CSS for width/border/etc no
		   longer applies → the card visually breaks (border vanishes,
		   width collapses to content). Each marked element gets a
		   MutationObserver that watches its class attribute and
		   re-adds our marker whenever Svelte's binding strips it.
		   Adding a class that's already present does NOT trigger a
		   further mutation, so there's no loop. */
		const observers: MutationObserver[] = [];
		let cancelled = false;

		requestAnimationFrame(() => {
			if (cancelled || !treeContainer) return;
			for (const id of itemIds) {
				const wrapper = treeContainer.querySelector(`[data-user-id="${id}"]`);
				if (!wrapper) continue;
				/* Wrapper's class binding in PropagationNode is
				   STATIC (`relative tree-node-wrapper`), so adding
				   `.item-node-wrapper` once is enough — Svelte never
				   re-writes it. */
				wrapper.classList.add('item-node-wrapper');

				const avatar = wrapper.querySelector('.node-avatar');
				const row = wrapper.querySelector('.row-selection-zone');
				const outerRow = row?.parentElement ?? null;

				const targets: Array<{ el: Element | null; cls: string }> = [
					{ el: avatar, cls: 'item-node-avatar' },
					{ el: row, cls: 'item-node-row' },
					{ el: outerRow, cls: 'item-node-outer-row' },
				];

				for (const { el, cls } of targets) {
					if (!el) continue;
					el.classList.add(cls);
					const obs = new MutationObserver(() => {
						if (!el.classList.contains(cls)) {
							el.classList.add(cls);
						}
					});
					obs.observe(el, { attributes: true, attributeFilter: ['class'] });
					observers.push(obs);
				}
			}
			/* Tag Dan's direct children container so we can give the
			   first signal card extra space below his row. The
			   container is the second normal-flow child of Dan's
			   wrapper (after `.row-selection-zone`) and carries the
			   `pl-12` Tailwind class. PropagationNode's container
			   class is static, so a single add suffices. */
			const danWrapper = treeContainer.querySelector(`[data-user-id="${rootUserId}"]`);
			const rootKids = danWrapper?.querySelector(':scope > div.pl-12');
			rootKids?.classList.add('root-children-container');

			/* Auto-collapse each newly mounted signal so the tree
			   starts compact ("the user chooses where to explore").
			   PropagationNode's `expanded` is internal $state with
			   default `true`, and we don't want to modify
			   PropagationNode — so the override is a one-shot
			   chevron click per wrapper, marked with
			   `data-signal-initialized` so we never re-fire it on
			   re-renders (e.g. selection toggles or new signals
			   becoming visible via "Show more"). A CSS rule in this
			   file pre-hides the children container of any
			   uninitialised wrapper, which prevents a one-frame
			   flash before the click flips `expanded` to false. */
			for (const id of itemIds) {
				const wrapper = treeContainer.querySelector(`[data-user-id="${id}"]`) as HTMLElement | null;
				if (!wrapper) continue;
				if (wrapper.dataset.signalInitialized === 'true') continue;
				const chev = wrapper.querySelector(
					':scope > div > button[aria-label$="branch"]',
				) as HTMLButtonElement | null;
				if (chev?.getAttribute('aria-label') === 'Collapse branch') {
					chev.click();
				}
				wrapper.dataset.signalInitialized = 'true';
			}
		});

		return () => {
			cancelled = true;
			for (const o of observers) o.disconnect();
		};
	});

	/* ── Bulk "Expand visible" / "Collapse visible" ─────────────
	   The page increments these counters; each effect watches its
	   own counter and fires DOM clicks on the chevrons of the
	   CURRENTLY VISIBLE signals only. Skipping the initial 0 value
	   means mount doesn't trigger a bulk command — `expand-visible`
	   is opt-in, not the default. */
	$effect(() => {
		void expandCommand;
		void itemIds;
		if (expandCommand === 0 || !treeContainer) return;
		requestAnimationFrame(() => {
			if (!treeContainer) return;
			for (const id of itemIds) {
				const wrapper = treeContainer.querySelector(`[data-user-id="${id}"]`);
				const chev = wrapper?.querySelector(
					':scope > div > button[aria-label$="branch"]',
				) as HTMLButtonElement | null;
				if (chev?.getAttribute('aria-label') === 'Expand branch') chev.click();
			}
		});
	});
	$effect(() => {
		void collapseCommand;
		void itemIds;
		if (collapseCommand === 0 || !treeContainer) return;
		requestAnimationFrame(() => {
			if (!treeContainer) return;
			for (const id of itemIds) {
				const wrapper = treeContainer.querySelector(`[data-user-id="${id}"]`);
				const chev = wrapper?.querySelector(
					':scope > div > button[aria-label$="branch"]',
				) as HTMLButtonElement | null;
				if (chev?.getAttribute('aria-label') === 'Collapse branch') chev.click();
			}
		});
	});

	/* ── "Signal: …" locator ──────────────────────────────────
	   Replaces PropagationTree's "Your signal" pill with a small
	   floating chip naming the item subtree currently in view.
	   `currentUserId={null}` on PropagationTree below disables
	   the original pill; this locator owns the same atmospheric
	   role but tied to the signal, not the page owner. */
	let currentSignal = $state<{ title: string; artist: string } | null>(null);
	let visibleRatios = $state<Map<string, number>>(new Map());

	$effect(() => {
		void forest;
		void itemIds;
		if (!treeContainer) return;
		const observer = new IntersectionObserver(
			(entries) => {
				const next = new Map(visibleRatios);
				for (const entry of entries) {
					const id = entry.target.getAttribute('data-user-id');
					if (id) next.set(id, entry.intersectionRatio);
				}
				/* Pick the item with the largest visible ratio. Ties
				   resolve to the order returned by the Map (insertion
				   order, which mirrors the rendered order). */
				let bestId: string | null = null;
				let bestRatio = 0;
				for (const [id, ratio] of next) {
					if (ratio > bestRatio) {
						bestRatio = ratio;
						bestId = id;
					}
				}
				visibleRatios = next;
				currentSignal = bestId && bestRatio > 0
					? (itemMeta.get(bestId) ?? null)
					: null;
			},
			{
				/* Shrink the effective viewport top by 56 px (fixed
				   global header) and bottom by 80 px (fixed player
				   bar) so the "current signal" reflects what the
				   reader is genuinely focused on. */
				rootMargin: '-56px 0px -80px 0px',
				threshold: [0, 0.25, 0.5, 0.75, 1],
			},
		);
		requestAnimationFrame(() => {
			if (!treeContainer) return;
			for (const id of itemIds) {
				const el = treeContainer.querySelector(`[data-user-id="${id}"]`);
				if (el) observer.observe(el);
			}
		});
		return () => observer.disconnect();
	});
</script>

{#if currentSignal}
	<div class="signal-locator" aria-hidden="true">
		<span class="signal-locator-title">{currentSignal.title}</span>
		<span class="signal-locator-divider">—</span>
		<span class="signal-locator-artist">{currentSignal.artist}</span>
	</div>
{/if}

<div class="user-signal-tree" bind:this={treeContainer}>
	<PropagationTree
		forest={forest}
		selectedUserId={selectedNodeId}
		onSelect={handleSelect}
		onPreview={handlePreview}
		currentUserId={null}
	/>
</div>

<style>
	/* Hide PropagationTree's section eyebrow when mounted inside
	   the User Tree — surrounding page already carries the
	   section context. Targets without touching
	   PropagationTree.svelte itself. */
	:global(.user-signal-tree > div > div:first-child) {
		display: none;
	}

	/* ── Item-node visual identity ─────────────────────────────
	   Applied to the `.node-avatar` element of each item node,
	   marked `.item-node-avatar` by the script above. Selecting
	   directly on the avatar avoids descendant-style leakage onto
	   scout avatars NESTED beneath the item. Scoped under
	   `.user-signal-tree` so the Item Detail tree is untouched. */

	/* Override the hardcoded `w-7 h-7 rounded-full` avatar circle
	   with a rounded square, substantially larger than scout
	   avatars (52 px vs 28 px) so the cover becomes the visual
	   anchor of the row and reads as the branch root. The cover
	   sits fully inside the card — NO negative margins, no
	   overflow tricks. The propagation conduit's elbow lands at
	   the card's left edge, which is the correct visual contract
	   here: card-is-the-node, cover-is-the-art-inside-it. */
	:global(.user-signal-tree .item-node-avatar > div) {
		width: 46px;
		height: 46px;
		border-radius: 7px;
		/* Stronger cover contrast — the cover is the visual root
		   of the branch, so its edge should crisp-up against the
		   card body. Still a single hairline, just more present. */
		border-color: oklch(1 0 0 / 0.18);
		box-shadow: 0 1px 0 oklch(0 0 0 / 0.32);
	}

	/* Defensive: clear PropagationNode's `mt-0.5` and any prior
	   negative-margin overrides. Avatar flows naturally in the
	   row's flex layout; `align-items: center` on the row pins it
	   vertically against the text column. */
	:global(.user-signal-tree .item-node-avatar) {
		margin: 0;
	}

	/* Suppress kind-halo + origin-glyph decorations on item nodes
	   so the cover-square reads as an unambiguous media object,
	   not a styled scout. */
	:global(.user-signal-tree .item-node-avatar::before),
	:global(.user-signal-tree .item-node-avatar::after),
	:global(.user-signal-tree .item-node-avatar > span.sa-ripple) {
		display: none !important;
	}
	:global(.user-signal-tree .item-node-avatar > .origin-glyph) {
		display: none;
	}

	/* Signal-card container — fixed 280 px width across every item
	   so the column of cards reads as a uniform vertical stack
	   regardless of title / artist length. Lightweight glass:
	   quiet vertical gradient, faint border, soft blur — sits
	   under the cover artwork rather than competing with it.
	   `background-image` (gradient) lets PropagationNode's
	   selection-state `background-color` layer on top cleanly. */
	:global(.user-signal-tree .item-node-row) {
		width: 280px;
		/* Tightened padding + lighter container so the row reads as
		   "graph node with attached metadata" rather than a filled
		   list card. Cover stays 46 px (the visual anchor of the
		   row), so reducing the surrounding chrome pulls focus to
		   the artwork without changing the node's identity. */
		padding: 6px 10px;
		gap: 10px;
		align-items: center;

		/* PERMANENT BASE OUTLINE — same `!important` discipline as
		   before so the border survives every selection-state
		   re-render. Opacity dropped from 0.20 → 0.12 so the
		   rectangle is felt without dominating. PropagationNode's
		   selected state adds `ring-1 ring-accent/45` outside this
		   border — selection still stacks on top. */
		border: 1px solid oklch(1 0 0 / 0.12) !important;
		border-radius: 8px;
		background-image: linear-gradient(
			to bottom,
			oklch(0.20 0.04 260 / 0.18) 0%,
			oklch(0.16 0.03 260 / 0.10) 100%
		);
		backdrop-filter: blur(6px);
		-webkit-backdrop-filter: blur(6px);
		box-shadow: 0 1px 0 oklch(1 0 0 / 0.03) inset, 0 1px 6px oklch(0 0 0 / 0.10);
		position: relative;
	}

	/* Conduit docking notch — a thin highlight on the card's left
	   edge at the conduit elbow's Y position (elbow tip = 14 + 4 =
	   18 px from wrapper top; card row starts at the same y, so
	   notch sits at row_y ≈ 14). Reads as the card's "connector
	   port", reinforcing that the conduit terminates INTO the
	   card rather than landing adjacent to it. Neutral white-
	   alpha (not blue) so it doesn't have to track the conduit's
	   activity-driven colour palette and stays subtle. */
	:global(.user-signal-tree .item-node-row)::before {
		content: '';
		position: absolute;
		left: -1px;
		top: 13px;
		width: 2px;
		height: 11px;
		background: oklch(1 0 0 / 0.45);
		border-radius: 1px;
		pointer-events: none;
	}

	/* Brighten the title — modest weight bump (semibold→700) and
	   a brighter alpha (95→100). Reads as "root-node title" vs.
	   regular scout name. Targeted via the title-row > p (which
	   `display: contents` lifts to be a direct child of the text
	   column; ordered 1 by our flex rules above). */
	:global(
		.user-signal-tree
		.item-node-row
		> div:last-child
		> div
		> p:first-child
	) {
		color: oklch(0.98 0.005 260 / 1) !important;
		font-weight: 700;
	}

	/* ── Vertical breathing room ──────────────────────────────
	   Two surgical paddings that exploit the rail topology:

	   1. Each item-node wrapper gets `padding-bottom: 28px`. The
	      wrapper's bottom-extension SVG uses
	      `preserveAspectRatio="none"` + `height: calc(100% - 20px)`,
	      so it stretches to fill the new wrapper height. The next
	      sibling's top-stub starts at its own wrapper-top, which
	      sits flush against the previous wrapper's bottom — rail
	      stays continuous. Visually this lifts each signal card
	      off the previous subtree's tail (Saga, etc.) so adjacent
	      signal branches feel like distinct roots, not a stack.

	   2. Dan's children container gets `padding-top: 28px`. This
	      pushes the FIRST item card down, creating a deliberate
	      atmospheric break between Dan and the signals he sparked
	      (Dan ↓ space ↓ signals ↓ scouts). The container has no
	      rail SVG in its padding-top zone — that's intentional:
	      the gap reads as "transmission space" rather than a
	      continuous wire, reinforcing the hierarchy break.
	      Particles still flow correctly because they use the
	      `--conduit-path` variable on Dan's wrapper, independent
	      of the static rail visuals. */
	:global(.user-signal-tree .item-node-wrapper) {
		padding-bottom: 28px;
	}
	:global(.user-signal-tree .root-children-container) {
		/* Dan → first signal: tightened from 28 → 16 px so the signal
		   feels like Dan's direct child rather than a separate object
		   waiting in transmission space. With only ~16 px between
		   Dan's row and the first signal's stub, the rail's 14 px
		   conduit-top-stub fills most of the gap and the parent-
		   child read is immediate. No additional rail visuals or
		   special-case treatments — just spacing. */
		padding-top: 16px;
	}

	/* ── Trunk → signal handoff ───────────────────────────────
	   The outer row layout is `[chevron 16 px | gap 16 px | card]`
	   = 32 px between trunk and card. Collapse only the gap (not
	   the chevron) so the card slides ~16 px left while the
	   expand/collapse affordance + its keyboard interaction stay
	   fully intact. Chevron now sits flush against the card's
	   left edge, which reads naturally as "node toggle attached
	   to the signal node" rather than a stray control floating in
	   the conduit area. */
	:global(.user-signal-tree .item-node-outer-row) {
		gap: 4px;
	}

	/* Signal → first scout: pull the item's children container UP
	   so the first scout reads as the signal's direct descendant
	   without sitting *underneath* the card's bottom border. -2 px
	   is the sweet spot — at -12 px the scout's avatar was only
	   2 px below the card's outline (the regression); at 0 px the
	   gap regrows to ~14 px above-cover. -2 lands ~12 px of clean
	   clearance between the card's bottom border and the scout's
	   avatar top, while still feeling like an immediate handoff
	   from the signal. Sibling-scout spacing inside the container
	   is unaffected because they all shift together. */
	:global(.user-signal-tree .item-node-wrapper > div.pl-12) {
		margin-top: -2px;
	}

	/* Auto-collapse flash guard — hide the children container of any
	   newly mounted signal wrapper until our marker $effect has
	   flipped `expanded` to false via the chevron click. Without
	   this, signals briefly render with their full scout subtree
	   visible for one frame before the click lands. The
	   `data-signal-initialized` attribute is set by the same effect
	   *after* the click, so the rule only ever blocks the initial
	   paint of an as-yet-uninitialised wrapper. PropagationNode's
	   conditional `{#if expanded}` removes the container entirely
	   once it lands, so the rule has no effect on user-driven
	   re-expansion. */
	:global(
		.user-signal-tree
		.item-node-wrapper:not([data-signal-initialized='true'])
		> div.pl-12
	) {
		display: none;
	}

	/* Text column — promote to a flex COLUMN and use `order` to
	   place rows as: name → artist → pill. The pill lives inside
	   PropagationNode's inner title-row div (next to the name);
	   `display: contents` dissolves that wrapper so its children
	   (name <p> and pill <span>) become flex items of THIS column
	   and can be re-ordered independently of the artist <p>.
	   Avoids absolute positioning entirely. */
	:global(.user-signal-tree .item-node-row > div:last-child) {
		display: flex;
		flex-direction: column;
		flex: 1 1 auto;
		min-width: 0;
	}
	:global(.user-signal-tree .item-node-row > div:last-child > div) {
		display: contents;
	}
	:global(.user-signal-tree .item-node-row > div:last-child > div > p) {
		order: 1;
	}
	:global(.user-signal-tree .item-node-row > div:last-child > p) {
		order: 2;
	}
	:global(
		.user-signal-tree
		.item-node-row
		> div:last-child
		> div
		> span[aria-label^='branch size']
	) {
		order: 3;
		align-self: flex-start;
		margin-top: 4px;
		padding: 2px 8px;
		border-radius: 9999px;
		/* Bumped contrast across all three layers (bg / text /
		   border) for at-a-glance comparability between +92, +88,
		   +84, +50 stacked vertically across cards. Same hue
		   (oklch 60 = amber), same size, same shape, just more
		   confidently amber. */
		background-color: oklch(0.86 0.12 60 / 0.18);
		color: oklch(0.92 0.13 60 / 1) !important;
		border: 1px solid oklch(0.86 0.12 60 / 0.50);
		font-size: 10.5px;
		font-weight: 600;
		letter-spacing: 0.02em;
		line-height: 1.2;
	}

	/* ── "Signal: …" locator pill ──────────────────────────────
	   Quiet floating chip at top center; shape + tone mirrors the
	   ItemMiniHeader pattern used elsewhere on the product so it
	   feels native to the page family. Sits below the global
	   header (h-14) and above the bottom player. */
	.signal-locator {
		position: fixed;
		top: 4rem;
		left: 50%;
		transform: translateX(-50%);
		z-index: 40;
		display: inline-flex;
		align-items: baseline;
		gap: 0.375rem;
		padding: 0.25rem 1rem;
		border-radius: 9999px;
		border: 1px solid oklch(1 0 0 / 0.12);
		background-color: oklch(0.16 0.018 260 / 0.82);
		backdrop-filter: blur(6px);
		-webkit-backdrop-filter: blur(6px);
		max-width: 90vw;
		pointer-events: none;
	}
	.signal-locator-title {
		font-size: 12.5px;
		font-weight: 600;
		color: oklch(0.88 0.001 0 / 0.94);
		white-space: nowrap;
	}
	.signal-locator-divider {
		font-size: 12px;
		color: oklch(0.88 0.001 0 / 0.35);
	}
	.signal-locator-artist {
		font-size: 12px;
		color: oklch(0.88 0.001 0 / 0.65);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>
