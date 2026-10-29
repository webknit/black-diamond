import { getBetsForFixturesByAccountId } from '@black-diamond/database/bets';
import { getBotdFixturesForDate } from '@black-diamond/database/botdFixtures';
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
	const matchingFixtures = (await getBotdFixturesForDate(date, selectedStrategyId, minimumOdds))
		.filter((item) => item.fixture && item.statsSnapshot)
		.sort((left, right) => left.fixture.fixture.timestamp - right.fixture.fixture.timestamp);
	const fixtureIds = matchingFixtures.map((item) => item.fixtureId);
	const bets = locals.accountId ? await getBetsForFixturesByAccountId(locals.accountId, fixtureIds) : [];
	const placedBetSelectionKeys = bets.flatMap((bet) => bet.selections.map((selection) =>
		`${selection.fixture.id}|${selection.market.name.toLowerCase()}|${selection.market.selection.toLowerCase()}`
	));

	return {
		date,
		totalFixtureCount: matchingFixtures.length,
		hasFixtures: matchingFixtures.length > 0,
		placedBetSelectionKeys,
		selectedStrategyId,
		minimumOdds,
		selectedStrategy,
		strategies: botdStrategies,
		fixtures: matchingFixtures.map((item) => {
			const fixture = item.fixture;
			const stats = item.statsSnapshot;
			return {
				id: item.fixtureId,
				timestamp: fixture.fixture.timestamp,
				status: fixture.fixture.status,
				round: fixture.league.round,
				leagueName: fixture.league.name,
				leagueId: fixture.league.id,
				leagueSeason: fixture.league.season,
				hasLeagueTable: item.hasLeagueTable ?? true,
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
				stats: {
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
				},
				odds: { odds: item.odds },
				prediction: item.prediction ? getFixturePrediction(item.prediction) : null,
				events: [],
				statistics: null,
				injuries: item.injuries,
				lineups: item.lineups
			};
		})
	};
}
