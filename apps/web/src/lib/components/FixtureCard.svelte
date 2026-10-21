<script lang="ts">
	import FixtureOdds from './FixtureOdds.svelte';
	import FixtureStats from './FixtureStats.svelte';
	import type { FixtureCardData } from '../types/fixtureCard';

	let { fixture }: { fixture: FixtureCardData } = $props();

	const ukTimeZone = 'Europe/London';
	const liveStatuses = new Set(['1H', '2H', 'ET', 'P', 'LIVE', 'HT', 'BT']);
	const completedStatuses = new Set(['FT', 'AET', 'PEN']);

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

		if (completedStatuses.has(fixture.status.short)) return 'Full time';
		return fixture.status.long;
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
				<p class="mt-1 truncate text-xs font-semibold text-slate-900 sm:text-sm">
					{fixture.homeTeamName}
				</p>
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
				<p
					class="mt-0.5 text-[10px] font-semibold"
					class:text-emerald-700={isLive(fixture.status.short)}
					class:text-slate-500={!isLive(fixture.status.short)}
				>
					{formatStatus()}
				</p>
			</div>

			<div class="min-w-0 text-center">
				<img
					class="mx-auto size-9 object-contain sm:size-10"
					src={fixture.awayTeamLogo}
					alt=""
					loading="lazy"
				/>
				<p class="mt-1 truncate text-xs font-semibold text-slate-900 sm:text-sm">
					{fixture.awayTeamName}
				</p>
			</div>
		</div>

		<div class="mt-3 flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-[10px] text-slate-500">
			<span>{formatDate(fixture.timestamp)}</span>
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
				<FixtureStats stats={fixture.stats} />
			{:else}
				<p class="text-center text-[10px] text-slate-500">
					Team statistics are not available yet.
				</p>
			{/if}
		</div>

		<FixtureOdds odds={fixture.odds} />
	</div>
</article>
