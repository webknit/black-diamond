import type { FixtureStatistics } from "@black-diamond/core/fixtureStatistics";
import { getDatabase } from "../../mongodb.js";

export async function upsertFixtureStatistics(
  fixtureStatistics: FixtureStatistics,
): Promise<void> {
  const database = await getDatabase();
  await database
    .collection<FixtureStatistics>("fixtureStatistics")
    .updateOne(
      { fixtureId: fixtureStatistics.fixtureId },
      { $set: fixtureStatistics },
      { upsert: true },
    );
}
