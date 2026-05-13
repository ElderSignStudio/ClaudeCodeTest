<script lang="ts">
	import { ChevronDown, ChevronRight } from 'lucide-svelte';
	import type { PropagationUser } from '$lib/mock/propagation';
	import Self from './PropagationNode.svelte';

	/*
		One row of the propagation tree. Renders this user plus, recursively,
		its children. Expansion state for the node and for its hidden tail is
		LOCAL — each node owns its own toggle. Selection is global to the page
		and flows in via props.

		v1 limitation: `hiddenChildren` is just an editorial count. Clicking
		"+N more" reveals N greyed placeholder rows (anonymous listeners) so
		the interaction lands; the inspector treats them as anonymized.
	*/

	let {
		user,
		selectedUserId,
		onSelect,
		depth = 0,
	}: {
		user: PropagationUser;
		selectedUserId: string | null;
		onSelect: (user: PropagationUser) => void;
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

		<!-- Avatar -->
		<div class={['shrink-0 mt-0.5 w-7 h-7 rounded-full overflow-hidden border', isSelected ? 'border-accent/60' : 'border-white/14']}>
			{#if user.avatar}
				<img src={user.avatar} alt="" class="w-full h-full object-cover" />
			{:else}
				<!-- Anonymous stub: solid neutral fill, no image -->
				<div class="w-full h-full bg-base-content/12"></div>
			{/if}
		</div>

		<!-- Name + character -->
		<div class="min-w-0 flex-1">
			<p class={['text-[13px] font-semibold leading-snug truncate', isSelected ? 'text-accent/95' : 'text-base-content/92']}>
				{user.name}
			</p>
			<p class="text-[11px] text-base-content/55 leading-snug truncate">
				{user.character}
			</p>
		</div>

		<!-- Branch-size hint on the right edge (only meaningful when > 0) -->
		{#if user.branchSize > 0}
			<span class="shrink-0 mt-1.5 text-[10px] font-mono text-base-content/40 tabular-nums">
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
					depth={depth + 1}
				/>
			{/each}

			<!-- Hidden tail: "+N more" indicator (collapsed) or anonymized stubs (expanded) -->
			{#if user.hiddenChildren && user.hiddenChildren > 0}
				{#if !tailExpanded}
					<button
						class="w-full flex items-center gap-2 py-1.5 pl-1 pr-2 rounded-md text-left text-base-content/52 hover:text-base-content/85 hover:bg-white/3 transition-colors"
						onclick={() => { tailExpanded = true; }}
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
							depth={depth + 1}
						/>
					{/each}
				{/if}
			{/if}
		</div>
	{/if}
</div>
