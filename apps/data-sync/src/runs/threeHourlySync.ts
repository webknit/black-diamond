import { syncBotdFixtures } from "../sync/botdFixtures/syncBotdFixtures";
import { logSyncStep } from "../utils/logging/logSyncStep";

export async function runThreeHourlySync() {
  await logSyncStep("sync BotD fixtures", syncBotdFixtures);
}
