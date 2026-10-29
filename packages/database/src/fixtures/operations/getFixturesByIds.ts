import type { Fixture } from "@black-diamond/core/fixture";
import { getDatabase } from "../../mongodb.js";

/** Reads a set of full fixture records in one indexed query. */
export async function getFixturesByIds(fixtureIds: number[]): Promise<Fixture[]> {
  if (fixtureIds.length === 0) return [];
  return (await getDatabase()).collection<Fixture>("fixtures").find({
    "fixture.id": { $in: fixtureIds },
  }).toArray();
}
