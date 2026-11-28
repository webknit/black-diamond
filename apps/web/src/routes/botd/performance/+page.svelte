<script lang="ts">
	import BotdPerformanceChart from '#lib/components/BotdPerformanceChart.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const signedCurrency = (value: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', signDisplay: 'always' }).format(value);
	const currency = (value: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value);
	const percent = (value: number | null) => value === null ? '—' : `${value.toFixed(1)}%`;
</script>

<svelte:head><title>Black Diamond · BOTD performance</title><meta name="description" content="Historical performance of Black Diamond Bet of the Day recommendation sets." /></svelte:head>

<main class="min-h-screen bg-slate-100">
	<div class="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6">
		<header class="mb-4 sm:mb-6">
			<p class="text-[10px] font-bold uppercase tracking-wide text-slate-500">Historical BOTD replay</p>
			<div class="mt-1 flex flex-wrap items-baseline justify-between gap-3"><h1 class="text-xl font-semibold tracking-tight text-slate-950 sm:text-3xl">BOTD performance</h1><a href="/botd" class="text-sm font-medium text-slate-700 hover:text-slate-950 hover:underline">Back to BOTD</a></div>
			<p class="mt-2 max-w-3xl text-sm text-slate-600">Compare Top Picks with every confidence band. Each card uses flat £1 stakes and settled fixtures only.</p>
		</header>

		<p class="mb-4 text-xs text-slate-500">All-time results across {data.availableDays} stored BOTD day{data.availableDays === 1 ? '' : 's'}.</p>

		<section class="mt-4 grid gap-4 lg:grid-cols-3" aria-label="BOTD performance by recommendation set">
			{#each data.performance as category (category.id)}
				<article class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
					<p class="text-[10px] font-bold uppercase tracking-wide text-slate-500">{category.label}</p>
					<h2 class="mt-1 text-xl font-semibold text-slate-950">{percent(category.settledCount ? (category.wins / category.settledCount) * 100 : null)} win rate</h2>
					<p class="mt-1 min-h-10 text-xs text-slate-600">{category.description}</p>
					<div class="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 border-t border-slate-100 pt-4 text-sm">
						<div><p class="text-[10px] font-bold uppercase tracking-wide text-slate-500">Profit / loss</p><p class="mt-1 font-semibold tabular-nums" class:text-emerald-700={category.profitLoss > 0} class:text-rose-700={category.profitLoss < 0}>{signedCurrency(category.profitLoss)}</p></div>
						<div><p class="text-[10px] font-bold uppercase tracking-wide text-slate-500">ROI</p><p class="mt-1 font-semibold tabular-nums text-slate-950">{percent(category.roi)}</p></div>
						<div><p class="text-[10px] font-bold uppercase tracking-wide text-slate-500">Settled</p><p class="mt-1 font-medium tabular-nums text-slate-950">{category.settledCount} <span class="text-xs font-normal text-slate-500">of {category.selectionCount}</span></p></div>
						<div><p class="text-[10px] font-bold uppercase tracking-wide text-slate-500">Record</p><p class="mt-1 font-medium tabular-nums text-slate-950">{category.wins}W · {category.losses}L</p></div>
						<div><p class="text-[10px] font-bold uppercase tracking-wide text-slate-500">Total staked</p><p class="mt-1 font-medium tabular-nums text-slate-950">{currency(category.totalStaked)}</p></div>
						<div><p class="text-[10px] font-bold uppercase tracking-wide text-slate-500">Average odds</p><p class="mt-1 font-medium tabular-nums text-slate-950">{category.averageOdds === null ? '—' : category.averageOdds.toFixed(2)}</p></div>
						<div><p class="text-[10px] font-bold uppercase tracking-wide text-slate-500">Awaiting result</p><p class="mt-1 font-medium tabular-nums text-slate-950">{category.pendingCount}</p></div>
					</div>
				</article>
			{/each}
		</section>

		<BotdPerformanceChart series={data.performanceSeries} />

		<section class="mt-6 space-y-4" aria-label="BOTD performance by bet type">
			<div><h2 class="text-lg font-semibold tracking-tight text-slate-950">Performance by bet type</h2><p class="mt-1 text-sm text-slate-600">Each recommendation set is broken down by market. The confidence bands are calculated independently.</p></div>
			{#each data.performance as category (category.id)}
				<section class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
					<div class="border-b border-slate-200 px-4 py-3"><h3 class="text-sm font-semibold text-slate-950">{category.label}</h3></div>
					<div class="overflow-x-auto">
						<table class="w-full min-w-[720px] text-left text-xs">
							<thead class="border-b border-slate-200 bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500"><tr><th class="px-4 py-3">Bet type</th><th class="px-4 py-3 text-right">Settled</th><th class="px-4 py-3 text-right">Record</th><th class="px-4 py-3 text-right">Win rate</th><th class="px-4 py-3 text-right">Average odds</th><th class="px-4 py-3 text-right">P / L</th><th class="px-4 py-3 text-right">ROI</th><th class="px-4 py-3 text-right">Awaiting</th></tr></thead>
							<tbody class="divide-y divide-slate-100">
								{#each category.marketPerformance as market (market.market)}
									<tr class="text-slate-700"><th scope="row" class="px-4 py-3 font-medium text-slate-950">{market.market}</th><td class="px-4 py-3 text-right tabular-nums">{market.settledCount} <span class="text-slate-400">/ {market.selectionCount}</span></td><td class="px-4 py-3 text-right tabular-nums">{market.wins}W · {market.losses}L</td><td class="px-4 py-3 text-right tabular-nums">{percent(market.settledCount ? (market.wins / market.settledCount) * 100 : null)}</td><td class="px-4 py-3 text-right tabular-nums">{market.averageOdds === null ? '—' : market.averageOdds.toFixed(2)}</td><td class="px-4 py-3 text-right font-semibold tabular-nums" class:text-emerald-700={market.profitLoss > 0} class:text-rose-700={market.profitLoss < 0}>{signedCurrency(market.profitLoss)}</td><td class="px-4 py-3 text-right tabular-nums">{percent(market.roi)}</td><td class="px-4 py-3 text-right tabular-nums">{market.pendingCount}</td></tr>
								{:else}
									<tr><td colspan="8" class="px-4 py-8 text-center text-sm text-slate-500">No BOTD recommendations in this period.</td></tr>
								{/each}
							</tbody>
						</table>
					</div>
				</section>
			{/each}
		</section>

		<p class="mt-4 text-xs leading-5 text-slate-500">Total staked assumes £1 per recommendation, including selections awaiting a result. Emerging, Low confidence, Eligible, Strong, and High confidence are separate confidence bands. A rescheduled fixture is counted once, using its latest stored BOTD slate.</p>
	</div>
</main>
