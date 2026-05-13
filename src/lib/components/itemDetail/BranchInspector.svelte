<script lang="ts">
	import type { PropagationForest, PropagationUser } from '$lib/mock/propagation';

	/*
		Right-pane (or below-tree on mobile) inspector. Two states:

		- GLOBAL (no user selected): item-level propagation summary, origins,
		  weighted impact, narrative one-liner, per-branch summaries.

		- USER (a user is selected in the tree): selected user's identity,
		  branch character, downstream reach, amplification behavior.

		Anonymous stub users (created when a "+N more" tail is expanded) get a
		minimal anonymized state — explicit acknowledgement that we don't have
		individual reach data at this depth.

		Visually: archival/editorial. Small editorial labels, mono-tabular
		numbers, no big charts, no progress bars, no big percentage gauges.
	*/

	let {
		forest,
		selectedUser,
	}: {
		forest: PropagationForest;
		selectedUser: PropagationUser | null;
	} = $props();

	const isAnonymousStub = $derived(
		selectedUser !== null && selectedUser.avatar === ''
	);
</script>

<aside class="flex flex-col gap-5">

	<!-- Eyebrow — switches label between global / branch context -->
	<div class="flex items-center gap-2 px-1">
		<span class={['w-0.5 h-3.5 rounded-full', selectedUser ? 'bg-accent/65' : 'bg-secondary/55']} aria-hidden="true"></span>
		<p class="text-[11px] font-semibold uppercase tracking-widest text-base-content/68">
			{selectedUser ? 'Branch context' : 'Global propagation'}
		</p>
	</div>

	{#if !selectedUser}
		<!-- ─────────────────────── GLOBAL STATE ─────────────────────── -->

		<!-- Narrative one-liner — the editorial anchor of the global view. -->
		<p class="text-[14px] leading-relaxed text-base-content/82">
			{forest.summary}
		</p>

		<!-- Quiet numeric block — mono-tabular, no charts, no bars. -->
		<dl class="grid grid-cols-2 gap-x-4 gap-y-3 pt-2 border-t border-white/6">
			<div>
				<dt class="text-[10px] uppercase tracking-widest text-base-content/45">Total reach</dt>
				<dd class="mt-1 text-[16px] font-semibold tabular-nums text-base-content/92">{forest.totalReach}</dd>
				<dd class="text-[11px] text-base-content/52">scouts touched</dd>
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

	{:else if isAnonymousStub}
		<!-- ─────────────────────── ANONYMOUS STUB ─────────────────────── -->

		<div class="flex items-center gap-3">
			<div class="w-11 h-11 rounded-full bg-base-content/12 border border-white/14"></div>
			<div>
				<p class="text-[14px] font-bold text-base-content/82">Anonymous listener</p>
				<p class="text-[11px] text-base-content/52">{selectedUser.character}</p>
			</div>
		</div>

		<p class="text-[13px] leading-relaxed text-base-content/60 italic">
			{selectedUser.behaviorNote}
		</p>

	{:else}
		<!-- ─────────────────────── USER STATE ─────────────────────── -->

		<!-- Identity row -->
		<div class="flex items-center gap-3">
			<div class="w-11 h-11 rounded-full overflow-hidden border border-accent/45">
				<img src={selectedUser.avatar} alt="" class="w-full h-full object-cover" />
			</div>
			<div class="min-w-0">
				<p class="text-[15px] font-bold text-base-content/95 truncate">{selectedUser.name}</p>
				<p class="text-[12px] text-accent/72 truncate">{selectedUser.character}</p>
			</div>
		</div>

		<!-- Behavior note — one editorial sentence. -->
		{#if selectedUser.behaviorNote}
			<p class="text-[13px] leading-relaxed text-base-content/74">
				{selectedUser.behaviorNote}
			</p>
		{/if}

		<!-- Quiet numeric block -->
		<dl class="grid grid-cols-2 gap-x-4 gap-y-3 pt-2 border-t border-white/6">
			<div>
				<dt class="text-[10px] uppercase tracking-widest text-base-content/45">Branch reach</dt>
				<dd class="mt-1 text-[16px] font-semibold tabular-nums text-base-content/92">{selectedUser.branchSize}</dd>
				<dd class="text-[11px] text-base-content/52">scouts downstream</dd>
			</div>
			<div>
				<dt class="text-[10px] uppercase tracking-widest text-base-content/45">Amplifications</dt>
				<dd class="mt-1 text-[16px] font-semibold tabular-nums text-base-content/92">{selectedUser.amplifications}</dd>
				<dd class="text-[11px] text-base-content/52">forward shares</dd>
			</div>
			<div class="col-span-2">
				<dt class="text-[10px] uppercase tracking-widest text-base-content/45">Joined the lineage</dt>
				<dd class="mt-1 text-[13px] text-base-content/82">{selectedUser.discoveredAgo}</dd>
			</div>
		</dl>

	{/if}
</aside>
