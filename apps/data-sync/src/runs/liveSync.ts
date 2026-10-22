import { syncFixturesInProgress } from "../sync/fixtures/syncFixturesInProgress.js";
import { syncBetResults } from "../sync/bets/syncBetResults.js";
import { logSyncStep } from "../utils/logging/logSyncStep.js";

export async function runLiveSync() {
  await logSyncStep("refresh live fixtures", syncFixturesInProgress);
  await logSyncStep("settle completed bets", syncBetResults);
}
