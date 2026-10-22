import type { Bet } from "@black-diamond/core/bet";
import { getDatabase } from "../../mongodb.js";

export async function getBetsByAccountId(accountId: string) {
  const database = await getDatabase();
  return database
    .collection<Bet>("bets")
    .find({ accountId }, { projection: { _id: 0 } })
    .sort({ placedAt: -1 })
    .toArray();
}
