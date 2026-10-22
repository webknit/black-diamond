import type { Bet } from "@black-diamond/core/bet";
import { getDatabase } from "../../mongodb.js";
export async function getPendingBets() {
  return (await getDatabase()).collection<Bet>("bets").find({
    status: "pending",
    $or: [{ matchStatus: "matched" }, { matchStatus: { $exists: false } }],
  }).toArray();
}
