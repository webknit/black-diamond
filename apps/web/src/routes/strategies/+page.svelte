<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	function formatPercentage(value: number) {
		return `${value.toFixed(1)}%`;
	}

	function formatCurrency(value: number) {
		return new Intl.NumberFormat('en-GB', {
			style: 'currency',
			currency: 'GBP',
			signDisplay: 'always'
		}).format(value);
	}

	function formatKickoff(timestamp: number) {
		return new Intl.DateTimeFormat('en-GB', {
			weekday: 'short',
			day: 'numeric',
			month: 'short',
			hour: '2-digit',
			minute: '2-digit',
			timeZone: 'Europe/London'
		}).format(new Date(timestamp * 1000));
	}
</script>

<svelte:head>
	<title>Black Diamond · Strategies</title>
	<meta name="description" content="Upcoming fixtures matching Black Diamond betting strategies." />
</svelte:head>

<main class="min-h-screen bg-slate-100">
	<div class="mx-auto max-w-5xl px-3 py-4 sm:px-6 sm:py-6">
		<header class="mb-4 sm:mb-6">
			<h1 class="text-xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Strategies</h1>
			<p class="mt-1 text-xs text-slate-600 sm:mt-2 sm:text-sm">
				Upcoming fixtures that match your tested strategy conditions.
			</p>
		</header>

		<section class="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:mb-6">
			<p class="text-[10px] font-bold uppercase tracking-wide text-slate-500">Active strategy</p>
			<h2 class="mt-1 text-base font-semibold text-slate-950">Over 2.5 goals · both teams above league average</h2>
			<p class="mt-1 text-xs leading-5 text-slate-600">
				Both teams’ season Over 2.5 rate must be higher than their league’s current season rate, with reference odds of at least {data.minimumOver2_5ReferenceOdd.toFixed(2)}.
			</p>
		</section>

		<section class="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:mb-6">
			<div class="flex flex-wrap items-baseline justify-between gap-2">
				<div>
					<p class="text-[10px] font-bold uppercase tracking-wide text-slate-500">Current-season performance</p>
					<p class="mt-1 text-xs leading-5 text-slate-600">Flat £1 stakes. Only fixtures with a stored pre-match Over 2.5 price of {data.minimumOver2_5ReferenceOdd.toFixed(2)} or more are included.</p>
				</div>
			</div>
			<div class="mt-3 grid grid-cols-2 divide-x divide-y divide-slate-200 rounded-lg border border-slate-200 bg-slate-50 text-center sm:grid-cols-4 sm:divide-y-0">
				<div class="px-2 py-2"><p class="text-[9px] font-bold uppercase tracking-wide text-slate-500">Bets</p><p class="mt-1 text-sm font-semibold tabular-nums text-slate-900">{data.performance.bets}</p></div>
				<div class="px-2 py-2"><p class="text-[9px] font-bold uppercase tracking-wide text-slate-500">Wins / losses</p><p class="mt-1 text-sm font-semibold tabular-nums text-slate-900">{data.performance.wins} / {data.performance.losses}</p></div>
				<div class="px-2 py-2"><p class="text-[9px] font-bold uppercase tracking-wide text-slate-500">Profit / loss</p><p class="mt-1 text-sm font-semibold tabular-nums" class:text-emerald-700={data.performance.profit > 0} class:text-rose-700={data.performance.profit < 0} class:text-slate-900={data.performance.profit === 0}>{formatCurrency(data.performance.profit)}</p></div>
				<div class="px-2 py-2"><p class="text-[9px] font-bold uppercase tracking-wide text-slate-500">ROI</p><p class="mt-1 text-sm font-semibold tabular-nums text-slate-900">{data.performance.returnOnInvestment === null ? '—' : formatPercentage(data.performance.returnOnInvestment)}</p></div>
			</div>
			{#if data.performance.bets === 0}
				<p class="mt-3 text-xs text-slate-600">
					No historical fixture met every condition. {data.performance.fixturesWithEligibleOdds} completed fixtures have a stored pre-match Over 2.5 price of {data.minimumOver2_5ReferenceOdd.toFixed(2)} or more.
				</p>
			{/if}
		</section>

		{#if data.candidates.length === 0}
			<section class="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
				<h2 class="text-lg font-semibold text-slate-950">No matching fixtures in the next seven days</h2>
				<p class="mt-2 text-sm text-slate-600">
					{data.upcomingFixturesWithSnapshot} upcoming fixtures have a pre-match snapshot, but none currently match this strategy.
				</p>
			</section>
		{:else}
			<div class="space-y-3">
				{#each data.candidates as candidate (candidate.fixtureId)}
					<article class="rounded-xl border border-emerald-200 bg-white p-4 shadow-sm">
						<div class="flex flex-wrap items-start justify-between gap-2">
							<div>
								<p class="text-[10px] font-bold uppercase tracking-wide text-emerald-700">Matches strategy</p>
								<h2 class="mt-1 text-base font-semibold text-slate-950">
									{candidate.homeTeam} <span class="font-normal text-slate-500">v</span> {candidate.awayTeam}
								</h2>
								<p class="mt-1 text-xs text-slate-600">
									{formatKickoff(candidate.timestamp)} · {candidate.league.country} · {candidate.league.name}
								</p>
							</div>
							<span class="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-800">Over 2.5 candidate</span>
						</div>
						<div class="mt-4 grid grid-cols-2 divide-x divide-y divide-slate-200 rounded-lg border border-slate-200 bg-slate-50 text-center sm:grid-cols-4 sm:divide-y-0">
							<div class="px-2 py-2">
								<p class="text-[9px] font-bold uppercase tracking-wide text-slate-500">League O2.5</p>
								<p class="mt-1 text-sm font-semibold tabular-nums text-slate-900">{formatPercentage(candidate.leagueOver2_5Percentage)}</p>
							</div>
							<div class="px-2 py-2">
								<p class="text-[9px] font-bold uppercase tracking-wide text-slate-500">Home all O2.5</p>
								<p class="mt-1 text-sm font-semibold tabular-nums text-emerald-700">{formatPercentage(candidate.homeOver2_5Percentage)}</p>
							</div>
							<div class="px-2 py-2">
								<p class="text-[9px] font-bold uppercase tracking-wide text-slate-500">Away all O2.5</p>
								<p class="mt-1 text-sm font-semibold tabular-nums text-emerald-700">{formatPercentage(candidate.awayOver2_5Percentage)}</p>
							</div>
							<div class="px-2 py-2">
								<p class="text-[9px] font-bold uppercase tracking-wide text-slate-500">Reference O2.5 odds</p>
								<p class="mt-1 text-sm font-semibold tabular-nums text-slate-900">{candidate.referenceOdd.toFixed(2)}</p>
							</div>
						</div>
					</article>
				{/each}
			</div>
		{/if}
	</div>
</main>
