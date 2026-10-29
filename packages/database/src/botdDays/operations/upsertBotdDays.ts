import type { BotdDay } from "@black-diamond/core/botdDay";
import { getDatabase } from "../../mongodb.js";

export async function upsertBotdDays(days: BotdDay[]): Promise<void> {
  if (days.length === 0) return;
  await (await getDatabase()).collection<BotdDay>("botdDays").bulkWrite(days.map((day) => ({
    updateOne: { filter: { fixtureDate: day.fixtureDate }, update: { $set: day }, upsert: true },
  })));
}
