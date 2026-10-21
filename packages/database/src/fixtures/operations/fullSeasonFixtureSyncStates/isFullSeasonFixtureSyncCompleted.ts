import { getDatabase } from "../../../mongodb.js";
import type { FullSeasonFixtureSyncState } from "../../types/fullSeasonFixtureSyncState.js";

export async function isFullSeasonFixtureSyncCompleted(
  leagueId: number,
  season: number,
): Promise<boolean> {
  const database = await getDatabase();
  const collection = database.collection<FullSeasonFixtureSyncState>(
    "fullSeasonFixtureSyncStates",
  );

  return (await collection.findOne({ leagueId, season })) !== null;
}
