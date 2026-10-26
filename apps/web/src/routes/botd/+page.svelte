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

	function changeDate(event: Event) {
		const input = event.currentTarget;
		if (!(input instanceof HTMLInputElement) || !input.value) return;
		void updateQuery({ date: input.value });
	}

	function changeStrategy(event: Event) {
		const input = event.currentTarget;
		if (!(input instanceof HTMLSelectElement)) return;
		void updateQuery({ strategy: input.value });
	}

	function changeMinimumOdds(event: Event) {
		const input = event.currentTarget;
		if (!(input instanceof HTMLSelectElement)) return;
		void updateQuery({ minimumOdds: input.value });
	}

	async function updateQuery(values: { date?: string; strategy?: string; minimumOdds?: string }) {
		const url = new URL(page.url.href);
		if (values.date) url.searchParams.set('date', values.date);
		if (values.strategy) url.searchParams.set('strategy', values.strategy);
		if (values.minimumOdds !== undefined) url.searchParams.set('minOdds', values.minimumOdds);
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
</script>

<svelte:head>
	<title>Black Diamond · Bet of the day</title>
	<meta name="description" content="Fixtures matching your selected betting strategy." />
</svelte:head>

<main class="min-h-screen bg-slate-100">
	<div class="mx-auto max-w-[1800px] px-4 py-6 sm:px-6 sm:py-8">
		<header class="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
			<div>
				<p class="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Black Diamond · Picks</p>
				<h1 class="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Bet of the day</h1>
				<p class="mt-1 text-sm text-slate-600">{data.totalFixtureCount} {data.totalFixtureCount === 1 ? 'fixture' : 'fixtures'} match this strategy.</p>
			</div>
			<div class="flex flex-wrap items-end gap-3">
				<FixtureDatePicker date={data.date} onDateChange={changeDate} />
				<div>
					<label for="botd-strategy" class="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">Strategy</label>
					<select id="botd-strategy" value={data.selectedStrategyId} onchange={changeStrategy} disabled={isLoading} class="max-w-72 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm disabled:cursor-wait disabled:opacity-60">
						{#each data.strategies as strategy (strategy.id)}
							<option value={strategy.id}>{strategy.title}</option>
						{/each}
					</select>
				</div>
				<div>
					<label for="botd-minimum-odds" class="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">Min. O2.5 odds</label>
					<select id="botd-minimum-odds" value={String(data.minimumOdds)} onchange={changeMinimumOdds} disabled={isLoading} class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm disabled:cursor-wait disabled:opacity-60">
						<option value="0">Any</option>
						<option value="1.7">1.70</option>
						<option value="2">2.00</option>
					</select>
				</div>
			</div>
		</header>

		<section class="mb-5 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
			<p class="text-[10px] font-bold uppercase tracking-wide text-slate-500">Selected strategy</p>
			<h2 class="mt-1 text-sm font-semibold text-slate-950">{data.selectedStrategy.title}</h2>
			<p class="mt-1 text-xs text-slate-600">{data.selectedStrategy.description}</p>
		</section>

		<FixtureGrid
			fixtures={data.fixtures}
			hasFixtures={data.hasFixtures}
			isLoading={isLoading}
			placedSelectionKeys={data.placedBetSelectionKeys}
			onSelectOdd={chooseOdd}
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
