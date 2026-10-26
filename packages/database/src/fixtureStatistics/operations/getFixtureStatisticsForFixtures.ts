import type { FixtureStatistics } from "@black-diamond/core/fixtureStatistics";
import { getDatabase } from "../../mongodb.js";

export async function getFixtureStatisticsForFixtures(
  fixtureIds: number[],
): Promise<FixtureStatistics[]> {
  if (fixtureIds.length === 0) return [];

  const database = await getDatabase();
  return database
    .collection<FixtureStatistics>("fixtureStatistics")
    .find({ fixtureId: { $in: fixtureIds } })
    .toArray();
}
