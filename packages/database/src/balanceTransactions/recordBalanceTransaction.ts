import { randomUUID } from "node:crypto";
import type { BalanceTransaction } from "@black-diamond/core/balanceTransaction";
import type { ClientSession, Db } from "mongodb";

export type NewBalanceTransaction = Omit<BalanceTransaction, "id">;

export async function recordBalanceTransaction(
  database: Db,
  session: ClientSession,
  transaction: NewBalanceTransaction,
): Promise<void> {
  await database.collection<BalanceTransaction>("balanceTransactions").insertOne(
    { id: randomUUID(), ...transaction },
    { session },
  );
}
