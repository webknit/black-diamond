import type { FixtureOdds } from "@black-diamond/core/fixtureOdds";
import { getDatabase } from "../../mongodb.js";
export async function upsertFixtureOdds(odds: FixtureOdds) {
  const database = await getDatabase();
  await database.collection<FixtureOdds>("fixtureOdds").updateOne({ fixtureId: odds.fixtureId }, { $set: odds }, { upsert: true });
}
