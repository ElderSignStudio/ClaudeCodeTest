<script lang="ts">
	import { RefreshCw } from 'lucide-svelte';

	/*
		Shared header for the 7 standard lanes. The lane's <section> wrapper owns
		all vertical spacing (pt-*, pb-*) so per-lane editorial cadence stays at
		the call site, not inside this component.

		`accentClass` is the colored section mark to the left of the title (e.g.
		"bg-primary", "bg-cyan-400/55"). `linkHoverClass` is the link's hover color
		— sometimes accent-matched, sometimes neutral, so it's an explicit prop.
		`variant` decides between a plain "See all →" link and the spinning Refresh
		affordance.
	*/

	let {
		title,
		subtitle,
		accentClass,
		href,
		variant = 'see-all',
		linkLabel,
		linkHoverClass = 'hover:text-base-content/90',
		subtitleMaxWidthClass = 'max-w-105',
	}: {
		title: string;
		subtitle: string;
		accentClass: string;
		href: string;
		variant?: 'see-all' | 'refresh';
		linkLabel?: string;
		linkHoverClass?: string;
		subtitleMaxWidthClass?: string;
	} = $props();

	const resolvedLabel = $derived(linkLabel ?? (variant === 'refresh' ? 'Refresh' : 'See all →'));
</script>

<div class="flex items-start justify-between w-full">
	<div class="flex items-start gap-3">
		<div class={['mt-0.5 w-0.5 h-5 rounded-full shrink-0', accentClass]} aria-hidden="true"></div>
		<div>
			<p class="text-sm font-bold uppercase tracking-widest leading-tight text-base-content/92">{title}</p>
			<p class={['mt-0.5 text-[13px] leading-normal text-base-content/72', subtitleMaxWidthClass]}>{subtitle}</p>
		</div>
	</div>

	{#if variant === 'refresh'}
		<a {href} class={['group flex items-center gap-1.5 text-[13px] text-base-content/75 transition-colors shrink-0', linkHoverClass]} style="margin-right: clamp(0px, 6vw - 48px, 120px);">
			{resolvedLabel}
			<RefreshCw size={11} class="opacity-90 transition-transform duration-500 group-hover:rotate-180 group-hover:opacity-100" />
		</a>
	{:else}
		<a {href} class={['text-[13px] text-base-content/75 transition-colors shrink-0', linkHoverClass]} style="margin-right: clamp(0px, 6vw - 48px, 120px);">
			{resolvedLabel}
		</a>
	{/if}
</div>
