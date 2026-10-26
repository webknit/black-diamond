<script lang="ts">
	import { goto } from '$app/navigation';
	import { navigating } from '$app/state';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let selectedStrategyId = $state('bothTeamsAboveLeagueAverage');
	let selectedStrategy = $derived(data.strategies.find((strategy) => strategy.id === selectedStrategyId));
	let showTeamFilterExplorer = $derived(selectedStrategyId === 'teamFilterExplorer');
	let isWeekLoading = $derived(navigating.to?.url.pathname === '/strategies');

	$effect(() => {
		if (data.selectedWeek !== 'all') selectedStrategyId = 'teamFilterExplorer';
	});

	function formatPercentage(value: number) {
		return `${value.toFixed(1)}%`;
	}

	function formatCurrency(value: number) {
		return new Intl.NumberFormat('en-GB', {
			style: 'currency',
			currency: 'GBP',
			signDisplay: 'always'
		}).format(value);
	}

	function formatWeek(weekStart: string) {
		const start = new Date(`${weekStart}T12:00:00.000Z`);
		const end = new Date(start);
		end.setUTCDate(end.getUTCDate() + 6);
		const formatter = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'Europe/London' });
		return `${formatter.format(start)} – ${formatter.format(end)}`;
	}

	function selectHistoricalWeek(event: Event) {
		const week = (event.currentTarget as HTMLSelectElement).value;
		void goto(week === 'all' ? '/strategies' : `/strategies?week=${encodeURIComponent(week)}`);
	}
</script>

<svelte:head>
	<title>Black Diamond · Strategies</title>
	<meta name="description" content="Upcoming fixtures matching Black Diamond betting strategies." />
</svelte:head>

<main class="min-h-screen bg-slate-100">
	<div class="mx-auto max-w-5xl px-3 py-4 sm:px-6 sm:py-6">
		<header class="mb-4 sm:mb-6">
			<h1 class="text-xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Strategies</h1>
			<p class="mt-1 text-xs text-slate-600 sm:mt-2 sm:text-sm">
				Upcoming fixtures that match your tested strategy conditions.
			</p>
		</header>

		<div class="mb-4 flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 shadow-sm sm:mb-6" role="tablist" aria-label="Betting strategies">
			{#each data.strategies as strategy (strategy.id)}
				<button
					type="button"
					role="tab"
					aria-selected={selectedStrategyId === strategy.id}
					class="shrink-0 rounded-lg px-3 py-2 text-left text-xs font-medium transition sm:text-sm"
					class:bg-slate-950={selectedStrategyId === strategy.id}
					class:text-white={selectedStrategyId === strategy.id}
					class:text-slate-600={selectedStrategyId !== strategy.id}
					onclick={() => (selectedStrategyId = strategy.id)}
				>
					{strategy.title}
				</button>
			{/each}
			<button
				type="button"
				role="tab"
				aria-selected={showTeamFilterExplorer}
				class="shrink-0 rounded-lg px-3 py-2 text-left text-xs font-medium transition sm:text-sm"
				class:bg-slate-950={showTeamFilterExplorer}
				class:text-white={showTeamFilterExplorer}
				class:text-slate-600={!showTeamFilterExplorer}
				onclick={() => (selectedStrategyId = 'teamFilterExplorer')}
			>
				Over 2.5 strategy explorer
			</button>
		</div>

		{#if showTeamFilterExplorer}
			<section class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
				<div class="flex flex-wrap items-end justify-between gap-3">
					<div>
						<p class="text-[10px] font-bold uppercase tracking-wide text-slate-500">Over 2.5 strategy explorer</p>
						<h2 class="mt-1 text-base font-semibold text-slate-950">Scoring and defensive filters</h2>
						<p class="mt-1 text-xs leading-5 text-slate-600">All 30 last-five venue variations use flat £1 stakes and stored pre-match Over 2.5 odds of {data.minimumOver2_5ReferenceOdd.toFixed(2)} or more. The smaller figures show the equivalent season-wide filter. Rows are ranked by last-five profit.</p>
					</div>
					<div>
						<label class="block text-[10px] font-bold uppercase tracking-wide text-slate-500" for="strategy-week">Historical week</label>
						<select id="strategy-week" value={data.selectedWeek} onchange={selectHistoricalWeek} disabled={isWeekLoading} class="mt-1 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-800 disabled:cursor-wait disabled:opacity-60">
							<option value="all">All weeks</option>
							{#each data.availableWeeks as week}
								<option value={week}>{formatWeek(week)}</option>
							{/each}
						</select>
					</div>
				</div>
				{#if isWeekLoading}
					<section class="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-6 py-14 text-center" role="status">
						<span class="mx-auto block size-6 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-700"></span>
						<p class="mt-3 text-sm font-medium text-slate-600">Loading strategy results…</p>
					</section>
				{:else}
					<div class="mt-4 overflow-x-auto rounded-lg border border-slate-200">
						<table class="w-full min-w-[760px] text-left text-xs">
						<thead class="border-b border-slate-200 bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
							<tr><th class="px-3 py-2">Last-five variation</th><th class="px-3 py-2 text-right">Bets</th><th class="px-3 py-2 text-right">W / L</th><th class="px-3 py-2 text-right">P / L</th><th class="px-3 py-2 text-right">ROI</th></tr>
						</thead>
						<tbody class="divide-y divide-slate-100">
							{#each data.teamFilterResults as result (result.id)}
								<tr class="text-slate-700">
									<td class="px-3 py-2"><p class="font-medium text-slate-950">{result.title}</p><p class="mt-0.5 text-[11px] text-slate-500">{result.description}</p></td>
									<td class="px-3 py-2 text-right tabular-nums"><p>{result.bets}</p><p class="mt-0.5 text-[10px] text-slate-400">Season: {result.seasonPerformance.bets}</p></td>
									<td class="px-3 py-2 text-right tabular-nums"><p>{result.wins} / {result.losses}</p><p class="mt-0.5 text-[10px] text-slate-400">Season: {result.seasonPerformance.wins} / {result.seasonPerformance.losses}</p></td>
									<td class="px-3 py-2 text-right font-semibold tabular-nums" class:text-emerald-700={result.profit > 0} class:text-rose-700={result.profit < 0}><p>{formatCurrency(result.profit)}</p><p class="mt-0.5 text-[10px] font-medium text-slate-400">Season: {formatCurrency(result.seasonPerformance.profit)}</p></td>
									<td class="px-3 py-2 text-right tabular-nums"><p>{result.returnOnInvestment === null ? '—' : formatPercentage(result.returnOnInvestment)}</p><p class="mt-0.5 text-[10px] text-slate-400">Season: {result.seasonPerformance.returnOnInvestment === null ? '—' : formatPercentage(result.seasonPerformance.returnOnInvestment)}</p></td>
								</tr>
							{/each}
						</tbody>
						</table>
					</div>
				{/if}
			</section>
		{:else if selectedStrategy}
			{@const strategy = selectedStrategy}
			<div role="tabpanel">
				<section class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
					<p class="text-[10px] font-bold uppercase tracking-wide text-slate-500">Strategy</p>
					<h2 class="mt-1 text-base font-semibold text-slate-950">{strategy.title}</h2>
					<p class="mt-1 text-xs leading-5 text-slate-600">{strategy.description} Reference odds must be at least {data.minimumOver2_5ReferenceOdd.toFixed(2)}.</p>
					<div class="mt-4 grid grid-cols-2 divide-x divide-y divide-slate-200 rounded-lg border border-slate-200 bg-slate-50 text-center sm:grid-cols-4 sm:divide-y-0">
						<div class="px-2 py-2"><p class="text-[9px] font-bold uppercase tracking-wide text-slate-500">Bets</p><p class="mt-1 text-sm font-semibold tabular-nums text-slate-900">{strategy.performance.bets}</p></div>
						<div class="px-2 py-2"><p class="text-[9px] font-bold uppercase tracking-wide text-slate-500">Wins / losses</p><p class="mt-1 text-sm font-semibold tabular-nums text-slate-900">{strategy.performance.wins} / {strategy.performance.losses}</p></div>
						<div class="px-2 py-2"><p class="text-[9px] font-bold uppercase tracking-wide text-slate-500">Profit / loss</p><p class="mt-1 text-sm font-semibold tabular-nums" class:text-emerald-700={strategy.performance.profit > 0} class:text-rose-700={strategy.performance.profit < 0} class:text-slate-900={strategy.performance.profit === 0}>{formatCurrency(strategy.performance.profit)}</p></div>
						<div class="px-2 py-2"><p class="text-[9px] font-bold uppercase tracking-wide text-slate-500">ROI</p><p class="mt-1 text-sm font-semibold tabular-nums text-slate-900">{strategy.performance.returnOnInvestment === null ? '—' : formatPercentage(strategy.performance.returnOnInvestment)}</p></div>
					</div>
				</section>
			</div>
		{/if}
	</div>
</main>
