import { selectedLeagues } from '@black-diamond/core/selectedLeagues';
import { getFixtureOddsForFixtures } from '@black-diamond/database/fixtureOdds';
import { getFinishedFixturesForAnalysis } from '@black-diamond/database/fixtureStatsSnapshots';
import { getLeagueStats } from '@black-diamond/database/leagueStats';
import { getStrategyPerformances } from '@black-diamond/database/strategyPerformances';
import {
	strategyDetails as storedStrategyDetails,
	teamFilterVariations as storedTeamFilterVariations
} from '@black-diamond/core/strategies';
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

async function loadLegacy({ url }: { url: URL }) {
	const now = new Date();
	const selectedLeagueIds = selectedLeagues.map((league) => league.id);
	const leagueStats = await getLeagueStats(selectedLeagueIds);
	const currentLeagueSeasons = leagueStats.map((stats) => ({
		leagueId: stats.league.id,
		season: stats.league.season
	}));
	const currentSeasonFinishedFixtures = await getFinishedFixturesForAnalysis(
		selectedLeagueIds,
		currentLeagueSeasons
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
	const fixturesWithRelevantOdds = selectedWeek === 'all'
		? currentSeasonFinishedFixtures
		: currentSeasonFinishedFixtures.filter(
				(fixture) => getUkWeekStartDateKey(new Date(fixture.fixture.timestamp * 1000)) === selectedWeek
			);
	const historicalOdds = await getFixtureOddsForFixtures(fixturesWithRelevantOdds.map((fixture) => fixture.fixture.id));
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

function getWeekEndTimestamp(weekStart: string) {
	const end = new Date(`${weekStart}T00:00:00.000Z`);
	end.setUTCDate(end.getUTCDate() + 7);
	return end.getTime() / 1000;
}

export async function load({ url }: { url: URL }) {
	const now = new Date();
	const oldest = new Date(now);
	oldest.setUTCDate(oldest.getUTCDate() - 28);
	const currentWeek = getUkWeekStartDateKey(now);
	const oldestWeek = getUkWeekStartDateKey(oldest);
	const storedPerformances = await getStrategyPerformances();
	const availableWeeks = [...new Set(storedPerformances.flatMap((performance) => Object.keys(performance.weeks)))]
		.filter((week) => week >= oldestWeek && week <= currentWeek)
		.sort((left, right) => right.localeCompare(left));
	const requestedWeek = url.searchParams.get('week');
	const selectedWeek = requestedWeek !== null && availableWeeks.includes(requestedWeek) ? requestedWeek : 'all';
	const byStrategyId = new Map<string, { bets: number; wins: number; losses: number; profit: number }>();
	for (const storedPerformance of storedPerformances) {
		const totals = selectedWeek === 'all'
			? storedPerformance.seasonPerformance
			: storedPerformance.weeks[selectedWeek];
		if (!totals) continue;
		const current = byStrategyId.get(storedPerformance.strategyId) ?? { bets: 0, wins: 0, losses: 0, profit: 0 };
		current.bets += totals.bets;
		current.wins += totals.wins;
		current.losses += totals.losses;
		current.profit += totals.profit;
		byStrategyId.set(storedPerformance.strategyId, current);
	}
	const performance = (strategyId: string) => {
		const result = byStrategyId.get(strategyId);
		const bets = result?.bets ?? 0;
		const profit = result?.profit ?? 0;
		return { bets, wins: result?.wins ?? 0, losses: result?.losses ?? 0, profit, returnOnInvestment: bets === 0 ? null : (profit / bets) * 100, fixturesWithPreMatchOdds: 0, fixturesWithEligibleOdds: 0 };
	};
	return {
		minimumOver2_5ReferenceOdd,
		selectedWeek,
		availableWeeks,
		teamFilterResults: storedTeamFilterVariations.map((variation) => ({ ...variation, ...performance(variation.id) })).sort((left, right) => right.profit - left.profit || (right.returnOnInvestment ?? Number.NEGATIVE_INFINITY) - (left.returnOnInvestment ?? Number.NEGATIVE_INFINITY)),
		strategies: storedStrategyDetails.map((strategy) => ({ ...strategy, performance: performance(strategy.id) }))
	};
}
