import type { FixtureOdds } from "@black-diamond/core/fixtureOdds";
import { getDatabase } from "../../mongodb.js";

export async function getFixtureOddsForFixtures(fixtureIds: number[]) {
  if (fixtureIds.length === 0) return [];

  const database = await getDatabase();
  return database
    .collection<FixtureOdds>("fixtureOdds")
    .find({ fixtureId: { $in: fixtureIds } })
    .toArray();
}
