<script lang="ts">
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	function formatCurrency(value: number, currency: string) {
		return new Intl.NumberFormat('en-GB', {
			style: 'currency',
			currency,
			minimumFractionDigits: 2
		}).format(value);
	}

	const profitLoss = $derived(data.realizedProfitLoss);
	const contributedCapital = $derived(
		data.account ? data.account.startingBalance + data.account.totalDeposits : 0
	);
	const bankroll = $derived(
		data.account ? data.account.currentBalance + data.pendingBetSummary.totalStake : 0
	);
	const profitLossPercentage = $derived(
		contributedCapital !== 0
			? (profitLoss / contributedCapital) * 100
			: null
	);
	let notificationMessage = $state<string | null>(null);
	function base64ToBytes(value: string) { const padding = '='.repeat((4 - value.length % 4) % 4); const binary = atob((value + padding).replace(/-/g, '+').replace(/_/g, '/')); return Uint8Array.from(binary, (character) => character.charCodeAt(0)); }
	async function enableNotifications() {
		if (!data.vapidPublicKey || !('serviceWorker' in navigator) || !('PushManager' in window)) { notificationMessage = 'Notifications are not supported on this device.'; return; }
		const permission = await Notification.requestPermission();
		if (permission !== 'granted') { notificationMessage = 'Notifications were not enabled.'; return; }
		const registration = await navigator.serviceWorker.register('/service-worker.js');
		const subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: base64ToBytes(data.vapidPublicKey) });
		const response = await fetch('/api/push-subscription', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(subscription) });
		notificationMessage = response.ok ? 'Notifications enabled for watched fixtures.' : 'Could not save notification settings.';
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
				<p class="text-xs font-semibold uppercase tracking-wide text-slate-500">💰 Bankroll</p>
				<p class="mt-1 text-3xl font-semibold tabular-nums tracking-tight text-slate-950">
					{formatCurrency(bankroll, data.account.currency)}
				</p>
				<p class="mt-3 text-sm font-semibold" class:text-emerald-700={profitLoss >= 0} class:text-rose-700={profitLoss < 0}>
					📈 Profit / loss: {formatCurrency(profitLoss, data.account.currency)}
					{#if profitLossPercentage !== null}
						/ {profitLossPercentage.toFixed(2)}%
					{:else}
						/ –
					{/if}
				</p>
				<p class="mt-3 text-sm text-slate-600">
					Starting balance: {formatCurrency(data.account.startingBalance, data.account.currency)}
				</p>
				<p class="mt-1 text-sm text-slate-600">
					Deposits: {formatCurrency(data.account.totalDeposits, data.account.currency)}
				</p>
				<p class="mt-1 text-sm text-slate-600">
					Outstanding bets: {data.pendingBetSummary.count} · {formatCurrency(data.pendingBetSummary.totalStake, data.account.currency)} staked
				</p>
			</section>
			<section class="mt-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
				<h2 class="text-sm font-semibold text-slate-950">Fixture notifications</h2>
				<p class="mt-1 text-sm text-slate-600">Get goal and full-time alerts for fixtures on your watchlist.</p>
				<button type="button" class="mt-3 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700" onclick={enableNotifications}>Enable notifications</button>
				{#if notificationMessage}<p class="mt-2 text-sm text-slate-600">{notificationMessage}</p>{/if}
			</section>
			<section class="mt-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
				<h2 class="text-sm font-semibold text-slate-950">Add deposit</h2>
				<form
					method="POST"
					action="?/addDeposit"
					class="mt-3 flex flex-wrap items-end gap-3"
					onsubmit={(event) => {
						if (!confirm('Are you sure you want to add this deposit?')) event.preventDefault();
					}}
				>
					<label class="flex-1 text-sm font-medium text-slate-700">
						Amount ({data.account.currency})
						<input
							class="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm tabular-nums outline-none focus:border-emerald-600"
							type="number"
							name="amount"
							min="0.01"
							step="0.01"
							inputmode="decimal"
							placeholder="0.00"
							required
						/>
					</label>
					<button class="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800">
						Add deposit
					</button>
				</form>
				{#if form?.depositError}
					<p class="mt-2 text-sm text-rose-700" role="alert">{form.depositError}</p>
				{/if}
				{#if form?.depositSuccess}
					<p class="mt-2 text-sm text-emerald-700" role="status">Deposit added to your balance.</p>
				{/if}
			</section>
			<div class="mt-4 flex flex-wrap gap-3">
				<a class="inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700" href="/account/bets">View bets</a>
				<a class="inline-flex rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50" href="/account/balance-history">View balance history</a>
			</div>
		</div>
	</main>
{/if}
