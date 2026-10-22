<script lang="ts">
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();
	function money(value: number | null) { return value === null ? '–' : new Intl.NumberFormat('en-GB', { style: 'currency', currency: data.account?.currency ?? 'GBP' }).format(value); }
	const totalPages = $derived(Math.max(1, Math.ceil(data.totalCount / data.pageSize)));
	const previousHref = $derived(`?period=${data.period}&page=${data.page - 1}`);
	const nextHref = $derived(`?period=${data.period}&page=${data.page + 1}`);
</script>

<svelte:head><title>Black Diamond · Bets</title></svelte:head>
<main class="min-h-screen bg-slate-100"><div class="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
	<a class="text-sm font-medium text-emerald-700 hover:text-emerald-800" href="/account">← Account</a>
	<h1 class="mt-3 text-2xl font-semibold tracking-tight text-slate-950">Bets</h1>
	<form method="GET" class="mt-4 flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between">
		<label class="text-xs font-medium text-slate-700">
			Filter by date
			<select
				name="period"
				value={data.period}
				onchange={(event) => event.currentTarget.form?.requestSubmit()}
				class="mt-1 block rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
			>
				<option value="all">All time</option>
				<option value="today">Today</option>
				<option value="this-week">This week</option>
				<option value="last-week">Last week</option>
				<option value="this-month">This month</option>
				<option value="last-month">Last month</option>
				<option value="this-year">This year</option>
				<option value="last-30-days">Last 30 days</option>
			</select>
		</label>
		<div class="flex w-full flex-col gap-1 text-xs text-slate-500 sm:w-auto sm:flex-1 sm:flex-row sm:items-center sm:justify-between sm:pb-2">
			<p>{data.dateRangeLabel}</p>
			{#if data.totalCount > 0}
				<p class="tabular-nums">
					Showing {(data.page - 1) * data.pageSize + 1}–{Math.min(data.page * data.pageSize, data.totalCount)} of {data.totalCount}
				</p>
			{/if}
		</div>
	</form>
	<section class="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5" aria-label="Bet totals for selected period">
		<div class="rounded-lg border border-slate-200 bg-white px-3 py-2">
			<p class="text-[10px] font-medium uppercase tracking-wide text-slate-500">Bets</p>
			<p class="mt-0.5 text-sm font-semibold tabular-nums text-slate-950">{data.summary.betCount}</p>
		</div>
		<div class="rounded-lg border border-slate-200 bg-white px-3 py-2">
			<p class="text-[10px] font-medium uppercase tracking-wide text-slate-500">Staked</p>
			<p class="mt-0.5 text-sm font-semibold tabular-nums text-slate-950">{money(data.summary.totalStake)}</p>
		</div>
		<div class="rounded-lg border border-slate-200 bg-white px-3 py-2">
			<p class="text-[10px] font-medium uppercase tracking-wide text-slate-500">Returned</p>
			<p class="mt-0.5 text-sm font-semibold tabular-nums text-slate-950">{money(data.summary.totalReturned)}</p>
		</div>
		<div class="rounded-lg border border-slate-200 bg-white px-3 py-2">
			<p class="text-[10px] font-medium uppercase tracking-wide text-slate-500">Settled P/L</p>
			<p class="mt-0.5 text-sm font-semibold tabular-nums" class:text-emerald-700={data.summary.settledProfitLoss >= 0} class:text-rose-700={data.summary.settledProfitLoss < 0}>
				{money(data.summary.settledProfitLoss)}
			</p>
		</div>
		<div class="rounded-lg border border-slate-200 bg-white px-3 py-2">
			<p class="text-[10px] font-medium uppercase tracking-wide text-slate-500">Average odds</p>
			<p class="mt-0.5 text-sm font-semibold tabular-nums text-slate-950">{data.summary.averageOdds?.toFixed(2) ?? '–'}</p>
		</div>
	</section>
	{#if data.totalCount === 0}
		<p class="mt-4 rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
			{data.period === 'all' ? 'No bets placed yet.' : 'No bets found for this date range.'}
		</p>
	{:else}
		<div class="mt-3 space-y-3">{#each data.bets as bet (bet.id)}
			<article class="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
				<div class="flex items-start justify-between gap-3"><div><p class="text-sm font-semibold text-slate-950">{bet.selections.length === 1 ? 'Single' : `${bet.selections.length}-fold`}</p><p class="mt-0.5 text-xs text-slate-500">{new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(bet.placedAt))}</p></div><span class="rounded-full px-2 py-1 text-xs font-semibold" class:bg-amber-100={bet.status === 'pending'} class:text-amber-800={bet.status === 'pending'} class:bg-emerald-100={bet.status === 'won'} class:text-emerald-800={bet.status === 'won'} class:bg-rose-100={bet.status === 'lost'} class:text-rose-800={bet.status === 'lost'}>{bet.status}</span></div>
				<ul class="mt-2 space-y-1 text-xs">{#each bet.selections as selection}<li class="flex justify-between gap-3"><div class="min-w-0"><p class="text-slate-700">{selection.fixture.homeTeamName}{#if selection.score && selection.score.home !== null && selection.score.away !== null}<strong class="mx-1 tabular-nums text-slate-900">{selection.score.home}–{selection.score.away}</strong>{:else}<span class="mx-1">v</span>{/if}{selection.fixture.awayTeamName}</p><p class="mt-0.5 text-slate-500">{selection.market.name}: <strong class="font-medium text-slate-700">{selection.market.selection}</strong></p></div><span class="shrink-0 tabular-nums text-slate-600">{selection.referenceOdds ?? '–'}</span></li>{/each}</ul>
				<div class="mt-2 flex flex-wrap gap-x-3 gap-y-1 border-t border-slate-100 pt-2 text-xs"><span>Stake <strong>{money(bet.stake)}</strong></span><span>Odds <strong>{bet.placedOdds}</strong></span><span>Return <strong>{money(bet.returnAmount)}</strong></span>{#if bet.profit !== null}<span>Profit <strong class:text-emerald-700={bet.profit >= 0} class:text-rose-700={bet.profit < 0}>{money(bet.profit)}</strong></span>{/if}</div>
				<div class="mt-3 flex items-center justify-end gap-2">{#if bet.matchStatus === 'unmatched'}<form method="POST" action="?/confirmMatched"><input type="hidden" name="betId" value={bet.id} /><button class="rounded-md bg-sky-100 px-2.5 py-1.5 text-xs font-semibold text-sky-800 hover:bg-sky-200">Confirm matched</button></form>{/if}<form method="POST" action="?/deleteBet" onsubmit={(event) => { if (!confirm('Delete this bet? Its balance effect will be reversed.')) event.preventDefault(); }}><input type="hidden" name="betId" value={bet.id} /><button type="submit" class="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-700" aria-label="Delete bet">🗑</button></form></div>
			</article>
		{/each}</div>
		<nav class="mt-4 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3" aria-label="Bet pages">
			{#if data.page > 1}
				<a class="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50" href={previousHref}>Previous</a>
			{:else}
				<span></span>
			{/if}
			<span class="text-xs text-slate-500">Page {data.page} of {totalPages}</span>
			{#if data.page < totalPages}
				<a class="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50" href={nextHref}>Next</a>
			{:else}
				<span></span>
			{/if}
		</nav>
	{/if}
</div></main>
