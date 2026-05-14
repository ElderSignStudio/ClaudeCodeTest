<script lang="ts">
	import { UserPlus, UserCheck } from 'lucide-svelte';
	import type { Scout } from '$lib/mock/data';

	let { scout, index = 0 }: { scout: Scout; index?: number } = $props();

	// Per-scout activity-dot flicker timing.
	// Different durations + non-zero negative delays ensure scouts don't sync.
	// `null` = no animation class applied (scout's dot stays completely static).
	// Index cycles via index % 4 so the pattern repeats predictably if more
	// scouts are ever added.
	const dotTimings: Array<{ duration: string; delay: string } | null> = [
		{ duration: '13s', delay: '-1s' },     // moderately active
		{ duration: '11s', delay: '-6.5s' },   // recently flickered, won't again for a while
		null,                                   // completely static — at least one stays silent
		{ duration: '19s', delay: '-3s' },     // less frequent activity
	];
	const flicker = $derived(dotTimings[index % dotTimings.length]);
</script>

<div
	class={[
		'group rounded-xl border cursor-pointer w-full h-full flex flex-col',
		'transition-all duration-250 hover:-translate-y-px',
		scout.following
			? 'bg-base-200/65 border-primary/22 hover:border-primary/35'
			: 'bg-base-200/52 border-white/12 hover:border-white/22 hover:bg-base-200/62',
	]}
	style="box-shadow: 0 0 0 1px rgba(255,255,255,0.06), 0 5px 14px rgba(0,0,0,0.20), inset 0 1px 0 rgba(255,255,255,0.025), inset 0 -1px 0 rgba(0,0,0,0.26);"
>
	<div class="p-3.5 flex flex-col flex-1">

		<!-- ── Avatar + name ── -->
		<div class="flex items-center gap-3 mb-2.5">
			<div class="relative shrink-0">
				<div
					class={[
						'w-11 h-11 rounded-full overflow-hidden border',
						scout.following ? 'border-primary/40' : 'border-white/15',
					]}
				>
					<img src={scout.avatar} alt={scout.name} class="w-full h-full object-cover" />
				</div>
				{#if scout.activityLabel}
					<span
						class={[
							'absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-accent border-2 border-base-200',
							flicker && 'scout-signal-flicker',
						]}
						style={flicker ? `--flicker-duration:${flicker.duration};--flicker-delay:${flicker.delay};` : undefined}
						aria-hidden="true"
					></span>
				{/if}
			</div>
			<p class="flex-1 min-w-0 text-[14px] font-bold text-base-content/95 leading-snug truncate">{scout.name}</p>
		</div>

		<!--
			Activity pill — scout-archetype tag. Sits directly under the name so
			the scout's identity reads first (who this person is), before the
			descriptive paragraph (what they listen to).
		-->
		<div class="mb-3 min-h-5 flex items-center">
			{#if scout.activityLabel}
				<span
					class="inline-block text-[12px] font-medium rounded-full px-2 py-0.5 leading-none text-accent/82 border border-accent/28 bg-accent/7 truncate max-w-full"
				>
					{scout.activityLabel}
				</span>
			{/if}
		</div>

		<!--
			Fixed-height text block: reserves space for up to 2 lines of taste + 2 lines of
			context regardless of actual wrapping. Keeps the stats row + follow button on
			a consistent baseline across all cards.
			72px ≈ (text-xs × 2 lines) + gap + (text-[11px] × 2 lines) at leading-snug.
		-->
		<div class="min-h-18 mb-3 flex flex-col justify-start">
			<p class="text-[13px] text-base-content/68 leading-normal line-clamp-2">{scout.tasteProfile}</p>
			{#if scout.contextLine}
				<p class="text-[12px] text-base-content/55 mt-1.5 leading-normal line-clamp-2">{scout.contextLine}</p>
			{/if}
		</div>

		<!--
			Spacer: absorbs any residual height variation so stats + button stay
			pinned to the same vertical position in every card.
		-->
		<div class="flex-1"></div>

		<!-- ── Stats row ── -->
		<div class="flex items-center justify-between mb-3.5">
			<div>
				<p class="text-[14px] font-extrabold text-base-content/88 leading-none">{scout.sparks}</p>
				<p class="text-[10px] text-base-content/55 mt-0.5 leading-none">sparks</p>
			</div>
			<div class="w-px h-7 bg-white/8 shrink-0"></div>
			<div>
				<p class="text-[14px] font-extrabold text-base-content/88 leading-none">{scout.reach}</p>
				<p class="text-[10px] text-base-content/55 mt-0.5 leading-none">reach</p>
			</div>
			<div class="w-px h-7 bg-white/8 shrink-0"></div>
			<div>
				<p class="text-[14px] font-extrabold text-base-content/88 leading-none">{scout.hitRate}%</p>
				<p class="text-[10px] text-base-content/55 mt-0.5 leading-none">hit rate</p>
			</div>
		</div>

		<!-- ── Follow button ── -->
		<button
			class={[
				'w-full flex items-center justify-center gap-1.5 h-7 rounded-full text-[11px] font-semibold transition-all duration-150',
				scout.following
					? 'bg-primary/18 text-primary border border-primary/46 hover:bg-primary/30'
					: 'text-base-content/80 border border-white/28 hover:text-base-content/94 hover:border-white/40 hover:bg-white/7',
			]}
		>
			{#if scout.following}
				<UserCheck size={11} />
				Following
			{:else}
				<UserPlus size={11} />
				Follow
			{/if}
		</button>

	</div>

	<!-- ── Recent signal thumbnails ── -->
	{#if scout.recentSignals.length > 0}
		<div class="border-t border-white/7 px-3.5 pt-2 pb-3">
			<p class="text-[10px] font-semibold uppercase tracking-wider text-base-content/50 mb-1.5">Recent signals</p>
			<div class="grid grid-cols-3 gap-1.5">
				{#each scout.recentSignals.slice(0, 3) as src, i (i)}
					<div class="aspect-square rounded overflow-hidden border border-white/8">
						<img
							src={src}
							alt=""
							class="w-full h-full object-cover opacity-55 group-hover:opacity-72 transition-opacity duration-300"
						/>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
