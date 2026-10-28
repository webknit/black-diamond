import type { BotdFixture } from "@black-diamond/core/botdFixture";
import { getDatabase } from "../../mongodb.js";

export async function getBotdFixturesForDate(
  fixtureDate: string,
  strategyId: string,
  minimumOdds: number,
): Promise<BotdFixture[]> {
  const database = await getDatabase();
  return database.collection<BotdFixture>("botdFixtures").find({
    fixtureDate,
    matchingStrategyIds: strategyId,
    ...(minimumOdds > 0 ? { over2_5ReferenceOdd: { $gte: minimumOdds } } : {}),
  }).sort({ fixtureId: 1 }).toArray();
}
