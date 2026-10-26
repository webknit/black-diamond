import { selectedLeagues } from "@black-diamond/core/selectedLeagues";
import type { StrategyResult } from "@black-diamond/core/strategyResult";
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
import { upsertStrategyResults } from "@black-diamond/database/strategyResults";

const minimumOver2_5ReferenceOdd = 1.7;
const strategyVersion = 1;

export async function syncStrategyResults(): Promise<number> {
  const selectedLeagueIds = selectedLeagues.map((league) => league.id);
  const leagueStats = await getLeagueStats(selectedLeagueIds);
  let resultCount = 0;

  for (const leagueStatsForSeason of leagueStats) {
    const fixtures = await getFinishedFixturesWithStatsSnapshots(
      leagueStatsForSeason.league.id,
      leagueStatsForSeason.league.season,
    );
    const results = await createStrategyResults(fixtures);
    await upsertStrategyResults(results);
    resultCount += results.length;
    console.log(
      `[data-sync] Stored ${results.length} strategy results for ${leagueStatsForSeason.league.name}`,
    );
  }

  return resultCount;
}

async function createStrategyResults(
  fixtures: FinishedFixtureWithStatsSnapshot[],
): Promise<StrategyResult[]> {
  const odds = await getFixtureOddsForFixtures(fixtures.map((fixture) => fixture.fixture.id));
  const oddsByFixtureId = new Map(odds.map((fixtureOdds) => [fixtureOdds.fixtureId, fixtureOdds]));
  const leagueTotals = new Map<number, { fixtures: number; over2_5: number }>();
  const results: StrategyResult[] = [];

  for (const fixture of fixtures) {
    const totals = leagueTotals.get(fixture.league.id) ?? { fixtures: 0, over2_5: 0 };
    const leagueOver2_5Percentage = totals.fixtures === 0 ? null : (totals.over2_5 / totals.fixtures) * 100;
    const won = fixture.goals.home !== null && fixture.goals.away !== null && fixture.goals.home + fixture.goals.away > 2;
    leagueTotals.set(fixture.league.id, { fixtures: totals.fixtures + 1, over2_5: totals.over2_5 + Number(won) });

    const snapshot = fixture.fixtureStatsSnapshot;
    const referenceOdd = oddsByFixtureId.get(fixture.fixture.id)
      ? getOver2_5ReferenceOdd(oddsByFixtureId.get(fixture.fixture.id)!.odds)
      : null;
    const canPlaceBet = snapshot !== null && referenceOdd !== null && referenceOdd >= minimumOver2_5ReferenceOdd;
    const base = {
      fixtureId: fixture.fixture.id,
      leagueId: fixture.league.id,
      season: fixture.league.season,
      fixtureTimestamp: fixture.fixture.timestamp,
      strategyVersion,
      referenceOdd,
      evaluatedAt: new Date().toISOString(),
    };
    const addResult = (strategyId: string, matches: boolean) => {
      const eligible = canPlaceBet && matches;
      results.push({
        ...base,
        strategyId,
        eligible,
        result: eligible ? (won ? "won" : "lost") : null,
        profit: eligible ? (won ? referenceOdd! - 1 : -1) : null,
      });
    };

    addResult(
      strategyDetails[0].id,
      snapshot !== null && matchesOver2_5LeagueAverageStrategy(snapshot, leagueOver2_5Percentage),
    );
    addResult(
      strategyDetails[1].id,
      snapshot !== null && matchesVenueScoringStrategy(snapshot),
    );
    for (const variation of teamFilterVariations) {
      addResult(variation.id, snapshot !== null && matchesTeamFilterVariation(snapshot, variation));
    }
  }

  return results;
}
