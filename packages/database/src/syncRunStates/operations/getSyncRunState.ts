import { getDatabase } from "../../mongodb.js";
import type { ScheduledSyncRunName, SyncRunState } from "../types/syncRunState.js";

export async function getSyncRunState(
  run: ScheduledSyncRunName,
): Promise<SyncRunState | null> {
  const database = await getDatabase();

  return database.collection<SyncRunState>("syncRunStates").findOne({ run });
}
