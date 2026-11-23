import type { BotdDay } from "@black-diamond/core/botdDay";
import { getDatabase } from "../../mongodb.js";

/** Returns persisted daily BotD slates in calendar order for historical replay. */
export async function getBotdDays(): Promise<BotdDay[]> {
  return (await getDatabase())
    .collection<BotdDay>("botdDays")
    .find({})
    .sort({ fixtureDate: 1 })
    .toArray();
}
