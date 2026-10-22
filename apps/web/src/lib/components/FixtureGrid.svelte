<script lang="ts">
	import FixtureCard from './FixtureCard.svelte';
	import type { FixtureCardData, FixtureOddSelection } from '../types/fixtureCard';

	let {
		fixtures,
		hasFixtures,
		placedSelectionKeys = [],
		onSelectOdd
	}: {
		fixtures: FixtureCardData[];
		hasFixtures: boolean;
		placedSelectionKeys?: string[];
		onSelectOdd?: (fixture: FixtureCardData, selection: FixtureOddSelection) => void;
	} = $props();
</script>

{#if !hasFixtures}
	<section class="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
		<h2 class="text-lg font-semibold text-slate-950">No fixtures on this date</h2>
		<p class="mt-2 text-sm text-slate-600">There are no matches scheduled for this date.</p>
	</section>
{:else if fixtures.length === 0}
	<section class="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
		<h2 class="text-lg font-semibold text-slate-950">No leagues selected</h2>
		<p class="mt-2 text-sm text-slate-600">Select at least one league to show its fixtures.</p>
	</section>
{:else}
	<div class="grid grid-cols-1 items-start gap-4 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 2xl:gap-5">
		{#each fixtures as fixture (fixture.id)}
			<FixtureCard {fixture} {placedSelectionKeys} {onSelectOdd} />
		{/each}
	</div>
{/if}
