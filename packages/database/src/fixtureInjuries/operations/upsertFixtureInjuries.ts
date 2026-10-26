import type { FixtureInjuries } from "@black-diamond/core/fixtureInjuries";
import { getDatabase } from "../../mongodb.js";

export async function upsertFixtureInjuries(fixtureInjuries: FixtureInjuries): Promise<void> {
  const database = await getDatabase();
  await database
    .collection<FixtureInjuries>("fixtureInjuries")
    .updateOne(
      { fixtureId: fixtureInjuries.fixtureId },
      { $set: fixtureInjuries },
      { upsert: true },
    );
}
