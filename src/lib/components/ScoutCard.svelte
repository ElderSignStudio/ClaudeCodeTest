<script lang="ts">
	import { UserPlus, UserCheck } from 'lucide-svelte';
	import type { Scout } from '$lib/mock/data';

	let { scout }: { scout: Scout } = $props();
</script>

<!--
	Scout Card — person-focused card for the Human Signals lane.
	Deliberately different from Signal Cards:
	  - No large artwork image; avatar is the visual anchor
	  - Flat surface (bg-base-200/55) — calmer than os-surface or os-hero-card
	  - Minimal hover: border brightens + tiny lift, no strong glow
	  - Following state: primary-tinted border ring + "Following" pill
	  - Activity dot on avatar: communicates recent action without text
	  - Resonance color: success=High, accent=Medium, neutral=Low
-->
<div
	class={[
		'group shrink-0 w-56 rounded-xl border cursor-pointer',
		'transition-all duration-250 hover:-translate-y-px',
		scout.following
			? 'bg-base-200/62 border-primary/18 hover:border-primary/30'
			: 'bg-base-200/45 border-white/8 hover:border-white/16 hover:bg-base-200/60',
	]}
>
	<div class="p-3.5">

		<!-- ── Avatar + name + taste profile ── -->
		<div class="flex items-start gap-3 mb-3">
			<div class="relative shrink-0">
				<div
					class={[
						'w-11 h-11 rounded-full overflow-hidden border',
						scout.following ? 'border-primary/40' : 'border-white/15',
					]}
				>
					<img src={scout.avatar} alt={scout.name} class="w-full h-full object-cover" />
				</div>
				<!--
					Activity dot: accent-colored pip on the avatar corner.
					Only shown when activityLabel is set — communicates "this scout is active".
				-->
				{#if scout.activityLabel}
					<span
						class="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-accent border-2 border-base-200"
						aria-hidden="true"
					></span>
				{/if}
			</div>

			<div class="flex-1 min-w-0 pt-0.5">
				<div class="flex items-center">
					<p class="text-[14px] font-bold text-base-content/95 leading-snug truncate">{scout.name}</p>
				</div>
				<p class="text-[11px] text-base-content/55 mt-0.5 leading-snug">{scout.tasteProfile}</p>
			</div>
		</div>

		<!--
			Activity label container always renders at h-5 (20px) to equalise card heights.
			Cards without an activityLabel have an empty but identically-sized gap here.
		-->
		<div class="mb-3 h-5 flex items-center">
			{#if scout.activityLabel}
				<span
					class="inline-block text-[10px] font-medium rounded-full px-2 py-0.5 leading-none"
					style="color: oklch(0.72 0.16 220 / 0.82); border: 1px solid oklch(0.72 0.16 220 / 0.25); background: oklch(0.72 0.16 220 / 0.08);"
				>
					{scout.activityLabel}
				</span>
			{/if}
		</div>

		<!-- ── Stats row ── -->
		<!--
			Three stats separated by thin vertical dividers.
			earlySignals: total early picks
			hitRate: % that later gained traction
			resonance: High / Medium / Low — colored to signal quality
		-->
		<div class="flex items-center gap-3 mb-3.5">
			<div>
				<p class="text-[14px] font-extrabold text-base-content/82 leading-none">{scout.earlySignals}</p>
				<p class="text-[9px] text-base-content/45 mt-0.5 leading-none">early sparks</p>
			</div>
			<div class="w-px h-7 bg-white/8 shrink-0"></div>
			<div>
				<p class="text-[14px] font-extrabold text-base-content/82 leading-none">{scout.hitRate}%</p>
				<p class="text-[9px] text-base-content/45 mt-0.5 leading-none">hit rate</p>
			</div>
			<div class="w-px h-7 bg-white/8 shrink-0"></div>
			<div>
				<p
					class={[
						'text-[14px] font-extrabold leading-none',
						scout.resonance === 'High'
							? 'text-success/82'
							: scout.resonance === 'Medium'
								? 'text-accent/78'
								: 'text-base-content/65',
					]}
				>
					{scout.resonance}
				</p>
				<p class="text-[9px] text-base-content/45 mt-0.5 leading-none">resonance</p>
			</div>
		</div>

		<!-- ── Follow button ── -->
		<!--
			Full-width, rounded-full — matches existing system button style.
			Following: primary-tinted fill (bg-primary/18).
			Not following: ghost border.
		-->
		<button
			class={[
				'w-full flex items-center justify-center gap-1.5 h-7 rounded-full text-[11px] font-semibold transition-all duration-150',
				scout.following
					? 'bg-primary/18 text-primary border border-primary/38 hover:bg-primary/25'
					: 'text-base-content/62 border border-white/15 hover:text-base-content/85 hover:border-white/28 hover:bg-white/5',
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
	<!--
		Label sits above the grid so images can fill the full row width.
		grid-cols-5: each of 5 cells fills (card-width - 2×padding - 4×gap) / 5.
		At w-56 (224px) with px-3.5 (14px each side) and gap-1 (4px):
		(224 - 28 - 16) / 5 = 36px per cell — comfortably square.
	-->
	{#if scout.recentSignals.length > 0}
		<div class="border-t border-white/5 px-3.5 pt-2 pb-3">
			<p class="text-[9px] font-semibold uppercase tracking-wider text-base-content/30 mb-1.5">Recent signals</p>
			<div class="grid grid-cols-5 gap-1">
				{#each scout.recentSignals.slice(0, 5) as src, i (i)}
					<div class="aspect-square rounded-sm overflow-hidden border border-white/8">
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
