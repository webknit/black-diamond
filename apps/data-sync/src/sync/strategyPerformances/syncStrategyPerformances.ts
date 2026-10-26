import { selectedLeagues } from "@black-diamond/core/selectedLeagues";
import type {
  StrategyPerformance,
  StrategyPerformanceTotals,
} from "@black-diamond/core/strategyPerformance";
import {
  getUkDateKey,
  getUkWeekStartDateKey,
} from "@black-diamond/core/time";
import {
  getOver2_5ReferenceOdd,
  matchesOver2_5LeagueAverageStrategy,
  matchesTeamFilterVariation,
  matchesVenueScoringStrategy,
  strategyDetails,
  teamFilterVariations,
} from "@black-diamond/core/strategies";
import { getFixtureOddsForFixtures } from "@black-diamond/database/fixtureOdds";
import {
  getFinishedFixturesWithStatsSnapshots,
  type FinishedFixtureWithStatsSnapshot,
} from "@black-diamond/database/fixtureStatsSnapshots";
import { getLeagueStats } from "@black-diamond/database/leagueStats";
import { upsertStrategyPerformances } from "@black-diamond/database/strategyPerformances";

const minimumOver2_5ReferenceOdd = 1.7;
const strategyVersion = 1;
const strategyIds = [
  ...strategyDetails.map((strategy) => strategy.id),
  ...teamFilterVariations.map((strategy) => strategy.id),
];

const emptyTotals = (): StrategyPerformanceTotals => ({ bets: 0, wins: 0, losses: 0, profit: 0 });

function addResult(totals: StrategyPerformanceTotals, won: boolean, referenceOdd: number) {
  totals.bets++;
  if (won) totals.wins++;
  else totals.losses++;
  totals.profit += won ? referenceOdd - 1 : -1;
}

function getPeriodTotals(
  periods: Record<string, StrategyPerformanceTotals>,
  key: string,
) {
  return (periods[key] ??= emptyTotals());
}

export async function syncStrategyPerformances(): Promise<number> {
  const leagueStats = await getLeagueStats(selectedLeagues.map((league) => league.id));
  let performanceCount = 0;

  for (const leagueStatsForSeason of leagueStats) {
    const fixtures = await getFinishedFixturesWithStatsSnapshots(
      leagueStatsForSeason.league.id,
      leagueStatsForSeason.league.season,
    );
    const performances = await createStrategyPerformances(
      fixtures,
      leagueStatsForSeason.league,
      leagueStatsForSeason.league.season,
    );
    await upsertStrategyPerformances(performances);
    performanceCount += performances.length;
    console.log(
      `[data-sync] Stored ${performances.length} strategy performances for ${leagueStatsForSeason.league.name}`,
    );
  }

  return performanceCount;
}

async function createStrategyPerformances(
  fixtures: FinishedFixtureWithStatsSnapshot[],
  league: StrategyPerformance["league"],
  season: number,
): Promise<StrategyPerformance[]> {
  const now = new Date().toISOString();
  const performances = new Map<string, StrategyPerformance>(
    strategyIds.map((strategyId) => [strategyId, {
      strategyId,
      strategyVersion,
      league,
      season,
      seasonPerformance: emptyTotals(),
      weeks: {},
      months: {},
      recalculatedAt: now,
    }]),
  );
  const odds = await getFixtureOddsForFixtures(fixtures.map((fixture) => fixture.fixture.id));
  const oddsByFixtureId = new Map(odds.map((fixtureOdds) => [fixtureOdds.fixtureId, fixtureOdds]));
  let priorFixtures = 0;
  let priorOver2_5 = 0;

  for (const fixture of fixtures) {
    const leagueOver2_5Percentage = priorFixtures === 0 ? null : (priorOver2_5 / priorFixtures) * 100;
    const won = fixture.goals.home !== null && fixture.goals.away !== null && fixture.goals.home + fixture.goals.away > 2;
    priorFixtures++;
    priorOver2_5 += Number(won);

    const snapshot = fixture.fixtureStatsSnapshot;
    const storedOdds = oddsByFixtureId.get(fixture.fixture.id);
    const referenceOdd = storedOdds ? getOver2_5ReferenceOdd(storedOdds.odds) : null;
    if (snapshot === null || referenceOdd === null || referenceOdd < minimumOver2_5ReferenceOdd) continue;

    const date = new Date(fixture.fixture.timestamp * 1000);
    const week = getUkWeekStartDateKey(date);
    const month = getUkDateKey(date).slice(0, 7);
    const record = (strategyId: string, matches: boolean) => {
      if (!matches) return;
      const performance = performances.get(strategyId)!;
      addResult(performance.seasonPerformance, won, referenceOdd);
      addResult(getPeriodTotals(performance.weeks, week), won, referenceOdd);
      addResult(getPeriodTotals(performance.months, month), won, referenceOdd);
    };

    record(strategyDetails[0].id, matchesOver2_5LeagueAverageStrategy(snapshot, leagueOver2_5Percentage));
    record(strategyDetails[1].id, matchesVenueScoringStrategy(snapshot));
    for (const variation of teamFilterVariations) {
      record(variation.id, matchesTeamFilterVariation(snapshot, variation));
    }
  }

  return [...performances.values()];
}
