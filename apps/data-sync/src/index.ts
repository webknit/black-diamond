import { ensureDatabaseIndexes } from "@black-diamond/database/indexes";

import { runDailySync } from "./runs/dailySync.js";
import { runHourlySync } from "./runs/hourlySync.js";
import { runLiveSync } from "./runs/liveSync.js";
import { runWeeklySync } from "./runs/weeklySync.js";

await ensureDatabaseIndexes();
await runDailySync();
await runHourlySync();
await runLiveSync();
await runWeeklySync();
