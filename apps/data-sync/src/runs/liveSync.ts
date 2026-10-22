import { syncFixturesInProgress } from "../sync/fixtures/syncFixturesInProgress.js";
import { logSyncStep } from "../utils/logging/logSyncStep.js";

export async function runLiveSync() {
  await logSyncStep("refresh live fixtures", syncFixturesInProgress);
}
