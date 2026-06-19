<script lang="ts">
	/*
		SectionEyebrow — the accent-dot + uppercase-label pattern used
		8 times across the User Detail page. `color` toggles the dot
		between the "primary editorial" accent and the "supporting"
		secondary tint that the page already uses to differentiate
		section roles (e.g. Trust Signals is secondary, Scout Profile
		is accent).
	*/

	let {
		label,
		color = 'accent',
	}: {
		label: string;
		color?: 'accent' | 'secondary';
	} = $props();
</script>

<div class="flex items-center gap-2">
	<span
		class={['w-0.5 h-3.5 rounded-full', color === 'accent' ? 'bg-accent/65' : 'bg-secondary/55']}
		aria-hidden="true"
	></span>
	<p class="text-[11px] font-semibold uppercase tracking-widest text-base-content/68">
		{label}
	</p>
</div>
