<script lang="ts">
	import { ExternalLink } from 'lucide-svelte';
	import type { SignalTreeSignalNode } from '$lib/mock/userSignalTree';
	import SignalTreeUserNode from './SignalTreeUserNode.svelte';

	/*
		A "signal sparked by this scout" node — the main visual anchor
		of each row in the User Signal Tree. Deliberately different
		from a normal user node: horizontal card with cover artwork,
		title + artist, and a compact metrics line. Distinct shape +
		surface so it never gets confused with the scout avatars
		above and below it.

		Links through to the Item Detail route (`/items/<itemId>`).
		Descendant scouts render BENEATH this card in a `.tree-children`
		container so the parent connector geometry continues.
	*/

	let {
		signal,
	}: {
		signal: SignalTreeSignalNode;
	} = $props();
</script>

<div class="tree-child">
	<a
		href="/items/{signal.itemId}"
		class="signal-card group flex items-start gap-3 rounded-lg border border-white/8 bg-white/3 hover:bg-white/6 hover:border-white/14 transition-colors px-3 py-2.5"
	>
		<!-- Cover art — 44 px square. Same visual register as the
		     covers in the Signature / Emerging sections so the section
		     feels like one product. -->
		<span class="shrink-0 w-11 h-11 rounded-md border border-white/10 overflow-hidden bg-white/5">
			{#if signal.coverArt}
				<img src={signal.coverArt} alt="" class="w-full h-full object-cover" />
			{/if}
		</span>

		<div class="min-w-0 flex-1">
			<div class="flex items-baseline gap-2 flex-wrap">
				<span class="text-[14px] font-semibold text-accent/92 group-hover:text-accent transition-colors leading-snug">
					{signal.title}
				</span>
				<span class="text-base-content/30">—</span>
				<span class="text-[12.5px] text-base-content/65 leading-snug">{signal.artist}</span>
				<ExternalLink size={10} class="opacity-40 group-hover:opacity-75 transition-opacity -translate-y-px" />
			</div>
			<div class="mt-0.5 flex items-baseline gap-2 text-[11.5px] text-base-content/55 tabular-nums">
				<span>{signal.listeners} listeners</span>
				<span class="text-base-content/28">·</span>
				<span>{signal.generations} {signal.generations === 1 ? 'generation' : 'generations'}</span>
				<span class="text-base-content/28">·</span>
				<span>Impact {signal.impact}</span>
			</div>
		</div>

		<!-- Impact chip — right side, warm-amber tone matching the
		     Signature Signals palette to communicate "contribution".
		     Compact 18-px-ish pill so the row stays one line tall. -->
		<span class="shrink-0 text-[10px] uppercase tracking-widest font-semibold px-1.5 py-0.5 rounded-full border border-[oklch(0.86_0.12_60)]/30 text-[oklch(0.86_0.12_60)]/82 bg-[oklch(0.86_0.12_60)]/8 self-start">
			{signal.impact}
		</span>
	</a>

	{#if signal.children.length > 0}
		<div class="tree-children">
			{#each signal.children as child (child.id)}
				<SignalTreeUserNode user={child} />
			{/each}
		</div>
	{/if}
</div>
