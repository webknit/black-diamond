<script lang="ts">
	import { goto } from '$app/navigation';
	import BetSlip from '#lib/components/BetSlip.svelte';
	import type { BetSlipSelection } from '#lib/components/BetSlip.svelte';
	import FixtureCard from '#lib/components/FixtureCard.svelte';
	import type { FixtureCardData, FixtureOddSelection } from '#lib/types/fixtureCard.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let betSlipSelections = $state<BetSlipSelection[]>([]);
	const fixtureDate = $derived(new Date(data.fixture.timestamp * 1000).toISOString().slice(0, 10));

	function chooseOdd(fixture: FixtureCardData, selection: FixtureOddSelection) {
		if (!data.account) {
			void goto('/login');
			return;
		}

		const existingSelectionIndex = betSlipSelections.findIndex(
			(item) =>
				item.fixture.id === fixture.id &&
				item.selection.marketName === selection.marketName &&
				item.selection.value === selection.value
		);
		betSlipSelections = existingSelectionIndex === -1
			? [...betSlipSelections, { fixture, selection }]
			: betSlipSelections.filter((_, index) => index !== existingSelectionIndex);
	}
</script>

<svelte:head>
	<title>{data.fixture.homeTeamName} v {data.fixture.awayTeamName} · Black Diamond</title>
</svelte:head>

<main class="min-h-screen bg-slate-100">
	<div class="mx-auto max-w-xl px-3 py-4 sm:px-6 sm:py-6">
		<a href="/" class="inline-flex text-xs font-medium text-slate-600 hover:text-slate-950">← All fixtures</a>
		<header class="mb-4 mt-3">
			<h1 class="text-xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
				{data.fixture.homeTeamName} v {data.fixture.awayTeamName}
			</h1>
		</header>
		<FixtureCard
			fixture={data.fixture}
			placedSelectionKeys={data.placedBetSelectionKeys}
			onSelectOdd={chooseOdd}
		/>
	</div>
</main>

{#if data.account && betSlipSelections.length > 0}
	<BetSlip
		selections={betSlipSelections}
		date={fixtureDate}
		balance={data.account.currentBalance}
		currency={data.account.currency}
		onRemove={(index) => (betSlipSelections = betSlipSelections.filter((_, itemIndex) => itemIndex !== index))}
		onClose={() => (betSlipSelections = [])}
		onPlaced={() => (betSlipSelections = [])}
	/>
{/if}
