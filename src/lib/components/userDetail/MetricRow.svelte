<script lang="ts">
	/*
		MetricRow — the {value} + {descriptor} pair used 4 times
		inside the Scout Profile Output/Reach clusters. Centres the
		font-size, weight, alpha, and gap convention.
	*/

	let {
		value,
		label,
	}: {
		value: string | number;
		label: string;
	} = $props();
</script>

<div class="flex items-baseline gap-2">
	<p class="text-[22px] font-semibold tabular-nums text-base-content/92 leading-none">{value}</p>
	<p class="text-[11.5px] text-base-content/58">{label}</p>
</div>
