<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	function formatCurrency(value: number, currency: string) {
		return new Intl.NumberFormat('en-GB', {
			style: 'currency',
			currency,
			minimumFractionDigits: 2
		}).format(value);
	}
</script>

<svelte:head>
	<title>Black Diamond · Account</title>
</svelte:head>

{#if data.account}
	<main class="min-h-screen bg-slate-100">
		<div class="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
			<h1 class="text-xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Account</h1>
			<p class="mt-1 text-sm text-slate-600">{data.account.email}</p>

			<section class="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
				<p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Current balance</p>
				<p class="mt-1 text-3xl font-semibold tabular-nums tracking-tight text-slate-950">
					{formatCurrency(data.account.currentBalance, data.account.currency)}
				</p>
				<p class="mt-3 text-sm text-slate-600">
					Starting balance: {formatCurrency(data.account.startingBalance, data.account.currency)}
				</p>
			</section>
		</div>
	</main>
{/if}
