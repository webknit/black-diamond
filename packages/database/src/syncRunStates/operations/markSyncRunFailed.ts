import { getDatabase } from "../../mongodb.js";
import type { ScheduledSyncRunName, SyncRunState } from "../types/syncRunState.js";

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export async function markSyncRunFailed(
  run: ScheduledSyncRunName,
  error: unknown,
  now = new Date(),
): Promise<void> {
  const database = await getDatabase();

  await database.collection<SyncRunState>("syncRunStates").updateOne(
    { run },
    {
      $set: {
        run,
        lastFailedAt: now,
        lastError: getErrorMessage(error),
      },
    },
    { upsert: true },
  );
}
