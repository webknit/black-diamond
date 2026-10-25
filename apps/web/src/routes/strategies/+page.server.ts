import { selectedLeagues } from '@black-diamond/core/selectedLeagues';
import { getFixtureSummariesBetweenDates } from '@black-diamond/database/fixtures';
import { getFixtureOddsForFixtures } from '@black-diamond/database/fixtureOdds';
import { getFinishedFixturesForAnalysis, getFixtureStatsSnapshots } from '@black-diamond/database/fixtureStatsSnapshots';
import { getLeagueStats } from '@black-diamond/database/leagueStats';
import { getOver2_5ReferenceOdd } from '#lib/utils/odds/getOver2_5ReferenceOdd.js';
import { matchesOver25Strategy } from '#lib/server/strategies/matchesOver25Strategy.js';

const minimumOver2_5ReferenceOdd = 1.7;

function getUtcDateKey(date: Date) {
	return date.toISOString().slice(0, 10);
}

export async function load() {
	const now = new Date();
	const endDate = new Date(now);
	endDate.setUTCDate(endDate.getUTCDate() + 8);
	const selectedLeagueIds = selectedLeagues.map((league) => league.id);
	const selectedLeagueIdSet = new Set<number>(selectedLeagueIds);
	const upcomingFixtures = (await getFixtureSummariesBetweenDates(
		getUtcDateKey(now),
		getUtcDateKey(endDate)
	))
		.filter(
			(fixture) =>
				fixture.fixture.status.short === 'NS' &&
				fixture.fixture.timestamp * 1000 > now.getTime() &&
				selectedLeagueIdSet.has(fixture.league.id)
		)
		.sort((a, b) => a.fixture.timestamp - b.fixture.timestamp);
	const fixtureIds = upcomingFixtures.map((fixture) => fixture.fixture.id);
	const [snapshots, leagueStats, fixtureOdds, finishedFixtures] = await Promise.all([
		getFixtureStatsSnapshots(fixtureIds),
		getLeagueStats(selectedLeagueIds),
		getFixtureOddsForFixtures(fixtureIds),
		getFinishedFixturesForAnalysis(selectedLeagueIds)
	]);
	const snapshotsByFixtureId = new Map(snapshots.map((snapshot) => [snapshot.fixtureId, snapshot]));
	const leagueStatsByLeagueId = new Map(leagueStats.map((stats) => [stats.league.id, stats]));
	const oddsByFixtureId = new Map(fixtureOdds.map((odds) => [odds.fixtureId, odds]));

	const candidates = upcomingFixtures.flatMap((fixture) => {
		const snapshot = snapshotsByFixtureId.get(fixture.fixture.id);
		const stats = leagueStatsByLeagueId.get(fixture.league.id);
		const referenceOdd = getOver2_5ReferenceOdd(
			oddsByFixtureId.get(fixture.fixture.id)?.odds ?? []
		);
		if (!snapshot || !stats || referenceOdd === null || referenceOdd < minimumOver2_5ReferenceOdd) return [];

		const leagueOver2_5Percentage = stats.over2_5.percentage;
		const homeOver2_5Percentage = snapshot.home.summary.over2_5.percentage;
		const awayOver2_5Percentage = snapshot.away.summary.over2_5.percentage;
		if (!matchesOver25Strategy(homeOver2_5Percentage, awayOver2_5Percentage, leagueOver2_5Percentage)) return [];

		return [{
			fixtureId: fixture.fixture.id,
			timestamp: fixture.fixture.timestamp,
			league: fixture.league,
			homeTeam: fixture.teams.home.name,
			awayTeam: fixture.teams.away.name,
			leagueOver2_5Percentage,
			homeOver2_5Percentage,
			awayOver2_5Percentage,
			referenceOdd
		}];
	});
	const leagueStatsByLeagueAndSeason = new Map(
		leagueStats.map((stats) => [`${stats.league.id}:${stats.league.season}`, stats])
	);
	const currentSeasonFinishedFixtures = finishedFixtures.filter(
		(fixture) => leagueStatsByLeagueAndSeason.has(`${fixture.league.id}:${fixture.league.season}`)
	);
	const historicalOdds = await getFixtureOddsForFixtures(
		currentSeasonFinishedFixtures.map((fixture) => fixture.fixture.id)
	);
	const historicalOddsByFixtureId = new Map(historicalOdds.map((odds) => [odds.fixtureId, odds]));
	const historicalLeagueTotals = new Map<number, { fixtures: number; over25: number }>();
	let historicalFixturesWithPreMatchOdds = 0;
	let historicalFixturesWithEligibleOdds = 0;
	const historicalBets = currentSeasonFinishedFixtures.flatMap((fixture) => {
		const previousTotals = historicalLeagueTotals.get(fixture.league.id) ?? { fixtures: 0, over25: 0 };
		const leagueOver25Percentage =
			previousTotals.fixtures === 0 ? null : (previousTotals.over25 / previousTotals.fixtures) * 100;
		const won =
			fixture.goals.home !== null && fixture.goals.away !== null && fixture.goals.home + fixture.goals.away > 2;
		historicalLeagueTotals.set(fixture.league.id, {
			fixtures: previousTotals.fixtures + 1,
			over25: previousTotals.over25 + Number(won)
		});

		const snapshot = fixture.fixtureStatsSnapshot;
		const storedOdds = historicalOddsByFixtureId.get(fixture.fixture.id);
		const referenceOdd = getOver2_5ReferenceOdd(storedOdds?.odds ?? []);
		if (!snapshot || !storedOdds) return [];
		historicalFixturesWithPreMatchOdds += 1;
		if (referenceOdd === null || referenceOdd < minimumOver2_5ReferenceOdd) return [];
		historicalFixturesWithEligibleOdds += 1;

		const matchesStrategy = matchesOver25Strategy(
			snapshot.home.summary.over2_5.percentage,
			snapshot.away.summary.over2_5.percentage,
			leagueOver25Percentage
		);
		return matchesStrategy ? [{ won, profit: won ? referenceOdd - 1 : -1 }] : [];
	});
	const historicalWins = historicalBets.filter((bet) => bet.won).length;
	const historicalProfit = historicalBets.reduce((total, bet) => total + bet.profit, 0);

	return {
		candidates,
		upcomingFixturesWithSnapshot: upcomingFixtures.filter((fixture) => snapshotsByFixtureId.has(fixture.fixture.id)).length,
		minimumOver2_5ReferenceOdd,
		performance: {
			bets: historicalBets.length,
			wins: historicalWins,
			losses: historicalBets.length - historicalWins,
			profit: historicalProfit,
			returnOnInvestment: historicalBets.length === 0 ? null : (historicalProfit / historicalBets.length) * 100,
			fixturesWithPreMatchOdds: historicalFixturesWithPreMatchOdds,
			fixturesWithEligibleOdds: historicalFixturesWithEligibleOdds
		}
	};
}
