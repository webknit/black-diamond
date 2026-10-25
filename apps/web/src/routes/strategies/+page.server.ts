import { selectedLeagues } from '@black-diamond/core/selectedLeagues';
import { getFixtureOddsForFixtures } from '@black-diamond/database/fixtureOdds';
import { getFinishedFixturesForAnalysis } from '@black-diamond/database/fixtureStatsSnapshots';
import { getLeagueStats } from '@black-diamond/database/leagueStats';
import { getOver2_5ReferenceOdd } from '#lib/utils/odds/getOver2_5ReferenceOdd.js';
import { strategyDetails } from '#lib/strategies/strategyDetails.js';
import { matchesTeamFilterVariation, teamFilterVariations } from '#lib/server/strategies/teamFilterVariations.js';
import { getUkWeekStartDateKey } from '#lib/utils/time/getUkWeekStartDateKey.js';
import { matchesVenueScoringStrategy } from '#lib/server/strategies/matchesVenueScoringStrategy.js';
import { matchesOver25Strategy } from '#lib/server/strategies/matchesOver25Strategy.js';
import type { FixtureStatsSnapshot } from '@black-diamond/core/fixtureStatsSnapshot';

const minimumOver2_5ReferenceOdd = 1.7;

const strategies = [
	{
		...strategyDetails[0],
		matches: (snapshot: FixtureStatsSnapshot, leagueOver2_5Percentage: number | null) => matchesOver25Strategy(snapshot.home.summary.over2_5.percentage, snapshot.away.summary.over2_5.percentage, leagueOver2_5Percentage)
	},
	{
		...strategyDetails[1],
		matches: (snapshot: FixtureStatsSnapshot) => matchesVenueScoringStrategy(snapshot)
	}
] as const;

export async function load({ url }: { url: URL }) {
	const now = new Date();
	const selectedLeagueIds = selectedLeagues.map((league) => league.id);
	const [leagueStats, finishedFixtures] = await Promise.all([
		getLeagueStats(selectedLeagueIds),
		getFinishedFixturesForAnalysis(selectedLeagueIds)
	]);
	const leagueStatsByLeagueAndSeason = new Map(
		leagueStats.map((stats) => [`${stats.league.id}:${stats.league.season}`, stats])
	);
	const currentSeasonFinishedFixtures = finishedFixtures.filter(
		(fixture) => leagueStatsByLeagueAndSeason.has(`${fixture.league.id}:${fixture.league.season}`)
	);
	const oldestSelectableWeek = new Date(now);
	oldestSelectableWeek.setUTCDate(oldestSelectableWeek.getUTCDate() - 28);
	const currentWeek = getUkWeekStartDateKey(now);
	const oldestWeek = getUkWeekStartDateKey(oldestSelectableWeek);
	const availableWeeks = [...new Set(currentSeasonFinishedFixtures.map((fixture) => getUkWeekStartDateKey(new Date(fixture.fixture.timestamp * 1000))))]
		.filter((week) => week >= oldestWeek && week <= currentWeek)
		.sort((left, right) => right.localeCompare(left));
	const requestedWeek = url.searchParams.get('week');
	const selectedWeek = requestedWeek !== null && availableWeeks.includes(requestedWeek) ? requestedWeek : 'all';
	const historicalOdds = await getFixtureOddsForFixtures(
		currentSeasonFinishedFixtures.map((fixture) => fixture.fixture.id)
	);
	const historicalOddsByFixtureId = new Map(historicalOdds.map((odds) => [odds.fixtureId, odds]));
	const historicalLeagueTotals = new Map<number, { fixtures: number; over25: number }>();
	let historicalFixturesWithPreMatchOdds = 0;
	let historicalFixturesWithEligibleOdds = 0;
	const historicalVenueScoringBets: Array<{ won: boolean; profit: number }> = [];
	const historicalBetsByVariation = new Map(
		teamFilterVariations.map((variation) => [variation.id, [] as Array<{ won: boolean; profit: number }>])
	);
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
		const isInSelectedWeek = selectedWeek === 'all' || getUkWeekStartDateKey(new Date(fixture.fixture.timestamp * 1000)) === selectedWeek;
		if (!isInSelectedWeek) return [];
		if (matchesVenueScoringStrategy(snapshot)) {
			historicalVenueScoringBets.push({ won, profit: won ? referenceOdd - 1 : -1 });
		}
		for (const variation of teamFilterVariations) {
			if (matchesTeamFilterVariation(snapshot, variation)) {
				historicalBetsByVariation.get(variation.id)?.push({ won, profit: won ? referenceOdd - 1 : -1 });
			}
		}

		const matchesStrategy = matchesOver25Strategy(
			snapshot.home.summary.over2_5.percentage,
			snapshot.away.summary.over2_5.percentage,
			leagueOver25Percentage
		);
		return matchesStrategy ? [{ won, profit: won ? referenceOdd - 1 : -1 }] : [];
	});
	const historicalWins = historicalBets.filter((bet) => bet.won).length;
	const historicalProfit = historicalBets.reduce((total, bet) => total + bet.profit, 0);
	const historicalVenueScoringWins = historicalVenueScoringBets.filter((bet) => bet.won).length;
	const historicalVenueScoringProfit = historicalVenueScoringBets.reduce((total, bet) => total + bet.profit, 0);
	const teamFilterResults = teamFilterVariations.map((variation) => {
		const bets = historicalBetsByVariation.get(variation.id) ?? [];
		const wins = bets.filter((bet) => bet.won).length;
		const profit = bets.reduce((total, bet) => total + bet.profit, 0);
		return {
			...variation,
			bets: bets.length,
			wins,
			losses: bets.length - wins,
			profit,
			returnOnInvestment: bets.length === 0 ? null : (profit / bets.length) * 100
		};
	}).sort(
		(a, b) =>
			b.profit - a.profit ||
			(b.returnOnInvestment ?? Number.NEGATIVE_INFINITY) -
				(a.returnOnInvestment ?? Number.NEGATIVE_INFINITY)
	);

	return {
		minimumOver2_5ReferenceOdd,
		selectedWeek,
		availableWeeks,
		teamFilterResults,
		strategies: [
			{
				id: strategies[0].id,
				title: strategies[0].title,
				description: strategies[0].description,
				performance: {
					bets: historicalBets.length, wins: historicalWins, losses: historicalBets.length - historicalWins,
					profit: historicalProfit, returnOnInvestment: historicalBets.length === 0 ? null : (historicalProfit / historicalBets.length) * 100,
					fixturesWithPreMatchOdds: historicalFixturesWithPreMatchOdds, fixturesWithEligibleOdds: historicalFixturesWithEligibleOdds
				}
			},
			{
				id: strategies[1].id,
				title: strategies[1].title,
				description: strategies[1].description,
				performance: {
					bets: historicalVenueScoringBets.length, wins: historicalVenueScoringWins, losses: historicalVenueScoringBets.length - historicalVenueScoringWins,
					profit: historicalVenueScoringProfit, returnOnInvestment: historicalVenueScoringBets.length === 0 ? null : (historicalVenueScoringProfit / historicalVenueScoringBets.length) * 100,
					fixturesWithPreMatchOdds: historicalFixturesWithPreMatchOdds, fixturesWithEligibleOdds: historicalFixturesWithEligibleOdds
				}
			}
		]
	};
}
