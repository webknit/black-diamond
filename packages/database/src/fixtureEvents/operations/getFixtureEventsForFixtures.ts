import type { FixtureEvents } from "@black-diamond/core/fixtureEvents";
import { getDatabase } from "../../mongodb.js";

export async function getFixtureEventsForFixtures(fixtureIds: number[]): Promise<FixtureEvents[]> {
  if (fixtureIds.length === 0) return [];

  const database = await getDatabase();
  return database
    .collection<FixtureEvents>("fixtureEvents")
    .find({ fixtureId: { $in: fixtureIds } })
    .toArray();
}
