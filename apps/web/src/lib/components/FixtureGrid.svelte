<script lang="ts">
	import FixtureCard from './FixtureCard.svelte';
	import type { FixtureCardData, FixtureOddSelection } from '../types/fixtureCard';

	let {
		fixtures,
		hasFixtures,
		noLeaguesSelected = false,
		isLoading = false,
		placedSelectionKeys = [],
		onSelectOdd
	}: {
		fixtures: FixtureCardData[];
		hasFixtures: boolean;
		noLeaguesSelected?: boolean;
		isLoading?: boolean;
		placedSelectionKeys?: string[];
		onSelectOdd?: (fixture: FixtureCardData, selection: FixtureOddSelection) => void;
	} = $props();
</script>

{#if isLoading}
	<section class="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center" role="status">
		<span class="mx-auto block size-6 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-700"></span>
		<p class="mt-3 text-sm font-medium text-slate-600">Loading fixtures…</p>
	</section>
{:else if !hasFixtures}
	<section class="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
		<h2 class="text-lg font-semibold text-slate-950">No fixtures on this date</h2>
		<p class="mt-2 text-sm text-slate-600">There are no matches scheduled for this date.</p>
	</section>
{:else if fixtures.length === 0}
	<section class="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
		{#if noLeaguesSelected}
			<h2 class="text-lg font-semibold text-slate-950">No leagues selected</h2>
			<p class="mt-2 text-sm text-slate-600">Select at least one league to show its fixtures.</p>
		{:else}
			<h2 class="text-lg font-semibold text-slate-950">No fixtures match your filters</h2>
			<p class="mt-2 text-sm text-slate-600">Try changing the date, league, or finished-match filter.</p>
		{/if}
	</section>
{:else}
	<div class="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 min-[1300px]:!grid-cols-3 min-[1536px]:grid-cols-5 2xl:gap-5">
		{#each fixtures as fixture (fixture.id)}
			<FixtureCard {fixture} {placedSelectionKeys} {onSelectOdd} />
		{/each}
	</div>
{/if}
