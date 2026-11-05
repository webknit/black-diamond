<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();
	const currency = (value: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', signDisplay: 'always' }).format(value);
	function selectOdds(event: Event) { const odds = (event.currentTarget as HTMLSelectElement).value; void goto(`/strategies/over-0-5${odds === 'bettable' ? '' : `?odds=${odds}`}`); }
</script>

<svelte:head><title>Black Diamond · Over 0.5 strategies</title></svelte:head>

<main class="min-h-screen bg-slate-100">
	<div class="mx-auto max-w-5xl px-3 py-4 sm:px-6 sm:py-6">
		<header class="mb-4 sm:mb-6"><h1 class="text-xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Over 0.5 goals strategies</h1><p class="mt-1 text-xs text-slate-600 sm:mt-2 sm:text-sm">Historical performance for recent-form Over 0.5 goals strategies.</p></header>
		<section class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
			<p class="text-[10px] font-bold uppercase tracking-wide text-slate-500">Over 0.5 strategy explorer</p>
			<h2 class="mt-1 text-base font-semibold text-slate-950">Recent-form filters</h2>
			<p class="mt-1 text-xs leading-5 text-slate-600">Flat £1 stakes and stored pre-match Over 0.5 odds at 1.08+. Rows with fewer than {data.minimumBetsForRanking} qualifying bets are excluded and ranked by profit.</p>
			<div class="mt-4 flex gap-3"><div><label class="block text-[10px] font-bold uppercase tracking-wide text-slate-500" for="strategy-week">Historical week</label><select id="strategy-week" value={data.selectedWeek} onchange={(event) => { const week = event.currentTarget.value; void goto(`/strategies/over-0-5?${new URLSearchParams({ ...(week === 'all' ? {} : { week }), ...(data.selectedOddsRange === 'bettable' ? {} : { odds: data.selectedOddsRange }) })}`); }} class="mt-1 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs"><option value="all">All weeks</option>{#each data.availableWeeks as week}<option value={week}>{week}</option>{/each}</select></div><div><label class="block text-[10px] font-bold uppercase tracking-wide text-slate-500" for="strategy-odds">Odds range</label><select id="strategy-odds" value={data.selectedOddsRange} onchange={selectOdds} class="mt-1 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs"><option value="bettable">Your minimum · 1.08+</option><option value="all">All odds</option>{#each data.oddsRanges as range}<option value={range.id}>{range.label}</option>{/each}</select></div></div>
			<div class="mt-4 overflow-x-auto rounded-lg border border-slate-200">
				<table class="w-full min-w-[760px] table-fixed border-collapse text-left text-xs">
					<colgroup><col class="w-[40%]" /><col class="w-[15%]" /><col class="w-[15%]" /><col class="w-[15%]" /><col class="w-[15%]" /></colgroup>
					<thead class="border-b border-slate-200 bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500"><tr><th class="px-3 py-2">Variation</th><th class="px-3 py-2 text-right">Bets</th><th class="px-3 py-2 text-right">W / L</th><th class="px-3 py-2 text-right">P / L</th><th class="px-3 py-2 text-right">ROI</th></tr></thead>
					<tbody class="divide-y divide-slate-100">{#each data.results as result (result.id)}<tr class="text-slate-700"><td class="px-3 py-2"><p class="font-medium text-slate-950">{result.title}</p><p class="mt-0.5 text-[11px] text-slate-500">{result.description}</p></td><td class="px-3 py-2 text-right tabular-nums">{result.bets}</td><td class="px-3 py-2 text-right tabular-nums">{result.wins} / {result.losses}</td><td class="px-3 py-2 text-right font-semibold tabular-nums" class:text-emerald-700={result.profit > 0} class:text-rose-700={result.profit < 0}>{currency(result.profit)}</td><td class="px-3 py-2 text-right tabular-nums">{result.returnOnInvestment === null ? '—' : `${result.returnOnInvestment.toFixed(1)}%`}</td></tr>{/each}</tbody>
				</table>
			</div>
		</section>
	</div>
</main>
