<script lang="ts">
	import ForYouLane from '$lib/components/lanes/ForYouLane.svelte';
	import OneStepAwayLane from '$lib/components/lanes/OneStepAwayLane.svelte';
	import DeepUndergroundLane from '$lib/components/lanes/DeepUndergroundLane.svelte';
	import BreakingOutLane from '$lib/components/lanes/BreakingOutLane.svelte';
	import HumanSignalsLane from '$lib/components/lanes/HumanSignalsLane.svelte';
	import OutsideTheBubbleLane from '$lib/components/lanes/OutsideTheBubbleLane.svelte';
	import OriginStoriesLane from '$lib/components/lanes/OriginStoriesLane.svelte';
	import DriftSection from '$lib/components/DriftSection.svelte';

	function getGreeting(): string {
		const hour = new Date().getHours();
		if (hour < 12) return 'Good morning.';
		if (hour < 17) return 'Good afternoon.';
		return 'Good evening.';
	}

</script>

<div class="max-w-5xl mx-auto px-5 py-8 space-y-10">

	<!-- Greeting + filter chips -->
	<div class="space-y-5">
		<div class="space-y-2.5">
			<div class="h-px w-28 bg-linear-to-r from-primary to-transparent rounded-full" aria-hidden="true"></div>
			<div class="flex items-center gap-1.5">
				<svg class="w-2.5 h-2.5 text-primary/70 shrink-0" viewBox="0 0 10 10" fill="none" aria-hidden="true">
					<circle cx="5" cy="5" r="1.5" fill="currentColor" />
					<circle cx="5" cy="5" r="3.75" stroke="currentColor" stroke-width="0.75" opacity="0.7" />
				</svg>
				<span class="text-[11px] font-semibold uppercase tracking-widest text-primary/70">Your Signal</span>
			</div>
			<h1 class="text-3xl font-extrabold tracking-tight text-base-content">{getGreeting()}</h1>
			<p class="text-sm text-base-content/68 max-w-sm">
				Signals curated to your frequency. What's faint today may resonate tomorrow.
			</p>
		</div>
	</div>

	<ForYouLane />
	<OneStepAwayLane />
	<DeepUndergroundLane />
	<BreakingOutLane />
	<HumanSignalsLane />
	<OutsideTheBubbleLane />
	<OriginStoriesLane />
	<DriftSection />

</div>
