import type { Bet } from "@black-diamond/core/bet";
import { getDatabase } from "../../mongodb.js";

export async function deleteBet(bet: Bet) {
  const database = await getDatabase();
  const deleted = await database.collection<Bet>("bets").deleteOne({ id: bet.id, accountId: bet.accountId });
  if (deleted.deletedCount !== 1) return false;

  const balanceChange = bet.status === "won"
    ? bet.stake - (bet.returnAmount ?? 0)
    : bet.stake;
  if (balanceChange !== 0) {
    await database.collection("accounts").updateOne(
      { id: bet.accountId },
      { $inc: { currentBalance: balanceChange }, $set: { updatedAt: new Date().toISOString() } },
    );
  }
  return true;
}
