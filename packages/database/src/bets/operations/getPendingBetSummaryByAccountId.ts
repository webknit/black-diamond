import { getDatabase } from "../../mongodb.js";

export async function getPendingBetSummaryByAccountId(accountId: string) {
  const database = await getDatabase();
  const [summary] = await database.collection("bets").aggregate<{ count: number; totalStake: number }>([
    { $match: { accountId, status: "pending" } },
    { $group: { _id: null, count: { $sum: 1 }, totalStake: { $sum: "$stake" } } },
  ]).toArray();
  return summary ?? { count: 0, totalStake: 0 };
}
