<script lang="ts">
	import type { FixtureStatsData } from '../types/fixtureCard';

	let {
		stats,
		homeTeamId,
		awayTeamId,
		onOpenLeagueStandings,
		onOpenTeamForm
	}: {
		stats: FixtureStatsData;
		homeTeamId: number;
		awayTeamId: number;
		onOpenLeagueStandings: (teamId: number) => void;
		onOpenTeamForm: (teamId: number, scope: 'home' | 'away' | 'overall') => void;
	} = $props();

	function outcomes(form: string) {
		return [...form];
	}

	function average(goals: number, played: number) {
		return Number.isFinite(goals) && Number.isFinite(played) && played > 0
			? (goals / played).toFixed(1)
			: '—';
	}

	function percentage(value: number) {
		return Math.round(value);
	}

	function recordPercentage(count: number, played: number) {
		return played > 0 ? percentage((count / played) * 100) : 0;
	}
</script>

<div class="grid grid-cols-2 divide-x divide-slate-100">
	{#each [
		{
			label: 'Home',
			teamId: homeTeamId,
			team: stats.home,
			form: stats.home.formHome,
			overallForm: stats.home.form,
			side: stats.home.fixtures.home,
			cleanSheets: stats.home.cleanSheets.home
		},
		{
			label: 'Away',
			teamId: awayTeamId,
			team: stats.away,
			form: stats.away.formAway,
			overallForm: stats.away.form,
			side: stats.away.fixtures.away,
			cleanSheets: stats.away.cleanSheets.away
		}
	] as panel}
		<div class="min-w-0 px-2 first:pl-0 last:pr-0">
			<div class="flex items-baseline justify-between gap-1">
				<span class="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
					{panel.label}
				</span>
				{#if panel.team.leaguePosition !== null}
					<button
						type="button"
						class="cursor-pointer text-[10px] text-slate-500 underline decoration-slate-300 underline-offset-2 hover:text-emerald-700 hover:decoration-emerald-500"
						onclick={() => onOpenLeagueStandings(panel.teamId)}
						aria-label={`Open league table for ${panel.label.toLowerCase()} team`}
					>
						<span class="text-slate-700">{panel.team.leaguePosition}</span>/{panel.team.leagueTeams}
						· {panel.team.fixtures.total.played} played
					</button>
				{:else}
					<span class="text-[10px] text-slate-500">—/{panel.team.leagueTeams} · {panel.team.fixtures.total.played} played</span>
				{/if}
			</div>

			<button type="button" class="mt-1 flex w-full items-center gap-2 text-left" onclick={() => onOpenTeamForm(panel.teamId, panel.label === 'Home' ? 'home' : 'away')} aria-label={`Open ${panel.label.toLowerCase()} recent fixtures for this team`}>
				<span class="w-10 shrink-0 text-[9px] text-slate-500 underline decoration-slate-300 underline-offset-2 hover:text-emerald-700 hover:decoration-emerald-500">{panel.label}</span>
				<div
					class="flex items-center gap-0.5"
					aria-label={`Recent ${panel.label.toLowerCase()} form ${panel.form || 'unavailable'}`}
				>
					{#each outcomes(panel.form) as outcome, index}
						<span
							class="flex items-center justify-center rounded text-[9px] font-bold"
							class:size-4={index < panel.form.length - 1}
							class:size-5={index === panel.form.length - 1}
							class:text-[10px]={index === panel.form.length - 1}
							class:shadow-sm={index === panel.form.length - 1}
							class:bg-emerald-100={outcome === 'W'}
							class:text-emerald-800={outcome === 'W'}
							class:bg-amber-100={outcome === 'D'}
							class:text-amber-800={outcome === 'D'}
							class:bg-rose-100={outcome === 'L'}
							class:text-rose-800={outcome === 'L'}
							title={index === panel.form.length - 1
								? `Most recent ${panel.label.toLowerCase()} result: ${outcome}`
								: `Recent result ${index + 1}: ${outcome}`}
						>
							{outcome}
						</span>
					{/each}
				</div>
			</button>

			<div class="mt-1 grid grid-cols-[2.5rem_1fr] items-center text-[8px] tabular-nums">
				<span class="text-slate-400">{panel.label === 'Home' ? 'H' : 'A'}</span>
				<div class="flex justify-between gap-1">
					<span class="text-emerald-700">W {recordPercentage(panel.side.wins, panel.side.played)}%</span>
					<span class="text-amber-800">D {recordPercentage(panel.side.draws, panel.side.played)}%</span>
					<span class="text-rose-700">L {recordPercentage(panel.side.loses, panel.side.played)}%</span>
				</div>
			</div>

			<button type="button" class="mt-1 flex w-full items-center gap-2 text-left" onclick={() => onOpenTeamForm(panel.teamId, 'overall')} aria-label="Open overall recent fixtures for this team">
				<span class="w-10 shrink-0 text-[9px] text-slate-400 underline decoration-slate-300 underline-offset-2 hover:text-emerald-700 hover:decoration-emerald-500">Overall</span>
				<div
					class="flex items-center gap-0.5"
					aria-label={`Recent overall form ${panel.overallForm || 'unavailable'}`}
				>
					{#each outcomes(panel.overallForm) as outcome, index}
						<span
							class="flex items-center justify-center rounded text-[8px] font-bold"
							class:size-3={index < panel.overallForm.length - 1}
							class:size-4={index === panel.overallForm.length - 1}
							class:text-[9px]={index === panel.overallForm.length - 1}
							class:shadow-sm={index === panel.overallForm.length - 1}
							class:bg-emerald-100={outcome === 'W'}
							class:text-emerald-800={outcome === 'W'}
							class:bg-amber-100={outcome === 'D'}
							class:text-amber-800={outcome === 'D'}
							class:bg-rose-100={outcome === 'L'}
							class:text-rose-800={outcome === 'L'}
							title={index === panel.overallForm.length - 1
								? `Most recent overall result: ${outcome}`
								: `Overall result ${index + 1}: ${outcome}`}
						>
							{outcome}
						</span>
					{/each}
				</div>
			</button>

			<div class="mt-1 grid grid-cols-[2.5rem_1fr] items-center text-[8px] tabular-nums">
				<span class="text-slate-400">Overall</span>
				<div class="flex justify-between gap-1">
					<span class="text-emerald-700">W {percentage(panel.team.summary.wins.percentage)}%</span>
					<span class="text-amber-800">D {percentage(panel.team.summary.draws.percentage)}%</span>
					<span class="text-rose-700">L {percentage(100 - panel.team.summary.wins.percentage - panel.team.summary.draws.percentage)}%</span>
				</div>
			</div>

			<div class="mt-2 grid grid-cols-[minmax(0,1fr)_auto] gap-x-2 gap-y-1 text-[10px] leading-tight text-slate-600">
				<span>GF / GA avg ({panel.label === 'Home' ? 'H' : 'A'})</span>
				<span class="whitespace-nowrap text-right tabular-nums">
					{average(panel.side.goalsFor, panel.side.played)} /
					{average(panel.side.goalsAgainst, panel.side.played)}
				</span>
				<span class="text-[9px] text-slate-400">Overall</span>
				<span class="whitespace-nowrap text-right text-[9px] tabular-nums text-slate-400">
					{average(panel.team.fixtures.total.goalsFor, panel.team.fixtures.total.played)} /
					{average(panel.team.fixtures.total.goalsAgainst, panel.team.fixtures.total.played)}
				</span>
				<span>Clean sheets ({panel.label === 'Home' ? 'H' : 'A'})</span>
				<span class="whitespace-nowrap text-right tabular-nums">
					{panel.cleanSheets}/{panel.side.played}
				</span>
				<span class="text-[9px] text-slate-400">Overall</span>
				<span class="whitespace-nowrap text-right text-[9px] tabular-nums text-slate-400">
					{panel.team.cleanSheets.total}/{panel.team.fixtures.total.played}
				</span>
			</div>
		</div>
	{/each}
</div>
