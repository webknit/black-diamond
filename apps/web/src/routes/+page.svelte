<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import FixtureCard from '#lib/components/FixtureCard.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let isLoading = $state(false);
	let selectedLeagueIds = $state<number[] | null>(null);
	let leagueFilterDetails = $state<HTMLDetailsElement>();

	onMount(() => {
		function closeOnOutsideClick(event: PointerEvent) {
			const details = leagueFilterDetails;
			if (details && event.target instanceof Node && !details.contains(event.target)) details.open = false;
		}

		function closeOnEscape(event: KeyboardEvent) {
			if (event.key === 'Escape' && leagueFilterDetails) leagueFilterDetails.open = false;
		}

		document.addEventListener('pointerdown', closeOnOutsideClick);
		document.addEventListener('keydown', closeOnEscape);

		return () => {
			document.removeEventListener('pointerdown', closeOnOutsideClick);
			document.removeEventListener('keydown', closeOnEscape);
		};
	});

	const liveStatuses = new Set(['1H', '2H', 'ET', 'P', 'LIVE', 'HT', 'BT']);
	const completedStatuses = new Set(['FT', 'AET', 'PEN']);

	const leagues = $derived(
		[
			...new Map(
				data.fixtures.map((fixture) => [
					fixture.leagueId,
					{ id: fixture.leagueId, name: fixture.leagueName }
				])
			).values()
		].sort((a, b) => a.name.localeCompare(b.name))
	);
	const filteredFixtures = $derived(
		data.fixtures.filter(
			(fixture) =>
				selectedLeagueIds === null || selectedLeagueIds.includes(fixture.leagueId)
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

	const liveCount = $derived(
		filteredFixtures.filter((fixture) => liveStatuses.has(fixture.status.short)).length
	);
	const finishedCount = $derived(
		filteredFixtures.filter((fixture) => completedStatuses.has(fixture.status.short)).length
	);
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
				<form method="GET" class="flex items-end gap-2">
					<div>
						<label
							for="fixture-date"
							class="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500"
						>
							Choose date
						</label>
						<input
							id="fixture-date"
							name="date"
							type="date"
							value={data.date}
							onchange={changeDate}
							class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm"
						/>
					</div>
				</form>
				{#if isLoading}
					<p class="flex items-center gap-2 text-xs font-medium text-slate-500" role="status">
						<span class="size-3 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-700"></span>
						Loading fixtures…
					</p>
				{/if}
			</div>

			{#if data.fixtures.length > 0}
				<div class="flex shrink-0 flex-wrap items-end gap-3">
					<details bind:this={leagueFilterDetails} class="relative">
						<summary
							class="cursor-pointer list-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
						>
							Leagues
							<span class="ml-1 text-xs text-slate-500">
								{selectedLeagueCount}/{leagues.length}
							</span>
						</summary>
						<div class="absolute left-0 top-full z-20 mt-2 max-h-[calc(100dvh-8rem)] w-64 max-w-[calc(100vw-2rem)] overflow-y-auto rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
							<div class="mb-2 flex items-center justify-between">
								<p class="text-xs font-semibold uppercase tracking-wide text-slate-500">
									Include leagues
								</p>
								<button
									type="button"
									class="text-xs font-semibold text-emerald-700 hover:text-emerald-900"
									onclick={() => (selectedLeagueIds = null)}
								>
									Select all
								</button>
							</div>
							{#each leagues as league (league.id)}
								<label class="flex cursor-pointer items-center gap-2 rounded px-1 py-1.5 text-sm text-slate-700 hover:bg-slate-50">
									<input
										type="checkbox"
										checked={selectedLeagueIds === null || selectedLeagueIds.includes(league.id)}
										onchange={(event) => toggleLeague(league.id, event.currentTarget.checked)}
										class="size-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-700"
									/>
									<span class="truncate">{league.name}</span>
								</label>
							{/each}
						</div>
					</details>
					<!-- <dl class="flex gap-5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
					<div>
						<dt class="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Fixtures</dt>
						<dd class="text-lg font-semibold tabular-nums text-slate-950">
							{filteredFixtures.length}
						</dd>
					</div>
					<div>
						<dt class="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Live</dt>
						<dd class="text-lg font-semibold tabular-nums text-emerald-700">{liveCount}</dd>
					</div>
					<div>
						<dt class="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Finished</dt>
						<dd class="text-lg font-semibold tabular-nums text-slate-700">{finishedCount}</dd>
					</div>
					</dl> -->
				</div>
			{/if}
		</header>

		<div aria-busy={isLoading}>
			{#if data.fixtures.length === 0}
				<section class="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
					<h2 class="text-lg font-semibold text-slate-950">No fixtures on this date</h2>
					<p class="mt-2 text-sm text-slate-600">
						There are no matches scheduled for this date.
					</p>
				</section>
			{:else if filteredFixtures.length === 0}
				<section class="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
					<h2 class="text-lg font-semibold text-slate-950">No leagues selected</h2>
					<p class="mt-2 text-sm text-slate-600">
						Select at least one league to show its fixtures.
					</p>
				</section>
			{:else}
				<div class="grid grid-cols-1 items-start gap-4 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 2xl:gap-5">
					{#each filteredFixtures as fixture (fixture.id)}
						<FixtureCard fixture={fixture} />
					{/each}
				</div>
			{/if}
		</div>
	</div>
</main>
