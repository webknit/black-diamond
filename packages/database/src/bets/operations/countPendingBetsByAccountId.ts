import { getDatabase } from "../../mongodb.js";

export async function countPendingBetsByAccountId(accountId: string) {
  const database = await getDatabase();
  return database.collection("bets").countDocuments({ accountId, status: "pending" });
}
