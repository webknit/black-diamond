<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import BetSlip from '#lib/components/BetSlip.svelte';
	import type { BetSlipSelection } from '#lib/components/BetSlip.svelte';
	import FixtureDatePicker from '#lib/components/FixtureDatePicker.svelte';
	import FixtureGrid from '#lib/components/FixtureGrid.svelte';
	import type { FixtureCardData, FixtureOddSelection } from '#lib/types/fixtureCard.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let isLoading = $state(false);
	let betSlipSelections = $state<BetSlipSelection[]>([]);
	let watchlistedFixtureIds = $state<number[]>([]);
	$effect(() => {
		watchlistedFixtureIds = data.watchlistedFixtureIds;
	});

	function changeDate(event: Event) {
		const input = event.currentTarget;
		if (!(input instanceof HTMLInputElement) || !input.value) return;
		void updateQuery({ date: input.value });
	}

	function changeMarket(event: Event) {
		const input = event.currentTarget;
		if (!(input instanceof HTMLSelectElement)) return;
		void updateQuery({ market: input.value || null });
	}

	async function updateQuery(values: { date?: string; market?: string | null }) {
		const url = new URL(page.url.href);
		if (values.date) url.searchParams.set('date', values.date);
		if (values.market === null) url.searchParams.delete('market');
		if (typeof values.market === 'string') url.searchParams.set('market', values.market);
		isLoading = true;
		try {
			await goto(`${url.pathname}${url.search}`);
		} finally {
			isLoading = false;
		}
	}

	function chooseOdd(fixture: FixtureCardData, selection: FixtureOddSelection) {
		if (!data.account) {
			void goto('/login');
			return;
		}

		const index = betSlipSelections.findIndex(
			(item) =>
				item.fixture.id === fixture.id &&
				item.selection.marketName === selection.marketName &&
				item.selection.value === selection.value
		);
		betSlipSelections = index === -1
			? [...betSlipSelections, { fixture, selection }]
			: betSlipSelections.filter((_, itemIndex) => itemIndex !== index);
	}

	async function toggleWatchlist(fixtureId: number) {
		if (!data.account) return void goto('/login');

		const response = await fetch(`/api/watchlist/${fixtureId}`, { method: 'POST' });
		if (!response.ok) return;

		const { starred } = (await response.json()) as { starred: boolean };
		watchlistedFixtureIds = starred
			? [...watchlistedFixtureIds, fixtureId]
			: watchlistedFixtureIds.filter((id) => id !== fixtureId);
	}
</script>

<svelte:head>
	<title>Black Diamond · Bet of the day</title>
	<meta name="description" content="Fixtures matching your selected betting strategy." />
</svelte:head>

<main class="min-h-screen bg-slate-100">
	<div class="mx-auto max-w-[1800px] px-4 py-6 sm:px-6 sm:py-8">
		<header class="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
			<div>
				<h1 class="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Bet of the day</h1>
				<p class="mt-1 text-sm text-slate-600">League-aware candidates only. {data.totalFixtureCount} {data.totalFixtureCount === 1 ? 'fixture has' : 'fixtures have'} a league-qualified recommendation.</p>
				<p class="mt-1 text-xs text-slate-500">In All markets, each fixture appears once and BOTD highlights its strongest locally supported strategy.</p>
			</div>
			<div class="flex flex-wrap items-end gap-3">
				<FixtureDatePicker date={data.date} onDateChange={changeDate} />
				<div>
					<label for="botd-market" class="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">Market</label>
					<select id="botd-market" value={data.selectedMarket ?? ''} onchange={changeMarket} disabled={isLoading} class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm disabled:cursor-wait disabled:opacity-60"><option value="">All markets</option><option value="over2_5">Over 2.5</option><option value="over1_5">Over 1.5</option><option value="over0_5">Over 0.5</option><option disabled>────────</option><option value="under2_5">Under 2.5</option><option value="under1_5">Under 1.5</option><option disabled>────────</option><option value="btts">BTTS</option><option value="bttns">BTNTS</option></select>
				</div>
			</div>
		</header>


		<FixtureGrid
			fixtures={data.fixtures}
			hasFixtures={data.hasFixtures}
			isLoading={isLoading}
			recommendedMarket={data.recommendedMarket}
			placedSelectionKeys={data.placedBetSelectionKeys}
			onSelectOdd={chooseOdd}
			{watchlistedFixtureIds}
			recommendationByFixtureId={data.recommendationByFixtureId}
			onToggleWatchlist={data.account ? toggleWatchlist : undefined}
		/>
	</div>
</main>

{#if betSlipSelections.length > 0 && data.account}
	<BetSlip
		selections={betSlipSelections}
		date={data.date}
		balance={data.account.currentBalance}
		currency={data.account.currency}
		onRemove={(index) => (betSlipSelections = betSlipSelections.filter((_, itemIndex) => itemIndex !== index))}
		onClose={() => (betSlipSelections = [])}
		onPlaced={() => (betSlipSelections = [])}
	/>
{/if}
