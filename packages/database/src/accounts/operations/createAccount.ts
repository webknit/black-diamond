import type { Account } from "@black-diamond/core/account";
import { withDatabaseTransaction } from "../../mongodb.js";
import { recordBalanceTransaction } from "../../balanceTransactions/recordBalanceTransaction.js";

export async function createAccount(account: Account): Promise<void> {
  await withDatabaseTransaction(async (database, session) => {
    await database.collection<Account>("accounts").insertOne(account, { session });
    await recordBalanceTransaction(database, session, {
      accountId: account.id,
      type: "opening_balance",
      amount: account.currentBalance,
      balanceAfter: account.currentBalance,
      occurredAt: account.createdAt,
      referenceId: null,
    });
  });
}
