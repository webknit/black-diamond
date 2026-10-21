import { ensureDatabaseIndexes } from "@black-diamond/database/indexes";

import { runDailySync } from "./runs/dailySync.js";
import { runHourlySync } from "./runs/hourlySync.js";
import { runLiveSync } from "./runs/liveSync.js";

await ensureDatabaseIndexes();
await runDailySync();
await runHourlySync();
await runLiveSync();
