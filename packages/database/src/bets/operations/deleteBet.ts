import type { Bet } from "@black-diamond/core/bet";
import { withDatabaseTransaction } from "../../mongodb.js";
import { recordBalanceTransaction } from "../../balanceTransactions/recordBalanceTransaction.js";

export async function deleteBet(bet: Bet) {
  const balanceChange = bet.status === "won"
    ? bet.stake - (bet.returnAmount ?? 0)
    : bet.stake;
  const updatedAt = new Date().toISOString();

  return withDatabaseTransaction(async (database, session) => {
    const deleted = await database.collection<Bet>("bets").deleteOne(
      { id: bet.id, accountId: bet.accountId },
      { session },
    );
    if (deleted.deletedCount !== 1) return false;
    if (balanceChange === 0) return true;

    const accounts = database.collection("accounts");
    const result = await accounts.updateOne(
      { id: bet.accountId },
      { $inc: { currentBalance: balanceChange }, $set: { updatedAt } },
      { session },
    );
    if (result.modifiedCount !== 1) {
      throw new Error(`Account ${bet.accountId} could not be updated while deleting bet ${bet.id}`);
    }

    const account = await accounts.findOne(
      { id: bet.accountId },
      { session, projection: { _id: 0, currentBalance: 1 } },
    );
    if (!account) throw new Error(`Account ${bet.accountId} disappeared while deleting bet ${bet.id}`);

    await recordBalanceTransaction(database, session, {
      accountId: bet.accountId,
      type: "bet_reversal",
      amount: balanceChange,
      balanceAfter: account.currentBalance,
      occurredAt: updatedAt,
      referenceId: bet.id,
    });
    return true;
  });
}
