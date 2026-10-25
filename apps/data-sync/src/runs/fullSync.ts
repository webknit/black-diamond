import { ensureDatabaseIndexes } from "@black-diamond/database/indexes";
import { logSyncStep } from "../utils/logging/logSyncStep.js";
import { runDailySync } from "./dailySync.js";
import { runThreeHourlySync } from "./threeHourlySync.js";
import { runWeeklySync } from "./weeklySync.js";

export async function runFullSync(): Promise<void> {
  await logSyncStep("ensure database indexes", ensureDatabaseIndexes);
  await runDailySync();
  await runWeeklySync();
  await runThreeHourlySync();
}
