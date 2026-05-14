<script lang="ts">
	import { ChevronDown, ChevronRight } from 'lucide-svelte';
	import type { PropagationUser, PreviewTarget } from '$lib/mock/propagation';
	import Self from './PropagationNode.svelte';

	/*
		One row of the propagation tree. Renders this user plus, recursively,
		its children. Expansion state is LOCAL per node. Selection is global
		to the page (flowed in via props) and is set on click. Inspector
		PREVIEW is also global to the page; previews fire on hover so the
		inspector can dynamically describe whatever the user is currently
		investigating without committing a selection.

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

	// Generate anonymous placeholder rows for the hidden tail when expanded.
	// They are real PropagationUser shapes (so the inspector can pick them up
	// and show a generic anonymized state) but carry no children or further
	// editorial detail.
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
	<div
		class={[
			'group/row w-full flex items-start gap-2 py-1.5 pl-1 pr-2 rounded-md text-left transition-colors duration-150 cursor-pointer',
			isSelected
				? 'bg-accent/12 ring-1 ring-accent/35'
				: 'hover:bg-white/4',
		]}
		onclick={() => onSelect(user)}
		onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(user); } }}
		onmouseenter={() => onPreview({ kind: 'user', user })}
		onfocusin={() => onPreview({ kind: 'user', user })}
		role="button"
		tabindex="0"
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
			Avatar.
			  - `isOrigin`     → accent-tinted border + small spark dot at the
			    top-right corner. Reads as "this user brought the signal into
			    the network from outside."
			  - `highImpact`   → faint accent ring around the avatar — signals
			    "this scout helped the signal travel" without prestige cues.
			  - `isSelected`   → committed selection wins on the border colour.
		-->
		<div class="shrink-0 mt-0.5 relative">
			<div
				class={[
					'w-7 h-7 rounded-full overflow-hidden border',
					isSelected
						? 'border-accent/60'
						: user.isOrigin
							? 'border-accent/45'
							: 'border-white/14',
					!isSelected && user.highImpact && 'ring-1 ring-accent/22',
				]}
			>
				{#if user.avatar}
					<img src={user.avatar} alt="" class="w-full h-full object-cover" />
				{:else}
					<!-- Anonymous stub: solid neutral fill, no image -->
					<div class="w-full h-full bg-base-content/12"></div>
				{/if}
			</div>
			{#if user.isOrigin}
				<span
					class="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-accent/85 border border-base-200"
					aria-hidden="true"
					title="Origin scout"
				></span>
			{/if}
		</div>

		<!-- Name + character + optional "origin" micro-label. -->
		<div class="min-w-0 flex-1">
			<div class="flex items-baseline gap-2">
				<p class={['text-[13px] font-semibold leading-snug truncate', isSelected ? 'text-accent/95' : 'text-base-content/92']}>
					{user.name}
				</p>
				{#if user.isOrigin}
					<span class="text-[10px] uppercase tracking-widest text-accent/82 shrink-0">origin</span>
				{/if}
			</div>
			<p class="text-[11px] text-base-content/55 leading-snug truncate">
				{user.character}
			</p>
		</div>

		<!--
			Branch-size hint on the right edge. High-impact scouts get a
			brighter accent treatment so the number reads as "this scout
			helped the signal travel" without becoming a badge.
		-->
		{#if user.branchSize > 0}
			<span class={['shrink-0 mt-1.5 text-[10px] font-mono tabular-nums', user.highImpact ? 'text-accent/72' : 'text-base-content/40']}>
				+{user.branchSize}
			</span>
		{/if}
	</div>

	<!-- Children — recursive — only when expanded -->
	{#if hasVisibleChildren && expanded}
		<!--
			Left rail: a soft vertical line that runs through the child column
			so the eye reads them as a branch off this row. Indented by 14px
			to align under this node's avatar center.
		-->
		<div class="relative pl-5 ml-3.5 border-l border-white/8">
			{#each user.children as child (child.id)}
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
