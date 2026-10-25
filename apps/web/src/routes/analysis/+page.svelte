<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	function formatPercentage(value: number | null) {
		return value === null ? '—' : `${value.toFixed(1)}%`;
	}

	function formatDate(date: string) {
		return new Intl.DateTimeFormat('en-GB', {
			day: '2-digit',
			month: 'short',
			year: 'numeric',
			timeZone: 'Europe/London'
		}).format(new Date(date));
	}
</script>

<svelte:head>
	<title>Black Diamond · Over 2.5 analysis</title>
	<meta name="description" content="Pre-match Over 2.5 analysis across Black Diamond's selected leagues." />
</svelte:head>

<main class="min-h-screen bg-slate-100">
	<div class="mx-auto max-w-[1800px] px-3 py-4 sm:px-6 sm:py-6">
		<header class="mb-4 flex flex-wrap items-end justify-between gap-3 sm:mb-6">
			<div>
				<h1 class="text-xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Over 2.5 analysis</h1>
				<p class="mt-1 text-xs text-slate-600 sm:mt-2 sm:text-sm">
					Completed fixtures using only the data captured before kickoff.
				</p>
			</div>
			<form method="GET">
				<label class="block text-[10px] font-bold uppercase tracking-wide text-slate-500" for="league">League</label>
				<select
					class="mt-1 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-800"
					id="league"
					name="league"
					onchange={(event) => event.currentTarget.form?.requestSubmit()}
				>
					<option value="">All selected leagues</option>
					{#each data.availableLeagues as league (league.id)}
						<option value={league.id} selected={league.id === data.selectedLeagueId}>
							{league.country} · {league.name}
						</option>
					{/each}
				</select>
			</form>
		</header>

		<section class="mb-4 grid gap-2 sm:mb-6 sm:grid-cols-3">
			<div class="rounded-lg border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
				<p class="text-[10px] font-bold uppercase tracking-wide text-slate-500">Fixtures analysed</p>
				<p class="mt-1 text-lg font-semibold tabular-nums text-slate-950">{data.summary.fixtures}</p>
			</div>
			<div class="rounded-lg border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
				<p class="text-[10px] font-bold uppercase tracking-wide text-slate-500">Overall Over 2.5</p>
				<p class="mt-1 text-lg font-semibold tabular-nums text-slate-950">
					{formatPercentage(data.summary.over2_5Percentage)}
				</p>
			</div>
			<div class="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 shadow-sm">
				<p class="text-[10px] font-bold uppercase tracking-wide text-emerald-700">Both teams above league average</p>
				<p class="mt-1 text-lg font-semibold tabular-nums text-emerald-950">
					{formatPercentage(data.summary.bothAboveLeagueAveragePercentage)}
				</p>
				<p class="text-[10px] text-emerald-800">{data.summary.bothAboveLeagueAverageFixtures} fixtures</p>
			</div>
		</section>

		{#if data.analyses.length === 0}
			<section class="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
				<h2 class="text-lg font-semibold text-slate-950">No analysed fixtures yet</h2>
				<p class="mt-2 text-sm text-slate-600">
					Run the fixture snapshot backfill after syncing completed fixtures.
				</p>
			</section>
		{:else}
			<div class="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
				<table class="min-w-[1020px] w-full text-left text-xs">
					<thead class="border-b border-slate-200 bg-slate-50 text-[9px] font-bold uppercase tracking-wide text-slate-500">
						<tr>
							<th scope="col" class="sticky left-0 z-20 min-w-52 border-r border-slate-200 bg-slate-50 px-2 py-2 shadow-[3px_0_5px_-4px_rgba(15,23,42,0.45)]">Fixture</th>
							<th scope="col" class="px-2 py-2 text-right">Score</th>
							<th scope="col" class="px-2 py-2 text-right">Over 2.5</th>
							<th scope="col" class="px-2 py-2 text-right">League O2.5<br />before match</th>
							<th scope="col" class="px-2 py-2 text-right">Home O2.5<br />all matches</th>
							<th scope="col" class="px-2 py-2 text-right">Home O2.5<br />last 5</th>
							<th scope="col" class="px-2 py-2 text-right">Away O2.5<br />all matches</th>
							<th scope="col" class="px-2 py-2 text-right">Away O2.5<br />last 5</th>
							<th scope="col" class="px-2 py-2 text-center">Both above<br />league average</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-100">
						{#each data.analyses as analysis (analysis.fixtureId)}
							<tr class="group hover:bg-slate-50">
								<th scope="row" class="sticky left-0 z-10 min-w-52 border-r border-slate-100 bg-white px-2 py-2 font-medium text-slate-900 shadow-[3px_0_5px_-4px_rgba(15,23,42,0.45)] group-hover:bg-slate-50">
									<p class="truncate">{analysis.homeTeam} <span class="font-normal text-slate-500">v</span> {analysis.awayTeam}</p>
									<p class="mt-0.5 truncate text-[10px] font-normal text-slate-500">
										{formatDate(analysis.date)} · {analysis.league.country} · {analysis.league.name}
									</p>
								</th>
								<td class="px-2 py-2 text-right font-medium tabular-nums text-slate-900">{analysis.homeGoals}–{analysis.awayGoals}</td>
								<td class="px-2 py-2 text-right font-semibold tabular-nums" class:text-emerald-700={analysis.over2_5} class:text-rose-700={!analysis.over2_5}>{analysis.over2_5 ? 'Won' : 'Lost'}</td>
								<td class="px-2 py-2 text-right tabular-nums text-slate-700">{formatPercentage(analysis.leagueOver2_5Percentage)}</td>
								<td class="px-2 py-2 text-right tabular-nums text-slate-700">{formatPercentage(analysis.homeOver2_5Percentage)}</td>
								<td class="px-2 py-2 text-right tabular-nums text-slate-700">{formatPercentage(analysis.homeLast5Over2_5Percentage)}</td>
								<td class="px-2 py-2 text-right tabular-nums text-slate-700">{formatPercentage(analysis.awayOver2_5Percentage)}</td>
								<td class="px-2 py-2 text-right tabular-nums text-slate-700">{formatPercentage(analysis.awayLast5Over2_5Percentage)}</td>
								<td class="px-2 py-2 text-center font-semibold" class:text-emerald-700={analysis.bothTeamsAboveLeagueAverage} class:text-slate-400={!analysis.bothTeamsAboveLeagueAverage}>{analysis.bothTeamsAboveLeagueAverage ? 'Yes' : 'No'}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</main>
