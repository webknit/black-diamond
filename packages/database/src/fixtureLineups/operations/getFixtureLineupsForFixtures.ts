import type { FixtureLineups } from "@black-diamond/core/fixtureLineups";
import { getDatabase } from "../../mongodb.js";

export async function getFixtureLineupsForFixtures(fixtureIds: number[]): Promise<FixtureLineups[]> {
  if (fixtureIds.length === 0) return [];

  const database = await getDatabase();
  return database
    .collection<FixtureLineups>("fixtureLineups")
    .find({ fixtureId: { $in: fixtureIds } })
    .toArray();
}
