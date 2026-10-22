import { withDatabaseTransaction } from "../../mongodb.js";
import { recordBalanceTransaction } from "../../balanceTransactions/recordBalanceTransaction.js";

export async function updateAccountBalance(
  accountId: string,
  currentBalance: number,
  updatedAt: string,
): Promise<void> {
  await withDatabaseTransaction(async (database, session) => {
    const accounts = database.collection("accounts");
    const account = await accounts.findOne(
      { id: accountId },
      { session, projection: { _id: 0, currentBalance: 1 } },
    );
    if (!account) return;

    const result = await accounts.updateOne(
      { id: accountId },
      { $set: { currentBalance, updatedAt } },
      { session },
    );
    if (result.modifiedCount !== 1 || currentBalance === account.currentBalance) return;

    await recordBalanceTransaction(database, session, {
      accountId,
      type: "adjustment",
      amount: currentBalance - account.currentBalance,
      balanceAfter: currentBalance,
      occurredAt: updatedAt,
      referenceId: null,
    });
  });
}
