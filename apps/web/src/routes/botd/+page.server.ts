import { getBetsForFixturesByAccountId } from '@black-diamond/database/bets';
import { getBotdFixturesForDate } from '@black-diamond/database/botdFixtures';
import { getFixtureEventsForFixtures } from '@black-diamond/database/fixtureEvents';
import { getFixtureById } from '@black-diamond/database/fixtures';
import { getFixtureInjuriesForFixtures } from '@black-diamond/database/fixtureInjuries';
import { getFixtureLineupsForFixtures } from '@black-diamond/database/fixtureLineups';
import { getFixtureCardOdds } from '@black-diamond/database/fixtureOdds';
import { getFixtureStatisticsForFixtures } from '@black-diamond/database/fixtureStatistics';
import { getFixtureCardSnapshots } from '@black-diamond/database/fixtureStatsSnapshots';
import { getLeaguesByIds } from '@black-diamond/database/leagues';
import { getPredictionsForFixtures } from '@black-diamond/database/predictions';
import { selectedLeagues } from '@black-diamond/core/selectedLeagues';
import { botdStrategies } from '@black-diamond/core/strategies';
import { getUkDateKey } from '@black-diamond/core/time';
import { actions, getFixturePrediction } from '../+page.server.js';

export { actions };

const defaultStrategyId = 'score1.5-eitherTeam-last5';
const defaultMinimumOdds = 1.7;
const selectedLeagueOrder = new Map<number, number>(selectedLeagues.map((league, index) => [league.id, index]));

function getSelectedStrategyId(value: string | null) {
	return botdStrategies.some((strategy) => strategy.id === value) ? value! : defaultStrategyId;
}

function getMinimumOdds(value: string | null) {
	if (value === null) return defaultMinimumOdds;
	const odds = Number(value);
	return Number.isFinite(odds) && odds >= 0 && odds <= 100 ? odds : defaultMinimumOdds;
}

function getSelectedDate(value: string | null) {
	return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : getUkDateKey(new Date());
}

function getOverallTotal(total: number, home: number, away: number): number {
	return Number.isFinite(total) ? total : home + away;
}

export async function load({ url, locals }: { url: URL; locals: App.Locals }) {
	const date = getSelectedDate(url.searchParams.get('date'));
	const selectedStrategyId = getSelectedStrategyId(url.searchParams.get('strategy'));
	const minimumOdds = getMinimumOdds(url.searchParams.get('minOdds'));
	const selectedStrategy = botdStrategies.find((strategy) => strategy.id === selectedStrategyId)!;
	const botdFixtures = await getBotdFixturesForDate(date, selectedStrategyId, minimumOdds);
	const sourceFixtures = (await Promise.all(botdFixtures.map((fixture) => getFixtureById(fixture.fixtureId))))
		.filter((fixture): fixture is NonNullable<typeof fixture> => fixture !== null)
		.filter((fixture) => getUkDateKey(new Date(fixture.fixture.timestamp * 1000)) === date)
		.sort((left, right) => left.fixture.timestamp - right.fixture.timestamp);
	const fixtureIds = sourceFixtures.map((fixture) => fixture.fixture.id);
	const [snapshots, odds, predictions, events, statistics, injuries, lineups, bets, leagueDocuments] = await Promise.all([
		getFixtureCardSnapshots(fixtureIds), getFixtureCardOdds(fixtureIds), getPredictionsForFixtures(fixtureIds),
		getFixtureEventsForFixtures(fixtureIds), getFixtureStatisticsForFixtures(fixtureIds),
		getFixtureInjuriesForFixtures(fixtureIds), getFixtureLineupsForFixtures(fixtureIds),
		locals.accountId ? getBetsForFixturesByAccountId(locals.accountId, fixtureIds) : Promise.resolve([]),
		getLeaguesByIds([...new Set(sourceFixtures.map((fixture) => fixture.league.id))])
	]);
	const snapshotsByFixtureId = new Map(snapshots.map((item) => [item.fixtureId, item]));
	const oddsByFixtureId = new Map(odds.map((item) => [item.fixtureId, item]));
	const predictionsByFixtureId = new Map(predictions.map((item) => [item.fixtureId, item]));
	const eventsByFixtureId = new Map(events.map((item) => [item.fixtureId, item.events]));
	const statisticsByFixtureId = new Map(statistics.map((item) => [item.fixtureId, item]));
	const injuriesByFixtureId = new Map(injuries.map((item) => [item.fixtureId, item.injuries]));
	const lineupsByFixtureId = new Map(lineups.map((item) => [item.fixtureId, item.lineups]));
	const leaguesById = new Map(leagueDocuments.map((league) => [league.league.id, league]));
	const placedBetSelectionKeys = bets.flatMap((bet) => bet.selections.map((selection) => `${selection.fixture.id}|${selection.market.name.toLowerCase()}|${selection.market.selection.toLowerCase()}`));

	return {
		date, totalFixtureCount: sourceFixtures.length, hasFixtures: sourceFixtures.length > 0, placedBetSelectionKeys,
		selectedStrategyId, minimumOdds, selectedStrategy, strategies: botdStrategies,
		fixtures: sourceFixtures.map((fixture) => {
			const id = fixture.fixture.id;
			const stats = snapshotsByFixtureId.get(id);
			const fixtureOdds = oddsByFixtureId.get(id);
			const prediction = predictionsByFixtureId.get(id);
			const fixtureStatistics = statisticsByFixtureId.get(id);
			return {
				id, timestamp: fixture.fixture.timestamp, status: fixture.fixture.status, round: fixture.league.round,
				leagueName: fixture.league.name, leagueId: fixture.league.id, leagueSeason: fixture.league.season,
				hasLeagueTable: leaguesById.get(fixture.league.id)?.league.type !== 'Cup',
				leagueOrder: selectedLeagueOrder.get(fixture.league.id) ?? Number.MAX_SAFE_INTEGER,
				leagueCountry: fixture.league.country, leagueLogo: fixture.league.logo,
				venueName: fixture.fixture.venue.name, venueCity: fixture.fixture.venue.city,
				homeTeamName: fixture.teams.home.name, homeTeamId: fixture.teams.home.id, homeTeamLogo: fixture.teams.home.logo,
				awayTeamName: fixture.teams.away.name, awayTeamId: fixture.teams.away.id, awayTeamLogo: fixture.teams.away.logo,
				homeGoals: fixture.goals.home, awayGoals: fixture.goals.away,
				fullTimeScore: fixture.score?.fulltime, extraTimeScore: fixture.score?.extratime, penaltyScore: fixture.score?.penalty ?? fixture.score?.penalties,
				stats: stats ? {
					home: {
						leaguePosition: stats.home.leaguePosition, leagueTeams: stats.home.leagueTeams, form: stats.home.form, formHome: stats.home.formHome,
						fixtures: { total: { played: stats.home.fixtures.total.played, goalsFor: getOverallTotal(stats.home.fixtures.total.goalsFor, stats.home.fixtures.home.goalsFor, stats.home.fixtures.away.goalsFor), goalsAgainst: getOverallTotal(stats.home.fixtures.total.goalsAgainst, stats.home.fixtures.home.goalsAgainst, stats.home.fixtures.away.goalsAgainst) }, home: stats.home.fixtures.home },
						cleanSheets: { home: stats.home.cleanSheets.home, total: getOverallTotal(stats.home.cleanSheets.total, stats.home.cleanSheets.home, stats.home.cleanSheets.away) }, summary: { wins: { percentage: stats.home.summary.wins.percentage }, draws: { percentage: stats.home.summary.draws.percentage } }
					},
					away: {
						leaguePosition: stats.away.leaguePosition, leagueTeams: stats.away.leagueTeams, form: stats.away.form, formAway: stats.away.formAway,
						fixtures: { total: { played: stats.away.fixtures.total.played, goalsFor: getOverallTotal(stats.away.fixtures.total.goalsFor, stats.away.fixtures.home.goalsFor, stats.away.fixtures.away.goalsFor), goalsAgainst: getOverallTotal(stats.away.fixtures.total.goalsAgainst, stats.away.fixtures.home.goalsAgainst, stats.away.fixtures.away.goalsAgainst) }, away: stats.away.fixtures.away },
						cleanSheets: { away: stats.away.cleanSheets.away, total: getOverallTotal(stats.away.cleanSheets.total, stats.away.cleanSheets.home, stats.away.cleanSheets.away) }, summary: { wins: { percentage: stats.away.summary.wins.percentage }, draws: { percentage: stats.away.summary.draws.percentage } }
					}
				} : null,
				odds: fixtureOdds ? { odds: fixtureOdds.odds } : null,
				prediction: prediction ? getFixturePrediction(prediction.response) : null,
				events: eventsByFixtureId.get(id) ?? [],
				statistics: fixtureStatistics ? { home: fixtureStatistics.home, away: fixtureStatistics.away } : null,
				injuries: injuriesByFixtureId.get(id) ?? null, lineups: lineupsByFixtureId.get(id) ?? null
			};
		})
	};
}
