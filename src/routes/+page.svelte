<script lang="ts">
	import FromYourScoutsLane from '$lib/components/lanes/FromYourScoutsLane.svelte';
	import TrustedScoutsLane from '$lib/components/lanes/TrustedScoutsLane.svelte';
	import ForYouLane from '$lib/components/lanes/ForYouLane.svelte';
	import OneStepAwayLane from '$lib/components/lanes/OneStepAwayLane.svelte';
	import DeepUndergroundLane from '$lib/components/lanes/DeepUndergroundLane.svelte';
	import BreakingOutLane from '$lib/components/lanes/BreakingOutLane.svelte';
	import HumanSignalsLane from '$lib/components/lanes/HumanSignalsLane.svelte';
	import OutsideTheBubbleLane from '$lib/components/lanes/OutsideTheBubbleLane.svelte';
	import OriginStoriesLane from '$lib/components/lanes/OriginStoriesLane.svelte';

	function getGreeting(): string {
		const hour = new Date().getHours();
		if (hour < 12) return 'Good morning.';
		if (hour < 17) return 'Good afternoon.';
		return 'Good evening.';
	}
</script>

<!--
	Atmosphere as intentional emotional rhythm, not environmental fog.

	Three lanes have atmospheric accents in a clear hierarchy. Everything
	else acts as visual silence between them.

	  Best Picks       — faint cool-blue home orbit       (peak 0.09, env -70px)
	  Breaking Out     — kinetic teal/green momentum      (peak 0.14, env -90px)
	  Origin Stories   — cinematic violet memory field    (peak 0.20, env -120px)

	Hierarchy reinforced through TWO axes:
	  • peak opacity        BP < BO < OS  (≈0.09 / 0.14 / 0.20)
	  • spatial extent      BP < BO < OS  (-70 / -90 / -120 wrapper)

	Five lanes (OSA, DU, HS, OTB) sit on clean dark space — their depth comes
	from card-level shadows, borders, surface contrast, hover elevation, and
	hero emphasis defined in app.css and the lane components.

	Long soft falloff curves (residual stop ~80% before transparent at 100%)
	mean each accent fades into surrounding dark space without a visible
	horizontal clipping edge.
-->

<div class="max-w-400 mx-auto w-full px-6 xl:px-8 py-8 space-y-18">

	<!-- Greeting -->
	<div class="space-y-5">
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

	<!--
		Two scout-foundational lanes sit ABOVE Best Picks: every card resolves
		through ONE specific scout, so they anchor the homepage in the
		single-origin discovery model before the broader synthesis lanes begin.
		Both sit on clean dark space (no atmospheric envelope) — the
		differentiation comes from card-level treatment.
	-->
	<FromYourScoutsLane />
	<TrustedScoutsLane />

	<!--
		Best Picks — faint cool-blue home orbit.
		Smallest envelope (-70px) and lowest peak (0.09) of the three accents.
		Single soft layer, ellipse 82% 75% gives a slightly tighter shape than
		BO/OS — reinforces the "personal, close-to-you" orbital feeling rather
		than broad atmospheric spread.
	-->
	<div class="relative">
		<div class="absolute pointer-events-none" aria-hidden="true" style="top:-70px;bottom:-70px;left:0;right:0;background:radial-gradient(ellipse 82% 75% at 50% 50%,rgba(48,92,178,0.09) 0%,rgba(48,92,178,0.05) 25%,rgba(48,92,178,0.018) 55%,rgba(48,92,178,0.006) 80%,transparent 100%);"></div>
		<ForYouLane />
	</div>

	<OneStepAwayLane />
	<DeepUndergroundLane />

	<!--
		Breaking Out — kinetic teal/green momentum.
		Medium envelope (-90px) and peak 0.14 — strengthened from the previous
		0.11 to make the energy more clearly visible above and below the cards.
		Wider ellipse (88% × 80%) supports the "spreading / propagating outward"
		feeling without becoming a fog shelf.
	-->
	<div class="relative">
		<div class="absolute pointer-events-none" aria-hidden="true" style="top:-90px;bottom:-90px;left:0;right:0;background:radial-gradient(ellipse 88% 80% at 50% 50%,rgba(40,125,105,0.14) 0%,rgba(40,125,105,0.08) 25%,rgba(40,125,105,0.028) 55%,rgba(40,125,105,0.010) 80%,transparent 100%);"></div>
		<BreakingOutLane />
	</div>

	<HumanSignalsLane />
	<OutsideTheBubbleLane />

	<!--
		Origin Stories — cinematic violet memory field. Strongest accent.
		Two layers preserved exactly: outer wash establishes broad envelope,
		inner glow concentrates intensity behind the propagation diagrams.
		Largest envelope (-120px) lets the field fade smoothly into the dark
		space above (OTB) and below the lane without a visible horizontal clip.
	-->
	<div class="relative">
		<div class="absolute pointer-events-none" aria-hidden="true" style="top:-120px;bottom:-120px;left:0;right:0;background:radial-gradient(ellipse 92% 85% at 50% 50%,rgba(115,75,200,0.20) 0%,rgba(115,75,200,0.11) 22%,rgba(115,75,200,0.04) 50%,rgba(115,75,200,0.014) 78%,transparent 100%);"></div>
		<div class="absolute pointer-events-none" aria-hidden="true" style="top:-100px;bottom:-100px;left:0;right:0;background:radial-gradient(ellipse 70% 60% at 50% 50%,rgba(130,90,215,0.18) 0%,rgba(130,90,215,0.08) 30%,rgba(130,90,215,0.025) 60%,transparent 90%);"></div>
		<OriginStoriesLane />
	</div>

</div>
