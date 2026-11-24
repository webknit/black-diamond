<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	function evidenceLabel(scope: 'teamFiltered' | 'leagueAndTeam' | 'leagueOnly', baseOnly: boolean) {
		if (baseOnly) return 'Research only';
		if (scope === 'leagueAndTeam') return 'League + team form';
		if (scope === 'leagueOnly') return 'League trend';
		return 'Team form';
	}
</script>

<svelte:head>
	<title>Black Diamond · All strategies</title>
	<meta name="description" content="Every strategy currently assessed by Black Diamond." />
</svelte:head>

<main class="min-h-screen bg-slate-100">
	<div class="mx-auto max-w-6xl px-3 py-4 sm:px-6 sm:py-6">
		<header class="mb-5 sm:mb-7">
			<p class="text-[10px] font-bold uppercase tracking-wide text-slate-500">Strategy catalogue</p>
			<h1 class="mt-1 text-xl font-semibold tracking-tight text-slate-950 sm:text-3xl">All strategies in play</h1>
			<p class="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
				Every rule currently evaluated against historical fixtures. All fixture-based strategies require each team to have at least five previous matches; home form uses home matches and away form uses away matches.
			</p>
		</header>

		<div class="space-y-3">
			{#each data.markets as group (group.market)}
				<details class="group rounded-xl border border-slate-200 bg-white shadow-sm">
					<summary class="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 marker:content-none">
						<div class="flex items-center gap-2">
							<svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" class="size-4 text-slate-500 transition-transform group-open:rotate-90"><path d="m7.5 4.5 5 5-5 5" /></svg>
							<h2 class="text-base font-semibold text-slate-950">{group.label}</h2>
						</div>
						<span class="text-xs tabular-nums text-slate-500">{group.strategies.length} strategies</span>
					</summary>
					<ul class="divide-y divide-slate-100">
						{#each group.strategies as strategy (strategy.id)}
							<li class="px-4 py-3">
								<div class="flex items-start justify-between gap-3">
									<a class="text-sm font-medium text-slate-950 hover:underline" href={`/strategies/${strategy.market.replaceAll('_', '-')}/${strategy.id}`}>
										{strategy.title.replace(`${group.label} · `, '')}
									</a>
									<span class="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
										{evidenceLabel(strategy.evidenceScope, strategy.baseOnly)}
									</span>
								</div>
								<p class="mt-1 text-xs leading-5 text-slate-600">{strategy.description.replace(`Bet: ${group.label}. `, '')}</p>
							</li>
						{/each}
					</ul>
				</details>
			{/each}
		</div>

		<p class="mt-4 text-xs leading-5 text-slate-500">
			“Research only” rules are retained for historical analysis but are not shown as BotD recommendations because they do not use a team-specific filter.
		</p>
	</div>
</main>
