import { withDatabaseTransaction } from "../../mongodb.js";
import { recordBalanceTransaction } from "../../balanceTransactions/recordBalanceTransaction.js";

export async function addAccountDeposit(
  accountId: string,
  amount: number,
  updatedAt: string,
): Promise<boolean> {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Deposit amount must be a positive finite number");
  }

  if (Math.round(amount * 100) / 100 !== amount) {
    throw new Error("Deposit amount must have no more than two decimal places");
  }

  return withDatabaseTransaction(async (database, session) => {
    const result = await database.collection("accounts").updateOne(
      { id: accountId },
      {
        $inc: { currentBalance: amount, totalDeposits: amount },
        $set: { updatedAt },
      },
      { session },
    );
    if (result.modifiedCount !== 1) return false;

    const account = await database.collection<{ currentBalance: number }>("accounts").findOne(
      { id: accountId },
      { session, projection: { _id: 0, currentBalance: 1 } },
    );
    if (!account) throw new Error(`Account ${accountId} disappeared during deposit`);

    await recordBalanceTransaction(database, session, {
      accountId,
      type: "deposit",
      amount,
      balanceAfter: account.currentBalance,
      occurredAt: updatedAt,
      referenceId: null,
    });
    return true;
  });
}
