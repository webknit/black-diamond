import type { FixtureLineups } from "@black-diamond/core/fixtureLineups";
import { getDatabase } from "../../mongodb.js";

export async function upsertFixtureLineups(fixtureLineups: FixtureLineups): Promise<void> {
  const database = await getDatabase();
  await database
    .collection<FixtureLineups>("fixtureLineups")
    .updateOne(
      { fixtureId: fixtureLineups.fixtureId },
      { $set: fixtureLineups },
      { upsert: true },
    );
}
