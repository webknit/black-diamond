import type { BotdDay } from "@black-diamond/core/botdDay";
import { getDatabase } from "../../mongodb.js";

export async function getBotdDay(fixtureDate: string): Promise<BotdDay | null> {
  return (await getDatabase()).collection<BotdDay>("botdDays").findOne({ fixtureDate });
}
