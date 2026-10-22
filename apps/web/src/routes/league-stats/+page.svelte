<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	function formatPercentage(value: number) {
		return `${value.toFixed(1)}%`;
	}
</script>

<svelte:head>
	<title>Black Diamond · League stats</title>
	<meta name="description" content="Current-season league statistics for Black Diamond's selected leagues." />
</svelte:head>

<main class="min-h-screen bg-slate-100">
	<div class="mx-auto max-w-[1800px] px-3 py-4 sm:px-6 sm:py-6">
		<header class="mb-4 sm:mb-6">
			<p class="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
				Black Diamond · Current season
			</p>
			<h1 class="mt-0.5 text-xl font-semibold tracking-tight text-slate-950 sm:mt-1 sm:text-3xl">
				League stats
			</h1>
			<p class="mt-1 text-xs text-slate-600 sm:mt-2 sm:text-sm">
				Results from completed current-season fixtures.
			</p>
		</header>

		{#if data.leagueStats.length === 0}
			<section class="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
				<h2 class="text-lg font-semibold text-slate-950">No league stats yet</h2>
				<p class="mt-2 text-sm text-slate-600">
					Run the daily sync to calculate statistics for the selected leagues.
				</p>
			</section>
		{:else}
			<div class="space-y-2 sm:hidden">
				{#each data.leagueStats as stats (stats.league.id)}
					<article class="rounded-lg border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
						<header class="mb-2 flex items-baseline justify-between gap-3">
							<div class="min-w-0">
								<h2 class="truncate text-sm font-semibold text-slate-900">{stats.league.name}</h2>
								<p class="text-[10px] text-slate-500">{stats.league.country} · {stats.league.season}</p>
							</div>
						</header>
						<dl class="grid grid-cols-3 gap-x-2 gap-y-2 border-t border-slate-100 pt-2">
							<div><dt class="text-[9px] font-bold uppercase tracking-wide text-slate-500">Played</dt><dd class="text-xs font-semibold tabular-nums text-slate-900">{stats.fixturesPlayed}</dd></div>
							<div><dt class="text-[9px] font-bold uppercase tracking-wide text-slate-500">Goals</dt><dd class="text-xs font-semibold tabular-nums text-slate-900">{stats.goalsPerFixture.toFixed(2)}</dd></div>
							<div><dt class="text-[9px] font-bold uppercase tracking-wide text-slate-500">BTTS</dt><dd class="text-xs font-semibold tabular-nums text-slate-900">{formatPercentage(stats.bttsPercentage)}</dd></div>
							<div><dt class="text-[9px] font-bold uppercase tracking-wide text-slate-500">0–0</dt><dd class="text-xs font-semibold tabular-nums text-slate-900">{formatPercentage(stats.zeroZeroPercentage)}</dd></div>
							<div><dt class="text-[9px] font-bold uppercase tracking-wide text-slate-500">O2.5</dt><dd class="text-xs font-semibold tabular-nums text-slate-900">{formatPercentage(stats.over2_5Percentage)}</dd></div>
							<div><dt class="text-[9px] font-bold uppercase tracking-wide text-slate-500">O1.5</dt><dd class="text-xs font-semibold tabular-nums text-slate-700">{formatPercentage(stats.over1_5Percentage)}</dd></div>
							<div><dt class="text-[9px] font-bold uppercase tracking-wide text-slate-500">Home</dt><dd class="text-xs font-semibold tabular-nums text-slate-700">{formatPercentage(stats.homeWinPercentage)}</dd></div>
							<div><dt class="text-[9px] font-bold uppercase tracking-wide text-slate-500">Draw</dt><dd class="text-xs font-semibold tabular-nums text-slate-700">{formatPercentage(stats.drawPercentage)}</dd></div>
							<div><dt class="text-[9px] font-bold uppercase tracking-wide text-slate-500">Away</dt><dd class="text-xs font-semibold tabular-nums text-slate-700">{formatPercentage(stats.awayWinPercentage)}</dd></div>
						</dl>
					</article>
				{/each}
			</div>

			<div class="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm sm:block">
				<table class="min-w-[840px] w-full text-left text-xs">
					<thead class="border-b border-slate-200 bg-slate-50 text-[9px] font-bold uppercase tracking-wide text-slate-500">
						<tr>
							<th scope="col" class="px-3 py-2">League</th>
							<th scope="col" class="px-2 py-2 text-right">Played</th>
							<th scope="col" class="px-2 py-2 text-right">Goals / game</th>
							<th scope="col" class="px-2 py-2 text-right">BTTS</th>
							<th scope="col" class="px-2 py-2 text-right">0–0</th>
							<th scope="col" class="px-2 py-2 text-right">Over 1.5</th>
							<th scope="col" class="px-2 py-2 text-right">Over 2.5</th>
							<th scope="col" class="px-2 py-2 text-right">Home win</th>
							<th scope="col" class="px-2 py-2 text-right">Draw</th>
							<th scope="col" class="px-2 py-2 text-right">Away win</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-100">
						{#each data.leagueStats as stats (stats.league.id)}
							<tr class="hover:bg-slate-50">
								<th scope="row" class="px-3 py-2 font-medium text-slate-900">
									<p>{stats.league.name}</p>
									<p class="mt-0.5 text-xs font-normal text-slate-500">
										{stats.league.country} · {stats.league.season}
									</p>
								</th>
								<td class="px-2 py-2 text-right tabular-nums text-slate-700">{stats.fixturesPlayed}</td>
								<td class="px-2 py-2 text-right font-semibold tabular-nums text-slate-900">{stats.goalsPerFixture.toFixed(2)}</td>
								<td class="px-2 py-2 text-right tabular-nums text-slate-700">{formatPercentage(stats.bttsPercentage)}</td>
								<td class="px-2 py-2 text-right tabular-nums text-slate-700">{formatPercentage(stats.zeroZeroPercentage)}</td>
								<td class="px-2 py-2 text-right tabular-nums text-slate-700">{formatPercentage(stats.over1_5Percentage)}</td>
								<td class="px-2 py-2 text-right tabular-nums text-slate-700">{formatPercentage(stats.over2_5Percentage)}</td>
								<td class="px-2 py-2 text-right tabular-nums text-slate-700">{formatPercentage(stats.homeWinPercentage)}</td>
								<td class="px-2 py-2 text-right tabular-nums text-slate-700">{formatPercentage(stats.drawPercentage)}</td>
								<td class="px-2 py-2 text-right tabular-nums text-slate-700">{formatPercentage(stats.awayWinPercentage)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</main>
