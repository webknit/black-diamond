import type { Bet } from "@black-diamond/core/bet";
import { withDatabaseTransaction } from "../../mongodb.js";
import { recordBalanceTransaction } from "../../balanceTransactions/recordBalanceTransaction.js";
export async function settleBet(bet: Bet, status: "won" | "lost", settledAt: string) {
  const returnAmount = status === "won" ? Number((bet.stake * bet.placedOdds).toFixed(2)) : 0;
  return withDatabaseTransaction(async (database, session) => {
    const result = await database.collection<Bet>("bets").updateOne(
      { id: bet.id, status: "pending" },
      { $set: { status, returnAmount, profit: Number((returnAmount - bet.stake).toFixed(2)), settledAt } },
      { session },
    );
    if (result.modifiedCount !== 1 || returnAmount === 0) return result.modifiedCount === 1;

    const accounts = database.collection("accounts");
    const balanceUpdate = await accounts.updateOne(
      { id: bet.accountId },
      { $inc: { currentBalance: returnAmount }, $set: { updatedAt: settledAt } },
      { session },
    );
    if (balanceUpdate.modifiedCount !== 1) {
      throw new Error(`Account ${bet.accountId} could not be updated while settling bet ${bet.id}`);
    }

    const account = await accounts.findOne(
      { id: bet.accountId },
      { session, projection: { _id: 0, currentBalance: 1 } },
    );
    if (!account) throw new Error(`Account ${bet.accountId} disappeared while settling bet ${bet.id}`);

    await recordBalanceTransaction(database, session, {
      accountId: bet.accountId,
      type: "bet_payout",
      amount: returnAmount,
      balanceAfter: account.currentBalance,
      occurredAt: settledAt,
      referenceId: bet.id,
    });
    return true;
  });
}
