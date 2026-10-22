<script lang="ts">
	import { goto } from '$app/navigation';
	import FixtureDatePicker from '#lib/components/FixtureDatePicker.svelte';
	import FixtureGrid from '#lib/components/FixtureGrid.svelte';
	import FixtureStatusFilter from '#lib/components/FixtureStatusFilter.svelte';
	import BetSlip from '#lib/components/BetSlip.svelte';
	import type { BetSlipSelection } from '#lib/components/BetSlip.svelte';
	import LeagueFilter from '#lib/components/LeagueFilter.svelte';
	import { getUkDateKey } from '#lib/utils/time/getUkDateKey.js';
	import type { PageProps } from './$types';
	import type { FixtureCardData, FixtureOddSelection } from '#lib/types/fixtureCard.js';

	let { data }: PageProps = $props();
	let isLoading = $state(false);
	let selectedLeagueIds = $state<number[] | null>(null);
	let leagueFilterOpen = $state(false);
	let showFinished = $state(false);
	let previousDate = $state<string>();
	let betSlipSelections = $state<BetSlipSelection[]>([]);
	let todaysBetsExpanded = $state(true);

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
	const todaysBetWins = $derived(data.todaysBets.filter((bet) => bet.status === 'won').length);
	const todaysBetLosses = $derived(data.todaysBets.filter((bet) => bet.status === 'lost').length);
	const todaysBetsToPlay = $derived(
		data.todaysBets.filter((bet) => bet.status === 'pending' && bet.matchStatus === 'matched').length
	);
	const todaysUnmatchedBets = $derived(
		data.todaysBets.filter((bet) => bet.matchStatus === 'unmatched').length
	);

	function formatBetTime(timestamp: number) {
		return new Intl.DateTimeFormat('en-GB', {
			timeZone: 'Europe/London',
			hour: '2-digit',
			minute: '2-digit'
		}).format(new Date(timestamp * 1000));
	}

	function formatMoney(value: number) {
		return new Intl.NumberFormat('en-GB', {
			style: 'currency',
			currency: data.account?.currency ?? 'GBP',
			minimumFractionDigits: 2
		}).format(value);
	}

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
		if (existingSelectionIndex === -1) {
			betSlipSelections = [...betSlipSelections, { fixture, selection }];
			return;
		}

		betSlipSelections = betSlipSelections.filter((_, index) => index !== existingSelectionIndex);
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
				<FixtureDatePicker date={data.date} onDateChange={changeDate} />
			</div>

			{#if data.fixtures.length > 0 && !isLoading}
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

		{#if data.account && data.date === data.todayDate}
			<section class="mb-6 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm sm:px-4" aria-labelledby="todays-bets-heading">
				<button
					type="button"
					class="flex w-full flex-wrap items-center justify-between gap-x-3 gap-y-1 text-left"
					aria-expanded={todaysBetsExpanded}
					aria-controls="todays-bets-content"
					onclick={() => (todaysBetsExpanded = !todaysBetsExpanded)}
				>
					<span id="todays-bets-heading" class="text-sm font-semibold text-slate-950">
						Today's bets ({data.todaysBets.length})
					</span>
					<span class="flex items-center gap-2 text-[11px] font-medium tabular-nums text-slate-600">
						{todaysBetWins}/{todaysBetLosses} · {todaysBetsToPlay} to play
						{#if todaysUnmatchedBets > 0} · {todaysUnmatchedBets} unmatched{/if}
						<svg
							aria-hidden="true"
							viewBox="0 0 20 20"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							class="size-3 transition-transform"
							class:rotate-180={todaysBetsExpanded}
						><path d="m5 7.5 5 5 5-5" /></svg>
					</span>
				</button>

				{#if todaysBetsExpanded}
					<div id="todays-bets-content" class="mt-2 border-t border-slate-100 pt-2">
						{#if data.todaysBets.length === 0}
							<p class="py-1 text-xs text-slate-600">No bets on today's fixtures yet.</p>
						{:else}
							<ul class="divide-y divide-slate-100">
								{#each data.todaysBets as bet (bet.id)}
									<li class="py-2 first:pt-0 last:pb-0">
										<div class="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
											<div class="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-600">
												{#if bet.selections.length === 1}
													<span class="font-semibold tabular-nums text-slate-800">{formatBetTime(bet.selections[0].timestamp)}</span>
													<span class="rounded bg-slate-100 px-1 py-0.5 font-semibold">{bet.selections[0].status}</span>
												{:else}
													<span class="font-semibold text-slate-800">{bet.selections.length}-fold</span>
												{/if}
												<span
													class="rounded px-1 py-0.5 font-medium"
													class:bg-amber-100={bet.status === 'pending'}
													class:text-amber-800={bet.status === 'pending'}
													class:bg-emerald-100={bet.status === 'won'}
													class:text-emerald-800={bet.status === 'won'}
													class:bg-rose-100={bet.status === 'lost'}
													class:text-rose-800={bet.status === 'lost'}
													class:bg-slate-100={bet.status === 'void' || bet.matchStatus === 'unmatched'}
													class:text-slate-700={bet.status === 'void' || bet.matchStatus === 'unmatched'}
												>
													{bet.status === 'pending' && bet.matchStatus === 'unmatched' ? 'Unmatched' : bet.status}
												</span>
											</div>
											<p class="text-[11px] font-semibold tabular-nums text-slate-800">
												{formatMoney(bet.stake)} <span class="font-normal text-slate-500">|</span> {bet.placedOdds}
											</p>
										</div>
										{#each bet.selections as selection}
											<div class="mt-1 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 text-xs">
												<span class="min-w-0 text-slate-800">
													<span class="font-medium">{selection.market}</span>
													<span class="text-slate-600">
														· {selection.homeTeamName}
														{#if selection.homeGoals !== null && selection.awayGoals !== null}
															<strong class="mx-1 tabular-nums text-slate-900">{selection.homeGoals}–{selection.awayGoals}</strong>
														{:else}
															<span class="mx-1">v</span>
														{/if}
														{selection.awayTeamName}
													</span>
												</span>
												{#if bet.selections.length > 1}
													<span class="text-[10px] tabular-nums text-slate-500">
														{formatBetTime(selection.timestamp)} · {selection.status}
													</span>
												{/if}
											</div>
										{/each}
									</li>
								{/each}
							</ul>
						{/if}
					</div>
				{/if}
			</section>
		{/if}

		<div aria-busy={isLoading}>
			<FixtureGrid
				fixtures={filteredFixtures}
				hasFixtures={data.fixtures.length > 0}
				{isLoading}
				placedSelectionKeys={data.placedBetSelectionKeys}
				onSelectOdd={chooseOdd}
			/>
		</div>
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
