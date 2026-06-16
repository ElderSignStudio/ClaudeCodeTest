<script lang="ts">
	import { ExternalLink } from 'lucide-svelte';
	import type { UserDetail } from '$lib/mock/users';
	import type { UserSignalTree } from '$lib/mock/userSignalTree';
	import {
		buildUnifiedForest,
		resolveSelection,
		totalDownstreamFromForest,
		averageBranchSize,
		strongestSignalInTree,
		topAmplifier,
		deepestBranchDepth,
		countDescendants,
		directChildrenCount,
		trustBullets,
		signalContextBullets,
		scoutContextBullets,
		liveStatusChipClass,
	} from './inspectorData';

	/*
		Right-side inspector for the User Detail page's Signal Tree.

		Four editorial states, switched purely on the resolved
		selection (no DOM detection — `resolveSelection()` maps the
		selected id to one of: none / origin / signal / scout):

		  - NONE   → Scout Summary (default state)
		  - ORIGIN → Origin Scout (page owner is selected in his tree)
		  - SIGNAL → Signal Inspector (item node selected)
		  - SCOUT  → Scout Inspector (downstream user node selected)

		Forest construction matches UserSignalTree exactly (shared
		`buildUnifiedForest` in `inspectorData.ts`) — so scout ids
		emitted from the tree resolve cleanly here without DOM
		coupling.
	*/

	let {
		user,
		tree,
		selectedNodeId,
	}: {
		user: UserDetail;
		tree: UserSignalTree;
		selectedNodeId: string | null;
	} = $props();

	const forest = $derived(buildUnifiedForest(tree));
	const selection = $derived(resolveSelection(tree, forest, selectedNodeId));

	const summary = $derived({
		signalsSparked: tree.root.children.length,
		totalDownstream: totalDownstreamFromForest(forest),
		avgBranch: averageBranchSize(forest),
		strongest: strongestSignalInTree(tree),
		bullets: trustBullets(user, tree),
	});

	function formatPercent(n: number): string {
		return `${Math.round(n)}%`;
	}
</script>

<aside class="flex flex-col gap-5">

	<!-- Eyebrow — label switches by selection state. Accent dot also
	     switches colour so role change is felt before it's read. -->
	<div class="flex items-center gap-2 px-1">
		{#if selection.kind === 'none'}
			<span class="w-0.5 h-3.5 rounded-full bg-secondary/55" aria-hidden="true"></span>
			<p class="text-[11px] font-semibold uppercase tracking-widest text-base-content/68">Scout summary</p>
		{:else if selection.kind === 'origin'}
			<span class="w-0.5 h-3.5 rounded-full bg-primary/65" aria-hidden="true"></span>
			<p class="text-[11px] font-semibold uppercase tracking-widest text-base-content/68">Origin scout</p>
		{:else if selection.kind === 'signal'}
			<span class="w-0.5 h-3.5 rounded-full bg-[oklch(0.86_0.12_60)]/65" aria-hidden="true"></span>
			<p class="text-[11px] font-semibold uppercase tracking-widest text-base-content/68">Signal inspector</p>
		{:else}
			<span class="w-0.5 h-3.5 rounded-full bg-accent/65" aria-hidden="true"></span>
			<p class="text-[11px] font-semibold uppercase tracking-widest text-base-content/68">Scout inspector</p>
		{/if}
	</div>

	{#if selection.kind === 'none'}
		<!-- ─────────────────── SCOUT SUMMARY (default) ─────────────────── -->

		<div class="flex items-start gap-3">
			<span class="shrink-0 w-12 h-12 rounded-full border border-primary/30 overflow-hidden">
				<img src={tree.root.avatar} alt="" class="w-full h-full object-cover" />
			</span>
			<div class="min-w-0 flex-1">
				<p class="text-[16px] font-semibold text-base-content/95 leading-snug truncate">{tree.root.name}</p>
				<p class="text-[11.5px] text-base-content/60 leading-snug">{tree.root.role}</p>
				<p class="mt-0.5 text-[10.5px] uppercase tracking-widest text-base-content/45">
					Scout score
					<span class="ml-1 tabular-nums font-semibold text-[oklch(0.86_0.12_60)]/90">{user.discoveryScore}</span>
				</p>
			</div>
		</div>

		<p class="text-[13px] leading-relaxed text-base-content/78 italic">
			“{user.bio}”
		</p>

		<dl class="grid grid-cols-2 gap-x-4 gap-y-3 pt-2 border-t border-white/6">
			<div>
				<dt class="text-[10px] uppercase tracking-widest text-base-content/45">Signals sparked</dt>
				<dd class="mt-1 text-[16px] font-semibold tabular-nums text-base-content/92">{summary.signalsSparked}</dd>
			</div>
			<div>
				<dt class="text-[10px] uppercase tracking-widest text-base-content/45">Total downstream</dt>
				<dd class="mt-1 text-[16px] font-semibold tabular-nums text-base-content/92">{summary.totalDownstream}</dd>
				<dd class="text-[11px] text-base-content/52">listeners reached</dd>
			</div>
			<div>
				<dt class="text-[10px] uppercase tracking-widest text-base-content/45">Avg branch</dt>
				<dd class="mt-1 text-[16px] font-semibold tabular-nums text-base-content/92">{summary.avgBranch}</dd>
				<dd class="text-[11px] text-base-content/52">scouts per signal</dd>
			</div>
			<div>
				<dt class="text-[10px] uppercase tracking-widest text-base-content/45">Hit rate</dt>
				<dd class="mt-1 text-[16px] font-semibold tabular-nums text-base-content/92">{formatPercent(user.hitRate)}</dd>
				<dd class="text-[11px] text-base-content/52">seeds that propagated</dd>
			</div>
		</dl>

		{#if summary.strongest}
			{@const s = summary.strongest}
			<section class="pt-2 border-t border-white/6">
				<p class="text-[10px] uppercase tracking-widest text-base-content/45 mb-2">Strongest signal</p>
				<a href="/items/{s.itemId}" class="group inline-flex items-center gap-2.5">
					<span class="shrink-0 w-10 h-10 rounded-md border border-white/10 overflow-hidden bg-white/5">
						{#if s.coverArt}
							<img src={s.coverArt} alt="" class="w-full h-full object-cover" />
						{/if}
					</span>
					<span class="flex flex-col leading-snug">
						<span class="flex items-baseline gap-1.5 text-[13.5px] font-semibold text-accent/92 group-hover:text-accent transition-colors">
							{s.title}
							<ExternalLink size={10} class="opacity-50 group-hover:opacity-90 transition-opacity -translate-y-px" />
						</span>
						<span class="text-[11.5px] text-base-content/60">
							{s.artist}
							<span class="ml-1.5 text-[oklch(0.86_0.12_60)]/85 font-semibold tabular-nums">+{s.impact}</span>
						</span>
					</span>
				</a>
			</section>
		{/if}

		{#if user.sceneFootprint.length > 0}
			<section class="pt-2 border-t border-white/6">
				<p class="text-[10px] uppercase tracking-widest text-base-content/45 mb-2">Primary scenes</p>
				<ul class="flex flex-col gap-1">
					{#each user.sceneFootprint.slice(0, 3) as scene (scene.name)}
						<li class="flex items-baseline gap-2 text-[12.5px] text-base-content/75">
							<span class="flex-1 truncate">{scene.name}</span>
							<span class="tabular-nums text-base-content/52">{formatPercent(scene.percent)}</span>
						</li>
					{/each}
				</ul>
			</section>
		{/if}

		{#if summary.bullets.length > 0}
			<section class="pt-2 border-t border-white/6">
				<p class="text-[10px] uppercase tracking-widest text-base-content/45 mb-2">Why follow</p>
				<ul class="flex flex-col gap-1.5">
					{#each summary.bullets as line (line)}
						<li class="flex items-start gap-2 text-[12.5px] leading-snug text-base-content/72">
							<span class="shrink-0 mt-1.5 w-1 h-1 rounded-full bg-base-content/35"></span>
							<span>{line}</span>
						</li>
					{/each}
				</ul>
			</section>
		{/if}

	{:else if selection.kind === 'origin'}
		<!-- ─────────────────── ORIGIN SCOUT ─────────────────── -->

		<div class="flex items-start gap-3">
			<span class="shrink-0 w-12 h-12 rounded-full border border-primary/40 overflow-hidden">
				<img src={tree.root.avatar} alt="" class="w-full h-full object-cover" />
			</span>
			<div class="min-w-0 flex-1">
				<p class="text-[16px] font-semibold text-primary/95 leading-snug truncate">{tree.root.name}</p>
				<p class="text-[11.5px] text-base-content/60 leading-snug">{tree.root.role}</p>
			</div>
		</div>

		<p class="text-[13px] leading-relaxed text-base-content/80">
			This is the origin scout for this tree — every signal and listener below traces back to {tree.root.name}.
		</p>

		<dl class="grid grid-cols-2 gap-x-4 gap-y-3 pt-2 border-t border-white/6">
			<div>
				<dt class="text-[10px] uppercase tracking-widest text-base-content/45">Signals sparked</dt>
				<dd class="mt-1 text-[16px] font-semibold tabular-nums text-base-content/92">{summary.signalsSparked}</dd>
			</div>
			<div>
				<dt class="text-[10px] uppercase tracking-widest text-base-content/45">Total reach</dt>
				<dd class="mt-1 text-[16px] font-semibold tabular-nums text-base-content/92">{summary.totalDownstream}</dd>
				<dd class="text-[11px] text-base-content/52">scouts downstream</dd>
			</div>
			<div>
				<dt class="text-[10px] uppercase tracking-widest text-base-content/45">Discovery score</dt>
				<dd class="mt-1 text-[16px] font-semibold tabular-nums text-[oklch(0.86_0.12_60)]/92">{user.discoveryScore}<span class="text-base-content/40 text-[11px] font-normal">/100</span></dd>
			</div>
			<div>
				<dt class="text-[10px] uppercase tracking-widest text-base-content/45">Hit rate</dt>
				<dd class="mt-1 text-[16px] font-semibold tabular-nums text-base-content/92">{formatPercent(user.hitRate)}</dd>
			</div>
		</dl>

		{#if tree.root.children.length > 0}
			<section class="pt-2 border-t border-white/6">
				<p class="text-[10px] uppercase tracking-widest text-base-content/45 mb-2">Sparked signals</p>
				<ul class="flex flex-col gap-1.5">
					{#each [...tree.root.children].sort((a, b) => b.impact - a.impact) as s (s.itemId)}
						<li>
							<a href="/items/{s.itemId}" class="group flex items-baseline gap-2 text-[12.5px] leading-snug">
								<span class="flex-1 truncate text-accent/82 group-hover:text-accent transition-colors">{s.title}</span>
								<span class="text-base-content/35 font-normal">—</span>
								<span class="truncate text-base-content/60">{s.artist}</span>
								<span class="tabular-nums text-[oklch(0.86_0.12_60)]/85 font-semibold">+{s.impact}</span>
							</a>
						</li>
					{/each}
				</ul>
			</section>
		{/if}

	{:else if selection.kind === 'signal'}
		<!-- ─────────────────── SIGNAL INSPECTOR ─────────────────── -->

		{@const s = selection.signal}
		{@const node = selection.forestNode}
		{@const top = topAmplifier(node)}
		{@const depth = deepestBranchDepth(node)}
		{@const ctx = signalContextBullets(s, node)}

		<div class="flex items-start gap-3">
			<span class="shrink-0 w-13 h-13 rounded-md border border-white/12 overflow-hidden bg-white/5">
				{#if s.coverArt}
					<img src={s.coverArt} alt="" class="w-full h-full object-cover" />
				{/if}
			</span>
			<div class="min-w-0 flex-1">
				<p class="text-[16px] font-semibold text-base-content/95 leading-snug truncate">{s.title}</p>
				<p class="text-[12.5px] text-base-content/65 leading-snug truncate">{s.artist}</p>
				<div class="mt-1 flex items-center gap-1.5 flex-wrap">
					<span class="text-[11px] font-semibold tabular-nums text-[oklch(0.92_0.13_60)] bg-[oklch(0.86_0.12_60)]/16 border border-[oklch(0.86_0.12_60)]/45 px-1.5 py-0.5 rounded-full leading-none">
						+{s.impact}
					</span>
					<span class={[
						'text-[10px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded-full border',
						liveStatusChipClass(s.status),
					]}>
						{s.status}
					</span>
				</div>
			</div>
		</div>

		<dl class="grid grid-cols-2 gap-x-4 gap-y-3 pt-2 border-t border-white/6">
			<div>
				<dt class="text-[10px] uppercase tracking-widest text-base-content/45">Listeners</dt>
				<dd class="mt-1 text-[16px] font-semibold tabular-nums text-base-content/92">{s.listeners}</dd>
				<dd class="text-[11px] text-base-content/52">total reach</dd>
			</div>
			<div>
				<dt class="text-[10px] uppercase tracking-widest text-base-content/45">Generations</dt>
				<dd class="mt-1 text-[16px] font-semibold tabular-nums text-base-content/92">{s.generations}</dd>
			</div>
			<div>
				<dt class="text-[10px] uppercase tracking-widest text-base-content/45">Deepest branch</dt>
				<dd class="mt-1 text-[16px] font-semibold tabular-nums text-base-content/92">{depth}</dd>
				<dd class="text-[11px] text-base-content/52">edges from signal</dd>
			</div>
			<div>
				<dt class="text-[10px] uppercase tracking-widest text-base-content/45">Direct branches</dt>
				<dd class="mt-1 text-[16px] font-semibold tabular-nums text-base-content/92">{node.children.length}</dd>
			</div>
		</dl>

		<section class="pt-2 border-t border-white/6 space-y-2">
			<div class="flex items-baseline gap-2">
				<p class="text-[10px] uppercase tracking-widest text-base-content/45 shrink-0">Sparked by</p>
				<p class="text-[12.5px] text-base-content/82 truncate">{tree.root.name}</p>
			</div>
			{#if top}
				<div class="flex items-baseline gap-2">
					<p class="text-[10px] uppercase tracking-widest text-base-content/45 shrink-0">Top amplifier</p>
					<p class="text-[12.5px] text-base-content/82 truncate">
						{top.name}
						<span class="ml-1 tabular-nums text-[oklch(0.86_0.12_60)]/85 font-semibold">+{countDescendants(top)}</span>
					</p>
				</div>
			{/if}
		</section>

		{#if s.tags.length > 0}
			<section class="pt-2 border-t border-white/6">
				<p class="text-[10px] uppercase tracking-widest text-base-content/45 mb-2">Scenes</p>
				<div class="flex flex-wrap gap-1.5">
					{#each s.tags as tag (tag)}
						<span class="text-[11px] px-2 py-0.5 rounded-full border border-accent/22 text-accent/72 bg-accent/5">
							{tag}
						</span>
					{/each}
				</div>
			</section>
		{/if}

		{#if ctx.length > 0}
			<section class="pt-2 border-t border-white/6">
				<p class="text-[10px] uppercase tracking-widest text-base-content/45 mb-2">Why this matters</p>
				<ul class="flex flex-col gap-1.5">
					{#each ctx as line (line)}
						<li class="flex items-start gap-2 text-[12.5px] leading-snug text-base-content/72">
							<span class="shrink-0 mt-1.5 w-1 h-1 rounded-full bg-base-content/35"></span>
							<span>{line}</span>
						</li>
					{/each}
				</ul>
			</section>
		{/if}

		<section class="pt-3 border-t border-white/6">
			<a
				href="/items/{s.itemId}"
				class="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-accent/88 hover:text-accent transition-colors"
			>
				Open signal detail
				<ExternalLink size={11} class="opacity-60" />
			</a>
		</section>

	{:else}
		<!-- ─────────────────── SCOUT INSPECTOR ─────────────────── -->

		{@const sc = selection.scout}
		{@const parent = selection.parentSignal}
		{@const direct = directChildrenCount(sc)}
		{@const total = countDescendants(sc)}
		{@const bullets = scoutContextBullets(sc, parent)}

		<div class="flex items-start gap-3">
			<span class="shrink-0 w-12 h-12 rounded-full border border-white/14 overflow-hidden bg-white/5">
				<img src={sc.avatar} alt="" class="w-full h-full object-cover" />
			</span>
			<div class="min-w-0 flex-1">
				<p class="text-[16px] font-semibold text-base-content/95 leading-snug truncate">{sc.name}</p>
				{#if sc.character}
					<p class="text-[11.5px] text-base-content/60 leading-snug">{sc.character}</p>
				{/if}
				{#if total > 0}
					<p class="mt-0.5 text-[10.5px] uppercase tracking-widest text-base-content/45">
						Downstream reach
						<span class="ml-1 tabular-nums font-semibold text-[oklch(0.86_0.12_60)]/90">+{total}</span>
					</p>
				{/if}
			</div>
		</div>

		<section class="pt-2 border-t border-white/6 space-y-2">
			<div class="flex items-baseline gap-2">
				<p class="text-[10px] uppercase tracking-widest text-base-content/45 shrink-0">Discovered through</p>
				<a
					href="/items/{parent.itemId}"
					class="text-[12.5px] text-accent/85 hover:text-accent transition-colors truncate"
				>
					{parent.title}
				</a>
			</div>
			<div class="flex items-baseline gap-2">
				<p class="text-[10px] uppercase tracking-widest text-base-content/45 shrink-0">Amplified from</p>
				<p class="text-[12.5px] text-base-content/82 truncate">
					{tree.root.name}'s signal
				</p>
			</div>
		</section>

		<dl class="grid grid-cols-2 gap-x-4 gap-y-3 pt-2 border-t border-white/6">
			<div>
				<dt class="text-[10px] uppercase tracking-widest text-base-content/45">Direct listeners</dt>
				<dd class="mt-1 text-[16px] font-semibold tabular-nums text-base-content/92">{direct}</dd>
			</div>
			<div>
				<dt class="text-[10px] uppercase tracking-widest text-base-content/45">Downstream reach</dt>
				<dd class="mt-1 text-[16px] font-semibold tabular-nums text-base-content/92">{total}</dd>
				<dd class="text-[11px] text-base-content/52">total below</dd>
			</div>
			<div>
				<dt class="text-[10px] uppercase tracking-widest text-base-content/45">Depth from {tree.root.name}</dt>
				<dd class="mt-1 text-[16px] font-semibold tabular-nums text-base-content/92">{selection.depth}</dd>
				<dd class="text-[11px] text-base-content/52">edges from origin</dd>
			</div>
			<div>
				<dt class="text-[10px] uppercase tracking-widest text-base-content/45">Branch role</dt>
				<dd class="mt-1 text-[12.5px] text-base-content/82 leading-snug">{sc.character ?? 'Listener'}</dd>
			</div>
		</dl>

		{#if bullets.length > 0}
			<section class="pt-2 border-t border-white/6">
				<p class="text-[10px] uppercase tracking-widest text-base-content/45 mb-2">Why this matters</p>
				<ul class="flex flex-col gap-1.5">
					{#each bullets as line (line)}
						<li class="flex items-start gap-2 text-[12.5px] leading-snug text-base-content/72">
							<span class="shrink-0 mt-1.5 w-1 h-1 rounded-full bg-base-content/35"></span>
							<span>{line}</span>
						</li>
					{/each}
				</ul>
			</section>
		{/if}

		<section class="pt-3 border-t border-white/6">
			<a
				href="/users/{sc.id}"
				class="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-accent/88 hover:text-accent transition-colors"
			>
				Open scout profile
				<ExternalLink size={11} class="opacity-60" />
			</a>
		</section>
	{/if}

</aside>
