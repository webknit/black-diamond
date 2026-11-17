<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	type SortKey = 'averageOdds' | 'bets' | 'winRate' | 'profitLoss' | 'roi';
	let sortKey = $state<SortKey>('profitLoss');
	let sortDirection = $state<-1 | 1>(-1);
	let sortedBetTypes = $derived([...data.summary.byBetType].sort((left, right) => {
		const leftValue = left[sortKey] ?? Number.NEGATIVE_INFINITY;
		const rightValue = right[sortKey] ?? Number.NEGATIVE_INFINITY;
		return (leftValue - rightValue) * sortDirection;
	}));
	function toggleSort(key: SortKey) {
		sortDirection = sortKey === key ? sortDirection * -1 as -1 | 1 : -1;
		sortKey = key;
	}
	function sortIndicator(key: SortKey) {
		return sortKey !== key ? '↕' : sortDirection === -1 ? '↓' : '↑';
	}
	function money(value: number) {
		return new Intl.NumberFormat('en-GB', {
			style: 'currency',
			currency: data.account?.currency ?? 'GBP'
		}).format(value);
	}
	function percent(value: number | null) {
		return value === null ? '–' : `${value.toFixed(2)}%`;
	}
</script>

<svelte:head><title>Black Diamond · Bet summary</title></svelte:head>

<main class="min-h-screen bg-slate-100">
	<div class="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
		<a class="text-sm font-medium text-emerald-700 hover:text-emerald-800" href="/account">← Account</a>
		<div class="mt-3 flex flex-wrap items-end justify-between gap-3">
			<div>
				<h1 class="text-2xl font-semibold tracking-tight text-slate-950">Bet summary</h1>
				<p class="mt-1 text-sm text-slate-600">All-time performance across settled bets.</p>
			</div>
			<a class="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50" href="/account/bets">View bets</a>
		</div>

		<section class="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="Bet performance summary">
			<div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
				<p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Settled profit / loss</p>
				<p class="mt-1 text-2xl font-semibold tabular-nums" class:text-emerald-700={data.summary.totalProfitLoss >= 0} class:text-rose-700={data.summary.totalProfitLoss < 0}>{money(data.summary.totalProfitLoss)}</p>
			</div>
			<div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
				<p class="text-xs font-semibold uppercase tracking-wide text-slate-500">ROI</p>
				<p class="mt-1 text-2xl font-semibold tabular-nums" class:text-emerald-700={(data.summary.roi ?? 0) >= 0} class:text-rose-700={(data.summary.roi ?? 0) < 0}>{percent(data.summary.roi)}</p>
				<p class="mt-1 text-xs text-slate-500">Profit ÷ settled stake</p>
			</div>
			<div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
				<p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Win rate</p>
				<p class="mt-1 text-2xl font-semibold tabular-nums text-slate-950">{percent(data.summary.winRate)}</p>
				<p class="mt-1 text-xs text-slate-500">Won bets, excluding voids</p>
			</div>
		</section>

		<section class="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Bet totals">
			<div class="rounded-xl border border-slate-200 bg-white p-4"><p class="text-xs font-medium text-slate-500">Bets</p><p class="mt-1 text-lg font-semibold tabular-nums text-slate-950">{data.summary.totalBets}</p><p class="text-xs text-slate-500">{data.summary.settledBets} settled</p></div>
			<div class="rounded-xl border border-slate-200 bg-white p-4"><p class="text-xs font-medium text-slate-500">Settled stake</p><p class="mt-1 text-lg font-semibold tabular-nums text-slate-950">{money(data.summary.settledStake)}</p></div>
			<div class="rounded-xl border border-slate-200 bg-white p-4"><p class="text-xs font-medium text-slate-500">Returned</p><p class="mt-1 text-lg font-semibold tabular-nums text-slate-950">{money(data.summary.totalReturned)}</p></div>
			<div class="rounded-xl border border-slate-200 bg-white p-4"><p class="text-xs font-medium text-slate-500">Average odds</p><p class="mt-1 text-lg font-semibold tabular-nums text-slate-950">{data.summary.averageOdds?.toFixed(2) ?? '–'}</p></div>
		</section>

		<section class="mt-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
			<h2 class="text-sm font-semibold text-slate-950">Results</h2>
			<div class="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
				<p class="text-slate-600">Won <strong class="ml-1 tabular-nums text-emerald-700">{data.summary.wonBets}</strong></p>
				<p class="text-slate-600">Lost <strong class="ml-1 tabular-nums text-rose-700">{data.summary.lostBets}</strong></p>
				<p class="text-slate-600">Void <strong class="ml-1 tabular-nums text-slate-900">{data.summary.voidBets}</strong></p>
				<p class="text-slate-600">Pending <strong class="ml-1 tabular-nums text-amber-700">{data.summary.pendingBets}</strong></p>
			</div>
		</section>

		<section class="mt-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
			<h2 class="text-sm font-semibold text-slate-950">Performance by bet type</h2>
			<p class="mt-1 text-xs text-slate-500">Settled bets, grouped by the selected market. Accumulators remain grouped by their full selection combination.</p>
			{#if data.summary.byBetType.length === 0}
				<p class="mt-4 text-sm text-slate-500">No settled bets yet.</p>
			{:else}
				<div class="mt-3 overflow-x-auto rounded-lg border border-slate-200">
					<table class="w-full min-w-[680px] text-left text-xs">
						<thead class="border-b border-slate-200 bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500"><tr><th class="px-3 py-2 font-medium">Bet type</th>{#each [['averageOdds', 'Odds'], ['bets', 'Bets'], ['winRate', 'W / L'], ['profitLoss', 'P / L'], ['roi', 'ROI']] as [key, label] (key)}<th class="px-3 py-2 text-right font-medium"><button type="button" onclick={() => toggleSort(key as SortKey)} class="inline-flex items-center gap-1 hover:text-slate-950" aria-label={`Sort by ${label}`} aria-pressed={sortKey === key}>{label}<span aria-hidden="true">{sortIndicator(key as SortKey)}</span></button></th>{/each}</tr></thead>
						<tbody class="divide-y divide-slate-100">{#each sortedBetTypes as type (type.betType)}<tr><td class="px-3 py-2 font-medium text-slate-800">{type.betType}</td><td class="px-3 py-2 text-right tabular-nums text-slate-700">{type.averageOdds.toFixed(2)}</td><td class="px-3 py-2 text-right tabular-nums text-slate-700">{type.bets}</td><td class="px-3 py-2 text-right tabular-nums text-slate-700">{type.wins} / {type.losses}{type.voids ? ` / ${type.voids} void` : ''}</td><td class="px-3 py-2 text-right font-semibold tabular-nums" class:text-emerald-700={type.profitLoss > 0} class:text-rose-700={type.profitLoss < 0}>{money(type.profitLoss)}</td><td class="px-3 py-2 text-right tabular-nums text-slate-700">{percent(type.roi)}</td></tr>{/each}</tbody>
					</table>
				</div>
			{/if}
		</section>
	</div>
</main>
