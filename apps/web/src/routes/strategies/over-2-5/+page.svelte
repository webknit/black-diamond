<script lang="ts">
	import { goto } from '$app/navigation';
	import { navigating } from '$app/state';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let isWeekLoading = $derived(navigating.to?.url.pathname === '/strategies/over-2-5');

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
		const query = new URLSearchParams();
		if (week !== 'all') query.set('week', week);
		if (data.selectedOddsRange !== 'all') query.set('odds', data.selectedOddsRange);
		void goto(`/strategies/over-2-5${query.size ? `?${query}` : ''}`);
	}

	function selectOddsRange(event: Event) {
		const odds = (event.currentTarget as HTMLSelectElement).value;
		const query = new URLSearchParams();
		if (data.selectedWeek !== 'all') query.set('week', data.selectedWeek);
		if (odds !== 'all') query.set('odds', odds);
		void goto(`/strategies/over-2-5${query.size ? `?${query}` : ''}`);
	}
</script>

<svelte:head>
	<title>Black Diamond · Over 2.5 strategies</title>
	<meta name="description" content="Historical Over 2.5 goals strategy performance." />
</svelte:head>

<main class="min-h-screen bg-slate-100">
	<div class="mx-auto max-w-5xl px-3 py-4 sm:px-6 sm:py-6">
		<header class="mb-4 sm:mb-6">
			<h1 class="text-xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Over 2.5 goals strategies</h1>
			<p class="mt-1 text-xs text-slate-600 sm:mt-2 sm:text-sm">
				Historical performance for recent-form Over 2.5 goals strategies.
			</p>
		</header>

		<section class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
				<div>
					<div>
						<p class="text-[10px] font-bold uppercase tracking-wide text-slate-500">Over 2.5 strategy explorer</p>
						<h2 class="mt-1 text-base font-semibold text-slate-950">Scoring and defensive filters</h2>
					<p class="mt-1 text-xs leading-5 text-slate-600">League-rate and recent-form variations use flat £1 stakes and stored pre-match Over 2.5 odds. The smaller figures show the equivalent season-wide filter where available. Rows are ranked by profit for the chosen odds range.</p>
					</div>
				<div class="mt-4 flex flex-wrap items-end gap-3">
					<div>
						<label class="block text-[10px] font-bold uppercase tracking-wide text-slate-500" for="strategy-week">Historical week</label>
						<select id="strategy-week" value={data.selectedWeek} onchange={selectHistoricalWeek} disabled={isWeekLoading} class="mt-1 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-800 disabled:cursor-wait disabled:opacity-60">
							<option value="all">All weeks</option>
							{#each data.availableWeeks as week}
								<option value={week}>{formatWeek(week)}</option>
							{/each}
						</select>
					</div>
					<div>
						<label class="block text-[10px] font-bold uppercase tracking-wide text-slate-500" for="strategy-odds">Odds range</label>
						<select id="strategy-odds" value={data.selectedOddsRange} onchange={selectOddsRange} disabled={isWeekLoading} class="mt-1 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-800 disabled:cursor-wait disabled:opacity-60">
							<option value="all">All odds</option>
							{#each data.oddsRanges as range}<option value={range.id}>{range.label}</option>{/each}
						</select>
					</div>
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
									<td class="px-3 py-2 text-right tabular-nums"><p>{result.bets}</p>{#if result.seasonPerformance}<p class="mt-0.5 text-[10px] text-slate-400">Season: {result.seasonPerformance.bets}</p>{/if}</td>
									<td class="px-3 py-2 text-right tabular-nums"><p>{result.wins} / {result.losses}</p>{#if result.seasonPerformance}<p class="mt-0.5 text-[10px] text-slate-400">Season: {result.seasonPerformance.wins} / {result.seasonPerformance.losses}</p>{/if}</td>
									<td class="px-3 py-2 text-right font-semibold tabular-nums" class:text-emerald-700={result.profit > 0} class:text-rose-700={result.profit < 0}><p>{formatCurrency(result.profit)}</p>{#if result.seasonPerformance}<p class="mt-0.5 text-[10px] font-medium text-slate-400">Season: {formatCurrency(result.seasonPerformance.profit)}</p>{/if}</td>
									<td class="px-3 py-2 text-right tabular-nums"><p>{result.returnOnInvestment === null ? '—' : formatPercentage(result.returnOnInvestment)}</p>{#if result.seasonPerformance}<p class="mt-0.5 text-[10px] text-slate-400">Season: {result.seasonPerformance.returnOnInvestment === null ? '—' : formatPercentage(result.seasonPerformance.returnOnInvestment)}</p>{/if}</td>
								</tr>
							{/each}
						</tbody>
						</table>
					</div>
				{/if}
		</section>
	</div>
</main>
