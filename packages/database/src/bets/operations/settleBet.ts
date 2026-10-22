import type { Bet } from "@black-diamond/core/bet";
import { getDatabase } from "../../mongodb.js";
export async function settleBet(bet: Bet, status: "won" | "lost", settledAt: string) {
  const database = await getDatabase(); const returnAmount = status === "won" ? Number((bet.stake * bet.placedOdds).toFixed(2)) : 0;
  const result = await database.collection<Bet>("bets").updateOne({ id: bet.id, status: "pending" }, { $set: { status, returnAmount, profit: Number((returnAmount - bet.stake).toFixed(2)), settledAt } });
  if (result.modifiedCount === 1 && returnAmount > 0) await database.collection("accounts").updateOne({ id: bet.accountId }, { $inc: { currentBalance: returnAmount }, $set: { updatedAt: settledAt } });
  return result.modifiedCount === 1;
}
