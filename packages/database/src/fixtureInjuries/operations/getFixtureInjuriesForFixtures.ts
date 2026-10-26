import type { FixtureInjuries } from "@black-diamond/core/fixtureInjuries";
import { getDatabase } from "../../mongodb.js";

export async function getFixtureInjuriesForFixtures(fixtureIds: number[]): Promise<FixtureInjuries[]> {
  if (fixtureIds.length === 0) return [];

  const database = await getDatabase();
  return database
    .collection<FixtureInjuries>("fixtureInjuries")
    .find({ fixtureId: { $in: fixtureIds } })
    .toArray();
}
