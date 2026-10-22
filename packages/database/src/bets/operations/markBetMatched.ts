import { getDatabase } from "../../mongodb.js";

export async function markBetMatched(id: string, accountId: string) {
  const database = await getDatabase();
  const result = await database.collection("bets").updateOne(
    { id, accountId, matchStatus: "unmatched" },
    { $set: { matchStatus: "matched" } },
  );
  return result.modifiedCount === 1;
}
