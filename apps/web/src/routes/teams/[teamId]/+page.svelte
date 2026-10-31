<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	type TeamFixture = PageProps['data']['fixtures']['recent'][number];

	function formatDate(timestamp: number) {
		return new Intl.DateTimeFormat('en-GB', {
			timeZone: 'Europe/London',
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		}).format(new Date(timestamp * 1000));
	}

	function average(value: string) {
		const parsed = Number(value);
		return Number.isFinite(parsed) ? parsed.toFixed(1) : '—';
	}

	function isHome(fixture: TeamFixture) {
		return fixture.teams.home.id === data.team.team.id;
	}

	function outcome(fixture: TeamFixture) {
		const home = isHome(fixture);
		const goalsFor = home ? fixture.goals.home : fixture.goals.away;
		const goalsAgainst = home ? fixture.goals.away : fixture.goals.home;
		return goalsFor! > goalsAgainst! ? 'W' : goalsFor === goalsAgainst ? 'D' : 'L';
	}

	function opponent(fixture: TeamFixture) {
		return isHome(fixture) ? fixture.teams.away.name : fixture.teams.home.name;
	}
</script>

<svelte:head>
	<title>{data.team.team.name} · Black Diamond</title>
</svelte:head>

<main class="min-h-screen bg-slate-100">
	<div class="mx-auto max-w-4xl px-3 py-4 sm:px-6 sm:py-6">
		<a href="/" class="inline-flex text-xs font-medium text-slate-600 hover:text-slate-950">← All fixtures</a>

		<section class="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
			<div class="flex items-center gap-4">
				<img class="size-16 object-contain sm:size-20" src={data.team.team.logo} alt="" />
				<div class="min-w-0">
					<h1 class="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">{data.team.team.name}</h1>
					<p class="mt-1 text-sm text-slate-600">{data.team.team.country ?? '—'}{data.team.team.founded ? ` · Founded ${data.team.team.founded}` : ''}</p>
					{#if data.team.venue.name}
						<p class="mt-1 text-xs text-slate-500">{data.team.venue.name}{data.team.venue.city ? ` · ${data.team.venue.city}` : ''}{data.team.venue.capacity ? ` · ${data.team.venue.capacity.toLocaleString()} capacity` : ''}</p>
					{/if}
				</div>
			</div>

			{#if data.standing}
				<div class="mt-5 border-t border-slate-100 pt-4 text-sm text-slate-600">
					<span class="font-semibold text-slate-950">League position {data.standing.rank}</span>/{data.standings?.league.standings.flat().length ?? '—'}
					<span class="mx-2 text-slate-300">·</span>{data.standing.points} points
					<span class="mx-2 text-slate-300">·</span>{data.standing.all.played} played
				</div>
			{/if}
		</section>

		{#if data.stats}
			<section class="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
				<h2 class="text-base font-semibold text-slate-950">Season profile</h2>
				<div class="mt-4 overflow-x-auto">
					<table class="w-full min-w-[34rem] text-left text-xs">
						<thead class="border-b border-slate-100 text-slate-500"><tr><th class="pb-2 font-medium"> </th><th class="pb-2 text-right font-medium">Home</th><th class="pb-2 text-right font-medium">Away</th><th class="pb-2 text-right font-medium">Overall</th></tr></thead>
						<tbody class="divide-y divide-slate-100 text-slate-700">
							<tr><th class="py-2 font-medium text-slate-900">Played</th><td class="py-2 text-right">{data.stats.fixtures.played.home}</td><td class="py-2 text-right">{data.stats.fixtures.played.away}</td><td class="py-2 text-right">{data.stats.fixtures.played.total}</td></tr>
							<tr><th class="py-2 font-medium text-slate-900">Wins</th><td class="py-2 text-right">{data.stats.fixtures.wins.home}</td><td class="py-2 text-right">{data.stats.fixtures.wins.away}</td><td class="py-2 text-right">{data.stats.fixtures.wins.total}</td></tr>
							<tr><th class="py-2 font-medium text-slate-900">Goals scored / game</th><td class="py-2 text-right">{average(data.stats.goals.for.average.home)}</td><td class="py-2 text-right">{average(data.stats.goals.for.average.away)}</td><td class="py-2 text-right">{average(data.stats.goals.for.average.total)}</td></tr>
							<tr><th class="py-2 font-medium text-slate-900">Goals conceded / game</th><td class="py-2 text-right">{average(data.stats.goals.against.average.home)}</td><td class="py-2 text-right">{average(data.stats.goals.against.average.away)}</td><td class="py-2 text-right">{average(data.stats.goals.against.average.total)}</td></tr>
							<tr><th class="py-2 font-medium text-slate-900">Clean sheets</th><td class="py-2 text-right">{data.stats.clean_sheet.home}</td><td class="py-2 text-right">{data.stats.clean_sheet.away}</td><td class="py-2 text-right">{data.stats.clean_sheet.total}</td></tr>
							<tr><th class="py-2 font-medium text-slate-900">Failed to score</th><td class="py-2 text-right">{data.stats.failed_to_score.home}</td><td class="py-2 text-right">{data.stats.failed_to_score.away}</td><td class="py-2 text-right">{data.stats.failed_to_score.total}</td></tr>
						</tbody>
					</table>
				</div>
			</section>
		{/if}

		<section class="mt-4 grid gap-4 lg:grid-cols-2">
			<div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
				<h2 class="text-base font-semibold text-slate-950">Recent results</h2>
				{#if data.fixtures.recent.length === 0}<p class="mt-4 text-sm text-slate-500">No completed fixtures found.</p>
				{:else}<ol class="mt-3 divide-y divide-slate-100">{#each data.fixtures.recent as fixture (fixture.fixture.id)}
					<li class="flex items-center gap-3 py-3"><span class="flex size-6 shrink-0 items-center justify-center rounded text-[10px] font-bold" class:bg-emerald-100={outcome(fixture) === 'W'} class:text-emerald-800={outcome(fixture) === 'W'} class:bg-amber-100={outcome(fixture) === 'D'} class:text-amber-800={outcome(fixture) === 'D'} class:bg-rose-100={outcome(fixture) === 'L'} class:text-rose-800={outcome(fixture) === 'L'}>{outcome(fixture)}</span><div class="min-w-0 flex-1"><a class="block truncate font-medium text-slate-900 hover:text-emerald-700" href={`/fixtures/${fixture.fixture.id}`}>{opponent(fixture)}</a><p class="mt-0.5 text-[10px] text-slate-500">{isHome(fixture) ? 'Home' : 'Away'} · {formatDate(fixture.fixture.timestamp)}</p></div><strong class="text-sm tabular-nums text-slate-900">{fixture.goals.home} – {fixture.goals.away}</strong></li>
				{/each}</ol>{/if}
			</div>
			<div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
				<h2 class="text-base font-semibold text-slate-950">Upcoming fixtures</h2>
				{#if data.fixtures.upcoming.length === 0}<p class="mt-4 text-sm text-slate-500">No upcoming fixtures found.</p>
				{:else}<ol class="mt-3 divide-y divide-slate-100">{#each data.fixtures.upcoming as fixture (fixture.fixture.id)}
					<li class="flex items-center gap-3 py-3"><span class="w-9 shrink-0 text-center text-[10px] font-medium text-slate-500">{isHome(fixture) ? 'H' : 'A'}</span><div class="min-w-0 flex-1"><a class="block truncate font-medium text-slate-900 hover:text-emerald-700" href={`/fixtures/${fixture.fixture.id}`}>{opponent(fixture)}</a><p class="mt-0.5 text-[10px] text-slate-500">{formatDate(fixture.fixture.timestamp)} · {fixture.league.round ?? fixture.league.name}</p></div></li>
				{/each}</ol>{/if}
			</div>
		</section>
	</div>
</main>
