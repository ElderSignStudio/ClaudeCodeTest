<script lang="ts">
	import type { PropagationForest, PropagationUser, PreviewTarget, SignalRole, BranchActivityState } from '$lib/mock/propagation';
	import { findParentInForest, computeBranchActivity } from '$lib/mock/propagation';

	/* Branch-state colour for the "Branch momentum" line on the entry-
	   point card. Mirrors the conduit / inline-score palette so the card
	   feels visually tied to the tree without re-introducing badges. */
	function branchStateColorClass(state: BranchActivityState): string {
		switch (state) {
			case 'dead':                return 'text-base-content/55';
			case 'alive':               return 'text-[oklch(0.72_0.07_230)]/82';
			case 'accelerating':        return 'text-[oklch(0.72_0.13_55)]/82';
			case 'strong-accelerating': return 'text-[oklch(0.76_0.13_55)]/88';
			case 'peak-accelerating':   return 'text-[oklch(0.84_0.13_58)]/94';
		}
	}

	function branchStateLabel(state: BranchActivityState): string {
		switch (state) {
			case 'dead':                return 'Dead';
			case 'alive':               return 'Alive';
			case 'accelerating':        return 'Accelerating';
			case 'strong-accelerating': return 'Strong';
			case 'peak-accelerating':   return 'Peak';
		}
	}

	/* Static role ladder for the YOUR POSSIBLE JOURNEY section. This is
	   NOT a prediction — it's the same five-stage relationship-with-
	   signal ladder real nodes can move through, presented as the user's
	   potential entry path. Kept as a single source of truth so future
	   changes to the role taxonomy update both places. */
	const POSSIBLE_JOURNEY: SignalRole[] = [
		'Passive Listener',
		'Listener',
		'Deep Listener',
		'Amplifier',
		'Successful Amplifier',
	];

	/* Plural of a role name for percentile lines ("Earlier than 32% of
	   passive listeners"). All roles pluralise by lower-casing and adding
	   "s" — kept as an explicit map so a future irregular plural can be
	   added without code changes elsewhere. */
	const ROLE_PLURAL: Record<SignalRole, string> = {
		'Passive Listener':    'passive listeners',
		'Listener':            'listeners',
		'Deep Listener':       'listeners',
		'Amplifier':           'amplifiers',
		'Successful Amplifier': 'amplifiers',
	};

	/* One-sentence neutral description per role. Personalisation for the
	   current user lives in the template (the YOUR ROLE block omits these
	   descriptions and uses second-person copy instead). */
	const ROLE_DESCRIPTION: Record<SignalRole, string> = {
		'Passive Listener':    'Listened casually but did not engage further.',
		'Listener':            'Returned to the signal more than once.',
		'Deep Listener':       'Developed sustained engagement with the signal.',
		'Amplifier':           'Passed the signal forward.',
		'Successful Amplifier': 'Passed the signal forward and created downstream propagation.',
	};

	/* Subtle role-coloured text class for the role title. Mirrors the
	   conduit/score palette so the card feels visually connected to the
	   tree but stays restrained — no glow, no animation. */
	function roleColorClass(role: SignalRole): string {
		switch (role) {
			case 'Passive Listener':    return 'text-base-content/60';
			case 'Listener':            return 'text-[oklch(0.72_0.07_230)]/78';
			case 'Deep Listener':       return 'text-[oklch(0.74_0.10_230)]/88';
			case 'Amplifier':           return 'text-[oklch(0.74_0.13_55)]/85';
			case 'Successful Amplifier': return 'text-[oklch(0.86_0.12_60)]/94';
		}
	}

	/*
		Contextual inspector. Three editorial states:

		- GLOBAL (no target): narrative summary, scene crossover line, origins
		  count, weighted impact, amplifications, per-branch summaries.

		- USER (target.kind === 'user'): identity + origin-status header +
		  scene chips + global novelty at discovery + Impact section
		  (branch reach, amplifications, depth, biggest subcascade, score).

		- CLUSTER (target.kind === 'cluster'): editorial description of a
		  collapsed "+N more" tail — scene-level cultural context for a quiet
		  group of listeners.

		Anonymous stub users (created when a "+N more" tail is expanded) get
		a minimal anonymized state — we explicitly do not have individual
		reach data at that depth.
	*/

	let {
		forest,
		target,
		lineageOrderedIds = null,
	}: {
		forest: PropagationForest;
		target: PreviewTarget | null;
		/** Ordered ORIGIN → … → USER chain from the page when a
		 *  lineage reveal is active (i.e., the user has clicked
		 *  their own real node). When non-null AND the currently
		 *  active target is one of the scouts in this chain, the
		 *  inspector switches to "Lineage context" mode and
		 *  emphasises ancestry instead of branch metrics. */
		lineageOrderedIds?: string[] | null;
	} = $props();

	const isAnonymousStub = $derived(
		target !== null && target.kind === 'user' && target.user.avatar === ''
	);

	// Parent lookup — when a user is selected, we use this to display the
	// "Discovered through X" status for downstream scouts.
	const parentOfTarget = $derived(
		target !== null && target.kind === 'user'
			? findParentInForest(forest, target.user.id)
			: null,
	);

	/* Largest branchSize anywhere in the visible forest — drives the
	   "Created the largest branch" bullet in WHY THIS MATTERS. Walks
	   both visible roots and hidden roots so a quiet origin that
	   happens to hold the max isn't overlooked. */
	const maxBranchInForest = $derived.by(() => {
		let max = 0;
		function walk(u: PropagationUser) {
			if (u.branchSize > max) max = u.branchSize;
			for (const c of u.children) walk(c);
		}
		for (const r of forest.roots) walk(r);
		for (const r of forest.hiddenRootUsers) walk(r);
		return max;
	});

	/* WHY THIS MATTERS — editorial explanation of the selected
	   scout's contribution, structured as ONE headline statement
	   plus up to THREE supporting bullets so the section reads as
	   "explanation, then evidence" rather than a flat metric dump.

	   Headline rules:
	     • A qualitative scale statement when the branch is notable
	       (largest in forest / one of the largest / a large
	       downstream branch). The headline conveys SIGNIFICANCE;
	       the count appears below as supporting evidence.
	     • Falls back to a strong-timing statement
	       ("Helped establish the signal early") when scale doesn't
	       qualify but the scout was very early (≥90 %).
	     • Otherwise null — the section still renders if at least
	       two supporting bullets qualify, but no headline.

	   Supporting bullets — emitted in narrative order:
	     1. Timing — "Amplified earlier than X% of amplifiers"
	     2. Activity — "Produced X successful forward shares"
	     3. Scale evidence — "Generated X downstream scouts"
	     4. Structural — "Connected listening circles" / "Bridged…"
	   Capped at 3 so the section stays concise.

	   No formulas, percentile breakpoints, or category names
	   surface in the rendered copy. Section hides entirely when
	   the scout has no headline AND fewer than two supporting
	   bullets (passive listeners, anonymous stubs, fresh childless
	   origins, etc.). */
	const whyThisMatters = $derived.by((): { headline: string | null; supporting: string[] } => {
		if (
			!target
			|| target.kind !== 'user'
			|| target.user.isPreviewNode
			|| isAnonymousStub
		) return { headline: null, supporting: [] };
		const u = target.user;
		const isAmplifierRole = u.signalRole === 'Amplifier' || u.signalRole === 'Successful Amplifier';

		// ── HEADLINE — the strongest qualitative significance line.
		let headline: string | null = null;
		if (u.branchSize > 0) {
			if (u.branchSize === maxBranchInForest && u.branchSize >= 10) {
				headline = 'Created the largest branch in this signal';
			} else if (u.branchSize >= Math.max(20, Math.floor(maxBranchInForest * 0.6))) {
				headline = 'Created one of the largest branches';
			} else if (u.branchSize >= 25) {
				headline = 'Created a large downstream branch';
			}
		}
		if (
			!headline
			&& isAmplifierRole
			&& typeof u.earlierThanPercent === 'number'
			&& u.earlierThanPercent >= 90
		) {
			headline = 'Helped establish the signal early';
		}

		// ── SUPPORTING — in narrative order: timing → activity → scale evidence → structural.
		const supporting: string[] = [];

		if (
			isAmplifierRole
			&& typeof u.earlierThanPercent === 'number'
			&& u.earlierThanPercent >= 65
		) {
			const role: SignalRole = u.signalRole as SignalRole;
			supporting.push(`Amplified earlier than ${u.earlierThanPercent}% of ${ROLE_PLURAL[role]}`);
		}

		if (
			typeof u.forwardAmplifications === 'number'
			&& u.forwardAmplifications > 0
			&& u.branchSize > 0
		) {
			supporting.push(`Produced ${u.forwardAmplifications} successful forward ${u.forwardAmplifications === 1 ? 'share' : 'shares'}`);
		}

		if (u.branchSize > 0) {
			supporting.push(`Generated ${u.branchSize} downstream ${u.branchSize === 1 ? 'scout' : 'scouts'}`);
		}

		if (supporting.length < 3 && u.scenes && u.scenes.length >= 2) {
			supporting.push(u.scenes.length >= 3
				? 'Bridged separate listening circles'
				: 'Connected listening circles');
		}

		return { headline, supporting: supporting.slice(0, 3) };
	});

	/* Used by the template to decide whether the section renders.
	   A headline alone is enough (it's a complete statement); two
	   or more supporting bullets are enough on their own. A single
	   supporting bullet with no headline reads as a thin list and
	   is suppressed. */
	const whyHasContent = $derived(
		whyThisMatters.headline !== null || whyThisMatters.supporting.length >= 2,
	);

	/* ── Lineage Context mode ──────────────────────────────────
	   When the page has a lineage reveal active (lineageOrderedIds
	   is non-null) AND the currently-active target is one of the
	   scouts on that chain, the inspector switches into a dedicated
	   ancestry-focused presentation: SIGNAL PATH + narrative +
	   supporting lineage facts, and the branch-analysis sections
	   (Why This Matters, role/journey/scenes/novelty, metrics)
	   step aside.

	   Triggers cleanly for any lineage member the user lands on
	   (Dan selected → all his ancestors highlighted in the tree;
	   hovering Gisli or any ancestor shows lineage context for
	   that scout). When the user clicks OUT of the lineage path,
	   selectedTarget changes, lineageOrderedIds re-derives to
	   null on the page side, and the inspector returns to Branch
	   Context naturally. */
	const isLineageContext = $derived(
		lineageOrderedIds !== null
			&& lineageOrderedIds.length >= 2
			&& target !== null
			&& target.kind === 'user'
			&& !target.user.isPreviewNode
			&& lineageOrderedIds.includes(target.user.id),
	);

	/* Resolved PropagationUser objects for every step on the chain,
	   ORIGIN → … → USER. Used to render the path with names instead
	   of bare ids, and to look up the origin's name for supporting
	   copy. Walks the forest once per change. */
	const lineageScouts = $derived.by((): PropagationUser[] => {
		if (!isLineageContext || !lineageOrderedIds) return [];
		const out: PropagationUser[] = [];
		function findIn(u: PropagationUser, id: string): PropagationUser | null {
			if (u.id === id) return u;
			for (const c of u.children) {
				const hit = findIn(c, id);
				if (hit) return hit;
			}
			return null;
		}
		for (const id of lineageOrderedIds) {
			let found: PropagationUser | null = null;
			for (const r of forest.roots) {
				found = findIn(r, id);
				if (found) break;
			}
			if (found) out.push(found);
		}
		return out;
	});

	const lineageDepth = $derived(
		isLineageContext && lineageOrderedIds && target?.kind === 'user'
			? lineageOrderedIds.indexOf(target.user.id)
			: -1,
	);

	const lineageOrigin = $derived<PropagationUser | null>(lineageScouts[0] ?? null);

	/* Depth-bucketed label shown in the "Position" supporting fact
	   of the lineage card. Editorial — no formulas or numeric
	   percentiles surface. "Origin scout" / "Your signal" /
	   "Early amplifier" / "Mid-chain amplifier" / "Deep lineage
	   node". */
	const lineageDepthLabel = $derived.by((): string | null => {
		if (!isLineageContext || !target || target.kind !== 'user') return null;
		const u = target.user;
		if (u.isOrigin) return 'Origin scout';
		if (u.isCurrentUser) return 'Your signal';
		if (lineageDepth <= 2) return 'Early amplifier';
		if (lineageDepth <= 4) return 'Mid-chain amplifier';
		return 'Deep lineage node';
	});

	/* One-sentence editorial narrative, varied so different lineage
	   selections don't all read identically. The wording targets
	   "how did the signal get here" rather than precise stats. */
	const lineageNarrative = $derived.by((): string => {
		if (!isLineageContext || !target || target.kind !== 'user' || !lineageOrderedIds) return '';
		const u = target.user;
		const depth = lineageDepth;
		const totalGens = lineageOrderedIds.length - 1;
		if (u.isCurrentUser && lineageOrigin) {
			return `You entered this signal through ${lineageOrigin.name}'s branch.`;
		}
		if (u.isOrigin) {
			const word = totalGens === 1 ? 'generation' : 'generations';
			return `Brought this signal in from outside. The lineage runs ${totalGens} ${word} down to you.`;
		}
		if (depth >= 5) {
			return 'Sits deep inside a long-running propagation chain.';
		}
		const word = depth === 1 ? 'generation' : 'generations';
		return `${depth} ${word} from origin — the signal moved through several amplifiers to reach this point.`;
	});
</script>

<aside class="flex flex-col gap-5">

	<!-- Eyebrow — switches label between global / branch / cluster / entry-point context -->
	<div class="flex items-center gap-2 px-1">
		{#if !target}
			<span class="w-0.5 h-3.5 rounded-full bg-secondary/55" aria-hidden="true"></span>
			<p class="text-[11px] font-semibold uppercase tracking-widest text-base-content/68">Cultural lineage</p>
		{:else if target.kind === 'cluster'}
			<span class="w-0.5 h-3.5 rounded-full bg-base-content/40" aria-hidden="true"></span>
			<p class="text-[11px] font-semibold uppercase tracking-widest text-base-content/68">Cluster context</p>
		{:else if target.user.isPreviewNode}
			<span class="w-0.5 h-3.5 rounded-full bg-primary/55" aria-hidden="true"></span>
			<p class="text-[11px] font-semibold uppercase tracking-widest text-base-content/68">Your entry point</p>
		{:else if isLineageContext}
			<span class="w-0.5 h-3.5 rounded-full bg-primary/65" aria-hidden="true"></span>
			<p class="text-[11px] font-semibold uppercase tracking-widest text-base-content/68">Lineage context</p>
		{:else}
			<span class="w-0.5 h-3.5 rounded-full bg-accent/65" aria-hidden="true"></span>
			<p class="text-[11px] font-semibold uppercase tracking-widest text-base-content/68">Branch context</p>
		{/if}
	</div>

	{#if !target}
		<!-- ─────────────────────── GLOBAL STATE ─────────────────────── -->

		<!-- Narrative one-liner — editorial anchor of the global view. -->
		<p class="text-[14px] leading-relaxed text-base-content/82">
			{forest.summary}
		</p>

		<!-- Scene crossover phrase — cultural framing, not stats. -->
		<p class="text-[12px] leading-relaxed text-base-content/56 italic">
			{forest.crossingNote}
		</p>

		<!-- Scenes the signal has crossed into — small chips, observational. -->
		<div class="flex flex-wrap gap-1.5">
			{#each forest.scenes as scene (scene)}
				<span class="text-[10px] px-2 py-0.5 rounded-full border border-white/10 text-base-content/62 bg-white/3">
					{scene}
				</span>
			{/each}
		</div>

		<!-- Quiet numeric block — mono-tabular, no charts, no bars. -->
		<dl class="grid grid-cols-2 gap-x-4 gap-y-3 pt-2 border-t border-white/6">
			<div>
				<dt class="text-[10px] uppercase tracking-widest text-base-content/45">Total reach</dt>
				<dd class="mt-1 text-[16px] font-semibold tabular-nums text-base-content/92">{forest.totalReach}</dd>
				<dd class="text-[11px] text-base-content/52">scouts downstream</dd>
			</div>
			<div>
				<dt class="text-[10px] uppercase tracking-widest text-base-content/45">Independent origins</dt>
				<dd class="mt-1 text-[16px] font-semibold tabular-nums text-base-content/92">{forest.independentOrigins}</dd>
				<dd class="text-[11px] text-base-content/52">unrelated starting points</dd>
			</div>
			<div>
				<dt class="text-[10px] uppercase tracking-widest text-base-content/45">Weighted impact</dt>
				<dd class="mt-1 text-[16px] font-semibold tabular-nums text-base-content/92">{forest.weightedImpact}<span class="text-base-content/40 text-[11px] font-normal">/100</span></dd>
				<dd class="text-[11px] text-base-content/52">editorial transmission score</dd>
			</div>
			<div>
				<dt class="text-[10px] uppercase tracking-widest text-base-content/45">Amplifications</dt>
				<dd class="mt-1 text-[16px] font-semibold tabular-nums text-base-content/92">{forest.totalAmplifications}</dd>
				<dd class="text-[11px] text-base-content/52">across the forest</dd>
			</div>
		</dl>

		<!-- Per-branch summaries — one row per visible root. -->
		<section class="pt-2 border-t border-white/6">
			<p class="text-[10px] uppercase tracking-widest text-base-content/45 mb-2.5">Branches</p>
			<ul class="flex flex-col gap-2">
				{#each forest.branchSummaries as branch (branch.rootId)}
					<li class="flex items-start gap-2.5">
						<span class="shrink-0 mt-1 text-[10px] font-mono text-base-content/40 tabular-nums w-7">
							{branch.count}
						</span>
						<p class="text-[12px] leading-snug text-base-content/72">
							{branch.label}
						</p>
					</li>
				{/each}
				{#if forest.hiddenRoots > 0}
					<li class="flex items-start gap-2.5 text-base-content/45 italic">
						<span class="shrink-0 mt-1 text-[10px] font-mono w-7">+{forest.hiddenRoots}</span>
						<p class="text-[12px] leading-snug">Quieter origins, further from main propagation</p>
					</li>
				{/if}
			</ul>
		</section>

	{:else if target.kind === 'cluster'}
		<!-- ─────────────────────── CLUSTER STATE ─────────────────────── -->

		<div class="flex items-center gap-3">
			<div class="w-11 h-11 rounded-full border border-dashed border-white/16 flex items-center justify-center text-[12px] font-mono text-base-content/56">
				+{target.count}
			</div>
			<div class="min-w-0">
				<p class="text-[14px] font-bold text-base-content/88 leading-snug">{target.label}</p>
				<p class="text-[11px] text-base-content/50">Quieter cluster off {target.parent.name}'s branch</p>
			</div>
		</div>

		{#if target.description}
			<p class="text-[13px] leading-relaxed text-base-content/74">
				{target.description}
			</p>
		{:else}
			<p class="text-[13px] leading-relaxed text-base-content/60 italic">
				A cluster of listeners off this branch — no individual reach data is tracked here.
			</p>
		{/if}

		<!-- Show the parent's own scene chips so the cluster reads as part of
		     that scene context. -->
		{#if target.parent.scenes && target.parent.scenes.length > 0}
			<div>
				<p class="text-[10px] uppercase tracking-widest text-base-content/45 mb-1.5">Scenes around this cluster</p>
				<div class="flex flex-wrap gap-1.5">
					{#each target.parent.scenes as scene (scene)}
						<span class="text-[10px] px-2 py-0.5 rounded-full border border-white/10 text-base-content/62 bg-white/3">
							{scene}
						</span>
					{/each}
				</div>
			</div>
		{/if}

	{:else if target.user.isPreviewNode}
		<!-- ─────────────────────── ENTRY-POINT PLACEHOLDER ───────────────────────
			Shown when the user hovers / clicks the greyed-out current-user
			placeholder ("Amplify to be included here"). The card explains
			WHERE the user would enter the lineage and the CONTEXT of that
			entry — without predicting impact or fabricating future scores.

			Data sources:
			  parent           = findParentInForest(forest, placeholder.id)
			                     (the route-source scout)
			  parentBranchState = computeBranchActivity(parent)
			  siblings         = parent.children minus the placeholder itself

			If parent is missing for any reason (origin-stories items
			occasionally lack a route insertion point), the card falls
			back to "You would enter this lineage here." and omits the
			parent-derived fields.
		-->
		{@const parent = parentOfTarget}
		{@const parentBranchState = parent ? computeBranchActivity(parent) : null}
		{@const siblings = parent
			? parent.children.filter((c) => c.id !== target.user.id).slice(0, 3)
			: []}

		<!-- Header — avatar (grayscaled to echo the placeholder's tree look) +
		     name + muted subtitle + small ENTRY POINT chip below. -->
		<div class="flex items-center gap-3">
			<div class="w-11 h-11 rounded-full overflow-hidden border border-primary/35">
				{#if target.user.avatar}
					<img src={target.user.avatar} alt="" class="w-full h-full object-cover grayscale opacity-72" />
				{:else}
					<div class="w-full h-full bg-base-content/12"></div>
				{/if}
			</div>
			<div class="min-w-0">
				<p class="text-[15px] font-bold text-base-content/95 truncate">{target.user.name}</p>
				<p class="text-[12px] text-base-content/55 truncate italic">Not in this lineage yet</p>
			</div>
		</div>
		<div class="flex items-center gap-2 -mt-2">
			<span class="text-[9px] uppercase tracking-widest font-semibold px-1.5 py-0.5 rounded border border-primary/40 text-primary/82 bg-primary/8">
				Entry point
			</span>
		</div>

		<!-- Main explanation — second-person, no prediction. -->
		<div class="flex flex-col gap-1.5">
			<p class="text-[13px] leading-relaxed text-base-content/82">
				You have not engaged with this signal yet.
			</p>
			{#if parent}
				<p class="text-[13px] leading-relaxed text-base-content/74">
					You would enter through
					<span class="text-accent/92 font-semibold">{parent.name}</span>.
				</p>
			{:else}
				<p class="text-[13px] leading-relaxed text-base-content/74">
					You would enter this lineage here.
				</p>
			{/if}
		</div>

		<!-- CURRENT BRANCH — factual context about the branch the user would
		     join. Renders only fields we actually have. -->
		{#if parent && parentBranchState}
			<section class="pt-4 border-t border-white/6">
				<p class="text-[10px] uppercase tracking-widest text-base-content/45 mb-2">Current branch</p>
				<dl class="flex flex-col gap-3">
					<div>
						<dt class="text-[10px] uppercase tracking-widest text-base-content/45">Branch momentum</dt>
						<dd class={['mt-1 text-[14px] font-semibold leading-snug', branchStateColorClass(parentBranchState)]}>
							{branchStateLabel(parentBranchState)}
						</dd>
					</div>
					{#if parent.branchSize > 0}
						<div>
							<dt class="text-[10px] uppercase tracking-widest text-base-content/45">Branch community</dt>
							<dd class="mt-1 text-[13px] text-base-content/82">
								<span class="font-semibold tabular-nums">{parent.branchSize}</span>
								<span class="text-base-content/55">{parent.branchSize === 1 ? 'scout' : 'scouts'}</span>
							</dd>
						</div>
					{/if}
					{#if parent.scenes && parent.scenes.length > 0}
						<div>
							<dt class="text-[10px] uppercase tracking-widest text-base-content/45">Listening circles</dt>
							<dd class="mt-1 text-[13px] text-base-content/74 leading-snug">
								{parent.scenes.join(' · ')}
							</dd>
						</div>
					{/if}
				</dl>
			</section>
		{/if}

		<!-- PEOPLE NEARBY — parent + up to 3 siblings around the placeholder.
		     Compact rows; no avatars to keep the section quiet — names +
		     character only, like the cluster summary style. -->
		{#if parent || siblings.length > 0}
			<section class="pt-4 border-t border-white/6">
				<p class="text-[10px] uppercase tracking-widest text-base-content/45 mb-2.5">People nearby</p>
				<ul class="flex flex-col gap-2">
					{#if parent}
						<li>
							<p class="text-[13px] text-base-content/88 leading-snug">{parent.name}</p>
							<p class="text-[11px] text-base-content/55 leading-snug">{parent.character}</p>
						</li>
					{/if}
					{#each siblings as sib (sib.id)}
						<li>
							<p class="text-[13px] text-base-content/82 leading-snug">{sib.name}</p>
							<p class="text-[11px] text-base-content/55 leading-snug">{sib.character}</p>
						</li>
					{/each}
				</ul>
			</section>
		{/if}

		<!-- YOUR POSSIBLE JOURNEY — static role ladder, NOT a prediction.
		     Same visual treatment as the SIGNAL JOURNEY block on real
		     nodes so the affordance is recognisable, but every stage is
		     rendered in muted text (no role-coloured "current" stage,
		     since the user hasn't started yet). -->
		<section>
			<p class="text-[10px] uppercase tracking-widest text-base-content/45 mb-1.5">Your possible journey</p>
			<p class="text-[12px] leading-snug text-base-content/65 flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
				{#each POSSIBLE_JOURNEY as stage, i (stage)}
					{#if i > 0}
						<span class="text-base-content/35" aria-hidden="true">→</span>
					{/if}
					<span>{stage}</span>
				{/each}
			</p>
		</section>

		<!-- Optional CTA — small muted line, no button. Wording reflects
		     the Outer Signal model where the lineage begins at Listener,
		     not at Amplifier — amplification is a later stage of an
		     already-joined journey. -->
		<p class="text-[11px] text-base-content/52 italic pt-1">
			Your journey begins when you listen.
		</p>

	{:else if isAnonymousStub}
		<!-- ─────────────────────── ANONYMOUS STUB ─────────────────────── -->

		<div class="flex items-center gap-3">
			<div class="w-11 h-11 rounded-full bg-base-content/12 border border-white/14"></div>
			<div>
				<p class="text-[14px] font-bold text-base-content/82">Anonymous listener</p>
				<p class="text-[11px] text-base-content/52">{target.user.character}</p>
			</div>
		</div>

		<p class="text-[13px] leading-relaxed text-base-content/60 italic">
			{target.user.behaviorNote ?? 'No individual reach data tracked at this depth.'}
		</p>

	{:else}
		<!-- ─────────────────────── USER STATE ─────────────────────── -->

		<!-- Identity row -->
		<div class="flex items-center gap-3">
			<div class={['w-11 h-11 rounded-full overflow-hidden border', target.user.isOrigin ? 'border-accent/55' : 'border-accent/35']}>
				<img src={target.user.avatar} alt="" class="w-full h-full object-cover" />
			</div>
			<div class="min-w-0">
				<p class="text-[15px] font-bold text-base-content/95 truncate">{target.user.name}</p>
				<p class="text-[12px] text-accent/72 truncate">{target.user.character}</p>
			</div>
		</div>

		<!--
			Origin status — surfaces whether this scout is an independent
			origin (brought the signal in from outside) or downstream from
			another scout, in which case we name the upstream scout.
		-->
		{#if target.user.isOrigin}
			<div class="flex items-center gap-2 -mt-2">
				<span class="text-[9px] uppercase tracking-widest font-semibold px-1.5 py-0.5 rounded border border-accent/45 text-accent/90 bg-accent/8">
					Origin scout
				</span>
				<p class="text-[11px] text-base-content/55 italic">Brought in from outside Outer Signal</p>
			</div>
		{:else if parentOfTarget}
			<!--
				Downstream source line — surfaces the scout this user's
				lineage is locked to. Sits right under the scout header so
				the origin context is immediately clear; "Discovered through"
				stays quiet while the source scout name reads in accent +
				semibold so the relationship is unambiguous.
			-->
			<p class="text-[12px] -mt-3 leading-snug">
				<span class="text-base-content/55">Discovered through</span>
				<span class="text-accent/92 font-semibold">{parentOfTarget.name}</span>
			</p>
		{/if}

		<!-- Behavior note — one editorial sentence. -->
		{#if target.user.behaviorNote}
			<p class="text-[13px] leading-relaxed text-base-content/74">
				{target.user.behaviorNote}
			</p>
		{/if}

		{#if isLineageContext}
			<!--
				LINEAGE CONTEXT mode — replaces the branch-analysis
				sections below (role / journey / scenes / novelty / why
				this matters / metrics) with an ancestry-focused
				presentation:

				  • SIGNAL PATH — the full ORIGIN → … → USER chain,
				    rendered with subdued arrows. The currently
				    inspected scout is highlighted in the panel's
				    accent / semibold so it reads "this scout is here
				    in the route" without becoming a breadcrumb
				    navigation component.
				  • Narrative — one editorial sentence answering
				    "how did the signal get here?".
				  • Supporting lineage facts — Depth from origin,
				    Origin, Branch, Position. These remain secondary
				    to the path + narrative above.

				The block triggers any time the inspector's active
				target is a member of the revealed lineage, so hovering
				ancestor scouts during a path-to-origin reveal also
				shows lineage context for them.
			-->
			<section class="pt-4 border-t border-white/6 flex flex-col gap-3">
				<div>
					<p class="text-[10px] uppercase tracking-widest text-base-content/45 mb-1.5">Signal path</p>
					<p class="text-[12.5px] leading-relaxed flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
						{#each lineageScouts as step, i (step.id)}
							{#if i > 0}
								<span class="text-base-content/35" aria-hidden="true">→</span>
							{/if}
							<span class={step.id === target.user.id
								? 'text-accent/92 font-semibold'
								: 'text-base-content/68'}>
								{step.name}
							</span>
						{/each}
					</p>
				</div>

				{#if lineageNarrative}
					<p class="text-[13px] leading-relaxed text-base-content/78">
						{lineageNarrative}
					</p>
				{/if}

				<dl class="grid grid-cols-2 gap-x-4 gap-y-3 mt-1">
					<div>
						<dt class="text-[10px] uppercase tracking-widest text-base-content/45">Depth from origin</dt>
						<dd class="mt-1 text-[13px] text-base-content/82 leading-snug">
							{lineageDepth} {lineageDepth === 1 ? 'generation' : 'generations'}
						</dd>
					</div>
					{#if lineageOrigin}
						<div>
							<dt class="text-[10px] uppercase tracking-widest text-base-content/45">Origin</dt>
							<dd class="mt-1 text-[13px] text-base-content/82 leading-snug">{lineageOrigin.name}</dd>
						</div>
						<div>
							<dt class="text-[10px] uppercase tracking-widest text-base-content/45">Branch</dt>
							<dd class="mt-1 text-[13px] text-base-content/82 leading-snug">{lineageOrigin.name}'s branch</dd>
						</div>
					{/if}
					{#if lineageDepthLabel}
						<div>
							<dt class="text-[10px] uppercase tracking-widest text-base-content/45">Position</dt>
							<dd class="mt-1 text-[13px] text-base-content/82 leading-snug">{lineageDepthLabel}</dd>
						</div>
					{/if}
				</dl>
			</section>
		{:else}

		<!--
			ROLE IN SIGNAL — primary explanation of this scout's relationship
			to the signal. For the current user we switch the eyebrow and
			use second-person copy; for everyone else we use the neutral
			third-person sentences from ROLE_DESCRIPTION. The role title is
			tinted with a subtle palette tied to the conduit/score system
			(grey → moonlight → amber → near-white) so the card visually
			echoes the tree's branch state without becoming gamified.
		-->
		{#if target.user.signalRole}
			{@const role = target.user.signalRole}
			{@const isCu = !!target.user.isCurrentUser}
			{@const amplifiedAfterDays = target.user.amplifiedAt}
			{@const joinedAfterDays = target.user.firstSignalEventAt}
			{@const pct = target.user.earlierThanPercent}
			{@const reach = target.user.branchSize}
			<section class="pt-4 border-t border-white/6">
				<p class="text-[10px] uppercase tracking-widest text-base-content/45 mb-2">
					{isCu ? 'Your role in signal' : 'Role in signal'}
				</p>
				<p class={['text-[14px] font-semibold leading-snug', roleColorClass(role)]}>
					{role}
				</p>
				<div class="mt-1.5 flex flex-col gap-1 text-[12.5px] leading-relaxed text-base-content/74">
					{#if isCu}
						<!-- Current-user copy — second person, omits the
						     descriptive sentence (it's implied by "You"). -->
						{#if amplifiedAfterDays !== undefined}
							<p>You amplified {amplifiedAfterDays} {amplifiedAfterDays === 1 ? 'day' : 'days'} after origin.</p>
						{:else if joinedAfterDays !== undefined}
							<p>You joined {joinedAfterDays} {joinedAfterDays === 1 ? 'day' : 'days'} after origin.</p>
						{/if}
						{#if pct !== undefined}
							<p>Earlier than {pct}% of {ROLE_PLURAL[role]}.</p>
						{/if}
					{:else}
						<p>{ROLE_DESCRIPTION[role]}</p>
						{#if amplifiedAfterDays !== undefined}
							<p>Amplified {amplifiedAfterDays} {amplifiedAfterDays === 1 ? 'day' : 'days'} after origin.</p>
						{:else if joinedAfterDays !== undefined}
							<p>{role === 'Passive Listener' ? 'Discovered' : 'Joined'} {joinedAfterDays} {joinedAfterDays === 1 ? 'day' : 'days'} after origin.</p>
						{/if}
						{#if pct !== undefined}
							<p>Earlier than {pct}% of {ROLE_PLURAL[role]}.</p>
						{/if}
					{/if}
					{#if role === 'Successful Amplifier' && reach > 0}
						<p>Generated a branch that reached {reach} {reach === 1 ? 'scout' : 'scouts'}.</p>
					{/if}
				</div>
			</section>
		{/if}

		<!--
			SIGNAL JOURNEY — compact arrow timeline of role progression.
			Only renders when the journey has more than one stage; passive
			listeners and single-stage entries skip this section.
			Visual treatment matches the metadata eyebrows used elsewhere
			in the card (uppercase / letter-spaced / muted), with arrows
			rendered in a slightly dimmer tone than the role names so the
			eye scans stage → stage rather than landing on the arrows.
		-->
		{#if target.user.signalJourney && target.user.signalJourney.length > 1}
			<section>
				<p class="text-[10px] uppercase tracking-widest text-base-content/45 mb-1.5">Signal journey</p>
				<p class="text-[12px] leading-snug text-base-content/74 flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
					{#each target.user.signalJourney as stage, i (i + stage)}
						{#if i > 0}
							<span class="text-base-content/35" aria-hidden="true">→</span>
						{/if}
						<span class={i === target.user.signalJourney.length - 1
							? roleColorClass(stage)
							: 'text-base-content/65'}>
							{stage}
						</span>
					{/each}
				</p>
			</section>
		{/if}

		<!-- Scene chips — anthropological context. -->
		{#if target.user.scenes && target.user.scenes.length > 0}
			<div>
				<p class="text-[10px] uppercase tracking-widest text-base-content/45 mb-1.5">Listening circles</p>
				<div class="flex flex-wrap gap-1.5">
					{#each target.user.scenes as scene (scene)}
						<span class="text-[10px] px-2 py-0.5 rounded-full border border-accent/22 text-accent/72 bg-accent/5">
							{scene}
						</span>
					{/each}
				</div>
			</div>
		{/if}

		<!--
			Global novelty at the time of this scout's discovery — archival,
			contextual, not dominant. Tells the reader "how famous was the
			signal when this person found it."
		-->
		{#if target.user.noveltyTierAtDiscovery}
			<div class="pt-1.5">
				<p class="text-[10px] uppercase tracking-widest text-base-content/45 mb-1">Global novelty at that time</p>
				<p class="text-[12px] text-base-content/68 leading-snug">
					<span class="text-base-content/45">Global novelty:</span>
					{target.user.noveltyTierAtDiscovery}{#if typeof target.user.fameIndexAtDiscovery === 'number'} <span class="text-base-content/35">·</span> <span class="font-mono tabular-nums text-base-content/55">Fame Index {target.user.fameIndexAtDiscovery}</span>{/if}
				</p>
			</div>
		{/if}

		<!--
			WHY THIS MATTERS — editorial layer explaining the selected
			scout's contribution in human terms BEFORE the raw metrics
			below. Structured as ONE headline statement (the
			qualitative significance) plus up to three supporting
			bullets (the evidence). Selection logic lives in the
			`whyThisMatters` derived; visibility is gated by
			`whyHasContent`.

			Visual hierarchy:
			  • Headline gets `font-medium` + brighter alpha + a
			    larger line — slightly more weight than the bullets,
			    NOT a badge, NOT dramatically larger.
			  • Supporting bullets follow the same dot-style as
			    before, dimmed one alpha-step so the headline reads
			    as the primary line.

			Same `pt-4 border-t border-white/6` motif as the metrics
			block below it so the two read as paired sections in the
			inspector's lower half.
		-->
		{#if whyHasContent}
			<section class="pt-4 border-t border-white/6">
				<p class="text-[10px] uppercase tracking-widest text-base-content/45 mb-2.5">Why this matters</p>
				{#if whyThisMatters.headline}
					<!-- Headline — true headline treatment: a touch
					     larger than body copy, semibold, in the warm
					     "contribution" amber that already marks the
					     Successful Amplifier role title (oklch hue 60,
					     not the cyan brand accent). That distinguishes
					     the answer from links / accent decoration
					     elsewhere in the panel and gives it an
					     editorial, "this is the thing" feel.
					     `leading-tight` keeps the line set crisp; the
					     bullets below carry their own line-height. No
					     badge, no icon, no background, no underline. -->
					<p class={[
						'text-[15.5px] leading-tight font-semibold text-[oklch(0.86_0.12_60)]/94',
						whyThisMatters.supporting.length > 0 && 'mb-3',
					]}>
						{whyThisMatters.headline}
					</p>
				{/if}
				{#if whyThisMatters.supporting.length > 0}
					<ul class="space-y-1.5">
						{#each whyThisMatters.supporting as reason (reason)}
							<li class="text-[12.5px] leading-relaxed text-base-content/78 flex items-start gap-2">
								<span class="shrink-0 mt-1.75 w-1 h-1 rounded-full bg-accent/55" aria-hidden="true"></span>
								<span>{reason}</span>
							</li>
						{/each}
					</ul>
				{/if}
			</section>
		{/if}

		<!--
			Metrics block — reach + amplifications + depth + biggest
			subcascade + discovery score + joined-the-lineage. 2-column grid
			keeps it scannable instead of becoming an analytics table. The
			top border preserves the section break that used to live under
			the (now removed) "Impact" subtitle.
		-->
		<section class="pt-4 border-t border-white/6">
			<dl class="grid grid-cols-2 gap-x-4 gap-y-3">
				<div>
					<dt class="text-[10px] uppercase tracking-widest text-base-content/45">Branch reach</dt>
					<dd class="mt-1 text-[16px] font-semibold tabular-nums text-base-content/92">{target.user.branchSize}</dd>
					<dd class="text-[11px] text-base-content/52">scouts downstream</dd>
				</div>
				<div>
					<dt class="text-[10px] uppercase tracking-widest text-base-content/45">Amplifications</dt>
					<dd class="mt-1 text-[16px] font-semibold tabular-nums text-base-content/92">{target.user.amplifications}</dd>
					<dd class="text-[11px] text-base-content/52">forward shares</dd>
				</div>
				{#if typeof target.user.depthLevels === 'number'}
					<div>
						<dt class="text-[10px] uppercase tracking-widest text-base-content/45">Depth</dt>
						<dd class="mt-1 text-[13px] text-base-content/82 leading-snug">{target.user.depthLevels} {target.user.depthLevels === 1 ? 'level' : 'levels'}</dd>
					</div>
				{/if}
				{#if typeof target.user.discoveryScore === 'number'}
					<div>
						<dt class="text-[10px] uppercase tracking-widest text-base-content/45">Discovery score</dt>
						<dd class="mt-1 text-[13px] font-mono tabular-nums text-base-content/82 leading-snug">{target.user.discoveryScore.toFixed(1)}</dd>
					</div>
				{/if}
				{#if target.user.biggestSubcascadeName && target.user.biggestSubcascadeReach}
					<div class="col-span-2">
						<dt class="text-[10px] uppercase tracking-widest text-base-content/45">Biggest subcascade</dt>
						<dd class="mt-1 text-[13px] text-base-content/82 leading-snug">
							{target.user.biggestSubcascadeName}
							<span class="text-base-content/40 mx-1">→</span>
							<span class="font-mono tabular-nums">{target.user.biggestSubcascadeReach} people</span>
						</dd>
					</div>
				{/if}
				<div class="col-span-2">
					<dt class="text-[10px] uppercase tracking-widest text-base-content/45">First signal event</dt>
					<dd class="mt-1 text-[13px] text-base-content/82">{target.user.discoveredAgo}</dd>
				</div>
			</dl>
		</section>
		{/if}<!-- /isLineageContext else -->

	{/if}
</aside>
