import type { BotdFixture } from "@black-diamond/core/botdFixture";
import { getDatabase } from "../../mongodb.js";

export async function upsertBotdFixtures(fixtures: BotdFixture[]): Promise<void> {
  if (fixtures.length === 0) return;

  const collection = (await getDatabase()).collection<BotdFixture>("botdFixtures");
  await collection.bulkWrite(fixtures.map((fixture) => ({
    updateOne: {
      filter: { fixtureId: fixture.fixtureId },
      update: { $set: fixture },
      upsert: true,
    },
  })));
}
