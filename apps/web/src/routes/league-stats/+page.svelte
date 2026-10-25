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
			<h1 class="text-xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
				League stats
			</h1>
			<p class="mt-1 text-xs text-slate-600 sm:mt-2 sm:text-sm">
				Cumulative results through each league’s latest round.
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
			<div class="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
				<table class="min-w-[720px] w-full text-left text-xs">
					<thead class="border-b border-slate-200 bg-slate-50 text-[9px] font-bold uppercase tracking-wide text-slate-500">
						<tr>
							<th scope="col" class="sticky left-0 z-20 min-w-32 border-r border-slate-200 bg-slate-50 px-2 py-2 shadow-[3px_0_5px_-4px_rgba(15,23,42,0.45)]">League</th>
							<th scope="col" class="px-2 py-2">Through</th>
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
							<tr class="group hover:bg-slate-50">
								<th scope="row" class="sticky left-0 z-10 min-w-32 border-r border-slate-100 bg-white px-2 py-2 font-medium text-slate-900 shadow-[3px_0_5px_-4px_rgba(15,23,42,0.45)] group-hover:bg-slate-50">
									<p class="truncate">{stats.league.name}</p>
									<p class="mt-0.5 truncate text-xs font-normal text-slate-500">
										{stats.league.country} · {stats.league.season}
									</p>
								</th>
								<td class="whitespace-nowrap px-2 py-2 text-slate-700">{stats.round}</td>
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
