import type { Bet } from "@black-diamond/core/bet";

import { withDatabaseTransaction } from "../../mongodb.js";
import { recordBalanceTransaction } from "../../balanceTransactions/recordBalanceTransaction.js";

export const insufficientBalanceErrorCode = "INSUFFICIENT_BALANCE";

function createInsufficientBalanceError() {
  return Object.assign(new Error("Insufficient balance to place this bet."), {
    code: insufficientBalanceErrorCode,
  });
}

export async function placeBet(bet: Bet): Promise<void> {
  await withDatabaseTransaction(async (database, session) => {
    const accounts = database.collection("accounts");
    const balanceUpdate = await accounts.updateOne(
      { id: bet.accountId, currentBalance: { $gte: bet.stake } },
      { $inc: { currentBalance: -bet.stake }, $set: { updatedAt: bet.placedAt } },
      { session },
    );

    if (balanceUpdate.modifiedCount !== 1) throw createInsufficientBalanceError();

    const account = await accounts.findOne(
      { id: bet.accountId },
      { session, projection: { _id: 0, currentBalance: 1 } },
    );
    if (!account) throw new Error(`Account ${bet.accountId} disappeared while placing a bet`);

    await database.collection<Bet>("bets").insertOne(bet, { session });
    await recordBalanceTransaction(database, session, {
      accountId: bet.accountId,
      type: "bet_stake",
      amount: -bet.stake,
      balanceAfter: account.currentBalance,
      occurredAt: bet.placedAt,
      referenceId: bet.id,
    });
  });
}
