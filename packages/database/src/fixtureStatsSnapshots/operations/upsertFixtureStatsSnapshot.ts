import type { FixtureStatsSnapshot } from "@black-diamond/core/fixtureStatsSnapshot";
import { getDatabase } from "../../mongodb.js";
export async function upsertFixtureStatsSnapshot(snapshot: FixtureStatsSnapshot) {
  const database = await getDatabase();
  await database.collection<FixtureStatsSnapshot>("fixtureStatsSnapshots").updateOne(
    { fixtureId: snapshot.fixtureId }, { $set: snapshot }, { upsert: true },
  );
}
