import { backfillFixtureStatsSnapshots } from "../sync/fixtureStatsSnapshots/backfillFixtureStatsSnapshots";
import { logSyncStep } from "../utils/logging/logSyncStep";

export async function runFixtureStatsSnapshotBackfill(): Promise<void> {
  await logSyncStep(
    "rebuild fixture stats snapshots",
    backfillFixtureStatsSnapshots,
  );
}
