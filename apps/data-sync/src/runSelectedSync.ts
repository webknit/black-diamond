import { ensureDatabaseIndexes } from "@black-diamond/database/indexes";
import {
  getSyncRunState,
  markSyncRunCompleted,
  markSyncRunFailed,
  markSyncRunStarted,
  scheduledSyncRunNames,
  type ScheduledSyncRunName,
} from "@black-diamond/database/syncRunStates";
import { runDailySync } from "./runs/dailySync.js";
import { runFixtureStatsSnapshotBackfill } from "./runs/backfillFixtureStatsSnapshots.js";
import { runFullSync } from "./runs/fullSync.js";
import { runHourlySync } from "./runs/hourlySync.js";
import { runLiveSync } from "./runs/liveSync.js";
import { runThreeHourlySync } from "./runs/threeHourlySync.js";
import { runWeeklySync } from "./runs/weeklySync.js";
import { logSyncStep } from "./utils/logging/logSyncStep.js";

const syncRuns = {
  all: { label: "full sync", run: runFullSync },
  "backfill:fixture-stats-snapshots": {
    label: "fixture stats snapshot backfill",
    run: runFixtureStatsSnapshotBackfill,
  },
  indexes: { label: "ensure database indexes", run: ensureDatabaseIndexes },
  daily: {
    label: "daily sync",
    run: (lastCompletedAt?: Date) => runDailySync(lastCompletedAt),
  },
  hourly: { label: "hourly sync", run: runHourlySync },
  live: { label: "live sync", run: runLiveSync },
  "three-hourly": { label: "three-hourly sync", run: runThreeHourlySync },
  weekly: { label: "weekly sync", run: runWeeklySync },
} as const;

export type SyncRunName = keyof typeof syncRuns;

const recoveryIntervals: Partial<Record<ScheduledSyncRunName, number>> = {
  "three-hourly": 4 * 60 * 60 * 1000,
  weekly: 8 * 24 * 60 * 60 * 1000,
};

function isScheduledSyncRun(name: SyncRunName): name is ScheduledSyncRunName {
  return scheduledSyncRunNames.includes(name as ScheduledSyncRunName);
}

export function isSyncOverdue(
  lastCompletedAt: Date | undefined,
  maximumAge: number,
  now = new Date(),
): boolean {
  return lastCompletedAt !== undefined && now.getTime() - lastCompletedAt.getTime() >= maximumAge;
}

export function getSyncRun(name?: string) {
  if (name && name in syncRuns) return syncRuns[name as SyncRunName];

  const availableRuns = Object.keys(syncRuns).join(", ");
  throw new Error(`Choose a sync run: ${availableRuns}`);
}

async function runTrackedSync(name: ScheduledSyncRunName): Promise<void> {
  const syncRun = getSyncRun(name);
  const previousState = await getSyncRunState(name);

  await markSyncRunStarted(name);

  try {
    await logSyncStep(syncRun.label, () =>
      syncRun.run(previousState?.lastCompletedAt),
    );
    await markSyncRunCompleted(name);
  } catch (error) {
    await markSyncRunFailed(name, error);
    throw error;
  }
}

async function recoverOverdueSyncs(): Promise<void> {
  for (const [run, maximumAge] of Object.entries(recoveryIntervals) as [
    ScheduledSyncRunName,
    number,
  ][]) {
    const state = await getSyncRunState(run);

    if (isSyncOverdue(state?.lastCompletedAt, maximumAge)) {
      await runTrackedSync(run);
    }
  }
}

export async function runSelectedSync(name: string | undefined): Promise<void> {
  const syncRun = getSyncRun(name);

  if (!isScheduledSyncRun(name as SyncRunName)) {
    await logSyncStep(syncRun.label, syncRun.run);
    return;
  }

  await runTrackedSync(name as ScheduledSyncRunName);

  if (name === "daily") await recoverOverdueSyncs();
}
