import type { Fixture } from "@black-diamond/core/fixture";
import type { FixtureStatsSnapshot } from "@black-diamond/core/fixtureStatsSnapshot";
import { getDatabase } from "../../mongodb.js";
import { getFixtureStatsSnapshots } from "./getFixtureStatsSnapshots.js";

const snapshotBatchSize = 2_000;

async function getSnapshotsInBatches(fixtureIds: number[]) {
  const batches = Array.from(
    { length: Math.ceil(fixtureIds.length / snapshotBatchSize) },
    (_, index) => fixtureIds.slice(index * snapshotBatchSize, (index + 1) * snapshotBatchSize),
  );
  return (await Promise.all(batches.map(getFixtureStatsSnapshots))).flat();
}

export type FinishedFixtureWithStatsSnapshot = Fixture & {
  fixtureStatsSnapshot: FixtureStatsSnapshot | null;
};

/** Returns every completed fixture in the supplied competitions with its saved pre-match snapshot. */
export async function getFinishedFixturesWithStatsSnapshotsForLeagues(
  leagueIds: readonly number[],
  limit = 5_000,
): Promise<FinishedFixtureWithStatsSnapshot[]> {
  if (leagueIds.length === 0) return [];
  const fixtures = await (await getDatabase())
    .collection<Fixture>("fixtures")
    .find({
      "league.id": { $in: leagueIds },
      "fixture.status.short": { $in: ["FT", "AET", "PEN"] },
    })
    .sort({ "fixture.timestamp": -1 })
    .limit(limit)
    .toArray();
  const snapshots = await getSnapshotsInBatches(
    fixtures.map((fixture) => fixture.fixture.id),
  );
  const snapshotsByFixtureId = new Map(
    snapshots.map((snapshot) => [snapshot.fixtureId, snapshot]),
  );

  return fixtures.map((fixture) => ({
    ...fixture,
    fixtureStatsSnapshot: snapshotsByFixtureId.get(fixture.fixture.id) ?? null,
  }));
}
