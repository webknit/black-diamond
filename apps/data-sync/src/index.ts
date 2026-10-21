import { ensureDatabaseIndexes } from "@black-diamond/database/indexes";

import { runDailySync } from "./runs/dailySync.js";
import { runHourlySync } from "./runs/hourlySync.js";
import { runLiveSync } from "./runs/liveSync.js";
import { runWeeklySync } from "./runs/weeklySync.js";
import { runThreeHourlySync } from "./runs/threeHourlySync.js";
import { logSyncStep } from "./utils/logSyncStep.js";

await logSyncStep("ensure database indexes", ensureDatabaseIndexes);
await logSyncStep("daily sync", runDailySync);
await logSyncStep("hourly sync", runHourlySync);
await logSyncStep("live sync", runLiveSync);
await logSyncStep("three-hourly sync", runThreeHourlySync);
await logSyncStep("weekly sync", runWeeklySync);
