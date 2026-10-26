<script lang="ts">
	import BalanceHistory from '#lib/components/BalanceHistory.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	function formatCurrency(value: number, currency: string) {
		return new Intl.NumberFormat('en-GB', {
			style: 'currency',
			currency,
			minimumFractionDigits: 2
		}).format(value);
	}

	function formatDate(value: string) {
		return new Intl.DateTimeFormat('en-GB', {
			dateStyle: 'medium',
			timeStyle: 'short',
			timeZone: 'Europe/London'
		}).format(new Date(value));
	}

	function transactionLabel(type: string) {
		if (type === 'opening_balance') return 'Opening balance';
		if (type === 'deposit') return 'Deposit';
		if (type === 'bet_stake') return 'Bet stake';
		if (type === 'bet_payout') return 'Bet payout';
		if (type === 'bet_reversal') return 'Bet reversal';
		return 'Balance adjustment';
	}
</script>

<svelte:head>
	<title>Black Diamond · Balance history</title>
</svelte:head>

{#if data.account}
	<main class="min-h-screen bg-slate-100">
		<div class="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
			<a class="text-sm font-medium text-emerald-700 hover:text-emerald-800" href="/account">← Account</a>
			<h1 class="mt-3 text-2xl font-semibold tracking-tight text-slate-950">Balance history</h1>
			<p class="mt-1 text-sm text-slate-600">Track your balance and inspect each change · UK time</p>

			<BalanceHistory
				transactions={data.historyTransactions}
				bets={data.bets}
				currentBalance={data.account.currentBalance}
				currency={data.account.currency}
			/>

			<section class="mt-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
				<h2 class="text-sm font-semibold text-slate-950">All transactions</h2>
				{#if data.totalCount === 0}
					<p class="mt-3 text-sm text-slate-600">No balance transactions recorded yet. New balance changes will appear here.</p>
				{:else}
					<p class="mt-1 text-xs text-slate-500">
						Showing {(data.page - 1) * data.pageSize + 1}–{Math.min(data.page * data.pageSize, data.totalCount)} of {data.totalCount}
					</p>
					<div class="mt-3 overflow-x-auto">
						<table class="w-full min-w-[42rem] border-collapse text-left text-sm">
							<thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
								<tr>
									<th class="px-4 py-3 font-semibold">Date</th>
									<th class="px-4 py-3 font-semibold">Activity</th>
									<th class="px-4 py-3 text-right font-semibold">Change</th>
									<th class="px-4 py-3 text-right font-semibold">Available cash</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-slate-100">
								{#each data.transactions as transaction (transaction.id)}
									<tr>
										<td class="whitespace-nowrap px-4 py-3 text-slate-600">{formatDate(transaction.occurredAt)}</td>
										<td class="px-4 py-3">
											<p class="font-medium text-slate-900">{transactionLabel(transaction.type)}</p>
											{#if transaction.description}
												<p class="mt-0.5 text-xs text-slate-500">{transaction.description}</p>
											{/if}
										</td>
										<td
											class="whitespace-nowrap px-4 py-3 text-right font-medium tabular-nums"
											class:text-emerald-700={transaction.amount >= 0}
											class:text-rose-700={transaction.amount < 0}
										>
											{transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount, data.account.currency)}
										</td>
										<td class="whitespace-nowrap px-4 py-3 text-right tabular-nums text-slate-700">
											{formatCurrency(transaction.balanceAfter, data.account.currency)}
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
					<nav class="mt-4 flex items-center justify-between border-t border-slate-100 pt-3" aria-label="Transaction pages">
						{#if data.page > 1}
							<a
								class="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
								href="?page={data.page - 1}"
							>Previous</a>
						{:else}
							<span></span>
						{/if}
						<span class="text-xs text-slate-500">Page {data.page} of {Math.max(1, Math.ceil(data.totalCount / data.pageSize))}</span>
						{#if data.page * data.pageSize < data.totalCount}
							<a
								class="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
								href="?page={data.page + 1}"
							>Next</a>
						{:else}
							<span></span>
						{/if}
					</nav>
				{/if}
			</section>
		</div>
	</main>
{/if}
