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
			<ol class="space-y-3">
				{#each data.strategies as strategy, index (strategy.id)}
					<li class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
						<div class="flex items-start gap-3">
							<span class="flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">{index + 1}</span>
							<div class="min-w-0 flex-1">
								<div class="flex flex-wrap items-center gap-x-2 gap-y-1">
									<a class="text-sm font-semibold text-slate-950 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-950" href={strategy.href}>{strategy.title}</a>
									<span class="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">{strategy.market}</span>
									<span class="text-[10px] text-slate-500">{strategy.minimumOdds.toFixed(2)}+ odds</span>
								</div>
								<p class="mt-1 text-xs leading-5 text-slate-600">{strategy.description}</p>
								<div class="mt-3 grid grid-cols-4 gap-2 border-t border-slate-100 pt-3 text-center text-[10px] text-slate-500 sm:max-w-md">
									<div><p class="uppercase tracking-wide">Bets</p><p class="mt-0.5 text-xs font-medium tabular-nums text-slate-900">{strategy.bets}</p></div>
									<div><p class="uppercase tracking-wide">W / L</p><p class="mt-0.5 text-xs font-medium tabular-nums text-slate-900">{strategy.wins} / {strategy.losses}</p><p class="mt-0.5 text-[10px] tabular-nums text-slate-400">{formatPercentage(strategy.bets ? (strategy.wins / strategy.bets) * 100 : null)}</p></div>
									<div><p class="uppercase tracking-wide">P / L</p><p class="mt-0.5 text-xs font-semibold tabular-nums" class:text-emerald-700={strategy.profit > 0} class:text-rose-700={strategy.profit < 0}>{formatCurrency(strategy.profit)}</p></div>
									<div><p class="uppercase tracking-wide">ROI</p><p class="mt-0.5 text-xs font-medium tabular-nums text-slate-900">{formatPercentage(strategy.returnOnInvestment)}</p></div>
								</div>
								<details class="mt-3 border-t border-slate-100 pt-3">
									<summary class="cursor-pointer text-xs font-medium text-slate-600 hover:text-slate-950">League performance{strategy.leaguePerformances.length > 0 ? ` (${strategy.leaguePerformances.length})` : ''}</summary>
									{#if strategy.leaguePerformances.length === 0}
										<p class="mt-2 text-xs text-slate-500">League results will appear after the strategy-performance backfill completes.</p>
									{:else}
										<div class="mt-2 overflow-x-auto rounded-lg border border-slate-200">
											<table class="w-full min-w-[31rem] text-left text-xs">
												<thead class="border-b border-slate-200 bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
													<tr><th class="px-3 py-2 font-medium">League</th><th class="px-3 py-2 text-right font-medium">Bets</th><th class="px-3 py-2 text-right font-medium">W / L</th><th class="px-3 py-2 text-right font-medium">P / L</th><th class="px-3 py-2 text-right font-medium">ROI</th></tr>
												</thead>
												<tbody class="divide-y divide-slate-100">
													{#each strategy.leaguePerformances as league (league.leagueId)}
														<tr>
															<td class="px-3 py-2"><p class="font-medium text-slate-800">{league.name}</p><p class="text-[10px] text-slate-500">{league.country}</p></td>
															<td class="px-3 py-2 text-right tabular-nums text-slate-700">{league.bets}</td>
															<td class="px-3 py-2 text-right tabular-nums text-slate-700">{league.wins} / {league.losses}</td>
															<td class="px-3 py-2 text-right font-medium tabular-nums" class:text-emerald-700={league.profit > 0} class:text-rose-700={league.profit < 0}>{formatCurrency(league.profit)}</td>
															<td class="px-3 py-2 text-right tabular-nums text-slate-700">{formatPercentage(league.returnOnInvestment)}</td>
														</tr>
													{/each}
												</tbody>
											</table>
										</div>
									{/if}
								</details>
							</div>
						</div>
					</li>
				{/each}
			</ol>
		{/if}
	</div>
</main>
