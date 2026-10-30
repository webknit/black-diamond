import { getDatabase } from "../../mongodb.js";

export async function removeFixturesFromWatchlist(
  accountId: string,
  fixtureIds: number[],
): Promise<void> {
  const uniqueFixtureIds = [...new Set(fixtureIds)];
  if (uniqueFixtureIds.length === 0) return;

  await (await getDatabase())
    .collection("fixtureWatchlist")
    .deleteMany({ accountId, fixtureId: { $in: uniqueFixtureIds } });
}
