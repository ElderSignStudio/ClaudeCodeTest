<script lang="ts">
	import { ChevronDown, ChevronRight } from 'lucide-svelte';
	import type { PropagationUser, PreviewTarget, PropagationEdgeKind } from '$lib/mock/propagation';
	import { sortNodesByPropagation } from '$lib/mock/propagation';
	import Self from './PropagationNode.svelte';

	/*
		One row of the propagation tree. Renders this user plus, recursively,
		its children. Expansion state is LOCAL per node. Selection is global
		to the page (flowed in via props) and is set on click. Inspector
		PREVIEW is also global to the page; previews fire on hover so the
		inspector can dynamically describe whatever the user is currently
		investigating without committing a selection.

		Tree Visual Language v1:
		  - `nodeKind` drives a CSS class on the avatar wrapper (`nk-*`)
		    which adds a kind-specific halo via a pseudo-element. Identity
		    decorations (origin border, current-user ring, selected border)
		    still apply to the inner avatar and compose over the halo.
		  - `incomingEdgeKind` drives a per-child connector class on the
		    absolute-positioned vertical line bringing the child into its
		    parent. Each child carries its own segment so siblings can read
		    differently while still forming a visually connected rail.
		  - High-impact / successful-amplifier scouts get a brighter `+N`
		    branch-size readout — branch mass made visible without badges.

		v1 limitation: `hiddenChildren` is just an editorial count. Clicking
		"+N more" reveals N greyed placeholder rows. Hovering "+N more"
		previews the cluster's editorial description in the inspector.
	*/

	let {
		user,
		selectedUserId,
		onSelect,
		onPreview,
		depth = 0,
	}: {
		user: PropagationUser;
		selectedUserId: string | null;
		onSelect: (user: PropagationUser) => void;
		onPreview: (target: PreviewTarget | null) => void;
		depth?: number;
	} = $props();

	let expanded = $state(true);
	let tailExpanded = $state(false);

	const hasVisibleChildren = $derived(user.children.length > 0);
	const isSelected = $derived(selectedUserId === user.id);

	// Sort children by propagation strength so the strongest sibling reads
	// first. Preview nodes go to the END of the sibling group so Dan's
	// inserted preview stays positionally stable.
	const sortedChildren = $derived(sortNodesByPropagation(user.children));

	// Derived treatment helpers — each maps a semantic field onto a CSS
	// variant class defined in app.css. Kept as pure functions so the
	// classes can compose in the template via the [array] syntax.

	function edgeLineClass(kind: PropagationEdgeKind | undefined): string {
		switch (kind) {
			case 'active':       return 'edge-line edge-active';
			case 'strong':       return 'edge-line edge-strong';
			case 'quiet':        return 'edge-line edge-quiet';
			case 'cross-scene':  return 'edge-line edge-cross-scene';
			case 'fresh':        return 'edge-line edge-fresh';
			case 'archival':     return 'edge-line edge-archival';
			case 'passive':
			default:             return 'edge-line edge-passive';
		}
	}

	function nodeKindClass(u: PropagationUser): string {
		if (u.isPreviewNode) return '';
		switch (u.nodeKind) {
			case 'successful-amplifier': return 'nk-success';
			case 'amplifier':            return 'nk-amp';
			case 'deep-listener':        return 'nk-deep';
			case 'passive-listener':     return 'nk-passive';
			default:                     return '';
		}
	}


	// Branch mass visual cue — successful amplifiers and high-impact scouts
	// earn a slightly brighter +N readout. No new numbers, no badges.
	const branchAccented = $derived(
		(user.highImpact ?? false) || (user.isSuccessfulAmplifier ?? false),
	);

	// "Hub" parents — successful amplifiers only (bridge styling was removed
	// in the v2 debug pass). Outgoing edges leaving these get a brightness
	// boost via `.edges-from-hub` on the children container.
	const isHubParent = $derived(
		user.nodeKind === 'successful-amplifier'
		|| user.isSuccessfulAmplifier === true,
	);

	// Whether this row should read as a "quiet" lane in scanning — dims
	// the row a touch so the eye drops past it. Applies to passive
	// listeners that are NOT the current user or a selected node.
	const isQuietRow = $derived(
		user.nodeKind === 'passive-listener'
		&& !user.isPreviewNode
		&& !user.isCurrentUser
		&& !isSelected,
	);

	// High-impact non-success row tint. Successful-amplifier rows get
	// their own (richer) hub glow via .sa-row.
	const isHighImpactRow = $derived(
		(user.highImpact === true || (user.branchSize ?? 0) >= 5)
		&& user.nodeKind !== 'successful-amplifier'
		&& !user.isSuccessfulAmplifier
		&& !user.isPreviewNode
		&& !isSelected
		&& !user.isCurrentUser,
	);

	const isSuccessAmplifierRow = $derived(
		(user.nodeKind === 'successful-amplifier' || user.isSuccessfulAmplifier === true)
		&& !user.isPreviewNode
		&& !isSelected,
	);

	// Amplifier row gets a fainter accent wash — visibly above passive/deep
	// but clearly below the successful-amplifier hub glow.
	const isAmplifierRow = $derived(
		user.nodeKind === 'amplifier'
		&& !user.isPreviewNode
		&& !isSelected
		&& !user.isCurrentUser
		&& !isSuccessAmplifierRow,
	);

	// Anonymous placeholder rows for the hidden tail when expanded. They are
	// real PropagationUser shapes so the inspector can pick them up; flagged
	// as quiet/passive so they read as background presence in the tree.
	function stubsFor(count: number): PropagationUser[] {
		return Array.from({ length: count }, (_, i) => ({
			id: `${user.id}-stub-${i}`,
			name: 'Anonymous listener',
			avatar: '',
			character: 'Quieter onward reach',
			amplifications: 0,
			branchSize: 0,
			discoveredAgo: 'Recently',
			behaviorNote: 'Editorial topology hint — no individual reach data attached at this depth.',
			children: [],
			nodeKind: 'passive-listener' as const,
			incomingEdgeKind: 'quiet' as const,
		}));
	}
</script>

<div class="relative">
	<!--
		Row: caret + avatar + name + character. The row uses `role="button"`
		(not a real <button>) so the inner caret can remain a real button
		without nesting. Keyboard activation (Enter / Space) is wired manually.
		Hover / focus preview the user in the inspector without committing the
		selection. The tree-level mouseleave clears the preview when the
		pointer exits the lineage area entirely.
	-->
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<div
		class={[
			'group/row relative w-full flex items-start gap-4 py-1.5 pl-1 pr-2 rounded-md text-left transition-colors duration-150 overflow-visible',
			user.isPreviewNode
				? 'cursor-default opacity-50'
				: 'cursor-pointer',
			!user.isPreviewNode && (isSelected
				? 'bg-accent/12 ring-1 ring-accent/35'
				: user.isCurrentUser
					? 'bg-primary/14 ring-1 ring-primary/35 hover:bg-primary/18 cu-row'
					: 'hover:bg-white/4'),
			isSuccessAmplifierRow && 'sa-row',
			isAmplifierRow && 'amp-row',
			isHighImpactRow && 'hi-row',
			isQuietRow && 'q-row',
		]}
		onclick={() => onSelect(user)}
		onkeydown={(e) => { if (!user.isPreviewNode && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onSelect(user); } }}
		onmouseenter={() => onPreview({ kind: 'user', user })}
		onfocusin={() => onPreview({ kind: 'user', user })}
		role={user.isPreviewNode ? 'presentation' : 'button'}
		tabindex={user.isPreviewNode ? undefined : 0}
		aria-disabled={user.isPreviewNode ? 'true' : undefined}
	>
		<!-- Expand/collapse caret — only when there are visible children -->
		{#if hasVisibleChildren}
			<button
				class="shrink-0 mt-1 w-4 h-4 flex items-center justify-center text-base-content/45 hover:text-base-content/85 transition-colors"
				onclick={(e) => { e.stopPropagation(); expanded = !expanded; }}
				aria-label={expanded ? 'Collapse branch' : 'Expand branch'}
			>
				{#if expanded}
					<ChevronDown size={12} />
				{:else}
					<ChevronRight size={12} />
				{/if}
			</button>
		{:else}
			<span class="shrink-0 mt-1 w-4 h-4" aria-hidden="true"></span>
		{/if}

		<!--
			Avatar wrapper composes BASE kind silhouette with overlay states.

			  Layer 1 — BASE silhouette (from nodeKind):
			    passive    → no decoration, no motion
			    deep       → static drop-shadow filled glow (no motion)
			    amplifier  → ring + outward ripple (TRANSMISSION motion)
			    success    → double ring + orbit comet (TRANSMISSION motion)

			  Layer 2 — OVERLAY isOrigin (stackable, STATIC):
			    origin-aura span (z:-1, behind everything)
			    origin-dot span (top-right)
			    accent border/ring on inner avatar

			  Layer 3 — OVERLAY isCurrentUser (stackable, STATIC):
			    primary border/ring on inner avatar (wins over origin)
			    cu-row left rail + bg on the row
			    YOU label

			Motion semantics: only the base kind (amp/success) animates.
			Identity overlays never add their own outward ripple — they're
			recognized by color (primary/accent), border weight, and label.

			`isolate` creates a stacking context so origin-aura sits at z:-1.
		-->
		<div
			class={[
				'shrink-0 mt-0.5 relative overflow-visible node-avatar',
				!user.isPreviewNode && nodeKindClass(user),
			]}
		>
			{#if user.nodeKind === 'successful-amplifier' && !user.isPreviewNode}
				<!-- Outward broadcast ripple for successful amplifiers. Slower
				     and wider than nk-amp::before so it reads as a deeper
				     transmission wave composing with the orbit comet
				     (::before) and the double-ring halo (::after). -->
				<span class="sa-ripple" aria-hidden="true"></span>
			{/if}
			<div
				class={[
					'w-7 h-7 rounded-full overflow-hidden border transition-transform duration-200',
					/*
						Avatar border is the only "outline" on the avatar itself.
						Rings (ring-*) are reserved for transmission kinds (amp /
						successful-amp via their pseudo halos). Origin and
						current-user contribute via non-ring markers (root tick,
						origin dot, cu-row rail, YOU/ORIGIN labels).

						Current-user's primary-tinted border is the allowed
						"single outline" emphasis for identity. Origin keeps a
						neutral border so it doesn't read like a transmission
						ring; origin identity reads via the dot + tick + label.
					*/
					user.isPreviewNode
						? 'border-white/15 border-dashed'
						: isSelected
							? 'border-accent/65'
							: user.isCurrentUser
								? 'border-primary/65'
								: user.nodeKind === 'passive-listener'
									? 'border-white/10'
									: 'border-white/18',
					user.nodeKind === 'passive-listener' && !user.isPreviewNode && !user.isCurrentUser && 'scale-[0.74]',
					user.nodeKind === 'deep-listener'    && !user.isPreviewNode && !user.isCurrentUser && 'scale-[0.84]',
				]}
			>
				{#if user.avatar}
					<img
						src={user.avatar}
						alt=""
						class={[
							'w-full h-full object-cover',
							user.isPreviewNode && 'grayscale opacity-60',
							user.nodeKind === 'passive-listener' && !user.isCurrentUser && 'opacity-65 saturate-50',
							user.nodeKind === 'deep-listener' && !user.isCurrentUser && 'opacity-78 saturate-70',
						]}
					/>
				{:else}
					<!-- Anonymous stub: solid neutral fill, no image -->
					<div class="w-full h-full bg-base-content/12"></div>
				{/if}
			</div>
			{#if user.isOrigin && !user.isPreviewNode}
				<!-- Origin marker — a small horizontal accent beam ending
				     in a dot, sitting just to the LEFT of the avatar. It's
				     positioned inside .node-avatar so it visually hugs the
				     avatar (reads as "signal entered the forest at this
				     node") without altering any avatar surface property
				     (size, opacity, color, glow, ring, saturation are all
				     reserved for behavioral nodeKind signals). -->
				<span class="origin-glyph" aria-hidden="true"></span>
			{/if}

		</div>

		<!--
			Name + character. Preview nodes italicize the character ("Amplify
			to be included here") so the row reads as an invitation, not a
			real scout. The viewer's own node gets a "you" micro-label
			matching the origin/high-impact label cadence.
		-->
		<div class="min-w-0 flex-1">
			<div class="flex items-baseline gap-2">
				<p class={[
					'text-[13px] font-semibold leading-snug truncate',
					user.isPreviewNode
						? 'text-base-content/45 italic'
						: isSelected
							? 'text-accent/95'
							: user.isCurrentUser
								? 'text-primary'
								: user.nodeKind === 'passive-listener'
									? 'text-base-content/58'
									: 'text-base-content/95',
				]}>
					{user.name}
				</p>
				{#if user.isOrigin && !user.isPreviewNode}
					<span class="text-[10px] uppercase tracking-widest text-accent/82 shrink-0">origin</span>
				{/if}
			</div>
			<p class={[
				'text-[11px] leading-snug truncate',
				user.isPreviewNode
					? 'text-base-content/40 italic'
					: user.nodeKind === 'passive-listener'
						? 'text-base-content/35'
						: 'text-base-content/60',
			]}>
				{user.character}
			</p>
		</div>

		<!--
			Branch-size hint on the right edge. Successful amplifiers and
			high-impact scouts get a brighter accent treatment so the number
			reads as "this scout helped the signal travel" without becoming
			a badge.
		-->
		{#if user.branchSize > 0}
			<span class={[
				'shrink-0 mt-1.5 text-[10px] font-mono tabular-nums',
				(user.isSuccessfulAmplifier || user.nodeKind === 'successful-amplifier')
					? 'text-accent font-semibold'
					: branchAccented
						? 'text-accent/85'
						: 'text-base-content/42',
			]}>
				+{user.branchSize}
			</span>
		{/if}
	</div>

	<!--
		Empty-downstream placeholder. When the current user is a real node in
		the tree with no visible children (and no hidden ones), render a quiet
		"signal searching for scouts" continuation so the user reads "my branch
		exists but hasn't propagated yet" instead of a dead end. Decorative —
		not selectable, not announced by screen readers as interactive.
	-->
	{#if user.isCurrentUser && !user.isPreviewNode && user.children.length === 0 && !user.hiddenChildren}
		<div
			class="relative pl-5 ml-3.5 border-l border-dashed border-primary/32"
			aria-hidden="true"
		>
			<div class="flex items-center gap-2 py-1.5 pl-1 pr-2">
				<span class="shrink-0 w-4 h-4" aria-hidden="true"></span>
				<span class="shrink-0 w-7 h-7 flex items-center justify-center">
					<span class="signal-ember w-2 h-2 rounded-full bg-primary"></span>
				</span>
				<p class="text-[11px] italic leading-snug text-primary/55">
					Signal searching for scouts
				</p>
			</div>
		</div>
	{/if}

	<!--
		Children — recursive — only when expanded. Each child wraps in its
		own `pl-5` container with an absolute-positioned edge line whose
		variant class derives from `child.incomingEdgeKind`. Stacked, the
		segments form a connected rail where each section can read differently.
	-->
	{#if hasVisibleChildren && expanded}
		<div class={['relative ml-3.5', isHubParent && 'edges-from-hub']}>
			{#each sortedChildren as child (child.id)}
				<div class="relative pl-5">
					<span class={['absolute inset-y-0 left-0', edgeLineClass(child.incomingEdgeKind)]} aria-hidden="true"></span>
					<Self
						user={child}
						{selectedUserId}
						{onSelect}
						{onPreview}
						depth={depth + 1}
					/>
				</div>
			{/each}

			<!-- Hidden tail: "+N more" indicator (collapsed) or anonymized stubs (expanded) -->
			{#if user.hiddenChildren && user.hiddenChildren > 0}
				{#if !tailExpanded}
					<div class="relative pl-5">
						<span class="absolute inset-y-0 left-0 edge-line edge-passive" aria-hidden="true"></span>
						<button
							class="w-full flex items-center gap-2 py-1.5 pl-1 pr-2 rounded-md text-left text-base-content/52 hover:text-base-content/85 hover:bg-white/3 transition-colors"
							onclick={() => { tailExpanded = true; }}
							onmouseenter={() => onPreview({
								kind: 'cluster',
								parent: user,
								count: user.hiddenChildren ?? 0,
								label: user.hiddenChildrenLabel ?? 'Quieter listeners',
								description: user.hiddenChildrenDescription,
							})}
							onfocus={() => onPreview({
								kind: 'cluster',
								parent: user,
								count: user.hiddenChildren ?? 0,
								label: user.hiddenChildrenLabel ?? 'Quieter listeners',
								description: user.hiddenChildrenDescription,
							})}
						>
							<span class="shrink-0 w-4 h-4"></span>
							<span class="shrink-0 w-7 h-7 rounded-full border border-dashed border-white/14 flex items-center justify-center text-[10px] font-mono text-base-content/45">
								+{user.hiddenChildren}
							</span>
							<div class="min-w-0 flex-1">
								<p class="text-[12px] leading-snug truncate text-base-content/68">
									+{user.hiddenChildren} more
								</p>
								{#if user.hiddenChildrenLabel}
									<p class="text-[11px] leading-snug truncate text-base-content/45 italic">
										{user.hiddenChildrenLabel}
									</p>
								{/if}
							</div>
						</button>
					</div>
				{:else}
					{#each stubsFor(user.hiddenChildren) as stub (stub.id)}
						<div class="relative pl-5">
							<span class="absolute inset-y-0 left-0 edge-line edge-quiet" aria-hidden="true"></span>
							<Self
								user={stub}
								{selectedUserId}
								{onSelect}
								{onPreview}
								depth={depth + 1}
							/>
						</div>
					{/each}
				{/if}
			{/if}
		</div>
	{/if}
</div>
