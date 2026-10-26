<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	function displayNumber(value: number | null) {
		return value === null ? '–' : new Intl.NumberFormat('en-GB').format(value);
	}

	function formatDate(value: string | null) {
		if (!value) return '–';
		return new Intl.DateTimeFormat('en-GB', {
			dateStyle: 'medium',
			timeStyle: 'short',
			timeZone: 'Europe/London'
		}).format(new Date(value));
	}
</script>

<svelte:head>
	<title>Black Diamond · API status</title>
</svelte:head>

<main class="min-h-screen bg-slate-100">
	<div class="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
		<a class="text-sm font-medium text-emerald-700 hover:text-emerald-800" href="/account">← Account</a>
		<h1 class="mt-3 text-2xl font-semibold tracking-tight text-slate-950">API status</h1>
		<p class="mt-1 text-sm text-slate-600">Your API-Football subscription and request allowance.</p>

		{#if data.error}
			<section class="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-5">
				<h2 class="text-sm font-semibold text-rose-950">Status unavailable</h2>
				<p class="mt-1 text-sm text-rose-800">{data.error}</p>
				<p class="mt-3 text-xs text-rose-700">Add the same API_FOOTBALL_API_KEY used by data-sync to the web app’s server environment.</p>
			</section>
		{:else if data.status}
			<section class="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
				<div class="flex flex-wrap items-start justify-between gap-3">
					<div>
						<p class="text-xs font-semibold uppercase tracking-wide text-slate-500">API-Football</p>
						<h2 class="mt-1 text-lg font-semibold text-slate-950">{data.status.plan ?? 'Subscription details'}</h2>
					</div>
					{#if data.status.isSubscriptionActive !== null}
						<span class:!bg-emerald-100={data.status.isSubscriptionActive} class:!text-emerald-800={data.status.isSubscriptionActive} class:!bg-rose-100={!data.status.isSubscriptionActive} class:!text-rose-800={!data.status.isSubscriptionActive} class="rounded-full px-2.5 py-1 text-xs font-semibold">
							{data.status.isSubscriptionActive ? 'Active' : 'Inactive'}
						</span>
					{/if}
				</div>
				{#if data.status.subscriptionEndsAt}
					<p class="mt-3 text-sm text-slate-600">Subscription ends: {formatDate(data.status.subscriptionEndsAt)}</p>
				{/if}
			</section>

			<div class="mt-4 grid gap-4 sm:grid-cols-2">
				<section class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
					<p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Daily requests</p>
					<p class="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-slate-950">
						{displayNumber(data.status.daily.used)} <span class="text-slate-400">/</span> {displayNumber(data.status.daily.limit)}
					</p>
					<p class="mt-1 text-sm text-slate-600">used today</p>
					<p class="mt-4 text-sm font-medium text-emerald-700">{displayNumber(data.status.daily.remaining)} remaining</p>
				</section>
				<section class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
					<p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Per-minute allowance</p>
					<p class="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-slate-950">
						{displayNumber(data.status.perMinute.remaining)} <span class="text-slate-400">/</span> {displayNumber(data.status.perMinute.limit)}
					</p>
					<p class="mt-1 text-sm text-slate-600">requests remaining this minute</p>
				</section>
			</div>

			<p class="mt-4 text-xs text-slate-500">Last checked {formatDate(data.checkedAt ?? null)} · API-Football’s status call does not count against the daily quota.</p>
		{/if}
	</div>
</main>
