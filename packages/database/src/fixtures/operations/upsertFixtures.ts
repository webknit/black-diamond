import type { Fixture } from "@black-diamond/core/fixture";

import { getDatabase } from "../../mongodb.js";

export async function upsertFixtures(fixtures: Fixture[]): Promise<void> {
  if (fixtures.length === 0) {
    return;
  }

  const database = await getDatabase();
  const collection = database.collection<Fixture>("fixtures");

  await collection.bulkWrite(
    fixtures.map((fixture) => ({
      updateOne: {
        filter: { "fixture.id": fixture.fixture.id },
        update: { $set: fixture },
        upsert: true,
      },
    })),
  );
}
