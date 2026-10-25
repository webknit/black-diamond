import type { FixtureEvents } from "@black-diamond/core/fixtureEvents";
import { getDatabase } from "../../mongodb.js";

export async function upsertFixtureEvents(fixtureEvents: FixtureEvents): Promise<void> {
  const database = await getDatabase();
  await database
    .collection<FixtureEvents>("fixtureEvents")
    .updateOne({ fixtureId: fixtureEvents.fixtureId }, { $set: fixtureEvents }, { upsert: true });
}
