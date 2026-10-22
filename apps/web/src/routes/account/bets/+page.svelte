<script lang="ts">
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();
	function money(value: number | null) { return value === null ? '–' : new Intl.NumberFormat('en-GB', { style: 'currency', currency: data.account?.currency ?? 'GBP' }).format(value); }
</script>

<svelte:head><title>Black Diamond · Bets</title></svelte:head>
<main class="min-h-screen bg-slate-100"><div class="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
	<a class="text-sm font-medium text-emerald-700 hover:text-emerald-800" href="/account">← Account</a>
	<h1 class="mt-3 text-2xl font-semibold tracking-tight text-slate-950">Bets</h1>
	{#if data.bets.length === 0}
		<p class="mt-6 rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">No bets placed yet.</p>
	{:else}
		<div class="mt-6 space-y-3">{#each data.bets as bet (bet.id)}
			<article class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
				<div class="flex items-start justify-between gap-3"><div><p class="text-sm font-semibold text-slate-950">{bet.selections.length === 1 ? 'Single' : `${bet.selections.length}-fold`}</p><p class="mt-0.5 text-xs text-slate-500">{new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(bet.placedAt))}</p></div><span class="rounded-full px-2 py-1 text-xs font-semibold" class:bg-amber-100={bet.status === 'pending'} class:text-amber-800={bet.status === 'pending'} class:bg-emerald-100={bet.status === 'won'} class:text-emerald-800={bet.status === 'won'} class:bg-rose-100={bet.status === 'lost'} class:text-rose-800={bet.status === 'lost'}>{bet.status}</span></div>
				<ul class="mt-3 space-y-1.5 text-sm">{#each bet.selections as selection}<li class="flex justify-between gap-3"><span>{selection.fixture.homeTeamName} v {selection.fixture.awayTeamName} · {selection.market.selection}</span><span class="shrink-0 tabular-nums text-slate-600">{selection.referenceOdds ?? '–'}</span></li>{/each}</ul>
				<div class="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-slate-100 pt-3 text-sm"><span>Stake <strong>{money(bet.stake)}</strong></span><span>Odds <strong>{bet.placedOdds}</strong></span><span>Return <strong>{money(bet.returnAmount)}</strong></span>{#if bet.profit !== null}<span>Profit <strong class:text-emerald-700={bet.profit >= 0} class:text-rose-700={bet.profit < 0}>{money(bet.profit)}</strong></span>{/if}</div>
			</article>
		{/each}</div>
	{/if}
</div></main>
