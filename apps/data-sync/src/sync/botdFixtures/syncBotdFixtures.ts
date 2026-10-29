import { botdStrategies, getOver2_5ReferenceOdd, matchesTeamFilterVariation } from "@black-diamond/core/strategies";
import { getUkDateKey } from "@black-diamond/core/time";
import type { BotdDayFixture } from "@black-diamond/core/botdDay";
import { upsertBotdDays } from "@black-diamond/database/botdDays";
import { getUpcomingFixtures } from "@black-diamond/database/fixtures";
import { getFixtureOddsForFixtures } from "@black-diamond/database/fixtureOdds";
import { getFixtureStatsSnapshots } from "@black-diamond/database/fixtureStatsSnapshots";
import { getLeaguesByIds } from "@black-diamond/database/leagues";

const fixtureBatchSize = 100;

function splitIntoBatches<T>(values: T[]): T[][] {
  return Array.from({ length: Math.ceil(values.length / fixtureBatchSize) }, (_, index) =>
    values.slice(index * fixtureBatchSize, (index + 1) * fixtureBatchSize),
  );
}

/** Precompute the upcoming fixtures that match each BotD strategy. */
export async function syncBotdFixtures(now = new Date()): Promise<void> {
  const upcoming = await getUpcomingFixtures(now, 7);
  const fixtureDates = [...new Set(upcoming.map((fixture) => getUkDateKey(new Date(fixture.fixture.timestamp * 1000))))];
  const matchesByDate = new Map<string, BotdDayFixture[]>(fixtureDates.map((fixtureDate) => [fixtureDate, []]));

  for (const batch of splitIntoBatches(upcoming)) {
    const fixtureIds = batch.map((fixture) => fixture.fixture.id);
    const [snapshots, odds, leagues] = await Promise.all([
      getFixtureStatsSnapshots(fixtureIds),
      getFixtureOddsForFixtures(fixtureIds),
      getLeaguesByIds([...new Set(batch.map((fixture) => fixture.league.id))]),
    ]);
    const snapshotsByFixtureId = new Map(snapshots.map((snapshot) => [snapshot.fixtureId, snapshot]));
    const oddsByFixtureId = new Map(odds.map((fixtureOdds) => [fixtureOdds.fixtureId, fixtureOdds]));
    const leaguesById = new Map(leagues.map((league) => [league.league.id, league]));

    for (const fixture of batch) {
      const snapshot = snapshotsByFixtureId.get(fixture.fixture.id);
      if (!snapshot) continue;
      const matchingStrategyIds = botdStrategies
        .filter((strategy) => matchesTeamFilterVariation(snapshot, strategy))
        .map((strategy) => strategy.id);
      if (matchingStrategyIds.length === 0) continue;
      const fixtureDate = getUkDateKey(new Date(fixture.fixture.timestamp * 1000));
      matchesByDate.get(fixtureDate)?.push({
        fixtureId: fixture.fixture.id,
        matchingStrategyIds,
        over2_5ReferenceOdd: getOver2_5ReferenceOdd(oddsByFixtureId.get(fixture.fixture.id)?.odds ?? []),
        hasLeagueTable: leaguesById.get(fixture.league.id)?.league.type !== "Cup",
      });
    }
  }

  await upsertBotdDays(fixtureDates.map((fixtureDate) => ({
    fixtureDate,
    fixtures: matchesByDate.get(fixtureDate) ?? [],
    updatedAt: now.toISOString(),
  })));
}
