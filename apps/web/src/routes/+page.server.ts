import type { Actions } from './$types';
import { getFixtureSummariesBetweenDates } from '@black-diamond/database/fixtures';
import { getFixtureCardOdds } from '@black-diamond/database/fixtureOdds';
import { getFixtureCardSnapshots } from '@black-diamond/database/fixtureStatsSnapshots';
import { getFixtureEventsForFixtures } from '@black-diamond/database/fixtureEvents';
import { getFixtureStatisticsForFixtures } from '@black-diamond/database/fixtureStatistics';
import { getFixtureInjuriesForFixtures } from '@black-diamond/database/fixtureInjuries';
import { getFixtureLineupsForFixtures } from '@black-diamond/database/fixtureLineups';
import { getPredictionsForFixtures } from '@black-diamond/database/predictions';
import { getBetsForFixturesByAccountId } from '@black-diamond/database/bets';
import { getWatchlistFixtureIds } from '@black-diamond/database/fixtureWatchlist';
import { getLeaguesByIds } from '@black-diamond/database/leagues';
import { selectedLeagues } from '@black-diamond/core/selectedLeagues';
import { placeBetAction } from '#lib/server/bets/placeBetAction.js';
import { getUkDateKey } from '#lib/utils/time/getUkDateKey.js';

const ukTimeZone = 'Europe/London';
const fixturePageSize = 10;
const maximumFixtureLimit = 1000;
const selectedLeagueOrder = new Map<number, number>(
	selectedLeagues.map((league, index) => [league.id, index])
);

function getUtcDateKey(date: Date): string {
	return date.toISOString().slice(0, 10);
}

function isDateKey(value: string | null): value is string {
	if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
	return getUtcDateKey(new Date(`${value}T00:00:00.000Z`)) === value;
}

function getLeagueIds(value: string | null): number[] | null {
	if (value === null) return null;
	if (value === 'none') return [];

	return [...new Set(
		value
			.split(',')
			.map(Number)
			.filter((leagueId) => Number.isSafeInteger(leagueId) && leagueId > 0)
	)];
}

function getFixtureIds(value: string | null): number[] | null {
	if (value === null) return null;
	return [...new Set(value.split(',').map(Number).filter((fixtureId) => Number.isSafeInteger(fixtureId) && fixtureId > 0))];
}

function getFixtureLimit(value: string | null): number {
	const limit = Number(value ?? fixturePageSize);
	return Number.isSafeInteger(limit) && limit > 0
		? Math.min(limit, maximumFixtureLimit)
		: fixturePageSize;
}

function getOverallTotal(total: number, home: number, away: number): number {
	return Number.isFinite(total) ? total : home + away;
}

function getStringValue(value: unknown): string | null {
	return typeof value === 'string' && value.trim() ? value : null;
}

function getRecordValue(value: unknown): Record<string, unknown> | null {
	return value !== null && typeof value === 'object' && !Array.isArray(value)
		? value as Record<string, unknown>
		: null;
}

export function getFixturePrediction(response: Record<string, unknown>) {
	const predictions = getRecordValue(response.predictions);
	if (!predictions) return null;

	const percent = getRecordValue(predictions.percent);
	const prediction = {
		advice: getStringValue(predictions.advice),
		percent: {
			home: getStringValue(percent?.home),
			draw: getStringValue(percent?.draw),
			away: getStringValue(percent?.away)
		}
	};

	return prediction.advice || Object.values(prediction.percent).some(Boolean) ? prediction : null;
}

export async function load({ url, locals }: { url: URL; locals: App.Locals }) {
	const minimalCardData = url.searchParams.get('minimal') === '1';
	const now = new Date();
	const todayUk = getUkDateKey(now);
	const requestedDate = url.searchParams.get('date');
	const selectedDate = isDateKey(requestedDate) ? requestedDate : todayUk;
	const fixtureLimit = getFixtureLimit(url.searchParams.get('limit'));
	const selectedLeagueIds = getLeagueIds(url.searchParams.get('leagues'));
	const selectedFixtureIds = getFixtureIds(url.searchParams.get('fixtureIds'));
	const showFinishedQuery = url.searchParams.get('ft');
	const showFinished = showFinishedQuery === null
		? selectedDate < todayUk
		: showFinishedQuery === '1';
	const selectedDateAtUtc = new Date(`${selectedDate}T00:00:00.000Z`);
	const selectedStart = getUtcDateKey(new Date(selectedDateAtUtc.getTime() - 24 * 60 * 60 * 1000));
	const selectedEnd = getUtcDateKey(new Date(selectedDateAtUtc.getTime() + 48 * 60 * 60 * 1000));
	const todayAtUtc = new Date(`${todayUk}T00:00:00.000Z`);
	const todayStart = getUtcDateKey(new Date(todayAtUtc.getTime() - 24 * 60 * 60 * 1000));
	const todayEnd = getUtcDateKey(new Date(todayAtUtc.getTime() + 48 * 60 * 60 * 1000));
	const [allSelectedFixtures, fetchedTodayFixtures] = await Promise.all([
		getFixtureSummariesBetweenDates(selectedStart, selectedEnd),
		selectedDate !== todayUk
			? getFixtureSummariesBetweenDates(todayStart, todayEnd)
			: Promise.resolve(null)
	]);
	const watchlistedFixtureIds = locals.accountId ? await getWatchlistFixtureIds(locals.accountId) : [];
	const selectedDayFixtures = allSelectedFixtures
		.filter((fixture) => getUkDateKey(new Date(fixture.fixture.timestamp * 1000)) === selectedDate)
		.sort((a, b) => a.fixture.timestamp - b.fixture.timestamp);
	const todaysFixtureSummaries =
		selectedDate === todayUk
			? selectedDayFixtures
			: (fetchedTodayFixtures ?? [])
					.filter((fixture) => getUkDateKey(new Date(fixture.fixture.timestamp * 1000)) === todayUk)
					.sort((a, b) => a.fixture.timestamp - b.fixture.timestamp);
	const filterableFixtures = selectedDayFixtures.filter(
		(fixture) =>
			fixture.fixture.status.short !== 'PST' &&
			(showFinished || !['FT', 'AET', 'PEN'].includes(fixture.fixture.status.short))
	);
	const leagues = [...new Map(filterableFixtures.map((fixture) => [
		fixture.league.id,
		{
			id: fixture.league.id,
			name: fixture.league.name,
			country: fixture.league.country || 'Other',
			order: selectedLeagueOrder.get(fixture.league.id) ?? Number.MAX_SAFE_INTEGER
		}
	])).values()].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
	const matchingFixtures = filterableFixtures.filter(
		(fixture) =>
			(selectedLeagueIds === null || selectedLeagueIds.includes(fixture.league.id)) &&
			(selectedFixtureIds === null || selectedFixtureIds.includes(fixture.fixture.id))
	);
	const fixturesForPage = matchingFixtures.slice(0, fixtureLimit);
	const fixtureIds = fixturesForPage.map((fixture) => fixture.fixture.id);
	const marketFixtureIds = fixturesForPage
		.filter((fixture) => !['FT', 'AET', 'PEN'].includes(fixture.fixture.status.short))
		.map((fixture) => fixture.fixture.id);
	const relevantFixtureIds = [...new Set([
		...fixtureIds,
		...todaysFixtureSummaries.map((fixture) => fixture.fixture.id)
	])];
	const [statsSnapshots, fixtureOdds, predictions, fixtureEvents, fixtureStatistics, fixtureInjuries, fixtureLineups, bets, leagueDocuments] = await Promise.all([
		minimalCardData ? Promise.resolve([]) : getFixtureCardSnapshots(fixtureIds),
		getFixtureCardOdds(fixtureIds),
		minimalCardData ? Promise.resolve([]) : getPredictionsForFixtures(marketFixtureIds),
		minimalCardData ? Promise.resolve([]) : getFixtureEventsForFixtures(fixtureIds),
		minimalCardData ? Promise.resolve([]) : getFixtureStatisticsForFixtures(fixtureIds),
		minimalCardData ? Promise.resolve([]) : getFixtureInjuriesForFixtures(fixtureIds),
		minimalCardData ? Promise.resolve([]) : getFixtureLineupsForFixtures(fixtureIds),
		locals.accountId
			? getBetsForFixturesByAccountId(locals.accountId, relevantFixtureIds)
			: Promise.resolve([]),
		getLeaguesByIds([...new Set(fixturesForPage.map((fixture) => fixture.league.id))])
	]);
	const statsByFixtureId = new Map(statsSnapshots.map((snapshot) => [snapshot.fixtureId, snapshot]));
	const oddsByFixtureId = new Map(fixtureOdds.map((odds) => [odds.fixtureId, odds]));
	const predictionsByFixtureId = new Map(predictions.map((prediction) => [prediction.fixtureId, prediction]));
	const eventsByFixtureId = new Map(fixtureEvents.map((fixtureEvent) => [fixtureEvent.fixtureId, fixtureEvent.events]));
	const statisticsByFixtureId = new Map(fixtureStatistics.map((statistics) => [statistics.fixtureId, statistics]));
	const injuriesByFixtureId = new Map(fixtureInjuries.map((injuries) => [injuries.fixtureId, injuries.injuries]));
	const lineupsByFixtureId = new Map(fixtureLineups.map((lineups) => [lineups.fixtureId, lineups.lineups]));
	const leaguesById = new Map(leagueDocuments.map((league) => [league.league.id, league]));
	const placedBetSelectionKeys = bets.flatMap((bet) =>
				bet.selections.map((selection) =>
					`${selection.fixture.id}|${selection.market.name.toLowerCase()}|${selection.market.selection.toLowerCase()}`
				)
			);
	const todayFixtureById = new Map(
		todaysFixtureSummaries.map((fixture) => [fixture.fixture.id, fixture])
	);
	const todaysBets = bets.flatMap((bet) => {
		const selections = bet.selections.flatMap((selection) => {
			const fixture = todayFixtureById.get(selection.fixture.id);
			if (!fixture) return [];
			return [{
				fixtureId: fixture.fixture.id,
				timestamp: fixture.fixture.timestamp,
				status: fixture.fixture.status.short,
				homeTeamName: fixture.teams.home.name,
				awayTeamName: fixture.teams.away.name,
				homeGoals: fixture.goals.home,
				awayGoals: fixture.goals.away,
				market: selection.market.selection
			}];
		});
		selections.sort((left, right) => left.timestamp - right.timestamp);
		return selections.length > 0
			? [{
					id: bet.id,
					status: bet.status,
					matchStatus: bet.matchStatus,
					stake: bet.stake,
					placedOdds: bet.placedOdds,
					profit: bet.profit,
					selections
				}]
			: [];
	}).sort(
		(left, right) =>
			left.selections[0].timestamp - right.selections[0].timestamp ||
			left.id.localeCompare(right.id)
	);

	return {
		date: selectedDate,
		todayDate: todayUk,
		appliedLeagueIds: selectedLeagueIds,
		appliedShowFinished: showFinished,
		fixtureLimit,
		totalFixtureCount: matchingFixtures.length,
		hasFixtures: selectedDayFixtures.length > 0,
		leagues,
		placedBetSelectionKeys,
		watchlistedFixtureIds,
		todaysBets,
		fixtures: fixturesForPage.map((fixture) => {
			const stats = statsByFixtureId.get(fixture.fixture.id);
			const odds = oddsByFixtureId.get(fixture.fixture.id);
			const prediction = predictionsByFixtureId.get(fixture.fixture.id);
			const fixtureStatistics = statisticsByFixtureId.get(fixture.fixture.id);
			const injuries = injuriesByFixtureId.get(fixture.fixture.id);
			const lineups = lineupsByFixtureId.get(fixture.fixture.id);

			return {
				id: fixture.fixture.id,
				timestamp: fixture.fixture.timestamp,
				status: {
					short: fixture.fixture.status.short,
					long: fixture.fixture.status.long,
					elapsed: fixture.fixture.status.elapsed
				},
				round: fixture.league.round,
				leagueName: fixture.league.name,
				leagueId: fixture.league.id,
				leagueSeason: fixture.league.season,
				hasLeagueTable: leaguesById.get(fixture.league.id)?.league.type !== 'Cup',
				leagueOrder: selectedLeagueOrder.get(fixture.league.id) ?? Number.MAX_SAFE_INTEGER,
				leagueCountry: fixture.league.country,
				leagueLogo: fixture.league.logo,
				venueName: fixture.fixture.venue.name,
				venueCity: fixture.fixture.venue.city,
				homeTeamName: fixture.teams.home.name,
				homeTeamId: fixture.teams.home.id,
				homeTeamLogo: fixture.teams.home.logo,
				awayTeamName: fixture.teams.away.name,
				awayTeamId: fixture.teams.away.id,
				awayTeamLogo: fixture.teams.away.logo,
				homeGoals: fixture.goals.home,
				awayGoals: fixture.goals.away,
				fullTimeScore: fixture.score?.fulltime,
				extraTimeScore: fixture.score?.extratime,
				penaltyScore: fixture.score?.penalty ?? fixture.score?.penalties,
				stats: stats
					? {
							home: {
								leaguePosition: stats.home.leaguePosition,
								leagueTeams: stats.home.leagueTeams,
								form: stats.home.form,
								formHome: stats.home.formHome,
								fixtures: {
									total: {
										played: stats.home.fixtures.total.played,
										goalsFor: getOverallTotal(
											stats.home.fixtures.total.goalsFor,
											stats.home.fixtures.home.goalsFor,
											stats.home.fixtures.away.goalsFor
										),
										goalsAgainst: getOverallTotal(
											stats.home.fixtures.total.goalsAgainst,
											stats.home.fixtures.home.goalsAgainst,
											stats.home.fixtures.away.goalsAgainst
										)
									},
									home: {
										played: stats.home.fixtures.home.played,
										wins: stats.home.fixtures.home.wins,
										draws: stats.home.fixtures.home.draws,
										loses: stats.home.fixtures.home.loses,
										goalsFor: stats.home.fixtures.home.goalsFor,
										goalsAgainst: stats.home.fixtures.home.goalsAgainst
									}
								},
								cleanSheets: {
									home: stats.home.cleanSheets.home,
									total: getOverallTotal(
										stats.home.cleanSheets.total,
										stats.home.cleanSheets.home,
										stats.home.cleanSheets.away
									)
								},
								summary: {
									wins: { percentage: stats.home.summary.wins.percentage },
									draws: { percentage: stats.home.summary.draws.percentage }
								}
							},
							away: {
								leaguePosition: stats.away.leaguePosition,
								leagueTeams: stats.away.leagueTeams,
								form: stats.away.form,
								formAway: stats.away.formAway,
								fixtures: {
									total: {
										played: stats.away.fixtures.total.played,
										goalsFor: getOverallTotal(
											stats.away.fixtures.total.goalsFor,
											stats.away.fixtures.home.goalsFor,
											stats.away.fixtures.away.goalsFor
										),
										goalsAgainst: getOverallTotal(
											stats.away.fixtures.total.goalsAgainst,
											stats.away.fixtures.home.goalsAgainst,
											stats.away.fixtures.away.goalsAgainst
										)
									},
									away: {
										played: stats.away.fixtures.away.played,
										wins: stats.away.fixtures.away.wins,
										draws: stats.away.fixtures.away.draws,
										loses: stats.away.fixtures.away.loses,
										goalsFor: stats.away.fixtures.away.goalsFor,
										goalsAgainst: stats.away.fixtures.away.goalsAgainst
									}
								},
								cleanSheets: {
									away: stats.away.cleanSheets.away,
									total: getOverallTotal(
										stats.away.cleanSheets.total,
										stats.away.cleanSheets.home,
										stats.away.cleanSheets.away
									)
								},
								summary: {
									wins: { percentage: stats.away.summary.wins.percentage },
									draws: { percentage: stats.away.summary.draws.percentage }
								}
							}
						}
					: null,
				odds: odds
					? {
							odds: odds.odds.map((market) => ({
								name: market.name,
								values: market.values.map(({ value, odd }) => ({ value, odd }))
							}))
						}
					: null,
				prediction: prediction ? getFixturePrediction(prediction.response) : null,
				events: eventsByFixtureId.get(fixture.fixture.id) ?? [],
				statistics: fixtureStatistics
					? {
							home: {
								shots: fixtureStatistics.home.shots,
								shotsOnTarget: fixtureStatistics.home.shotsOnTarget,
								possession: fixtureStatistics.home.possession
							},
							away: {
								shots: fixtureStatistics.away.shots,
								shotsOnTarget: fixtureStatistics.away.shotsOnTarget,
								possession: fixtureStatistics.away.possession
							}
						}
					: null,
				injuries: injuries ?? null,
				lineups: lineups ?? null
			};
		}),
		today: new Intl.DateTimeFormat('en-GB', {
			timeZone: ukTimeZone,
			weekday: 'long',
			day: 'numeric',
			month: 'long'
		}).format(new Date(`${selectedDate}T12:00:00.000Z`))
	};
}

export const actions: Actions = {
	placeBet: placeBetAction
};
