import type { Fixture } from "@black-diamond/core/fixture";
import type { FixtureStatsSnapshot } from "@black-diamond/core/fixtureStatsSnapshot";
import { getDatabase } from "../../mongodb.js";
import { getFixtureStatsSnapshots } from "./getFixtureStatsSnapshots.js";

export type FinishedFixtureWithStatsSnapshot = Fixture & {
  fixtureStatsSnapshot: FixtureStatsSnapshot | null;
};

export async function getFinishedFixturesWithStatsSnapshots(
  leagueId: number,
  season: number,
): Promise<FinishedFixtureWithStatsSnapshot[]> {
  const database = await getDatabase();
  const fixtures = await database.collection<Fixture>("fixtures").find({
    "league.id": leagueId,
    "league.season": season,
    "fixture.status.short": { $in: ["FT", "AET", "PEN"] },
  }).sort({ "fixture.timestamp": 1 }).toArray();
  const snapshots = await getFixtureStatsSnapshots(fixtures.map((fixture) => fixture.fixture.id));
  const snapshotsByFixtureId = new Map(snapshots.map((snapshot) => [snapshot.fixtureId, snapshot]));

  return fixtures.map((fixture) => ({
    ...fixture,
    fixtureStatsSnapshot: snapshotsByFixtureId.get(fixture.fixture.id) ?? null,
  }));
}
