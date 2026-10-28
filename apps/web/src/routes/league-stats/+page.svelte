<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	type SortKey =
		| 'fixturesPlayed'
		| 'goalsPerFixture'
		| 'bttsPercentage'
		| 'zeroZeroPercentage'
		| 'over1_5Percentage'
		| 'over2_5Percentage'
		| 'homeWinPercentage'
		| 'drawPercentage'
		| 'awayWinPercentage';

	let sortKey = $state<SortKey | null>(null);
	let sortDirection = $state<'asc' | 'desc'>('asc');
	let showCups = $state(false);

	function sortBy(key: SortKey) {
		if (sortKey === key) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
			return;
		}

		sortKey = key;
		sortDirection = 'asc';
	}

	function sortIndicator(key: SortKey) {
		if (sortKey !== key) return '↕';
		return sortDirection === 'asc' ? '↑' : '↓';
	}

	function sortValue(stats: (typeof data.leagueStats)[number], key: SortKey): string | number {
		return stats[key];
	}

	let sortedLeagueStats = $derived.by(() => {
		const key = sortKey;
		const visibleLeagueStats = showCups
			? data.leagueStats
			: data.leagueStats.filter((stats) => !stats.isCup);
		if (key === null) return visibleLeagueStats;

		return [...visibleLeagueStats].sort((left, right) => {
			const leftValue = sortValue(left, key);
			const rightValue = sortValue(right, key);
			const comparison = typeof leftValue === 'string' && typeof rightValue === 'string'
				? leftValue.localeCompare(rightValue)
				: Number(leftValue) - Number(rightValue);
			return sortDirection === 'asc' ? comparison : -comparison;
		});
	});

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

		<label class="mb-4 flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 sm:mb-6">
			<input
				type="checkbox"
				checked={showCups}
				onchange={(event) => (showCups = event.currentTarget.checked)}
				class="size-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-700"
			/>
			<span>Show cups</span>
		</label>

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
							<th scope="col" aria-sort={sortKey === 'fixturesPlayed' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'} class="px-2 py-2 text-right"><button class="inline-flex items-center gap-1 hover:text-slate-900" onclick={() => sortBy('fixturesPlayed')}>Played <span aria-hidden="true">{sortIndicator('fixturesPlayed')}</span></button></th>
							<th scope="col" aria-sort={sortKey === 'goalsPerFixture' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'} class="px-2 py-2 text-right"><button class="inline-flex items-center gap-1 hover:text-slate-900" onclick={() => sortBy('goalsPerFixture')}>Goals / game <span aria-hidden="true">{sortIndicator('goalsPerFixture')}</span></button></th>
							<th scope="col" aria-sort={sortKey === 'bttsPercentage' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'} class="px-2 py-2 text-right"><button class="inline-flex items-center gap-1 hover:text-slate-900" onclick={() => sortBy('bttsPercentage')}>BTTS <span aria-hidden="true">{sortIndicator('bttsPercentage')}</span></button></th>
							<th scope="col" aria-sort={sortKey === 'zeroZeroPercentage' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'} class="px-2 py-2 text-right"><button class="inline-flex items-center gap-1 hover:text-slate-900" onclick={() => sortBy('zeroZeroPercentage')}>0–0 <span aria-hidden="true">{sortIndicator('zeroZeroPercentage')}</span></button></th>
							<th scope="col" aria-sort={sortKey === 'over1_5Percentage' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'} class="px-2 py-2 text-right"><button class="inline-flex items-center gap-1 hover:text-slate-900" onclick={() => sortBy('over1_5Percentage')}>Over 1.5 <span aria-hidden="true">{sortIndicator('over1_5Percentage')}</span></button></th>
							<th scope="col" aria-sort={sortKey === 'over2_5Percentage' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'} class="px-2 py-2 text-right"><button class="inline-flex items-center gap-1 hover:text-slate-900" onclick={() => sortBy('over2_5Percentage')}>Over 2.5 <span aria-hidden="true">{sortIndicator('over2_5Percentage')}</span></button></th>
							<th scope="col" aria-sort={sortKey === 'homeWinPercentage' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'} class="px-2 py-2 text-right"><button class="inline-flex items-center gap-1 hover:text-slate-900" onclick={() => sortBy('homeWinPercentage')}>Home win <span aria-hidden="true">{sortIndicator('homeWinPercentage')}</span></button></th>
							<th scope="col" aria-sort={sortKey === 'drawPercentage' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'} class="px-2 py-2 text-right"><button class="inline-flex items-center gap-1 hover:text-slate-900" onclick={() => sortBy('drawPercentage')}>Draw <span aria-hidden="true">{sortIndicator('drawPercentage')}</span></button></th>
							<th scope="col" aria-sort={sortKey === 'awayWinPercentage' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'} class="px-2 py-2 text-right"><button class="inline-flex items-center gap-1 hover:text-slate-900" onclick={() => sortBy('awayWinPercentage')}>Away win <span aria-hidden="true">{sortIndicator('awayWinPercentage')}</span></button></th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-100">
						{#each sortedLeagueStats as stats (stats.league.id)}
							<tr class="group hover:bg-slate-50">
								<th scope="row" class="sticky left-0 z-10 min-w-32 border-r border-slate-100 bg-white px-2 py-2 font-medium text-slate-900 shadow-[3px_0_5px_-4px_rgba(15,23,42,0.45)] group-hover:bg-slate-50">
									<p class="truncate">{stats.league.name}</p>
									<p class="mt-0.5 truncate text-xs font-normal text-slate-500">
										{stats.league.country} · {stats.league.season}
									</p>
								</th>
								<td class="whitespace-nowrap px-2 py-2 text-slate-700">
									{stats.round}{#if stats.totalRoundsInPhase !== null}<span class="ml-1 opacity-60">/ {stats.totalRoundsInPhase}</span>{/if}
								</td>
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
