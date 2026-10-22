import { ensureDatabaseIndexes } from "@black-diamond/database/indexes";
import { runDailySync } from "./runs/dailySync.js";
import { runHourlySync } from "./runs/hourlySync.js";
import { runLiveSync } from "./runs/liveSync.js";
import { runThreeHourlySync } from "./runs/threeHourlySync.js";
import { runWeeklySync } from "./runs/weeklySync.js";
import { logSyncStep } from "./utils/logging/logSyncStep.js";

const syncRuns = {
  daily: { label: "daily sync", run: runDailySync },
  hourly: { label: "hourly sync", run: runHourlySync },
  live: { label: "live sync", run: runLiveSync },
  "three-hourly": { label: "three-hourly sync", run: runThreeHourlySync },
  weekly: { label: "weekly sync", run: runWeeklySync },
} as const;

export type SyncRunName = keyof typeof syncRuns;

export function getSyncRun(name?: string) {
  if (name && name in syncRuns) return syncRuns[name as SyncRunName];

  const availableRuns = Object.keys(syncRuns).join(", ");
  throw new Error(`Choose a sync run: ${availableRuns}`);
}

export async function runSelectedSync(name: string | undefined) {
  const syncRun = getSyncRun(name);

  await logSyncStep("ensure database indexes", ensureDatabaseIndexes);
  await logSyncStep(syncRun.label, syncRun.run);
}
