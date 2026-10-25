import { backfillFixtureStatsSnapshots } from "../sync/fixtureStatsSnapshots/backfillFixtureStatsSnapshots.js";
import { logSyncStep } from "../utils/logging/logSyncStep.js";

export async function runFixtureStatsSnapshotBackfill(): Promise<void> {
  await logSyncStep(
    "backfill missing fixture stats snapshots",
    backfillFixtureStatsSnapshots,
  );
}
