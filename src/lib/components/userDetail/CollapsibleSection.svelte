<script lang="ts">
	import { slide } from 'svelte/transition';
	import { ChevronDown } from 'lucide-svelte';
	import type { Snippet } from 'svelte';

	/*
		CollapsibleSection — the disclosure pattern used by Scene
		Footprint, Growth Opportunities, and Emerging Signals.

		Renders as a clickable header (eyebrow + chevron) followed
		by either the slide-in body content or a one-line summary
		when collapsed. Matches the SectionEyebrow visual recipe so
		open/closed sections sit in the same vertical rhythm as the
		non-collapsible sections on the page.

		`open` is two-way bound — parents own the persistence model
		(e.g. resetting state across profile navigation), this
		component only owns the visual representation.
	*/

	let {
		label,
		color = 'accent',
		open = $bindable(false),
		summary,
		children,
	}: {
		label: string;
		color?: 'accent' | 'secondary';
		open?: boolean;
		summary: string;
		children?: Snippet;
	} = $props();
</script>

<button
	type="button"
	onclick={() => (open = !open)}
	aria-expanded={open}
	class="group w-full flex items-center gap-2 text-left"
>
	<span
		class={['w-0.5 h-3.5 rounded-full', color === 'accent' ? 'bg-accent/65' : 'bg-secondary/55']}
		aria-hidden="true"
	></span>
	<p class="text-[11px] font-semibold uppercase tracking-widest text-base-content/68">
		{label}
	</p>
	<span
		aria-hidden="true"
		class="ml-auto inline-flex items-center text-base-content/50 group-hover:text-base-content/85 transition-colors"
		style="transition: transform 200ms ease; transform: rotate({open ? 0 : -90}deg);"
	>
		<ChevronDown size={14} />
	</span>
</button>

{#if open}
	<div transition:slide={{ duration: 200 }}>
		{@render children?.()}
	</div>
{:else}
	<p class="mt-2 text-[12.5px] italic text-base-content/62">
		{summary}
	</p>
{/if}
