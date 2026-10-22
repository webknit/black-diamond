import { getDatabase } from "../../mongodb.js";

export async function addAccountDeposit(
  accountId: string,
  amount: number,
  updatedAt: string,
): Promise<boolean> {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Deposit amount must be a positive finite number");
  }

  const database = await getDatabase();
  const result = await database.collection("accounts").updateOne(
    { id: accountId },
    {
      $inc: { currentBalance: amount, totalDeposits: amount },
      $set: { updatedAt },
    },
  );

  return result.modifiedCount === 1;
}
