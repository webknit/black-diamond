import { getDatabase } from "../../mongodb.js";
import type { ScheduledSyncRunName, SyncRunState } from "../types/syncRunState.js";

export async function markSyncRunCompleted(
  run: ScheduledSyncRunName,
  now = new Date(),
): Promise<void> {
  const database = await getDatabase();

  await database.collection<SyncRunState>("syncRunStates").updateOne(
    { run },
    { $set: { run, lastCompletedAt: now, lastError: null } },
    { upsert: true },
  );
}
