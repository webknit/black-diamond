import { getDatabase } from "../../mongodb.js";

export async function updateAccountBalance(
  accountId: string,
  currentBalance: number,
  updatedAt: string,
): Promise<void> {
  const database = await getDatabase();

  await database.collection("accounts").updateOne(
    { id: accountId },
    { $set: { currentBalance, updatedAt } },
  );
}
