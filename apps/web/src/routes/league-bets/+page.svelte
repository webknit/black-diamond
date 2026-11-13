<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	type SortKey = 'name' | 'total' | string;
	let sortKey = $state<SortKey>('total');
	let sortDirection = $state<'asc' | 'desc'>('desc');

	function sortBy(key: SortKey) {
		if (sortKey === key) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
			return;
		}

		sortKey = key;
		sortDirection = key === 'name' ? 'asc' : 'desc';
	}

	function indicator(key: SortKey) {
		return sortKey === key ? (sortDirection === 'asc' ? '↑' : '↓') : '↕';
	}

	let sortedLeagues = $derived([...data.leagues].sort((left, right) => {
		const leftValue = sortKey === 'name' ? left.name : sortKey === 'total' ? left.total : (left.marketCounts[sortKey] ?? 0);
		const rightValue = sortKey === 'name' ? right.name : sortKey === 'total' ? right.total : (right.marketCounts[sortKey] ?? 0);
		const comparison = typeof leftValue === 'string' ? leftValue.localeCompare(String(rightValue)) : leftValue - Number(rightValue);
		return sortDirection === 'asc' ? comparison : -comparison;
	}));
</script>

<svelte:head>
	<title>Black Diamond · League bets</title>
	<meta name="description" content="Your bet selections grouped by league and market." />
</svelte:head>

<main class="min-h-screen bg-slate-100">
	<div class="mx-auto max-w-[1800px] px-3 py-4 sm:px-6 sm:py-6">
		<header class="mb-4 sm:mb-6">
			<h1 class="text-xl font-semibold tracking-tight text-slate-950 sm:text-3xl">League bets</h1>
			<p class="mt-1 text-xs text-slate-600 sm:mt-2 sm:text-sm">Bet selections by league and market. Select a column heading to sort.</p>
		</header>

		{#if data.leagues.length === 0}
			<section class="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
				<h2 class="text-lg font-semibold text-slate-950">No league bets yet</h2>
				<p class="mt-2 text-sm text-slate-600">Place a bet to see its league and market here.</p>
			</section>
		{:else}
			<div class="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
				<table class="min-w-max w-full text-left text-xs">
					<thead class="border-b border-slate-200 bg-slate-50 text-[9px] font-bold uppercase tracking-wide text-slate-500">
						<tr>
							<th scope="col" aria-sort={sortKey === 'name' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'} class="sticky left-0 z-20 min-w-48 border-r border-slate-200 bg-slate-50 px-3 py-2 shadow-[3px_0_5px_-4px_rgba(15,23,42,0.45)]"><button class="inline-flex items-center gap-1 hover:text-slate-900" onclick={() => sortBy('name')}>League <span aria-hidden="true">{indicator('name')}</span></button></th>
							<th scope="col" aria-sort={sortKey === 'total' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'} class="px-3 py-2 text-right"><button class="inline-flex items-center gap-1 hover:text-slate-900" onclick={() => sortBy('total')}>Total <span aria-hidden="true">{indicator('total')}</span></button></th>
							{#each data.markets as market (market)}
								<th scope="col" aria-sort={sortKey === market ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'} class="whitespace-nowrap px-3 py-2 text-right"><button class="inline-flex items-center gap-1 hover:text-slate-900" onclick={() => sortBy(market)}>{market} <span aria-hidden="true">{indicator(market)}</span></button></th>
							{/each}
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-100">
						{#each sortedLeagues as league (league.id)}
							<tr class="group hover:bg-slate-50">
								<th scope="row" class="sticky left-0 z-10 min-w-48 border-r border-slate-100 bg-white px-3 py-2 text-left font-medium text-slate-900 shadow-[3px_0_5px_-4px_rgba(15,23,42,0.45)] group-hover:bg-slate-50"><div class="flex items-center gap-2">{#if league.logo}<img src={league.logo} alt="" class="size-4 object-contain" />{/if}<p>{league.name}</p></div><p class="mt-0.5 font-normal text-slate-500">{league.country}</p></th>
								<td class="px-3 py-2 text-right font-semibold tabular-nums text-slate-900">{league.total}</td>
								{#each data.markets as market (market)}<td class="px-3 py-2 text-right tabular-nums text-slate-700">{league.marketCounts[market] ?? 0}</td>{/each}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</main>
