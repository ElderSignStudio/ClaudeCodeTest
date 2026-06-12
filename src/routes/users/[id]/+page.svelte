<script lang="ts">
	import { UserCheck, UserPlus, ExternalLink } from 'lucide-svelte';
	import type { LiveStatus } from '$lib/mock/users';
	import { getUserSignalTree } from '$lib/mock/userSignalTree';
	import UserSignalTree from '$lib/components/userDetail/UserSignalTree.svelte';

	/*
		User Detail page.

		Two variants share one layout:
		  - "Own" page (`/users/dan`): swaps the Follow button for a
		    "Your scout profile" chip and uses second-person copy in
		    the Scene Footprint interpretation + Following / Followers
		    section labels.
		  - "Other" page (`/users/<id>`): shows a Follow / Unfollow
		    toggle driven by local `$state`; no backend persistence.

		The page deliberately leads with the scout SUMMARY (header +
		profile + scene + signature signals) before any tree —
		"how good is this scout?" should be answered before "where
		did this scout's signals go?". The Signal Tree at the bottom
		is a placeholder card; the mixed user→signal→user tree lands
		in the next prompt.

		Section components are kept inline rather than extracted —
		each is small enough to read in place and the inline
		structure makes the section ordering easy to scan + reorder
		during V1 polish.
	*/

	let { data } = $props();
	const user = $derived(data.user);
	const signalTree = $derived(getUserSignalTree(user.id));

	/* Follow toggle — local $state only; the spec is explicit that
	   this should NOT persist anywhere yet. Re-seeded any time the
	   route changes so navigating between profiles doesn't carry
	   the toggle state across users. */
	let followStateById = $state<Record<string, boolean>>({});
	const isFollowing = $derived(
		followStateById[user.id] ?? user.isFollowing,
	);
	function toggleFollow() {
		followStateById = { ...followStateById, [user.id]: !isFollowing };
	}

	function formatPercent(n: number): string {
		return `${Math.round(n)}%`;
	}

	/* Quiet text colour by emerging-signal status. Mirrors the
	   subdued palette used elsewhere — no warning reds, no
	   gamified greens. */
	function statusColorClass(status: string): string {
		switch (status) {
			case 'Watching':
			case 'Early movement':
			case 'Starting to move':
				return 'text-[oklch(0.74_0.10_230)]/85';
			case 'Dormant seed':
				return 'text-base-content/52';
			case 'Fragile signal':
				return 'text-[oklch(0.72_0.07_230)]/72';
			default:
				return 'text-base-content/62';
		}
	}

	/* Tonal palette for the small live-status chip beside each
	   signature-signal title:
	     Accelerating / Branch forming → warmer/brighter accent
	     Still moving                  → cyan default
	     Quiet                         → muted
	     Dormant                       → very muted */
	function liveStatusChipClass(status: LiveStatus): string {
		switch (status) {
			case 'Accelerating':
				return 'border-[oklch(0.86_0.12_60)]/40 text-[oklch(0.86_0.12_60)]/88 bg-[oklch(0.86_0.12_60)]/10';
			case 'Branch forming':
				return 'border-accent/48 text-accent/92 bg-accent/10';
			case 'Still moving':
				return 'border-accent/30 text-accent/78 bg-accent/6';
			case 'Quiet':
				return 'border-white/14 text-base-content/55 bg-white/3';
			case 'Dormant':
				return 'border-white/8 text-base-content/40 bg-transparent';
		}
	}
</script>

<svelte:head>
	<title>{user.username} · Outer Signal</title>
</svelte:head>

<div class="max-w-280 mx-auto w-full px-6 xl:px-8 py-8 space-y-8">

	<!-- ═══════════════════════════════════════════════════════════
	     1. USER HEADER
	     Avatar + name + bio + Follow control (or "Your scout
	     profile" chip for the current user). More spacious than a
	     row but lighter than the Item Detail hero — no cover art.
	     ═══════════════════════════════════════════════════════════ -->
	<header
		class="rounded-xl border border-white/6 bg-base-200/35 p-6 lg:p-8"
		style="box-shadow: 0 0 0 1px rgba(255,255,255,0.04), 0 4px 18px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.025);"
	>
		<div class="flex items-start gap-5 md:gap-7">
			<div class="shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-full border border-primary/30 overflow-hidden">
				<img src={user.avatar} alt="" class="w-full h-full object-cover" />
			</div>
			<div class="min-w-0 flex-1 flex flex-col gap-2">
				<div class="flex items-center gap-3 flex-wrap">
					<h1 class="text-[24px] md:text-[28px] font-bold text-base-content/95 leading-tight">
						{user.username}
					</h1>
					{#if user.isCurrentUser}
						<!-- Current-user chip — quiet, atmospheric. No edit flow
						     yet (none exists elsewhere in the app). -->
						<span class="text-[10px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded-full border border-primary/40 text-primary/85 bg-primary/8">
							Your scout profile
						</span>
					{/if}
				</div>
				<p class="text-[13.5px] md:text-[14px] leading-relaxed text-base-content/75 max-w-2xl italic">
					“{user.bio}”
				</p>
				<div class="flex items-center gap-2 mt-1">
					<span class="text-[11px] uppercase tracking-widest text-base-content/45">Scout archetype</span>
					<span class="text-[11px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded-full border border-accent/40 text-accent/88 bg-accent/8">
						{user.scoutArchetype}
					</span>
				</div>
			</div>
			{#if !user.isCurrentUser}
				<button
					type="button"
					onclick={toggleFollow}
					aria-pressed={isFollowing}
					title={isFollowing ? 'Unfollow this scout' : 'Follow this scout'}
					class={[
						'shrink-0 flex items-center gap-1.5 h-9 px-4 rounded-full text-[13px] font-semibold transition-all',
						isFollowing
							? 'text-accent-content bg-accent/30 border border-accent/65 hover:bg-accent/40 hover:border-accent/82'
							: 'text-accent border border-accent/46 bg-black/30 hover:bg-accent/16 hover:border-accent/65',
					]}
				>
					{#if isFollowing}
						<UserCheck size={14} />
						Following
					{:else}
						<UserPlus size={14} />
						Follow
					{/if}
				</button>
			{/if}
		</div>
	</header>

	<!-- ═══════════════════════════════════════════════════════════
	     2. SCOUT PROFILE
	     The "how good is this scout?" answer. Three clusters with
	     editorial eyebrows (Quality / Output / Reach) replace the
	     flat 4-column grid — related metrics group together and
	     subtle dividers carry the eye between them without
	     introducing dashboard chrome. Discovery Score stays as the
	     headline anchor inside Quality. Strongest Signal sits on a
	     dedicated bottom row, slightly elevated.
	     ═══════════════════════════════════════════════════════════ -->
	<section
		class="rounded-xl border border-white/6 bg-base-200/35 p-5 lg:p-6 space-y-5"
		style="box-shadow: 0 0 0 1px rgba(255,255,255,0.04), 0 4px 18px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.025);"
	>
		<div class="flex items-center gap-2">
			<span class="w-0.5 h-3.5 rounded-full bg-accent/65" aria-hidden="true"></span>
			<p class="text-[11px] font-semibold uppercase tracking-widest text-base-content/68">
				Scout profile
			</p>
		</div>

		<!-- Cluster grid. `md:divide-x` paints a 1 px subtle vertical
		     line between clusters at md+; at sm the clusters stack
		     into rows and the dividers disappear naturally. -->
		<div class="grid gap-6 md:gap-0 md:grid-cols-3 md:divide-x md:divide-white/6">
			<!-- ── QUALITY: Discovery Score (headline) + Hit Rate ── -->
			<div class="md:pr-6 flex flex-col gap-4">
				<p class="text-[10px] uppercase tracking-widest text-base-content/45">Quality</p>
				<div class="flex items-baseline gap-3 -mt-1">
					<p class="text-[44px] md:text-[52px] leading-none font-semibold tabular-nums text-[oklch(0.86_0.12_60)]/94">
						{user.discoveryScore}
					</p>
					<div class="flex flex-col leading-tight">
						<span class="text-[11px] uppercase tracking-widest text-base-content/55">Discovery score</span>
						<span class="text-[11px] text-base-content/45 italic">editorial 0–100</span>
					</div>
				</div>
				<div class="flex items-baseline gap-2">
					<p class="text-[18px] font-semibold tabular-nums text-base-content/92">{formatPercent(user.hitRate)}</p>
					<p class="text-[11.5px] text-base-content/58">hit rate · seeds that propagated</p>
				</div>
			</div>

			<!-- ── OUTPUT: Origin Seeds + Re-share Branches ── -->
			<div class="md:px-6 flex flex-col gap-3">
				<p class="text-[10px] uppercase tracking-widest text-base-content/45">Output</p>
				<div class="flex items-baseline gap-2">
					<p class="text-[22px] font-semibold tabular-nums text-base-content/92 leading-none">{user.originSeeds}</p>
					<p class="text-[11.5px] text-base-content/58">origin seeds · signals sparked</p>
				</div>
				<div class="flex items-baseline gap-2">
					<p class="text-[22px] font-semibold tabular-nums text-base-content/92 leading-none">{user.reshareBranches}</p>
					<p class="text-[11.5px] text-base-content/58">re-share branches · forward shares</p>
				</div>
			</div>

			<!-- ── REACH: Unique Listeners + Avg / Seed ── -->
			<div class="md:pl-6 flex flex-col gap-3">
				<p class="text-[10px] uppercase tracking-widest text-base-content/45">Reach</p>
				<div class="flex items-baseline gap-2">
					<p class="text-[22px] font-semibold tabular-nums text-base-content/92 leading-none">{user.uniqueListenersReached}</p>
					<p class="text-[11.5px] text-base-content/58">unique listeners · reached downstream</p>
				</div>
				<div class="flex items-baseline gap-2">
					<p class="text-[22px] font-semibold tabular-nums text-base-content/92 leading-none">{user.averageReachPerSeed}</p>
					<p class="text-[11.5px] text-base-content/58">avg reach · listeners per seed</p>
				</div>
			</div>
		</div>

		<!-- ── Strongest Signal: dedicated highlighted bottom row ──
		     The compact cover (36 px square) anchors the link to a
		     real album, reinforcing "this is music" without
		     escalating the row into a hero card. -->
		{#if user.strongestSignal}
			<div class="pt-4 border-t border-white/6">
				<p class="text-[10px] uppercase tracking-widest text-base-content/45 mb-2">Strongest signal</p>
				<a
					href="/items/{user.strongestSignal.id}"
					class="group inline-flex items-center gap-2.5"
				>
					<span class="shrink-0 w-9 h-9 rounded-md border border-white/10 overflow-hidden bg-white/5">
						{#if user.strongestSignal.coverArt}
							<img src={user.strongestSignal.coverArt} alt="" class="w-full h-full object-cover" />
						{/if}
					</span>
					<span class="flex items-baseline gap-2 text-[14.5px] font-semibold leading-snug text-accent/92 group-hover:text-accent transition-colors">
						<span>{user.strongestSignal.title}</span>
						<span class="text-base-content/35 font-normal">—</span>
						<span class="text-base-content/68 font-normal">{user.strongestSignal.artist}</span>
						<ExternalLink size={11} class="opacity-50 group-hover:opacity-90 transition-opacity -translate-y-px" />
					</span>
				</a>
			</div>
		{/if}
	</section>

	<!-- ═══════════════════════════════════════════════════════════
	     3. SCENE FOOTPRINT
	     Hand-rolled horizontal bars — no chart library. Each row is
	     a label, a percentage, and a thin cyan fill against a muted
	     rail. Interpretation sentence above the rows answers
	     "what kind of scenes does this scout operate in?" before
	     the user has to read the numbers.
	     ═══════════════════════════════════════════════════════════ -->
	<section
		class="rounded-xl border border-white/6 bg-base-200/35 p-5 lg:p-6 space-y-4"
		style="box-shadow: 0 0 0 1px rgba(255,255,255,0.04), 0 4px 18px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.025);"
	>
		<div class="flex items-center gap-2">
			<span class="w-0.5 h-3.5 rounded-full bg-accent/65" aria-hidden="true"></span>
			<p class="text-[11px] font-semibold uppercase tracking-widest text-base-content/68">
				Scene footprint
			</p>
		</div>

		<p class="text-[13.5px] leading-relaxed text-base-content/78 max-w-2xl">
			{user.isCurrentUser
				? user.sceneInterpretation.secondPerson
				: user.sceneInterpretation.thirdPerson}
		</p>

		{#if user.sceneFootprint.length > 0}
			<ul class="flex flex-col gap-2.5 mt-2">
				{#each user.sceneFootprint as scene (scene.name)}
					<li class="flex items-center gap-4">
						<div class="w-44 shrink-0 text-[12.5px] text-base-content/78 truncate">
							{scene.name}
						</div>
						<div class="flex-1 h-1.5 rounded-full bg-white/6 overflow-hidden">
							<div
								class="h-full rounded-full bg-[oklch(0.72_0.13_230)]/55"
								style="width: {Math.min(100, scene.percent)}%"
							></div>
						</div>
						<div class="w-12 shrink-0 text-right text-[12px] tabular-nums text-base-content/68">
							{formatPercent(scene.percent)}
						</div>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="text-[12.5px] italic text-base-content/45">No scene data tracked yet.</p>
		{/if}
	</section>

	<!-- ═══════════════════════════════════════════════════════════
	     4. SIGNATURE SIGNALS
	     The historical wins. Stacked rows (NOT a dense table) — each
	     row leads with the signal title (link-coloured + ExternalLink
	     icon to telegraph item-detail navigation), supporting
	     metrics on the next line, badges + scene tags below.
	     ═══════════════════════════════════════════════════════════ -->
	<section
		class="rounded-xl border border-white/6 bg-base-200/35 p-5 lg:p-6 space-y-3"
		style="box-shadow: 0 0 0 1px rgba(255,255,255,0.04), 0 4px 18px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.025);"
	>
		<div class="flex items-center gap-2">
			<span class="w-0.5 h-3.5 rounded-full bg-accent/65" aria-hidden="true"></span>
			<p class="text-[11px] font-semibold uppercase tracking-widest text-base-content/68">
				Signature signals
			</p>
		</div>
		<p class="text-[12.5px] text-base-content/55 italic">
			The signals that contributed most to this scout’s reputation.
		</p>

		{#if user.signatureSignals.length > 0}
			<ul class="flex flex-col gap-1.5 mt-2">
				{#each user.signatureSignals as signal (signal.id)}
					<li class="rounded-lg border border-white/5 bg-white/2 hover:bg-white/6 hover:border-white/10 transition-colors px-3.5 py-3 group/sig">
						<a href="/items/{signal.id}" class="flex items-start gap-3.5">
							<!-- Cover artwork — 52 px square. First visual
							     anchor when scanning the section. Subtle
							     border + rounded-md match the card language
							     used elsewhere on the page. No hover scale
							     or animation; the artwork itself carries the
							     visual richness. -->
							<span class="shrink-0 w-13 h-13 rounded-md border border-white/10 overflow-hidden bg-white/5">
								{#if signal.coverArt}
									<img src={signal.coverArt} alt="" class="w-full h-full object-cover" />
								{/if}
							</span>
							<div class="min-w-0 flex-1">
								<!-- Title row — slightly bigger title (15px)
								     so it pulls eye from the artist; live-
								     status chip sits right-aligned. -->
								<div class="flex items-baseline gap-2 flex-wrap">
									<span class="text-[15px] font-semibold text-accent/92 group-hover/sig:text-accent transition-colors leading-snug">
										{signal.title}
									</span>
									<span class="text-base-content/30">—</span>
									<span class="text-[13px] text-base-content/65 leading-snug">{signal.artist}</span>
									<span class={[
										'ml-auto text-[10px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded-full border',
										liveStatusChipClass(signal.liveStatus),
									]}>
										{signal.liveStatus}
									</span>
								</div>
								<!-- Metrics line — recent activity sits at the
								     end at a slightly brighter alpha than the
								     rest, reading as a live note. -->
								<div class="mt-1 flex items-baseline gap-2 text-[11.5px] text-base-content/55 tabular-nums">
									<span>{signal.listeners} listeners</span>
									<span class="text-base-content/28">·</span>
									<span>{signal.generations} {signal.generations === 1 ? 'generation' : 'generations'}</span>
									<span class="text-base-content/28">·</span>
									<span>Impact {signal.impact}</span>
									<span class="text-base-content/28">·</span>
									<span class="text-base-content/72 italic">{signal.recentActivity}</span>
								</div>
								{#if signal.badges.length > 0 || signal.tags.length > 0}
									<div class="mt-2 flex flex-wrap items-center gap-1.5">
										{#each signal.badges as badge (badge)}
											<span class="text-[10px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded-full border border-[oklch(0.86_0.12_60)]/35 text-[oklch(0.86_0.12_60)]/85 bg-[oklch(0.86_0.12_60)]/8">
												{badge}
											</span>
										{/each}
										{#each signal.tags as tag (tag)}
											<span class="text-[11px] px-2 py-0.5 rounded-full border border-accent/22 text-accent/72 bg-accent/5">
												{tag}
											</span>
										{/each}
									</div>
								{/if}
							</div>
						</a>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="text-[12.5px] italic text-base-content/45">No signature signals yet.</p>
		{/if}
	</section>

	<!-- ═══════════════════════════════════════════════════════════
	     5. EMERGING SIGNALS
	     More subdued than Signature — these are unresolved seeds, not
	     wins. Quieter card surface (no bg lift), softer text, and a
	     status label per row instead of impact / badges.
	     ═══════════════════════════════════════════════════════════ -->
	<section
		class="rounded-xl border border-white/6 bg-base-200/35 p-5 lg:p-6 space-y-3"
		style="box-shadow: 0 0 0 1px rgba(255,255,255,0.04), 0 4px 18px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.025);"
	>
		<div class="flex items-center gap-2">
			<span class="w-0.5 h-3.5 rounded-full bg-secondary/55" aria-hidden="true"></span>
			<p class="text-[11px] font-semibold uppercase tracking-widest text-base-content/68">
				Emerging signals
			</p>
		</div>
		<p class="text-[12.5px] text-base-content/55 italic">
			Quiet seeds that may become important later.
		</p>
		<p class="text-[12.5px] leading-relaxed text-base-content/65 max-w-2xl">
			These have not fully propagated yet. If they take off later, influence will flow back to this scout.
		</p>

		{#if user.emergingSignals.length > 0}
			<!-- divide-y carries a hairline between rows so each entry
			     reads as its own observation without box-framing the
			     whole section. Hover lifts the row gently with a
			     quiet background tint — observational, not
			     interactive-feeling. -->
			<ul class="flex flex-col -mx-2 mt-2 divide-y divide-white/4">
				{#each user.emergingSignals as signal (signal.id)}
					<li class="px-2 py-2.5 hover:bg-white/3 transition-colors rounded-sm flex items-center gap-3">
						<!-- Cover thumbnail — 44 px. Real Spotify cover via
						     `coverOf(id)` on the mock item registry, so the
						     row reads as actual undiscovered music rather
						     than a database entry. -->
						<span class="shrink-0 w-11 h-11 rounded-md border border-white/8 overflow-hidden bg-white/5">
							{#if signal.coverArt}
								<img src={signal.coverArt} alt="" class="w-full h-full object-cover" />
							{/if}
						</span>
						<div class="min-w-0 flex-1">
							<div class="flex items-baseline gap-2 flex-wrap">
								<span class="text-[13px] font-medium text-base-content/82 leading-snug">{signal.title}</span>
								<span class="text-base-content/28">—</span>
								<span class="text-[12px] text-base-content/55 leading-snug">{signal.artist}</span>
								<span class={['ml-auto text-[10.5px] uppercase tracking-widest font-semibold', statusColorClass(signal.status)]}>
									{signal.status}
								</span>
							</div>
							<div class="mt-1 flex items-baseline gap-2 text-[11.5px] text-base-content/48 tabular-nums">
								<span>{signal.listeners} {signal.listeners === 1 ? 'listener' : 'listeners'}</span>
								<span class="text-base-content/25">·</span>
								{#if signal.generations !== undefined}
									<span>{signal.generations} {signal.generations === 1 ? 'generation' : 'generations'}</span>
								{:else}
									<span class="italic">awaiting first branch</span>
								{/if}
								<span class="text-base-content/25">·</span>
								<span class="italic">planted {signal.plantedAgo}</span>
							</div>
						</div>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="text-[12.5px] italic text-base-content/45">No emerging seeds tracked.</p>
		{/if}
	</section>

	<!-- ═══════════════════════════════════════════════════════════
	     6. FOLLOWING / FOLLOWERS
	     Two narrow columns; each leads with the count, followed by a
	     compact avatar row. Names link through to the matching
	     user-detail page (the route falls back gracefully for
	     unknown ids — see `getUserDetail`).
	     ═══════════════════════════════════════════════════════════ -->
	<section class="grid gap-6 md:grid-cols-2">
		{#each [
			{
				kind: 'following',
				heading: user.isCurrentUser ? 'Scouts you follow' : 'Following',
				count: user.followingCount,
				list: user.following,
			},
			{
				kind: 'followers',
				heading: user.isCurrentUser ? 'People following your signals' : 'Followers',
				count: user.followersCount,
				list: user.followers,
			},
		] as col (col.kind)}
			<div
				class="rounded-xl border border-white/6 bg-base-200/35 p-5 lg:p-6 space-y-3"
				style="box-shadow: 0 0 0 1px rgba(255,255,255,0.04), 0 4px 18px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.025);"
			>
				<div class="flex items-center gap-2">
					<span class="w-0.5 h-3.5 rounded-full bg-secondary/55" aria-hidden="true"></span>
					<p class="text-[11px] font-semibold uppercase tracking-widest text-base-content/68">
						{col.heading}
					</p>
				</div>
				<p class="text-[28px] leading-none font-semibold tabular-nums text-base-content/92">{col.count}</p>
				{#if col.list.length > 0}
					<div class="flex flex-wrap items-center gap-2 mt-2">
						{#each col.list as scout (scout.id)}
							<a
								href="/users/{scout.id}"
								class="group flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-full border border-white/8 bg-white/3 hover:bg-white/8 hover:border-white/16 transition-colors"
								title="View {scout.name}'s scout profile"
							>
								<span class="w-5 h-5 rounded-full border border-white/12 overflow-hidden shrink-0">
									<img src={scout.avatar} alt="" class="w-full h-full object-cover" />
								</span>
								<span class="text-[12px] text-base-content/82 group-hover:text-base-content/95 transition-colors">
									{scout.name}
								</span>
							</a>
						{/each}
					</div>
				{:else}
					<p class="text-[12.5px] italic text-base-content/45">No scouts yet.</p>
				{/if}
			</div>
		{/each}
	</section>

	<!-- ═══════════════════════════════════════════════════════════
	     7. SIGNAL TREE
	     Mixed user → signal → user tree owned by `UserSignalTree`.
	     This page only orchestrates: section eyebrow + subtitle + the
	     component (or an empty state when the user has no tree data).
	     Visual hierarchy and connector geometry live in the component
	     itself so the page file stays readable.
	     ═══════════════════════════════════════════════════════════ -->
	<section
		class="rounded-xl border border-white/6 bg-base-200/35 p-5 lg:p-6 space-y-3"
		style="box-shadow: 0 0 0 1px rgba(255,255,255,0.04), 0 4px 18px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.025);"
	>
		<div class="flex items-center gap-2">
			<span class="w-0.5 h-3.5 rounded-full bg-secondary/55" aria-hidden="true"></span>
			<p class="text-[11px] font-semibold uppercase tracking-widest text-base-content/68">
				Signal tree
			</p>
		</div>
		<p class="text-[12.5px] text-base-content/55 italic">
			Signals sparked by this scout, and the listeners they reached.
		</p>
		{#if signalTree}
			<div class="mt-3">
				<UserSignalTree tree={signalTree} />
			</div>
		{:else}
			<div class="mt-2 rounded-lg border border-dashed border-white/12 bg-white/2 p-8 text-center space-y-2">
				<p class="text-[13px] text-base-content/72 leading-relaxed max-w-2xl mx-auto">
					No sparked signals yet.
				</p>
				<p class="text-[12px] text-base-content/55 leading-relaxed max-w-2xl mx-auto italic">
					When this scout brings a signal into Outer Signal, its downstream path will appear here.
				</p>
			</div>
		{/if}
	</section>

</div>

