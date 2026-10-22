<script lang="ts">
	import { goto } from '$app/navigation';
	import FixtureDatePicker from '#lib/components/FixtureDatePicker.svelte';
	import FixtureGrid from '#lib/components/FixtureGrid.svelte';
	import FixtureStatusFilter from '#lib/components/FixtureStatusFilter.svelte';
	import LeagueFilter from '#lib/components/LeagueFilter.svelte';
	import { getUkDateKey } from '#lib/utils/time/getUkDateKey.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let isLoading = $state(false);
	let selectedLeagueIds = $state<number[] | null>(null);
	let leagueFilterOpen = $state(false);
	let showFinished = $state(false);
	let previousDate = $state<string>();

	// Leagues are calculated from this date's fixtures. Reset an old selection when
	// navigating to another date so it cannot silently filter the new matchday. Past
	// dates show finished matches; today and future dates begin focused on upcoming/live.
	$effect(() => {
		if (previousDate !== undefined && data.date !== previousDate) {
			selectedLeagueIds = null;
			leagueFilterOpen = false;
		}

		showFinished = data.date < getUkDateKey(new Date());
		previousDate = data.date;
	});

	const leagues = $derived(
		[
			...new Map(
				data.fixtures.map((fixture) => [
					fixture.leagueId,
					{
						id: fixture.leagueId,
						name: fixture.leagueName,
						country: fixture.leagueCountry || 'Other',
						order: fixture.leagueOrder
					}
				])
			).values()
		].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
	);
	const leaguesByCountry = $derived(
		Object.entries(
			leagues.reduce<Record<string, typeof leagues>>((groups, league) => {
				(groups[league.country] ??= []).push(league);
				return groups;
			}, {})
		)
			.sort(([, leaguesA], [, leaguesB]) => leaguesA[0].order - leaguesB[0].order)
			.map(([country, countryLeagues]) => ({
				country,
				leagues: countryLeagues
			}))
	);
	const completedStatuses = new Set(['FT', 'AET', 'PEN']);
	const filteredFixtures = $derived(
		data.fixtures.filter(
			(fixture) =>
				(selectedLeagueIds === null || selectedLeagueIds.includes(fixture.leagueId)) &&
				(showFinished || !completedStatuses.has(fixture.status.short))
		)
	);
	const selectedLeagueCount = $derived(
		selectedLeagueIds === null
			? leagues.length
			: leagues.filter((league) => selectedLeagueIds?.includes(league.id) ?? false).length
	);

	function toggleLeague(leagueId: number, checked: boolean) {
		const currentSelection = selectedLeagueIds ?? leagues.map((league) => league.id);
		selectedLeagueIds = checked
			? [...currentSelection, leagueId]
			: currentSelection.filter((id) => id !== leagueId);

		if (selectedLeagueIds.length === leagues.length) selectedLeagueIds = null;
	}

	function toggleCountry(leagueIds: number[], checked: boolean) {
		const currentSelection = selectedLeagueIds ?? leagues.map((league) => league.id);
		const countryLeagueIds = new Set(leagueIds);
		selectedLeagueIds = checked
			? [...new Set([...currentSelection, ...leagueIds])]
			: currentSelection.filter((id) => !countryLeagueIds.has(id));

		if (selectedLeagueIds.length === leagues.length) selectedLeagueIds = null;
	}

	function isLeagueSelected(leagueId: number): boolean {
		return selectedLeagueIds === null || selectedLeagueIds.includes(leagueId);
	}

	function areAllCountryLeaguesSelected(leagueIds: number[]): boolean {
		return leagueIds.every(isLeagueSelected);
	}

	function areSomeCountryLeaguesSelected(leagueIds: number[]): boolean {
		return leagueIds.some(isLeagueSelected) && !areAllCountryLeaguesSelected(leagueIds);
	}

	async function changeDate(event: Event) {
		const input = event.currentTarget;
		if (!(input instanceof HTMLInputElement) || !input.value) return;

		isLoading = true;
		try {
			await goto(`?date=${encodeURIComponent(input.value)}`);
		} finally {
			isLoading = false;
		}
	}

</script>

<svelte:head>
	<title>Black Diamond · Fixtures</title>
	<meta name="description" content="Football fixtures, team form, stats and odds by date." />
</svelte:head>

<main class="min-h-screen bg-slate-100">
	<div class="mx-auto max-w-[1800px] px-4 py-6 sm:px-6 sm:py-8">
		<header class="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
			<div class="min-w-0">
				<p class="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
					Black Diamond · Matchday
				</p>
				<h1 class="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
					Fixtures
				</h1>
				<p class="mt-1 mb-3 text-sm text-slate-600">{data.today} · All times UK</p>
				<FixtureDatePicker date={data.date} {isLoading} onDateChange={changeDate} />
			</div>

			{#if data.fixtures.length > 0}
				<div class="flex shrink-0 flex-wrap items-end gap-3">
					<FixtureStatusFilter bind:showFinished />
					<LeagueFilter
						groups={leaguesByCountry}
						{selectedLeagueCount}
						totalLeagueCount={leagues.length}
						{isLeagueSelected}
						{areAllCountryLeaguesSelected}
						{areSomeCountryLeaguesSelected}
						onToggleLeague={toggleLeague}
						onToggleCountry={toggleCountry}
						onSelectAll={() => (selectedLeagueIds = null)}
						bind:isOpen={leagueFilterOpen}
					/>
				</div>
			{/if}
		</header>

		<div aria-busy={isLoading}>
			<FixtureGrid fixtures={filteredFixtures} hasFixtures={data.fixtures.length > 0} />
		</div>
	</div>
</main>
