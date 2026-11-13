import { ensureDatabaseIndexes } from "@black-diamond/database/indexes";
import { logSyncStep } from "../utils/logging/logSyncStep";
import { runDailySync } from "./dailySync";
import { runThreeHourlySync } from "./threeHourlySync";
import { runWeeklySync } from "./weeklySync";

export async function runFullSync(): Promise<void> {
  await logSyncStep("ensure database indexes", ensureDatabaseIndexes);
  await runDailySync();
  await runWeeklySync();
  await runThreeHourlySync();
}
