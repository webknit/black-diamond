import type { Fixture } from "@black-diamond/core/fixture";

import { getDatabase } from "../../mongodb.js";

export async function getFixtureById(fixtureId: number): Promise<Fixture | null> {
  const database = await getDatabase();

  return database.collection<Fixture>("fixtures").findOne({ "fixture.id": fixtureId });
}
