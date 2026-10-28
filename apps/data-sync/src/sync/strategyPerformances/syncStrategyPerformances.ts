import { selectedLeagues } from "@black-diamond/core/selectedLeagues";
import type {
  StrategyPerformance,
  StrategyPerformanceSummary,
  StrategyPerformanceTotals,
} from "@black-diamond/core/strategyPerformance";
import {
  getUkDateKey,
  getUkWeekStartDateKey,
} from "@black-diamond/core/time";
import {
	getBttsYesReferenceOdd,
	getBttsNoReferenceOdd,
	getStrategyOddsRangeIds,
  getOver1_5ReferenceOdd,
  getOver2_5ReferenceOdd,
	 matchesBttsStrategyVariation,
	 matchesBttnsStrategyVariation,
	 matchesOver2_5RateStrategyVariation,
	 matchesOver1_5StrategyVariation,
  leagueRateStrategyVariations,
	 matchesLeagueRateStrategyVariation,
  matchesTeamFilterVariation,
	 bttsStrategyVariations,
	 bttnsStrategyVariations,
	 over2_5RateStrategyVariations,
	 over1_5StrategyVariations,
	strategyOddsRanges,
  teamFilterVariations,
} from "@black-diamond/core/strategies";
import { getFixtureOddsForFixtures } from "@black-diamond/database/fixtureOdds";
import {
  getFinishedFixturesWithStatsSnapshots,
  type FinishedFixtureWithStatsSnapshot,
} from "@black-diamond/database/fixtureStatsSnapshots";
import { getLeagueStats } from "@black-diamond/database/leagueStats";
import {
  upsertStrategyPerformances,
  upsertStrategyPerformanceSummaries,
} from "@black-diamond/database/strategyPerformances";

const strategyVersion = 1;
const strategyIds = [
  ...teamFilterVariations.map((strategy) => strategy.id),
  ...over2_5RateStrategyVariations.map((strategy) => strategy.id),
  ...over1_5StrategyVariations.map((strategy) => strategy.id),
  ...bttsStrategyVariations.map((strategy) => strategy.id),
  ...bttnsStrategyVariations.map((strategy) => strategy.id),
  ...leagueRateStrategyVariations.map((strategy) => strategy.id),
];

type LeagueRateAccumulator = {
  fixturesPlayed: number;
  over1_5: number;
  over2_5: number;
  btts: number;
};

function createLeagueRateAccumulator(): LeagueRateAccumulator {
  return { fixturesPlayed: 0, over1_5: 0, over2_5: 0, btts: 0 };
}

function toLeagueRateContext(totals: LeagueRateAccumulator) {
  const percentage = (count: number) => totals.fixturesPlayed === 0 ? 0 : (count / totals.fixturesPlayed) * 100;
  return {
    fixturesPlayed: totals.fixturesPlayed,
    over1_5Percentage: percentage(totals.over1_5),
    over2_5Percentage: percentage(totals.over2_5),
    bttsPercentage: percentage(totals.btts),
  };
}

function addCompletedFixtureToLeagueRate(totals: LeagueRateAccumulator, fixture: FinishedFixtureWithStatsSnapshot) {
  if (fixture.goals.home === null || fixture.goals.away === null) return;
  const goals = fixture.goals.home + fixture.goals.away;
  totals.fixturesPlayed++;
  if (goals > 1) totals.over1_5++;
  if (goals > 2) totals.over2_5++;
  if (fixture.goals.home > 0 && fixture.goals.away > 0) totals.btts++;
}

const emptyTotals = (): StrategyPerformanceTotals => ({ bets: 0, wins: 0, losses: 0, profit: 0 });
const emptyOddsBand = () => ({ seasonPerformance: emptyTotals(), weeks: {}, months: {} });

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

function addTotals(target: StrategyPerformanceTotals, source: StrategyPerformanceTotals) {
  target.bets += source.bets;
  target.wins += source.wins;
  target.losses += source.losses;
  target.profit += source.profit;
}

function createSummary(strategyId: string, recalculatedAt: string): StrategyPerformanceSummary {
  return {
    strategyId,
    strategyVersion,
    seasonPerformance: emptyTotals(),
    weeks: {},
    months: {},
    oddsBands: Object.fromEntries(strategyOddsRanges.map((range) => [range.id, emptyOddsBand()])),
    recalculatedAt,
  };
}

function mergePeriods(
  target: Record<string, StrategyPerformanceTotals>,
  source: Record<string, StrategyPerformanceTotals>,
) {
  for (const [period, totals] of Object.entries(source)) {
    addTotals(getPeriodTotals(target, period), totals);
  }
}

function mergeIntoSummary(summary: StrategyPerformanceSummary, performance: StrategyPerformance) {
  addTotals(summary.seasonPerformance, performance.seasonPerformance);
  mergePeriods(summary.weeks, performance.weeks);
  mergePeriods(summary.months, performance.months);
  for (const [rangeId, totals] of Object.entries(performance.oddsBands)) {
    const target = summary.oddsBands[rangeId];
    if (!target) continue;
    addTotals(target.seasonPerformance, totals.seasonPerformance);
    mergePeriods(target.weeks, totals.weeks);
    mergePeriods(target.months, totals.months);
  }
}

export async function syncStrategyPerformances(): Promise<number> {
  const leagueStats = await getLeagueStats(selectedLeagues.map((league) => league.id));
  const recalculatedAt = new Date().toISOString();
  const summaries = new Map<string, StrategyPerformanceSummary>(
    strategyIds.map((strategyId) => [strategyId, createSummary(strategyId, recalculatedAt)]),
  );
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
    for (const performance of performances) {
      mergeIntoSummary(summaries.get(performance.strategyId)!, performance);
    }
    performanceCount += performances.length;
    console.log(
      `[data-sync] Stored ${performances.length} strategy performances for ${leagueStatsForSeason.league.name}`,
    );
  }

  await upsertStrategyPerformanceSummaries([...summaries.values()]);

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
      oddsBands: Object.fromEntries(strategyOddsRanges.map((range) => [range.id, emptyOddsBand()])),
      recalculatedAt: now,
    }]),
  );
  const odds = await getFixtureOddsForFixtures(fixtures.map((fixture) => fixture.fixture.id));
  const oddsByFixtureId = new Map(odds.map((fixtureOdds) => [fixtureOdds.fixtureId, fixtureOdds]));
  const leagueRates = createLeagueRateAccumulator();
  let currentKickoffTimestamp: number | null = null;
  let fixturesAtCurrentKickoff: FinishedFixtureWithStatsSnapshot[] = [];
  for (const fixture of fixtures) {
    if (currentKickoffTimestamp !== null && fixture.fixture.timestamp !== currentKickoffTimestamp) {
      for (const completedFixture of fixturesAtCurrentKickoff) {
        addCompletedFixtureToLeagueRate(leagueRates, completedFixture);
      }
      fixturesAtCurrentKickoff = [];
    }
    currentKickoffTimestamp = fixture.fixture.timestamp;
    const snapshot = fixture.fixtureStatsSnapshot;
    const storedOdds = oddsByFixtureId.get(fixture.fixture.id);
    if (snapshot === null || !storedOdds) {
      fixturesAtCurrentKickoff.push(fixture);
      continue;
    }

    const date = new Date(fixture.fixture.timestamp * 1000);
    const week = getUkWeekStartDateKey(date);
    const month = getUkDateKey(date).slice(0, 7);
    const record = (strategyId: string, matches: boolean, won: boolean, referenceOdd: number | null) => {
      const oddsRangeIds = referenceOdd === null ? [] : getStrategyOddsRangeIds(referenceOdd);
      if (!matches || referenceOdd === null || oddsRangeIds.length === 0) return;
      const performance = performances.get(strategyId)!;
      addResult(performance.seasonPerformance, won, referenceOdd);
      addResult(getPeriodTotals(performance.weeks, week), won, referenceOdd);
      addResult(getPeriodTotals(performance.months, month), won, referenceOdd);
      for (const oddsRangeId of oddsRangeIds) {
        const oddsBand = performance.oddsBands[oddsRangeId];
        addResult(oddsBand.seasonPerformance, won, referenceOdd);
        addResult(getPeriodTotals(oddsBand.weeks, week), won, referenceOdd);
        addResult(getPeriodTotals(oddsBand.months, month), won, referenceOdd);
      }
    };

    const over2_5Won =
      fixture.goals.home !== null &&
      fixture.goals.away !== null &&
      fixture.goals.home + fixture.goals.away > 2;
    const over2_5ReferenceOdd = getOver2_5ReferenceOdd(storedOdds.odds);
    for (const variation of teamFilterVariations) {
      record(
        variation.id,
        matchesTeamFilterVariation(snapshot, variation),
        over2_5Won,
        over2_5ReferenceOdd,
      );
    }
    for (const variation of over2_5RateStrategyVariations) {
      record(
        variation.id,
        matchesOver2_5RateStrategyVariation(snapshot, variation),
        over2_5Won,
        over2_5ReferenceOdd,
      );
    }

    const leagueRateContext = toLeagueRateContext(leagueRates);
    for (const variation of leagueRateStrategyVariations.filter((item) => item.market === 'over2_5')) {
      record(variation.id, matchesLeagueRateStrategyVariation(snapshot, leagueRateContext, variation), over2_5Won, over2_5ReferenceOdd);
    }

    const over1_5Won =
      fixture.goals.home !== null &&
      fixture.goals.away !== null &&
      fixture.goals.home + fixture.goals.away > 1;
    const over1_5ReferenceOdd = getOver1_5ReferenceOdd(storedOdds.odds);
    for (const variation of over1_5StrategyVariations) {
      record(
        variation.id,
        matchesOver1_5StrategyVariation(snapshot, variation),
        over1_5Won,
        over1_5ReferenceOdd,
      );
    }
    for (const variation of leagueRateStrategyVariations.filter((item) => item.market === 'over1_5')) {
      record(variation.id, matchesLeagueRateStrategyVariation(snapshot, leagueRateContext, variation), over1_5Won, over1_5ReferenceOdd);
    }

    const bttsWon = fixture.goals.home !== null && fixture.goals.away !== null && fixture.goals.home > 0 && fixture.goals.away > 0;
    const bttsReferenceOdd = getBttsYesReferenceOdd(storedOdds.odds);
    for (const variation of bttsStrategyVariations) {
      record(
        variation.id,
        matchesBttsStrategyVariation(snapshot, variation),
        bttsWon,
        bttsReferenceOdd,
      );
    }
    for (const variation of leagueRateStrategyVariations.filter((item) => item.market === 'btts')) {
      record(variation.id, matchesLeagueRateStrategyVariation(snapshot, leagueRateContext, variation), bttsWon, bttsReferenceOdd);
    }

    const bttnsWon = fixture.goals.home !== null && fixture.goals.away !== null && (fixture.goals.home === 0 || fixture.goals.away === 0);
    const bttnsReferenceOdd = getBttsNoReferenceOdd(storedOdds.odds);
    for (const variation of bttnsStrategyVariations) {
      record(
        variation.id,
        matchesBttnsStrategyVariation(snapshot, variation),
        bttnsWon,
        bttnsReferenceOdd,
      );
    }
    for (const variation of leagueRateStrategyVariations.filter((item) => item.market === 'bttns')) {
      record(variation.id, matchesLeagueRateStrategyVariation(snapshot, leagueRateContext, variation), bttnsWon, bttnsReferenceOdd);
    }

    fixturesAtCurrentKickoff.push(fixture);
  }

  for (const completedFixture of fixturesAtCurrentKickoff) {
    addCompletedFixtureToLeagueRate(leagueRates, completedFixture);
  }

  return [...performances.values()];
}
