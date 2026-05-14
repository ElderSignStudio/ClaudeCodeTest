<script lang="ts">
	import type { PropagationForest, PreviewTarget } from '$lib/mock/propagation';
	import { findParentInForest } from '$lib/mock/propagation';

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
	}: {
		forest: PropagationForest;
		target: PreviewTarget | null;
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
</script>

<aside class="flex flex-col gap-5">

	<!-- Eyebrow — switches label between global / branch / cluster context -->
	<div class="flex items-center gap-2 px-1">
		{#if !target}
			<span class="w-0.5 h-3.5 rounded-full bg-secondary/55" aria-hidden="true"></span>
			<p class="text-[11px] font-semibold uppercase tracking-widest text-base-content/68">Cultural lineage</p>
		{:else if target.kind === 'cluster'}
			<span class="w-0.5 h-3.5 rounded-full bg-base-content/40" aria-hidden="true"></span>
			<p class="text-[11px] font-semibold uppercase tracking-widest text-base-content/68">Cluster context</p>
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
					<dt class="text-[10px] uppercase tracking-widest text-base-content/45">Joined the lineage</dt>
					<dd class="mt-1 text-[13px] text-base-content/82">{target.user.discoveredAgo}</dd>
				</div>
			</dl>
		</section>

	{/if}
</aside>
