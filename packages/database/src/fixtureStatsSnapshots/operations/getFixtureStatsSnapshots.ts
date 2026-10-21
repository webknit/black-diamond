import type { FixtureStatsSnapshot } from "@black-diamond/core/fixtureStatsSnapshot";
import { getDatabase } from "../../mongodb.js";

export async function getFixtureStatsSnapshots(fixtureIds: number[]) {
  if (fixtureIds.length === 0) return [];

  const database = await getDatabase();
  return database
    .collection<FixtureStatsSnapshot>("fixtureStatsSnapshots")
    .find({ fixtureId: { $in: fixtureIds } })
    .toArray();
}
