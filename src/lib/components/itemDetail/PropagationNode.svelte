<script lang="ts">
	import { ChevronDown, ChevronRight } from 'lucide-svelte';
	import type { PropagationUser, PreviewTarget } from '$lib/mock/propagation';
	import { sortNodesByPropagation } from '$lib/mock/propagation';
	import Self from './PropagationNode.svelte';

	/*
		One row of the propagation tree. Renders this user plus, recursively,
		its children.

		Visual language scope (post-cleanup):
		  - Node types: passive / deep / amplifier / successful-amplifier
		    via `nk-*` classes on the avatar wrapper (kind halos + motion).
		  - Origin overlay: row-attached `.origin-glyph` + ORIGIN inline label.
		  - Current-user overlay: `.cu-row` rail + primary avatar border.

		Tree connectors are intentionally NEUTRAL — a single soft border on
		each children container, no per-edge semantics. Edge-types, branch /
		subtree variables, and special-structure styling were all removed in
		the visual-language cleanup pass; node types are the only layer.
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

	// Anonymous placeholder rows for the hidden tail when expanded. They are
	// real PropagationUser shapes so the inspector can pick them up; flagged
	// as passive so they read as background presence in the tree.
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
			Avatar wrapper composes base node kind silhouette with overlay states.

			  Layer 1 — BASE silhouette (from nodeKind):
			    passive    → small, dim, desaturated, no decoration
			    deep       → quiet listener, no glow, no ring
			    amplifier  → ring + outward ripple
			    success    → double ring + outward ripple + orbit comet

			  Layer 2 — Origin overlay (stackable, static):
			    .origin-glyph (sibling of avatar) + ORIGIN text label

			  Layer 3 — Current-user overlay (stackable, static):
			    primary border on inner avatar + cu-row left rail + bg
		-->
		<div
			class={[
				'shrink-0 mt-0.5 relative overflow-visible node-avatar',
				!user.isPreviewNode && nodeKindClass(user),
			]}
		>
			{#if user.nodeKind === 'successful-amplifier' && !user.isPreviewNode}
				<!-- Outward broadcast ripple for successful amplifiers,
				     composing with the orbit comet and double-ring halo. -->
				<span class="sa-ripple" aria-hidden="true"></span>
			{/if}
			<div
				class={[
					'w-7 h-7 rounded-full overflow-hidden border transition-transform duration-200',
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
				<!-- Origin marker — small horizontal accent beam ending in a
				     dot, hugging the avatar's left edge. Non-ring shape so it
				     doesn't compete with transmission rings. -->
				<span class="origin-glyph" aria-hidden="true"></span>
			{/if}
		</div>

		<!-- Name + character. Preview nodes italicize the character. -->
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

		<!-- Branch-size hint on the right edge. Neutral readout — no
		     branch-mass / hub visual weighting (those systems were
		     removed in the cleanup pass). -->
		{#if user.branchSize > 0}
			<span class="shrink-0 mt-1.5 text-[10px] font-mono tabular-nums text-base-content/45">
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
		Children — recursive — only when expanded. A single neutral border on
		the children container acts as the tree connector rail. No per-edge
		semantics; this keeps the tree's structural lines while letting node
		types do all the visual communication.
	-->
	{#if hasVisibleChildren && expanded}
		<div class="relative pl-5 ml-3.5 border-l border-white/8">
			{#each sortedChildren as child (child.id)}
				<Self
					user={child}
					{selectedUserId}
					{onSelect}
					{onPreview}
					depth={depth + 1}
				/>
			{/each}

			<!-- Hidden tail: "+N more" indicator (collapsed) or anonymized stubs (expanded) -->
			{#if user.hiddenChildren && user.hiddenChildren > 0}
				{#if !tailExpanded}
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
				{:else}
					{#each stubsFor(user.hiddenChildren) as stub (stub.id)}
						<Self
							user={stub}
							{selectedUserId}
							{onSelect}
							{onPreview}
							depth={depth + 1}
						/>
					{/each}
				{/if}
			{/if}
		</div>
	{/if}
</div>
