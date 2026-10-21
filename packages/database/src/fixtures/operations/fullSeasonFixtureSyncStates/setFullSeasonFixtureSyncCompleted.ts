import { getDatabase } from "../../../mongodb.js";
import type { FullSeasonFixtureSyncState } from "../../types/fullSeasonFixtureSyncState.js";

export async function setFullSeasonFixtureSyncCompleted(
  leagueId: number,
  season: number,
): Promise<void> {
  const database = await getDatabase();
  const collection = database.collection<FullSeasonFixtureSyncState>(
    "fullSeasonFixtureSyncStates",
  );

  await collection.updateOne(
    { leagueId, season },
    { $set: { leagueId, season, completedAt: new Date() } },
    { upsert: true },
  );
}
