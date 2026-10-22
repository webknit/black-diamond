import type { BalanceTransaction } from "@black-diamond/core/balanceTransaction";
import { getDatabase } from "../../mongodb.js";

export async function getBalanceTransactionsByAccountId(accountId: string) {
  const database = await getDatabase();
  return database
    .collection<BalanceTransaction>("balanceTransactions")
    .find({ accountId }, { projection: { _id: 0 } })
    .sort({ occurredAt: 1, id: 1 })
    .toArray();
}

export async function getBalanceTransactionsPage(
  accountId: string,
  page: number,
  pageSize: number,
) {
  const database = await getDatabase();
  const transactions = database.collection<BalanceTransaction>("balanceTransactions");
  const totalCount = await transactions.countDocuments({ accountId });
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const actualPage = Math.min(page, totalPages);
  const items = await transactions
    .find({ accountId }, { projection: { _id: 0 } })
    .sort({ occurredAt: -1, id: -1 })
    .skip((actualPage - 1) * pageSize)
    .limit(pageSize)
    .toArray();

  return { items, totalCount, page: actualPage };
}

export async function getBalanceHistoryByAccountId(accountId: string, from: string) {
  const database = await getDatabase();
  const transactions = database.collection<BalanceTransaction>("balanceTransactions");
  const [previous, recent] = await Promise.all([
    transactions
      .find(
        { accountId, occurredAt: { $lt: from } },
        { projection: { _id: 0 } },
      )
      .sort({ occurredAt: -1, id: -1 })
      .limit(1)
      .toArray(),
    transactions
      .find(
        { accountId, occurredAt: { $gte: from } },
        { projection: { _id: 0 } },
      )
      .sort({ occurredAt: 1, id: 1 })
      .toArray(),
  ]);

  return [...previous, ...recent];
}
