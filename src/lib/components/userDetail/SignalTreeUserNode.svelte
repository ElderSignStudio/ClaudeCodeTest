<script lang="ts">
	import type { SignalTreeUserDescendant } from '$lib/mock/userSignalTree';
	import Self from './SignalTreeUserNode.svelte';

	/*
		Recursive user descendant under a signal node.

		Quieter than the signal node above it: smaller avatar, tighter
		typography, no cover artwork. The eye should land on the
		signal title first; descendants read as supporting context.

		Connector geometry comes from `.tree-children` + per-child
		`tree-child` pseudo-element styling defined in the parent
		`UserSignalTree.svelte` so the connector treatment stays
		consistent across all node types.

		Each descendant links through to its user-detail page; the
		`/users/[id]` route falls back to a synthesised "scout in
		progress" profile when an id isn't authored yet, so links
		never dead-end.
	*/

	let {
		user,
	}: {
		user: SignalTreeUserDescendant;
	} = $props();
</script>

<div class="tree-child">
	<a
		href="/users/{user.id}"
		class="group flex items-start gap-2.5 rounded-md px-2 py-1.5 -mx-2 hover:bg-white/4 transition-colors"
		title="View {user.name}'s scout profile"
	>
		<span class="shrink-0 w-7 h-7 rounded-full border border-white/15 overflow-hidden bg-white/5">
			<img src={user.avatar} alt="" class="w-full h-full object-cover" />
		</span>
		<div class="min-w-0 flex-1 flex items-baseline gap-2 flex-wrap">
			<p class="text-[13px] font-medium text-base-content/85 group-hover:text-base-content/95 transition-colors leading-snug">
				{user.name}
			</p>
			{#if typeof user.score === 'number'}
				<span class="text-[11px] tabular-nums text-base-content/50">+{user.score}</span>
			{/if}
			{#if user.character}
				<p class="text-[11.5px] text-base-content/55 italic leading-snug truncate">{user.character}</p>
			{/if}
		</div>
	</a>

	{#if user.children && user.children.length > 0}
		<div class="tree-children">
			{#each user.children as child (child.id)}
				<Self user={child} />
			{/each}
		</div>
	{/if}
</div>
