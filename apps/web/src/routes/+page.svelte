<script lang="ts">
	import FixtureCard from '#lib/components/FixtureCard.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const liveStatuses = new Set(['1H', '2H', 'ET', 'P', 'LIVE', 'HT', 'BT']);
	const completedStatuses = new Set(['FT', 'AET', 'PEN']);

	const liveCount = $derived(
		data.fixtures.filter((fixture) => liveStatuses.has(fixture.status.short)).length
	);
	const finishedCount = $derived(
		data.fixtures.filter((fixture) => completedStatuses.has(fixture.status.short)).length
	);
</script>

<svelte:head>
	<title>Black Diamond · Today's fixtures</title>
	<meta name="description" content="Today's football fixtures, team form, stats and odds." />
</svelte:head>

<main class="min-h-screen bg-slate-100">
	<div class="mx-auto max-w-[1800px] px-4 py-6 sm:px-6 sm:py-8">
		<header class="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
			<div>
				<p class="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
					Black Diamond · Matchday
				</p>
				<h1 class="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
					Today's fixtures
				</h1>
				<p class="mt-1 text-sm text-slate-600">{data.today} · All times UK</p>
			</div>

			{#if data.fixtures.length > 0}
				<dl class="flex gap-5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
					<div>
						<dt class="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Fixtures</dt>
						<dd class="text-lg font-semibold tabular-nums text-slate-950">
							{data.fixtures.length}
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
				</dl>
			{/if}
		</header>

		{#if data.fixtures.length === 0}
			<section class="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
				<h2 class="text-lg font-semibold text-slate-950">No fixtures today</h2>
				<p class="mt-2 text-sm text-slate-600">
					There are no matches scheduled for {data.today}.
				</p>
			</section>
		{:else}
			<div class="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 2xl:gap-5">
				{#each data.fixtures as fixture (fixture.id)}
					<FixtureCard fixture={fixture} />
				{/each}
			</div>
		{/if}
	</div>
</main>
