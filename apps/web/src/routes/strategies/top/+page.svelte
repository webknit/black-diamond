<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	function formatCurrency(value: number) {
		return new Intl.NumberFormat('en-GB', {
			style: 'currency',
			currency: 'GBP',
			signDisplay: 'always'
		}).format(value);
	}

	function formatPercentage(value: number | null) {
		return value === null ? '—' : `${value.toFixed(1)}%`;
	}
</script>

<svelte:head>
	<title>Black Diamond · Top strategies</title>
	<meta name="description" content="The ten best-performing stored football betting strategies." />
</svelte:head>

<main class="min-h-screen bg-slate-100">
	<div class="mx-auto max-w-5xl px-3 py-4 sm:px-6 sm:py-6">
		<header class="mb-4 sm:mb-6">
			<h1 class="text-xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Top strategies</h1>
			<p class="mt-1 text-xs text-slate-600 sm:mt-2 sm:text-sm">
				The ten strongest profitable performers with at least {data.minimumBetsForRanking} bets, using your market-specific minimum odds. Ranked by ROI, then flat-stake profit.
			</p>
		</header>

		{#if data.strategies.length === 0}
			<section class="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
				<h2 class="text-lg font-semibold text-slate-950">No strategy results yet</h2>
				<p class="mt-2 text-sm text-slate-600">Run the strategy performance sync to populate this ranking.</p>
			</section>
		{:else}
			<section class="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
				<table class="w-full min-w-[760px] text-left text-xs">
					<thead class="border-b border-slate-200 bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
						<tr><th class="px-3 py-2 font-medium">#</th><th class="px-3 py-2 font-medium">Bet type</th><th class="px-3 py-2 text-right font-medium">Min odds</th><th class="px-3 py-2 text-right font-medium">Bets</th><th class="px-3 py-2 text-right font-medium">W / L</th><th class="px-3 py-2 text-right font-medium">P / L</th><th class="px-3 py-2 text-right font-medium">ROI</th></tr>
					</thead>
					<tbody class="divide-y divide-slate-100">
						{#each data.strategies as strategy, index (strategy.id)}
							<tr class="align-top hover:bg-slate-50/70">
								<td class="px-3 py-3 font-medium tabular-nums text-slate-500">{index + 1}</td>
								<td class="px-3 py-3"><a class="font-semibold text-slate-950 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-950" href={strategy.href}>{strategy.market}</a><p class="mt-0.5 text-slate-600">{strategy.title}</p><p class="mt-1 max-w-md text-[11px] leading-4 text-slate-500">{strategy.description}</p></td>
								<td class="px-3 py-3 text-right tabular-nums text-slate-700">{strategy.minimumOdds.toFixed(2)}+</td>
								<td class="px-3 py-3 text-right tabular-nums text-slate-700">{strategy.bets}</td>
								<td class="px-3 py-3 text-right tabular-nums text-slate-700">{strategy.wins} / {strategy.losses}<p class="mt-0.5 text-[10px] text-slate-400">{formatPercentage((strategy.wins / strategy.bets) * 100)}</p></td>
								<td class="px-3 py-3 text-right font-semibold tabular-nums" class:text-emerald-700={strategy.profit > 0} class:text-rose-700={strategy.profit < 0}>{formatCurrency(strategy.profit)}</td>
								<td class="px-3 py-3 text-right font-medium tabular-nums text-slate-900">{formatPercentage(strategy.returnOnInvestment)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</section>
		{/if}
	</div>
</main>
