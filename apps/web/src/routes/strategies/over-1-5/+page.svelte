<script lang="ts">
	import { goto } from '$app/navigation';
	import { navigating } from '$app/state';
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();
	let loading = $derived(navigating.to?.url.pathname === '/strategies/over-1-5');
	function navigate(key: 'week' | 'odds', value: string) {
		const query = new URLSearchParams();
		const week = key === 'week' ? value : data.selectedWeek;
		const odds = key === 'odds' ? value : data.selectedOddsRange;
		if (week !== 'all') query.set('week', week);
		if (odds !== 'all') query.set('odds', odds);
		void goto(`/strategies/over-1-5${query.size ? `?${query}` : ''}`);
	}
	function currency(value: number) { return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', signDisplay: 'always' }).format(value); }
	function week(value: string) { const start = new Date(`${value}T12:00:00Z`); const end = new Date(start); end.setUTCDate(end.getUTCDate() + 6); const format = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }); return `${format.format(start)} – ${format.format(end)}`; }
</script>
<svelte:head><title>Black Diamond · Over 1.5 strategies</title></svelte:head>
<main class="min-h-screen bg-slate-100"><div class="mx-auto max-w-5xl px-3 py-4 sm:px-6 sm:py-6">
	<header class="mb-4 sm:mb-6"><h1 class="text-xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Over 1.5 strategies</h1><p class="mt-1 text-xs text-slate-600 sm:text-sm">Recent relevant-venue scoring and conceding form.</p></header>
	<section class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
		<div class="flex flex-wrap items-end justify-between gap-3"><div><p class="text-[10px] font-bold uppercase tracking-wide text-slate-500">Over 1.5 strategy explorer</p><h2 class="mt-1 text-base font-semibold text-slate-950">Scoring, conceding and goal-rate filters</h2><p class="mt-1 text-xs leading-5 text-slate-600">All 27 strategies use flat £1 stakes and stored pre-match Over 1.5 odds. Rows rank by profit for the chosen odds range.</p></div><div class="flex items-end gap-3"><div><label class="block text-[10px] font-bold uppercase tracking-wide text-slate-500" for="week">Historical week</label><select id="week" value={data.selectedWeek} onchange={(event) => navigate('week', event.currentTarget.value)} class="mt-1 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs"><option value="all">All weeks</option>{#each data.availableWeeks as item}<option value={item}>{week(item)}</option>{/each}</select></div><div><label class="block text-[10px] font-bold uppercase tracking-wide text-slate-500" for="odds">Odds range</label><select id="odds" value={data.selectedOddsRange} onchange={(event) => navigate('odds', event.currentTarget.value)} class="mt-1 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs"><option value="all">All odds</option>{#each data.oddsRanges as range}<option value={range.id}>{range.label}</option>{/each}</select></div></div></div>
		{#if loading}<div class="mt-4 py-14 text-center text-sm text-slate-500">Loading strategy results…</div>{:else}<div class="mt-4 overflow-x-auto rounded-lg border border-slate-200"><table class="w-full min-w-[680px] text-left text-xs"><thead class="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500"><tr><th class="px-3 py-2">Variation</th><th class="px-3 py-2 text-right">Bets</th><th class="px-3 py-2 text-right">W / L</th><th class="px-3 py-2 text-right">P / L</th><th class="px-3 py-2 text-right">ROI</th></tr></thead><tbody class="divide-y divide-slate-100">{#each data.results as result (result.id)}<tr><td class="px-3 py-2"><p class="font-medium text-slate-950">{result.title}</p><p class="mt-0.5 text-[11px] text-slate-500">{result.description}</p></td><td class="px-3 py-2 text-right">{result.bets}</td><td class="px-3 py-2 text-right">{result.wins} / {result.losses}</td><td class="px-3 py-2 text-right font-semibold" class:text-emerald-700={result.profit > 0} class:text-rose-700={result.profit < 0}>{currency(result.profit)}</td><td class="px-3 py-2 text-right">{result.returnOnInvestment === null ? '—' : `${result.returnOnInvestment.toFixed(1)}%`}</td></tr>{/each}</tbody></table></div>{/if}
	</section>
</div></main>
