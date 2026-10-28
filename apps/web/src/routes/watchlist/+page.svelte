<script lang="ts">
	import { goto } from '$app/navigation';
	import FixtureGrid from '#lib/components/FixtureGrid.svelte';
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();
	let isLoading = $state(false);
	async function changeDate(event: Event) {
		const value = (event.currentTarget as HTMLInputElement).value;
		if (!value) return;
		isLoading = true;
		try {
			await goto(`/watchlist?date=${value}`);
		} finally {
			isLoading = false;
		}
	}
	async function toggleWatchlist(fixtureId: number) { await fetch(`/api/watchlist/${fixtureId}`, { method: 'POST' }); await goto(`/watchlist?date=${data.date}`); }
</script>
<svelte:head><title>Black Diamond · Watchlist</title></svelte:head>
<main class="min-h-screen bg-slate-100"><div class="mx-auto max-w-[1800px] px-4 py-6 sm:px-6 sm:py-8">
	<h1 class="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Watchlist</h1>
	<p class="mt-1 text-sm text-slate-600">Fixtures you have saved to keep an eye on.</p>
	<label class="mt-5 block text-[10px] font-bold uppercase tracking-wide text-slate-500" for="watchlist-date">Match date</label>
	<input id="watchlist-date" type="date" value={data.date} onchange={changeDate} class="mt-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800" />
	{#if isLoading}
		<div class="mt-5"><FixtureGrid fixtures={[]} hasFixtures={true} isLoading /></div>
	{:else if data.fixtures.length === 0}<section class="mt-5 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center"><h2 class="text-lg font-semibold text-slate-950">No saved fixtures on this date</h2><p class="mt-2 text-sm text-slate-600">Star a fixture to add it to your watchlist.</p></section>
	{:else}<div class="mt-5"><FixtureGrid fixtures={data.fixtures} hasFixtures={true} watchlistedFixtureIds={data.fixtures.map((fixture) => fixture.id)} onToggleWatchlist={toggleWatchlist} /></div>{/if}
</div></main>
