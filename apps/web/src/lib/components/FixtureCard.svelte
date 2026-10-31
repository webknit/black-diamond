<script lang="ts">
	import FixtureOdds from './FixtureOdds.svelte';
	import FixtureStats from './FixtureStats.svelte';
	import FixtureEvents from './FixtureEvents.svelte';
	import FixtureTeamNews from './FixtureTeamNews.svelte';
	import FixtureFormModal from './FixtureFormModal.svelte';
	import LeagueStandingsModal from './LeagueStandingsModal.svelte';
	import type { FixtureCardData, FixtureOddSelection } from '../types/fixtureCard';

	let {
		fixture,
		placedSelectionKeys = [],
		onSelectOdd, isWatchlisted = false, onToggleWatchlist, recommendedMarket
	}: {
		fixture: FixtureCardData;
		placedSelectionKeys?: string[];
		onSelectOdd?: (fixture: FixtureCardData, selection: FixtureOddSelection) => void;
		isWatchlisted?: boolean;
		onToggleWatchlist?: (fixtureId: number) => void;
		recommendedMarket?: string | null;
	} = $props();

	const ukTimeZone = 'Europe/London';
	const liveStatuses = new Set(['1H', '2H', 'ET', 'P', 'LIVE', 'HT', 'BT']);
	const completedStatuses = new Set(['FT', 'AET', 'PEN']);
	const hasLeagueTable = $derived(fixture.hasLeagueTable ?? true);
	let leagueStandingsOpen = $state(false);
	let formRequestId = 0;
	let formSelection = $state<{ requestId: number; teamId: number; teamName: string; scope: 'home' | 'away' | 'overall' } | null>(null);
	function openLeagueStandings() {
		leagueStandingsOpen = true;
	}

	function openTeamForm(teamId: number, scope: 'home' | 'away' | 'overall') {
		formSelection = {
			requestId: ++formRequestId,
			teamId,
			teamName: teamId === fixture.homeTeamId ? fixture.homeTeamName : fixture.awayTeamName,
			scope
		};
	}

	function closeTeamForm(requestId: number) {
		if (formSelection?.requestId === requestId) formSelection = null;
	}

	function formatKickoff(timestamp: number) {
		return new Intl.DateTimeFormat('en-GB', {
			timeZone: ukTimeZone,
			hour: '2-digit',
			minute: '2-digit',
			hour12: false
		}).format(new Date(timestamp * 1000));
	}

	function formatDate(timestamp: number) {
		return new Intl.DateTimeFormat('en-GB', {
			timeZone: ukTimeZone,
			day: '2-digit',
			month: 'short',
			year: '2-digit'
		}).format(new Date(timestamp * 1000));
	}

	function isLive(status: string) {
		return liveStatuses.has(status);
	}

	function hasScore() {
		return (
			liveStatuses.has(fixture.status.short) ||
			(fixture.homeGoals !== null && fixture.awayGoals !== null)
		);
	}

	function formatStatus() {
		if (isLive(fixture.status.short)) {
			return fixture.status.elapsed === null ? 'Live' : `${fixture.status.elapsed}'`;
		}

		if (fixture.status.short === 'AET') return 'After extra time';
		if (fixture.status.short === 'PEN') return '';
		if (fixture.status.short === 'FT') return 'Full time';
		return fixture.status.long;
	}

	function hasResult(score: { home: number | null; away: number | null } | undefined) {
		return score?.home !== null && score?.home !== undefined && score.away !== null && score.away !== undefined;
	}
</script>

<article class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
	<header class="flex items-center gap-3 border-b border-slate-100 px-4 py-2.5">
		{#if fixture.leagueLogo}
			<img
				class="size-7 shrink-0 object-contain"
				src={fixture.leagueLogo}
				alt=""
				loading="lazy"
			/>
		{/if}
		<div class="min-w-0">
			<p class="truncate text-xs font-semibold text-slate-900">{fixture.leagueName}</p>
			<p class="truncate text-[10px] text-slate-500">{fixture.leagueCountry}</p>
		</div>
		{#if onToggleWatchlist}<button type="button" class="ml-auto rounded p-1 text-lg leading-none text-amber-500 hover:bg-amber-50" class:text-slate-300={!isWatchlisted} onclick={() => onToggleWatchlist(fixture.id)} aria-label={isWatchlisted ? 'Remove from watchlist' : 'Add to watchlist'}>{isWatchlisted ? '★' : '☆'}</button>{/if}
	</header>

	<div class="px-3 pb-3 pt-3">
		<div class="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
			<div class="min-w-0 text-center">
				<img
					class="mx-auto size-9 object-contain sm:size-10"
					src={fixture.homeTeamLogo}
					alt=""
					loading="lazy"
				/>
				<div class="mt-1 flex min-w-0 items-center justify-center gap-1">
					<p class="min-w-0 select-text truncate text-xs font-semibold text-slate-900 sm:text-sm">
						{fixture.homeTeamName}
					</p>
					<a
						href={`/teams/${fixture.homeTeamId}?league=${fixture.leagueId}&season=${fixture.leagueSeason}`}
						class="shrink-0 text-xs text-slate-400 hover:text-emerald-700"
						aria-label={`Open ${fixture.homeTeamName} team research`}
					>↗</a>
				</div>
			</div>

			<div class="min-w-16 text-center">
				{#if hasScore()}
					<p class="text-2xl font-bold tabular-nums tracking-tight text-slate-950">
						{fixture.homeGoals ?? 0} <span class="text-slate-400">–</span> {fixture.awayGoals ?? 0}
					</p>
				{:else}
					<p class="text-lg font-semibold tabular-nums text-slate-700">
						{formatKickoff(fixture.timestamp)}
					</p>
				{/if}
				{#if hasResult(fixture.extraTimeScore)}
					<p class="text-[9px] text-slate-500">
						AET {fixture.extraTimeScore?.home}–{fixture.extraTimeScore?.away}
					</p>
				{/if}
				{#if hasResult(fixture.penaltyScore)}
					<p class="text-[9px] font-semibold text-slate-600">
						Pens {fixture.penaltyScore?.home}–{fixture.penaltyScore?.away}
					</p>
				{/if}
				{#if fixture.status.short !== 'PEN'}
					<p
						class="mt-0.5 text-[10px] font-semibold"
						class:text-emerald-700={isLive(fixture.status.short)}
						class:text-slate-500={!isLive(fixture.status.short)}
					>
						{formatStatus()}
					</p>
				{/if}
				<FixtureEvents
					fixtureId={fixture.id}
					homeTeam={{ id: fixture.homeTeamId, name: fixture.homeTeamName, logo: fixture.homeTeamLogo }}
					awayTeam={{ id: fixture.awayTeamId, name: fixture.awayTeamName, logo: fixture.awayTeamLogo }}
					homeGoals={fixture.homeGoals}
					awayGoals={fixture.awayGoals}
					status={formatStatus()}
					statusShort={fixture.status.short}
				/>
				<FixtureTeamNews
					fixtureId={fixture.id}
					hasTeamNews={fixture.hasTeamNews}
					homeTeam={{ id: fixture.homeTeamId, name: fixture.homeTeamName }}
					awayTeam={{ id: fixture.awayTeamId, name: fixture.awayTeamName }}
				/>
			</div>

			<div class="min-w-0 text-center">
				<img
					class="mx-auto size-9 object-contain sm:size-10"
					src={fixture.awayTeamLogo}
					alt=""
					loading="lazy"
				/>
				<div class="mt-1 flex min-w-0 items-center justify-center gap-1">
					<p class="min-w-0 select-text truncate text-xs font-semibold text-slate-900 sm:text-sm">
						{fixture.awayTeamName}
					</p>
					<a
						href={`/teams/${fixture.awayTeamId}?league=${fixture.leagueId}&season=${fixture.leagueSeason}`}
						class="shrink-0 text-xs text-slate-400 hover:text-emerald-700"
						aria-label={`Open ${fixture.awayTeamName} team research`}
					>↗</a>
				</div>
			</div>
		</div>

		<div class="mt-3 flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-[10px] text-slate-500">
			<span>{formatDate(fixture.timestamp)}</span>
			{#if completedStatuses.has(fixture.status.short)}
				<span aria-hidden="true">·</span>
				<span>KO {formatKickoff(fixture.timestamp)}</span>
			{/if}
			{#if fixture.round}<span aria-hidden="true">·</span><span>{fixture.round}</span>{/if}
			{#if fixture.venueName}
				<span aria-hidden="true">·</span>
				<span class="max-w-40 truncate">
					{fixture.venueName}{fixture.venueCity ? `, ${fixture.venueCity}` : ''}
				</span>
			{/if}
		</div>

		<div class="mt-3 border-t border-slate-100 pt-3">
			{#if fixture.stats}
				<FixtureStats
					stats={fixture.stats}
					homeTeamId={fixture.homeTeamId}
					awayTeamId={fixture.awayTeamId}
					{hasLeagueTable}
					onOpenLeagueStandings={openLeagueStandings}
					onOpenTeamForm={openTeamForm}
				/>
			{:else}
				<p class="text-center text-[10px] text-slate-500">
					Team statistics are not available.
				</p>
			{/if}
		</div>

		{#if fixture.prediction}
			<div class="mt-2 border-t border-slate-100 pt-2 text-center text-[10px]">
				<div class="flex items-start justify-center">
				{#if fixture.prediction.advice}
					<span class="font-medium text-slate-700">
						{fixture.prediction.advice}
					</span>
				{/if}
				</div>
				<span class="mt-1 inline-block tabular-nums text-slate-500">
					H {fixture.prediction.percent.home ?? '–'} · D {fixture.prediction.percent.draw ?? '–'} · A {fixture.prediction.percent.away ?? '–'}
				</span>
			</div>
		{/if}

		<FixtureOdds odds={fixture.odds} fixtureId={fixture.id} {placedSelectionKeys} {recommendedMarket} onSelectOdd={(selection) => onSelectOdd?.(fixture, selection)} />
	</div>
	{#if hasLeagueTable}
		<LeagueStandingsModal
			leagueId={fixture.leagueId}
			season={fixture.leagueSeason}
			leagueName={fixture.leagueName}
			highlightedTeamIds={[fixture.homeTeamId, fixture.awayTeamId]}
			bind:isOpen={leagueStandingsOpen}
		/>
	{/if}
	{#if formSelection}
		{#key formSelection.requestId}
			<FixtureFormModal
				requestId={formSelection.requestId}
				fixtureId={fixture.id}
				teamId={formSelection.teamId}
				teamName={formSelection.teamName}
				scope={formSelection.scope}
				onClose={closeTeamForm}
			/>
		{/key}
	{/if}
</article>
