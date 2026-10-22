import { selectedLeagues } from '@black-diamond/core/selectedLeagues';
import { getLeagueStats } from '@black-diamond/database/leagueStats';

const selectedLeagueOrder = new Map<number, number>(
	selectedLeagues.map((league, index) => [league.id, index])
);

export async function load() {
	const leagueStats = await getLeagueStats(selectedLeagues.map((league) => league.id));

	return {
		leagueStats: leagueStats
			.sort(
				(a, b) =>
					(selectedLeagueOrder.get(a.league.id) ?? Number.MAX_SAFE_INTEGER) -
					(selectedLeagueOrder.get(b.league.id) ?? Number.MAX_SAFE_INTEGER)
			)
			.map((stats) => ({
				league: stats.league,
				fixturesPlayed: stats.fixturesPlayed,
				goalsPerFixture: stats.goals.averagePerFixture,
				bttsPercentage: stats.btts.percentage,
				zeroZeroPercentage: stats.under0_5.percentage,
				over1_5Percentage: stats.over1_5.percentage,
				over2_5Percentage: stats.over2_5.percentage,
				homeWinPercentage: stats.results.homeWins.percentage,
				drawPercentage: stats.results.draws.percentage,
				awayWinPercentage: stats.results.awayWins.percentage
			}))
	};
}
