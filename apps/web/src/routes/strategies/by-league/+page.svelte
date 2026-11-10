<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	function currency(value: number) {
		return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', signDisplay: 'always' }).format(value);
	}
</script>

<svelte:head><title>Black Diamond · Top strategies by league</title></svelte:head>

<main class="min-h-screen bg-slate-100">
	<div class="mx-auto max-w-6xl px-3 py-4 sm:px-6 sm:py-6">
		<header class="mb-4 sm:mb-6">
			<h1 class="text-xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Top strategies by league</h1>
			<p class="mt-1 text-xs text-slate-600 sm:mt-2 sm:text-sm">League-specific results at each market’s minimum odds. Rows need at least {data.minimumLeagueBets} qualifying bets and are ranked by ROI, then profit.</p>
			<div class="mt-2 flex flex-wrap items-center gap-y-1 text-xs text-slate-500">
				<span class="mr-3 font-semibold uppercase tracking-wide text-slate-400">Minimum odds</span>
				{#each data.marketMinimumOdds as market}
					<span class="mr-3 inline-flex items-baseline gap-1.5 border-l border-slate-200 pl-3"><span class="font-semibold tabular-nums text-slate-800">{market.minimumOdds.toFixed(2)}+</span><span>{market.label}</span></span>
				{/each}
			</div>
		</header>
		{#if data.results.length === 0}
			<section class="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center text-sm text-slate-600">No league results meet the current sample threshold yet.</section>
		{:else}
			<div class="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
				<table class="w-full min-w-[860px] text-left text-xs">
					<thead class="border-b border-slate-200 bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500"><tr><th class="px-3 py-2">League</th><th class="px-3 py-2">Strategy</th><th class="px-3 py-2">Market</th><th class="px-3 py-2 text-right">Bets</th><th class="px-3 py-2 text-right">W / L</th><th class="px-3 py-2 text-right">P / L</th><th class="px-3 py-2 text-right">ROI</th></tr></thead>
					<tbody class="divide-y divide-slate-100">
						{#each data.results as result (`${result.id}-${result.leagueId}`)}
							<tr>
								<td class="px-3 py-2"><p class="font-medium text-slate-800">{result.leagueName}</p><p class="text-[10px] text-slate-500">{result.country}</p></td>
								<td class="px-3 py-2"><a class="font-medium text-slate-800 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-950" href={result.href}>{result.title}</a><p class="mt-0.5 text-[10px] text-slate-500">{result.minimumOdds.toFixed(2)}+ odds</p></td>
								<td class="px-3 py-2 text-slate-600">{result.market}</td><td class="px-3 py-2 text-right tabular-nums text-slate-700">{result.bets}</td><td class="px-3 py-2 text-right tabular-nums text-slate-700">{result.wins} / {result.losses}</td><td class="px-3 py-2 text-right font-medium tabular-nums text-emerald-700">{currency(result.profit)}</td><td class="px-3 py-2 text-right tabular-nums text-slate-700">{result.returnOnInvestment?.toFixed(1)}%</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</main>
