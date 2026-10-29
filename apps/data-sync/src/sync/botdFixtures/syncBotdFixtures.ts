import { botdStrategies, getOver2_5ReferenceOdd, matchesTeamFilterVariation } from "@black-diamond/core/strategies";
import { getUkDateKey } from "@black-diamond/core/time";
import { deleteBotdFixtures, upsertBotdFixtures } from "@black-diamond/database/botdFixtures";
import { getUpcomingFixtures } from "@black-diamond/database/fixtures";
import { getFixtureOddsForFixtures } from "@black-diamond/database/fixtureOdds";
import { getFixtureStatsSnapshots } from "@black-diamond/database/fixtureStatsSnapshots";
import { getPredictionsForFixtures } from "@black-diamond/database/predictions";
import { getFixtureInjuriesForFixtures } from "@black-diamond/database/fixtureInjuries";
import { getFixtureLineupsForFixtures } from "@black-diamond/database/fixtureLineups";
import { getLeaguesByIds } from "@black-diamond/database/leagues";

/** Precompute the upcoming fixtures that match each BotD strategy. */
export async function syncBotdFixtures(now = new Date()): Promise<void> {
  const upcoming = await getUpcomingFixtures(now, 7);
  const fixtureIds = upcoming.map((fixture) => fixture.fixture.id);
  const [snapshots, odds, predictions, injuries, lineups, leagues] = await Promise.all([
    getFixtureStatsSnapshots(fixtureIds),
    getFixtureOddsForFixtures(fixtureIds),
    getPredictionsForFixtures(fixtureIds),
    getFixtureInjuriesForFixtures(fixtureIds),
    getFixtureLineupsForFixtures(fixtureIds),
    getLeaguesByIds([...new Set(upcoming.map((fixture) => fixture.league.id))]),
  ]);
  const snapshotsByFixtureId = new Map(snapshots.map((snapshot) => [snapshot.fixtureId, snapshot]));
  const oddsByFixtureId = new Map(odds.map((fixtureOdds) => [fixtureOdds.fixtureId, fixtureOdds]));
  const predictionsByFixtureId = new Map(predictions.map((prediction) => [prediction.fixtureId, prediction.response]));
  const injuriesByFixtureId = new Map(injuries.map((injury) => [injury.fixtureId, injury.injuries]));
  const lineupsByFixtureId = new Map(lineups.map((lineup) => [lineup.fixtureId, lineup.lineups]));
  const leaguesById = new Map(leagues.map((league) => [league.league.id, league]));
  const matches = upcoming.flatMap((fixture) => {
    const snapshot = snapshotsByFixtureId.get(fixture.fixture.id);
    if (!snapshot) return [];
    const matchingStrategyIds = botdStrategies
      .filter((strategy) => matchesTeamFilterVariation(snapshot, strategy))
      .map((strategy) => strategy.id);
    if (matchingStrategyIds.length === 0) return [];
    return [{
      fixtureId: fixture.fixture.id,
      fixtureDate: getUkDateKey(new Date(fixture.fixture.timestamp * 1000)),
      over2_5ReferenceOdd: getOver2_5ReferenceOdd(oddsByFixtureId.get(fixture.fixture.id)?.odds ?? []),
      matchingStrategyIds,
      fixture,
      statsSnapshot: snapshot,
      odds: oddsByFixtureId.get(fixture.fixture.id)?.odds ?? [],
      prediction: predictionsByFixtureId.get(fixture.fixture.id) ?? null,
      injuries: injuriesByFixtureId.get(fixture.fixture.id) ?? null,
      lineups: lineupsByFixtureId.get(fixture.fixture.id) ?? null,
      hasLeagueTable: leaguesById.get(fixture.league.id)?.league.type !== "Cup",
      updatedAt: now.toISOString(),
    }];
  });
  await Promise.all([
    matches.length > 0 ? upsertBotdFixtures(matches) : Promise.resolve(),
    deleteBotdFixtures(upcoming.filter((fixture) => !matches.some((match) => match.fixtureId === fixture.fixture.id)).map((fixture) => fixture.fixture.id)),
  ]);
}
